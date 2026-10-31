import {NextResponse} from 'next/server';
import {z} from 'zod';
import {apiUser,HttpError} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {rows} from '@/lib/db/repository';
import {validateAnswerForQuestion,answerAsText} from '@/lib/interview/schema';
import {answerFromRow} from '@/lib/interview/repository';
import {importCoverage,parsedFacts} from '@/lib/career/provenance';
export async function GET(){try{const {db,user}=await apiUser();const [saved,facts]=await Promise.all([rows(db,'interview_answers',user.id),rows(db,'career_facts',user.id)]);return NextResponse.json({userId:user.id,answers:saved.filter(a=>String(a.question_id).startsWith('MCV-')).map(a=>({question_id:a.question_id,...answerFromRow(a)})),...importCoverage(parsedFacts(facts))},{headers:{'Cache-Control':'private, no-store'}});}catch(error){return fail(error);}}
export async function POST(request:Request){try{
 sameOrigin(request);const {db,user}=await apiUser();const input=z.object({questionId:z.string().regex(/^MCV-Q\d{3}$/),answer:z.unknown()}).parse(await body(request));
 let answer;try{answer=validateAnswerForQuestion(input.questionId,input.answer);}catch{throw new HttpError(400,'Sprawdź format odpowiedzi. Możesz zapisać szkic lub pominąć pytanie.');}
 if(!answer.last_edited_at)throw new HttpError(400,'Brakuje daty edycji. Odśwież formularz.');
 if(answer.fact_ids.length){const owned=new Set((await rows(db,'career_facts',user.id)).map(f=>f.id));if(answer.fact_ids.some(id=>!owned.has(id)))throw new HttpError(400,'Odpowiedź wskazuje niedostępny fakt.');}
 const {error}=await db.from('interview_answers').upsert({user_id:user.id,question_id:input.questionId,answer_type:answer.answer_type,status:answer.status,answer:answerAsText(answer),value_json:answer.value,followup_answers:answer.followup_answers,fact_ids:answer.fact_ids,last_edited_at:answer.last_edited_at},{onConflict:'user_id,question_id'});
 if(error?.code==='40001')throw new HttpError(409,'Nowsza odpowiedź jest już zapisana. Zachowaj szkic i odśwież ten ekran, zanim nadpiszesz dane.');check(error);
 return NextResponse.json({ok:true,answer});
 }catch(error){return fail(error);}}
