import type {SupabaseClient} from '@supabase/supabase-js';
import {check} from '@/lib/auth/http';
import {HttpError} from '@/lib/auth/server';
export const ownedTables=['profiles','career_profiles','work_experiences','projects','achievements','skills','experience_skills','education','certifications','languages','career_facts','fact_sources','interview_answers','interview_sessions','job_offers','job_requirements','requirement_evidence','cv_versions','cv_sections','generated_documents','ai_usage_events'] as const;
export async function rows(db:SupabaseClient,table:string,userId:string){
 const result=[];
 for(let offset=0;;offset+=500){const {data,error}=await db.from(table).select('*').eq('user_id',userId).order('created_at',{ascending:false}).order('id').range(offset,offset+499);check(error);result.push(...(data||[]));if(!data||data.length<500)break;}
 return result;
}

export async function ownedRow(db:SupabaseClient,table:string,id:string,userId:string){const {data,error}=await db.from(table).select('*').eq('id',id).eq('user_id',userId).maybeSingle();check(error);if(!data)throw new HttpError(404,'Record not found.');return data;}
export async function rateLimit(db:SupabaseClient,operation:'ai'|'import'|'job_fetch'|'generate'|'export'){const {data,error}=await db.rpc('consume_rate_limit',{operation,max_requests:10,window_seconds:3600});check(error);if(!data)throw new HttpError(429,'Hourly limit reached. Please try again later.');}
