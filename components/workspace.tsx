"use client";
import {workspaceFetch, demoPath} from "@/lib/demo/transport";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDown, ArrowUp, ArrowUpRight, Check, Download, FilePlus2, Plus, ShieldCheck, Upload } from "lucide-react";
export {InterviewHome,InterviewSectionView} from "@/components/interview/interview";
import {templateLabels,normalizeLegacyResume,summaryLabel} from "@/lib/resume/engine";
import { EntityEditor } from "@/components/career/entity-editor";
import type { Fact, JobAnalysis, Resume, EvidenceMapping } from "@/lib/resume/engine";
type CareerProfile = {
    professional_headline?: string;
    professional_summary?: string;
    career_objectives?: string;
    seniority?: string;
    preferred_positions?: string[];
    preferred_industries?: string[];
    location_preferences?: string[];
    excluded_details?: string[];
    covered_question_ids?: string[];
};
type SavedFact = Fact & {
    structured_value?:{source_quote?:string;information_kind?:string;coverage_confirmed?:boolean;question_coverage?:{question_id:string;coverage:string;rationale?:string}[]};
    source_type?: string;
    source_reference?: string;
    created_at?: string;
};
type Answer = {
    question_id: string;
    answer: string;
    status: "answered" | "skipped";
};
type Job = {
    id: string;
    title: string;
    employer?: string;
    original_text: string;
    analysis: JobAnalysis;
    created_at?: string;
    evidence?: EvidenceMapping[];
};
type Cv = {
    id: string;
    title: string;
    language: string;
    template: string;
    content: Resume;
    approved: boolean;
    created_at?: string;
};
type Workspace = {
    profile: CareerProfile | null;
    facts: SavedFact[];
    answers: Answer[];
    jobs: Job[];
    cvs: Cv[];
    aiConfigured: boolean;
};
type ApiResult = {
    warning?: string;
    id?: string;
    job?: {
        id: string;
    };
    cv?: {
        id: string;
    };
    questions?: {
        question: string;
        reason?: string;
        relatedFactIds?: string[];
    }[];
    message?: string;
    error?: string;
};
async function request(payload: Record<string, unknown>): Promise<ApiResult> { const response = await workspaceFetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) }); const result = await response.json(); if (!response.ok)
    throw new Error(result.error || "Nie udało się zapisać zmian."); return result; }
