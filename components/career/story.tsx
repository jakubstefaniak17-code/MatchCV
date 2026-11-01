"use client";
import { useCallback, useEffect, useState } from "react";
import type { FormEvent } from "react";
import { ArrowDownRight, ChevronDown, Pencil, Plus, X } from "lucide-react";
import { workspaceFetch } from "@/lib/demo/transport";
type Entity = "work_experiences" | "projects" | "achievements" | "skills" | "education" | "certifications" | "languages";
type Row = {
    id: string;
    [key: string]: unknown;
};
type Field = {
    key: string;
    label: string;
    type?: "date" | "number";
    required?: boolean;
};
const definitions: Record<Entity, {
    label: string;
    singular: string;
    fields: Field[];
}> = {
    work_experiences: { label: "Doświadczenie zawodowe", singular: "doświadczenie", fields: [{ key: "employer", label: "Pracodawca", required: true }, { key: "position", label: "Stanowisko", required: true }, { key: "start_date", label: "Od", type: "date" }, { key: "end_date", label: "Do (puste, jeśli nadal pracujesz)", type: "date" }, { key: "location", label: "Lokalizacja" }, { key: "responsibility_scope", label: "Za co odpowiadasz" }] },
    projects: { label: "Projekty", singular: "projekt", fields: [{ key: "title", label: "Nazwa projektu", required: true }, { key: "organization", label: "Organizacja" }, { key: "role", label: "Twoja rola" }, { key: "description", label: "Kontekst i rezultat" }, { key: "budget", label: "Budżet całego projektu (opcjonalnie)", type: "number" }, { key: "currency", label: "Waluta — np. PLN" }] },
    achievements: { label: "Osiągnięcia", singular: "osiągnięcie", fields: [{ key: "description", label: "Co się zmieniło dzięki Twojej pracy", required: true }, { key: "context", label: "W jakim kontekście" }, { key: "contribution", label: "Twój osobisty wkład" }, { key: "measurable_outcome", label: "Wynik (jeśli znasz)", type: "number" }, { key: "measurement_unit", label: "Jednostka wyniku" }] },
    skills: { label: "Kompetencje i narzędzia", singular: "kompetencję", fields: [{ key: "name", label: "Kompetencja lub narzędzie", required: true }, { key: "category", label: "Obszar" }, { key: "proficiency", label: "Poziom / zastosowanie" }] },
    education: { label: "Wykształcenie", singular: "wykształcenie", fields: [{ key: "institution", label: "Uczelnia / instytucja", required: true }, { key: "degree", label: "Stopień / tytuł" }, { key: "field_of_study", label: "Kierunek" }, { key: "start_date", label: "Od", type: "date" }, { key: "end_date", label: "Do", type: "date" }] },
    certifications: { label: "Certyfikaty i uprawnienia", singular: "kwalifikację", fields: [{ key: "name", label: "Nazwa", required: true }, { key: "issuer", label: "Wydawca" }, { key: "issue_date", label: "Uzyskano", type: "date" }, { key: "expiration_date", label: "Ważne do", type: "date" }] },
    languages: { label: "Języki", singular: "język", fields: [{ key: "language", label: "Język", required: true }, { key: "proficiency", label: "Poziom", required: true }, { key: "certification", label: "Certyfikat (opcjonalnie)" }] }
};
function text(value: unknown) { return typeof value === "string" || typeof value === "number" ? String(value) : ""; }
function month(value: unknown) {
    const input = text(value);
    if (!input)
        return "Nie podano";
    const parsed = new Date(input);
    return Number.isNaN(parsed.valueOf()) ? input : parsed.toLocaleDateString("pl-PL", { month: "short", year: "numeric", timeZone: "UTC" });
}
function InlineForm({ entity, row, onSaved, onCancel }: {
    entity: Entity;
    row?: Row;
    onSaved: () => Promise<void>;
    onCancel: () => void;
}) {
    const [busy, setBusy] = useState(false), [error, setError] = useState("");
    async function save(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const fields = new FormData(event.currentTarget);
        const data: Record<string, unknown> = {};
        for (const field of definitions[entity].fields) {
            const value = text(fields.get(field.key)).trim();
            data[field.key] = value ? (field.type === "number" ? Number(value) : value) : null;
        }
        setBusy(true);
        setError("");
        try {
            const response = await workspaceFetch("/api/career", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, id: row?.id, data }) });
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error || "Nie udało się zapisać. Twoje zmiany pozostają w formularzu.");
            await onSaved();
            onCancel();
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Nie udało się zapisać.");
        }
        finally {
            setBusy(false);
        }
    }
    return <form className="story-inline-form" onSubmit={save}><div className="row between"><h3>{row ? "Popraw szczegóły" : "Dodaj " + definitions[entity].singular}</h3><button type="button" className="button tertiary small" onClick={onCancel} aria-label="Zamknij edycję"><X size={16}/></button></div><div className="grid">{definitions[entity].fields.map(field => <div className="field" key={field.key}><label htmlFor={`story-${entity}-${row?.id || "new"}-${field.key}`}>{field.label}{field.required ? " *" : ""}</label><input id={`story-${entity}-${row?.id || "new"}-${field.key}`} name={field.key} required={field.required} type={field.type || "text"} step={field.type === "number" ? "any" : undefined} defaultValue={text(row?.[field.key])}/></div>)}</div>{error && <p className="notice error" role="alert">{error}</p>}<p className="helper">Zapis porządkuje historię. Prawdziwość i możliwość użycia informacji w CV sprawdzisz osobno.</p><div className="row"><button className="button" disabled={busy}>{busy ? "Zapisuję…" : "Zapisz w historii"}</button><button className="button secondary" type="button" onClick={onCancel}>Anuluj</button></div></form>;
}
export function CareerStory({ onSaved }: {
    onSaved: () => Promise<void>;
}) {
    const [data, setData] = useState<Partial<Record<Entity, Row[]>>>({}), [error, setError] = useState(""), [message, setMessage] = useState(""), [editing, setEditing] = useState<{
        entity: Entity;
        row?: Row;
    } | null>(null);
    const load = useCallback(async () => {
        try {
            const response = await workspaceFetch("/api/career");
            const result = await response.json();
            if (!response.ok)
                throw new Error(result.error || "Nie udało się wczytać historii.");
            setData(result);
            setError("");
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Nie udało się wczytać historii.");
        }
    }, []);
    useEffect(() => { queueMicrotask(() => void load()); }, [load]);
    async function saved() { await load(); await onSaved(); setMessage("Historia zapisana. Poniżej możesz sprawdzić nowe informacje i zdecydować o ich wykorzystaniu."); }
    const experiences = [...(data.work_experiences || [])].sort((a, b) => text(b.start_date).localeCompare(text(a.start_date)));
    const edit = (entity: Entity, row?: Row) => editing?.entity === entity && editing.row?.id === row?.id;
    return <section className="career-story" aria-labelledby="career-story-title"><header className="section-heading"><div><span className="eyebrow">Career story</span><h2 id="career-story-title">Rozdziały Twojej kariery.</h2><p>Stanowiska, decyzje i praca, która ma znaczenie.</p></div><button className="button secondary" onClick={() => setEditing({ entity: "work_experiences" })}><Plus size={16}/> Dodaj doświadczenie</button></header>{error && <div className="notice error" role="alert">{error} <button className="button secondary small" onClick={() => void load()}>Ponów</button></div>}{message && <p className="notice" role="status">{message}</p>}{editing?.entity === "work_experiences" && !editing.row && <InlineForm entity="work_experiences" onSaved={saved} onCancel={() => setEditing(null)}/>}<div className="career-timeline">{experiences.map((experience, index) => { const projects = (data.projects || []).filter(p => p.experience_id === experience.id || Boolean(!p.experience_id && p.organization && p.organization === experience.employer && experiences.filter(role => role.employer === experience.employer).length === 1)); const achievements = (data.achievements || []).filter(a => a.experience_id === experience.id); return <article className="career-chapter" key={experience.id}><div className="career-period"><span className="chapter-index">{String(index + 1).padStart(2, "0")}</span><span>{month(experience.start_date)}<br />— {experience.end_date ? month(experience.end_date) : "bez daty zakończenia"}</span></div><div className="career-chapter-content"><div className="row between"><div><h3>{text(experience.position) || "Stanowisko do uzupełnienia"}</h3><p className="career-employer">{text(experience.employer)}{experience.location ? ` · ${text(experience.location)}` : ""}</p></div><button className="button tertiary small" onClick={() => setEditing({ entity: "work_experiences", row: experience })} aria-label={`Edytuj ${text(experience.employer)}`}><Pencil size={15}/> Popraw</button></div>{edit("work_experiences", experience) ? <InlineForm entity="work_experiences" row={experience} onSaved={saved} onCancel={() => setEditing(null)}/> : <details className="career-chapter-details"><summary><span>Rozwiń ten rozdział</span><ChevronDown size={17}/></summary>{Boolean(experience.responsibility_scope) && <p className="career-scope">{text(experience.responsibility_scope)}</p>}{projects.length > 0 && <div className="story-linked"><h4>Powiązane projekty</h4>{projects.map(p => <p key={p.id}><strong>{text(p.title)}</strong><br />{text(p.role)}{p.description ? ` — ${text(p.description)}` : ""}</p>)}</div>}{achievements.length > 0 && <div className="story-linked"><h4>Osiągnięcia</h4><ul>{achievements.map(a => <li key={a.id}>{text(a.description)}</li>)}</ul></div>}{!experience.responsibility_scope && !projects.length && !achievements.length && <p className="helper">Dodaj zakres odpowiedzialności lub projekt, który najlepiej pokazuje Twój wkład.</p>}</details>}</div></article>; })}{!experiences.length && <div className="story-empty"><ArrowDownRight size={24}/><h3>Każda historia ma punkt wyjścia.</h3><p>Dodaj pierwsze stanowisko albo uzupełnij informacje z importu. Nie musisz odtwarzać całej kariery naraz.</p></div>}</div><div className="career-collections">{(Object.keys(definitions).filter(e => e !== "work_experiences") as Entity[]).map(entity => <section className="career-collection" key={entity}><div className="row between"><h3>{definitions[entity].label}</h3><button className="button tertiary small" onClick={() => setEditing({ entity })}><Plus size={14}/> Dodaj</button></div>{editing?.entity === entity && !editing.row && <InlineForm entity={entity} onSaved={saved} onCancel={() => setEditing(null)}/>}<div>{(data[entity] || []).map(row => <details key={row.id} className="story-entry" open={edit(entity, row) || undefined}><summary><span>{text(row[definitions[entity].fields[0].key])}</span><ChevronDown size={16}/></summary>{edit(entity, row) ? <InlineForm entity={entity} row={row} onSaved={saved} onCancel={() => setEditing(null)}/> : <><dl>{definitions[entity].fields.slice(1).filter(f => row[f.key] !== null && row[f.key] !== undefined && row[f.key] !== "").map(field => <div key={field.key}><dt>{field.label}</dt><dd>{text(row[field.key])}</dd></div>)}</dl><button className="button secondary small" onClick={() => setEditing({ entity, row })}><Pencil size={14}/> Popraw w tym miejscu</button></>}</details>)}</div>{!data[entity]?.length && !(editing?.entity === entity) && <p className="helper">Ten rozdział możesz uzupełnić później.</p>}</section>)}</div></section>;
}
