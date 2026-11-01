import { beforeEach, describe, expect, it, vi } from 'vitest';

const state=vi.hoisted(()=>({
 userId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', authenticated:true, allowed:true,
 tables:{} as Record<string,Record<string,unknown>[]>,
 queries:[] as {table:string;operation:string;filters:[string,unknown][];payload?:unknown}[],
 rpcCalls:[] as {name:string;args:Record<string,unknown>}[],
}));
vi.mock('@/lib/auth/server',()=>{
 class HttpError extends Error {constructor(public status:number,message:string){super(message);}}
 function from(table:string){
  const call={table,operation:'select',filters:[] as [string,unknown][],payload:undefined as unknown};
  state.queries.push(call);
  let single=false;
  let mutationDone=false;
  const result=()=>{
   const records=state.tables[table]??=[];
   let found=records.filter(row=>call.filters.every(([key,value])=>row[key]===value));
   if(!mutationDone&&call.operation==='insert'){
    const input=Array.isArray(call.payload)?call.payload:[call.payload];
    found=input.map(value=>({id:crypto.randomUUID(),...value as Record<string,unknown>}));
    records.push(...found);mutationDone=true;
   }
   if(!mutationDone&&call.operation==='update'){
    found.forEach(row=>Object.assign(row,call.payload));mutationDone=true;
   }
   return {data:single?(found[0]??null):found,error:null};
  };
  const builder={
   select:()=>builder,eq:(key:string,value:unknown)=>{call.filters.push([key,value]);return builder;},
   order:()=>builder,range:()=>builder,
   insert:(payload:unknown)=>{call.operation='insert';call.payload=payload;return builder;},
   update:(payload:unknown)=>{call.operation='update';call.payload=payload;return builder;},
   upsert:(payload:unknown)=>{call.operation='insert';call.payload=payload;return builder;},
   delete:()=>{call.operation='delete';return builder;},
   single:()=>{single=true;return Promise.resolve(result());},
   maybeSingle:()=>{single=true;return Promise.resolve(result());},
   then:<T>(resolve:(value:ReturnType<typeof result>)=>T,reject?:(reason:unknown)=>T)=>Promise.resolve(result()).then(resolve,reject),
  };return builder;
 }
 const db={from,rpc:async(name:string,args:Record<string,unknown>)=>{state.rpcCalls.push({name,args});return {data:state.allowed,error:null};}};
 return {HttpError,apiUser:async()=>{if(!state.authenticated)throw new HttpError(401,'Please sign in again.');return {db,user:{id:state.userId}};}};
});
vi.mock('@/lib/ai/workflows',()=>({
 analyzeJobAI:vi.fn().mockRejectedValue(new Error('Provider unavailable')),
 composeResumeAI:vi.fn().mockRejectedValue(new Error('Provider unavailable')),
 extractFacts:vi.fn().mockRejectedValue(new Error('Provider unavailable')),
 generateFollowups:vi.fn().mockRejectedValue(new Error('Provider unavailable')),
}));

import { GET,POST } from '@/app/api/workspace/route';
import { analyzeJob } from '@/lib/jobs/analyze';
const bob='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const factId='11111111-1111-4111-8111-111111111111';
const jobId='22222222-2222-4222-8222-222222222222';
function request(payload:unknown,origin='https://matchcv.example'){
 return new Request('https://matchcv.example/api/workspace',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(payload)});
}
const confirmed={id:factId,user_id:state.userId,statement:'Managed energy infrastructure projects with a budget of PLN 20 million.',fact_type:'experience',verification_status:'user_confirmed',source_type:'manual',excluded:false,confidential:false};
const ad='Senior Project Manager\nRequirements\nManage energy infrastructure projects.\nCoordinate contractors and project budgets.\nEnglish language required.';
beforeEach(()=>{
 state.authenticated=true;state.allowed=true;state.tables={};state.queries=[];state.rpcCalls=[];
 vi.stubEnv('APP_URL','https://matchcv.example');
});

