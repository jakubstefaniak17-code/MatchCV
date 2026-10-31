import { z } from 'zod';
import { interviewQuestions } from '@/data/interview-questions';
import type { InterviewAnswer, InterviewQuestion } from './types';
const yesNo = z.object({choice:z.enum(['yes','no','unsure']).nullable(),details:z.string().max(5000).nullable()}).strict();
const range = z.object({min:z.number().finite().nonnegative().nullable(),max:z.number().finite().nonnegative().nullable(),currency:z.enum(['PLN','EUR','USD','GBP','other']).nullable(),period:z.enum(['month','year','hour']).nullable(),contract_basis:z.enum(['UoP_brutto','B2B_netto_plus_VAT','other']).nullable(),negotiability:z.string().max(5000).nullable()}).strict().refine(v=>v.min===null||v.max===null||v.min<=v.max,{message:'Dolna granica nie może być większa od górnej.'});
const common={status:z.enum(['unanswered','draft','answered','skipped','needs_review']),followup_answers:z.array(z.object({question:z.string().min(1).max(1000),answer:z.string().max(5000)}).strict()).max(2),fact_ids:z.array(z.string().uuid()).max(100),last_edited_at:z.string().datetime().nullable()};
export const interviewAnswerSchema=z.discriminatedUnion('answer_type',[
 z.object({...common,answer_type:z.literal('long_text'),value:z.string().max(5000).nullable()}).strict(),
 z.object({...common,answer_type:z.literal('yes_no_with_details'),value:yesNo.nullable()}).strict(),
 z.object({...common,answer_type:z.literal('range_with_context'),value:range.nullable()}).strict(),
]).superRefine((v,ctx)=>{
 if(v.status==='answered'&&!hasAnswerValue(v))ctx.addIssue({code:'custom',message:'Dodaj odpowiedź, zapisz szkic lub pomiń pytanie.'});
 if(v.status==='skipped'&&(v.value!==null||v.followup_answers.length))ctx.addIssue({code:'custom',message:'Pominięcie oznacza brak odpowiedzi, nie odpowiedź negatywną.'});
});
export function hasAnswerValue(answer:Pick<InterviewAnswer,'answer_type'|'value'>):boolean{
 const value=answer.value;
 if(typeof value==='string')return value.trim().length>0;
 if(!value)return false;
 if('choice'in value)return value.choice!==null;
 return Object.values(value).some(v=>v!==null&&v!=='');
}
export function emptyAnswer(question:InterviewQuestion):InterviewAnswer{return {answer_type:question.answer_type,status:'unanswered',value:null,followup_answers:[],fact_ids:[],last_edited_at:null};}
export function validateAnswerForQuestion(questionId:string,input:unknown):InterviewAnswer{
 const q=interviewQuestions.find(q=>q.id===questionId);
 if(!q)throw new Error('Nieznany identyfikator pytania.');
 const answer=interviewAnswerSchema.parse(input);
 if(answer.answer_type!==q.answer_type)throw new Error('Typ odpowiedzi nie pasuje do pytania.');
 return answer;
}
export function answerAsText(answer:InterviewAnswer):string{
 if(answer.status==='skipped'||answer.status==='unanswered')return '';
 if(typeof answer.value==='string')return answer.value;
 if(answer.value&&'choice'in answer.value)return `${answer.value.choice??''}${answer.value.details?`: ${answer.value.details}`:''}`;
 return answer.value?JSON.stringify(answer.value):'';
}
