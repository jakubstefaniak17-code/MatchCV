import Link from 'next/link';
import {isConfigured,requireUser} from '@/lib/auth/server';
import {SetupProvider} from '@/components/onboarding/provider';
import {SetupChrome} from '@/components/onboarding/chrome';
export const dynamic='force-dynamic';
export default async function OnboardingLayout({children}:{children:React.ReactNode}){
 if(!isConfigured())return <main className="legal"><h1>Połącz MatchCV z Supabase.</h1><p>Konfiguracja profilu wymaga bezpiecznego konta i bazy danych. Nie zapisujemy jej wyłącznie w przeglądarce.</p><Link className="button" href="/login">Przejdź do logowania</Link></main>;
 await requireUser();return <SetupProvider><SetupChrome>{children}</SetupChrome></SetupProvider>;
}
