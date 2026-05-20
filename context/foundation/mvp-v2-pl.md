# 10xCards v2 - MVP

Data: 2026-05-19
Status: szkic
Kontekst: zmiana brownfield w istniejącej aplikacji 10xCards

## Punkt odniesienia z kursu

Przykład kursowy definiuje MVP 10xCards wokół:

- generowania fiszek przez AI z wklejonego tekstu,
- ręcznego tworzenia fiszek,
- przeglądania, edycji i usuwania fiszek,
- prostych kont użytkowników,
- integracji z gotowym algorytmem powtórek.

Kursowy zakres jawnie wyklucza:

- własny zaawansowany algorytm powtórek, np. SuperMemo albo Anki,
- współdzielenie talii między użytkownikami.

Przydatne są też kursowe sygnały sukcesu:

- użytkownik akceptuje 75% fiszek wygenerowanych przez AI,
- użytkownik tworzy 75% fiszek z pomocą AI.

## Wizja MVP v2

10xCards v2 zmienia istniejącą aplikację do zarządzania fiszkami w aplikację z pełną pętlą nauki dla polskich materiałów kursu 10xDevs3.

Uczący się powinien móc wziąć markdown lekcji, wygenerować użyteczne fiszki, odrzucić albo poprawić słabe propozycje i powtarzać zaakceptowane fiszki w sesjach powtórkowych.

## Główna persona

Polskojęzyczny uczestnik 10xDevs3 i programista, który chce utrwalać materiał kursu podczas budowania projektu kursowego.

## Główny problem

Lekcje kursu zawierają dużo wiedzy wdrożeniowej i produktowej, ale ręczne przekształcanie ich w rzetelne fiszki jest wolne. Bez pętli nauki wygenerowane fiszki pozostają tylko rekordami treści, zamiast tworzyć aktywny system nauki.

## Reguła biznesowa MVP

Aplikacja przekształca zaufany markdown lekcji w kandydatów na fiszki, sprawdza ich jakość przed aktywacją i planuje powtórki zaakceptowanych fiszek na podstawie wyniku przypomnienia.

## Pierwszy wartościowy przepływ

1. Uczący się loguje się.
2. Uczący się wkleja polski markdown lekcji albo przeciąga pojedynczy plik `.md` lub `.txt`.
3. Aplikacja tworzy albo aktualizuje dokument dla tej lekcji.
4. Uczący się prosi AI o wygenerowanie kandydatów na fiszki.
5. Aplikacja uruchamia lekkie sprawdzenie jakości i pokrycia lekcji, a wygenerowane fiszki oznacza jako oczekujące.
6. Uczący się akceptuje, edytuje albo odrzuca wygenerowane fiszki.
7. Zaakceptowane fiszki stają się dostępne do nauki.
8. Uczący się rozpoczyna sesję powtórkową.
9. Aplikacja pokazuje fiszki do powtórki.
10. Uczący się odkrywa odpowiedź i ocenia przypomnienie.
11. Aplikacja aktualizuje stan powtórek przy użyciu gotowego SM-2.
12. Uczący się widzi podstawowy postęp sesji i następne daty powtórek.

To jest MVP. Wszystko, co nie wspiera tej pętli, jest drugorzędne.

## W zakresie

### Źródło markdown kursu

- Wklejenie wybranego polskiego markdownu lekcji albo przeciągnięcie jednego pliku markdown/plain text jako dokumentu.
- Zachowanie tytułu lekcji i ścieżki źródłowej.
- Generowanie fiszek tylko z polskiej treści lekcji.
- Trzymanie zaimportowanej treści w zakresie zalogowanego użytkownika.

### Generowanie fiszek przez AI

- Poprawienie obecnego promptu generowania pod fiszki do nauki kursu.
- Generowanie atomowych fiszek pytanie-odpowiedź.
- Unikanie fiszek opartych o ciekawostki, tekst nawigacyjny, zduplikowane fragmenty albo niejasne streszczenia.
- Pozostawianie wygenerowanych fiszek jako oczekujących do czasu przeglądu.

### Lekkie sprawdzenie jakości i pokrycia

Informacja o jakości jest funkcją produktu, nie tylko instrukcją w prompcie. Dla trzytygodniowego MVP powinna pozostać lekka i doradcza.

W MVP aplikacja powinna wskazywać fiszki, które prawdopodobnie nie spełniają tych kryteriów:

- sprawdzają jedno pojęcie albo decyzję naraz,
- odpowiedź jest zgodna ze źródłową lekcją,
- pytanie da się rozwiązać bez ukrytego kontekstu,
- odpowiedź jest wystarczająco krótka do praktyki przypominania,
- fiszka jest użyteczna dla nauki wiedzy kursowej lub projektowej,
- fiszka nie jest prawie duplikatem innej oczekującej albo zaakceptowanej fiszki z tej samej lekcji.

