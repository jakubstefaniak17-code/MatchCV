import {NextResponse} from 'next/server';
import {apiUser,HttpError} from '@/lib/auth/server';
import {fail,check,sameOrigin} from '@/lib/auth/http';
import {rows,rateLimit} from '@/lib/db/repository';
import {extractDocument,fallbackFacts,MAX_UPLOAD_BYTES} from '@/lib/documents/import';
import {parseResume} from '@/lib/ai/workflows';
import {createHash} from 'node:crypto';
export const runtime='nodejs';
export const maxDuration=60;
export async function POST(request:Request){try{
 sameOrigin(request);const {user,db}=await apiUser();await rateLimit(db,'import');
 if(Number(request.headers.get('content-length')||0)>MAX_UPLOAD_BYTES+100000)throw new HttpError(413,'Maximum upload size is 5 MB.');
 const form=await request.formData();const file=form.get('file');if(!(file instanceof File)||file.size>MAX_UPLOAD_BYTES)throw new HttpError(400,'Upload a PDF or DOCX up to 5 MB.');
 const buffer=Buffer.from(await file.arrayBuffer());let text;try{text=await extractDocument({name:file.name,type:file.type,buffer});}catch(error){throw new HttpError(400,error instanceof Error?error.message:'Document could not be read.');}
 const hash=createHash('sha256').update(buffer).digest('hex');const {data:duplicate,error:dupError}=await db.from('fact_sources').select('id').eq('user_id',user.id).eq('content_hash',hash).limit(1);check(dupError);if(duplicate?.length)throw new HttpError(409,'This document has already been imported. Review the existing facts.');
 const path=`${user.id}/imports/${crypto.randomUUID()}.${file.name.toLowerCase().endsWith('.pdf')?'pdf':'docx'}`;
 let extracted;let warning:string|null=null;
 try{extracted=(await parseResume(text,{onUsage:async event=>{const {error}=await db.from('ai_usage_events').insert({...event,user_id:user.id,provider:'openai-compatible',status:event.status==='failure'?'error':'success'});if(error)console.warn('Usage event could not be saved',error.code);}})).facts;}catch{extracted=fallbackFacts(text);warning='AI unavailable. Document lines were imported for manual classification and review.';}
 const existing=await rows(db,'career_facts',user.id);const seen=new Set(existing.map(f=>f.statement.trim().toLowerCase()));const fresh=extracted.filter(f=>{const key=f.statement.trim().toLowerCase();if(seen.has(key))return false;seen.add(key);return true;});
 if(!fresh.length)return NextResponse.json({ok:true,count:0,warning:'No new facts found. Existing facts were not changed.'});
 const {error:uploadError}=await db.storage.from('career-documents').upload(path,buffer,{contentType:file.type,upsert:false});check(uploadError);
 const {data:facts,error}=await db.from('career_facts').insert(fresh.map(f=>({user_id:user.id,statement:f.statement,fact_type:f.fact_type,source_type:'import',source_reference:path,verification_status:'imported_unconfirmed',structured_value:{source_quote:f.source_quote,related_question_ids:f.related_question_ids}}))).select();
 if(error){await db.storage.from('career-documents').remove([path]);check(error);}
 const {error:sourceError}=await db.from('fact_sources').insert((facts||[]).map((f,i)=>({user_id:user.id,fact_id:f.id,source_type:'import',source_reference:file.name.slice(0,200),storage_path:path,content_hash:hash,original_excerpt:fresh[i].source_quote})));check(sourceError);
 return NextResponse.json({ok:true,count:facts?.length||0,facts,warning});
 }catch(error){return fail(error);}}
