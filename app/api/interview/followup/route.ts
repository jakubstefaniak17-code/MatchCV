import {NextResponse} from 'next/server';
import {z} from 'zod';
import {apiUser,HttpError} from '@/lib/auth/server';
import {body,fail,check,sameOrigin} from '@/lib/auth/http';
import {rateLimit} from '@/lib/db/repository';
import {answerFromRow} from '@/lib/interview/repository';
import {deterministicFollowUps} from '@/lib/interview/engine';
import {interviewQuestions} from '@/data/interview-questions';
export async function POST(request:Request){try{sameOrigin(request);const {db,user}=await apiUser();const input=z.object({questionId:z.string()}).parse(await body(request));if(!interviewQuestions.some(q=>q.id===input.questionId))throw new HttpError(400,'Nieznane pytanie.');await rateLimit(db,'ai');const {data,error}=await db.from('interview_answers').select('*').eq('user_id',user.id).eq('question_id',input.questionId).maybeSingle();check(error);if(!data)throw new HttpError(400,'Najpierw zapisz odpowiedź.');return NextResponse.json({questions:deterministicFollowUps(input.questionId,answerFromRow(data)),mode:'product-kit-rules'});}catch(error){return fail(error);}}
