'use client';
import Link from 'next/link';
import {useCallback,useEffect,useRef,useState} from 'react';
import {ArrowLeft,ArrowRight,Check,LockKeyhole,MessageCircle,SkipForward} from 'lucide-react';
import {interviewQuestions,interviewSections,type InterviewQuestion} from '@/data/interview-questions';
import {workspaceFetch,demoPath,isDemo} from '@/lib/demo/transport';
import {deterministicFollowUps,getInterviewProgress,getNextQuestion,type SavedInterviewAnswer} from '@/lib/interview/engine';
import {emptyAnswer,hasAnswerValue,interviewAnswerSchema} from '@/lib/interview/schema';
import type {InterviewAnswer} from '@/lib/interview/types';

type InterviewState={answers:SavedInterviewAnswer[];coveredQuestionIds:string[];userId?:string;questionContexts?:Record<string,string[]>};
async function api(path:string,payload?:unknown){const response=await workspaceFetch(path,payload?{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)}:{cache:'no-store'});const body=await response.json();if(!response.ok)throw new Error(body.error||'Nie udało się zapisać odpowiedzi.');return body;}
function useInterview(){
 const [data,setData]=useState<InterviewState|null>(null),[error,setError]=useState('');
 const reload=useCallback(async()=>{try{setData(await api('/api/interview'));setError('');}catch(e){setError(e instanceof Error?e.message:'Nie udało się pobrać wywiadu.');}},[]);
 useEffect(()=>{queueMicrotask(()=>void reload());},[reload]);
 const update=useCallback((id:string,answer:InterviewAnswer)=>setData(current=>current?{...current,answers:[...current.answers.filter(a=>a.question_id!==id),{question_id:id,...answer}]}:current),[]);
 return {data,error,reload,update};
}
const labels:Record<InterviewAnswer['status'],string>={unanswered:'Do rozmowy',draft:'Szkic',answered:'Odpowiedziano',skipped:'Pominięto',needs_review:'Do sprawdzenia'};
export function InterviewHome(){
 const state=useInterview();if(!state.data)return <div className="interview-page"><h1>Rozmowa o Twojej karierze</h1><p role="status">{state.error||'Wczytujemy Twój postęp…'}</p>{state.error&&<button onClick={()=>void state.reload()}>Spróbuj ponownie</button>}</div>;
 const progress=getInterviewProgress(state.data.answers,{answeredQuestionIds:state.data.coveredQuestionIds});const next=getNextQuestion(state.data.answers,{answeredQuestionIds:state.data.coveredQuestionIds});
 return <div className="interview-page"><header><p className="eyebrow">Wywiad zawodowy · 40 pytań · 10 obszarów</p><h1>Twoja historia zasługuje na dobrą rozmowę.</h1><p>Odkryj doświadczenia, których nie mieści dotychczasowe CV. Jedno pytanie na raz, we własnym tempie.</p></header><div className="card interview-progress"><div className="row between"><strong>{progress.answered} z 40 odpowiedzi</strong><span>{progress.completionPercent}%</span></div><progress max={40} value={progress.answered+progress.imported} aria-label="Postęp wywiadu"/><p className="helper">{progress.skipped} pominiętych · {progress.imported} pokrytych potwierdzonymi faktami · {progress.draft} szkiców</p>{next?<Link className="button" href={demoPath(`/interview/${next.section_id}`)}><MessageCircle size={18}/> {progress.answered?'Kontynuuj rozmowę':'Rozpocznij rozmowę'}</Link>:<Link className="button" href={demoPath('/profile')}>Sprawdź fakty zawodowe</Link>}</div><p className="notice">Każde pytanie jest opcjonalne. Pominięcie oznacza brak odpowiedzi, nigdy brak kompetencji. Do przygotowania CV nie musisz kończyć wywiadu.</p><div className="interview-section-grid grid">{interviewSections.map(section=>{const questions=interviewQuestions.filter(q=>q.section_id===section.id);const answered=questions.filter(q=>state.data!.answers.some(a=>a.question_id===q.id&&a.status==='answered')).length;return <Link key={section.id} className="card interview-section-card" href={demoPath(`/interview/${section.id}`)}><p className="eyebrow">Obszar {section.id} · {answered}/{questions.length}</p><h2>{section.title_pl}</h2><p>{section.purpose_pl}</p><span className="text-link">Przejdź do rozmowy <ArrowRight size={16}/></span></Link>;})}</div></div>;
}

