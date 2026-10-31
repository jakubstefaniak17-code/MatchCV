# MatchCV — UX / UI DESIGN BLUEPRINT
### Calm Confidence • Design system v1.0

**Cel**: kolorowy, stonowany, nowoczesny produkt z autorską tożsamością wizualną; bez estetyki „wygenerowane przez AI”.

## 01. Teza projektowa

MatchCV ma wyglądać jak produkt zaprojektowany przez doświadczone studio produktowe: spokojny, rozpoznawalny, ludzki. Barwa jest narzędziem nawigacji i emocji, a nie dekoracją. Rozmowa o karierze bywa intymna — interfejs powinien wzbudzać zaufanie, nie imitować futurystycznego laboratorium AI.

**Obietnica** — „Wydobądź to, co najlepsze z Twojej kariery”. Użytkownik ma poczuć, że ktoś uważnie słucha i potrafi uporządkować jego historię.

**Osobowość** — Życzliwy ekspert; rzeczowy, ciekawy, nienachalny. Nie coaching, nie „magia AI”, nie korporacyjny portal rekrutacyjny.

**Wyróżnik** — Wywiad jak rozmowa z dobrym konsultantem kariery, nie kolejne 40 pól formularza.

**Antywzorce** — Brak neonowych gradientów, świecących orbów, hologramów, robotów, promptów w stylu terminala i pustych wykresów „AI score 97%”.

## 02. System kolorów

Paleta „Calm Confidence” łączy głęboki granat, morski turkus, błękit, delikatną lawendę i ciepły koral. Na każdym widoku jeden akcent dominujący, pozostałe pełnią funkcję kontekstową.

**Ink / #1D2638** — Tekst, nawigacja, nagłówki. Podstawowy kontrast.

**Teal / #167C80** — Główne działania, aktywna nawigacja, zaufanie i postęp.

**Blue / #5571B5** — Analiza ogłoszenia, informacje, wykres dopasowania.

**Violet / #7864A3** — Wywiad i odkrywanie kompetencji.

**Coral / #D57866** — Akcent emocjonalny, ilustracje abstrakcyjne i delikatne CTA drugoplanowe; nie do komunikatów błędu.

**Paper / #F8F9F6** — Powierzchnia aplikacji; ociepla wrażenie.

**White / #FFFFFF** — Karty, formularze, edytor CV.

**Line / #E3E8ED** — Granice i separatory — dyskretne, z umiarem.

## 03. Typografia i rytm

Użyj Inter dla interfejsu (alternatywnie system-ui); Inter Display dla mocnych nagłówków. Typografia buduje hierarchię bez agresywnego pogrubiania wszystkiego.

**Scale** — Display 40/48, H1 32/40, H2 24/32, H3 18/26, Body 15/24, Small 13/20, Micro 11/16 (px/line-height).

**Weight** — 400 dla tekstu, 500 dla etykiet, 600 dla śródtytułów, 700 rzadko dla hero.

**Grid** — 8-punktowy rytm z wyjątkami 4 i 12. Maksymalna szerokość treści 1120 px, formularze 720–760 px.

**Radius** — Card 20 px, button 12 px, input 12 px, pills 999 px. Bez nadmiernego zaokrąglania.

**Shadows** — Jeden bardzo subtelny cień dla aktywnych kart; reszta opiera się na kontrastach powierzchni i obramowaniu.

## 04. Kompozycja i nawigacja

Na desktopie spokojny lewy sidebar 232–248 px, główna treść na jasnym tle, prawy panel kontekstowy tylko w edytorze CV i analizie ofert. Na mobile dolna nawigacja do najważniejszych obszarów i układ jednokolumnowy.

**Sidebar** — Logo MatchCV + mały znak graficzny ze złożonych kart; „Mój profil”, „Wywiad”, „Oferty”, „Moje CV”, „Ustawienia”.

**Header** — Krótkie powitanie lub nazwa kroku, dyskretny wskaźnik zapisania („Zapisano przed chwilą”).

**Cards** — Używaj kart tylko dla odrębnych zadań, nie do każdej informacji. 20–24 px padding.

**Whitespace** — Przed sekcją 32–40 px, między logicznymi grupami 20–24 px; nigdy 8 różnych informacji bez podziału.

**Responsive** — < 768 px: jedna kolumna, sticky CTA nad dolnym paskiem, bez przewijanych poziomo tabel.

## 05. Kluczowe ekrany

Wszystkie widoki mają jeden główny cel, czytelny krok następny i możliwość cofnięcia bez utraty danych.

**Dashboard** — Duże, przyjazne „Dokończmy Twój profil”, karta postępu (bez sztucznych procentów), ostatnie CV, najważniejsze następne działanie.

**Import CV** — Dropzone z jasnymi formatami i ograniczeniami. Po imporcie ekran „Sprawdzamy, co rozpoznaliśmy” z porównaniem faktów i źródła.

**Wywiad 40 pytań** — Jedno pytanie na ekran, większe pole tekstowe, podpowiedź i wybór „Pomiń na razie”; widoczny postęp rozdziałów i autozapis.

