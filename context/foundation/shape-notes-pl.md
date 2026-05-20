---
project: 10xCards v2
context_type: brownfield
product_type: web-app
target_scale:
  users: medium
  qps: low
  data_volume: small
timeline_budget:
  delivery_weeks: 3
  hard_deadline: null
  after_hours_only: true
created: 2026-05-19
updated: 2026-05-20
checkpoint:
  current_phase: 8
  phases_completed: [1, 2, 3, 4, 5, 6, 7]
  gray_areas_resolved:
    - topic: context type
      decision: Brownfield - istniejąca aplikacja 10xCards jest bazą dla MVP v2.
    - topic: current system
      decision: Zachować obecną aplikację Astro/Supabase/OpenRouter do zarządzania fiszkami i rozszerzyć ją w produkt z pętlą nauki.
    - topic: content source
      decision: Zbudować początkową bazę fiszek z polskich plików markdown i plain text lekcji przez wklejenie albo przeciągnięcie pojedynczego pliku.
    - topic: quality gate
      decision: Dodać przegląd jakości fiszek, zanim wygenerowane fiszki staną się materiałem do nauki.
    - topic: repetition algorithm
      decision: Użyć gotowej implementacji SM-2 dla MVP v2, opakowanej za granicą serwisu aplikacji.
    - topic: access model
      decision: Zachować istniejący model zalogowanego użytkownika; bez nowych ról w MVP v2.
    - topic: product framing
      decision: Zachować istniejącą powierzchnię produktu jako aplikację webową dla małej początkowej bazy uczących się.
    - topic: MVP delivery window
      decision: Ukształtować pierwszą wersję v2 do dowiezienia w trzy tygodnie pracy po godzinach.
    - topic: course material privacy
      decision: Traktować zaimportowany markdown kursu jako prywatną treść użytkownika w MVP.
    - topic: recall grading UI
      decision: Użyć prostych etykiet Again, Hard, Good, Easy mapowanych wewnętrznie na oceny SM-2.
    - topic: quality and coverage check
      decision: Dodać lekki raport jakości AI i pokrycia lekcji jako wsparcie przeglądu, nie jako automatyczną bramkę aktywacji.
  frs_drafted: 15
  quality_check_status: accepted
---

## Obecny system

10xCards to istniejąca aplikacja webowa do zarządzania tematami, dokumentami i fiszkami. Obsługuje rejestrację i logowanie, generowanie fiszek z pomocą AI przez OpenRouter, ręczne zarządzanie fiszkami oraz przepływ akceptacji fiszek wygenerowanych przez AI.

Obecny stack opisany przez projekt to Astro, TypeScript, React, Tailwind CSS, shadcn/ui, Supabase Auth/Postgres i OpenRouter. Obecny README oznacza system nauki i powtórek rozłożonych w czasie jako zaplanowany, ale jeszcze niewdrożony.

Istniejące obiekty domenowe i przepływy, które trzeba zachować: logowanie użytkownika, tematy, dokumenty, fiszki, źródło fiszki jako AI albo manualne, statusy oczekująca/zaakceptowana/odrzucona oraz istniejący przepływ generowania fiszek z dokumentu.

Obecna baza użytkowników: to projekt kursowy, a nie wdrożenie produkcyjne. Dziś używa go autor projektu, a podczas zaliczenia będą go też sprawdzać prowadzący kurs. Oczekiwana skala to kilka do kilkudziesięciu osób, głównie uczestnicy kursu i osoby oceniające.

## Problem i motywacja

Aplikacja potrafi już pomagać w tworzeniu i zarządzaniu fiszkami, ale nie domyka pętli nauki. W 10xCards v2 motywującą luką jest przekształcenie markdownów lekcji kursu w wysokiej jakości fiszki, które można powtarzać w czasie, zamiast tylko je wygenerować i zapisać.

Pierwszym konkretnym źródłem treści są polskie materiały 10xDevs3 pobrane jako markdown albo plain text. Produkt powinien pomóc uczącemu się przekształcić te lekcje w użyteczną bazę fiszek, zachować powiązanie ze źródłem, przejrzeć wygenerowane fiszki przed użyciem i zaplanować powtórki gotowym algorytmem.