function useWorkspace() { const [data, setData] = useState<Workspace | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const reload = useCallback(async () => { try {
    const r = await workspaceFetch("/api/workspace", { cache: "no-store" });
    const v = await r.json();
    if (!r.ok)
        throw new Error(v.error || "Nie udało się pobrać danych.");
    setData({...v,cvs:v.cvs.map((cv:Cv)=>({...cv,content:normalizeLegacyResume(cv.content)}))});
    setError("");
}
catch (e) {
    setError(e instanceof Error ? e.message : "Wystąpił błąd.");
} }, []); useEffect(() => { queueMicrotask(() => {void reload();const warning=sessionStorage.getItem("matchcv-operation-warning");if(warning){setMessage(warning);sessionStorage.removeItem("matchcv-operation-warning");}}); }, [reload]); async function mutate(payload: Record<string, unknown>, success = "Zmiany zapisane.") { setBusy(true); setError(""); setMessage(""); try {
    const result = await request(payload);
    await reload();
    setMessage(result.warning || result.message || success);
    if(result.warning && (payload.action === "analyzeJob" || payload.action === "generate")) sessionStorage.setItem("matchcv-operation-warning",result.warning);
    return result;
}
catch (e) {
    setError(e instanceof Error ? e.message : "Wystąpił błąd.");
    return null;
}
finally {
    setBusy(false);
} } return { data, error, message, busy, reload, mutate, setError, setMessage, setBusy }; }
type State = ReturnType<typeof useWorkspace>;
function Status({ state }: {
    state: State;
}) { return <>{state.error && <p role="alert" className="notice error">{state.error}</p>}{state.message && <p role="status" className="notice">{state.message}</p>}</>; }
function Loading({ state }: {
    state: State;
}) { return state.error ? <div className="card"><Status state={state}/><button className="button secondary" onClick={() => void state.reload()}>Spróbuj ponownie</button></div> : <div className="stack" aria-label="Wczytywanie danych"><div className="skeleton"/><div className="skeleton"/></div>; }
function Header({ eyebrow, title, description, children }: {
    eyebrow?: string;
    title: string;
    description: string;
    children?: React.ReactNode;
}) { return <header className="page-header"><div className="row between"><div>{eyebrow && <div className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>}<h1>{title}</h1><p style={{ marginBottom: 0 }}>{description}</p></div>{children}</div></header>; }
function date(value?: string) { return value ? new Date(value).toLocaleDateString("pl-PL") : ""; }
const factLabels: Record<string, string> = { imported_unconfirmed: "Do sprawdzenia", user_provided: "Podane przez Ciebie", user_confirmed: "Potwierdzone", document_supported: "Poparte dokumentem", disputed: "Sporne", rejected: "Odrzucone" };
const typeLabels: Record<string, string> = { experience: "Doświadczenie", project: "Projekt", achievement: "Osiągnięcie", skill: "Kompetencja", education: "Wykształcenie", certification: "Certyfikat", language: "Język", other: "Inne", identity:"Imię i nazwisko",contact:"Dane kontaktowe" };
function confirmed(f: Fact) { return ["user_confirmed", "document_supported"].includes(f.verification_status) && !f.excluded && !f.confidential && !f.private && !f.forbidden_for_cv; }
export function DashboardView() { const state = useWorkspace(); if (!state.data)
    return <Loading state={state}/>; const d = state.data; const completed = [d.profile?.professional_headline, d.profile?.professional_summary, d.profile?.career_objectives, d.facts.some(confirmed), d.answers.some(a => a.status === "answered")].filter(Boolean).length * 20; const stats = [[`${completed}%`, "Uzupełnienie profilu"], [d.answers.filter(a => a.status === "answered").length, "Odpowiedzi w wywiadzie"], [d.facts.filter(confirmed).length, "Fakty gotowe do CV"], [d.cvs.length, "Wersje CV"]]; return <><Header eyebrow="Twój punkt wyjścia" title="Zrób miejsce na kolejny krok." description="Cała Twoja historia zawodowa. Jedno uporządkowane miejsce."><Link href="/jobs/new" className="button"><Plus size={16}/> Nowa aplikacja</Link></Header><Status state={state}/><div className="stats">{stats.map(([value, label]) => <div className="card" key={label}><div className="stat-value">{value}</div><div className="stat-label">{label}</div></div>)}</div><div className="grid" style={{ marginTop: 24 }}><section className="card"><span className="eyebrow">Polecany kolejny krok</span><h2 style={{ marginTop: 15 }}>{!d.facts.length ? "Zacznij od tego, co już masz." : !d.facts.some(confirmed) ? "Potwierdź swoje doświadczenie." : !d.jobs.length ? "Dodaj ofertę, która Cię interesuje." : "Przygotuj kolejną wersję CV."}</h2><p>{!d.facts.length ? "Prześlij obecne CV lub przejdź do wywiadu. Nie musisz odpowiadać na wszystkie 99 pytań." : "Dobre dopasowanie powstaje z konkretnych, potwierdzonych informacji."}</p><Link className="button secondary" href={!d.facts.length ? "/profile/import" : !d.facts.some(confirmed) ? "/profile" : !d.jobs.length ? "/jobs/new" : "/cv/new"}>Kontynuuj <ArrowUpRight size={16}/></Link><div className="progress" style={{ marginTop: 26 }}><span style={{ width: `${completed}%` }}/></div></section><section className="card"><ShieldCheck size={25} color="var(--accent)"/><h2 style={{ marginTop: 15 }}>Fakty pod Twoją kontrolą.</h2><p>Importowane informacje wymagają sprawdzenia. Brak informacji nie oznacza braku kompetencji. Fakty poufne i wykluczone nie trafią do generowanego CV.</p><span className="badge">{d.aiConfigured ? "Dostawca AI skonfigurowany" : "Tryb deterministyczny — AI niedostępne"}</span></section><section className="card"><h2>Ostatnie oferty</h2>{d.jobs.length ? d.jobs.slice(0, 4).map(j => <Link className="list-item" key={j.id} href={`/jobs/${j.id}`}><div><div className="list-title">{j.title}</div><span className="helper">{j.employer || "Pracodawca niepodany"} · {date(j.created_at)}</span></div><ArrowUpRight size={17}/></Link>) : <div className="empty">Jeszcze nie dodano ofert. <Link className="text-link" href="/jobs/new">Dodaj pierwszą</Link>.</div>}</section><section className="card"><h2>Ostatnie wersje CV</h2>{d.cvs.length ? d.cvs.slice(0, 4).map(cv => <Link className="list-item" key={cv.id} href={`/cv/${cv.id}`}><div><div className="list-title">{cv.title}</div><span className="helper">{cv.language.toUpperCase()} · {date(cv.created_at)}</span></div><ArrowUpRight size={17}/></Link>) : <div className="empty">Twoje wersje CV pojawią się tutaj.</div>}</section></div></>; }
