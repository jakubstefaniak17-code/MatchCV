import {PGlite} from '@electric-sql/pglite';
import {readFile,readdir} from 'node:fs/promises';
import {afterAll,beforeAll,describe,expect,it} from 'vitest';
const legacy='aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const fresh='bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const other='cccccccc-cccc-4ccc-8ccc-cccccccccccc';
let db:PGlite;
type Progress={user_id:string;status:string;version:number;current_step:number;completed_steps:number[];selected_question_ids:string[];legacy_supplement:boolean;identity:Record<string,unknown>};
async function asUser(userId:string){await db.exec(`reset role;set request.jwt.claim.sub='${userId}';set role authenticated;`);}
async function save(version:number,changes:Record<string,unknown>,finalize=false){return (await db.query<Progress>('select * from save_onboarding_progress($1,$2::jsonb,$3)',[version,JSON.stringify(changes),finalize])).rows[0];}
const identity={firstName:'Alicja',lastName:'Testowa',targetRole:'Project Manager',language:'pl',email:'synthetic@example.test',phone:'',location:'Warszawa',publishIdentity:false,publishContact:false};
beforeAll(async()=>{
 db=new PGlite();
 await db.exec(`create role anon nologin;create role authenticated nologin;create schema auth;create schema storage;
 create table auth.users(id uuid primary key,raw_user_meta_data jsonb default '{}');
 create function auth.uid() returns uuid language sql stable as $$select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid$$;
 create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
 create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);alter table storage.objects enable row level security;
 create function storage.foldername(text) returns text[] language sql immutable as $$select string_to_array($1,'/')$$;
 grant usage on schema public,auth,storage to anon,authenticated;grant select,insert,update,delete on storage.objects to authenticated;`);
 for(const name of (await readdir('supabase/migrations')).filter(n=>n.endsWith('.sql')).sort()){
  if(name==='202611010001_onboarding.sql')await db.exec(`insert into auth.users(id) values('${legacy}'),('${fresh}');insert into career_facts(user_id,fact_type,statement,source_type) values('${legacy}','experience','Existing synthetic career history','manual');`);
  await db.exec((await readFile(`supabase/migrations/${name}`,'utf8')).replace('create extension if not exists pgcrypto;',''));
 }
 await db.exec(await readFile('supabase/seed.sql','utf8'));
 await db.exec(`insert into auth.users(id) values('${other}')`);
},60000);
afterAll(async()=>{if(db)await db.close();});
describe('Career Setup PostgreSQL persistence, CAS and migration',()=>{
 it('preserves existing career users and marks only their setup as supplementary',async()=>{
  await asUser(legacy);
  const rows=await db.query<Progress>('select * from onboarding_progress');
  expect(rows.rows).toHaveLength(1);expect(rows.rows[0]).toMatchObject({user_id:legacy,status:'completed',legacy_supplement:true,completed_steps:[]});
  const facts=await db.query('select * from career_facts');expect(facts.rows).toHaveLength(1);
 });
 it('backfills empty users and initializes new auth accounts without pretending completion',async()=>{
  for(const userId of [fresh,other]){await asUser(userId);const rows=await db.query<Progress>('select * from onboarding_progress');expect(rows.rows).toHaveLength(1);expect(rows.rows[0]).toMatchObject({user_id:userId,status:'not_started',version:0,current_step:1,legacy_supplement:false});}
 });
 it('uses owner read policies and denies direct authenticated status/version manipulation',async()=>{
  await asUser(fresh);
  const row=await db.query('select * from onboarding_progress where user_id=$1',[legacy]);expect(row.rows).toHaveLength(0);
  await expect(db.exec(`update onboarding_progress set status='completed',completed_at=now()`)).rejects.toThrow(/permission denied/i);
  await expect(db.exec(`insert into onboarding_progress(user_id) values('${legacy}')`)).rejects.toThrow(/permission denied/i);
 });
 it('autosaves partial identity drafts atomically with private profile and unconfirmed canonical facts',async()=>{
  await asUser(fresh);
  const saved=await save(0,{currentStep:1,identity:{...identity,lastName:'',targetRole:''}});
  expect(saved).toMatchObject({version:1,status:'in_progress',current_step:1});
  const profile=await db.query<{first_name:string;last_name:string}>('select first_name,last_name from profiles');expect(profile.rows[0]).toEqual({first_name:'Alicja',last_name:''});
  const facts=await db.query<{verification_status:string;excluded:boolean}>('select verification_status,excluded from career_facts');
  expect(facts.rows.length).toBeGreaterThan(0);expect(facts.rows.every(f=>f.verification_status==='user_provided'&&f.excluded)).toBe(true);
  await expect(save(1,{currentStep:2,completeStep:1,identity:{...identity,lastName:''}})).rejects.toThrow(/Complete your name/i);
 });
 it('rejects stale versions, invalid consent and skipped sequencing without losing saved state',async()=>{
  await asUser(fresh);
  await expect(save(0,{currentStep:1,identity})).rejects.toThrow(/newer setup version/i);
  await expect(save(1,{currentStep:4})).rejects.toThrow(/previous setup step/i);
  await expect(save(1,{currentStep:1,identity:{...identity,publishIdentity:null}})).rejects.toThrow(/publication choice/i);
  const rows=await db.query<Progress>('select * from onboarding_progress');expect(rows.rows[0].version).toBe(1);
 });
 it('separates publication choice from factual confirmation and checks a real import',async()=>{
  await asUser(fresh);
  const saved=await save(1,{currentStep:2,completeStep:1,path:'cv',identity:{...identity,publishIdentity:true}});expect(saved.version).toBe(2);
  const facts=await db.query<{verification_status:string;excluded:boolean}>('select verification_status,excluded from career_facts where fact_type=\'identity\'');expect(facts.rows[0]).toEqual({verification_status:'user_provided',excluded:false});
  await expect(save(2,{currentStep:3,completeStep:2,importStatus:'succeeded'})).rejects.toThrow(/Import a document/i);
  await expect(save(2,{},true)).rejects.toThrow(/four setup steps/i);
 });
 it('finishes the interview path without fake readiness and persists a finite question set across refreshes',async()=>{
  await asUser(fresh);
  const step2=await save(2,{currentStep:3,completeStep:2,path:'interview'});expect(step2.version).toBe(3);
  const step3=await save(3,{currentStep:4,completeStep:3});expect(step3.selected_question_ids).toHaveLength(5);
  const ids=step3.selected_question_ids;
  await db.query(`insert into interview_answers(user_id,question_id,answer_type,status,answer,value_json,last_edited_at) values($1,$2,'long_text','skipped','',null,now())`,[fresh,ids[0]]);
  const resaved=await save(4,{currentStep:4});expect(resaved.selected_question_ids).toEqual(ids);
  const step4=await save(5,{currentStep:5,completeStep:4});expect(step4.completed_steps).toEqual([1,2,3,4]);
  const done=await save(6,{},true);expect(done).toMatchObject({status:'completed',version:7,completed_steps:[1,2,3,4,5]});
  const repeat=await save(6,{},true);expect(repeat.version).toBe(7);
  // Completion is a process state; no fact was silently promoted to verified.
  const verified=await db.query(`select * from career_facts where verification_status='user_confirmed'`);expect(verified.rows).toHaveLength(0);
 });
 it('allows only one concurrent save for the same expected version',async()=>{
  await asUser(other);
  const result=await Promise.allSettled([save(0,{currentStep:1,identity}),save(0,{currentStep:1,identity:{...identity,firstName:'Druga'}})]);
  expect(result.filter(r=>r.status==='fulfilled')).toHaveLength(1);expect(result.filter(r=>r.status==='rejected')).toHaveLength(1);
  const persisted=await db.query<Progress>('select * from onboarding_progress');expect(persisted.rows[0].version).toBe(1);
 });
 it('cannot call setup persistence anonymously and cascades deletion of setup state',async()=>{
  await db.exec('reset role;set role anon;');await expect(save(0,{currentStep:1})).rejects.toThrow(/permission denied/i);
  await db.exec('reset role;');await db.query('delete from auth.users where id=$1',[other]);
  const rows=await db.query('select * from onboarding_progress where user_id=$1',[other]);expect(rows.rows).toHaveLength(0);
 });
});