Wygenerowany zestaw powinien też zawierać podstawowy raport pokrycia: które oczywiste nagłówki albo kluczowe tematy lekcji mają przynajmniej jedną fiszkę, a których brakuje.

Implementacja MVP może łączyć automatyczne sprawdzenia z ręczną akceptacją. Ręczna akceptacja pozostaje ostateczną decyzją. Raport nie aktywuje fiszek automatycznie.

### Przepływ akceptacji

- Oczekujące wygenerowane fiszki można zaakceptować, edytować albo odrzucić.
- Odrzucone fiszki nie trafiają do sesji nauki.
- Edytowane i zaakceptowane fiszki zachowują powiązanie ze źródłem.

### Pętla nauki

- Dodanie sesji powtórkowych dla zaakceptowanych fiszek.
- Pokazywanie najpierw fiszek z terminem powtórki.
- Możliwość odkrycia odpowiedzi i ocenienia przypomnienia.
- Proste przyciski przypomnienia mapowane na oceny SM-2:
  - Again -> niska ocena,
  - Hard -> zaliczone, ale słabe przypomnienie,
  - Good -> normalne przypomnienie,
  - Easy -> mocne przypomnienie.
- Zapisywanie historii powtórek, interwału, współczynnika łatwości, liczby powtórek, daty ostatniej powtórki i daty następnej powtórki.

### Integracja SM-2

- Użycie gotowej implementacji SM-2, preferowany pakiet: `@open-spaced-repetition/sm-2`.
- Opakowanie pakietu w `src/lib/services/spaced-repetition.service.ts`.
- Utrzymanie typów specyficznych dla biblioteki poza UI, handlerami API i DTO bazy danych.

### Podstawowy postęp

- Pokazanie liczby fiszek do powtórki.
- Pokazanie liczby fiszek przerobionych w bieżącej sesji.
- Pokazanie następnej daty powtórki na przejrzanych fiszkach albo w podsumowaniu sesji.
- Jeśli uczący się nie wróci przez tydzień, zaległe fiszki pozostają zaległe i są pokazane jako pierwsze w kolejnej sesji.

## Poza zakresem

- Brak własnego zaawansowanego algorytmu powtórek.
- Brak FSRS w MVP v2.
- Brak współdzielonych talii i przestrzeni zespołowych.
- Brak publicznego marketplace'u fiszek kursowych.
- Brak aplikacji mobilnej.
- Brak importu PDF, DOCX, HTML, EPUB, obrazów, audio albo wideo w MVP v2.
- Brak pełnego importera lokalnych katalogów albo crawlera zalogowanej platformy kursowej w aplikacji.
- Brak integracji z zewnętrznymi platformami nauki.
- Brak przetwarzania wideo/audio do generowania fiszek.
- Brak maili, powiadomień push i przypomnień kalendarzowych o zaległych powtórkach w MVP v2.
- Brak wersji wielojęzycznej; MVP jest tylko po polsku.
- Brak szerokiej synchronizacji z Obsidianem. Wystarczy zgodność ze źródłowym markdownem.
- Brak trwałego panelu Quality Gate albo historycznej analityki pokrycia.

## Kryteria sukcesu

### Podstawowe

- Uczący się może ręcznie wkleić albo przeciągnąć jedną polską lekcję 10xDevs3 w formacie markdown/plain text jako dokument.
- Uczący się może wygenerować fiszki z tej lekcji.
- Uczący się może zaakceptować, edytować albo odrzucić wygenerowane fiszki przed nauką.
- Uczący się może ukończyć sesję powtórkową przy użyciu zaakceptowanych fiszek.
- Wyniki powtórek aktualizują następne daty powtórek przez SM-2.
- Uczący się widzi podstawową informację AI o słabych fiszkach i oczywistych lukach w pokryciu lekcji.

### Jakość produktu

- Co najmniej 75% fiszek wygenerowanych z reprezentatywnej lekcji zostaje zaakceptowanych po przeglądzie, edycji albo odrzuceniu.
- Co najmniej 75% nowych fiszek użytkownika w przepływie MVP pochodzi z generowania AI, a nie ręcznego tworzenia.
- Każdą fiszkę do nauki da się powiązać z lekcją albo dokumentem źródłowym.
- Prowadzący kurs mogą zrozumieć i przejść kompletną pętlę nauki MVP podczas oceny projektu.

### Ograniczenia ochronne

- Istniejące logowanie, tematy, dokumenty, fiszki i przepływ akceptacji nadal działają.
- Istniejące dane użytkownika nie są destrukcyjnie migrowane.
- Wygenerowane fiszki nigdy nie stają się aktywnym materiałem do nauki bez akceptacji użytkownika.

## Wymagania funkcjonalne

