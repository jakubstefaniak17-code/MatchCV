import {NextResponse} from 'next/server';
import {z} from 'zod';
import type {UsageEvent} from '@/lib/ai/provider';
import {apiUser,HttpError} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {ownedRow,rows,rateLimit} from '@/lib/db/repository';
import {importCoverage,parsedFacts,applyExclusions} from '@/lib/career/provenance';
import {factSchema,generateResume,mapEvidence,resumeSchema,jobAnalysisSchema,usableFacts,templateSchema,normalizeLegacyResume} from '@/lib/resume/engine';
import {analyzeJobAI,composeResumeAI} from '@/lib/ai/workflows';
import {analyzeJob} from '@/lib/jobs/analyze';
import {entityName,entitySchemas} from '@/lib/career/schemas';
import {assessCareerReadiness} from '@/lib/onboarding/readiness';
import {reviewResume} from '@/lib/resume/review';
import {buildCareerContext} from '@/lib/resume/context';
import {materializeReviewedImport} from '@/lib/career/import-review';
import {syntheticFacts,syntheticJobs} from '@/data/demo';
const uuid=z.string().uuid();
const actionSchema=z.discriminatedUnion('action',[
 z.object({action:z.literal('profile'),data:z.object({headline:z.string().max(300).optional(),summary:z.string().max(5000).optional(),career_objectives:z.string().max(5000).optional(),seniority:z.string().max(100).optional(),excluded_details:z.array(z.string().max(250)).max(50).optional()})}),
 z.object({action:z.literal('answer'),questionId:z.string(),answer:z.string().max(12000),status:z.enum(['answered','skipped'])}),
 z.object({action:z.literal('fact'),id:uuid.optional(),statement:z.string().min(1).max(4000),factType:z.enum(['experience','project','achievement','skill','education','certification','language','other','identity','contact']).default('experience'),status:factSchema.shape.verification_status.optional(),excluded:z.boolean().optional(),confidential:z.boolean().optional(),private:z.boolean().optional(),forbiddenForCv:z.boolean().optional(),coverageConfirmed:z.boolean().optional(),proposedEntity:z.object({entity:entityName,data:z.record(z.string(),z.unknown()),period:z.object({start:z.string().nullable(),end:z.string().nullable(),isCurrent:z.boolean().optional()}).optional()}).optional()}),
 z.object({action:z.literal('deleteFact'),id:uuid}),
 z.object({action:z.literal('analyzeJob'),text:z.string().max(60000).default(''),url:z.string().max(2000).optional(),language:z.enum(['pl','en']).default('pl')}),
 z.object({action:z.literal('generate'),jobId:uuid,language:z.enum(['pl','en']),template:templateSchema,mode:z.enum(['professional','basic']).default('professional')}),
 z.object({action:z.literal('saveCv'),id:uuid,content:resumeSchema,approved:z.boolean().default(false)}),
 z.object({action:z.literal('followup'),questionId:z.string(),language:z.enum(['pl','en']).default('pl')}),
 z.object({action:z.literal('extractAnswer'),questionId:z.string()}),
 z.object({action:z.literal('demo')})
]);
export async function GET(){try{
 const {db,user}=await apiUser();const [profiles,facts,answers,jobs,cvs]=await Promise.all(['career_profiles','career_facts','interview_answers','job_offers','cv_versions'].map(t=>rows(db,t,user.id)));
 const factRows=facts.map(f=>factSchema.parse(f));
 const coverage=importCoverage(parsedFacts(facts)).coveredQuestionIds;
 const profile=profiles[0]?{...profiles[0],covered_question_ids:coverage}:null;
 const enrichedJobs=jobs.map(job=>{const analysis=jobAnalysisSchema.safeParse(job.analysis);return {...job,evidence:analysis.success?mapEvidence(analysis.data.requirements,factRows):[]};});
 return NextResponse.json({profile,facts,answers,jobs:enrichedJobs,cvs:cvs.map(cv=>({...cv,content:normalizeLegacyResume(cv.content)})),aiConfigured:Boolean(process.env.AI_API_KEY)},{headers:{'Cache-Control':'no-store'}});
 }catch(error){return fail(error);}}