**Profil kariery** — Nie surowa tabela. Oś doświadczenia + karty projektów, osiągnięć, umiejętności i oznaczenia pochodzenia faktów.

**Analiza oferty** — Dwie przestrzenie: „Czego szuka firma” i „Co z Twojego doświadczenia to potwierdza”. Odseparuj brak danych od faktycznych braków.

**Edytor CV** — Podgląd strony A4 po prawej, po lewej edycja sekcji. Zmieniany tekst nie niszczy struktury dowodów.

**Historia CV** — Tytuł stanowiska, firma, data i szablon. Duplikowanie CV nie zużywa kredytu, jeśli nie generuje nowego dopasowania.

## 06. Mikrointerakcje i stany

Ruch ma komunikować zmianę stanu i pomagać zrozumieć produkt. 150–220 ms, ease-out, z obsługą prefers-reduced-motion.

**Autosave** — Po 600–1000 ms bez pisania: „Zapisywanie...” → „Zapisano”. Błąd zapisu: widoczny alert i przycisk „Spróbuj ponownie”.

**AI in progress** — Przejrzyste fazy: „Czytam ofertę”, „Dobieram dowody”, „Układam CV”. Pokazuj prawdziwe etapy, nie fikcyjny procent.

**Empty state** — Krótka informacja, co tu będzie; jeden konkretny CTA, np. „Dodaj pierwszą ofertę”.

**Validation** — Wskazówka pod polem, nigdy tylko czerwony obrys. Informacja o wymaganej walucie czy jednostce.

**Success** — Toast + pozostanie w kontekście. Bez konfetti dla każdego zapisu.

**Failure** — Nie znikają odpowiedzi. Konkretny komunikat oraz opcja ponowienia.

## 07. Język interfejsu i zaufanie

Zamiast mówić „AI analizuje Twoją tożsamość” mów „Wybieramy doświadczenia najważniejsze dla tej oferty”. Unikaj obietnic wygranej w rekrutacji.

**Dobry microcopy** — „Możesz pominąć to pytanie”, „Odpowiedź widzisz tylko Ty”, „To osiągnięcie wymaga potwierdzenia”, „Sprawdź, czy dobrze to zrozumieliśmy”.

**Zły microcopy** — „Nasza rewolucyjna AI odmieni Twój los”, „Gwarantujemy rozmowę”, „Jesteś 96% idealnym kandydatem” bez podstaw.

**Status faktu** — „Zaimportowane”, „Podane przez Ciebie”, „Potwierdzone”, „Do wyjaśnienia”; nie używaj pieczątki „Zweryfikowane” bez dowodu.

**Prywatność** — Użytkownik rozstrzyga, czy informacja może trafić do dokumentu. Pytania o pensję i poufność mają osobną ikonę kłódki.

## 08. Dostępność i jakość

Cel: WCAG 2.2 AA. Każdy formularz powinien działać z klawiatury, a kolor nie może być jedynym nośnikiem znaczenia.

**Kontrast** — Tekst zasadniczy ≥ 4.5:1, duży tekst ≥ 3:1; osobno sprawdzić kombinacje akcentów i tła.

**Focus** — Wyraźny outline 2 px, offset 2 px, widoczny w jasnym i ciemnym motywie.

**Semantyka** — Poprawne label, fieldset/legend dla wyborów; aria-live tylko dla zapisów i statusów.

**Błędy** — Treść błędu i propozycja poprawy; linki tekstowe podkreślane, nie jedynie kolorowane.

**Mobile** — Cele dotykowe min. 44×44 px; pola tekstowe o wysokości od 120 px dla narracji.

**Wydajność** — LCP docelowo < 2.5 s na typowych urządzeniach, minimalna animacja, font z fallbackiem.

## 09. Komponenty i tokeny

Design system powinien być implementowalny poprzez CSS variables i warianty komponentów, bez ad hoc kolorów w kodzie.

**Komponenty** — AppShell, SectionHeader, ProgressChapters, InterviewQuestion, AutosaveIndicator, EvidenceChip, FactReviewCard, RequirementMatch, DocumentPreview, TemplatePicker, PrimaryButton.

**Przyciski** — Primary teal, Secondary neutral, Tertiary tekstowy, Destructive czerwony tylko do trwałego usuwania. Stany hover/focus/disabled/loading.

**Formularze** — Label nad polem, helper pod polem, autosave status w prawym dolnym rogu. Odpowiedzi opisowe bez sztucznego licznika znaków.

**Tokeny** — Dostarczony plik `matchcv-tokens.css` definiuje kolory, typografię, spacing, radius i motion.

## 10. Jakość wdrożenia i kryteria akceptacji

Prosty test użyteczności na pięciu osobach jest ważniejszy niż kolejne ozdobniki. Projekt jest gotowy, kiedy można bez instrukcji przejść wywiad i wygenerować CV.

**Test 1** — Użytkownik rozumie, po co odpowiada na pytania; nie myli wywiadu z testem osobowości.

