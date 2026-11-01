'use client';
import {useEffect,useState} from 'react';
import Link from 'next/link';
import {useRouter} from 'next/navigation';
import {ArrowRight,FileText,MessagesSquare} from 'lucide-react';
import {useSetup} from './provider';
import {IdentityStep} from './identity';
import {ImportStep} from './import';
import {ReviewStep} from './review';
import {DiscoverStep} from './discover';
import {ReadyStep} from './summary';
export function SetupResume(){const {data}=useSetup(),router=useRouter();useEffect(()=>{if(data)router.replace(data.progress.status==='completed'?'/dashboard':`/setup/${data.progress.current_step||1}`);},[data,router]);return <p role="status">Wznawiamy konfigurację…</p>;}
export function WelcomeView(){
 const setup=useSetup(),router=useRouter();const [error,setError]=useState('');
 async function start(path:'cv'|'interview'){try{await setup.save({path,currentStep:1});router.push('/setup/1');}catch(e){setError(e instanceof Error?e.message:'Nie udało się rozpocząć.');}}
 if(!setup.data)return null;
 if(setup.data.progress.status==='completed'&&!setup.data.progress.legacy_supplement)return <section className="setup-heading"><p className="eyebrow">Twoja historia jest zapisana</p><h1>Witaj z powrotem.</h1><p>Nie musisz ponownie przechodzić konfiguracji.</p><Link href="/dashboard" className="button">Przejdź do mojej kariery <ArrowRight size={17}/></Link></section>;
 return <section className="setup-welcome"><div className="setup-heading"><p className="eyebrow">Career Setup · MatchCV</p><h1>Zacznijmy od Twojej historii.</h1><p>Opowiedz nam o swojej karierze raz. Przygotujemy ją na każdą kolejną szansę zawodową.</p><p>W pięciu krótkich krokach uporządkujemy doświadczenie. Ty zdecydujesz, co jest prawdziwe i co może znaleźć się w CV.</p></div>{setup.data.progress.status==='in_progress'&&<div className="notice"><p>Masz już zapisaną konfigurację. Wróć do miejsca, w którym skończyłeś lub skończyłaś.</p><Link className="button" href={`/setup/${setup.data.progress.current_step}`}>Wznów zapisany krok</Link></div>}<>{setup.data.progress.legacy_supplement&&<p className="notice">To dobrowolne uzupełnienie istniejącego profilu. Twoja historia pozostaje zapisana, a dostęp do aplikacji nie jest blokowany.</p>}</><div className="setup-paths"><button className="setup-path" disabled={setup.busy} onClick={()=>void start('cv')}><FileText size={30}/><h2>Mam już CV</h2><p>Zaczniemy od dokumentu, sprawdzimy historię i dopytamy tylko o to, czego brakuje.</p><span>Importuj PDF lub DOCX <ArrowRight size={18}/></span></button><button className="setup-path" disabled={setup.busy} onClick={()=>void start('interview')}><MessagesSquare size={30}/><h2>Zacznijmy bez CV</h2><p>Dodasz doświadczenie samodzielnie, a kilka pytań pomoże odkryć najważniejsze historie.</p><span>Opowiedz swoją historię <ArrowRight size={18}/></span></button></div>{error&&<p role="alert" className="notice error">{error}</p>}<p className="helper">Możesz przerwać w dowolnym momencie. Zapisany na koncie postęp będzie dostępny po ponownym zalogowaniu.</p></section>;
}
export function SetupStep({step}:{step:number}){
 const {data}=useSetup(),router=useRouter();const maxStep=data?.progress.legacy_supplement?5:Math.min(5,Math.max(1,...(data?.progress.completed_steps||[]).map(n=>n+1)));
 useEffect(()=>{if(data&&step>maxStep)router.replace(`/setup/${data.progress.current_step||maxStep}`);},[data,step,maxStep,router]);
 if(!data||step>maxStep)return <p role="status">Sprawdzamy zapisany etap konfiguracji…</p>;
 if(data.progress.status==='completed'&&!data.progress.legacy_supplement)return <div><h1>Konfiguracja jest zakończona.</h1><Link className="button" href="/dashboard">Przejdź do mojej kariery</Link></div>;
 return step===1?<IdentityStep/>:step===2?<ImportStep/>:step===3?<ReviewStep/>:step===4?<DiscoverStep/>:<ReadyStep/>;
}
