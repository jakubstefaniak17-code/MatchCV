"use client";
import { workspaceFetch } from "@/lib/demo/transport";
import { useCallback, useEffect, useState } from "react";
import type { Fact, JobAnalysis, Resume, EvidenceMapping } from "@/lib/resume/engine";
import { normalizeLegacyResume } from "@/lib/resume/engine";
export type CareerProfile = {
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
export type SavedFact = Fact & {
    structured_value?: {
        source_quote?: string;
        information_kind?: string;
        coverage_confirmed?: boolean;
        question_coverage?: {
            question_id: string;
            coverage: string;
            rationale?: string;
        }[];
    };
    source_type?: string;
    source_reference?: string;
    created_at?: string;
};
export type Answer = {
    question_id: string;
    answer: string;
    status: "answered" | "skipped";
};
export type Job = {
    id: string;
    title: string;
    employer?: string;
    original_text: string;
    analysis: JobAnalysis;
    created_at?: string;
    evidence?: EvidenceMapping[];
};
export type Cv = {
    id: string;
    title: string;
    language: string;
    template: string;
    content: Resume;
    approved: boolean;
    job_offer_id?: string;
    created_at?: string;
};
export type Workspace = {
    profile: CareerProfile | null;
    facts: SavedFact[];
    answers: Answer[];
    jobs: Job[];
    cvs: Cv[];
    aiConfigured: boolean;
};
export type ApiResult = {
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
async function request(payload: Record<string, unknown>): Promise<ApiResult> {
    const response = await workspaceFetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const result = await response.json();
    if (!response.ok)
        throw new Error(result.error || "Nie udało się zapisać zmian.");
    return result;
}
export function useWorkspace() {
    const [data, setData] = useState<Workspace | null>(null);
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");
    const [busy, setBusy] = useState(false);
    const reload = useCallback(async () => {
        try {
            const r = await workspaceFetch("/api/workspace", { cache: "no-store" });
            const v = await r.json();
            if (!r.ok)
                throw new Error(v.error || "Nie udało się pobrać danych.");
            setData({ ...v, cvs: v.cvs.map((cv: Cv) => ({ ...cv, content: normalizeLegacyResume(cv.content) })) });
            setError("");
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Wystąpił błąd.");
        }
    }, []);
    useEffect(() => { queueMicrotask(() => { void reload(); const warning = sessionStorage.getItem("matchcv-operation-warning"); if (warning) {
        setMessage(warning);
        sessionStorage.removeItem("matchcv-operation-warning");
    } }); }, [reload]);
    async function mutate(payload: Record<string, unknown>, success = "Zmiany zapisane.") {
        setBusy(true);
        setError("");
        setMessage("");
        try {
            const result = await request(payload);
            await reload();
            setMessage(result.warning || result.message || success);
            if (result.warning && (payload.action === "analyzeJob" || payload.action === "generate"))
                sessionStorage.setItem("matchcv-operation-warning", result.warning);
            return result;
        }
        catch (e) {
            setError(e instanceof Error ? e.message : "Wystąpił błąd.");
            return null;
        }
        finally {
            setBusy(false);
        }
    }
    return { data, error, message, busy, reload, mutate, setError, setMessage, setBusy };
}
export type State = ReturnType<typeof useWorkspace>;
export function Status({ state }: {
    state: State;
}) { return <>{state.error && <p role="alert" className="notice error">{state.error}</p>}{state.message && <p role="status" className="notice">{state.message}</p>}</>; }
export function Loading({ state }: {
    state: State;
}) { return state.error ? <div className="card"><Status state={state}/><button className="button secondary" onClick={() => void state.reload()}>Spróbuj ponownie</button></div> : <div className="stack" aria-label="Wczytywanie danych"><div className="skeleton"/><div className="skeleton"/></div>; }
export function Header({ eyebrow, title, description, children }: {
    eyebrow?: string;
    title: string;
    description: string;
    children?: React.ReactNode;
}) { return <header className="page-header"><div className="row between"><div>{eyebrow && <div className="eyebrow" style={{ marginBottom: 12 }}>{eyebrow}</div>}<h1>{title}</h1><p style={{ marginBottom: 0 }}>{description}</p></div>{children}</div></header>; }
export function date(value?: string) { return value ? new Date(value).toLocaleDateString("pl-PL") : ""; }
export const factLabels: Record<string, string> = { imported_unconfirmed: "Do sprawdzenia", user_provided: "Podane przez Ciebie", user_confirmed: "Potwierdzone", document_supported: "Poparte dokumentem", disputed: "Sporne", rejected: "Odrzucone" };
export const typeLabels: Record<string, string> = { experience: "Doświadczenie", project: "Projekt", achievement: "Osiągnięcie", skill: "Kompetencja", education: "Wykształcenie", certification: "Certyfikat", language: "Język", other: "Inne", identity: "Imię i nazwisko", contact: "Dane kontaktowe" };
export function confirmed(f: Fact) { return ["user_confirmed", "document_supported"].includes(f.verification_status) && !f.excluded && !f.confidential && !f.private && !f.forbidden_for_cv; }