/** The server is authoritative; a newer local draft survives crashes and failed requests. */
function QuestionEditor({question,initial,scope,covered,onSaved,onNext,onPrevious,hasPrevious,hasNext,context}:{question:InterviewQuestion;initial:InterviewAnswer;scope:string;covered:string[];onSaved:(id:string,a:InterviewAnswer)=>void;onNext:()=>void;onPrevious:()=>void;hasPrevious:boolean;hasNext:boolean;context:string[]}){
 const [answer,setAnswer]=useState(initial),[saveState,setSaveState]=useState('Zapisano'),[error,setError]=useState(''),[feedback,setFeedback]=useState(''),[busy,setBusy]=useState(false),[aiQuestions,setAiQuestions]=useState<string[]>([]);
 const latest=useRef(initial),revision=useRef(0),savedRevision=useRef(0),saving=useRef(false),mounted=useRef(true),timer=useRef<ReturnType<typeof setTimeout>|null>(null),flushRef=useRef<()=>Promise<boolean>>(async()=>true);
 const key=`matchcv-interview-40-draft:${scope}:${question.id}`;
 const localStore=useCallback(()=>scope.startsWith('session:')?sessionStorage:localStorage,[scope]);
 const cache=useCallback((value:InterviewAnswer)=>{try{localStore().setItem(key,JSON.stringify(value));return true;}catch{setError('Nie udało się zachować kopii lokalnej. Pozostaw kartę otwartą do potwierdzenia zapisu.');return false;}},[key,localStore]);
 const flush=useCallback(async():Promise<boolean>=>{
  if(saving.current)return false;if(savedRevision.current>=revision.current)return true;
  saving.current=true;let success=true;
  while(savedRevision.current<revision.current){
   const sentRevision=revision.current,snapshot=latest.current;
   if(mounted.current)setSaveState('Zapisywanie…');
   try{const result=await api('/api/interview',{questionId:question.id,answer:snapshot});savedRevision.current=sentRevision;
    if(sentRevision===revision.current){if(mounted.current){setSaveState(snapshot.status==='draft'?'Szkic zapisany':'Zapisano');setError('');}onSaved(question.id,result.answer||snapshot);try{const cached=localStore().getItem(key);if(cached&&JSON.stringify(JSON.parse(cached))===JSON.stringify(snapshot))localStore().removeItem(key);}catch{/* Inability to remove a backup cannot lose user input. */}}
   }catch(e){success=false;if(mounted.current){setSaveState('Nie zapisano na serwerze');setError(e instanceof Error?e.message:'Zapis nie powiódł się.');}break;}
  }
  saving.current=false;return success;
 },[question.id,onSaved,key,localStore]);
 useEffect(()=>{flushRef.current=flush;},[flush]);
 useEffect(()=>{
  mounted.current=true;
  let cancelled=false;
  queueMicrotask(()=>{
   if(cancelled)return;
   try{
    const raw=localStore().getItem(key);
    if(raw){
     const parsed=interviewAnswerSchema.safeParse(JSON.parse(raw));
     if(parsed.success&&parsed.data.answer_type===question.answer_type){
      const local=parsed.data;
      const serverIsNewer=Boolean(initial.last_edited_at&&(local.last_edited_at??'')<=initial.last_edited_at);
      if(serverIsNewer&&JSON.stringify(local.value)===JSON.stringify(initial.value)&&local.status===initial.status)return;
      latest.current=local;setAnswer(local);revision.current=1;setSaveState('Przywrócono lokalny szkic');
      if(serverIsNewer){setError('Na serwerze jest nowsza wersja odpowiedzi. Zachowaliśmy Twój lokalny szkic do przeglądu. Sprawdź tekst i świadomie zapisz odpowiedź, aby go zastąpić.');}
      else timer.current=setTimeout(()=>void flushRef.current(),800);
     }
    }
   }catch{setError('Nie udało się odczytać lokalnego szkicu. Dane zapisane na serwerze pozostają dostępne.');}
  });
  const saveBeforeLeave=()=>{if(savedRevision.current<revision.current){try{localStore().setItem(key,JSON.stringify(latest.current));}catch{/* Keep the in-memory draft. */}void flushRef.current();}};
  window.addEventListener('pagehide',saveBeforeLeave);
  return ()=>{cancelled=true;mounted.current=false;if(timer.current)clearTimeout(timer.current);window.removeEventListener('pagehide',saveBeforeLeave);saveBeforeLeave();};
 // Each question mounts once; later parent updates must never overwrite unsaved edits.
 // eslint-disable-next-line react-hooks/exhaustive-deps
 },[key]);
 function change(patch:Partial<InterviewAnswer>){const value={...latest.current,...patch,last_edited_at:new Date().toISOString()};latest.current=value;revision.current++;setAnswer(value);setSaveState('Niezapisane zmiany');setFeedback('');cache(value);if(timer.current)clearTimeout(timer.current);timer.current=setTimeout(()=>void flushRef.current(),800);}
 function valueChange(value:InterviewAnswer['value']){change({value,status:'draft',fact_ids:[]});}
 async function complete(skip=false){
  if(!skip&&!hasAnswerValue(latest.current)){setError('Możesz zostawić szkic albo pominąć to pytanie.');return;}
  change(skip?{status:'skipped',value:null,followup_answers:[],fact_ids:[]}:{status:'answered'});
  if(timer.current)clearTimeout(timer.current);const ok=await flushRef.current();if(ok){setFeedback(skip?'Pytanie pominięte. Możesz do niego wrócić.':'Odpowiedź zapisana. Fakty wymagają osobnego sprawdzenia.');if(hasNext)onNext();}
 }
 async function extract(){setBusy(true);setFeedback('');try{if(!await flushRef.current())return;const result=await api('/api/interview/extract',{questionId:question.id});setFeedback(`${result.count} faktów do sprawdzenia. ${result.warning||''}`);}catch(e){setError(e instanceof Error?e.message:'Nie udało się wyodrębnić faktów.');}finally{setBusy(false);}}
 async function followup(){setBusy(true);try{if(!await flushRef.current())return;const result=await api('/api/interview/followup',{questionId:question.id});setAiQuestions((result.questions||[]).filter((q:unknown)=>typeof q==='string').slice(0,Math.max(0,2-answer.followup_answers.length)));if(result.warning)setFeedback(result.warning);}catch{setFeedback('Asystent AI jest niedostępny. Możesz skorzystać z pytania uzupełniającego poniżej.');}finally{setBusy(false);}}
 const deterministic=deterministicFollowUps(question.id,answer,covered);const suggestions=[...new Set([...deterministic,...aiQuestions])].filter(q=>!answer.followup_answers.some(a=>a.question===q)).slice(0,Math.max(0,2-answer.followup_answers.length));
 const privateQuestion=question.storage_visibility==='private_only';
 return <article className="card interview-question-card"><p className="eyebrow">Pytanie {question.order} z 40 · {labels[answer.status]} · Opcjonalne</p><h2 id="interview-question-heading">{question.question_pl}</h2><p className="interview-helper">{question.helper_text_pl}</p><p className="interview-example helper">{question.example_prompt_pl}</p>{privateQuestion&&<p className="notice interview-privacy"><LockKeyhole size={16}/> Tylko dla Ciebie. Ta odpowiedź nie trafia do generowania CV ani do AI.</p>}{context.length>0&&<div className="notice"><strong>Mamy już część tej historii.</strong><p>Uzupełnij tylko brakujący kontekst, Twój osobisty wkład lub rezultat. Nie musisz ponownie przepisywać znanych informacji.</p><details><summary>Co już mamy w profilu i źródłach</summary><ul>{context.map((text,index)=><li key={index}>{text}</li>)}</ul></details></div>}<AnswerWidget question={question} answer={answer} onChange={valueChange}/><div className="interview-save-state" role="status" aria-live="polite">{saveState}</div>{error&&<div role="alert" className="notice"><p>{error}</p><button className="button secondary" onClick={()=>void flushRef.current()}>Ponów zapis</button></div>}{feedback&&<p role="status" className="notice">{feedback}</p>}
 {!privateQuestion&&answer.status!=='skipped'&&hasAnswerValue(answer)&&<div className="interview-followups"><h3>Doprecyzuj, jeśli chcesz</h3><p className="helper">Najwyżej dwa dopytania. Każde możesz zostawić bez odpowiedzi.</p>{answer.followup_answers.map((item,index)=><label key={item.question}>{item.question}<textarea aria-label={item.question} value={item.answer} maxLength={5000} onChange={e=>change({status:'draft',followup_answers:answer.followup_answers.map((a,i)=>i===index?{...a,answer:e.target.value}:a)})}/></label>)}{suggestions.map(s=><button key={s} className="button secondary" onClick={()=>change({followup_answers:[...answer.followup_answers,{question:s,answer:''}].slice(0,2)})}>{s}</button>)}{answer.followup_answers.length<2&&<button disabled={busy} className="button secondary" onClick={()=>void followup()}>Poproś asystenta o dopytanie</button>}{answer.status==='answered'&&<button className="button secondary" disabled={busy} onClick={()=>void extract()}>Wyodrębnij fakty do sprawdzenia</button>}</div>}
 <div className="interview-controls"><button className="button secondary" disabled={!hasPrevious} onClick={onPrevious}><ArrowLeft size={16}/> Wstecz</button><button className="button secondary" onClick={()=>void complete(true)}><SkipForward size={16}/> Pomiń</button><button className="button" onClick={()=>void complete()}><Check size={16}/> Zapisz odpowiedź{hasNext?' i dalej':''}</button>{hasNext&&<button className="button secondary" onClick={onNext}>Dalej ze szkicem <ArrowRight size={16}/></button>}</div></article>;
}

