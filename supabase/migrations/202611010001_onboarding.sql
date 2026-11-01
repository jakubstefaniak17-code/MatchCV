-- Career Setup 1.0. Private setup state is authoritative in PostgreSQL.
begin;
alter table public.profiles add column first_name text not null default '', add column last_name text not null default '';
alter table public.career_profiles add column preferred_cv_language text not null default 'pl' check(preferred_cv_language in ('pl','en'));
create table public.onboarding_progress(
  user_id uuid primary key references auth.users(id) on delete cascade,
  onboarding_version text not null default '1.0.0',
  path text check(path in ('cv','interview')),
  status text not null default 'not_started' check(status in ('not_started','in_progress','completed')),
  current_step integer not null default 1 check(current_step between 1 and 5),
  completed_steps integer[] not null default '{}',
  selected_question_ids text[] not null default '{}' check(cardinality(selected_question_ids)<=5),
  version integer not null default 0 check(version>=0),
  identity jsonb not null default '{}'::jsonb check(jsonb_typeof(identity)='object'),
  import_status text not null default 'not_started' check(import_status in ('not_started','succeeded','failed','skipped')),
  legacy_supplement boolean not null default false,
  started_at timestamptz,completed_at timestamptz,
  created_at timestamptz not null default now(),updated_at timestamptz not null default now(),
  check(completed_steps<@array[1,2,3,4,5]),
  check((status='completed')=(completed_at is not null))
);
alter table public.onboarding_progress enable row level security;
alter table public.onboarding_progress force row level security;
-- CAS cannot be bypassed through ordinary table writes. Only the RPC writes state.
revoke all on public.onboarding_progress from anon,authenticated;
grant select on public.onboarding_progress to authenticated;
create policy onboarding_owner_read on public.onboarding_progress for select to authenticated using((select auth.uid())=user_id);
create trigger updated_at before update on public.onboarding_progress for each row execute function public.set_updated_at();

-- Existing history is never erased or made inaccessible by a new mandatory flow.
-- completed_steps remains empty: these users have not actually taken the wizard.
insert into public.onboarding_progress(user_id,status,current_step,completed_at,legacy_supplement)
select u.id,
 case when h.has_history then 'completed' else 'not_started' end,
 case when h.has_history then 5 else 1 end,
 case when h.has_history then now() else null end,h.has_history
from auth.users u cross join lateral(
 select exists(select 1 from public.career_facts f where f.user_id=u.id)
 or exists(select 1 from public.work_experiences e where e.user_id=u.id)
 or exists(select 1 from public.education e where e.user_id=u.id)
 or exists(select 1 from public.projects p where p.user_id=u.id)
 or exists(select 1 from public.achievements a where a.user_id=u.id)
 or exists(select 1 from public.skills s where s.user_id=u.id)
 or exists(select 1 from public.certifications c where c.user_id=u.id)
 or exists(select 1 from public.languages l where l.user_id=u.id)
 or exists(select 1 from public.cv_versions c where c.user_id=u.id)
 or exists(select 1 from public.interview_answers a where a.user_id=u.id and a.status in ('answered','draft','needs_review') and length(trim(a.answer))>0)
 or exists(select 1 from public.career_profiles p where p.user_id=u.id and (length(trim(p.professional_summary))>0 or length(trim(p.professional_headline))>0)) as has_history
) h on conflict(user_id) do nothing;

create function public.initialize_onboarding() returns trigger language plpgsql security definer set search_path=public,pg_temp as $$
begin insert into public.onboarding_progress(user_id) values(new.id) on conflict(user_id) do nothing; return new; end $$;
revoke all on function public.initialize_onboarding() from public,anon,authenticated;
create trigger matchcv_initialize_onboarding after insert on auth.users for each row execute function public.initialize_onboarding();

create function public.save_onboarding_progress(expected_version integer,changes jsonb,finalize boolean default false)
returns public.onboarding_progress language plpgsql security definer set search_path=public,pg_temp as $$
declare uid uuid:=auth.uid(); saved public.onboarding_progress; next_identity jsonb; next_path text;
 step_to_complete integer; requested_step integer; completed integer[]; reference text; statement_text text;
 publish boolean; existing_fact public.career_facts; field text; next_import text;
