# MatchCV — 40 pytań pogłębionego wywiadu

> Cel: pomóc modelowi poznać historię, sposób pracy, kierunek i konkretne dowody kompetencji. Nie prowadzimy oceny osobowości ani nie zbieramy danych wrażliwych.

## Instrukcja dla aplikacji

* **Opisowe** — duże pole tekstowe; opcjonalnie nagranie transkrybowane. Zalecane 40–150 słów, bez limitu minimalnego.
* **Tak / nie + opis** — wybór + warunkowy formularz „opowiedz więcej”.
* **Widełki** — pola liczbowe min/max, waluta, jednostka rozliczenia i forma zatrudnienia; opcjonalne, prywatne.
* Każde pytanie jest pomijalne. Nie odpowiadać za użytkownika. Przy braku konkretnych danych zadać jedno precyzyjne dopytanie.
* Fakt z importu CV nie jest automatycznie zweryfikowany. Wynik CV musi powstać z zatwierdzonych informacji.

---

## A. Tożsamość i kierunek
*Poznajemy człowieka stojącego za doświadczeniem, nie zbieramy danych prywatnych.*

### MCV-Q001 · Opisowe
**Jak opowiedział(a)byś swoją historię zawodową komuś, kto nie zna Twojej branży?**

**Podpowiedź dla użytkownika:** Opowiedz od pierwszej istotnej decyzji zawodowej do obecnego momentu.

**Cel:** Wychwycenie tożsamości, przewodniego motywu i języka, którym mówi użytkownik.

**Instrukcja ekstrakcji:** Wyodrębnij kolejne etapy, decyzje, motyw przewodni i deklarowane specjalizacje. Nie twórz nazw stanowisk.

**Dopytanie (warunkowe):** Co zmieniło się w Twoim podejściu do pracy między początkiem kariery a dziś?

**Kategorie danych:** identity, career_narrative

### MCV-Q002 · Opisowe
**Co sprawia, że czujesz, że wykonujesz naprawdę dobrą pracę?**

**Podpowiedź dla użytkownika:** Może chodzi o widoczny efekt, uporządkowanie chaosu albo wpływ na innych.

**Cel:** Uchwycenie wewnętrznej motywacji i definicji sukcesu.

**Instrukcja ekstrakcji:** Wyodrębnij motywatory i preferowane rezultaty; nie przedstawiaj ich jako osiągnięć.

**Dopytanie (warunkowe):** Podaj sytuację, w której szczególnie mocno to poczułeś(-aś).

**Kategorie danych:** motivation, values

### MCV-Q003 · Opisowe
**Z jakich trzech umiejętności lub cech zawodowych najchętniej chcesz być znany(-a) i dlaczego?**

**Podpowiedź dla użytkownika:** Do każdej cechy dopisz konkretny przykład z pracy.

**Cel:** Zebranie mocnych stron wraz z historiami potwierdzającymi.

**Instrukcja ekstrakcji:** Mapuj deklarację umiejętności i osobny przykład; ustaw evidence_status na claimed, dopóki nie ma dowodu.

**Dopytanie (warunkowe):** Co konkretnie zrobiłeś(-aś), że inni mogli tę cechę zauważyć?

**Kategorie danych:** skills, differentiators

### MCV-Q004 · Opisowe
**Jakie rodzaje problemów lubisz rozwiązywać, a jakich wolał(a)byś unikać?**

**Podpowiedź dla użytkownika:** Opisz zadania, w których tracisz poczucie czasu, oraz takie, które Cię wyczerpują.

**Cel:** Zidentyfikowanie naturalnej specjalizacji i antypreferencji.

**Instrukcja ekstrakcji:** Zapisz osobno preferencje i ograniczenia; nigdy nie publikuj ich automatycznie w CV.

**Dopytanie (warunkowe):** Czy możesz podać przykład takiego zadania z ostatniego roku?

**Kategorie danych:** preferences, role_fit

## B. Historia i zakres odpowiedzialności
*Ustalamy realną skalę pracy i ewolucję zawodową.*

### MCV-Q005 · Opisowe
**Przejdź przez najważniejsze role w swojej karierze: co miałeś(-aś) dostarczyć w każdej z nich?**

**Podpowiedź dla użytkownika:** Dla każdej roli: cel, odpowiedzialność, odbiorca pracy, główny rezultat.

**Cel:** Odtworzenie sensu ról bez kopiowania listy obowiązków z CV.

