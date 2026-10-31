import {syntheticFacts,syntheticJobs} from '@/data/demo';
import {analyzeJob} from '@/lib/jobs/analyze';
import {generateResume,mapEvidence,validateResume,resumeSchema,type Fact,type Resume,type JobAnalysis} from '@/lib/resume/engine';
import {entitySchemas,entityName,entityStatement,factTypeForEntity} from '@/lib/career/schemas';
const KEY='matchcv-review-demo-v1';
type DemoFact=Fact&{source_type:string;source_reference:string};
type Job={id:string;title:string;original_text:string;analysis:JobAnalysis;created_at:string};
type Cv={id:string;title:string;language:'pl'|'en';template:Resume['template'];content:Resume;approved:boolean;created_at:string};
type Entity=keyof typeof entitySchemas;
type State={profile:Record<string,unknown>;facts:DemoFact[];answers:{question_id:string;answer:string;status:'answered'|'skipped'}[];jobs:Job[];cvs:Cv[];entities:Record<Entity,Record<string,unknown>[]>};
export function isDemo(){return typeof window!=='undefined'&&(window.location.pathname.startsWith('/demo')||document.documentElement.dataset.matchcvDemo==='true');}
export function demoPath(path:string){return isDemo()&&path.startsWith('/')?`/demo${path}`:path;}
export function initialDemo():State{
 const created_at=new Date().toISOString();
 const facts=syntheticFacts.map(f=>({...f,source_type:'demo',source_reference:'Fikcyjny profil — do testowania interfejsu'}));
 const jobs=syntheticJobs.map((j,i)=>({id:`72000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,title:j.title,original_text:j.text,analysis:analyzeJob(j.text,'en'),created_at}));
 const cvs=jobs.map((job,i)=>{const content=generateResume({facts,analysis:job.analysis,language:'en',template:i===2?'technical':'professional'});return {id:`73000000-0000-4000-8000-${String(i+1).padStart(12,'0')}`,title:content.title,language:content.language,template:content.template,content,approved:false,created_at};});
 return {profile:{professional_headline:'Alex Morgan — Project & Transformation Manager',professional_summary:'Fikcyjny profil do oceny produktu: infrastruktura, energetyka i transformacja cyfrowa.',career_objectives:'Dopasowanie doświadczenia do trzech różnych ról.',seniority:'Senior',covered_question_ids:[]},facts,answers:[],jobs,cvs,entities:{work_experiences:[],projects:[],achievements:[],skills:[],education:[],certifications:[],languages:[]}};
}
function newId(){const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;const h=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${h.slice(0,8)}-${h.slice(8,12)}-${h.slice(12,16)}-${h.slice(16,20)}-${h.slice(20)}`;}
function load():State{const raw=localStorage.getItem(KEY);if(raw)return JSON.parse(raw) as State;const state=initialDemo();save(state);return state;}
function save(state:State){localStorage.setItem(KEY,JSON.stringify(state));}
function json(data:unknown,status=200){return Response.json(data,{status});}
export async function workspaceFetch(input:string,options?:RequestInit):Promise<Response>{
 if(!isDemo())return fetch(input,options);
 try{
 const s=load(),method=options?.method||'GET';const data=typeof options?.body==='string'?JSON.parse(options.body):{};
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
   case 'profile':s.profile={...s.profile,professional_headline:data.data.headline,professional_summary:data.data.summary,career_objectives:data.data.career_objectives,seniority:data.data.seniority};break;
   case 'answer':s.answers=[...s.answers.filter(a=>a.question_id!==data.questionId),{question_id:data.questionId,answer:data.status==='skipped'?'':data.answer,status:data.status}];break;
   case 'fact':{const fact:DemoFact={id:data.id||newId(),statement:data.statement,fact_type:data.factType||'experience',verification_status:data.status||'user_provided',excluded:Boolean(data.excluded),confidential:Boolean(data.confidential),source_type:'demo',source_reference:'Przegląd produktu — lokalna edycja'};s.facts=[...s.facts.filter(f=>f.id!==fact.id),fact];break;}
   case 'deleteFact':s.facts=s.facts.filter(f=>f.id!==data.id);break;
   case 'analyzeJob':{if(!data.text?.trim())throw Error('W demonstracji wklej treść oferty. Pobieranie adresów jest dostępne w skonfigurowanej aplikacji.');const analysis=analyzeJob(data.text,data.language);const id=newId();s.jobs.unshift({id,title:analysis.title,original_text:data.text,analysis,created_at:new Date().toISOString()});result={ok:true,id,warning:'Analiza deterministyczna — demonstracja nie wywołuje AI.'};break;}
   case 'generate':{const job=s.jobs.find(j=>j.id===data.jobId);if(!job)throw Error('Nie znaleziono oferty.');const content=generateResume({facts:s.facts,analysis:job.analysis,language:data.language,template:data.template});const id=newId();s.cvs.unshift({id,title:content.title,language:content.language,template:content.template,content,approved:false,created_at:new Date().toISOString()});result={ok:true,id,warning:'Wersja demonstracyjna — wyłącznie potwierdzone fakty, bez wywołania AI.'};break;}
   case 'saveCv':{const content=resumeSchema.parse(data.content);const check=validateResume(content,s.facts);if(!check.valid)throw Error(check.errors.join(' '));s.cvs=s.cvs.map(cv=>cv.id===data.id?{...cv,content,title:content.title,template:content.template,language:content.language,approved:data.approved}:cv);break;}
   case 'extractAnswer':{const answer=s.answers.find(a=>a.question_id===data.questionId&&a.status==='answered');if(!answer)throw Error('Zapisz odpowiedź.');s.facts.push({id:newId(),statement:answer.answer.slice(0,4000),fact_type:'experience',verification_status:'user_provided',source_type:'demo',source_reference:data.questionId});break;}
   case 'demo':throw Error('Przykładowe dane są już dostępne.');
   default:throw Error('Ta operacja wymaga skonfigurowanej aplikacji.');
  }save(s);return json(result);
 }
 if(input.startsWith('/api/cv/')&&input.includes('/export')){
  const id=input.split('/')[3],cv=s.cvs.find(c=>c.id===id);if(!cv||!cv.approved)throw Error('Najpierw zatwierdź i zapisz CV.');const check=validateResume(cv.content,s.facts);if(!check.valid)throw Error('Fakty zmieniły się. Sprawdź CV ponownie.');
  const {buildPdf,buildDocx}=await import('@/lib/documents/render');
  if(input.includes('format=pdf')){const font=await fetch('/fonts/DejaVuSans.ttf');if(!font.ok)throw Error('Nie udało się pobrać czcionki.');const bytes=await buildPdf(cv.content,new Uint8Array(await font.arrayBuffer()));return new Response(new Blob([Uint8Array.from(bytes)],{type:'application/pdf'}));}
  const {Packer}=await import('docx');return new Response(await Packer.toBlob(buildDocx(cv.content)));
 }
 if(input==='/api/account'&&method==='GET')return json({mode:'browser-only-demo',data:s});
 if(input==='/api/account'&&method==='DELETE')throw Error('To lokalna demonstracja. Użyj przycisku „Zresetuj demo” w górnym pasku.');
 if(input==='/api/import')throw Error('Import dokumentów wymaga prywatnego magazynu Supabase. W demonstracji dodaj lub edytuj fakty w profilu.');
 throw Error('Operacja niedostępna w demonstracji.');
 }catch(e){return json({error:e instanceof Error?e.message:'Nie udało się wykonać operacji.'},400);}
}
export function resetDemo(){localStorage.removeItem(KEY);}
