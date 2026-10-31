import type {InterviewAnswer} from './types';
import {emptyAnswer} from './schema';
import {interviewQuestions} from '@/data/interview-questions';
export function answerFromRow(row:Record<string,unknown>):InterviewAnswer{
 const question=interviewQuestions.find(q=>q.id===row.question_id);
 const empty=question?emptyAnswer(question):{answer_type:'long_text' as const,status:'unanswered' as const,value:null,followup_answers:[],fact_ids:[],last_edited_at:null};
 return {...empty,answer_type:(row.answer_type||empty.answer_type) as InterviewAnswer['answer_type'],status:row.status as InterviewAnswer['status'],value:(row.value_json??(row.status==='answered'?row.answer:null)) as InterviewAnswer['value'],followup_answers:(row.followup_answers||[]) as InterviewAnswer['followup_answers'],fact_ids:(row.fact_ids||[]) as string[],last_edited_at:typeof row.last_edited_at==='string'?row.last_edited_at:null};
}