**Instrukcja ekstrakcji:** Powiąż cele i obowiązki z konkretnym stanowiskiem oraz datami istniejącymi w profilu. Nie zgaduj brakujących.

**Dopytanie (warunkowe):** Który obowiązek był faktycznie Twój, mimo że nie wynikał z nazwy stanowiska?

**Kategorie danych:** employment, responsibilities

### MCV-Q006 · Opisowe
**Co robiłeś(-aś) samodzielnie, a co wymagało zgody innych?**

**Podpowiedź dla użytkownika:** Przywołaj decyzje, budżety, akceptacje lub obszary, za które odpowiadałeś(-aś).

**Cel:** Weryfikacja autonomii i poziomu seniority.

**Instrukcja ekstrakcji:** Rozróżnij accountable, responsible, consulted i informed; nie zamieniaj współpracy w zarządzanie.

**Dopytanie (warunkowe):** Kto miał ostateczną odpowiedzialność za wynik?

**Kategorie danych:** ownership, seniority

### MCV-Q007 · Opisowe
**Kiedy i dlaczego zakres Twojej odpowiedzialności zwiększał się lub zmieniał?**

**Podpowiedź dla użytkownika:** Napisz o nowych zadaniach, klientach, projektach lub delegowanych decyzjach.

**Cel:** Odkrycie awansów funkcjonalnych, zaufania i rosnącej skali.

**Instrukcja ekstrakcji:** Powiąż zmianę odpowiedzialności z rolą i okresem; nie dopisuj formalnego awansu, jeśli go nie było.

**Dopytanie (warunkowe):** Po czym poznałeś(-aś), że organizacja zaczęła bardziej Ci ufać?

**Kategorie danych:** growth, employment

### MCV-Q008 · Opisowe
**Jakie mniej oczywiste doświadczenia z pracy mogłyby być cenne w zupełnie innej branży?**

**Podpowiedź dla użytkownika:** Np. koordynacja przetargu, proces decyzyjny, kontakty z urzędem, automatyzacja raportów.

**Cel:** Ujawnienie transferowalnych umiejętności na potrzeby pivotu.

**Instrukcja ekstrakcji:** Wydobądź umiejętności transferowalne z przywołanym kontekstem; nie dopisuj znajomości nowej branży.

**Dopytanie (warunkowe):** Do jakich innych typów stanowisk ta umiejętność mogłaby się przydać?

**Kategorie danych:** transferable_skills, career_pivot

## C. Projekty, decyzje i wpływ
*Wyciągamy konkretne historie, które można zamienić w mocne osiągnięcia.*

### MCV-Q009 · Opisowe
**Opowiedz szczegółowo o projekcie, który najlepiej pokazuje, na co Cię stać.**

**Podpowiedź dla użytkownika:** Problem → zadanie → Twoje działania → przeszkody → efekt → czego się nauczyłeś(-aś).

**Cel:** Stworzenie flagowego case study.

**Instrukcja ekstrakcji:** Utwórz projekt i relacje: problem, działania, rezultat, środki, dowody; przypisz właścicielstwo działań.

**Dopytanie (warunkowe):** Co zrobiono by inaczej, gdyby Ciebie w tym projekcie nie było?

**Kategorie danych:** projects, achievements

### MCV-Q010 · Opisowe
**Jakie były największe skale przedsięwzięć, z którymi realnie pracowałeś(-aś)?**

**Podpowiedź dla użytkownika:** Możesz podać budżet projektu, liczbę lokalizacji, wielkość zespołu czy portfel kontraktów; doprecyzuj, czym zarządzałeś(-aś).

**Cel:** Ustalenie miar skali z poprawnym opisem osobistego udziału.

**Instrukcja ekstrakcji:** Zapisz liczby wraz z jednostką, walutą, okresem i relacją do roli; rozróżnij „budżet projektu” i „budżet zarządzany osobiście”.

**Dopytanie (warunkowe):** Czy ta liczba jest potwierdzona i czy można ją publicznie ujawnić?

**Kategorie danych:** scope, metrics

### MCV-Q011 · Opisowe
**Które etapy projektu prowadzisz najpewniej: inicjowanie, planowanie, wykonanie, odbiory czy utrzymanie?**

**Podpowiedź dla użytkownika:** Przy każdym etapie opisz decyzje i dokumenty, które przygotowywałeś(-aś).