begin
 if uid is null then raise exception 'Authentication required' using errcode='28000'; end if;
 if changes is null or jsonb_typeof(changes)<>'object' then raise exception 'Invalid setup data' using errcode='23514'; end if;
 if exists(select 1 from jsonb_object_keys(changes) k where k not in ('identity','path','currentStep','completeStep','importStatus')) then raise exception 'Unknown setup field' using errcode='23514'; end if;
 insert into public.onboarding_progress(user_id) values(uid) on conflict(user_id) do nothing;
 select * into saved from public.onboarding_progress where user_id=uid for update;
 -- Repeated finalization is safe even when the caller still has the old version.
 if finalize and saved.status='completed' then return saved; end if;
 if expected_version is null or expected_version<>saved.version then raise exception 'A newer setup version is already saved' using errcode='40001'; end if;
 next_identity:=case when changes?'identity' then changes->'identity' else saved.identity end;
 next_path:=coalesce(changes->>'path',saved.path);
 requested_step:=coalesce((changes->>'currentStep')::integer,saved.current_step);
 step_to_complete:=(changes->>'completeStep')::integer;
 next_import:=coalesce(changes->>'importStatus',saved.import_status);
 completed:=saved.completed_steps;
 if next_path is not null and next_path not in ('cv','interview') then raise exception 'Invalid setup path' using errcode='23514'; end if;
 if requested_step not between 1 and 5 or (step_to_complete is not null and step_to_complete not between 1 and 4) then raise exception 'Invalid setup step' using errcode='23514'; end if;
 if next_import not in ('not_started','succeeded','failed','skipped') then raise exception 'Invalid import status' using errcode='23514'; end if;
 if jsonb_typeof(next_identity)<>'object' then raise exception 'Invalid identity' using errcode='23514'; end if;
 if exists(select 1 from jsonb_object_keys(next_identity) k where k not in ('firstName','lastName','targetRole','language','email','phone','location','publishIdentity','publishContact')) then raise exception 'Unknown identity field' using errcode='23514'; end if;
 foreach field in array array['firstName','lastName','targetRole','email','phone','location'] loop
   if next_identity?field and (jsonb_typeof(next_identity->field)<>'string' or length(next_identity->>field)>500) then raise exception 'Invalid identity field' using errcode='23514'; end if;
 end loop;
 if next_identity?'language' and (jsonb_typeof(next_identity->'language')<>'string' or next_identity->>'language' not in ('pl','en')) then raise exception 'Invalid language' using errcode='23514'; end if;
 if (next_identity?'publishIdentity' and jsonb_typeof(next_identity->'publishIdentity') is distinct from 'boolean') or
    (next_identity?'publishContact' and jsonb_typeof(next_identity->'publishContact') is distinct from 'boolean') then raise exception 'Invalid publication choice' using errcode='23514'; end if;
 if step_to_complete=1 or finalize then
   if length(trim(coalesce(next_identity->>'firstName','')))=0 or length(trim(coalesce(next_identity->>'lastName','')))=0 or length(trim(coalesce(next_identity->>'targetRole','')))=0 or coalesce(next_identity->>'language','') not in ('pl','en') then raise exception 'Complete your name, career target and document language' using errcode='23514'; end if;
 end if;
 if (next_import='succeeded' and changes?'importStatus') or (step_to_complete=2 and next_path='cv') then
   if not exists(select 1 from public.career_facts where user_id=uid and source_type='import') then raise exception 'Import a document or choose the interview path' using errcode='23514'; end if;
 end if;
 if step_to_complete is not null then
   if not saved.legacy_supplement and exists(select 1 from generate_series(1,step_to_complete-1) s where not s=any(completed)) then raise exception 'Complete the previous setup step first' using errcode='23514'; end if;
   if step_to_complete>=2 and next_path is null then raise exception 'Choose an import or interview path' using errcode='23514'; end if;
   completed:=array(select distinct s from unnest(completed||step_to_complete) s order by s);
 end if;
 if finalize then
   if not array[1,2,3,4]<@completed then raise exception 'Review the four setup steps before finishing' using errcode='23514'; end if;
   completed:=array[1,2,3,4,5];requested_step:=5;
 elsif saved.status<>'completed' and requested_step>coalesce((select max(s) from unnest(completed) s),0)+1 then
   raise exception 'Complete the previous setup step first' using errcode='23514';
 end if;

 if changes?'identity' then
   update public.profiles set first_name=coalesce(next_identity->>'firstName',''),last_name=coalesce(next_identity->>'lastName',''),
      display_name=trim(coalesce(next_identity->>'firstName','')||' '||coalesce(next_identity->>'lastName','')),locale=coalesce(next_identity->>'language','pl') where user_id=uid;
   update public.career_profiles set preferred_cv_language=coalesce(next_identity->>'language','pl'),
      preferred_positions=case when length(trim(coalesce(next_identity->>'targetRole','')))>0 then array(select distinct x from unnest(preferred_positions||array[next_identity->>'targetRole']) x) else preferred_positions end where user_id=uid;
   -- Identity is not silently published or treated as a verified career claim.
   foreach reference in array array['onboarding:identity','onboarding:contact'] loop
     statement_text:=case when reference='onboarding:identity' then trim(coalesce(next_identity->>'firstName','')||' '||coalesce(next_identity->>'lastName',''))
       else concat_ws(' · ',nullif(trim(next_identity->>'email'),''),nullif(trim(next_identity->>'phone'),''),nullif(trim(next_identity->>'location'),'')) end;
     publish:=coalesce((next_identity->>case when reference='onboarding:identity' then 'publishIdentity' else 'publishContact' end)::boolean,false);
     select * into existing_fact from public.career_facts where user_id=uid and source_type='manual' and source_reference=reference order by created_at limit 1 for update;
     if found then
       update public.career_facts set statement=case when statement_text='' then statement else statement_text end,
         excluded=not publish or statement_text='',
         verification_status=case when statement_text=statement then verification_status else 'user_provided' end,
         confirmed_at=case when statement_text=statement then confirmed_at else null end,
         structured_value=coalesce(structured_value,'{}'::jsonb)||case when reference='onboarding:identity' then jsonb_build_object('first_name',next_identity->>'firstName','last_name',next_identity->>'lastName') else jsonb_build_object('email',next_identity->>'email','phone',next_identity->>'phone','location',next_identity->>'location') end
       where id=existing_fact.id and user_id=uid;
     elsif statement_text<>'' then
       insert into public.career_facts(user_id,fact_type,statement,source_type,source_reference,verification_status,excluded,structured_value)
       values(uid,case when reference='onboarding:identity' then 'identity' else 'contact' end,statement_text,'manual',reference,'user_provided',not publish,
          case when reference='onboarding:identity' then jsonb_build_object('first_name',next_identity->>'firstName','last_name',next_identity->>'lastName') else jsonb_build_object('email',next_identity->>'email','phone',next_identity->>'phone','location',next_identity->>'location') end);
     end if;
   end loop;
 end if;
 if requested_step>=4 and saved.current_step<4 then
   saved.selected_question_ids:=array(
     select q.id from public.interview_questions q
     where q.id=any(array['MCV-Q009','MCV-Q006','MCV-Q013','MCV-Q025','MCV-Q008','MCV-Q010','MCV-Q014','MCV-Q027'])
       and q.active and q.metadata->>'storage_visibility'<>'private_only'
       and not exists(select 1 from public.interview_answers a where a.user_id=uid and a.question_id=q.id and a.status in ('answered','skipped'))
       and not exists(select 1 from public.career_facts f cross join lateral jsonb_array_elements(coalesce(f.structured_value->'question_coverage','[]'::jsonb)) c
         where f.user_id=uid and f.source_type='import' and f.verification_status in ('user_confirmed','document_supported')
           and not f.excluded and not f.confidential and not f.private and not f.forbidden_for_cv
           and f.structured_value->>'coverage_confirmed'='true' and c->>'question_id'=q.id and c->>'coverage'='full')
     order by array_position(array['MCV-Q009','MCV-Q006','MCV-Q013','MCV-Q025','MCV-Q008','MCV-Q010','MCV-Q014','MCV-Q027'],q.id)
     limit 5
   );
 end if;
 update public.onboarding_progress set identity=next_identity,path=next_path,current_step=requested_step,completed_steps=completed,
   selected_question_ids=saved.selected_question_ids,
   import_status=case when next_path='interview' and next_import='not_started' then 'skipped' else next_import end,
   status=case when finalize or saved.status='completed' then 'completed' else 'in_progress' end,
   started_at=coalesce(started_at,now()),completed_at=case when finalize then coalesce(completed_at,now()) else completed_at end,
   version=version+1 where user_id=uid returning * into saved;
 return saved;
end $$;
revoke all on function public.save_onboarding_progress(integer,jsonb,boolean) from public,anon;
grant execute on function public.save_onboarding_progress(integer,jsonb,boolean) to authenticated;
commit;
