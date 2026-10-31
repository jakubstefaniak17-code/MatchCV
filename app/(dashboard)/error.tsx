"use client";
export default function ErrorPage({ reset }: {
    reset: () => void;
}) { return <div className="card"><h1>Nie udało się wczytać strony</h1><p>Twoje zapisane dane pozostają na koncie. Spróbuj ponownie.</p><button className="button" onClick={reset}>Spróbuj ponownie</button></div>; }
