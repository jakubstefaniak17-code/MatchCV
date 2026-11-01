'use client';
import Link from 'next/link';
import {usePathname,useRouter} from 'next/navigation';
import {useState} from 'react';
import type {ReactNode} from 'react';
import {ArrowRight,Check,LogOut} from 'lucide-react';
import {Brand} from '@/components/shell';
import {setupSteps} from './types';
import {useSetup} from './provider';
export function SetupChrome({children}:{children:ReactNode}){
 const setup=useSetup(),pathname=usePathname(),router=useRouter();const [logoutError,setLogoutError]=useState('');const [leaving,setLeaving]=useState(false);
 const step=Number(pathname.split('/').pop())||0;
 async function logout(){setLeaving(true);try{const r=await fetch('/api/auth',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'logout'})});if(!r.ok)throw new Error('Wylogowanie nie powiodło się.');router.replace('/login');router.refresh();}catch(e){setLogoutError(e instanceof Error?e.message:'Błąd wylogowania.');setLeaving(false);}}
 async function go(target:number){try{await setup.save({currentStep:target});router.push(`/setup/${target}`);}catch{/* Provider keeps a visible error and the current screen. */}}
 const maxStep=setup.data?.progress.legacy_supplement?5:Math.min(5,Math.max(1,...(setup.data?.progress.completed_steps||[]).map(n=>n+1)));
 return <div className="setup-shell"><a className="skip-link" href="#setup-content">Przejdź do konfiguracji</a><header className="setup-topbar"><Brand/><span>Pierwszy rozdział Twojej kariery w MatchCV</span><button className="button secondary small" disabled={leaving} onClick={()=>void logout()}><LogOut size={16}/>Wyloguj</button></header>{logoutError&&<p className="notice error" role="alert">{logoutError}</p>}<div className="setup-layout">{step>0&&<aside className="setup-rail"><p className="eyebrow">Poznajemy Twoją historię</p><ol className="setup-stepper">{setupSteps.map((title,index)=><li key={title} aria-current={step===index+1?'step':undefined}><button disabled={!setup.data||index+1>maxStep||setup.busy} onClick={()=>void go(index+1)}><span>{setup.data?.progress.completed_steps.includes(index+1)?<Check size={16}/>:String(index+1).padStart(2,'0')}</span>{title}</button></li>)}</ol><p>Nie musisz mieć gotowych odpowiedzi. Najpierw uporządkujemy to, co już wiesz.</p></aside>}<main className="setup-main" id="setup-content">{setup.error&&<div className="notice error" role="alert"><p>{setup.error}</p><button className="button secondary small" onClick={()=>void setup.reload()}>Wczytaj zapisany postęp</button><p className="helper">Wpisana w bieżącym formularzu treść pozostaje na ekranie.</p></div>}{!setup.data?<div role="status"><h1>Wracamy do Twojej historii.</h1><p>{setup.error?'Nie udało się bezpiecznie wczytać danych. Nie zresetowaliśmy Twojego postępu.':'Wczytujemy zapisany postęp…'}</p></div>:children}</main></div><footer className="setup-footer"><span>Twoje doświadczenie. Twoje tempo. Twoje decyzje.</span><Link href="/privacy">Prywatność <ArrowRight size={13}/></Link></footer></div>;
}