Ta zmiana jest potrzebna teraz, bo obecna aplikacja ma jasne braki edukacyjne: potrafi generować fiszki, ale nie obsługuje serii powtórek, nie weryfikuje jakości wygenerowanych fiszek i nie pomaga ocenić, czy nauka się poprawia. Celem v2 jest uczynienie fiszek praktycznym narzędziem utrwalania najważniejszej wiedzy z kursu.

Obecne obejście: ręczne czytanie markdownów lekcji i ręczne tworzenie albo akceptowanie fiszek bez wiarygodnej pętli powtórek.

## Użytkownik i persona

Główna persona: polskojęzyczny uczestnik 10xDevs3 i programista, który buduje własny projekt kursowy i chce uczyć się materiału kursu podczas rozwijania 10xCards v2.

Moment użycia: po zaimportowaniu albo otwarciu markdownu lekcji użytkownik chce, żeby aplikacja zaproponowała fiszki, pozwoliła odrzucić albo poprawić słabe propozycje, a później uruchomiła sesje powtórkowe na podstawie fiszek z terminem powtórki.

## Kryteria sukcesu

### Podstawowe

- Uczący się może ręcznie wkleić albo przeciągnąć jeden polski plik lekcji w markdown/plain text jako dokument.
- Uczący się może wygenerować fiszki z tej lekcji.
- Uczący się może zaakceptować, edytować albo odrzucić wygenerowane fiszki przed nauką.
- Uczący się może ukończyć sesję powtórkową przy użyciu zaakceptowanych fiszek.
- Wyniki powtórek aktualizują następne daty powtórek przez SM-2.
- Uczący się widzi lekki raport AI, który wskazuje słabe wygenerowane fiszki i oczywiste luki w pokryciu lekcji.

### Drugorzędne

- Co najmniej 75% fiszek wygenerowanych z reprezentatywnej lekcji zostaje zaakceptowanych po przeglądzie, edycji albo odrzuceniu.
- Co najmniej 75% nowych fiszek uczącego się w przepływie MVP pochodzi z generowania AI, a nie ręcznego tworzenia.
- Każdą fiszkę do nauki da się powiązać z lekcją albo dokumentem źródłowym.
- Jakość promptu poprawia się względem obecnego, ogólnego przepływu generowania.
- Informacja o jakości i pokryciu pomaga uczącemu się zdecydować, co edytować, odrzucić albo wygenerować ponownie.
- Prowadzący kurs mogą zrozumieć i przejść kompletną pętlę nauki MVP podczas oceny projektu.

### Ograniczenia ochronne

- Istniejące logowanie, tematy, dokumenty, fiszki i przepływy akceptacji nie mogą się pogorszyć.
- Istniejące dane użytkownika nie są destrukcyjnie migrowane.
- Wygenerowane fiszki nigdy nie stają się aktywnymi fiszkami do nauki bez akceptacji użytkownika.
- MVP nie może zawierać własnego zaawansowanego algorytmu powtórek.
- Informacja o jakości i pokryciu nie może automatycznie aktywować fiszek bez akceptacji użytkownika.

## Historie użytkownika

### US-01: Generowanie fiszek z markdownu lekcji

Przed zmianą: lekcję można było dodać jako zwykły dokument, ale nie było przepływu skupionego na przekształcaniu materiału kursowego w zestaw do nauki.

- **Given** zalogowany uczący się ma lekcję kursu w markdownie
- **When** prosi o wygenerowanie fiszek z tej lekcji
- **Then** otrzymuje proponowane fiszki powiązane z lekcją/dokumentem źródłowym

#### Kryteria akceptacji

- Proponowane fiszki powstają jako oczekujące, a nie automatycznie zaufane.
- Każdą proponowaną fiszkę można zaakceptować, edytować albo odrzucić.
- Uczący się widzi, która lekcja albo dokument wygenerowały fiszkę.

### US-02: Przegląd wygenerowanych fiszek przez bramkę jakości

Przed zmianą: wygenerowane fiszki można było ręcznie zaakceptować albo odrzucić, ale nie było osobnej informacji o jakości fiszek ani pokryciu lekcji.

