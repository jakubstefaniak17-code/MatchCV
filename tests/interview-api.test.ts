import {beforeEach,describe,expect,it,vi} from 'vitest';

const state=vi.hoisted(()=>({
 userId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',authenticated:true,
 tables:{} as Record<string,Record<string,unknown>[]>,
 writes:[] as {table:string;payload:Record<string,unknown>;options:unknown}[],
 reads:[] as {table:string;filters:[string,unknown][]}[],
 rpcCalls:[] as unknown[],writeError:null as {code:string;message:string}|null,
}));
vi.mock('@/lib/auth/server',()=>{
 class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
 function from(table:string){
  const query={table,filters:[] as [string,unknown][]};state.reads.push(query);
  let payload:Record<string,unknown>|null=null;let options:unknown;let single=false;
  const result=()=>{
   const records=state.tables[table]??=[];
   if(payload){
    state.writes.push({table,payload,options});
    if(state.writeError)return {data:null,error:state.writeError};
    const input=Array.isArray(payload)?payload:[payload];
    for(const value of input){
     const current=records.find(r=>r.user_id===value.user_id&&r.question_id===value.question_id);
     if(current)Object.assign(current,value);else records.push({id:crypto.randomUUID(),...value});
    }
   }
   const found=records.filter(row=>query.filters.every(([key,value])=>row[key]===value));
   return {data:single?(found[0]??null):found,error:null};
  };
  const builder={select:()=>builder,eq:(key:string,value:unknown)=>{query.filters.push([key,value]);return builder;},order:()=>builder,range:()=>builder,
   upsert:(value:Record<string,unknown>,config:unknown)=>{payload=value;options=config;return builder;},
   insert:(value:Record<string,unknown>)=>{payload=value;return builder;},
   maybeSingle:()=>{single=true;return Promise.resolve(result());},
   then:<T>(resolve:(value:ReturnType<typeof result>)=>T,reject?:(reason:unknown)=>T)=>Promise.resolve(result()).then(resolve,reject),
  };return builder;
 }
 const db={from,rpc:async(...args:unknown[])=>{state.rpcCalls.push(args);return {data:true,error:null};}};
 return {HttpError,apiUser:async()=>{if(!state.authenticated)throw new HttpError(401,'Sign in');return {db,user:{id:state.userId}};}};
});
vi.mock('@/lib/ai/workflows',()=>({extractFacts:vi.fn().mockRejectedValue(new Error('AI unavailable'))}));

import {GET,POST} from '@/app/api/interview/route';
import {POST as extract} from '@/app/api/interview/extract/route';
import {extractFacts} from '@/lib/ai/workflows';
import {interviewQuestions} from '@/data/interview-questions';
const bob='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const timestamp='2026-10-31T12:00:00.000Z';
const base={answer_type:'long_text',status:'draft',value:'Draft retained while editing.',followup_answers:[],fact_ids:[],last_edited_at:timestamp};
function request(payload:unknown,origin='https://matchcv.example'){
 return new Request('https://matchcv.example/api/interview',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)});
}
beforeEach(()=>{state.authenticated=true;state.tables={};state.writes=[];state.reads=[];state.rpcCalls=[];state.writeError=null;vi.clearAllMocks();vi.stubEnv('APP_URL','https://matchcv.example');});

