"use client";
import {Button} from "@/components/ui/button";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Brand } from "./shell";
const schema = z.object({ email: z.string().email(), password: z.string().min(10) });
export function AuthForm({ mode }: {
    mode: "login" | "register" | "updatePassword";
}) { const router = useRouter(); const { register, handleSubmit } = useForm<{
    email: string;
    password: string;
}>(); const [message, setMessage] = useState(""); const [busy, setBusy] = useState(false); const [reset, setReset] = useState(false); const action = reset ? "reset" : mode; async function submit(values: {
    email: string;
    password: string;
}) { setBusy(true); setMessage(""); if (action !== "reset" && action !== "updatePassword" && !schema.safeParse(values).success) {
    setMessage("Podaj poprawny e-mail i hasło o długości co najmniej 10 znaków.");
    setBusy(false);
    return;
} try {
    const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(action === "reset" ? { action, email: values.email } : action === "updatePassword" ? { action, password: values.password } : { action, ...values }) });
    const data = await response.json();
    if (!response.ok)
        throw new Error(data.error || "Nie udało się zakończyć operacji.");
    if (mode === "login" && !reset || mode === "updatePassword" || mode === "register" && data.verificationRequired === false) {
        router.replace("/dashboard");
        router.refresh();
        return;
    }
    setMessage(data.message || "Sprawdź swoją skrzynkę e-mail, aby kontynuować.");
}
catch (e) {
    setMessage(e instanceof Error ? e.message : "Wystąpił błąd.");
}
finally {
    setBusy(false);
} } return <main className="auth-shell"><Brand /><div className="card"><span className="eyebrow">Twój kolejny krok</span><h1 style={{ marginTop: 15 }}>{reset ? "Odzyskaj dostęp" : mode === "register" ? "Zacznij swoją historię" : mode === "updatePassword" ? "Ustaw nowe hasło" : "Dobrze Cię widzieć"}</h1><p>{mode === "register" ? "Uporządkuj doświadczenie i przygotuj CV oparte na faktach." : "Wróć do swojego profilu zawodowego."}</p><form onSubmit={handleSubmit(submit)}>{mode !== "updatePassword" && <div className="field"><label htmlFor="email">Adres e-mail</label><input id="email" type="email" autoComplete="email" required {...register("email")}/></div>}{!reset && <div className="field"><label htmlFor="password">Hasło</label><input id="password" type="password" minLength={10} required autoComplete={mode === "login" ? "current-password" : "new-password"} {...register("password")}/><p className="helper">Co najmniej 10 znaków.</p></div>}{message && <p role="status" className="notice">{message}</p>}<Button disabled={busy} className="button" style={{ width: "100%" }}>{busy ? "Chwilę…" : reset ? "Wyślij link" : mode === "register" ? "Utwórz konto" : mode === "updatePassword" ? "Zapisz hasło" : "Zaloguj się"}</Button></form>{mode === "login" && <button className="text-link" style={{ border: 0, background: "none", padding: 0, marginTop: 18 }} onClick={() => { setReset(!reset); setMessage(""); }}>{reset ? "Wróć do logowania" : "Nie pamiętasz hasła?"}</button>}<p className="helper" style={{ marginTop: 20 }}>{mode === "register" ? <>Masz konto? <Link className="text-link" href="/login">Zaloguj się</Link></> : <>Nie masz konta? <Link className="text-link" href="/register">Utwórz konto</Link></>}</p><p className="helper">AI może przetwarzać przesłane informacje zawodowe. Zapoznaj się z <Link className="text-link" href="/privacy">informacją o prywatności</Link> i <Link className="text-link" href="/terms">regulaminem</Link>.</p></div></main>; }