**Cel:** Określenie rzeczywistego pokrycia cyklu życia projektów.

**Instrukcja ekstrakcji:** Mapuj etapy cyklu życia do projektów i działań z dowodami, bez automatycznego uznania pełnego end-to-end.

**Dopytanie (warunkowe):** Podaj jeden dokument albo decyzję charakterystyczną dla wybranego etapu.

**Kategorie danych:** project_lifecycle, deliverables

### MCV-Q012 · Opisowe
**Opisz projekt z wieloma interesariuszami: jak godziłeś(-aś) sprzeczne oczekiwania?**

**Podpowiedź dla użytkownika:** Kto był zaangażowany, o co toczył się spór, jakie były ograniczenia i wynik?

**Cel:** Wydobycie negocjacji, koordynacji i wpływu.

**Instrukcja ekstrakcji:** Zapisz role interesariuszy, konflikt, działanie i efekt bez ujawniania danych poufnych.

**Dopytanie (warunkowe):** Co zostało uzgodnione, a co pozostało otwarte?

**Kategorie danych:** stakeholders, communication

## D. Wyniki i dowody
*Pozyskujemy fakty, metryki i kontekst bez fabrykowania danych.*

### MCV-Q013 · Opisowe
**Jaki konkretny efekt Twojej pracy przyniósł największą wartość organizacji?**

**Podpowiedź dla użytkownika:** Koszt, czas, ryzyko, jakość, zadowolenie klienta, wpływ społeczny.

**Cel:** Zamiana opowieści na wynik biznesowy.

**Instrukcja ekstrakcji:** Oddziel rezultaty mierzone od szacowanych i jakościowych, z przypisaniem do roli.

**Dopytanie (warunkowe):** Jaka była sytuacja „przed”, a jaka „po”?

**Kategorie danych:** outcomes, achievements

### MCV-Q014 · Opisowe
**Gdzie udało Ci się coś uprościć, przyspieszyć lub zautomatyzować?**

**Podpowiedź dla użytkownika:** Opisz proces przed zmianą, Twoje działanie, efekt i użytkowników rozwiązania.

**Cel:** Wykrycie procesowych i cyfrowych osiągnięć.

**Instrukcja ekstrakcji:** Wydobądź wdrożenie, adopcję, oszczędność czasu, skalę; nie twórz procentów bez danych.

**Dopytanie (warunkowe):** Czy rozwiązanie funkcjonowało po Twoim odejściu z projektu?

**Kategorie danych:** process_improvement, automation

### MCV-Q015 · Opisowe
**Jakie wyniki da się udokumentować, a które możesz opisać tylko jakościowo?**

**Podpowiedź dla użytkownika:** Wskaż raport, rekomendację, referencję, efekt projektu albo brak formalnej miary.

**Cel:** Ustalenie dowodów i poziomu pewności.

**Instrukcja ekstrakcji:** Przypisz każdemu osiągnięciu proof_type i verification_status; brak dokumentu ≠ brak osiągnięcia.

**Dopytanie (warunkowe):** Czy możesz podać choć jeden bezpieczny do publikacji punkt odniesienia?

**Kategorie danych:** evidence, credibility

### MCV-Q016 · Opisowe
**Który sukces był zespołowy i na czym polegał dokładnie Twój wkład?**

**Podpowiedź dla użytkownika:** Oddziel to, co zrobił zespół, od tego, co zaprojektowałeś(-aś) lub doprowadziłeś(-aś) do końca.

**Cel:** Zapobieganie przypisywaniu sobie cudzych osiągnięć.

**Instrukcja ekstrakcji:** Stwórz dwa pola: team_outcome i individual_contribution; CV wykorzystuje wyłącznie właściwe przypisanie sprawczości.

**Dopytanie (warunkowe):** Kto jeszcze miał kluczowy udział i jakie były Twoje decyzje?

**Kategorie danych:** attribution, teamwork

## E. Problemy i sposób myślenia
*Odkrywamy samodzielność, rozumowanie i odporność zawodową.*

### MCV-Q017 · Opisowe
**Opowiedz o sytuacji, w której wszystko zaczęło iść niezgodnie z planem.**

**Podpowiedź dla użytkownika:** Co się stało, jak rozpoznałeś(-aś) problem, jaka była Twoja reakcja i efekt?

**Cel:** Poznanie zachowania w kryzysie i zarządzania ryzykiem.