- **Given** istnieją oczekujące fiszki wygenerowane przez AI
- **When** uczący się je przegląda
- **Then** słabe fiszki mogą zostać odrzucone albo poprawione, zanim trafią do sesji nauki

#### Kryteria akceptacji

- Aplikacja rozróżnia fiszki oczekujące, zaakceptowane i odrzucone.
- Zaakceptowane fiszki stają się dostępne dla sesji nauki.
- Odrzucone fiszki nie pojawiają się w sesjach nauki.

### US-03: Uruchomienie sesji powtórek rozłożonych w czasie

Przed zmianą: zaakceptowane fiszki były rekordami treści, ale nie tworzyły zaplanowanej sesji powtórkowej.

- **Given** istnieją zaakceptowane fiszki ze stanem powtórek
- **When** uczący się rozpoczyna sesję
- **Then** aplikacja pokazuje fiszki do powtórki i aktualizuje następne daty powtórek na podstawie ocen użytkownika

#### Kryteria akceptacji

- Sesja używa gotowej reguły harmonogramowania w stylu SM-2.
- Uczący się może ocenić jakość przypomnienia po odpowiedzi.
- Fiszka zapisuje zaktualizowany stan powtórek po przeglądzie.

### US-04: Zachowanie istniejących przepływów treści

Przed zmianą: istniejące zarządzanie tematami, dokumentami i fiszkami było działającą podstawą aplikacji i musi pozostać dostępne.

- **Given** istnieją tematy, dokumenty i fiszki
- **When** dodawane są funkcje MVP v2
- **Then** istniejące CRUD i zachowanie akceptacji pozostają dostępne

#### Kryteria akceptacji

- Istniejące fiszki nie są usuwane ani migrowane destrukcyjnie.
- Istniejące endpointy generowania AI i przepływy UI działają dalej, chyba że zostaną jawnie zastąpione zmianą MVP.

## Zakres zmiany

- [nowe] Zalogowany uczący się może ręcznie wkleić treść albo przeciągnąć jeden polski plik markdown/plain text lekcji jako dokument. Priorytet: konieczne
- [nowe] Zalogowany uczący się może wygenerować kandydatów na fiszki z dokumentu lekcji. Priorytet: konieczne
- [nowe] System może zapisać metadane lekcji źródłowej dla wygenerowanych fiszek. Priorytet: konieczne
- [nowe] System domyślnie oznacza wygenerowane fiszki jako oczekujące. Priorytet: konieczne
- [nowe] System może przygotować lekki raport jakości i pokrycia dla wygenerowanego zestawu fiszek. Priorytet: konieczne
- [nowe] Uczący się może zaakceptować, edytować albo odrzucić oczekujące fiszki. Priorytet: konieczne
- [nowe] System może uniemożliwić odrzuconym fiszkom pojawianie się w sesjach nauki. Priorytet: konieczne
- [nowe] System może wybrać zaakceptowane fiszki z terminem powtórki do sesji. Priorytet: konieczne
- [nowe] Uczący się może odkryć odpowiedzi w trakcie sesji. Priorytet: konieczne
- [nowe] Uczący się może ocenić przypomnienie prostymi przyciskami mapowanymi na oceny SM-2. Priorytet: konieczne
- [nowe] System może aktualizować stan powtórek SM-2 po każdej ocenionej odpowiedzi. Priorytet: konieczne
- [nowe] Uczący się może zobaczyć postęp bieżącej sesji. Priorytet: konieczne
- [nowe] Uczący się może zobaczyć następne daty powtórek dla przejrzanych fiszek. Priorytet: konieczne
- [zmienione] Istniejące prompty AI są dostrojone pod fiszki do nauki kursu. Priorytet: konieczne
- [zmienione] Zaakceptowane fiszki są traktowane jako gotowe do nauki, a nie tylko gotowe do zarządzania treścią. Priorytet: konieczne
- [zachowane] Istniejące generowanie fiszek z dokumentów działa dalej dla dokumentów innych niż kursowe. Priorytet: konieczne
- [zachowane] Istniejące ręczne tworzenie i edycja fiszek pozostają dostępne. Priorytet: konieczne
- [zachowane] Istniejące logowanie, tematy, dokumenty, fiszki i przepływy akceptacji muszą dalej działać. Priorytet: konieczne
- [zachowane] Istniejąca własność danych użytkownika w Supabase musi pozostać nienaruszona. Priorytet: konieczne

