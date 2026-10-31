-- Product Kit v1.0: authoritative 40-question bank; legacy data remains addressable.
begin;

alter table public.interview_questions
  add column active boolean not null default true,
  add column metadata jsonb not null default '{}'::jsonb;
alter table public.interview_questions drop constraint interview_questions_id_check;
alter table public.interview_questions add constraint interview_questions_id_check
  check(id ~ '^Q(00[1-9]|0[1-9][0-9])$' or id ~ '^MCV-Q(00[1-9]|0[1-3][0-9]|040)$');
-- Do not delete old questions: interview_answers retains its existing FK and history.
update public.interview_questions set active=false where id ~ '^Q[0-9]{3}$';
create index interview_questions_active_order_idx on public.interview_questions(active,section,id);

alter table public.interview_answers
  add column answer_type text not null default 'long_text',
  add column value_json jsonb,
  add column followup_answers jsonb not null default '[]'::jsonb,
  add column fact_ids uuid[] not null default '{}',
  add column last_edited_at timestamptz;
-- Preserve original text, status and timestamps while establishing a typed legacy value.
alter table public.interview_answers disable trigger updated_at;
update public.interview_answers set
  value_json=case when status='answered' then to_jsonb(answer) else null end,
  last_edited_at=updated_at;
alter table public.interview_answers enable trigger updated_at;
alter table public.interview_answers drop constraint interview_answers_status_check;
alter table public.interview_answers drop constraint interview_answers_check;
alter table public.interview_answers alter column status set default 'unanswered';
alter table public.interview_answers add constraint interview_answers_status_check
  check(status in ('unanswered','draft','answered','skipped','needs_review'));
alter table public.interview_answers add constraint interview_answers_type_check
  check(answer_type in ('long_text','yes_no_with_details','range_with_context'));
alter table public.interview_answers add constraint interview_answers_check
  check(status<>'answered' or length(trim(answer))>0);
alter table public.interview_answers add constraint interview_answers_followups_check
  check(jsonb_typeof(followup_answers)='array' and jsonb_array_length(followup_answers)<=2);

create function public.validate_interview_answer() returns trigger language plpgsql set search_path=public,pg_temp as $$
declare question_type text; value_type text; choice text; lower_amount numeric; upper_amount numeric;
begin
  select answer_type into question_type from public.interview_questions where id=new.question_id;
  if new.question_id like 'MCV-%' and new.answer_type<>question_type then
    raise exception 'Answer type differs from question definition' using errcode='23514';
  end if;
  if tg_op='UPDATE' and old.last_edited_at is not null and new.last_edited_at is not null
     and new.last_edited_at<old.last_edited_at then
    raise exception 'A newer answer is already saved; reload before editing' using errcode='40001';
  end if;
  if exists(select 1 from unnest(new.fact_ids) as f(id)
    where not exists(select 1 from public.career_facts c where c.id=f.id and c.user_id=new.user_id)) then
    raise exception 'Answer references inaccessible evidence' using errcode='23503';
  end if;
  if new.value_json is not null and new.value_json<>'null'::jsonb then
    value_type:=jsonb_typeof(new.value_json);
    if new.answer_type='long_text' and value_type<>'string' then
      raise exception 'Text answer requires a JSON string' using errcode='23514';
    elsif new.answer_type='yes_no_with_details' then
      if value_type<>'object' then raise exception 'Choice answer requires a JSON object' using errcode='23514'; end if;
      choice:=new.value_json->>'choice';
      if choice is not null and choice not in ('yes','no','unsure') then
        raise exception 'Invalid answer choice' using errcode='23514';
      end if;
      if new.status='answered' and choice is null then
        raise exception 'Answered choice cannot be empty' using errcode='23514';
      end if;
      if jsonb_typeof(new.value_json->'details') not in ('string','null') then
        raise exception 'Choice details must be text' using errcode='23514';
      end if;
    elsif new.answer_type='range_with_context' then
      if value_type<>'object' then raise exception 'Range answer requires a JSON object' using errcode='23514'; end if;
      if jsonb_typeof(new.value_json->'min') not in ('number','null') or jsonb_typeof(new.value_json->'max') not in ('number','null') then
        raise exception 'Range bounds must be numbers' using errcode='23514';
      end if;
      lower_amount:=(new.value_json->>'min')::numeric; upper_amount:=(new.value_json->>'max')::numeric;
      if lower_amount<0 or upper_amount<0 or lower_amount>upper_amount then
        raise exception 'Invalid compensation range' using errcode='23514';
      end if;
    end if;
  elsif new.status='answered' and new.question_id like 'MCV-%' then
    raise exception 'Answered question requires a typed value' using errcode='23514';
  end if;
  return new;
end $$;
create trigger interview_answer_validation before insert or update on public.interview_answers
for each row execute function public.validate_interview_answer();

-- Privacy is a separate invariant from factual confirmation. Confirming a salary
-- answer must never make it eligible for a public CV.
alter table public.career_facts
  add column private boolean not null default false,
  add column forbidden_for_cv boolean not null default false;
create function public.enforce_interview_fact_privacy() returns trigger language plpgsql set search_path=public,pg_temp as $$
begin
  if new.source_type='interview' and exists(select 1 from public.interview_questions q
    where q.id=new.source_reference and q.metadata->>'storage_visibility'='private_only') then
    new.private:=true; new.forbidden_for_cv:=true;
    -- Existing engines also recognize these flags; protect both old and new clients.
    new.confidential:=true; new.excluded:=true;
  end if;
  return new;
end $$;
create trigger interview_fact_privacy before insert or update on public.career_facts
for each row execute function public.enforce_interview_fact_privacy();

-- Rename only template identifiers, preserving claims, order, visibility and all
-- other content. Legacy template names remain mapped by application read helpers.
alter table public.cv_versions drop constraint cv_versions_template_check;
update public.cv_versions set
  template=case when template='technical' then 'modern_studio' else 'executive_clarity' end,
  content=case when jsonb_typeof(content)='object' then jsonb_set(content,'{template}',
    to_jsonb(case when template='technical' then 'modern_studio'::text else 'executive_clarity'::text end),true) else content end;
alter table public.cv_versions alter column template set default 'executive_clarity';
alter table public.cv_versions add constraint cv_versions_template_check
  check(template in ('executive_clarity','modern_studio'));
commit;
