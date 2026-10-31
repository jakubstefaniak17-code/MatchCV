// @vitest-environment jsdom
import {afterEach,beforeEach,describe,expect,it,vi} from 'vitest';
import {act,cleanup,fireEvent,render,screen,waitFor} from '@testing-library/react';
import {createElement} from 'react';
import source from '../data/interview-40.json';
import {interviewQuestions,interviewSections} from '../data/interview-questions';
import {emptyAnswer,interviewAnswerSchema,validateAnswerForQuestion} from '../lib/interview/schema';
import {deterministicFollowUps,getInterviewProgress,getNextQuestion} from '../lib/interview/engine';
import type {InterviewAnswer} from '../lib/interview/types';
const request=vi.hoisted(()=>vi.fn());
vi.mock('@/lib/demo/transport',()=>({workspaceFetch:request,demoPath:(p:string)=>p,isDemo:()=>true}));
vi.mock('next/link',()=>({default:({children,...props}:Record<string,unknown>)=>createElement('a',props,children as never)}));
import {InterviewSectionView} from '../components/interview/interview';
const q=interviewQuestions[0];
function answer(patch:Partial<InterviewAnswer>={}):InterviewAnswer{return {...emptyAnswer(q),status:'answered',value:'Zaprojektowałem proces odbiorów.',...patch};}
afterEach(()=>{cleanup();localStorage.clear();sessionStorage.clear();vi.clearAllMocks();});
describe('Product Kit interview bank and typed answers',()=>{
 it('preserves all supplied metadata, 40 immutable IDs and ten four-question sections',()=>{
  expect(interviewQuestions).toEqual(source.questions);expect(interviewQuestions).toHaveLength(40);expect(interviewSections).toHaveLength(10);
  expect(new Set(interviewQuestions.map(q=>q.id)).size).toBe(40);
  interviewQuestions.forEach((q,index)=>{expect(q.id).toBe(`MCV-Q${String(index+1).padStart(3,'0')}`);expect(q.required).toBe(false);expect(q.share_in_cv_by_default).toBe(false);expect(q.user_can_skip).toBe(true);});
  interviewSections.forEach(s=>expect(interviewQuestions.filter(q=>q.section_id===s.id)).toHaveLength(4));
 });
 it('rejects stale legacy IDs and wrong widget data',()=>{
  expect(()=>validateAnswerForQuestion('Q001',answer())).toThrow();
  expect(()=>validateAnswerForQuestion('MCV-Q022',answer())).toThrow();
  expect(interviewAnswerSchema.safeParse(answer({value:'x'.repeat(5001)})).success).toBe(false);
 });
 it('preserves skips as null unknown rather than false or negative claims',()=>{
  expect(validateAnswerForQuestion(q.id,answer({status:'skipped',value:null})).value).toBe(null);
  expect(interviewAnswerSchema.safeParse(answer({status:'skipped',value:'no'})).success).toBe(false);
  const negative=validateAnswerForQuestion('MCV-Q022',answer({answer_type:'yes_no_with_details',value:{choice:'no',details:null}}));
  expect(negative.status).toBe('answered');expect(negative.value).toEqual({choice:'no',details:null});
 });
 it('allows salary null fields, rejects inverted and invalid numeric ranges',()=>{
  const salary=answer({answer_type:'range_with_context',status:'draft',value:{min:null,max:null,currency:null,period:null,contract_basis:null,negotiability:null}});
  expect(validateAnswerForQuestion('MCV-Q035',salary).value).toEqual(salary.value);
  expect(()=>validateAnswerForQuestion('MCV-Q035',{...salary,value:{...salary.value as object,min:30,max:20}})).toThrow();
  expect(()=>validateAnswerForQuestion('MCV-Q035',{...salary,value:{...salary.value as object,min:-2}})).toThrow();
  expect(interviewQuestions.find(q=>q.id==='MCV-Q035')?.storage_visibility).toBe('private_only');
 });
 it('does not repeat covered questions and counts explicit skips separately',()=>{
  expect(getNextQuestion([],{answeredQuestionIds:['MCV-Q001']})?.id).toBe('MCV-Q002');
  const progress=getInterviewProgress([{question_id:q.id,...answer({status:'skipped',value:null})}],{answeredQuestionIds:['MCV-Q002']});
  expect(progress.answered).toBe(0);expect(progress.skipped).toBe(1);expect(progress.imported).toBe(1);expect(progress.remaining).toBe(38);
 });
 it('offers at most two supplied followups without repeating answered followups',()=>{
  const follows=deterministicFollowUps(q.id,answer());expect(follows).toEqual([q.conditional_followups[0].question_pl]);
  expect(deterministicFollowUps(q.id,answer({followup_answers:[{question:follows[0],answer:'Konkret'}]}))).toEqual([]);
  expect(deterministicFollowUps(q.id,answer(),[q.id])).toEqual([]);
  expect(deterministicFollowUps(q.id,answer({status:'skipped',value:null}))).toEqual([]);
  expect(interviewAnswerSchema.safeParse(answer({followup_answers:Array.from({length:3},(_,i)=>({question:`Pytanie ${i}`,answer:''}))})).success).toBe(false);
 });
});
describe('one-question interview persistence',()=>{
 beforeEach(()=>{request.mockImplementation(async(_path:string,options?:RequestInit)=>options?.method==='POST'?Response.json({ok:true,answer:JSON.parse(String(options.body)).answer}):Response.json({answers:[],coveredQuestionIds:[],userId:'test-user'}));});
 it('autosaves a typed draft after 800ms and shows only one question',async()=>{
  render(createElement(InterviewSectionView,{section:'A'}));
  const input=await screen.findByRole('textbox',{name:q.question_pl});
  expect(screen.queryByRole('heading',{name:interviewQuestions[1].question_pl})).toBeNull();
  fireEvent.change(input,{target:{value:'Historia zachowana automatycznie.'}});
  await waitFor(()=>expect(request.mock.calls.some(([path,options])=>path==='/api/interview'&&options?.method==='POST')).toBe(true),{timeout:1800});
  const post=request.mock.calls.find(([,options])=>options?.method==='POST');
  expect(JSON.parse(post?.[1]?.body).answer).toMatchObject({answer_type:'long_text',status:'draft',value:'Historia zachowana automatycznie.'});
 });

 it('does not replace a newer edit when an older autosave finishes',async()=>{
  let resolveFirst:((response:Response)=>void)|undefined;let posts=0;
  request.mockImplementation(async(_path:string,options?:RequestInit)=>{
   if(options?.method!=='POST')return Response.json({answers:[],coveredQuestionIds:[],userId:'test-user'});
   posts++;if(posts===1)return new Promise<Response>(resolve=>{resolveFirst=resolve;});
   return Response.json({ok:true,answer:JSON.parse(String(options.body)).answer});
  });
  render(createElement(InterviewSectionView,{section:'A'}));const input=await screen.findByRole('textbox',{name:q.question_pl});
  fireEvent.change(input,{target:{value:'Pierwsza wersja.'}});
  await waitFor(()=>expect(posts).toBe(1),{timeout:1800});
  fireEvent.change(input,{target:{value:'Nowsza wersja, której nie wolno utracić.'}});
  await act(async()=>{resolveFirst?.(Response.json({ok:true,answer:answer({status:'draft',value:'Pierwsza wersja.'})}));});
  await waitFor(()=>expect(posts).toBe(2));
  expect((input as HTMLTextAreaElement).value).toBe('Nowsza wersja, której nie wolno utracić.');
  const calls=request.mock.calls.filter(([,options])=>options?.method==='POST');
  expect(JSON.parse(calls[1][1].body).answer.value).toBe('Nowsza wersja, której nie wolno utracić.');
 });
 it('restores a newer local draft after a failed request and remount',async()=>{
  localStorage.setItem('matchcv-interview-40-draft:test-user:MCV-Q001',JSON.stringify(answer({status:'draft',value:'Odzyskany lokalny szkic.',last_edited_at:new Date().toISOString()})));
  request.mockImplementation(async(_path:string,options?:RequestInit)=>options?.method==='POST'?Response.json({error:'Offline'},{status:503}):Response.json({answers:[],coveredQuestionIds:[],userId:'test-user'}));
  const first=render(createElement(InterviewSectionView,{section:'A'}));
  await waitFor(()=>expect((screen.getByRole('textbox',{name:q.question_pl}) as HTMLTextAreaElement).value).toBe('Odzyskany lokalny szkic.'));
  fireEvent.change(screen.getByRole('textbox',{name:q.question_pl}),{target:{value:'Edytowany szkic bez utraty tekstu.'}});first.unmount();
  render(createElement(InterviewSectionView,{section:'A'}));
  await waitFor(()=>expect((screen.getByRole('textbox',{name:q.question_pl}) as HTMLTextAreaElement).value).toBe('Edytowany szkic bez utraty tekstu.'));
 });
});
