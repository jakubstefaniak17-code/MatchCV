# MatchCV — Product Kit v1.0

Zawartość paczki (wersja robocza, dane przykładowe):

## 01_Wywiad
- `MatchCV_Wywiad_40_pytan.docx` — 40 pytań po polsku, podpowiedzi i instrukcje dla AI.
- `Wywiad_40_pytan.md` — czytelny tekst specyfikacji.
- `matchcv_interview_40.json` — zdefiniowane pytania, typy odpowiedzi i metadane wdrożeniowe.
- `matchcv_answers_empty.json` — pusty, nieosobowy format odpowiedzi.

## 02_UX_UI
- `MatchCV_UX_UI_Blueprint.docx` — projekt doświadczenia, paleta, typografia, widoki, mikrointerakcje i testy.
- `MatchCV_UX_UI_Blueprint.md` — wersja dla repozytorium.
- `MatchCV_UI_Podglad.html` — responsywny, interaktywny podgląd 4 ekranów w stylu Calm Confidence.

## 03_Szablony_CV
- `CV_01_Executive_Clarity.docx` i `CV_02_Modern_Studio.docx` — edytowalne szablony na fikcyjnych danych.
- `CV_01_Executive_Clarity.pdf` i `CV_02_Modern_Studio.pdf` — podglądy.
- `Szablony_CV_Specyfikacja.md` — zasady i mapowanie zastosowań.

## 04_Developer
- `interview-types.ts` — pomocniczy kontrakt TypeScript.
- `matchcv-tokens.css` — tokeny wizualne w CSS.

## Ważne reguły
- Pytania w wywiadzie są **opcjonalne**; po pominięciu nie wyciągaj wniosku „brak kompetencji”.
- Dane o wynagrodzeniu, trudnych epizodach kariery i poufności domyślnie pozostają prywatne.
- System budujący CV nie może dopisywać doświadczenia niepotwierdzonego przez użytkownika.
- Dla produkcyjnej aplikacji należy dodać osobną warstwę uprawnień, retencji danych, testów i zgód.
- Formatki są projektowane z myślą o ATS, jednak każde wdrożenie należy przetestować na eksporcie PDF/DOCX.

## Rekomendowany przepływ w aplikacji
1. Import CV → wydobywanie faktów z dokumentu.
2. Profil → zatwierdzenie rozpoznanych faktów.
3. Wywiad 40 pytań → warunkowe dopytania o brakujące dowody.
4. Zapis strukturalny: `fact_id`, `source_id`, `verification_status`, `private`.
5. Analiza konkretnej oferty → dopasowanie wymagań do faktów.
6. Generacja CV, podgląd, ręczna korekta, eksport DOCX/PDF.
