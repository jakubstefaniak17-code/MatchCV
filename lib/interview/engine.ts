import { interviewQuestions, type InterviewSectionId } from '@/data/interview-questions';
import type { InterviewAnswer } from './types';
import { answerAsText } from './schema';
export type { InterviewAnswer } from './types';
export type SavedInterviewAnswer=InterviewAnswer&{question_id:string};
export interface InterviewCoverage {answeredQuestionIds?:readonly string[]}
export function getQuestionsForSection(section:string){return interviewQuestions.filter(q=>q.section_id===section.toUpperCase());}
export function getInterviewProgress(answers:readonly SavedInterviewAnswer[],coverage:InterviewCoverage={}){
 const latest=new Map(answers.map(a=>[a.question_id,a]));const covered=new Set(coverage.answeredQuestionIds??[]);
 const count=(status:string)=>interviewQuestions.filter(q=>latest.get(q.id)?.status===status).length;
 const answered=count('answered'),skipped=count('skipped'),draft=count('draft'),needsReview=count('needs_review');
 const imported=interviewQuestions.filter(q=>covered.has(q.id)&&!['answered','skipped'].includes(latest.get(q.id)?.status??'')).length;
 return {total:40,answered,skipped,draft,needsReview,imported,remaining:40-answered-skipped-imported,completionPercent:Math.round((answered+imported)/40*100)};
}
export function getNextQuestion(answers:readonly SavedInterviewAnswer[],coverage:InterviewCoverage={},section?:InterviewSectionId){
 const latest=new Map(answers.map(a=>[a.question_id,a]));const covered=new Set(coverage.answeredQuestionIds??[]);
 return interviewQuestions.find(q=>(!section||q.section_id===section)&&!covered.has(q.id)&&!['answered','skipped'].includes(latest.get(q.id)?.status??''))??null;
}
/** Product Kit conditional followups only; never reask an existing answer or a covered fact. */
export function deterministicFollowUps(questionId:string,answer:InterviewAnswer,coveredQuestionIds:readonly string[]=[]):string[]{
 const q=interviewQuestions.find(q=>q.id===questionId);
 if(!q||q.storage_visibility==='private_only'||coveredQuestionIds.includes(questionId)||answer.status==='skipped'||!answerAsText(answer).trim())return [];
 if(answer.answer_type==='yes_no_with_details'&&answer.value&&typeof answer.value==='object'&&'choice'in answer.value&&answer.value.choice!=='yes')return [];
 const existing=new Set(answer.followup_answers.map(a=>a.question));
 return q.conditional_followups.filter(f=>f.max_occurrences>0&&!existing.has(f.question_pl)).map(f=>f.question_pl).slice(0,Math.max(0,2-answer.followup_answers.length));
}