**Instrukcja ekstrakcji:** Wyodrębnij risk_signal, decision, escalation, mitigation i outcome.

**Dopytanie (warunkowe):** Co zrobił(a)byś dziś inaczej?

**Kategorie danych:** problem_solving, risk

### MCV-Q018 · Opisowe
**Jak podjąłeś(-aś) ważną decyzję przy niepełnych danych lub sprzecznych opiniach?**

**Podpowiedź dla użytkownika:** Opisz dostępne informacje, alternatywy, ryzyko i sposób komunikacji decyzji.

**Cel:** Zbadanie logiki decyzyjnej i priorytetów.

**Instrukcja ekstrakcji:** Zapisz ramę decyzyjną i faktyczne uprawnienia; nie dodawaj „strategiczny” bez przykładu.

**Dopytanie (warunkowe):** Jak sprawdziłeś(-aś), czy decyzja była trafna?

**Kategorie danych:** decision_making, analysis

### MCV-Q019 · Opisowe
**Jaki problem wymagał od Ciebie nauczenia się nowej rzeczy w bardzo krótkim czasie?**

**Podpowiedź dla użytkownika:** Co trzeba było opanować, w jaki sposób i z jakim rezultatem?

**Cel:** Wykrycie adaptacji i tempa uczenia.

**Instrukcja ekstrakcji:** Zapisz nową kompetencję wraz z poziomem praktycznego zastosowania, nie jako certyfikat.

**Dopytanie (warunkowe):** Czy stosujesz tę umiejętność nadal?

**Kategorie danych:** learning, adaptability

### MCV-Q020 · Opisowe
**Kiedy zakwestionowałeś(-aś) istniejące rozwiązanie i zaproponowałeś(-aś) lepsze?**

**Podpowiedź dla użytkownika:** Przedstaw argumenty, opór, reakcję innych i rezultat.

**Cel:** Pokazanie inicjatywy i konstruktywnego wpływu.

**Instrukcja ekstrakcji:** Wyodrębnij inicjatywę, interesariuszy, uzasadnienie i efekt; unikaj przypisywania całej zmiany jednej osobie.

**Dopytanie (warunkowe):** Jak przekonałeś(-aś) innych do pomysłu?

**Kategorie danych:** initiative, innovation

## F. Ludzie i komunikacja
*Sprawdzamy współpracę, przywództwo i zarządzanie interesariuszami.*

### MCV-Q021 · Opisowe
**Jak budujesz zaufanie z przełożonymi, klientami i współpracownikami?**

**Podpowiedź dla użytkownika:** Podaj scenariusz, w którym Twoja komunikacja zmieniła przebieg współpracy.

**Cel:** Poznanie praktycznych zachowań relacyjnych.

**Instrukcja ekstrakcji:** Zapisz zachowania i przykład; nie generuj niepopartych przymiotników typu „doskonały komunikator”.

**Dopytanie (warunkowe):** Co robisz, gdy zaufanie zostało naruszone?

**Kategorie danych:** relationships, communication

### MCV-Q022 · Tak / nie + opis
**Czy zdarzyło Ci się prowadzić ludzi, mentorować ich lub szkolić? Co dokładnie robiłeś(-aś)?**

**Podpowiedź dla użytkownika:** Jeśli tak: liczba osób, rola, temat, częstotliwość i rezultat. Jeśli nie: pomiń.

**Cel:** Rozróżnienie zarządzania formalnego od funkcjonalnego i szkoleń.

**Instrukcja ekstrakcji:** Zapisz leadership_type: direct_management / matrix / training / mentoring / none; nie zakładaj formalnego kierowania.

**Dopytanie (warunkowe):** Czy miałeś(-aś) wpływ na ocenę pracowniczą lub jedynie na koordynację zadań?

**Kategorie danych:** leadership, training

### MCV-Q023 · Opisowe
**Jak zachowujesz się w sytuacji konfliktu lub trudnej rozmowy zawodowej?**

**Podpowiedź dla użytkownika:** Opowiedz o konkretnej rozmowie; pomiń nazwiska i informacje poufne.

**Cel:** Pokazanie dojrzałości interpersonalnej i rozwiązywania konfliktów.

**Instrukcja ekstrakcji:** Zapisz kontekst, zachowanie, kompromis i rezultat, bez ocen psychologicznych.

**Dopytanie (warunkowe):** Jak zmierzyłeś(-aś) skuteczność uzgodnienia?

