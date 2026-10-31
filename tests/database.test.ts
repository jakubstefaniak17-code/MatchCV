import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile,readdir } from 'node:fs/promises';
import interviewBank from '../data/interview-40.json';

// Real embedded PostgreSQL executes the production SQL. Only Supabase-owned
// auth/storage schemas are mocked, and pgcrypto's extension declaration removed
// because gen_random_uuid is built into PostgreSQL. This is not a live Supabase test.
const alice = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const bob = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
let db: PGlite;
async function asUser(id: string) {
  await db.exec(`reset role; set request.jwt.claim.sub = '${id}'; set role authenticated;`);
}
async function asAdmin() { await db.exec('reset role;'); }

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth; create schema storage;
    create table auth.users(id uuid primary key, raw_user_meta_data jsonb default '{}');
    create function auth.uid() returns uuid language sql stable as
      $$ select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid $$;
    create table storage.buckets(id text primary key,name text,public boolean,file_size_limit bigint,allowed_mime_types text[]);
    create table storage.objects(id uuid primary key default gen_random_uuid(),bucket_id text,name text);
    alter table storage.objects enable row level security;
    create function storage.foldername(text) returns text[] language sql immutable as
      $$ select string_to_array($1,'/') $$;
    grant usage on schema auth,storage,public to anon,authenticated;
    grant execute on function auth.uid() to anon,authenticated;
    grant select,insert,update,delete on storage.objects to authenticated;
  `);
  const migrations=(await readdir('supabase/migrations')).filter(f=>f.endsWith('.sql')).sort();
  for(const file of migrations){
    const migration=await readFile(`supabase/migrations/${file}`,'utf8');
    await db.exec(migration.replace('create extension if not exists pgcrypto;',''));
    if(file==='202610310001_core.sql'){
      // Upgrade fixture: all 99 old question IDs, an answer, linked fact and CVs.
      await db.exec(`insert into auth.users(id) values ('${alice}'),('${bob}');
        insert into interview_questions(id,section,pl,en,why,extraction_instructions)
        select 'Q'||lpad(n::text,3,'0'),chr(65+(n-1)/9),'Legacy '||n,'Legacy '||n,'Legacy purpose','Legacy extraction' from generate_series(1,99) n;
        insert into interview_answers(user_id,question_id,answer,status) values('${alice}','Q099','Legacy answer must survive','answered');
        insert into career_facts(user_id,fact_type,statement,source_type,source_reference) values('${alice}','experience','Legacy fact must survive','interview','Q099');
        insert into cv_versions(user_id,title,template,content) values
          ('${bob}','Legacy executive','professional','{"template":"professional","sections":[{"id":"kept","hidden":true,"claims":[{"text":"Preserved claim"}]}]}'),
          ('${bob}','Legacy technical','technical','{"template":"technical","sections":[{"id":"original-order"}]}');`);
    }
  }
  const seed = await readFile('supabase/seed.sql','utf8');
  await db.exec(seed);
  await db.exec(seed);
}, 60000);

afterAll(async () => { if (db) await db.close(); });

describe('production PostgreSQL migrations and tenant policies (embedded)', () => {
  it('upgrades safely and seeds exactly the authoritative 40 active questions', async () => {
    await asAdmin();
    const r = await db.query<{count:number}>(`select count(*)::int as count from interview_questions where active`);
    expect(r.rows[0].count).toBe(40);
    const sections = await db.query<{count:number}>(`select count(*)::int as count from interview_questions where active group by section`);
    expect(sections.rows).toHaveLength(10);
    expect(sections.rows.every(s=>s.count===4)).toBe(true);
    const metadata=await db.query<{metadata:unknown}>(`select metadata from interview_questions where active order by id`);
    expect(metadata.rows.map(r=>r.metadata)).toEqual(interviewBank.questions);
    const legacy=await db.query<{count:number}>(`select count(*)::int as count from interview_questions where not active`);
    expect(legacy.rows[0].count).toBe(99);
    const answer=await db.query<{answer:string;value_json:string}>(`select answer,value_json from interview_answers where question_id='Q099'`);
    expect(answer.rows[0]).toMatchObject({answer:'Legacy answer must survive',value_json:'Legacy answer must survive'});
    const facts=await db.query(`select * from career_facts where statement='Legacy fact must survive'`);
    expect(facts.rows).toHaveLength(1);
  });
  it('maps old templates without changing content, order or visibility',async()=>{
    await asAdmin();
    const rows=await db.query<{title:string;template:string;content:{template:string;sections:unknown[]}}>(`select title,template,content from cv_versions where title like 'Legacy%' order by title`);
    expect(rows.rows[0]).toMatchObject({title:'Legacy executive',template:'executive_clarity',content:{template:'executive_clarity',sections:[{id:'kept',hidden:true,claims:[{text:'Preserved claim'}]}]}});
    expect(rows.rows[1]).toMatchObject({title:'Legacy technical',template:'modern_studio',content:{template:'modern_studio',sections:[{id:'original-order'}]}});
    await expect(db.exec(`insert into cv_versions(user_id,title,template) values('${alice}','Old template','technical')`)).rejects.toThrow(/check constraint/i);
  });
  it('persists draft, choice and range answers while rejecting invalid shapes and stale saves',async()=>{
    await asUser(alice);
    await db.exec(`insert into interview_answers(user_id,question_id,answer_type,status,answer,value_json,last_edited_at) values
      ('${alice}','MCV-Q001','long_text','draft','','""','2026-10-31T10:00:00Z'),
      ('${alice}','MCV-Q022','yes_no_with_details','answered','Nie','{"choice":"no","details":null}','2026-10-31T10:00:00Z'),
      ('${alice}','MCV-Q035','range_with_context','answered','PLN 10000–15000','{"min":10000,"max":15000,"currency":"PLN","period":"month","contract_basis":"UoP_brutto","negotiability":null}','2026-10-31T10:00:00Z');`);
    await expect(db.exec(`update interview_answers set value_json='{"choice":"invalid"}' where user_id='${alice}' and question_id='MCV-Q022'`)).rejects.toThrow(/Invalid answer choice/i);
    await expect(db.exec(`update interview_answers set value_json='{"min":20000,"max":15000}' where user_id='${alice}' and question_id='MCV-Q035'`)).rejects.toThrow(/Invalid compensation range/i);
    await expect(db.exec(`update interview_answers set last_edited_at='2026-10-31T09:59:00Z' where user_id='${alice}' and question_id='MCV-Q001'`)).rejects.toThrow(/newer answer/i);
    await expect(db.exec(`update interview_answers set answer_type='long_text' where user_id='${alice}' and question_id='MCV-Q035'`)).rejects.toThrow(/type differs/i);
    await expect(db.exec(`update interview_answers set followup_answers='[{"question":"1","answer":"1"},{"question":"2","answer":"2"},{"question":"3","answer":"3"}]' where user_id='${alice}' and question_id='MCV-Q001'`)).rejects.toThrow(/check constraint/i);
    await asUser(bob);
    const rows=await db.query(`select * from interview_answers where question_id like 'MCV-%'`);
    expect(rows.rows).toHaveLength(0);
  });
  it('keeps private-only interview facts forbidden even after confirmation or attempted flag clearing',async()=>{
    await asUser(alice);
    const facts=await db.query<{id:string;private:boolean;forbidden_for_cv:boolean;confidential:boolean;excluded:boolean}>(`insert into career_facts(user_id,fact_type,statement,source_type,source_reference,verification_status,confirmed_at) values('${alice}','other','Synthetic compensation expectation','interview','MCV-Q035','user_confirmed',now()) returning id,private,forbidden_for_cv,confidential,excluded`);
    expect(facts.rows[0]).toMatchObject({private:true,forbidden_for_cv:true,confidential:true,excluded:true});
    const updated=await db.query<{private:boolean;forbidden_for_cv:boolean}>(`update career_facts set private=false,forbidden_for_cv=false,excluded=false,confidential=false where id='${facts.rows[0].id}' returning private,forbidden_for_cv`);
    expect(updated.rows[0]).toEqual({private:true,forbidden_for_cv:true});
  });
  it('auth trigger initializes profiles and every user table has forced RLS', async () => {
    await asAdmin();
    const profiles = await db.query<{count:number}>(`select count(*)::int as count from profiles`);
    expect(profiles.rows[0].count).toBe(2);
    const r = await db.query<{relname:string;relrowsecurity:boolean;relforcerowsecurity:boolean}>(`select relname,relrowsecurity,relforcerowsecurity from pg_class c join pg_namespace n on c.relnamespace=n.oid where n.nspname='public' and c.relkind='r'`);
    expect(r.rows).toHaveLength(23);
    expect(r.rows.every(t=>t.relrowsecurity)).toBe(true);
    expect(r.rows.filter(t=>t.relname!=='rate_limit_windows').every(t=>t.relforcerowsecurity)).toBe(true);
  });
  it('cannot select, update or create rows owned by another account', async () => {
    await asUser(alice);
    const own = await db.query<{user_id:string}>(`select user_id from career_profiles`);
    expect(own.rows.map(r=>r.user_id)).toEqual([alice]);
    const changed = await db.query(`update career_profiles set professional_headline='stolen' where user_id='${bob}' returning id`);
    expect(changed.rows).toHaveLength(0);
    await expect(db.exec(`insert into career_facts(user_id,fact_type,statement,source_type) values('${bob}','skill','forged','manual')`)).rejects.toThrow(/row-level security/i);
    await expect(db.exec(`update career_profiles set user_id='${bob}' where user_id='${alice}'`)).rejects.toThrow();
  });
  it('rejects cross-owner links through composite foreign keys', async () => {
    await asUser(bob);
    const parent = await db.query<{id:string}>(`insert into work_experiences(user_id,employer,position) values('${bob}','Synthetic Company','Manager') returning id`);
    await asUser(alice);
    await expect(db.exec(`insert into projects(user_id,experience_id,title) values('${alice}','${parent.rows[0].id}','Invalid link')`)).rejects.toThrow(/foreign key/i);
  });
  it('keeps questions immutable and skipped answers distinct from negative answers', async () => {
    await asUser(alice);
    await expect(db.exec(`update interview_questions set en='malicious' where id='Q001'`)).rejects.toThrow(/permission denied/i);
    await db.exec(`insert into interview_answers(user_id,question_id,status,answer) values('${alice}','Q001','skipped','')`);
    await expect(db.exec(`insert into interview_answers(user_id,question_id,status,answer) values('${alice}','Q002','answered','')`)).rejects.toThrow(/check constraint/i);
    await asUser(bob);
    const answers = await db.query(`select * from interview_answers`);
    expect(answers.rows).toHaveLength(0);
  });
  it('requires a confirmation timestamp and owned section evidence', async () => {
    await asUser(alice);
    await expect(db.exec(`insert into career_facts(user_id,fact_type,statement,source_type,verification_status) values('${alice}','skill','SQL','manual','user_confirmed')`)).rejects.toThrow(/check constraint/i);
    await asUser(bob);
    const fact=await db.query<{id:string}>(`insert into career_facts(user_id,fact_type,statement,source_type) values('${bob}','skill','SQL','manual') returning id`);
    await asUser(alice);
    const cv=await db.query<{id:string}>(`insert into cv_versions(user_id,title) values('${alice}','Owned CV') returning id`);
    await expect(db.exec(`insert into cv_sections(user_id,cv_version_id,section_type,title,supporting_fact_ids) values('${alice}','${cv.rows[0].id}','skills','Skills',array['${fact.rows[0].id}']::uuid[])`)).rejects.toThrow(/inaccessible evidence/i);
  });
  it('enforces private storage path access and prevents moving objects across owners', async () => {
    await asUser(alice);
    await db.exec(`insert into storage.objects(bucket_id,name) values('career-documents','${alice}/imports/test.pdf')`);
    await expect(db.exec(`insert into storage.objects(bucket_id,name) values('career-documents','${bob}/imports/forged.pdf')`)).rejects.toThrow(/row-level security/i);
    await expect(db.exec(`update storage.objects set name='${bob}/imports/stolen.pdf'`)).rejects.toThrow(/row-level security/i);
    await asUser(bob);
    const r=await db.query(`select * from storage.objects`);
    expect(r.rows).toHaveLength(0);
  });
  it('rate limiter cannot be bypassed with high allowances or alternate window arguments', async () => {
    await asUser(alice);
    for(let i=0;i<10;i++) {
      const r=await db.query<{allowed:boolean}>(`select consume_rate_limit('ai',9999,${3600+i}) as allowed`);
      expect(r.rows[0].allowed).toBe(true);
    }
    const denied=await db.query<{allowed:boolean}>(`select consume_rate_limit('ai',999999,999999) as allowed`);
    expect(denied.rows[0].allowed).toBe(false);
    await expect(db.exec(`delete from rate_limit_windows`)).rejects.toThrow(/permission denied/i);
    await asUser(bob);
    const own=await db.query<{allowed:boolean}>(`select consume_rate_limit('ai') as allowed`);
    expect(own.rows[0].allowed).toBe(true);
  });
  it('serializes concurrent rate-limit increments without over-allowing', async () => {
    await asUser(alice);
    const attempts=await Promise.all(Array.from({length:16},()=>db.query<{allowed:boolean}>(`select consume_rate_limit('import') as allowed`)));
    expect(attempts.filter(r=>r.rows[0].allowed)).toHaveLength(10);
    expect(attempts.filter(r=>!r.rows[0].allowed)).toHaveLength(6);
  });
  it('anonymous role cannot read private tables', async () => {
    await asAdmin();
    await db.exec('set role anon;');
    await expect(db.query('select * from career_facts')).rejects.toThrow(/permission denied/i);
    await asAdmin();
  });
  it('auth deletion cascades relational rows, retaining the other account', async () => {
    await asAdmin();
    await db.exec(`delete from auth.users where id='${alice}'`);
    const rows=await db.query<{count:number}>(`select count(*)::int as count from profiles`);
    expect(rows.rows[0].count).toBe(1);
    const answers=await db.query(`select * from interview_answers where user_id='${alice}'`);
    expect(answers.rows).toHaveLength(0);
    const cvs=await db.query(`select * from cv_versions where user_id='${alice}'`);
    expect(cvs.rows).toHaveLength(0);
  });
});