function AnswerWidget({question,answer,onChange}:{question:InterviewQuestion;answer:InterviewAnswer;onChange:(value:InterviewAnswer['value'])=>void}){
 if(question.answer_type==='long_text')return <div className="interview-answer"><label htmlFor="interview-answer">Twoja odpowiedź</label><textarea id="interview-answer" aria-labelledby="interview-question-heading" rows={8} maxLength={5000} value={typeof answer.value==='string'?answer.value:''} onChange={e=>onChange(e.target.value)} placeholder="Zacznij od konkretnej sytuacji…"/><p className="helper">Krótka odpowiedź też jest w porządku. Możesz wrócić i rozwinąć ją później.</p></div>;
 if(question.answer_type==='yes_no_with_details'){
  const value=answer.value&&typeof answer.value==='object'&&'choice'in answer.value?answer.value:{choice:null,details:null};
  return <fieldset className="interview-answer"><legend>Twoja odpowiedź</legend><div className="interview-choice-group">{([{value:'yes',label_pl:'Tak'},{value:'no',label_pl:'Nie'},{value:'unsure',label_pl:'Nie wiem / trudno powiedzieć'}] as const).map(choice=><label key={choice.value}><input type="radio" name={question.id} checked={value.choice===choice.value} onChange={()=>onChange({choice:choice.value,details:choice.value==='yes'?value.details:null})}/>{choice.label_pl}</label>)}</div>{value.choice==='yes'&&<label>Dodatkowy kontekst (opcjonalnie)<textarea rows={5} maxLength={5000} value={value.details||''} onChange={e=>onChange({...value,details:e.target.value||null})}/></label>}</fieldset>;
 }
 const value=answer.value&&typeof answer.value==='object'&&'min'in answer.value?answer.value:{min:null,max:null,currency:null,period:null,contract_basis:null,negotiability:null};
 const select=(key:'currency'|'period'|'contract_basis',label:string,options:[string,string][])=> <label>{label}<select value={value[key]??''} onChange={e=>onChange({...value,[key]:e.target.value||null})}><option value="">Nie podano</option>{options.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select></label>;
 return <fieldset className="interview-answer"><legend>Oczekiwania (wszystkie pola opcjonalne)</legend><div className="interview-range">{(['min','max']as const).map(key=><label key={key}>{key==='min'?'Od':'Do'}<input type="number" min="0" step="any" inputMode="decimal" value={value[key]??''} onChange={e=>onChange({...value,[key]:e.target.value===''?null:Number(e.target.value)})}/></label>)}{select('currency','Waluta',[['PLN','PLN'],['EUR','EUR'],['USD','USD'],['GBP','GBP'],['other','Inna']])}{select('period','Okres',[['month','Miesiąc'],['year','Rok'],['hour','Godzina']])}{select('contract_basis','Podstawa',[['UoP_brutto','UoP brutto'],['B2B_netto_plus_VAT','B2B netto + VAT'],['other','Inna']])}<label>Elastyczność<input value={value.negotiability||''} maxLength={5000} onChange={e=>onChange({...value,negotiability:e.target.value||null})}/></label></div></fieldset>;
}

export function InterviewSectionView({section}:{section:string}){
 const state=useInterview();const [selected,setSelected]=useState<string|null>(null);const currentSection=interviewSections.find(s=>s.id===section.toUpperCase());
 if(!currentSection)return <div className="interview-empty"><h1>Nie znaleziono obszaru rozmowy.</h1><Link href={demoPath('/interview')}>Wróć do wywiadu</Link></div>;
 if(!state.data)return <p role="status">{state.error||'Wczytujemy odpowiedzi…'} {state.error&&<button onClick={()=>void state.reload()}>Spróbuj ponownie</button>}</p>;
 const data=state.data,all=interviewQuestions.filter(q=>q.section_id===currentSection.id),pending=all.filter(q=>!data.coveredQuestionIds.includes(q.id));
 const question=pending.find(q=>q.id===selected)||pending.find(q=>!data.answers.some(a=>a.question_id===q.id&&['answered','skipped'].includes(a.status)))||pending[0];
 const scope=data.userId||(isDemo()?'demo':'session:authenticated');
 function move(delta:number){if(!question)return;const index=pending.findIndex(q=>q.id===question.id);const target=pending[index+delta];if(target)setSelected(target.id);}
 return <div className="interview-page"><Link className="text-link" href={demoPath('/interview')}>← Wszystkie obszary rozmowy</Link><header><p className="eyebrow">Obszar {currentSection.id} · {all.length} pytań opcjonalnych</p><h1>{currentSection.title_pl}</h1><p>{currentSection.purpose_pl}</p></header><div className="interview-layout"><aside className="interview-sidebar"><nav aria-label="Obszary wywiadu">{interviewSections.map(s=><Link key={s.id} aria-current={s.id===currentSection.id?'page':undefined} href={demoPath(`/interview/${s.id}`)}>{s.id}. {s.title_pl}</Link>)}</nav><p className="helper">Nie musisz odpowiadać na wszystko. Doświadczenia pokryte potwierdzonymi faktami pomijamy.</p><nav className="interview-question-nav" aria-label="Pytania w obszarze">{pending.map(q=><button key={q.id} aria-current={question?.id===q.id?'step':undefined} onClick={()=>setSelected(q.id)}>{q.order}. {labels[data.answers.find(a=>a.question_id===q.id)?.status||'unanswered']}</button>)}</nav></aside><div>{question?<QuestionEditor key={`${currentSection.id}:${question.id}`} question={question} initial={data.answers.find(a=>a.question_id===question.id)||emptyAnswer(question)} scope={scope} context={data.questionContexts?.[question.id]||[]} covered={data.coveredQuestionIds} onSaved={state.update} onNext={()=>move(1)} onPrevious={()=>move(-1)} hasPrevious={pending.findIndex(q=>q.id===question.id)>0} hasNext={pending.findIndex(q=>q.id===question.id)<pending.length-1}/>:<div className="card interview-empty"><h2>Mamy już kontekst dla tego obszaru.</h2><p>Potwierdzone fakty pokrywają te pytania. Nie będziemy pytać o nie ponownie.</p><Link className="button" href={demoPath('/profile')}>Sprawdź profil</Link></div>}</div></div></div>;
}
