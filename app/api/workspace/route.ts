import {NextResponse} from 'next/server';
import {z} from 'zod';
import type {UsageEvent} from '@/lib/ai/provider';
import {apiUser,HttpError} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {ownedRow,rows,rateLimit} from '@/lib/db/repository';
import {interviewQuestions} from '@/data/interview-questions';
import {factSchema,generateResume,mapEvidence,resumeSchema,jobAnalysisSchema,validateResume,usableFacts} from '@/lib/resume/engine';
import {analyzeJobAI,composeResumeAI,extractFacts,generateFollowups} from '@/lib/ai/workflows';
import {analyzeJob} from '@/lib/jobs/analyze';
import {syntheticFacts,syntheticJobs} from '@/data/demo';
const uuid=z.string().uuid();
const actionSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),data:z.object({headline:z.string().max(300).optional(),summary:z.string().max(5000).optional(),career_objectives:z.string().max(5000).optional(),seniority:z.string().max(100).optional()})}),
 z.object({action:z.literal('answer'),questionId:z.string(),answer:z.string().max(12000),status:z.enum(['answered','skipped'])}),
 z.object({action:z.literal('fact'),id:uuid.optional(),statement:z.string().min(1).max(4000),factType:z.enum(['experience','project','achievement','skill','education','certification','language','other']).default('experience'),status:factSchema.shape.verification_status.optional(),excluded:z.boolean().optional(),confidential:z.boolean().optional()}),
 z.object({action:z.literal('deleteFact'),id:uuid}),
 z.object({action:z.literal('analyzeJob'),text:z.string().max(60000).default(''),url:z.string().max(2000).optional(),language:z.enum(['pl','en']).default('pl')}),
 z.object({action:z.literal('generate'),jobId:uuid,language:z.enum(['pl','en']),template:z.enum(['professional','executive','technical'])}),
 z.object({action:z.literal('saveCv'),id:uuid,content:resumeSchema,approved:z.boolean().default(false)}),
 z.object({action:z.literal('followup'),questionId:z.string(),language:z.enum(['pl','en']).default('pl')}),
 z.object({action:z.literal('extractAnswer'),questionId:z.string()}),
 z.object({action:z.literal('demo')})
]);
export async function GET(){try{
 const {db,user}=await apiUser();const [profiles,facts,answers,jobs,cvs]=await Promise.all(['career_profiles','career_facts','interview_answers','job_offers','cv_versions'].map(t=>rows(db,t,user.id)));
 const parsedFacts=facts.map(f=>factSchema.parse(f));
 const coverage=[...new Set(facts.filter(f=>f.source_type==='import'&&['user_confirmed','document_supported'].includes(f.verification_status)&&!f.excluded&&!f.confidential).flatMap(f=>Array.isArray(f.structured_value?.related_question_ids)?f.structured_value.related_question_ids:[]))];
 const profile=profiles[0]?{...profiles[0],covered_question_ids:coverage}:null;
 const enrichedJobs=jobs.map(job=>{const analysis=jobAnalysisSchema.safeParse(job.analysis);return {...job,evidence:analysis.success?mapEvidence(analysis.data.requirements,parsedFacts):[]};});
 return NextResponse.json({profile,facts,answers,jobs:enrichedJobs,cvs,aiConfigured:Boolean(process.env.AI_API_KEY)},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return fail(error);}}

export async function POST(request:Request){try{
 sameOrigin(request);const input=actionSchema.parse(await body(request));const {db,user}=await apiUser();
 const usage={onUsage:async(event:UsageEvent)=>{const {error}=await db.from('ai_usage_events').insert({user_id:user.id,...event,provider:'openai-compatible',status:event.status==='failure'?'error':'success'});if(error)console.warn('AI usage persistence failed',error.code);}};
 if(input.action==='profile'){const {error}=await db.from('career_profiles').upsert({user_id:user.id,professional_headline:input.data.headline,professional_summary:input.data.summary,career_objectives:input.data.career_objectives,seniority:input.data.seniority},{onConflict:'user_id'});check(error);}
 if(input.action==='answer'){
 if(!interviewQuestions.some(q=>q.id===input.questionId))throw new HttpError(400,'Unknown question.');
 if(input.status==='answered'&&!input.answer.trim())throw new HttpError(400,'Provide an answer or skip this question.');
 const {error}=await db.from('interview_answers').upsert({user_id:user.id,question_id:input.questionId,answer:input.status==='skipped'?'':input.answer,status:input.status},{onConflict:'user_id,question_id'});check(error);
 }
 if(input.action==='fact'){
 const data={statement:input.statement,fact_type:input.factType,verification_status:input.status||'user_provided',excluded:input.excluded||false,confidential:input.confidential||false,confirmed_at:input.status==='user_confirmed'?new Date().toISOString():null};
 if(input.status==='document_supported')throw new HttpError(400,'Use user confirmation; documentary verification requires an independent review process.');
 if(input.id){await ownedRow(db,'career_facts',input.id,user.id);const {error}=await db.from('career_facts').update(data).eq('id',input.id).eq('user_id',user.id);check(error);}else{const {error}=await db.from('career_facts').insert({...data,user_id:user.id,source_type:'manual',source_reference:'User profile editor'});check(error);}
 }
 if(input.action==='deleteFact'){const {error}=await db.from('career_facts').delete().eq('id',input.id).eq('user_id',user.id);check(error);}
 if(input.action==='analyzeJob'){
 await rateLimit(db,'ai');let text=input.text.trim();
 if(input.url&&!text){const {retrieveJob}=await import('@/lib/jobs/retrieve');text=await retrieveJob(input.url);}
 if(text.length<40)throw new HttpError(400,'Paste at least 40 characters of the advertisement.');
 let analysis;let warning:string|null=null;
 try{analysis=await analyzeJobAI(text,input.language,usage);}catch{analysis=analyzeJob(text,input.language);warning='AI unavailable. A conservative text analysis was saved. Review the extracted requirements.';}
 const {data:job,error}=await db.from('job_offers').insert({user_id:user.id,title:analysis.title,employer:analysis.employer,original_text:text,source_url:input.url||null,analysis}).select().single();check(error);
 const requirements=analysis.requirements.map(r=>({id:crypto.randomUUID(),user_id:user.id,job_offer_id:job.id,statement:r.statement,category:r.category,priority:r.priority}));
 if(requirements.length){const {error}=await db.from('job_requirements').insert(requirements);check(error);}
 const facts=(await rows(db,'career_facts',user.id)).map(f=>factSchema.parse(f));const mapping=mapEvidence(requirements,facts);
 if(mapping.some(m=>m.factIds.length)){const {error}=await db.from('requirement_evidence').insert(mapping.flatMap(m=>m.factIds.map(id=>({user_id:user.id,requirement_id:m.requirementId,fact_id:id,status:m.status}))));check(error);}
 return NextResponse.json({ok:true,id:job.id,warning,analysis,mapping});
 }
 if(input.action==='generate'){
 await rateLimit(db,'generate');const job=await ownedRow(db,'job_offers',input.jobId,user.id);const facts=(await rows(db,'career_facts',user.id)).map(f=>factSchema.parse(f));if(!usableFacts(facts).length)throw new HttpError(400,'Confirm at least one public career fact first.');
 const args={facts:usableFacts(facts),analysis:jobAnalysisSchema.parse(job.analysis),language:input.language,template:input.template};let resume;let warning:string|null=null;
 try{resume=await composeResumeAI(args,usage);}catch{resume=generateResume(args);warning='AI unavailable or output rejected. A fact-preserving draft was generated. Original fact wording is retained.';}
 const {data:cv,error}=await db.from('cv_versions').insert({user_id:user.id,job_offer_id:job.id,title:resume.title,language:input.language,template:input.template,content:resume,approved:false}).select().single();check(error);
 return NextResponse.json({ok:true,id:cv.id,warning});
 }
 if(input.action==='saveCv'){
 await ownedRow(db,'cv_versions',input.id,user.id);const facts=(await rows(db,'career_facts',user.id)).map(f=>factSchema.parse(f));const result=validateResume(input.content,facts);if(!result.valid)throw new HttpError(400,result.errors.join(' '));
 const {error}=await db.from('cv_versions').update({content:input.content,approved:input.approved,title:input.content.title,language:input.content.language,template:input.content.template}).eq('id',input.id).eq('user_id',user.id);check(error);
 }
 if(input.action==='extractAnswer'||input.action==='followup'){
 await rateLimit(db,'ai');const {data:answer,error}=await db.from('interview_answers').select('*').eq('user_id',user.id).eq('question_id',input.questionId).maybeSingle();check(error);if(!answer||answer.status!=='answered')throw new HttpError(400,'Save an answer first.');
 if(input.action==='followup'){const facts=(await rows(db,'career_facts',user.id)).map(f=>factSchema.parse(f));try{return NextResponse.json(await generateFollowups({answer:answer.answer,knownFacts:usableFacts(facts),language:input.language},usage));}catch{return NextResponse.json({questions:[{question:input.language==='pl'?'Jaki był Twój wkład i jaki rezultat możesz potwierdzić?':'What was your contribution and what result can you substantiate?',reason:'Evidence and personal contribution',relatedFactIds:[]}],warning:'AI unavailable. General evidence follow-up.'});}}
 let extracted;try{extracted=(await extractFacts(answer.answer,usage)).facts;}catch{extracted=[{statement:answer.answer.slice(0,4000),fact_type:'experience',source_quote:answer.answer,related_question_ids:[input.questionId]}];}
 const existing=await rows(db,'career_facts',user.id);const fresh=extracted.filter(f=>!existing.some(e=>e.statement.trim().toLowerCase()===f.statement.trim().toLowerCase()));
 if(fresh.length){const {error}=await db.from('career_facts').insert(fresh.map(f=>({user_id:user.id,statement:f.statement,fact_type:f.fact_type,source_type:'interview',source_reference:input.questionId,verification_status:'user_provided',structured_value:{source_quote:f.source_quote,related_question_ids:f.related_question_ids}})));check(error);}
 return NextResponse.json({ok:true,count:fresh.length});
 }
 if(input.action==='demo'){
 const existing=await rows(db,'career_facts',user.id);if(existing.length)throw new HttpError(409,'Demo import is available only for an empty fact registry.');
 const {error}=await db.from('career_facts').insert(syntheticFacts.map(f=>({...f,id:crypto.randomUUID(),user_id:user.id,source_type:'demo',source_reference:'Synthetic demonstration — not a real person',verification_status:'imported_unconfirmed'})));check(error);
 for(const demo of syntheticJobs){const analysis=analyzeJob(demo.text,'en');const {error}=await db.from('job_offers').insert({user_id:user.id,title:demo.title,employer:'Fictional company',original_text:demo.text,analysis});check(error);}
 }
 return NextResponse.json({ok:true});
 }catch(error){return fail(error);}}