export async function POST(request:Request){try{
 sameOrigin(request);const input=actionSchema.parse(await body(request));const {db,user}=await apiUser();
 const usage={onUsage:async(event:UsageEvent)=>{const {error}=await db.from('ai_usage_events').insert({user_id:user.id,...event,provider:'openai-compatible',status:event.status==='failure'?'error':'success'});if(error)console.warn('AI usage persistence failed',error.code);}};
 if(input.action==='profile'){const {error}=await db.from('career_profiles').upsert({user_id:user.id,professional_headline:input.data.headline,professional_summary:input.data.summary,career_objectives:input.data.career_objectives,seniority:input.data.seniority,excluded_details:input.data.excluded_details},{onConflict:'user_id'});check(error);}
 if(input.action==='answer')throw new HttpError(400,'Użyj formularza wywiadu 40 pytań. Starsze odpowiedzi pozostają w historii.');
 if(input.action==='fact'){
 const data={statement:input.statement,fact_type:input.factType,verification_status:input.status||'user_provided',excluded:input.excluded||false,confidential:input.confidential||false,private:input.private||false,forbidden_for_cv:input.forbiddenForCv||false,confirmed_at:input.status==='user_confirmed'?new Date().toISOString():null};
 if(input.status==='document_supported')throw new HttpError(400,'Use user confirmation; documentary verification requires an independent review process.');
 if(input.id){const original=await ownedRow(db,'career_facts',input.id,user.id);if(input.proposedEntity){const entityData=entitySchemas[input.proposedEntity.entity].parse(input.proposedEntity.data);original.structured_value={...original.structured_value,proposed_entity:{...(original.structured_value?.proposed_entity||{}),...input.proposedEntity,entity:input.proposedEntity.entity,data:entityData}};original.statement=input.statement;}const reviewed=input.status==='user_confirmed'?await materializeReviewedImport(db,user.id,original,input.statement):{structured:original.structured_value||{},sourceReference:original.source_reference};const structured={...reviewed.structured,coverage_confirmed:input.coverageConfirmed===true&&original.statement===input.statement};const {error}=await db.from('career_facts').update({...data,source_reference:reviewed.sourceReference,structured_value:structured}).eq('id',input.id).eq('user_id',user.id);check(error);}else{const {error}=await db.from('career_facts').insert({...data,user_id:user.id,source_type:'manual',source_reference:'User profile editor'});check(error);}
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
 const profiles=await rows(db,'career_profiles',user.id);const protectedFacts=applyExclusions(facts,profiles[0]?.excluded_details);
 const readiness=assessCareerReadiness(protectedFacts);if(!readiness.canGenerate)throw new HttpError(400,readiness.gaps.join(' '));
 const entityRows=Object.fromEntries(await Promise.all(entityName.options.map(async table=>[table,await rows(db,table,user.id)])));
 const context=buildCareerContext({...entityRows,facts:protectedFacts,career_profiles:profiles});
 const args={facts:usableFacts(protectedFacts),context,analysis:jobAnalysisSchema.parse(job.analysis),language:input.language,template:input.template};let resume;let warning:string|null=null;
 if(input.mode==='basic'){resume=generateResume(args);warning='Prosty szkic oparty na faktach. Bez redakcji AI i tłumaczenia; sprawdź język oraz kompletność przed publikacją.';}else{try{resume=await composeResumeAI(args,usage);}catch{throw new HttpError(503,'Redakcja AI jest obecnie niedostępna lub wynik nie przeszedł kontroli. Dane zachowano. Spróbuj ponownie albo jawnie wybierz prosty szkic.');}}
 const {data:cv,error}=await db.from('cv_versions').insert({user_id:user.id,job_offer_id:job.id,title:resume.title,language:input.language,template:input.template,content:resume,approved:false}).select().single();check(error);
 return NextResponse.json({ok:true,id:cv.id,warning});
 }
 if(input.action==='saveCv'){
 const stored=await ownedRow(db,'cv_versions',input.id,user.id);const facts=(await rows(db,'career_facts',user.id)).map(f=>factSchema.parse(f));const profileRows=await rows(db,'career_profiles',user.id);const reviewed=reviewResume(input.content,normalizeLegacyResume(stored.content),applyExclusions(facts,profileRows[0]?.excluded_details),input.approved);const result=reviewed.result;if(!result.valid)throw new HttpError(400,result.errors.join(' '));
 const {error}=await db.from('cv_versions').update({content:reviewed.content,approved:input.approved,title:reviewed.content.title,language:reviewed.content.language,template:reviewed.content.template}).eq('id',input.id).eq('user_id',user.id);check(error);
 }
 if(input.action==='extractAnswer'||input.action==='followup')throw new HttpError(400,'Użyj nowego wywiadu 40 pytań.');
 if(input.action==='demo'){
 const existing=await rows(db,'career_facts',user.id);if(existing.length)throw new HttpError(409,'Demo import is available only for an empty fact registry.');
 const {error}=await db.from('career_facts').insert(syntheticFacts.map(f=>({...f,id:crypto.randomUUID(),user_id:user.id,source_type:'demo',source_reference:'Synthetic demonstration — not a real person',verification_status:'imported_unconfirmed'})));check(error);
 for(const demo of syntheticJobs){const analysis=analyzeJob(demo.text,'en');const {error}=await db.from('job_offers').insert({user_id:user.id,title:demo.title,employer:'Fictional company',original_text:demo.text,analysis});check(error);}
 }
 return NextResponse.json({ok:true});
 }catch(error){return fail(error);}}
