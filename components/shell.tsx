"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {LayoutDashboard,UserRound,MessagesSquare,BriefcaseBusiness,Files,Settings,Sun,Moon,LogOut} from "lucide-react";

const links=[
  {href:"/dashboard",label:"Przegląd",mobile:"Przegląd",section:"dashboard",icon:LayoutDashboard},
  {href:"/profile",label:"Mój profil",mobile:"Profil",section:"profile",icon:UserRound},
  {href:"/interview",label:"Wywiad",mobile:"Wywiad",section:"interview",icon:MessagesSquare},
  {href:"/jobs/new",label:"Oferty",mobile:"Oferty",section:"jobs",icon:BriefcaseBusiness},
  {href:"/cv",label:"Moje CV",mobile:"Moje CV",section:"cv",icon:Files},
  {href:"/settings",label:"Ustawienia",mobile:"Konto",section:"settings",icon:Settings},
];

export function Brand(){return <Link href="/" className="brand" aria-label="MatchCV — strona główna"><span className="brand-mark" aria-hidden="true"><span/></span><span className="brand-wordmark">match<span>cv</span></span></Link>}

export function Shell({children,email,demo=false}:{children:React.ReactNode;email?:string;demo?:boolean}){
  const router=useRouter();
  const rawPathname=usePathname();
  const pathname=demo?rawPathname.replace(/^\/demo/,"")||"/dashboard":rawPathname;
  const[dark,setDark]=useState(false);
  const[logoutError,setLogoutError]=useState("");
  const[loggingOut,setLoggingOut]=useState(false);
  const selected=links.find(link=>link.href==="/jobs/new"?pathname.startsWith("/jobs"):pathname===link.href||pathname.startsWith(link.href+"/"))||links[0];
  useEffect(()=>{
    let value=false;
    try{value=localStorage.getItem("matchcv-theme")==="dark"}catch{/* Default light when browser storage is unavailable. */}
    queueMicrotask(()=>setDark(value));
    document.documentElement.dataset.theme=value?"dark":"light";
  },[]);
  function theme(){const value=!dark;setDark(value);document.documentElement.dataset.theme=value?"dark":"light";try{localStorage.setItem("matchcv-theme",value?"dark":"light")}catch{/* The selected theme still works for this visit. */}}
  async function logout(){
    setLoggingOut(true);setLogoutError("");
    try{const response=await fetch("/api/auth",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"logout"})});if(!response.ok)throw new Error("Nie udało się wylogować. Spróbuj ponownie.");router.replace("/login");router.refresh()}
    catch(error){setLogoutError(error instanceof Error?error.message:"Nie udało się wylogować.")}
    finally{setLoggingOut(false)}
  }
  const destination=(href:string)=>demo?`/demo${href}`:href;
  return <>
    <a href="#main-content" className="skip-link">Przejdź do treści</a>
    <aside className="sidebar">
      <Brand/>
      <div className="sidebar-desktop"><div className="sidebar-label">Twoja przestrzeń</div><nav className="nav" aria-label="Nawigacja główna">{links.map(({href,label,section,icon:Icon})=><Link key={href} href={destination(href)} data-section={section} className={selected.href===href?"active":""} aria-current={selected.href===href?"page":undefined}><Icon size={19} strokeWidth={1.7}/>{label}</Link>)}</nav></div>
      <div className="sidebar-bottom"><strong>Twoja historia ma znaczenie.</strong><p>Uporządkuj doświadczenie.<br/>Opowiedz je po swojemu.</p><Link href="/privacy">Prywatność</Link><span aria-hidden="true"> · </span><Link href="/terms">Regulamin</Link></div>
    </aside>
    <div className="workspace">
      <header className="topbar"><div className="topbar-context"><Link href={destination("/dashboard")}>Twoja przestrzeń</Link><span aria-hidden="true"> / </span><strong>{selected.label}</strong></div><div className="topbar-account">{demo?<span className="topbar-demo">DANE FIKCYJNE</span>:<span className="account-label">{email}</span>}<button type="button" className="icon-button" onClick={theme} aria-label={dark?"Włącz jasny motyw":"Włącz ciemny motyw"}>{dark?<Sun size={19} strokeWidth={1.6}/>:<Moon size={19} strokeWidth={1.6}/>}</button>{!demo&&<button type="button" className="icon-button" disabled={loggingOut} aria-label="Wyloguj" onClick={()=>void logout()}><LogOut size={18} strokeWidth={1.7}/></button>}</div></header>
      <main className="main" id="main-content">{logoutError&&<p className="notice error" role="alert">{logoutError}</p>}{children}</main>
    </div>
    <nav className="mobile-nav" aria-label="Nawigacja mobilna">{links.filter(link=>link.section!=="dashboard").map(({href,mobile,section,icon:Icon})=><Link key={href} href={destination(href)} data-section={section} className={selected.href===href?"active":""} aria-current={selected.href===href?"page":undefined}><Icon size={20} strokeWidth={1.7}/><span>{mobile}</span></Link>)}</nav>
  </>
}
