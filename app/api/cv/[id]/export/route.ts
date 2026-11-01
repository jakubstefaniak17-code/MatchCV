import {applyExclusions} from '@/lib/career/provenance';
import {NextResponse} from 'next/server';
import {z} from 'zod';
import {apiUser,HttpError} from '@/lib/auth/server';
import {fail,check} from '@/lib/auth/http';
import {ownedRow,rows,rateLimit} from '@/lib/db/repository';
import {normalizeLegacyResume,factSchema,validateResume} from '@/lib/resume/engine';
import {exportDocx,exportPdf} from '@/lib/documents/export';
import {createHash} from 'node:crypto';
export const runtime='nodejs';
export async function GET(request:Request,{params}:{params:Promise<{id:string}>}){try{
 const {user,db}=await apiUser();const {id}=await params;z.string().uuid().parse(id);await rateLimit(db,'export');
 const format=z.enum(['pdf','docx']).parse(new URL(request.url).searchParams.get('format'));
 const cv=await ownedRow(db,'cv_versions',id,user.id);if(!cv.approved)throw new HttpError(400,'Approve and save your CV before exporting.');
 const resume=normalizeLegacyResume(cv.content);const facts=(await rows(db,'career_facts',user.id)).map(f=>factSchema.parse(f));const profiles=await rows(db,'career_profiles',user.id);const result=validateResume(resume,applyExclusions(facts,profiles[0]?.excluded_details),{approvedEditorialClaims:resume.generation?.editorialApprovals});if(!result.valid)throw new HttpError(409,'Career evidence changed. Review and save the CV again before exporting.');
 const output=format==='pdf'?await exportPdf(resume):await exportDocx(resume);const bytes=Buffer.from(output);const hash=createHash('sha256').update(bytes).digest('hex');const path=`${user.id}/generated/${id}/${hash}.${format}`;const mime=format==='pdf'?'application/pdf':'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
 const {error}=await db.storage.from('career-documents').upload(path,bytes,{contentType:mime,upsert:true});check(error);
 const {error:recordError}=await db.from('generated_documents').insert({user_id:user.id,cv_version_id:id,storage_path:path,format,content_hash:hash,byte_size:bytes.length});check(recordError);
 return new NextResponse(bytes,{headers:{'Content-Type':mime,'Content-Disposition':`attachment; filename="MatchCV-${id}.${format}"`,'Cache-Control':'private, no-store'}});
 }catch(error){return fail(error);}}