## Ograniczenia i zgodność

- Zachować obecne granice danych zalogowanego użytkownika.
- Zachować istniejące tematy, dokumenty i fiszki.
- Unikać destrukcyjnych zmian schematu bez migracji i ścieżki rollbacku.
- Utrzymać algorytm powtórek jako wymienialny za interfejsem serwisu należącym do aplikacji.
- Zachować zgodność obsługi markdownu kursu z lokalnym repozytorium markdown w stylu Obsidiana.
- Istniejące trasy logowania, API tematów/dokumentów/fiszek i przepływy akceptacji muszą działać dla obecnych danych.
- Każda zmiana schematu dla stanu powtórek, sesji powtórkowych albo metadanych źródła musi być addytywna albo mieć ścieżkę rollbacku.
- Istniejące generowanie przez OpenRouter powinno nadal działać dla dokumentów innych niż kursowe, chyba że zostanie celowo zastąpione nową ścieżką promptu.
- Pierwsze MVP nie potrzebuje pełnego importera katalogów; wystarczy ręczne wklejenie albo przeciągnięcie jednego pliku.
- Raport jakości i pokrycia jest doradczy. Ręczna akceptacja pozostaje ostateczną decyzją aktywacji.

## Zmiany logiki biznesowej

Aplikacja przekształca zaufany materiał lekcji w fiszki do przeglądu, daje uczącemu się informację o jakości i pokryciu przed aktywacją oraz planuje powtórki zaakceptowanych fiszek na podstawie wyniku przypomnienia.

To zmienia 10xCards z aplikacji do tworzenia i zarządzania fiszkami w aplikację z pętlą nauki. Kluczowe nowe decyzje to: czy fiszka jest gotowa do nauki, czy wygenerowany zestaw pomija ważne obszary lekcji oraz kiedy każda zaakceptowana fiszka powinna zostać powtórzona.

Algorytm powtórek w MVP v2 powinien być gotowym SM-2. Aplikacja powinna posiadać granicę serwisu i utrwalony kształt stanu, a nie ujawniać API pakietu przez produkt.

## Zmiany kontroli dostępu

Brak planowanych zmian kontroli dostępu w MVP v2. Zachowujemy obecny model zalogowanego użytkownika: każdy użytkownik loguje się i pracuje z własnymi tematami, dokumentami, fiszkami i sesjami.

Zaimportowany markdown kursu traktujemy w MVP jako prywatną treść użytkownika. Współdzielone dane seed, publiczne talie i przestrzenie zespołowe pozostają poza zakresem, chyba że późniejsza decyzja jawnie to zmieni.

## Wymagania niefunkcjonalne

- Uczący się dostaje widoczną informację zwrotną dla generowania AI albo akcji sesji powtórkowej, które trwają dłużej niż dwie sekundy.
- Aktualizacja odpowiedzi w powtórce musi być trwale zapisana, zanim następna fiszka zostanie pokazana jako ukończona.
- Fiszki pochodzące z kursu pozostają w zakresie przestrzeni zalogowanego użytkownika, chyba że późniejsza decyzja jawnie wprowadzi współdzielone dane seed.
- Aplikacja pozostaje używalna w lokalnym środowisku deweloperskim z lokalnym Supabase.
- Fiszki pochodzące z kursu da się powiązać przynajmniej z lekcją/dokumentem źródłowym.
- Istniejące generowanie fiszek dla dokumentów innych niż kursowe i ręczne przepływy fiszek pozostają dostępne po zmianie.
- Raport jakości i pokrycia jest generowany dla uczącego się w tym samym przepływie przeglądu co wygenerowane fiszki; w MVP nie potrzebuje pełnej analityki ani historycznego śledzenia trendów.

## Potwierdzenie osi czasu