**Kategorie danych:** conflict_resolution, collaboration

### MCV-Q024 · Opisowe
**Komu i w jaki sposób prezentowałeś(-aś) złożone informacje lub rekomendacje?**

**Podpowiedź dla użytkownika:** Zarząd, urzędy, klient, zespół techniczny; forma raportu, prezentacji lub warsztatu.

**Cel:** Sprawdzenie umiejętności raportowania i komunikacji do różnych odbiorców.

**Instrukcja ekstrakcji:** Wyodrębnij audience_level, deliverable_type, cadence oraz zastosowany język komunikacji.

**Dopytanie (warunkowe):** Czy Twoja rekomendacja wpłynęła na konkretną decyzję?

**Kategorie danych:** executive_communication, stakeholders

## G. Warsztat i rozwój
*Rozróżniamy znajomość narzędzi od kompetencji potwierdzonych praktyką.*

### MCV-Q025 · Opisowe
**Jakich narzędzi, technologii i metod naprawdę używałeś(-aś) w pracy?**

**Podpowiedź dla użytkownika:** Podaj narzędzie, częstotliwość, zastosowanie i projekt, w którym go użyto.

**Cel:** Odróżnienie praktyki od listy słów kluczowych.

**Instrukcja ekstrakcji:** Każda umiejętność musi mieć proficiency_basis i supporting_fact_id; nie podnoś poziomu bez dowodów.

**Dopytanie (warunkowe):** Co samodzielnie potrafisz zrobić w tym narzędziu?

**Kategorie danych:** technical_skills, tools

### MCV-Q026 · Opisowe
**W jakich dziedzinach możesz być samodzielnym ekspertem, a gdzie potrzebujesz wsparcia?**

**Podpowiedź dla użytkownika:** Opisz poziom bez etykiet typu „ekspert”, jeśli nie potrafisz podać przykładów.

**Cel:** Kalibracja poziomów kompetencji i samoświadomości.

**Instrukcja ekstrakcji:** Zapisz self_assessed_level oddzielnie od verified_level; oznacz luki.

**Dopytanie (warunkowe):** Które trzy zadania wykonywał(a)byś bez pomocy?

**Kategorie danych:** skills, self_awareness

### MCV-Q027 · Opisowe
**Co w Twoim wykształceniu, kursach i certyfikatach przekłada się na realną przewagę w pracy?**

**Podpowiedź dla użytkownika:** Nazwy uczelni, kierunków i uprawnień, a następnie praktyczne zastosowanie.

**Cel:** Połączenie formalnego wykształcenia z użytecznością na rynku.

**Instrukcja ekstrakcji:** Osobno zapisz degree, completed_training, certification i methodology_used; nie zamieniaj szkolenia w certyfikat.

**Dopytanie (warunkowe):** Czy masz ważny dokument potwierdzający uprawnienie?

**Kategorie danych:** education, certifications

### MCV-Q028 · Opisowe
**Jakich języków używałeś(-aś) w realnych sytuacjach zawodowych i na jakim poziomie?**

**Podpowiedź dla użytkownika:** Rozmowy, negocjacje, dokumentacja, prezentacje; przybliżony poziom CEFR, jeśli znany.

**Cel:** Praktyczna, a nie życzeniowa ocena języków.

**Instrukcja ekstrakcji:** Zapisz język, declared_cefr (opcjonalnie) i real_use_cases; nie przypisuj CEFR automatycznie.

**Dopytanie (warunkowe):** Czy prowadziłeś(-aś) prezentację lub negocjacje w tym języku?

**Kategorie danych:** languages, communication

## H. Motywacja i środowisko pracy
*Poznajemy warunki, w których kandydat działa najlepiej.*

### MCV-Q029 · Opisowe
**Jakie obszary wiedzy rozwijasz samodzielnie i do czego wykorzystujesz nowe informacje?**

**Podpowiedź dla użytkownika:** Nowe technologie, branże, kursy własne, projekty poboczne.

**Cel:** Zobaczenie ciekawości i inicjatywy rozwojowej.

**Instrukcja ekstrakcji:** Odróżnij zainteresowania od ukończonych projektów i zawodowych kwalifikacji.

**Dopytanie (warunkowe):** Pokaż jedno konkretne zastosowanie tej wiedzy.

**Kategorie danych:** growth, adjacent_skills

