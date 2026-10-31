'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Shell} from '@/components/shell';
import {resetDemo,workspaceFetch} from '@/lib/demo/transport';
import {DashboardView,ProfileView,ImportView,InterviewHome,InterviewSectionView,NewJobView,JobView,GenerateView,CvHistory,CvEditor,SettingsView} from '@/components/workspace';
export function DemoWorkspace({path}:{path:string[]}){
 const router=useRouter();const[revision,setRevision]=useState(0);const [section,id]=path;
 const view=section==='profile'?(id==='import'?<ImportView/>:<ProfileView/>):section==='interview'?(id?<InterviewSectionView section={id}/>:<InterviewHome/>):section==='jobs'?(id==='new'?<NewJobView/>:id?<JobView id={id}/>:<NewJobView/>):section==='cv'?(id==='new'?<GenerateView/>:id?<CvEditor id={id}/>:<CvHistory/>):section==='settings'?<SettingsView/>:<DashboardView/>;
 return <div onClickCapture={event=>{const target=event.target as HTMLElement;const link=target.closest('a');const href=link?.getAttribute('href');if(href==='/api/account'){event.preventDefault();event.stopPropagation();void workspaceFetch(href).then(async response=>{const url=URL.createObjectURL(await response.blob());const a=document.createElement('a');a.href=url;a.download='matchcv-demo-data.json';a.click();URL.revokeObjectURL(url);});return;}if(href?.startsWith('/')&&!href.startsWith('/demo')&&!href.startsWith('/api/')&&!['/privacy','/terms'].includes(href)){event.preventDefault();event.stopPropagation();router.push('/demo'+(href==='/'?'/dashboard':href));}}}>
 <Shell key={revision} demo email="Alex Morgan · DEMO"><div className="notice" style={{marginBottom:24}}><strong>Demonstracja produktu · dane fikcyjne</strong><p style={{margin:'8px 0'}}>To ten sam interfejs aplikacji. Zmiany są zapisywane tylko w tej przeglądarce. Bez konta, Supabase i wywołań AI. Import plików oraz konto produkcyjne wymagają konfiguracji usług. Nie wpisuj tutaj danych osobowych.</p><button className="button secondary small" onClick={()=>{resetDemo();setRevision(value=>value+1);router.replace('/demo');}}>Zresetuj demo</button></div>{view}</Shell>
 </div>;
}