- FR-001: Zalogowany użytkownik może ręcznie wkleić treść albo przeciągnąć jeden polski plik markdown/plain text lekcji jako dokument. Priorytet: konieczne
- FR-002: Zalogowany użytkownik może wygenerować kandydatów na fiszki z dokumentu lekcji. Priorytet: konieczne
- FR-003: System może zapisać metadane lekcji źródłowej dla wygenerowanych fiszek. Priorytet: konieczne
- FR-004: System domyślnie oznacza wygenerowane fiszki jako oczekujące. Priorytet: konieczne
- FR-005: System może przygotować lekki raport jakości i pokrycia dla wygenerowanego zestawu fiszek. Priorytet: konieczne
- FR-006: Uczący się może zaakceptować, edytować albo odrzucić oczekujące fiszki. Priorytet: konieczne
- FR-007: System może uniemożliwić odrzuconym fiszkom pojawianie się w sesjach nauki. Priorytet: konieczne
- FR-008: System może wybrać zaakceptowane fiszki z terminem powtórki do sesji. Priorytet: konieczne
- FR-009: Uczący się może odkryć odpowiedzi w trakcie sesji. Priorytet: konieczne
- FR-010: Uczący się może ocenić przypomnienie prostymi przyciskami mapowanymi na oceny SM-2. Priorytet: konieczne
- FR-011: System może aktualizować stan powtórek SM-2 po każdej ocenionej odpowiedzi. Priorytet: konieczne
- FR-012: Uczący się może zobaczyć postęp bieżącej sesji. Priorytet: konieczne
- FR-013: Uczący się może zobaczyć następne daty powtórek dla przejrzanych fiszek. Priorytet: konieczne
- FR-014: Istniejące generowanie fiszek z dokumentów nadal działa dla dokumentów innych niż kursowe. Priorytet: konieczne
- FR-015: Uczący się nadal może ręcznie tworzyć i edytować fiszki. Priorytet: konieczne

## Minimalne decyzje danych

Używamy istniejących pojęć tam, gdzie to możliwe:

- `topics` do grupowania treści kursu lub modułów,
- `documents` dla treści markdown lekcji,
- `flashcards` dla fiszek wygenerowanych i ręcznych,
- `spaced_repetition_data` dla stanu SM-2,
- `study_sessions` i `study_session_results` dla sesji powtórkowych.

Prawdopodobne dodatki albo potwierdzenia:

- metadane lekcji źródłowej na poziomie dokumentu albo fiszki,
- wynik/status lekkiego raportu jakości i pokrycia, jeśli będzie zapisywany zamiast być tylko przejściowy,
- mapowanie oceny powtórki zapisane w historii powtórek.

## Kawałki wdrożeniowe

### Kawałek 1 - Źródło i prompt

- Użyć ręcznego wklejenia albo przeciągnięcia pojedynczego pliku dla lokalnego markdownu.
- Poprawić prompt generowania dla lekcji kursowych.
- Zachować metadane lekcji.

### Kawałek 2 - Lekka jakość i pokrycie

- Zdefiniować checklistę jakości fiszki w kodzie i/lub prompcie.
- Dodać podstawowy raport AI dla słabych fiszek i oczywistych luk pokrycia.
- Utrzymać fiszki jako oczekujące.
- Poprawić przepływ akceptacji, edycji i odrzucania, jeśli będzie trzeba.

### Kawałek 3 - Serwis SM-2

- Dodać `@open-spaced-repetition/sm-2`.
- Zaimplementować `spaced-repetition.service.ts`.
- Dodać testy jednostkowe dla mapowania ocen i stanu następnej powtórki.

### Kawałek 4 - Sesja powtórkowa

- Pobierać zaakceptowane fiszki z terminem powtórki.
- Zbudować UI sesji.
- Zapisywać oceny odpowiedzi i zaktualizowany stan SRS.

### Kawałek 5 - Postęp i dopracowanie

- Pokazać liczbę fiszek do powtórki, liczbę przejrzanych fiszek i następne daty powtórek.
- Dodać podstawowe stany puste.
- Uruchomić testy regresji dla istniejącego logowania i przepływów treści.

## Otwarte decyzje przed PRD

1. Kształt importu markdown/plain text po MVP: lokalny skrypt, import administracyjny/deweloperski albo picker plików w aplikacji.
2. Głębokość powiązania ze źródłem: tylko poziom lekcji czy również kotwice do nagłówków.
3. Docelowa trwałość Quality Gate: raport przejściowy, status binarny, checklista z powodami albo oba.
4. Docelowe etykiety UI dla przypomnienia i dokładne mapowanie na oceny SM-2.
5. Czy markdown kursu do oceny ma być przygotowany jako dane importowane per użytkownik, dane demo/seed w repozytorium czy lokalne dane deweloperskie.
