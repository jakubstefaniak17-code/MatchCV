"use client";
import {workspaceFetch} from "@/lib/demo/transport";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
type Entity = "work_experiences" | "projects" | "achievements" | "skills" | "education" | "certifications" | "languages";
type EntityRow = {
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
    fields: Field[];
}> = {
    work_experiences: { label: "Doświadczenie zawodowe", fields: [{ key: "employer", label: "Pracodawca", required: true }, { key: "position", label: "Stanowisko", required: true }, { key: "start_date", label: "Data rozpoczęcia", type: "date" }, { key: "end_date", label: "Data zakończenia", type: "date" }, { key: "location", label: "Lokalizacja" }, { key: "department", label: "Dział" }, { key: "responsibility_scope", label: "Zakres odpowiedzialności" }] },
    projects: { label: "Projekty", fields: [{ key: "title", label: "Nazwa projektu", required: true }, { key: "organization", label: "Organizacja" }, { key: "description", label: "Opis" }, { key: "role", label: "Twoja rola" }, { key: "budget", label: "Budżet", type: "number" }, { key: "currency", label: "Waluta (np. PLN)" }, { key: "team_size", label: "Wielkość zespołu", type: "number" }] },
    achievements: { label: "Osiągnięcia", fields: [{ key: "description", label: "Opis osiągnięcia", required: true }, { key: "context", label: "Kontekst" }, { key: "contribution", label: "Twój wkład" }, { key: "measurable_outcome", label: "Wynik liczbowy", type: "number" }, { key: "measurement_unit", label: "Jednostka" }, { key: "supporting_evidence", label: "Źródło dowodu" }] },
    skills: { label: "Kompetencje", fields: [{ key: "name", label: "Nazwa", required: true }, { key: "category", label: "Kategoria" }, { key: "proficiency", label: "Poziom" }, { key: "years_experience", label: "Lata doświadczenia", type: "number" }] },
    education: { label: "Wykształcenie", fields: [{ key: "institution", label: "Uczelnia / instytucja", required: true }, { key: "degree", label: "Stopień / tytuł" }, { key: "field_of_study", label: "Kierunek" }, { key: "start_date", label: "Od", type: "date" }, { key: "end_date", label: "Do", type: "date" }, { key: "specialization", label: "Specjalizacja" }] },
    certifications: { label: "Certyfikaty i kwalifikacje", fields: [{ key: "name", label: "Nazwa", required: true }, { key: "issuer", label: "Instytucja wydająca" }, { key: "issue_date", label: "Data uzyskania", type: "date" }, { key: "expiration_date", label: "Data ważności", type: "date" }, { key: "credential_id", label: "Numer dokumentu" }] },
    languages: { label: "Języki", fields: [{ key: "language", label: "Język", required: true }, { key: "proficiency", label: "Poziom (np. B2)", required: true }, { key: "certification", label: "Certyfikat" }] }
};
export function EntityEditor({ onSaved }: {
    onSaved?: () => Promise<void>;
}) { const [entity, setEntity] = useState<Entity>("work_experiences"); const [records, setRecords] = useState<Partial<Record<Entity, EntityRow[]>>>({}); const [editing, setEditing] = useState<EntityRow | null>(null); const [error, setError] = useState(""); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); async function load() { try {
    const response = await workspaceFetch("/api/career");
    const data = await response.json();
    if (!response.ok)
        throw new Error(data.error || "Nie udało się pobrać profilu.");
    setRecords(data);
}
catch (e) {
    setError(e instanceof Error ? e.message : "Błąd wczytywania.");
} } useEffect(() => { queueMicrotask(() => void load()); }, []); async function save(event: FormEvent<HTMLFormElement>) { event.preventDefault(); const form = event.currentTarget; const values = new FormData(form); const data: Record<string, unknown> = {}; for (const field of definitions[entity].fields) {
    const value = String(values.get(field.key) || "").trim();
    if (value)
        data[field.key] = field.type === "number" ? Number(value) : value;
    else if (editing)
        data[field.key] = null;
} setBusy(true); setError(""); try {
    const response = await workspaceFetch("/api/career", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, id: editing?.id, data }) });
    const result = await response.json();
    if (!response.ok)
        throw new Error(result.error || "Nie udało się zapisać rekordu.");
    setEditing(null);
    form.reset();
    setMessage("Rekord zapisany. Sprawdź powiązane fakty i potwierdź je w rejestrze przed użyciem w CV.");
    await load();
    await onSaved?.();
}
catch (e) {
    setError(e instanceof Error ? e.message : "Błąd zapisu.");
}
finally {
    setBusy(false);
} } async function remove(id: string) { setBusy(true); setError(""); try {
    const response = await workspaceFetch("/api/career", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entity, id }) });
    const result = await response.json();
    if (!response.ok)
        throw new Error(result.error || "Nie udało się usunąć rekordu.");
    await load();
    setMessage("Rekord usunięty.");
}
catch (e) {
    setError(e instanceof Error ? e.message : "Błąd usuwania.");
}
finally {
    setBusy(false);
} } return <section className="card"><h2>Struktura Twojej kariery</h2><p className="helper">Pracodawcy, projekty i kwalifikacje pozostają oddzielnymi rekordami. Zapis rekordu nie potwierdza automatycznie jego treści.</p><select aria-label="Rodzaj informacji zawodowej" value={entity} onChange={event => { setEntity(event.target.value as Entity); setEditing(null); setMessage(""); }}>{Object.entries(definitions).map(([key, v]) => <option key={key} value={key}>{v.label}</option>)}</select>{error && <p role="alert" className="notice error" style={{ marginTop: 15 }}>{error}</p>}{message && <p role="status" className="notice" style={{ marginTop: 15 }}>{message}</p>}<div style={{ margin: "12px 0 25px" }}>{records[entity]?.length ? records[entity]!.map(record => <div className="list-item" key={record.id}><div><strong>{String(record[definitions[entity].fields[0].key] || "Rekord")}</strong><p className="helper" style={{ margin: 0 }}>{definitions[entity].fields.slice(1, 3).map(field => record[field.key]).filter(Boolean).join(" · ")}</p></div><div className="row"><button className="button secondary small" disabled={busy} onClick={() => setEditing(record)}>Edytuj</button><button className="button secondary small" disabled={busy} onClick={() => void remove(record.id)}>Usuń</button></div></div>) : <p className="helper" style={{ marginTop: 15 }}>Nie dodano jeszcze rekordów w tym obszarze.</p>}</div><h3>{editing ? "Edytuj rekord" : "Dodaj rekord"}</h3><form key={`${entity}:${editing?.id || "new"}`} onSubmit={save}><div className="grid">{definitions[entity].fields.map(field => <div className="field" key={field.key}><label htmlFor={`entity-${field.key}`}>{field.label}{field.required ? " *" : ""}</label><input id={`entity-${field.key}`} name={field.key} type={field.type || "text"} step={field.type === "number" ? "any" : undefined} required={field.required} defaultValue={editing?.[field.key] === null ? "" : String(editing?.[field.key] ?? "")}/></div>)}</div><div className="row"><button className="button" disabled={busy}>{busy ? "Zapisywanie…" : "Zapisz rekord"}</button>{editing && <button type="button" className="button secondary" onClick={() => setEditing(null)}>Anuluj edycję</button>}</div></form></section>; }