### MCV-Q030 · Opisowe
**W jakim środowisku i stylu pracy osiągasz najlepsze rezultaty?**

**Podpowiedź dla użytkownika:** Skala firmy, tempo, autonomia, struktura, praca z zespołem i klientem.

**Cel:** Dopasowanie kultury i organizacji, nie ocena charakteru.

**Instrukcja ekstrakcji:** Zapisz work_environment_preferences; nie umieszczaj ich w CV bez potrzeby.

**Dopytanie (warunkowe):** Co w poprzednich środowiskach pracy najbardziej Ci pomagało?

**Kategorie danych:** culture_fit, preferences

### MCV-Q031 · Opisowe
**Co musi dawać Ci kolejna praca, żebyś uznał(a) ją za dobry krok?**

**Podpowiedź dla użytkownika:** Wpływ, nauka, stabilność, pensja, lokalizacja, odpowiedzialność, misja.

**Cel:** Określenie kryteriów wyboru i priorytetów.

**Instrukcja ekstrakcji:** Stwórz ranking must_have / nice_to_have / avoid; nie ujawniaj w CV preferencji finansowych.

**Dopytanie (warunkowe):** Które dwa warunki są dla Ciebie nienegocjowalne?

**Kategorie danych:** career_goals, priorities

### MCV-Q032 · Opisowe
**Jakie zadania lub branże chcesz wypróbować, chociaż nie wynikają bezpośrednio z Twojego CV?**

**Podpowiedź dla użytkownika:** Opisz połączenie dotychczasowej wiedzy z nowym obszarem.

**Cel:** Identyfikacja kierunków pivotu i umiejętności transferowalnych.

**Instrukcja ekstrakcji:** Mapuj target_roles do istniejących dowodów; nie twórz doświadczenia w nowej branży.

**Dopytanie (warunkowe):** Które doświadczenie jest Twoim mostem do tej roli?

**Kategorie danych:** career_transition, aspirations

## I. Dopasowanie do rynku
*Ustalamy kryteria ofert, ograniczenia i język pozycjonowania.*

### MCV-Q033 · Opisowe
**Jak wytłumaczył(a)byś rekruterowi motywację do zmiany pracy?**

**Podpowiedź dla użytkownika:** Skup się na kierunku, którego szukasz, a nie na krytyce poprzednich pracodawców.

**Cel:** Budowa dojrzałej, prawdziwej narracji rekrutacyjnej.

**Instrukcja ekstrakcji:** Zapisz interview_only_story i public_cv_safe_story, nie dodawaj szczegółów prywatnych.

**Dopytanie (warunkowe):** Które elementy tej odpowiedzi chcesz zachować tylko na rozmowę?

**Kategorie danych:** job_search, narrative

### MCV-Q034 · Opisowe
**Jakie formy zatrudnienia, tryby pracy, lokalizacje i podróże są dla Ciebie realnie możliwe?**

**Podpowiedź dla użytkownika:** UoP/B2B, stacjonarnie/hybrydowo/zdalnie, relokacja, wyjazdy; podaj ograniczenia.

**Cel:** Filtrowanie ofert według warunków użytkownika.

**Instrukcja ekstrakcji:** Zapisz employment_modes, remote_modes, regions i travel_cap; stosuj do dopasowania ofert, nie do CV.

**Dopytanie (warunkowe):** Które ustalenia są elastyczne, a które nie?

**Kategorie danych:** job_filters, availability

### MCV-Q035 · Widełki + kontekst
**Jakiego wynagrodzenia oczekujesz i jak elastyczne są te oczekiwania?**

**Podpowiedź dla użytkownika:** Podaj przedział, walutę, okres oraz UoP brutto lub B2B netto + VAT; możesz pominąć.

**Cel:** Filtrowanie ofert, bez ujawniania informacji rekruterom bez zgody.

**Instrukcja ekstrakcji:** Zapisz salary_min, salary_max, currency, frequency, contract_basis i consent_to_share=false; nie mieszaj jednostek.

**Dopytanie (warunkowe):** Czy podany zakres jest minimum, celem czy przedziałem negocjacyjnym?

**Kategorie danych:** salary, job_filters

### MCV-Q036 · Opisowe
**Jakie firmy, stanowiska lub oferty intuicyjnie do Ciebie pasują — i dlaczego?**

**Podpowiedź dla użytkownika:** Wskaż 2–3 przykłady, pożądany charakter projektów i rodzaj odpowiedzialności.

