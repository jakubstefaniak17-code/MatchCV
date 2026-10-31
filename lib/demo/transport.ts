import {syntheticFacts,syntheticJobs} from '@/data/demo';
import {analyzeJob} from '@/lib/jobs/analyze';
import {generateResume,mapEvidence,validateResume,resumeSchema,normalizeLegacyResume,type Fact,type Resume,type JobAnalysis} from '@/lib/resume/engine';
import {interviewQuestions} from '@/data/interview-questions';
import {validateAnswerForQuestion,answerAsText} from '@/lib/interview/schema';
import {answerFromRow} from '@/lib/interview/repository';
import {deterministicFollowUps} from '@/lib/interview/engine';
import {importCoverage,parsedFacts,applyExclusions} from '@/lib/career/provenance';
import {entitySchemas,entityName,entityStatement,factTypeForEntity} from '@/lib/career/schemas';
const KEY='matchcv-review-demo-v1';
type DemoFact=Fact&{source_type:string;source_reference:string;structured_value?:Record<string,unknown>};
type Job={id:string;title:string;original_text:string;analysis:JobAnalysis;created_at:string};
type Cv={id:string;title:string;language:'pl'|'en';template:Resume['template'];content:Resume;approved:boolean;created_at:string};
type Entity=keyof typeof entitySchemas;
type State={profile:Record<string,unknown>;facts:DemoFact[];answers:Record<string,unknown>[];jobs:Job[];cvs:Cv[];entities:Record<Entity,Record<string,unknown>[]>};
export function isDemo(){return typeof window!=='undefined'&&(window.location.pathname.startsWith('/demo')||document.documentElement.dataset.matchcvDemo==='true');}
export function demoPath(path:string){return isDemo()&&path.startsWith('/')?`/demo${path}`:path;}
export function initialDemo():State{
 const created_at=new Date().toISOString();
 const facts=syntheticFacts.map(f=>({...f,source_type:'demo',source_reference:'Fikcyjny profil — do testowania interfejsu'}));
 const jobs=syntheticJobs.map((j,i)=>({id:`72000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,title:j.title,original_text:j.text,analysis:analyzeJob(j.text,'en'),created_at}));
 const cvs=jobs.map((job,i)=>{const content=generateResume({facts,analysis:job.analysis,language:'en',template:i===2?'modern_studio':'executive_clarity'});return {id:`73000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,title:content.title,language:content.language,template:content.template,content,approved:false,created_at};});
 return {profile:{professional_headline:'Alex Morgan — Project & Transformation Manager',professional_summary:'Fikcyjny profil do oceny produktu: infrastruktura, energetyka i transformacja cyfrowa.',career_objectives:'Dopasowanie doświadczenia do trzech różnych ról.',seniority:'Senior',covered_question_ids:[]},facts,answers:[],jobs,cvs,entities:{work_experiences:[],projects:[],achievements:[],skills:[],education:[],certifications:[],languages:[]}};
}
function newId(){const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
function load():State{const raw=localStorage.getItem(KEY);if(raw){const saved=JSON.parse(raw) as State;saved.cvs=saved.cvs.map(cv=>({...cv,content:normalizeLegacyResume(cv.content),template:normalizeLegacyResume(cv.content).template}));return saved;}const state=initialDemo();save(state);return state;}
function save(state:State){localStorage.setItem(KEY,JSON.stringify(state));}
function json(data:unknown,status=200){return Response.json(data,{status});}
export async function workspaceFetch(input:string,options?:RequestInit):Promise<Response>{
 if(!isDemo())return fetch(input,options);
 try{
 const s=load(),method=options?.method||'GET';const data=typeof options?.body==='string'?JSON.parse(options.body):{};
 if(input==='/api/interview'){
  if(method==='GET')return json({userId:'browser-demo',answers:s.answers.filter(a=>String(a.question_id).startsWith('MCV-')).map(a=>({question_id:a.question_id,...answerFromRow(a)})),...importCoverage(parsedFacts(s.facts))});
  const answer=validateAnswerForQuestion(data.questionId,data.answer);const prior=s.answers.find(a=>a.question_id===data.questionId);
  if(prior?.last_edited_at&&answer.last_edited_at&&String(prior.last_edited_at)>answer.last_edited_at)return json({error:'Nowsza odpowiedź jest już zapisana. Zachowaj szkic i odśwież ekran.'},409);
  s.answers=[...s.answers.filter(a=>a.question_id!==data.questionId),{question_id:data.questionId,...answer,value_json:answer.value,answer:answerAsText(answer)}];save(s);return json({ok:true,answer});
 }
 if(input==='/api/interview/followup'||input==='/api/interview/extract'){
  const question=interviewQuestions.find(q=>q.id===data.questionId);if(!question)throw Error('Nieznane pytanie.');const row=s.answers.find(a=>a.question_id===question.id);if(!row)throw Error('Najpierw zapisz odpowiedź.');const answer=answerFromRow(row);
  if(input.endsWith('/followup'))return json({questions:deterministicFollowUps(question.id,answer)});
  if(question.storage_visibility==='private_only')return json({ok:true,count:0,warning:'Ta odpowiedź pozostaje prywatna i nie jest przekazywana do generacji.'});
  if(answer.status!=='answered')throw Error('Najpierw zakończ odpowiedź.');const text=[answerAsText(answer),...answer.followup_answers.map(a=>a.answer)].join('\n').slice(0,4000);
  if(!s.facts.some(f=>f.source_reference===question.id&&f.statement===text))s.facts.push({id:newId(),statement:text,fact_type:'other',verification_status:'user_provided',source_type:'interview',source_reference:question.id,excluded:true,structured_value:{source_quote:text,information_kind:'declaration',share_in_cv_by_default:false}});
  save(s);return json({ok:true,count:1,warning:'Deklaracja czeka na sprawdzenie treści i osobną zgodę na użycie w CV. W demonstracji nie korzystamy z modelu.'});
 }
 if(input==='/api/workspace'&&method==='GET')return json({...s,jobs:s.jobs.map(j=>({...j,evidence:mapEvidence(j.analysis.requirements,s.facts)})),aiConfigured:false});
 if(input==='/api/career'){
  if(method==='GET')return json(s.entities);
  const entity=entityName.parse(data.entity);
  if(method==='DELETE'){s.entities[entity]=s.entities[entity].filter(r=>r.id!==data.id);s.facts=s.facts.map(f=>f.source_reference===`${entity}:${data.id}`?{...f,verification_status:'disputed'}:f);}
  else{const values=entitySchemas[entity].parse(data.data);const id=data.id||newId();s.entities[entity]=[...s.entities[entity].filter(r=>r.id!==id),{...values,id}];s.facts=s.facts.map(f=>f.source_reference===`${entity}:${id}`?{...f,verification_status:'disputed'}:f);s.facts.push({id:newId(),statement:entityStatement(entity,values),fact_type:factTypeForEntity[entity],verification_status:'user_provided',source_type:'demo',source_reference:`${entity}:${id}`});}
  save(s);return json({ok:true});
 }
 if(input==='/api/workspace'&&method==='POST'){
  let result:Record<string,unknown>={ok:true};
  switch(data.action){
   case 'profile':s.profile={...s.profile,professional_headline:data.data.headline,professional_summary:data.data.summary,career_objectives:data.data.career_objectives,seniority:data.data.seniority,excluded_details:data.data.excluded_details};break;
   case 'answer':throw Error('Skorzystaj z nowego wywiadu 40 pytań.');
   case 'fact':{const old=s.facts.find(f=>f.id===data.id);const question=interviewQuestions.find(q=>q.id===old?.source_reference);const locked=question?.storage_visibility==='private_only';const fact:DemoFact={...old,id:data.id||newId(),statement:data.statement,fact_type:data.factType||'experience',verification_status:data.status||'user_provided',excluded:locked||Boolean(data.excluded),confidential:locked||Boolean(data.confidential),private:locked||Boolean(data.private),forbidden_for_cv:locked||Boolean(data.forbiddenForCv),source_type:old?.source_type||'demo',source_reference:old?.source_reference||'Lokalna edycja',structured_value:{...old?.structured_value,coverage_confirmed:Boolean(data.coverageConfirmed)&&old?.statement===data.statement}};s.facts=[...s.facts.filter(f=>f.id!==fact.id),fact];break;}
   case 'deleteFact':s.facts=s.facts.filter(f=>f.id!==data.id);break;
   case 'analyzeJob':{if(!data.text?.trim())throw Error('W demonstracji wklej treść oferty. Pobieranie adresów jest dostępne w skonfigurowanej aplikacji.');const analysis=analyzeJob(data.text,data.language);const id=newId();s.jobs.unshift({id,title:analysis.title,original_text:data.text,analysis,created_at:new Date().toISOString()});result={ok:true,id,warning:'Analiza deterministyczna — demonstracja nie wywołuje AI.'};break;}
   case 'generate':{const job=s.jobs.find(j=>j.id===data.jobId);if(!job)throw Error('Nie znaleziono oferty.');const content=generateResume({facts:applyExclusions(s.facts,s.profile.excluded_details),analysis:job.analysis,language:data.language,template:data.template});const id=newId();s.cvs.unshift({id,title:content.title,language:content.language,template:content.template,content,approved:false,created_at:new Date().toISOString()});result={ok:true,id,warning:'Wersja demonstracyjna — wyłącznie potwierdzone fakty, bez wywołania AI.'};break;}
   case 'saveCv':{const content=resumeSchema.parse(data.content);const check=validateResume(content,applyExclusions(s.facts,s.profile.excluded_details));if(!check.valid)throw Error(check.errors.join(' '));s.cvs=s.cvs.map(cv=>cv.id===data.id?{...cv,content,title:content.title,template:content.template,language:content.language,approved:data.approved}:cv);break;}
   case 'extractAnswer':throw Error('Skorzystaj z nowego wywiadu 40 pytań.');
   case 'demo':throw Error('Przykładowe dane są już dostępne.');
   default:throw Error('Ta operacja wymaga skonfigurowanej aplikacji.');
  }save(s);return json(result);
 }
 if(input.startsWith('/api/cv/')&&input.includes('/export')){
  const id=input.split('/')[3],cv=s.cvs.find(c=>c.id===id);if(!cv||!cv.approved)throw Error('Najpierw zatwierdź i zapisz CV.');const check=validateResume(cv.content,applyExclusions(s.facts,s.profile.excluded_details));if(!check.valid)throw Error('Fakty zmieniły się. Sprawdź CV ponownie.');
  const {buildPdf,buildDocx}=await import('@/lib/documents/render');
  if(input.includes('format=pdf')){const fonts=await Promise.all(['DejaVuSans.ttf','DejaVuSans-Bold.ttf'].map(file=>fetch('/fonts/'+file)));if(fonts.some(f=>!f.ok))throw Error('Nie udało się pobrać czcionki.');const fontBytes=await Promise.all(fonts.map(async f=>new Uint8Array(await f.arrayBuffer())));const bytes=await buildPdf(cv.content,fontBytes[0],fontBytes[1]);return new Response(new Blob([Uint8Array.from(bytes)],{type:'application/pdf'}));}
  const {Packer}=await import('docx');return new Response(await Packer.toBlob(buildDocx(cv.content)));
 }
 if(input==='/api/account'&&method==='GET')return json({mode:'browser-only-demo',data:s});
 if(input==='/api/account'&&method==='DELETE')throw Error('To lokalna demonstracja. Użyj przycisku „Zresetuj demo” w górnym pasku.');
 if(input==='/api/import')throw Error('Import dokumentów wymaga prywatnego magazynu Supabase. W demonstracji dodaj lub edytuj fakty w profilu.');
 throw Error('Operacja niedostępna w demonstracji.');
 }catch(e){return json({error:e instanceof Error?e.message:'Nie udało się wykonać operacji.'},400);}
}
export function resetDemo(){localStorage.removeItem(KEY);}