function FactEditor({fact,state}:{fact:SavedFact;state:State}){
 const[editing,setEditing]=useState(false),[text,setText]=useState(fact.statement);
 const locked=Boolean(fact.private||fact.forbidden_for_cv);const contextual=['preference','interpretation'].includes(fact.structured_value?.information_kind||'');
 const payload={action:'fact',id:fact.id,statement:text,factType:fact.fact_type,status:fact.verification_status,excluded:fact.excluded,confidential:fact.confidential,private:fact.private,forbiddenForCv:fact.forbidden_for_cv,coverageConfirmed:fact.structured_value?.coverage_confirmed};
 return <article className="fact-row"><div className="row between"><div className="row"><span className="badge">{factLabels[fact.verification_status]}</span><span className="helper">{typeLabels[fact.fact_type]||fact.fact_type} · {fact.source_type||'manual'}</span>{locked&&<span className="badge">Prywatne — nigdy w CV</span>}{contextual&&<span className="badge">Kontekst dopasowania</span>}</div><button className="button secondary small" onClick={()=>setEditing(!editing)}>{editing?'Zamknij':'Popraw treść'}</button></div>
 {editing?<textarea aria-label="Treść faktu" value={text} onChange={e=>setText(e.target.value)} maxLength={4000}/>:<p className="fact-statement">{fact.statement}</p>}
 {fact.structured_value?.source_quote&&<details><summary>Na czym się opieramy?</summary><blockquote>{fact.structured_value.source_quote}</blockquote><p className="helper">Źródło: {fact.source_reference}</p></details>}
 {Boolean(fact.structured_value?.question_coverage?.length)&&<div className="notice"><p>Proponowane powiązania z wywiadem: {fact.structured_value!.question_coverage!.map(c=>`${c.question_id} (${c.coverage==='full'?'pełne':'częściowe'})`).join(', ')}.</p><label className="row"><input type="checkbox" style={{width:'auto'}} checked={Boolean(fact.structured_value?.coverage_confirmed)} onChange={e=>void state.mutate({...payload,coverageConfirmed:e.target.checked})}/>Potwierdzam, że wskazane pełne powiązania rzeczywiście odpowiadają na pytania.</label><p className="helper">Sam podobny tytuł stanowiska nie wystarcza. Potwierdź tylko odpowiedź obejmującą rzeczywisty wkład i kontekst.</p></div>}
 <div className="row"><button className="button small" disabled={state.busy} onClick={()=>void state.mutate({...payload,status:'user_confirmed'},'Treść potwierdzona. Zgoda na użycie w CV pozostaje osobnym wyborem.')}><Check size={14}/>Potwierdź treść</button><button className="button secondary small" disabled={state.busy} onClick={()=>void state.mutate({...payload,status:'rejected'})}>Odrzuć</button>
 <label className="row helper"><input type="checkbox" style={{width:'auto'}} checked={!fact.excluded&&!fact.confidential&&!locked&&!contextual} disabled={state.busy||locked||contextual} onChange={e=>void state.mutate({...payload,excluded:!e.target.checked})}/>Może znaleźć się w CV</label>
 <label className="row helper"><input type="checkbox" style={{width:'auto'}} checked={Boolean(fact.confidential||locked)} disabled={state.busy||locked} onChange={e=>void state.mutate({...payload,confidential:e.target.checked})}/>Poufne</label></div>
 </article>;
}
export function ProfileView() { const state = useWorkspace(); const [statement, setStatement] = useState(""); const [factType, setFactType] = useState("experience"); const [filter, setFilter] = useState("all"); if (!state.data)
    return <Loading state={state}/>; const d = state.data; async function saveProfile(e: FormEvent<HTMLFormElement>) { e.preventDefault(); const form = new FormData(e.currentTarget); const data = { headline: form.get("professional_headline"), summary: form.get("professional_summary"), career_objectives: form.get("career_objectives"), seniority: form.get("seniority"),excluded_details:String(form.get("excluded_details")||"").split("\n").map(v=>v.trim()).filter(Boolean) }; await state.mutate({ action: "profile", data }); } return <><Header eyebrow="Master career profile" title="Twoje doświadczenie, uporządkowane." description="Zbuduj źródło prawdy dla każdej kolejnej aplikacji."><Link href="/profile/import" className="button secondary"><Upload size={16}/> Importuj CV</Link></Header><Status state={state}/><div className="stack"><form className="card" onSubmit={saveProfile}><h2>Pozycjonowanie zawodowe</h2><div className="grid"><div className="field"><label htmlFor="headline">Nagłówek zawodowy</label><input id="headline" name="professional_headline" defaultValue={d.profile?.professional_headline || ""} placeholder="Np. Project Manager / energetyka"/></div><div className="field"><label htmlFor="seniority">Poziom stanowiska</label><input id="seniority" name="seniority" defaultValue={d.profile?.seniority || ""} placeholder="Np. Senior"/></div></div><div className="field"><label htmlFor="summary">Podsumowanie zawodowe</label><textarea id="summary" name="professional_summary" defaultValue={d.profile?.professional_summary || ""}/></div><div className="field"><label htmlFor="objectives">Cele zawodowe</label><textarea id="objectives" name="career_objectives" defaultValue={d.profile?.career_objectives || ""}/></div><div className="field"><label htmlFor="excluded-details">Informacje wykluczone z CV</label><textarea id="excluded-details" name="excluded_details" defaultValue={(d.profile?.excluded_details||[]).join("\n")} placeholder="Jedna dokładna fraza w wierszu, np. poufna nazwa projektu"/><p className="helper">Fakty zawierające te frazy nie trafią do generacji ani eksportu. Ta lista nie jest przekazywana modelowi.</p></div><button className="button" disabled={state.busy}>Zapisz profil</button></form><EntityEditor onSaved={state.reload}/><section className="card"><h2>Dodaj konkretny fakt</h2><p className="helper">Oddzielaj samodzielne osiągnięcia, obowiązki, kwalifikacje i projekty. Nie dodawaj informacji poufnych.</p><form onSubmit={async (e) => { e.preventDefault(); const result = await state.mutate({ action: "fact", statement, factType, status: "user_confirmed" }, "Dodano potwierdzony fakt."); if (result)
    setStatement(""); }}><div className="field"><label htmlFor="factType">Rodzaj</label><select id="factType" value={factType} onChange={e => setFactType(e.target.value)}>{Object.entries(typeLabels).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select></div><textarea aria-label="Nowy fakt zawodowy" required maxLength={4000} value={statement} onChange={e => setStatement(e.target.value)} placeholder="Co dokładnie zrobiłeś? W jakiej firmie i kiedy? Jaki był rezultat?"/><p className="helper">Zapisując, potwierdzasz prawdziwość tej informacji.</p><button className="button" disabled={state.busy || !statement.trim()}><Plus size={15}/> Dodaj fakt</button></form></section><section className="card"><div className="row between"><h2>Rejestr faktów <span className="muted">({d.facts.length})</span></h2><select aria-label="Filtruj fakty" style={{ width: "auto" }} value={filter} onChange={e => setFilter(e.target.value)}><option value="all">Wszystkie</option><option value="imported_unconfirmed">Do sprawdzenia</option><option value="user_confirmed">Potwierdzone</option><option value="rejected">Odrzucone</option></select></div>{d.facts.filter(f => filter === "all" || f.verification_status === filter).map(f => <FactEditor key={f.id} fact={f} state={state}/>)}{!d.facts.length && <div className="empty">Dodaj pierwszy fakt, zaimportuj CV lub odpowiedz na pytania wywiadu.</div>}</section></div></>; }
export function ImportView() { const state = useWorkspace(); const [file, setFile] = useState<File | null>(null); const [finished, setFinished] = useState(false); async function upload(e: FormEvent) { e.preventDefault(); if (!file)
    return; state.setBusy(true); state.setError(""); state.setMessage(""); try {
    const form = new FormData();
    form.set("file", file);
    const r = await workspaceFetch("/api/import", { method: "POST", body: form });
    const d = await r.json();
    if (!r.ok)
        throw new Error(d.error || "Import nie powiódł się.");
    state.setMessage(d.warning || d.message || "Import zakończony. Sprawdź i potwierdź wyodrębnione fakty.");
    setFinished(true);
    await state.reload();
}
catch (e) {
    state.setError(e instanceof Error ? e.message : "Błąd importu.");
}
finally {
    state.setBusy(false);
} } return <><Header eyebrow="Punkt wyjścia" title="Zaimportuj obecne CV." description="Dokument jest źródłem informacji. Potwierdzenie zawsze należy do Ciebie."/><Status state={state}/><div className="grid"><form className="card" onSubmit={upload}><Upload size={30} color="var(--accent)"/><h2 style={{ marginTop: 20 }}>Dodaj dokument</h2><label htmlFor="file">CV w formacie PDF lub DOCX</label><input id="file" type="file" accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document" required onChange={e => { setFile(e.target.files?.[0] || null); setFinished(false); }}/><p className="helper">Maksymalnie 5 MB. PDF musi zawierać tekst; skany bez warstwy tekstowej nie są obsługiwane.</p><button disabled={state.busy || !file} className="button">{state.busy ? "Odczytywanie dokumentu…" : "Importuj i wyodrębnij fakty"}</button>{finished && <Link href="/profile" className="button secondary" style={{ marginLeft: 10 }}>Przejdź do weryfikacji</Link>}</form><section className="card"><ShieldCheck size={28}/><h2 style={{ marginTop: 20 }}>Najpierw sprawdź, potem używaj.</h2><p>Przesłany dokument jest przechowywany prywatnie. Wyodrębnione fakty trafiają do kolejki weryfikacji — nie są automatycznie traktowane jako potwierdzone.</p><p>Jeśli dostawca AI jest skonfigurowany, treść dokumentu może być do niego przesłana w celu analizy. Usuń informacje poufne przed importem.</p><Link href="/privacy" className="text-link">Informacje o przetwarzaniu danych</Link></section></div></>; }
export function NewJobView() { const router = useRouter(); const state = useWorkspace(); const [text, setText] = useState(""); const [url, setUrl] = useState(""); const [language, setLanguage] = useState("pl"); return <><Header eyebrow="Nowa aplikacja" title="Od oferty do konkretnego dopasowania." description="Wklej treść ogłoszenia lub spróbuj pobrać je z publicznego adresu."/><Status state={state}/><div className="grid"><form className="card" onSubmit={async (e) => { e.preventDefault(); const result = await state.mutate({ action: "analyzeJob", text, url, language }, "Oferta przeanalizowana."); const id = result?.id || result?.job?.id; if (id)
    router.push(demoPath(`/jobs/${id}`)); }}><div className="field"><label htmlFor="job-url">Adres oferty (opcjonalnie)</label><input id="job-url" type="url" value={url} onChange={e => setUrl(e.target.value)} placeholder="https://…"/><p className="helper">Jeśli serwis blokuje dostęp, wklej treść poniżej. Nie omijamy logowania ani zabezpieczeń.</p></div><div className="field"><label htmlFor="job-text">Treść ogłoszenia</label><textarea id="job-text" style={{ minHeight: 260 }} value={text} onChange={e => setText(e.target.value)} maxLength={60000} placeholder="Nazwa stanowiska, obowiązki, wymagania konieczne i mile widziane…"/></div><div className="field"><label htmlFor="job-language">Język analizy</label><select id="job-language" value={language} onChange={e => setLanguage(e.target.value)}><option value="pl">Polski</option><option value="en">English</option></select></div><button className="button" disabled={state.busy || !text.trim() && !url.trim()}>{state.busy ? "Analiza oferty…" : "Przeanalizuj ofertę"} <ArrowUpRight size={16}/></button></form><section className="card"><h2>Sprawdź, na czym stoisz.</h2><p>MatchCV rozdziela wymagania obowiązkowe od dodatkowych i szuka dowodów w potwierdzonym doświadczeniu.</p><div className="notice">„Nie ustalono” oznacza, że brakuje informacji w profilu. Nie oznacza, że nie masz danej kompetencji.</div><p style={{ marginTop: 20 }}>Automatyczne dopasowanie jest wskazówką do weryfikacji. Twoje doświadczenie nie zostanie uzupełnione treścią ogłoszenia.</p></section></div></>; }
const evidenceLabels: Record<string, string> = { supported: "Poparte dowodami", partial: "Częściowo poparte", not_established: "Nie ustalono", explicitly_unsupported: "Wyraźnie niepotwierdzone" };
export function JobView({ id }: {
    id: string;
}) { const state = useWorkspace(); if (!state.data)
    return <Loading state={state}/>; const job = state.data.jobs.find(j => j.id === id); if (!job)
    return <div className="card"><h1>Nie znaleziono oferty</h1><Link href="/jobs/new" className="text-link">Dodaj ofertę</Link></div>; return <><Header eyebrow="Analiza oferty" title={job.title} description={[job.employer, job.analysis?.location, job.analysis?.seniority].filter(Boolean).join(" · ") || "Sprawdź wymagania i dowody z własnego profilu."}><Link className="button" href={`/cv/new?job=${job.id}`}><FilePlus2 size={16}/> Przygotuj CV</Link></Header><Status state={state}/><div className="stack"><section className="card"><h2>Wymagania i dowody</h2><p className="helper">Wstępne powiązania wymagają Twojej weryfikacji. Zbieżność słów nie stanowi dowodu spełnienia wymagania.</p>{job.analysis?.requirements?.map(r => { const mapping = job.evidence?.find(e => e.requirementId === r.id); const matches = state.data!.facts.filter(f => mapping?.factIds.includes(f.id)); return <article className="fact-row" key={r.id}><div className="row between"><span className="badge">{r.priority === "mandatory" ? "Wymagane" : r.priority === "preferred" ? "Mile widziane" : "Obowiązek"}</span><span className="helper">{evidenceLabels[mapping?.status || "not_established"]}</span></div><h3 style={{ marginTop: 12 }}>{r.statement}</h3>{matches.map(f => <p key={f.id} className="notice">{f.statement}<br /><span className="helper">Źródło: {f.source_type || "profil"} · {f.id.slice(0, 8)}</span></p>)}{!matches.length && <p className="helper">Brak ustalonego dowodu. <Link className="text-link" href="/profile">Uzupełnij profil</Link> konkretnym przykładem.</p>}</article>; })}{!job.analysis?.requirements?.length && <p className="empty">Nie znaleziono wymagań. Dodaj pełną treść ogłoszenia.</p>}</section>{Boolean(job.analysis?.keywords?.length) && <section className="card"><h2>Terminologia i słowa kluczowe</h2><div className="row">{job.analysis.keywords.map(k => <span className="badge" key={k}>{k}</span>)}</div></section>}<details className="card"><summary style={{ cursor: "pointer", fontWeight: 600 }}>Oryginalna treść oferty</summary><p style={{ whiteSpace: "pre-wrap", marginTop: 20 }}>{job.original_text}</p></details></div></>; }
export function GenerateView() { const router = useRouter(); const state = useWorkspace(); const [jobId, setJobId] = useState(""); const [language, setLanguage] = useState("pl"); const [template, setTemplate] = useState("executive_clarity"); useEffect(() => { const id = new URLSearchParams(location.hash.includes('?')?location.hash.split('?')[1]:location.search).get("job"); if (id)
    queueMicrotask(() => setJobId(id)); }, []); if (!state.data)
    return <Loading state={state}/>; const count = state.data.facts.filter(confirmed).length; return <><Header eyebrow="Nowa wersja CV" title="Dopasuj formę do następnego kroku." description="Wybierz ofertę, język i układ. Treść pozostaje oparta na potwierdzonych faktach."/><Status state={state}/><form className="stack" onSubmit={async (e) => { e.preventDefault(); const result = await state.mutate({ action: "generate", jobId: jobId || state.data?.jobs[0]?.id, language, template }, "CV przygotowane."); const id = result?.id || result?.cv?.id; if (id)
    router.push(demoPath(`/cv/${id}`)); }}><section className="card"><div className="grid"><div className="field"><label htmlFor="offer">Oferta pracy</label><select id="offer" required value={jobId || state.data.jobs[0]?.id || ""} onChange={e => setJobId(e.target.value)}>{!state.data.jobs.length && <option value="">Najpierw dodaj ofertę</option>}{state.data.jobs.map(j => <option key={j.id} value={j.id}>{j.title}</option>)}</select></div><div className="field"><label htmlFor="cv-language">Język dokumentu</label><select id="cv-language" value={language} onChange={e => setLanguage(e.target.value)}><option value="pl">Polski</option><option value="en">English</option></select></div></div><span className="badge">{count} potwierdzonych faktów gotowych do użycia</span>{!count && <p className="notice" style={{ marginTop: 15 }}>Zanim utworzysz CV, <Link href="/profile" className="text-link">potwierdź informacje zawodowe</Link>.</p>}</section><div className="steps">{[{ id: "executive_clarity", name: "Executive Clarity", detail: "Przejrzysty, jednokolumnowy układ. Czytelna hierarchia i standardowe nagłówki." }, { id: "modern_studio", name: "Modern Studio", detail: "Kompetencje techniczne, projekty i technologie w centrum uwagi." }].map(t => <label className="card" style={{ cursor: "pointer", borderColor: template === t.id ? "var(--accent)" : undefined }} key={t.id}><input type="radio" name="template" style={{ width: "auto", marginRight: 8 }} value={t.id} checked={template === t.id} onChange={() => setTemplate(t.id)}/><strong>{t.name}</strong><p style={{ fontSize: 13, fontWeight: 400, marginTop: 15 }}>{t.detail}</p></label>)}</div><p className="notice">Podczas niedostępności AI system przygotuje wersję zachowawczą z dokładnego brzmienia potwierdzonych faktów. Zmiana języka nie uprawnia do zmiany kwalifikacji; sprawdź język treści przed eksportem.</p><div><button className="button" disabled={state.busy || !count || !state.data.jobs.length}>{state.busy ? "Przygotowywanie CV…" : "Wygeneruj CV oparte na faktach"} <ArrowUpRight size={16}/></button></div></form></>; }
export function CvHistory() { const state = useWorkspace(); if (!state.data)
    return <Loading state={state}/>; return <><Header eyebrow="Biblioteka aplikacji" title="Twoje CV. Każda wersja pod ręką." description="Wracaj do dokumentów, dopracowuj je i eksportuj w wybranym formacie."><Link className="button" href="/cv/new"><Plus size={16}/> Nowe CV</Link></Header><Status state={state}/><section className="card">{state.data.cvs.length ? state.data.cvs.map(cv => <Link className="list-item" key={cv.id} href={`/cv/${cv.id}`}><div><div className="list-title">{cv.title}</div><span className="helper">{cv.language.toUpperCase()} · {templateLabels[cv.content.template]} · {date(cv.created_at)}</span></div><div className="row"><span className="badge">{cv.approved ? "Zatwierdzone" : "Do sprawdzenia"}</span><ArrowUpRight size={17}/></div></Link>) : <div className="empty"><FilePlus2 size={30} style={{ margin: "0 auto 15px" }}/><h2>Jeszcze nie ma tu dokumentów.</h2><p>Dodaj ofertę i przygotuj pierwsze CV na podstawie swojego profilu.</p><Link href="/jobs/new" className="button">Dodaj ofertę</Link></div>}</section></>; }
function ResumePreview({ resume }: {
    resume: Resume;
}) { return <article className={`resume-paper ${resume.template}`} aria-label="Podgląd CV"><h1 className="resume-name">{resume.person?.name||resume.headline}</h1>{resume.person?.name&&<p className="resume-role">{resume.headline}</p>}{Boolean(resume.person?.contact.length)&&<p className="resume-contact">{resume.person!.contact.join(" · ")}</p>}<h2>{summaryLabel(resume.language,resume.template)}</h2><p style={{ whiteSpace: "pre-line" }}>{resume.summary}</p>{resume.sections.filter(s => !s.hidden).map(s => <section key={s.id} data-section-id={s.id}><h2>{s.title}</h2><ul>{s.claims.map((c, i) => <li key={i}>{c.text}</li>)}</ul></section>)}</article>; }
export function CvEditor({ id }: {
    id: string;
}) { const state = useWorkspace(); const [content, setContent] = useState<Resume | null>(null); useEffect(() => { const cv = state.data?.cvs.find(v => v.id === id); if (cv)
    queueMicrotask(() => setContent(cv.content)); }, [id, state.data]); if (!state.data)
    return <Loading state={state}/>; const cv = state.data.cvs.find(v => v.id === id); if (!cv || !content)
    return <div className="card"><h1>Nie znaleziono CV</h1><Link href="/cv">Wróć do historii</Link></div>; async function download(format: "pdf" | "docx") { state.setError(""); state.setBusy(true); try {
    const response = await workspaceFetch(`/api/cv/${id}/export?format=${format}`);
    if (!response.ok) {
        const result = await response.json();
        throw new Error(result.error || "Nie udało się pobrać dokumentu.");
    }
    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `MatchCV.${format}`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
}
catch (e) {
    state.setError(e instanceof Error ? e.message : "Błąd eksportu.");
}
finally {
    state.setBusy(false);
} } function move(index: number, direction: number) { setContent(old => { if (!old)
    return old; const sections = [...old.sections]; const target = index + direction; if (target < 0 || target >= sections.length)
    return old; [sections[index], sections[target]] = [sections[target], sections[index]]; return { ...old, sections }; }); } return <><Header eyebrow="Edytor i podgląd" title={cv.title} description="Sprawdź dokument, ustaw kolejność sekcji i zatwierdź treść przed eksportem."/><Status state={state}/><div className="row" style={{ marginBottom: 22 }}><button className="button" disabled={state.busy} onClick={() => void state.mutate({ action: "saveCv", id, content, approved: false })}>Zapisz wersję</button><button className="button secondary" disabled={state.busy} onClick={() => void state.mutate({ action: "saveCv", id, content, approved: true }, "CV zatwierdzone. Możesz pobrać dokument.")}><Check size={15}/> Zatwierdź treść</button><button className="button secondary" disabled={state.busy || !cv.approved} onClick={() => void download("pdf")}><Download size={15}/> PDF</button><button className="button secondary" disabled={state.busy || !cv.approved} onClick={() => void download("docx")}><Download size={15}/> DOCX</button></div><p className="helper">Eksport pobiera ostatnią zapisaną i zatwierdzoną wersję. Po zmianach zapisz i zatwierdź dokument ponownie.</p><div className="cv-editor"><div className="stack"><section className="card"><h2>Treść i układ</h2><p className="helper">Zmiany merytoryczne muszą odpowiadać potwierdzonym faktom. Nowe sformułowanie dodaj najpierw do rejestru faktów, aby przejść walidację.</p><div className="field"><label htmlFor="cv-title">Rola docelowa</label><input id="cv-title" value={content.title} onChange={e => setContent({ ...content, title: e.target.value, headline: `${content.language === "pl" ? "Rola docelowa" : "Target role"}: ${e.target.value}` })}/></div><div className="field"><label htmlFor="editor-template">Szablon</label><select id="editor-template" value={content.template} onChange={e => setContent({ ...content, template: e.target.value as Resume["template"] })}><option value="executive_clarity">Executive Clarity</option><option value="modern_studio">Modern Studio</option></select></div><div className="field"><label htmlFor="cv-summary">Podsumowanie</label><textarea id="cv-summary" value={content.summary} onChange={e => setContent({ ...content, summary: e.target.value })}/></div><Link href="/profile" className="text-link">Uzupełnij i potwierdź nowe fakty</Link></section>{content.sections.map((section, index) => <section className="card" key={section.id}><div className="row between"><label className="row" style={{ fontSize: 13, margin: 0 }}><input style={{ width: "auto" }} type="checkbox" checked={!section.hidden} onChange={e => setContent({ ...content, sections: content.sections.map((s, i) => i === index ? { ...s, hidden: !e.target.checked } : s) })}/> Widoczna sekcja</label><div className="row"><button className="button secondary small" aria-label="Przesuń sekcję w górę" disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={14}/></button><button className="button secondary small" aria-label="Przesuń sekcję w dół" disabled={index === content.sections.length - 1} onClick={() => move(index, 1)}><ArrowDown size={14}/></button></div></div><input style={{ margin: "15px 0" }} aria-label="Nazwa sekcji" value={section.title} onChange={e => setContent({ ...content, sections: content.sections.map((s, i) => i === index ? { ...s, title: e.target.value } : s) })}/>{section.claims.map((claim, ci) => <div key={ci} className="field"><label htmlFor={`source-${section.id}-${ci}`}>Fakt źródłowy</label><select id={`source-${section.id}-${ci}`} value={claim.factIds.length === 1 ? claim.factIds[0] : ""} onChange={event => {const fact=state.data!.facts.find(f=>f.id===event.target.value&&confirmed(f));if(fact)setContent({...content,sections:content.sections.map((s,i)=>i===index?{...s,claims:s.claims.map((c,j)=>j===ci?{text:fact.statement,factIds:[fact.id]}:c)}:s)});}}><option value="" disabled>Wybierz potwierdzony fakt</option>{state.data!.facts.filter(confirmed).map(f=><option key={f.id} value={f.id}>{f.statement.slice(0,120)}{f.statement.length>120?"…":""}</option>)}</select><p className="helper">Wybór faktu wstawia jego potwierdzoną treść oraz prawidłowe źródło.</p><textarea aria-label={`Treść ${section.title} ${ci + 1}`} value={claim.text} onChange={e => setContent({ ...content, sections: content.sections.map((s, i) => i === index ? { ...s, claims: s.claims.map((c, j) => j === ci ? { ...c, text: e.target.value } : c) } : s) })}/><p className="helper">Fakty źródłowe: {claim.factIds.map(v => v.slice(0, 8)).join(", ")}</p></div>)}<label htmlFor={`add-fact-${section.id}`}>Dodaj potwierdzony fakt do sekcji</label><select id={`add-fact-${section.id}`} value="" onChange={event=>{const fact=state.data!.facts.find(f=>f.id===event.target.value&&confirmed(f));if(fact)setContent({...content,sections:content.sections.map((s,i)=>i===index?{...s,claims:[...s.claims,{text:fact.statement,factIds:[fact.id]}]}:s)});}}><option value="">Wybierz fakt do dodania…</option>{state.data!.facts.filter(f=>confirmed(f)&&!section.claims.some(c=>c.factIds.includes(f.id))).map(f=><option key={f.id} value={f.id}>{f.statement.slice(0,120)}{f.statement.length>120?"…":""}</option>)}</select></section>)}</div><ResumePreview resume={content}/></div></>; }
export function SettingsView() { const router = useRouter(); const state = useWorkspace(); const [confirmation, setConfirmation] = useState(""); async function remove() { state.setBusy(true); try {
    const r = await workspaceFetch("/api/account", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ confirmation }) });
    const result = await r.json();
    if (!r.ok)
        throw new Error(result.error || "Usunięcie nie powiodło się.");
    router.replace("/");
    router.refresh();
}
catch (e) {
    state.setError(e instanceof Error ? e.message : "Błąd usuwania.");
}
finally {
    state.setBusy(false);
} } return <><Header eyebrow="Twoje konto" title="Twoje dane. Twoja decyzja." description="Kontroluj eksport informacji, ustawienia konta i trwałe usunięcie danych."/><Status state={state}/><div className="stack"><section className="card"><h2>Dane osobowe i zawodowe</h2><p>Pobierz kopię informacji zapisanych na koncie: profil, fakty, odpowiedzi wywiadu, oferty i wersje CV. Prywatne dokumenty pozostają dostępne przez własne eksporty.</p><a className="button secondary" href="/api/account"><Download size={16}/> Eksportuj dane konta (JSON)</a></section><section className="card"><h2>Bezpieczeństwo konta</h2><p>W celu zmiany hasła skorzystaj z bezpiecznego linku wysłanego na adres e-mail konta.</p><Link className="button secondary" href="/login">Przejdź do odzyskiwania hasła</Link></section><section className="card"><h2>Przetwarzanie przez AI</h2><p>Skonfigurowany dostawca AI może przetwarzać treść CV, odpowiedzi i ofert pracy w celu analizy. Nie przesyłaj danych poufnych ani informacji osób trzecich. Wersje dokumentów wymagają zatwierdzenia.</p><Link href="/privacy" className="text-link">Projekt informacji o prywatności</Link></section><section className="card"><h2>Przykładowy profil</h2><p>Dodaj całkowicie fikcyjny profil i trzy oferty pracy, aby sprawdzić dopasowanie CV do różnych ról. Dane demonstracyjne będą zapisane na Twoim koncie i oznaczone źródłem „demo”.</p><button className="button secondary" disabled={state.busy} onClick={() => void state.mutate({ action: "demo" }, "Dodano przykładowy profil i oferty.")}>Dodaj dane demonstracyjne</button></section><section className="card" style={{ borderColor: "#c99494" }}><h2>Usuń konto</h2><p>To trwale usuwa konto, rekordy zawodowe i przesłane dokumenty. Pobierz kopię danych przed kontynuowaniem.</p><label htmlFor="delete-confirm">Wpisz DELETE, aby potwierdzić</label><input id="delete-confirm" value={confirmation} onChange={e => setConfirmation(e.target.value)} style={{ maxWidth: 300, display: "block", marginBottom: 15 }}/><button className="button danger" disabled={state.busy || confirmation !== "DELETE"} onClick={() => void remove()}>Trwale usuń konto i dane</button></section></div></>; }
