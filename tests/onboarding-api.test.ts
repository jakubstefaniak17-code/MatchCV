import {beforeEach,describe,expect,it,vi} from 'vitest';
const state=vi.hoisted(()=>({authenticated:true,userId:'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa',tables:{} as Record<string,Record<string,unknown>[]>,readError:null as {message:string}|null,rpcError:null as {code:string;message:string}|null,rpcData:null as unknown,rpcCalls:[] as {name:string;args:Record<string,unknown>}[],reads:[] as {table:string;filters:[string,unknown][]}[]}));
vi.mock('@/lib/auth/server',()=>{
 class HttpError extends Error{constructor(public status:number,message:string){super(message);}}
 const db={from:(table:string)=>{
  const call={table,filters:[] as [string,unknown][]};state.reads.push(call);let single=false;
  const result=()=>{const found=(state.tables[table]||[]).filter(row=>call.filters.every(([key,value])=>row[key]===value));return {data:single?(found[0]??null):found,error:state.readError};};
  const b={select:()=>b,eq:(key:string,value:unknown)=>{call.filters.push([key,value]);return b;},order:()=>b,range:()=>b,maybeSingle:()=>{single=true;return Promise.resolve(result());},then:<T>(resolve:(value:ReturnType<typeof result>)=>T,reject?:(reason:unknown)=>T)=>Promise.resolve(result()).then(resolve,reject)};return b;
 },rpc:async(name:string,args:Record<string,unknown>)=>{state.rpcCalls.push({name,args});return {data:state.rpcData,error:state.rpcError};}};
 return {HttpError,apiUser:async()=>{if(!state.authenticated)throw new HttpError(401,'Sign in');return {db,user:{id:state.userId}};}};
});
import {GET,POST} from '@/app/api/onboarding/route';
import {assessCareerReadiness,selectSetupQuestions} from '@/lib/onboarding/readiness';
import {needsOnboarding,setupDestination} from '@/lib/onboarding/status';
const identity={firstName:'Alicja',lastName:'Testowa',targetRole:'Project Manager',language:'pl',email:'',phone:'',location:'',publishIdentity:false,publishContact:false};
const progress={user_id:state.userId,onboarding_version:'1.0.0',path:null,status:'not_started',current_step:1,completed_steps:[],selected_question_ids:[],version:0,identity,import_status:'not_started',legacy_supplement:false,started_at:null,completed_at:null,created_at:'2026-11-01T12:00:00.000Z',updated_at:'2026-11-01T12:00:00.000Z'};
const fact=(kind:string,extra:Record<string,unknown>={})=>({id:crypto.randomUUID(),user_id:state.userId,fact_type:kind,statement:'Synthetic source evidence',verification_status:'user_confirmed',excluded:false,confidential:false,private:false,forbidden_for_cv:false,...extra});
const req=(body:unknown,origin='https://matchcv.example')=>new Request('https://matchcv.example/api/onboarding',{method:'POST',headers:{origin,'content-type':'application/json'},body:JSON.stringify(body)});
beforeEach(()=>{state.authenticated=true;state.readError=null;state.rpcError=null;state.rpcCalls=[];state.reads=[];state.rpcData={...progress,version:1,status:'in_progress'};state.tables={onboarding_progress:[{...progress}]};vi.stubEnv('APP_URL','https://matchcv.example');});
describe('onboarding server routes and truthful readiness',()=>{
 it('returns stored owner progress and concrete missing evidence without invented quality scores',async()=>{
  const response=await GET();expect(response.status).toBe(200);expect(response.headers.get('cache-control')).toBe('private, no-store');
  const body=await response.json();expect(body.progress.version).toBe(0);expect(body.readiness.canGenerate).toBe(false);expect(body.readiness.gaps).toHaveLength(2);expect(body.questionIds).toHaveLength(5);
  expect(state.reads.every(q=>q.filters.some(([key,value])=>key==='user_id'&&value===state.userId))).toBe(true);
 });
 it('never interprets a database outage or missing state as a new account',async()=>{
  state.readError={message:'internal secret database failure'};const failure=await GET();expect(failure.status).toBe(503);expect(JSON.stringify(await failure.json())).not.toContain('internal secret');
  state.readError=null;state.tables.onboarding_progress=[];const missing=await GET();expect(missing.status).toBe(503);expect(state.rpcCalls).toHaveLength(0);
 });
 it('saves only through the authenticated versioned RPC and accepts partial step1 drafts',async()=>{
  const response=await POST(req({action:'save',expectedVersion:0,currentStep:1,identity:{...identity,lastName:'',targetRole:''}}));expect(response.status).toBe(200);
  expect(state.rpcCalls[0]).toMatchObject({name:'save_onboarding_progress',args:{expected_version:0,finalize:false,changes:{currentStep:1,identity:{...identity,lastName:'',targetRole:''}}}});
  expect(state.rpcCalls[0].args).not.toHaveProperty('user_id');
 });
 it('maps atomic stale writes to 409 and preserves the clients draft for retry',async()=>{
  state.rpcError={code:'40001',message:'private internals'};const response=await POST(req({action:'save',expectedVersion:0,currentStep:1}));expect(response.status).toBe(409);expect((await response.json()).error).toMatch(/innym oknie/);
 });
 it('validates ownership-shaped input and cannot accept client-forged completion',async()=>{
  expect((await POST(req({action:'save',expectedVersion:0,currentStep:1,user_id:'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb'}))).status).toBe(400);
  expect((await POST(req({action:'save',currentStep:1}))).status).toBe(400);expect(state.rpcCalls).toHaveLength(0);
  state.rpcError={code:'23514',message:'Review setup steps'};expect((await POST(req({action:'complete',expectedVersion:0}))).status).toBe(400);
 });
 it('does not equate wizard completion with CV readiness',async()=>{
  state.rpcData={...progress,status:'completed',version:7,current_step:5,completed_steps:[1,2,3,4,5],completed_at:'2026-11-01T12:00:00.000Z'};
  const response=await POST(req({action:'complete',expectedVersion:6}));const body=await response.json();expect(response.status).toBe(200);expect(body.progress.status).toBe('completed');expect(body.readiness.ready).toBe(false);expect(body.questionIds).toEqual([]);
 });
 it('retains the finite saved question selection after answering and skipping',async()=>{
  state.tables.onboarding_progress=[{...progress,current_step:4,status:'in_progress',selected_question_ids:['MCV-Q009','MCV-Q006','MCV-Q013']}];
  state.tables.interview_answers=[{user_id:state.userId,question_id:'MCV-Q009',status:'answered'},{user_id:state.userId,question_id:'MCV-Q006',status:'skipped'}];
  const response=await GET();expect((await response.json()).questionIds).toEqual(['MCV-Q009','MCV-Q006','MCV-Q013']);
 });
 it('requires authentication and protects writes against cross-origin requests',async()=>{
  state.authenticated=false;expect((await GET()).status).toBe(401);expect((await POST(req({action:'complete',expectedVersion:0}))).status).toBe(401);
  state.authenticated=true;expect((await POST(req({action:'complete',expectedVersion:0},'https://attacker.example'))).status).toBe(403);expect(state.rpcCalls).toHaveLength(0);
 });
 it('requires separately publishable confirmed identity and career evidence for generation',()=>{
  expect(assessCareerReadiness([fact('identity',{excluded:true}),fact('experience')]).canGenerate).toBe(false);
  expect(assessCareerReadiness([fact('identity'),fact('experience',{verification_status:'user_provided'})]).canGenerate).toBe(false);
  expect(assessCareerReadiness([fact('identity'),fact('project',{private:true})]).canGenerate).toBe(false);
  expect(assessCareerReadiness([fact('identity'),fact('education')])).toMatchObject({ready:true,canGenerate:true,publishableFacts:2});
 });
 it('selects only useful unanswered public questions and honors reviewed coverage',()=>{
  const facts=[fact('experience',{source_type:'import',structured_value:{coverage_confirmed:true,question_coverage:[{question_id:'MCV-Q009',coverage:'full'}]}})];
  const ids=selectSetupQuestions(facts,[{question_id:'MCV-Q006',status:'answered'},{question_id:'MCV-Q013',status:'skipped'}]);
  expect(ids).not.toContain('MCV-Q009');expect(ids).not.toContain('MCV-Q006');expect(ids).not.toContain('MCV-Q013');expect(ids.length).toBeLessThanOrEqual(5);
 });
 it('redirect helpers preserve already-completed accounts and resume the saved step',()=>{
  expect(needsOnboarding({status:'completed'})).toBe(false);expect(needsOnboarding({status:'in_progress'})).toBe(true);
  expect(setupDestination({status:'not_started',current_step:1})).toBe('/welcome');expect(setupDestination({status:'in_progress',current_step:3})).toBe('/setup/3');
 });
});
