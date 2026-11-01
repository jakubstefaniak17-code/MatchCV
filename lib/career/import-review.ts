import type {SupabaseClient} from '@supabase/supabase-js';
import {entityName,entitySchemas} from './schemas';
import {HttpError} from '@/lib/auth/server';
import {check} from '@/lib/auth/http';
/** A reviewed import creates a separate entity, never silently merges an employer/project. */
export async function materializeReviewedImport(db:SupabaseClient,userId:string,original:Record<string,unknown>,statement:string){
 const structured={...(original.structured_value as Record<string,unknown>||{})};
 if(original.source_type!=='import'||statement!==original.statement||!structured.proposed_entity)return {structured,sourceReference:original.source_reference};
 const proposal=structured.proposed_entity as {entity?:unknown;data?:unknown};const type=entityName.safeParse(proposal.entity);
 if(!type.success)throw new HttpError(400,'Sprawdź proponowany rodzaj doświadczenia przed zatwierdzeniem.');
 const parsed=entitySchemas[type.data].safeParse(proposal.data);if(!parsed.success)throw new HttpError(400,'Propozycja zawiera niepoprawne dane. Popraw historię kariery przed zatwierdzeniem.');
 const id=String(original.id);const {data:existing,error:readError}=await db.from(type.data).select('*').eq('id',id).eq('user_id',userId).maybeSingle();check(readError);
 if(!existing){const {error}=await db.from(type.data).insert({...parsed.data,id,user_id:userId});check(error);}else{const {error}=await db.from(type.data).update(parsed.data).eq('id',id).eq('user_id',userId);check(error);}
 return {sourceReference:`${type.data}:${id}`,structured:{...structured,original_source_reference:structured.original_source_reference||original.source_reference,entity_data:parsed.data,entity_reviewed:true}};
}