**Test 2** — Powrót do przerwanego wywiadu nie powoduje utraty tekstu.

**Test 3** — Osoba bez wiedzy technicznej rozumie, które informacje zostały pobrane z CV, a które pochodzą z jej odpowiedzi.

**Test 4** — Użytkownik potrafi wyłączyć informację poufną z dokumentu.

**Test 5** — Eksport PDF/DOCX jest oczywisty, a dokument wygląda równie dobrze na ekranie i w wydruku.

**Test 6** — Przeprowadź audyt kontrastu, klawiatury, mobilności i realnych stanów błędu.

## 11. Scenariusze ekran po ekranie

Nie ma potrzeby zaskakiwać użytkownika. Każdy ekran odpowiada na trzy pytania: gdzie jestem, co mogę zrobić i co stanie się dalej.

**Pierwsza wizyta** — Hero „Twoja historia ma więcej do powiedzenia”. Dwa równorzędne wejścia: „Zaimportuj CV” i „Zacznij od rozmowy”. Poniżej proste wyjaśnienie 1–2–3, bez agresywnego upsellu.

**Po imporcie** — Nagłówek „Znaleźliśmy 18 informacji do sprawdzenia”. Karty faktów z fragmentem źródła oraz akcjami „Potwierdź”, „Popraw”, „Usuń”. Po stronie mobilnej pojedyncza karta.

**Pytanie wywiadu** — „04 / 40” dyskretnie nad tytułem. Pytanie 24–28 px, krótka podpowiedź, duże pole odpowiedzi, przykład zwijany. Dół: „Wstecz”, „Pomiń”, mocne „Zapisz i dalej”.

**Po odpowiedzi** — Niedługi komunikat „Dzięki. To pokazuje, że potrafisz…” tylko jeśli wniosek jest wsparty odpowiedzią. Jedno warunkowe pytanie, gdy brakuje dowodu.

**Przed generacją** — Karty „Najlepiej pasujące dowody” i „Pytania otwarte”. Użytkownik widzi, dlaczego dane osiągnięcie zostanie wyeksponowane.

**Po generacji** — Podgląd A4 w naturalnej skali z kontrolą liczby stron, historii wersji i korekt. Ścieżka „Sprawdź fakty” wyraźniejsza niż przycisk „Pobierz”.

## 12. Mapa zachowań i detale interakcji

Wykorzystaj mikrodecyzje projektowe do zmniejszenia wysiłku poznawczego. Priorytet: zachowanie kontroli przez użytkownika i uczciwość działania systemu.

**Progres** — Oddziel ukończenie pytań od jakości profilu: 12/40 odpowiedzi oraz „3 fakty do potwierdzenia”. Żaden z tych wskaźników nie jest oceną użytkownika.

**Długie odpowiedzi** — Pola auto-grow z opcją „Pokaż podpowiedź”; zapis co kilka sekund z deduplikacją żądań. Odpowiedź można kontynuować po powrocie.

**Dopytania** — Wykrywaj brak kontekstu → działania → rezultatu. Najpierw zapytaj, czy użytkownik chce doprecyzować, nie wyskakuj z serią pytań.

**Relacja fakt–źródło** — Każde twierdzenie w CV ma wewnętrzny link „Na czym się opieramy?”. Po kliknięciu pokazuje oryginalny fragment odpowiedzi lub dokumentu.

**Kolory statusów** — Teal = ukończone, blue = informacja, violet = pytanie/odkrycie, amber = wymaga uwagi, red = destrukcyjne/błąd; zawsze status tekstowy obok koloru.

**Eksport i płatności** — Przed obciążeniem kredytu pokaż warunki. Poprawki ręczne i pobranie już wygenerowanego dokumentu nie powinny zużywać kredytu.

**Bezpieczeństwo emocjonalne** — Użytkownik może pominąć trudne pytanie bez komunikatu sugerującego słabszy profil. Nie oceniaj charakteru, ambicji czy przerw w zatrudnieniu.

**Metryki UX** — Mierz ukończenie importu, medianę czasu odpowiedzi, liczbę pominięć, liczbę korekt faktów, sukces eksportu i ocenę wygenerowanego CV.

## Narzędziowy brief dla implementacji

- Domyślny motyw jasny. Ciemny dopiero po dopracowaniu kontrastów.
- Komponenty budowane jako mały system, nie kopia demo z biblioteki.
- Maksymalnie jeden dominujący kolor akcentu na ekran.
- Bez generatywnych ozdobników, stockowych zdjęć i sztucznie imponujących liczb.
- Diagramy dopasowania powinny odróżniać „potwierdzone” od „brak informacji”.
- Dla edytora CV wysoki priorytet zgodności podglądu HTML, PDF i DOCX.

## Podział produktu na etapy

1. Onboarding i import istniejącego CV.
2. Wywiad i zatwierdzanie faktów.
3. Analiza oferty i mapowanie wymagań.
4. Redakcja, korekta i eksport CV.
5. Historia dokumentów i rozwój profilu.