MVP jest ukształtowane na trzy tygodnie pracy po godzinach. Zakres pozostaje ograniczony do pełnej pętli nauki: wklejony albo przeciągnięty pojedynczy dokument lekcji, generowanie kandydatów, lekki raport jakości/pokrycia, ręczna akceptacja, sesja fiszek do powtórki, aktualizacja stanu SM-2 i podstawowy postęp.

## Poza zakresem

- Brak własnego zaawansowanego algorytmu powtórek w MVP v2; używamy gotowej implementacji SM-2.
- Brak migracji do FSRS w MVP v2; zostaje jako kandydat do późniejszej oceny.
- Brak współdzielonych talii i przestrzeni zespołowych w MVP v2.
- Brak publicznego marketplace'u fiszek kursowych w MVP v2.
- Brak aplikacji mobilnej w MVP v2.
- Brak importu PDF, DOCX, HTML, EPUB, obrazów, audio albo wideo w MVP v2.
- Brak pełnego importera lokalnych katalogów w MVP v2; wystarczy ręczne wklejenie albo przeciągnięcie pojedynczego pliku.
- Brak pełnego crawlera zalogowanej platformy kursowej w aplikacji w MVP v2.
- Brak integracji z zewnętrznymi platformami nauki w MVP v2.
- Brak przetwarzania wideo/audio do generowania fiszek w MVP v2.
- Brak trwałej zaawansowanej analityki Quality Gate, panelu scoringowego albo historycznych trendów pokrycia w MVP v2.
- Brak maili, powiadomień push i przypomnień kalendarzowych o zaległych powtórkach w MVP v2; zaległe fiszki pozostają zaległe i są pokazywane jako pierwsze w następnej sesji.
- Brak wersji wielojęzycznej; MVP jest tylko po polsku.
- Brak szerokiej synchronizacji z Obsidianem; wystarczy zgodność ze źródłowym markdownem.

## Otwarte pytania

1. **Kształt importu markdown/plain text po MVP** - Właściciel: użytkownik/Codex. Zdecydować, czy późniejsze wersje dodadzą lokalny skrypt importu katalogu czy wsadowy importer w aplikacji.
2. **Głębokość powiązania ze źródłem** - Właściciel: użytkownik. Zdecydować, czy fiszka linkuje tylko do dokumentu lekcji, czy również do konkretnego nagłówka/sekcji.
3. **Kształt zapisu raportu jakości i pokrycia** - Właściciel: użytkownik/Codex. Zdecydować, czy MVP zapisuje wynik raportu, przelicza go na żądanie, czy trzyma jako przejściową informację w przeglądzie.
4. **Dokładne mapowanie ocen SM-2** - Właściciel: użytkownik/Codex. Potwierdzić mapowanie liczbowe dla Again, Hard, Good i Easy przed wdrożeniem.
5. **Kształt danych do oceny/demo** - Właściciel: użytkownik. Zdecydować, czy markdown kursu do oceny jest przygotowany jako dane importowane per użytkownik, dane seed/demo w repozytorium czy lokalne dane deweloperskie.

## Kontrola jakości

- Kontrola dostępu: obecna.
- Logika biznesowa: obecna jako jednozdaniowa reguła domenowa.
- Artefakty projektu: obecne.
- Potwierdzenie kosztu czasowego: obecne.
- Poza zakresem: obecne.
- Zachowanie istniejącego działania: obecne w ograniczeniach i zakresie.

## Dalej: techniczna mapa drogowa

- Kandydat pakietu: `@open-spaced-repetition/sm-2`.
- Granica serwisu: `src/lib/services/spaced-repetition.service.ts`.
- Istniejąca notatka: `docs/decisions/spaced-repetition.md`.
- Przyszły kandydat po MVP: `ts-fsrs`, jeśli produkt będzie potrzebował bogatszego harmonogramowania.
- Kierunek rozbudowy: lokalny importer katalogu plików markdown kursu.
- Kierunek rozbudowy: powiązanie ze źródłem na poziomie nagłówków i mapa pokrycia lekcji.
- Kierunek rozbudowy: trwała checklista Quality Gate z powodami, panelem i sugestiami ponownego generowania.
- Kierunek rozbudowy: bogatsza analityka postępów, serie, przypomnienia, współdzielone talie i szerszy import formatów.
