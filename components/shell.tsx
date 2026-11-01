"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowUpRight, BookOpen, ChevronDown, FilePenLine, Files, LogOut, Moon, Settings, Sun, UserRound } from "lucide-react";
const areas = [{ href: "/profile", label: "Moja kariera", section: "career", icon: BookOpen }, { href: "/jobs/new", label: "Stwórz CV", section: "create", icon: FilePenLine }, { href: "/cv", label: "Moje dokumenty", section: "documents", icon: Files }];
export function Brand() { return <Link href="/" className="brand" aria-label="MatchCV — strona główna"><span className="brand-mark" aria-hidden="true"><span /></span><span className="brand-wordmark">match<span>cv</span></span></Link>; }
export function Shell({ children, email, demo = false }: {
    children: React.ReactNode;
    email?: string;
    demo?: boolean;
}) {
    const router = useRouter(), raw = usePathname();
    const path = demo ? raw.replace(/^\/demo/, "") || "/dashboard" : raw;
    const selected = path.startsWith("/jobs") || path === "/cv/new" ? areas[1] : path.startsWith("/cv") ? areas[2] : areas[0];
    const [dark, setDark] = useState(false), [error, setError] = useState(""), [busy, setBusy] = useState(false);
    const destination = (href: string) => demo ? `/demo${href}` : href;
    useEffect(() => { let value = false; try {
        value = localStorage.getItem("matchcv-theme") === "dark";
    }
    catch { } queueMicrotask(() => setDark(value)); document.documentElement.dataset.theme = value ? "dark" : "light"; }, []);
    function theme() { const value = !dark; setDark(value); document.documentElement.dataset.theme = value ? "dark" : "light"; try {
        localStorage.setItem("matchcv-theme", value ? "dark" : "light");
    }
    catch { } }
    async function logout() { setBusy(true); setError(""); try {
        const response = await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
        if (!response.ok)
            throw new Error("Nie udało się wylogować. Spróbuj ponownie.");
        router.replace("/login");
        router.refresh();
    }
    catch (e) {
        setError(e instanceof Error ? e.message : "Nie udało się wylogować.");
    }
    finally {
        setBusy(false);
    } }
    return <><a href="#main-content" className="skip-link">Przejdź do treści</a><aside className="sidebar atelier-sidebar"><Brand /><div className="sidebar-desktop"><div className="sidebar-label">Twoje atelier kariery</div><nav className="nav" aria-label="Nawigacja główna">{areas.map(({ href, label, section, icon: Icon }) => <Link key={section} href={destination(href)} data-section={section} aria-current={selected.section === section ? "page" : undefined} className={selected.section === section ? "active" : ""}><Icon size={19} strokeWidth={1.6}/>{label}<ArrowUpRight className="nav-arrow" size={14}/></Link>)}</nav></div><div className="sidebar-bottom atelier-sidebar-note"><span className="eyebrow">Każdy rozdział ma znaczenie</span><p>Opowiedz raz.<br /><em>Przygotuj się na kolejną szansę.</em></p><div><Link href="/privacy">Prywatność</Link><span> · </span><Link href="/terms">Regulamin</Link></div></div></aside><div className="workspace"><header className="topbar atelier-topbar"><div className="topbar-context"><Link href={destination("/profile")}>MatchCV</Link><span aria-hidden="true"> / </span><strong>{path === "/settings" ? "Ustawienia konta" : selected.label}</strong></div><div className="topbar-account">{demo && <span className="topbar-demo">DANE FIKCYJNE</span>}<details className="account-menu"><summary aria-label="Menu konta"><span className="account-avatar"><UserRound size={17}/></span><span className="account-menu-label">Moje konto</span><ChevronDown size={13}/></summary><div className="account-menu-panel">{email && <p>{email}</p>}<Link href={destination("/settings")}><Settings size={16}/> Ustawienia i dane</Link><button onClick={theme}>{dark ? <Sun size={16}/> : <Moon size={16}/>} {dark ? "Jasny motyw" : "Ciemny motyw"}</button>{!demo && <button disabled={busy} onClick={() => void logout()}><LogOut size={16}/> {busy ? "Wylogowuję…" : "Wyloguj"}</button>}<Link href="/privacy">Informacje o prywatności</Link></div></details></div></header><main className="main" id="main-content">{error && <p className="notice error" role="alert">{error}</p>}{children}</main></div><nav className="mobile-nav atelier-mobile-nav" aria-label="Nawigacja mobilna">{areas.map(({ href, label, section, icon: Icon }) => <Link key={section} href={destination(href)} data-section={section} aria-current={selected.section === section ? "page" : undefined} className={selected.section === section ? "active" : ""}><Icon size={20} strokeWidth={1.7}/><span>{label}</span></Link>)}</nav></>;
}