**Cel:** Nauka gustu użytkownika i kryteriów rekomendacji.

**Instrukcja ekstrakcji:** Zapisz target_role_examples oraz jawnie opisane powody; nie zakładaj, że są kwalifikacje.

**Dopytanie (warunkowe):** Co odróżnia ofertę idealną od tylko akceptowalnej?

**Kategorie danych:** market_matching, target_roles

## J. Narracja, wiarygodność i granice
*Budujemy autentyczny wizerunek, kontrolujemy ryzyka i poufność.*

### MCV-Q037 · Opisowe
**Gdybyś miał(a) wybrać pięć faktów, które rekruter musi o Tobie zapamiętać, co by to było?**

**Podpowiedź dla użytkownika:** Fakty, nie przymiotniki: skala, specjalizacja, wynik, decyzja, unikalny projekt.

**Cel:** Priorytety do sekcji podsumowania CV i rozmowy.

**Instrukcja ekstrakcji:** Każdy fakt musi mieć evidence_ref, typ i status; bez dowodu oznacz jako deklarację.

**Dopytanie (warunkowe):** Który z tych faktów można poprzeć dokumentem lub case study?

**Kategorie danych:** positioning, evidence

### MCV-Q038 · Tak / nie + opis
**Czy w Twojej historii są zmiany kierunku, przerwy lub nakładające się role wymagające wyjaśnienia?**

**Podpowiedź dla użytkownika:** Jeżeli tak, opisz tylko tyle, ile chcesz; powody prywatne nie są wymagane.

**Cel:** Opracowanie spójnej chronologii bez stygmatyzacji.

**Instrukcja ekstrakcji:** Zapisz timeline_context jako optional, private_by_default; nie interpretuj braku odpowiedzi.

**Dopytanie (warunkowe):** Jak krótko i zgodnie z prawdą przedstawić tę zmianę podczas rekrutacji?

**Kategorie danych:** timeline, career_transitions

### MCV-Q039 · Opisowe
**O czym absolutnie nie wolno pisać w Twoim CV ani przekazywać modelowi do generacji?**

**Podpowiedź dla użytkownika:** Poufne projekty, nazwiska klientów, dokładne budżety, dane osobiste, niejawne referencje.

**Cel:** Kontrola poufności, wrażliwości i preferencji publikacji.

**Instrukcja ekstrakcji:** Zapisz explicit_exclusions i masking_rules; egzekwuj reguły przed generacją i eksportem.

**Dopytanie (warunkowe):** Czy istnieje bezpieczny opis zastępczy, który nadal pokazuje skalę pracy?

**Kategorie danych:** privacy, confidentiality

### MCV-Q040 · Opisowe
**Jakie pytanie powinien zadać Ci świetny rekruter, żeby odkryć Twoją wartość — i jak byś odpowiedział(a)?**

**Podpowiedź dla użytkownika:** Opowiedz historię, którą zwykle pomijasz, a która wiele mówi o Twojej pracy.

**Cel:** Odkrycie unikalnych historii nieuwzględnionych w poprzednich pytaniach.

**Instrukcja ekstrakcji:** Dodaj nowe fakty i potencjalne pytania uzupełniające, unikaj duplikatów i weryfikuj spójność.

**Dopytanie (warunkowe):** Jak ten przykład można przetłumaczyć na konkretny punkt CV?

**Kategorie danych:** hidden_strengths, career_narrative

---
## Zasady interpretowania odpowiedzi

1. Każdą informację oznacz źródłem: `cv_import`, `interview`, `user_edit`, `document`.
2. Odróżniaj deklarację od osiągnięcia potwierdzonego przykładem, metryką albo dokumentem.
3. Każda liczba wymaga jednostki i informacji, czy dotyczy zespołu, projektu czy użytkownika.
4. Zachowuj różnicę między uczestnictwem, koordynacją i formalnym kierowaniem.
5. Jeśli informacja jest sprzeczna, przedstaw konflikt użytkownikowi, zamiast wybierać wygodniejszą wersję.
6. Dane o wynagrodzeniu, motywacji zmiany i chronologii domyślnie nie trafiają do CV.
7. Dane prywatne, chronione i poufne są wyłączone z eksportu, chyba że użytkownik jednoznacznie zatwierdzi odpowiedni zakres.
8. CV zawiera wyłącznie stwierdzenia przypisane do zaakceptowanych identyfikatorów faktów.
