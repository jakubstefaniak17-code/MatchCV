import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { PGlite } from '@electric-sql/pglite';
import { readFile } from 'node:fs/promises';

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
  const migration = await readFile('supabase/migrations/202610310001_core.sql','utf8');
  await db.exec(migration.replace('create extension if not exists pgcrypto;',''));
  const seed = await readFile('supabase/seed.sql','utf8');
  await db.exec(seed);
  await db.exec(seed);
  await db.exec(`insert into auth.users(id) values ('${alice}'),('${bob}');`);
}, 60000);

afterAll(async () => { if (db) await db.close(); });

describe('production PostgreSQL migrations and tenant policies (embedded)', () => {
  it('applies migration and idempotent seed with exactly 99 questions', async () => {
    await asAdmin();
    const r = await db.query<{count:number}>(`select count(*)::int as count from interview_questions`);
    expect(r.rows[0].count).toBe(99);
    const sections = await db.query<{count:number}>(`select count(*)::int as count from interview_questions group by section`);
    expect(sections.rows).toHaveLength(11);
    expect(sections.rows.every(s=>s.count===9)).toBe(true);
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