describe('workspace server route integration with unavailable AI and an owner-scoped database double',()=>{
 it('analyzes and persists an advertisement, requirements and evidence using the allowed ai rate-limit operation',async()=>{
  state.tables.career_facts=[{...confirmed}];
  const response=await POST(request({action:'analyzeJob',text:ad,language:'en'}));
  expect(response.status).toBe(200);
  const body=await response.json();
  expect(body.warning).toMatch(/AI unavailable/);
  expect(body.analysis.requirements.length).toBeGreaterThan(0);
  expect(state.tables.job_offers).toHaveLength(1);
  expect(state.tables.job_offers[0]).toMatchObject({user_id:state.userId,original_text:ad});
  expect(state.tables.job_requirements.length).toBeGreaterThan(0);
  expect(state.tables.job_requirements.every(r=>r.user_id===state.userId)).toBe(true);
  expect(state.rpcCalls).toEqual([{name:'consume_rate_limit',args:{operation:'ai',max_requests:10,window_seconds:3600}}]);
  expect(state.queries.filter(q=>q.table==='career_facts').every(q=>q.filters.some(([key,value])=>key==='user_id'&&value===state.userId))).toBe(true);
 });
 it('generates an evidence-grounded fallback CV, excluding another owner and unconfirmed facts',async()=>{
  state.tables.career_facts=[{...confirmed},{...confirmed,id:crypto.randomUUID(),fact_type:'identity',statement:'Alex Morgan'},{...confirmed,id:crypto.randomUUID(),user_id:bob,statement:'Other account secret'}, {...confirmed,id:crypto.randomUUID(),verification_status:'imported_unconfirmed',statement:'Unconfirmed skill'}];
  state.tables.job_offers=[{id:jobId,user_id:state.userId,analysis:analyzeJob(ad,'en')}];
  const response=await POST(request({action:'generate',jobId,language:'en',template:'modern_studio',mode:'basic'}));
  expect(response.status).toBe(200);
  expect((await response.json()).warning).toMatch(/Prosty szkic/);
  const cv=state.tables.cv_versions[0];
  expect(cv).toMatchObject({user_id:state.userId,approved:false,template:'modern_studio'});
  const serialized=JSON.stringify(cv.content);
  expect(serialized).toContain(confirmed.statement);
  expect(serialized).not.toContain('Other account secret');
  expect(serialized).not.toContain('Unconfirmed skill');
  expect(state.rpcCalls[0].args.operation).toBe('generate');
  expect(state.queries.find(q=>q.table==='job_offers')?.filters).toEqual(expect.arrayContaining([['id',jobId],['user_id',state.userId]]));
 });
 it('does not create a CV when professional AI editing fails, and keeps source data',async()=>{
  state.tables.career_facts=[{...confirmed},{...confirmed,id:crypto.randomUUID(),fact_type:'identity',statement:'Alex Morgan'}];
  state.tables.job_offers=[{id:jobId,user_id:state.userId,analysis:analyzeJob(ad,'en')}];
  const response=await POST(request({action:'generate',jobId,language:'en',template:'modern_studio'}));
  expect(response.status).toBe(503);expect(state.tables.cv_versions).toBeUndefined();expect(state.tables.career_facts).toHaveLength(2);
 });
 it('returns 404 for another owner’s job and never creates a CV',async()=>{
  state.tables.job_offers=[{id:jobId,user_id:bob,analysis:analyzeJob(ad,'en')}];
  const response=await POST(request({action:'generate',jobId,language:'en',template:'executive_clarity'}));
  expect(response.status).toBe(404);
  expect(state.tables.cv_versions).toBeUndefined();
 });
 it('refuses generation without confirmed public evidence',async()=>{
  state.tables.job_offers=[{id:jobId,user_id:state.userId,analysis:analyzeJob(ad,'en')}];
  state.tables.career_facts=[{...confirmed,confidential:true}];
  const response=await POST(request({action:'generate',jobId,language:'pl',template:'executive_clarity'}));
  expect(response.status).toBe(400);
  expect(state.tables.cv_versions).toBeUndefined();
 });
 it('GET computes imported-question coverage and evidence only from owned records',async()=>{
  state.tables.career_profiles=[{id:crypto.randomUUID(),user_id:state.userId}];
  state.tables.career_facts=[{...confirmed,source_type:'import',structured_value:{question_coverage:[{question_id:'MCV-Q001',coverage:'full'},{question_id:'MCV-Q010',coverage:'partial'}],coverage_confirmed:true}},{...confirmed,id:crypto.randomUUID(),source_type:'import',excluded:true,structured_value:{question_coverage:[{question_id:'MCV-Q040',coverage:'full'}],coverage_confirmed:true}},{...confirmed,id:crypto.randomUUID(),user_id:bob,statement:'Private other account'}];
  state.tables.job_offers=[{id:jobId,user_id:state.userId,analysis:analyzeJob(ad,'en')}];
  const response=await GET();
  expect(response.status).toBe(200);
  expect(response.headers.get('cache-control')).toBe('no-store');
  const body=await response.json();
  expect(body.profile.covered_question_ids).toEqual(['MCV-Q001']);
  expect(body.facts).toHaveLength(2);
  expect(body.jobs[0].evidence.length).toBeGreaterThan(0);
  expect(state.queries.every(q=>q.filters.some(([key,value])=>key==='user_id'&&value===state.userId))).toBe(true);
 });
 it('stops expensive work at the persistent rate limiter without losing existing data',async()=>{
  state.allowed=false;state.tables.career_facts=[{...confirmed}];
  const response=await POST(request({action:'analyzeJob',text:ad}));
  expect(response.status).toBe(429);
  expect(state.tables.job_offers).toBeUndefined();
  expect(state.tables.career_facts).toHaveLength(1);
 });
 it('rejects cross-origin writes before authentication/database work',async()=>{
  const response=await POST(request({action:'analyzeJob',text:ad},'https://attacker.example'));
  expect(response.status).toBe(403);
  expect(state.queries).toHaveLength(0);expect(state.rpcCalls).toHaveLength(0);
 });
 it('requires authentication for reads and writes',async()=>{
  state.authenticated=false;
  expect((await GET()).status).toBe(401);
  expect((await POST(request({action:'analyzeJob',text:ad}))).status).toBe(401);
  expect(state.queries).toHaveLength(0);
 });
});
