"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Download, Eye, FileText, Pencil, Trash2 } from "lucide-react";
import { workspaceFetch, demoPath } from "@/lib/demo/transport";
import { summaryLabel, templateLabels, type Resume } from "@/lib/resume/engine";
import { Header, Loading, Status, confirmed, useWorkspace } from "@/components/workspace-state";
type Claim = Resume["sections"][number]["claims"][number];
function dateLabel(value: string | null | undefined, language: "pl" | "en") { if (!value)
    return ""; if (!/^\d{4}-\d{2}(?:-\d{2})?$/.test(value))
    return value; const [year, month] = value.split("-"); if (Number(month) < 1 || Number(month) > 12)
    return value; return language === "pl" ? `${month}.${year}` : `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][Number(month) - 1]} ${year}`; }
function dateRange(start: string | null | undefined, end: string | null | undefined, isCurrent: boolean | undefined, language: "pl" | "en") { return [dateLabel(start, language), isCurrent ? (language === "pl" ? "obecnie" : "present") : dateLabel(end, language)].filter(Boolean).join(" – ") || (language === "pl" ? "Brak dat" : "Dates not provided"); }
export function ResumePreview({ resume }: {
    resume: Resume;
}) {
    const employment = resume.employment || [];
    const showEmployment = employment.length > 0 && resume.sections.some(section => section.id === "experience" && !section.hidden);
    return <article className={`resume-paper ${resume.template}`} aria-label="Podgląd CV"><h1 className="resume-name">{resume.person?.name || resume.headline}</h1>{resume.person?.name && <p className="resume-role">{resume.headline}</p>}{Boolean(resume.person?.contact.length) && <p className="resume-contact">{resume.person!.contact.join(" · ")}</p>}{resume.summary.trim() && <><h2>{summaryLabel(resume.language, resume.template)}</h2><p className="resume-summary">{resume.summary}</p></>}{resume.sections.filter(section => !section.hidden && (section.claims.length || (section.id === "experience" && showEmployment))).map(section => { const displayedEmployment = section.id === "experience" && showEmployment; const statements = new Set(displayedEmployment ? employment.flatMap(role => role.claims.map(claim => claim.text)) : []); return <section key={section.id} data-section-id={section.id}><h2>{section.title}</h2>{displayedEmployment && employment.map(role => <div className="resume-employment" key={role.id}><div className="resume-employment-heading"><strong>{role.position} · {role.employer}</strong><span>{dateRange(role.startDate, role.endDate, role.isCurrent, resume.language)}</span></div>{role.location && <p className="resume-employer">{role.location}</p>}<ul>{role.claims.map((claim, index) => <li key={index}>{claim.text}</li>)}</ul></div>)}{section.claims.some(claim => !statements.has(claim.text)) && <ul>{section.claims.filter(claim => !statements.has(claim.text)).map((claim, index) => <li key={index}>{claim.text}</li>)}</ul>}</section>; })}</article>;
}
export function CvEditor({ id }: {
    id: string;
}) {
    const state = useWorkspace();
    const [content, setContent] = useState<Resume | null>(null), [dirty, setDirty] = useState(false), [tab, setTab] = useState<"preview" | "edit">("preview"), [format, setFormat] = useState<"pdf" | "docx">("pdf");
    const loaded = useRef("");
    useEffect(() => {
        const cv = state.data?.cvs.find(row => row.id === id);
        if (cv && loaded.current !== id) {
            loaded.current = id;
            queueMicrotask(() => { setContent(cv.content); setDirty(false); });
        }
    }, [id, state.data]);
    if (!state.data)
        return <Loading state={state}/>;
    const cv = state.data.cvs.find(row => row.id === id);
    if (!cv || !content)
        return <div className="editor-empty"><h1>Nie znaleziono dokumentu.</h1><Link className="text-link" href={demoPath("/cv")}>Wróć do dokumentów</Link></div>;
    const facts = state.data.facts;
    const safe = facts.filter(confirmed);
    function update(next: Resume) { setContent(next); setDirty(true); state.setMessage(""); }
    function updateClaim(sectionIndex: number, claimIndex: number, next: Claim) {
        if (!content)
            return;
        update({ ...content, sections: content.sections.map((section, index) => index === sectionIndex ? { ...section, claims: section.claims.map((claim, i) => i === claimIndex ? next : claim) } : section) });
    }
    function move(index: number, direction: number) {
        if (!content)
            return;
        const sections = [...content.sections];
        const target = index + direction;
        if (target < 0 || target >= sections.length)
            return;
        [sections[index], sections[target]] = [sections[target], sections[index]];
        update({ ...content, sections });
    }
    async function save(approved = false) {
        if (!content)
            return false;
        const candidate = content.summaryClaims ? { ...content, summary: content.summaryClaims.map(claim => claim.text).join("\n") } : content;
        const result = await state.mutate({ action: "saveCv", id, content: candidate, approved }, approved ? "Treść sprawdzona i zatwierdzona." : "Szkic zapisany. Możesz wrócić do niego później.");
        if (result) {
            setContent(candidate);
            setDirty(false);
            return true;
        }
        return false;
    }
    async function download() {
        if (!content)
            return;
        state.setError("");
        if ((dirty || !cv?.approved) && !await save(true))
            return;
        state.setBusy(true);
        try {
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
            setTimeout(() => URL.revokeObjectURL(url), 1000);
        }
        catch (error) {
            state.setError(error instanceof Error ? error.message : "Nie udało się pobrać dokumentu. Spróbuj ponownie.");
        }
        finally {
            state.setBusy(false);
        }
    }
    function changeSummary(text: string) {
        if (!content)
            return;
        const previous = content.summaryClaims || content.summary.split("\n").filter(Boolean).map(line => ({ text: line, factIds: safe.filter(f => f.statement === line).map(f => f.id) }));
        const ids = [...new Set(previous.flatMap(claim => claim.factIds))];
        update({ ...content, summary: text, summaryClaims: text.split("\n").filter(Boolean).map((line, index) => ({ text: line, factIds: previous[index]?.factIds.length ? previous[index].factIds : ids, editorialApproved: false })) });
    }
    function claimEditor(claim: Claim, onChange: (next: Claim) => void, onDelete: () => void, label: string) {
        return <div className="editor-claim" key={label}><label>{label}<textarea value={claim.text} onChange={event => onChange({ ...claim, text: event.target.value, editorialApproved: false })}/></label><div className="editor-claim-tools"><label className="editor-approval"><input type="checkbox" style={{ width: "auto" }} checked={Boolean(claim.editorialApproved)} onChange={event => onChange({ ...claim, editorialApproved: event.target.checked })}/> Potwierdzam brzmienie bez zmiany faktów</label><button type="button" className="button tertiary small" onClick={onDelete} aria-label={`Usuń wpis ${label}`}><Trash2 size={15}/></button></div><details className="editor-source"><summary>Na czym się opieramy?</summary>{claim.factIds.map(sourceId => { const source = facts.find(f => f.id === sourceId); return source ? <blockquote key={sourceId}>{source.statement}<span>{source.source_type === "import" ? "Z przesłanego CV" : source.source_type === "interview" ? "Z Twojej odpowiedzi" : "Z Twojej historii"}</span></blockquote> : <p key={sourceId} className="helper">Źródło nie jest już dostępne. Przed eksportem wybierz aktualne potwierdzone informacje.</p>; })}<label>Użyj innej potwierdzonej informacji<select value="" onChange={event => {
                const fact = safe.find(f => f.id === event.target.value);
                if (fact)
                    onChange({ text: fact.statement, factIds: [fact.id], editorialApproved: true });
            }}><option value="">Wybierz źródło…</option>{safe.map(f => <option key={f.id} value={f.id}>{f.statement.slice(0, 110)}</option>)}</select></label></details></div>;
    }
    return <div className="document-workspace"><Header eyebrow="Pracownia dokumentu" title={cv.title} description="Dopracuj język, sprawdź historię i pobierz dokument."/><Status state={state}/>{content.generation && content.generation.mode === "basic" && <p className="notice warning"><strong>Prosty szkic oparty na faktach.</strong> Ten dokument nie przeszedł pełnej redakcji AI. Sprawdź język i kompletność przed użyciem.</p>}{content.generation?.warnings?.map((warning, index) => <p className="notice warning" key={index}>{warning}</p>)}<div className="document-toolbar"><div className="row"><span className="document-save-state">{dirty ? "Niezapisane zmiany" : cv.approved ? "Sprawdzono i zapisano" : "Szkic zapisany"}</span><button className="button tertiary" disabled={state.busy} onClick={() => void save(false)}>Zapisz szkic</button></div><div className="row"><select aria-label="Format dokumentu" value={format} onChange={event => setFormat(event.target.value as "pdf" | "docx")}><option value="pdf">PDF</option><option value="docx">DOCX</option></select><button className="button" disabled={state.busy} onClick={() => void download()}><Download size={16}/>{state.busy ? "Przygotowuję…" : "Sprawdź i pobierz"}</button></div></div><div className="document-mobile-tabs" role="tablist" aria-label="Widok dokumentu"><button role="tab" aria-selected={tab === "preview"} onClick={() => setTab("preview")}><Eye size={16}/> Podgląd</button><button role="tab" aria-selected={tab === "edit"} onClick={() => setTab("edit")}><Pencil size={16}/> Edycja</button></div><div className="document-editor" data-mobile-tab={tab}><aside className="document-controls"><section className="editor-intro"><span className="eyebrow">Redakcja</span><h2>Twoja historia,<br />dobrze opowiedziana.</h2><p>Możesz zmieniać styl bez tworzenia nowych informacji. Nowe liczby, kwalifikacje i osiągnięcia wymagają potwierdzenia w karierze.</p><label htmlFor="editor-template">Szablon<select id="editor-template" value={content.template} onChange={event => update({ ...content, template: event.target.value as Resume["template"] })}>{Object.entries(templateLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></section><details className="editor-section" open><summary><span>Podsumowanie zawodowe</span><Pencil size={15}/></summary><label htmlFor="editor-summary">O czym ma opowiadać wstęp?<textarea id="editor-summary" value={content.summary} onChange={event => changeSummary(event.target.value)}/></label><label className="editor-approval"><input type="checkbox" style={{ width: "auto" }} checked={Boolean(content.summaryClaims?.length && content.summaryClaims.every(claim => claim.editorialApproved))} onChange={event => update({ ...content, summaryClaims: (content.summaryClaims || []).map(claim => ({ ...claim, editorialApproved: event.target.checked })) })}/> Potwierdzam brzmienie podsumowania bez zmiany faktów</label></details>{content.sections.map(section => {
            const index = content.sections.findIndex(s => s.id === section.id);
            return <details className="editor-section" key={section.id}><summary><span>{section.title}</span><span className="helper">{section.hidden ? "Ukryta" : ""}</span></summary><div className="row between"><label className="row"><input type="checkbox" style={{ width: "auto" }} checked={!section.hidden} onChange={event => update({ ...content, sections: content.sections.map((item, i) => i === index ? { ...item, hidden: !event.target.checked } : item) })}/> Pokaż w dokumencie</label><div className="row"><button type="button" className="button tertiary small" aria-label={`Przesuń ${section.title} w górę`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp size={15}/></button><button type="button" className="button tertiary small" aria-label={`Przesuń ${section.title} w dół`} disabled={index === content.sections.length - 1} onClick={() => move(index, 1)}><ArrowDown size={15}/></button></div></div>{section.id === "experience" && content.employment?.map((role, roleIndex) => <section className="editor-employment" key={role.id}><h3>{role.position}</h3><p className="helper">{role.employer} · {dateRange(role.startDate, role.endDate, role.isCurrent, content.language)}</p>{role.claims.map((claim, index) => claimEditor(claim, next => update({ ...content, employment: content.employment!.map((item, i) => i === roleIndex ? { ...item, claims: item.claims.map((c, j) => j === index ? next : c) } : item) }), () => update({ ...content, employment: content.employment!.map((item, i) => i === roleIndex ? { ...item, claims: item.claims.filter((_, j) => j !== index) } : item) }), `${role.position} — opis ${index + 1}`))}</section>)}{section.claims.map((claim, claimIndex) => claimEditor(claim, next => updateClaim(index, claimIndex, next), () => update({ ...content, sections: content.sections.map((item, i) => i === index ? { ...item, claims: item.claims.filter((_, j) => j !== claimIndex) } : item) }), `${section.title} — wpis ${claimIndex + 1}`))}<label>Dodaj potwierdzoną informację<select value="" onChange={event => {
                    const fact = safe.find(f => f.id === event.target.value);
                    if (fact)
                        update({ ...content, sections: content.sections.map((item, i) => i === index ? { ...item, claims: [...item.claims, { text: fact.statement, factIds: [fact.id], editorialApproved: true }] } : item) });
                }}><option value="">Wybierz z historii…</option>{safe.filter(f => !section.claims.some(claim => claim.factIds.includes(f.id))).map(f => <option key={f.id} value={f.id}>{f.statement.slice(0, 110)}</option>)}</select></label></details>;
        })}<Link href={demoPath("/profile")} className="editor-career-link"><FileText size={17}/> Uzupełnij historię kariery</Link></aside><div className="document-preview"><div className="document-preview-label"><span>Podgląd dokumentu</span><span>{templateLabels[content.template]}</span></div><ResumePreview resume={content}/><p className="helper">Podział stron jest ustalany przy eksporcie. Podgląd pokazuje treść i kolejność sekcji.</p></div></div></div>;
}
