-- MatchCV v0.3. Apply through Supabase migrations, never from a browser.
begin;
create extension if not exists pgcrypto;

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null default '', locale text not null default 'pl' check (locale in ('pl','en')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
  constraint profiles_same_owner check(id=user_id)
);

create table public.career_profiles (
  id uuid primary key default gen_random_uuid(), user_id uuid not null unique references auth.users(id) on delete cascade,
  professional_headline text not null default '', professional_summary text not null default '',
  career_objectives text not null default '', preferred_industries text[] not null default '{}',
  preferred_positions text[] not null default '{}', seniority text, employment_preferences text[] not null default '{}',
  location_preferences text[] not null default '{}', salary_expectations jsonb, excluded_details text[] not null default '{}',
  covered_question_ids text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);

create table public.work_experiences (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  employer text not null check(length(trim(employer))>0), position text not null, employment_type text,
  start_date date, end_date date, location text, department text, responsibility_scope text,
  team_structure text, management_responsibilities text, tools text[] not null default '{}', industry text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  check(end_date is null or start_date is null or end_date>=start_date)
);

create table public.projects (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid, title text not null, organization text, description text, industry text, project_type text,
  budget numeric(20,2) check(budget>=0), currency text check(currency ~ '^[A-Z]{3}$'), team_size integer check(team_size>=0),
  start_date date, end_date date, duration text, role text, responsibilities text[], technologies text[],
  deliverables text[], results text[], challenges text, stakeholders text[], confidential boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(experience_id,user_id) references public.work_experiences(id,user_id) on delete cascade,
  check(end_date is null or start_date is null or end_date>=start_date)
);

create table public.achievements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  project_id uuid, experience_id uuid, description text not null, context text, contribution text,
  measurable_outcome numeric, measurement_unit text, supporting_evidence text, confidence_level text not null default 'unconfirmed'
    check(confidence_level in ('unconfirmed','low','medium','high')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(project_id,user_id) references public.projects(id,user_id) on delete cascade,
  foreign key(experience_id,user_id) references public.work_experiences(id,user_id) on delete cascade
);

create table public.skills (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, category text, proficiency text, years_experience numeric(5,1) check(years_experience>=0),
  verification_status text not null default 'imported_unconfirmed' check(verification_status in
    ('imported_unconfirmed','user_provided','user_confirmed','document_supported','disputed','rejected')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id), unique(user_id,name)
);
create table public.experience_skills (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  experience_id uuid not null, skill_id uuid not null,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  unique(experience_id,skill_id),
  foreign key(experience_id,user_id) references public.work_experiences(id,user_id) on delete cascade,
  foreign key(skill_id,user_id) references public.skills(id,user_id) on delete cascade
);
create table public.education (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  institution text not null, degree text, field_of_study text, start_date date, end_date date,
  specialization text, academic_achievements text[],
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  check(end_date is null or start_date is null or end_date>=start_date)
);
create table public.certifications (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  name text not null, issuer text, issue_date date, expiration_date date, credential_id text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  check(expiration_date is null or issue_date is null or expiration_date>=issue_date)
);
create table public.languages (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  language text not null, proficiency text not null, certification text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id), unique(user_id,language)
);

create table public.career_facts (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  fact_type text not null, statement text not null check(length(trim(statement)) between 1 and 12000),
  structured_value jsonb, source_type text not null check(source_type in ('import','interview','manual','document','demo')),
  source_reference text, verification_status text not null default 'imported_unconfirmed' check(verification_status in
    ('imported_unconfirmed','user_provided','user_confirmed','document_supported','disputed','rejected')),
  confirmed_at timestamptz, related_experience_id uuid, related_project_id uuid,
  excluded boolean not null default false, confidential boolean not null default false,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(related_experience_id,user_id) references public.work_experiences(id,user_id) on delete cascade,
  foreign key(related_project_id,user_id) references public.projects(id,user_id) on delete cascade,
  check(verification_status <> 'user_confirmed' or confirmed_at is not null)
);
create table public.fact_sources (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  fact_id uuid not null, source_type text not null, source_reference text, storage_path text,
  original_excerpt text, content_hash text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(fact_id,user_id) references public.career_facts(id,user_id) on delete cascade,
  check(storage_path is null or split_part(storage_path,'/',1)=user_id::text)
);