describe('typed interview API integration with mocked owner database and unavailable AI',()=>{
 it('persists an incremental typed draft including its edit timestamp and owner',async()=>{
  const response=await POST(request({questionId:'MCV-Q001',answer:base}));
  expect(response.status).toBe(200);
  expect(state.writes[0]).toMatchObject({table:'interview_answers',options:{onConflict:'user_id,question_id'},payload:{user_id:state.userId,question_id:'MCV-Q001',status:'draft',answer_type:'long_text',answer:base.value,value_json:base.value,followup_answers:[],fact_ids:[],last_edited_at:timestamp}});
  expect((await response.json()).answer).toEqual(base);
 });
 it('preserves an explicit negative choice as answered instead of skipped',async()=>{
  const answer={...base,answer_type:'yes_no_with_details',status:'answered',value:{choice:'no',details:null}};
  const response=await POST(request({questionId:'MCV-Q022',answer}));
  expect(response.status).toBe(200);
  expect(state.writes[0].payload).toMatchObject({status:'answered',answer:'no',value_json:{choice:'no',details:null}});
 });
 it('persists a structured compensation range without turning it into a career fact',async()=>{
  const value={min:15000,max:20000,currency:'PLN',period:'month',contract_basis:'UoP_brutto',negotiability:null};
  const response=await POST(request({questionId:'MCV-Q035',answer:{...base,answer_type:'range_with_context',status:'answered',value}}));
  expect(response.status).toBe(200);
  expect(state.writes[0].payload.value_json).toEqual(value);
  expect(state.writes.every(w=>w.table==='interview_answers')).toBe(true);
  expect(extractFacts).not.toHaveBeenCalled();
 });
 it.each(['MCV-Q999','Q001'])('rejects unknown or archived question %s',async(questionId)=>{
  expect((await POST(request({questionId,answer:base}))).status).toBe(400);
  expect(state.writes).toHaveLength(0);
 });
 it('rejects mismatched answer types, malformed timestamps and missing edit timestamps',async()=>{
  expect((await POST(request({questionId:'MCV-Q022',answer:base}))).status).toBe(400);
  expect((await POST(request({questionId:'MCV-Q001',answer:{...base,last_edited_at:'yesterday'}}))).status).toBe(400);
  expect((await POST(request({questionId:'MCV-Q001',answer:{...base,last_edited_at:null}}))).status).toBe(400);
  expect(state.writes).toHaveLength(0);
 });
 it('maps PostgreSQL stale-write SQLSTATE 40001 to a recoverable conflict',async()=>{
  state.writeError={code:'40001',message:'A newer answer is saved'};
  const response=await POST(request({questionId:'MCV-Q001',answer:base}));
  expect(response.status).toBe(409);
  expect((await response.json()).error).toMatch(/Nowsza odpowiedź/);
  expect(state.tables.interview_answers).toHaveLength(0);
 });
 it('refuses another account’s fact reference before writing',async()=>{
  const factId=crypto.randomUUID();state.tables.career_facts=[{id:factId,user_id:bob}];
  const response=await POST(request({questionId:'MCV-Q001',answer:{...base,fact_ids:[factId]}}));
  expect(response.status).toBe(400);
  expect(state.writes).toHaveLength(0);
  expect(state.reads[0].filters).toContainEqual(['user_id',state.userId]);
 });
 it.each(['MCV-Q034','MCV-Q035','MCV-Q036','MCV-Q038','MCV-Q039'])('never sends private question %s to AI or fact extraction',async(questionId)=>{
  const response=await extract(request({questionId}));
  expect(response.status).toBe(200);
  expect(await response.json()).toMatchObject({ok:true,count:0});
  expect(extractFacts).not.toHaveBeenCalled();expect(state.writes).toHaveLength(0);expect(state.rpcCalls).toHaveLength(0);expect(state.reads).toHaveLength(0);
 });
 it('GET restores only the current owner’s 40 canonical answers and ignores archived rows',async()=>{
  state.tables.interview_answers=interviewQuestions.map(q=>({id:crypto.randomUUID(),user_id:state.userId,question_id:q.id,answer_type:q.answer_type,status:'unanswered',value_json:null,followup_answers:[],fact_ids:[],last_edited_at:null}));
  state.tables.interview_answers.push({id:crypto.randomUUID(),user_id:state.userId,question_id:'Q001',answer:'Archived answer',status:'answered'},{id:crypto.randomUUID(),user_id:bob,question_id:'MCV-Q001',answer:'Other account secret',status:'answered'});
  const response=await GET();
  expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('private, no-store');
  const body=await response.json();
  expect(body.userId).toBe(state.userId);expect(body.answers).toHaveLength(40);
  expect(body.answers.map((a:{question_id:string})=>a.question_id)).toEqual(interviewQuestions.map(q=>q.id));
  expect(JSON.stringify(body)).not.toContain('Other account secret');expect(JSON.stringify(body)).not.toContain('Archived answer');
  expect(state.reads.every(r=>r.filters.some(([key,value])=>key==='user_id'&&value===state.userId))).toBe(true);
 });
 it('GET treats suggested import coverage as context until explicitly reviewed',async()=>{
  state.tables.career_facts=[{id:crypto.randomUUID(),user_id:state.userId,statement:'Imported work history',fact_type:'experience',verification_status:'user_confirmed',source_type:'import',structured_value:{coverage_confirmed:false,question_coverage:[{question_id:'MCV-Q005',coverage:'full'}]}}];
  const first=await GET();expect((await first.json()).coveredQuestionIds).toEqual([]);
  (state.tables.career_facts[0].structured_value as Record<string,unknown>).coverage_confirmed=true;
  const reviewed=await GET();expect((await reviewed.json()).coveredQuestionIds).toEqual(['MCV-Q005']);
 });
 it('requires authentication for fetching, saving and extracting answers',async()=>{
  state.authenticated=false;
  expect((await GET()).status).toBe(401);
  expect((await POST(request({questionId:'MCV-Q001',answer:base}))).status).toBe(401);
  expect((await extract(request({questionId:'MCV-Q035'}))).status).toBe(401);
  expect(state.writes).toHaveLength(0);
 });
 it('rejects cross-origin save and extract before database work',async()=>{
  expect((await POST(request({questionId:'MCV-Q001',answer:base},'https://attacker.example'))).status).toBe(403);
  expect((await extract(request({questionId:'MCV-Q035'},'https://attacker.example'))).status).toBe(403);
  expect(state.reads).toHaveLength(0);expect(state.writes).toHaveLength(0);
 });
});
