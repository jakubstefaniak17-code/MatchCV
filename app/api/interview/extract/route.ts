import {NextResponse} from 'next/server';
import {z} from 'zod';
import {apiUser,HttpError} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {rateLimit,rows} from '@/lib/db/repository';
import {answerFromRow} from '@/lib/interview/repository';
import {answerAsText} from '@/lib/interview/schema';
import {interviewQuestions} from '@/data/interview-questions';
import {extractFacts} from '@/lib/ai/workflows';
export async function POST(request:Request){try{
 sameOrigin(request);const {db,user}=await apiUser();const {questionId}=z.object({questionId:z.string()}).parse(await body(request));const question=interviewQuestions.find(q=>q.id===questionId);if(!question)throw new HttpError(400,'Nieznane pytanie.');
 // Private answers never enter model prompts or CV facts, even after confirmation.
 if(question.storage_visibility==='private_only')return NextResponse.json({ok:true,count:0,warning:'Ta odpowiedź pozostaje prywatna. Nie jest przekazywana do modelu ani publikowana w CV.'});
 await rateLimit(db,'ai');const {data,error}=await db.from('interview_answers').select('*').eq('user_id',user.id).eq('question_id',questionId).maybeSingle();check(error);if(!data||data.status!=='answered')throw new HttpError(400,'Zapisz i zakończ odpowiedź przed ekstrakcją.');
 const answer=answerFromRow(data);const text=[answerAsText(answer),...answer.followup_answers.map(f=>f.answer)].filter(Boolean).join('\n');let facts;let warning:string|undefined;
 try{facts=(await extractFacts(text,{onUsage:async event=>{const {error}=await db.from('ai_usage_events').insert({...event,user_id:user.id,provider:'openai-compatible',status:event.status==='failure'?'error':'success'});if(error)console.warn('Usage event persistence failed',error.code);}},question)).facts;}catch{facts=[{statement:text.slice(0,4000),fact_type:'other' as const,source_quote:text,related_question_ids:[questionId],information_kind:'declaration' as const}];warning='Usługa analizy jest niedostępna. Odpowiedź dodano jako deklarację do ręcznej weryfikacji.';}
 const existing=await rows(db,'career_facts',user.id);const fresh=facts.filter(f=>!existing.some(e=>e.statement===f.statement&&e.source_reference===questionId));
 if(fresh.length){const {error}=await db.from('career_facts').insert(fresh.map(f=>({user_id:user.id,statement:f.statement,fact_type:f.fact_type,source_type:'interview',source_reference:questionId,verification_status:'user_provided',excluded:true,private:false,forbidden_for_cv:false,structured_value:{source_quote:f.source_quote,information_kind:f.information_kind||'declaration',related_question_ids:[questionId],question_order:question.order,share_in_cv_by_default:false}})));check(error);}
 return NextResponse.json({ok:true,count:fresh.length,warning:warning||'Sprawdź treść w profilu i osobno zdecyduj, które potwierdzone informacje mogą trafić do CV.'});
 }catch(error){return fail(error);}}