create table public.interview_questions (
  id text primary key check(id ~ '^Q(00[1-9]|0[1-9][0-9])$'), section text not null check(section ~ '^[A-K]$'),
  pl text not null, en text not null, why text not null, answer_type text not null default 'text',
  validation jsonb not null default '{}', optional boolean not null default true,
  entities text[] not null default '{}', competencies text[] not null default '{}',
  extraction_instructions text not null, follow_up_triggers text[] not null default '{}',
  requirement_categories text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table public.interview_sessions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  current_section text not null default 'A' check(current_section ~ '^[A-K]$'),
  status text not null default 'active' check(status in ('active','paused','completed')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.interview_answers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  question_id text not null references public.interview_questions(id) on delete restrict, session_id uuid,
  answer text not null default '' check(length(answer)<=20000),
  status text not null default 'answered' check(status in ('answered','skipped')),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id), unique(user_id,question_id),
  foreign key(session_id,user_id) references public.interview_sessions(id,user_id) on delete cascade,
  check(status='skipped' or length(trim(answer))>0)
);

create table public.job_offers (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  title text not null, employer text, location text, seniority text, source_url text,
  original_text text not null check(length(original_text) between 1 and 100000), analysis jsonb not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.job_requirements (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  job_offer_id uuid not null, statement text not null, category text not null,
  priority text not null default 'mandatory' check(priority in ('mandatory','preferred','responsibility')),
  keywords text[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(job_offer_id,user_id) references public.job_offers(id,user_id) on delete cascade
);
create table public.requirement_evidence (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  requirement_id uuid not null, fact_id uuid,
  status text not null check(status in ('supported','partial','not_established','explicitly_unsupported')),
  proposed_statement text, explanation text,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(requirement_id,user_id) references public.job_requirements(id,user_id) on delete cascade,
  foreign key(fact_id,user_id) references public.career_facts(id,user_id) on delete cascade,
  check(status not in ('supported','partial') or fact_id is not null)
);

create table public.cv_versions (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  job_offer_id uuid, title text not null, language text not null default 'pl' check(language in ('pl','en')),
  template text not null default 'professional' check(template in ('professional','executive','technical')),
  content jsonb not null default '{}', approved boolean not null default false,
  version integer not null default 1 check(version>0), validation_report jsonb,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(job_offer_id,user_id) references public.job_offers(id,user_id) on delete cascade
);
create table public.cv_sections (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  cv_version_id uuid not null, section_type text not null, title text not null, position integer not null default 0 check(position>=0),
  hidden boolean not null default false, content jsonb not null default '{}', supporting_fact_ids uuid[] not null default '{}',
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  unique(cv_version_id,position), foreign key(cv_version_id,user_id) references public.cv_versions(id,user_id) on delete cascade
);
create table public.generated_documents (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  cv_version_id uuid not null, storage_path text not null, format text not null check(format in ('pdf','docx')),
  content_hash text, byte_size bigint check(byte_size>=0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  foreign key(cv_version_id,user_id) references public.cv_versions(id,user_id) on delete cascade,
  check(split_part(storage_path,'/',1)=user_id::text)
);
create table public.ai_usage_events (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null, provider text not null, model text not null, prompt_version text not null,
  input_tokens integer not null default 0 check(input_tokens>=0), output_tokens integer not null default 0 check(output_tokens>=0),
  estimated_cost_usd numeric(14,8) check(estimated_cost_usd>=0), status text not null check(status in ('success','error')),
  error_code text, duration_ms integer check(duration_ms>=0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table public.rate_limit_windows (
  id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade,
  operation text not null, window_start timestamptz not null, request_count integer not null default 0 check(request_count>=0),
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id),
  constraint rate_limit_windows_owner_operation_window_key unique(user_id,operation,window_start)
);

-- A single policy per table covers all CRUD, including ownership changes on UPDATE.
-- Composite FKs prevent creating cross-tenant links even if another UUID is known.
create function public.set_updated_at() returns trigger language plpgsql set search_path=public as $$
begin new.updated_at=now(); return new; end $$;
do $$
declare t text;
begin
  foreach t in array array['profiles','career_profiles','work_experiences','projects','achievements','skills',
    'experience_skills','education','certifications','languages','career_facts','fact_sources','interview_sessions',
    'interview_answers','job_offers','job_requirements','requirement_evidence','cv_versions','cv_sections','generated_documents','ai_usage_events']
  loop
    execute format('alter table public.%I enable row level security',t);
    execute format('alter table public.%I force row level security',t);
    execute format('create policy owner_only on public.%I for all to authenticated using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id)',t);
    execute format('create index %I on public.%I(user_id,created_at desc)',t||'_owner_created_idx',t);
    execute format('create trigger updated_at before update on public.%I for each row execute function public.set_updated_at()',t);
    execute format('revoke all on public.%I from anon',t);
    execute format('grant select,insert,update,delete on public.%I to authenticated',t);
  end loop;
end $$;
alter table public.interview_questions enable row level security;
alter table public.interview_questions force row level security;
create policy authenticated_question_read on public.interview_questions for select to authenticated using(true);
revoke all on public.interview_questions from anon,authenticated;
grant select on public.interview_questions to authenticated;
create trigger updated_at before update on public.interview_questions for each row execute function public.set_updated_at();
alter table public.rate_limit_windows enable row level security;
alter table public.rate_limit_windows force row level security;
-- No direct authenticated policies; mutation is only through the bounded RPC below.
revoke all on public.rate_limit_windows from anon,authenticated;
create index rate_limit_windows_expiration_idx on public.rate_limit_windows(window_start);
create index career_facts_eligible_idx on public.career_facts(user_id,verification_status) where excluded=false and confidential=false;
create index fact_sources_fact_idx on public.fact_sources(fact_id,user_id);
create index job_requirements_job_idx on public.job_requirements(job_offer_id,user_id);
create index requirement_evidence_requirement_idx on public.requirement_evidence(requirement_id,user_id);
create index cv_sections_cv_idx on public.cv_sections(cv_version_id,user_id,position);
create index generated_documents_cv_idx on public.generated_documents(cv_version_id,user_id);

-- UUID arrays cannot have a relational FK, so validate each section evidence reference.
create function public.validate_section_fact_owners() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
  if exists(select 1 from unnest(new.supporting_fact_ids) as f(id)
    where not exists(select 1 from public.career_facts c where c.id=f.id and c.user_id=new.user_id))
  then raise exception 'Section references inaccessible evidence' using errcode='23503'; end if;
  return new;
end $$;
create trigger cv_section_fact_owners before insert or update on public.cv_sections
for each row execute function public.validate_section_fact_owners();

-- SECURITY DEFINER functions use a fixed path and derive ownership from JWT, never an argument.
create function public.consume_rate_limit(operation text,max_requests integer default 10,window_seconds integer default 3600)
returns boolean language plpgsql security definer set search_path=public,pg_temp as $$
declare current_user_id uuid:=auth.uid(); start_at timestamptz; actual_count integer; allowed_max integer; allowed_window integer;
begin
  if current_user_id is null then raise exception 'Authentication required' using errcode='28000'; end if;
  -- Callers cannot weaken server limits by choosing a giant allowance or tiny interval.
  if operation not in ('ai','import','job_fetch','generate','export') then raise exception 'Invalid operation'; end if;
  allowed_max:=least(greatest(max_requests,1),case when operation='export' then 30 else 10 end);
  -- A fixed window prevents callers from evading limits by varying window_seconds.
  allowed_window:=3600;
  start_at:=to_timestamp(floor(extract(epoch from now())/allowed_window)*allowed_window);
  insert into public.rate_limit_windows(user_id,operation,window_start,request_count)
    values(current_user_id,operation,start_at,1)
  on conflict on constraint rate_limit_windows_owner_operation_window_key do update
    set request_count=public.rate_limit_windows.request_count+1,updated_at=now()
  returning request_count into actual_count;
  return actual_count<=allowed_max;
end $$;
revoke all on function public.consume_rate_limit(text,integer,integer) from public,anon;
grant execute on function public.consume_rate_limit(text,integer,integer) to authenticated;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin
  insert into public.profiles(id,user_id,display_name) values(new.id,new.id,left(coalesce(new.raw_user_meta_data->>'display_name',''),200)) on conflict(id) do nothing;
  insert into public.career_profiles(user_id) values(new.id) on conflict(user_id) do nothing;
  return new;
end $$;
revoke all on function public.handle_new_user() from public,anon,authenticated;
create trigger matchcv_new_user after insert on auth.users for each row execute function public.handle_new_user();
-- Existing accounts also receive their base rows when this migration is applied.
insert into public.profiles(id,user_id) select id,id from auth.users on conflict(id) do nothing;
insert into public.career_profiles(user_id) select id from auth.users on conflict(user_id) do nothing;

-- Private, owner-scoped objects. Validate bytes in application code as MIME metadata is untrusted.
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('career-documents','career-documents',false,10485760,array['application/pdf','application/vnd.openxmlformats-officedocument.wordprocessingml.document'])
on conflict(id) do update set public=false,file_size_limit=excluded.file_size_limit,allowed_mime_types=excluded.allowed_mime_types;
create policy matchcv_storage_read on storage.objects for select to authenticated
 using(bucket_id='career-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy matchcv_storage_insert on storage.objects for insert to authenticated
 with check(bucket_id='career-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy matchcv_storage_update on storage.objects for update to authenticated
 using(bucket_id='career-documents' and (storage.foldername(name))[1]=(select auth.uid())::text)
 with check(bucket_id='career-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy matchcv_storage_delete on storage.objects for delete to authenticated
 using(bucket_id='career-documents' and (storage.foldername(name))[1]=(select auth.uid())::text);
commit;
