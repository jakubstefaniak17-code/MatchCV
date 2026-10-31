import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "MatchCV — Career intelligence", description: "Opowiedz swoją historię zawodową raz. Twórz CV oparte na faktach." };
export default function RootLayout({ children }: {
    children: React.ReactNode;
}) { return <html lang="pl" suppressHydrationWarning><body>{children}</body></html>; }
