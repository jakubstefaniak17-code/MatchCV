import Link from "next/link";
import {redirect} from "next/navigation";
import {getOnboarding} from "@/lib/onboarding/repository";
import {needsOnboarding,setupDestination} from "@/lib/onboarding/status";
import { requireUser } from "@/lib/auth/server";
import { Shell } from "@/components/shell";
export const dynamic = "force-dynamic";
export default async function DashboardLayout({ children }: {
    children: React.ReactNode;
}) { if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
    return <main className="legal"><h1>MatchCV — konfiguracja</h1><p>Połącz projekt z Supabase, aby bezpiecznie zapisywać swój profil i tworzyć CV.</p><div className="card"><h2>Brakuje konfiguracji środowiska</h2><p>Ustaw NEXT_PUBLIC_SUPABASE_URL i NEXT_PUBLIC_SUPABASE_ANON_KEY, uruchom migracje i skonfiguruj adresy przekierowań zgodnie z README.</p><Link href="/" className="button secondary">Strona główna</Link></div></main>; const { user, db } = await requireUser();
    let progress;
    try { progress=await getOnboarding(db,user.id); }
    catch { return <main className="legal"><h1>Nie udało się odczytać Twojej konfiguracji</h1><p>Nie resetujemy zapisanego postępu. Spróbuj ponownie. Jeżeli problem trwa, operator powinien sprawdzić migrację onboarding_progress i połączenie z bazą.</p><Link href="/dashboard" className="button">Spróbuj ponownie</Link></main>; }
    if(needsOnboarding(progress))redirect(setupDestination(progress));
    return <Shell email={user.email}>{children}</Shell>; }
