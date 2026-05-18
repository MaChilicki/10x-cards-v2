# Plan Testów dla Projektu {app-name}

## 1. Wprowadzenie i Cele Testowania

### Wprowadzenie

Niniejszy dokument opisuje plan testów dla aplikacji `{app-name}`, stworzonej z wykorzystaniem nowoczesnego stosu technologicznego obejmującego Astro, React, TypeScript, Tailwind CSS, Shadcn/ui oraz Supabase jako backend. Celem planu jest zapewnienie wysokiej jakości, niezawodności, bezpieczeństwa i wydajności aplikacji przed jej wdrożeniem produkcyjnym. Plan uwzględnia specyfikę architektury opartej na Astro (MPA z wyspami interaktywności React) oraz integrację z usługami zewnętrznymi (Supabase, Openrouter.ai).

### Cele Testowania

*   **Weryfikacja funkcjonalna:** Potwierdzenie, że wszystkie funkcjonalności aplikacji działają zgodnie z wymaganiami i specyfikacją.
*   **Zapewnienie jakości UI/UX:** Sprawdzenie poprawności renderowania interfejsu użytkownika, spójności wizualnej, responsywności oraz intuicyjności obsługi na różnych urządzeniach i przeglądarkach.
*   **Weryfikacja integracji:** Upewnienie się, że komponenty front-endowe (Astro, React) poprawnie komunikują się z backendem (API, Supabase) oraz że integracja z usługami zewnętrznymi (Openrouter.ai) działa prawidłowo.
*   **Ocena wydajności:** Identyfikacja i eliminacja potencjalnych wąskich gardeł wydajnościowych aplikacji i API.
*   **Weryfikacja bezpieczeństwa:** Identyfikacja i eliminacja potencjalnych luk bezpieczeństwa, zwłaszcza w obszarach autentykacji, autoryzacji i dostępu do danych.
*   **Zapewnienie niezawodności:** Sprawdzenie stabilności aplikacji i jej odporności na błędy oraz nieoczekiwane sytuacje.
*   **Weryfikacja zgodności z typami:** Potwierdzenie poprawności typowania w całym projekcie dzięki TypeScript.

## 2. Zakres Testów

### Funkcjonalności objęte testami:

*   **Autentykacja użytkowników:** Rejestracja (`/register`), logowanie (`/login`), wylogowywanie, zarządzanie sesją, weryfikacja e-mail (`/verify-email`), resetowanie hasła (`/reset-password`, `/set-new-password`), zmiana hasła (`/change-password`). Obejmuje logikę w `src/middleware/index.ts` i endpointy w `src/pages/api/auth/*`.
*   **Zarządzanie Dokumentami:** Funkcjonalności związane ze stronami w `src/pages/documents/*`, komponentami w `src/components/documents/*` i API w `src/pages/api/documents/*`. Obejmuje upload, listowanie, przeglądanie, edycję metadanych i usuwanie dokumentów.
*   **Zarządzanie Tematami:** Funkcjonalności związane ze stronami w `src/pages/topics/*`, komponentami w `src/components/topics/*` i API w `src/pages/api/topics/*`. Obejmuje tworzenie, listowanie, przeglądanie, edycję i usuwanie tematów.
*   **Zarządzanie Fiszki (Flashcards):** Funkcjonalności związane z komponentami w `src/components/flashcards/*` i API w `src/pages/api/flashcards/*`. Obejmuje generowanie/tworzenie, wyświetlanie i sesje nauki.
*   **Strona Główna:** Strona `/index.astro`.
*   **API:** Wszystkie endpointy w `src/pages/api/` (auth, documents, topics, flashcards), w tym walidacja danych (Zod), obsługa błędów, autoryzacja (Supabase RLS). Komponenty frontendowe będą testowane z użyciem `MSW` do mockowania API.
*   **Komponenty UI:** Renderowanie, interaktywność i stan komponentów React (`src/components/**/*.tsx`) i statycznych komponentów Astro (`src/components/**/*.astro`), w tym komponenty z `Shadcn/ui` (`src/components/ui`). Rozwój i testowanie w izolacji przy użyciu `Storybook`.
*   **Routing i Middleware:** Poprawność działania routingu Astro i logiki w `src/middleware/index.ts` (ochrona tras, przekierowania).
*   **Responsywność:** Wyświetlanie kluczowych stron na różnych szerokościach ekranu.
*   **Dostępność (Accessibility):** Weryfikacja z użyciem `Axe DevTools` i `pa11y`.
*   **Poprawność typów TypeScript:** Weryfikacja typów w całym projekcie przy użyciu `tsd/dtslint`.

### Funkcjonalności wyłączone z testów (na chwilę obecną):

*   **Profil Użytkownika:** (Strona `/profile.astro`) - Funkcjonalność niezaimplementowana.
*   **Statystyki:** (Strona `/statistics.astro`) - Funkcjonalność niezaimplementowana.
*   **Zarządzanie Sesjami Użytkownika (widok):** (Strona `/sessions.astro`) - Funkcjonalność niezaimplementowana (sama obsługa sesji przez Supabase jest testowana w ramach autentykacji).
*   Zaawansowane testy penetracyjne.
*   Testy obciążeniowe na dużą skalę.

## 3. Typy Testów do Przeprowadzenia

*   **Testy Jednostkowe (Unit Tests):**
    *   **Cel:** Weryfikacja izolowanych funkcji, modułów, komponentów React (logika) i statycznych komponentów Astro.
    *   **Narzędzia:** `Vitest` (`^3.1.1`), `@testing-library/react` (`^16.3.0`) dla komponentów React, `@testing-library/dom` dla komponentów Astro, `jsdom` (`^26.1.0`).
    *   **Zakres:** Funkcje pomocnicze w `src/lib`, hooki React (`src/hooks`, `src/components/hooks`), logika komponentów React (bez renderowania, np. obsługa stanu z `Zustand` w `src/stores`), renderowanie statycznych komponentów Astro, schematy walidacji `Zod` (`src/schemas`).
*   **Testy Integracyjne (Integration Tests):**
    *   **Cel:** Weryfikacja współpracy między modułami, w tym komponentów z usługami i mockowanym API.
    *   **Narzędzia:** `Vitest`, `@testing-library/react`, `MSW` (Mock Service Worker) do mockowania API, lokalna instancja Supabase (Docker) dla testów logiki backendowej (jeśli dotyczy w ramach Vitest).
    *   **Zakres:** Interakcja komponentów React, renderowanie komponentów React z `React Testing Library` i weryfikacja ich interakcji z mockowanymi serwisami/API (MSW), komunikacja frontend-API (mockowana), interakcje z lokalną bazą danych Supabase w logice API (jeśli testowane w Vitest), logika `middleware`.
*   **Testy Komponentów UI w Izolacji (Storybook):**
    *   **Cel:** Rozwój, testowanie wizualne i funkcjonalne komponentów UI w izolowanym środowisku.
    *   **Narzędzia:** `Storybook`.
    *   **Zakres:** Wszystkie reużywalne komponenty React i Astro, weryfikacja różnych stanów i propsów komponentów. Może być połączone z testami wizualnymi (np. Chromatic).
*   **Testy End-to-End (E2E Tests):**
    *   **Cel:** Weryfikacja kompletnych przepływów użytkownika w przeglądarce, wobec realnie działającej aplikacji (frontend + backend).
    *   **Narzędzia:** `Playwright` (**należy zainstalować i skonfigurować**).
    *   **Zakres:** Kluczowe scenariusze (rejestracja, logowanie, dodawanie dokumentu, tworzenie tematu, sesja nauki fiszek, zmiana hasła na `/change-password`), nawigacja między stronami Astro, hydracja komponentów React, działanie formularzy, podstawowa weryfikacja działania strony `/`.
*   **Testy API (Automatyczne):**
    *   **Cel:** Bezpośrednia automatyczna weryfikacja endpointów API w `src/pages/api/*` wobec lokalnej instancji Supabase.
    *   **Narzędzia:** `Playwright` (wykorzystanie jego możliwości do testowania API) lub `Vitest` z klientem HTTP (np. `node-fetch`).
    *   **Zakres:** Poprawność odpowiedzi (statusy, treść), obsługa metod HTTP, walidacja danych wejściowych (Zod), autentykacja (middleware) i autoryzacja (Supabase RLS) dla endpointów `auth`, `documents`, `topics`, `flashcards`. (Manualne testy za pomocą `REST Client` i `Postman/Insomnia` jako uzupełnienie).
*   **Testy Wizualne (Visual Regression Testing):**
    *   **Cel:** Wykrywanie niezamierzonych zmian w wyglądzie UI.
    *   **Narzędzia:** `Playwright` (z funkcją porównywania), `Chromatic` (integracja ze `Storybook`), `Percy` (**Playwright jako punkt wyjścia, inne do rozważenia**).
    *   **Zakres:** Kluczowe strony (`/login`, `/register`, widoki list) i komponenty `Shadcn/ui` po dostosowaniach, komponenty w `Storybook`.
*   **Testy Wydajnościowe:**
    *   **Cel:** Podstawowa ocena czasu odpowiedzi i Core Web Vitals.
    *   **Narzędzia:** `Lighthouse CI` (do automatyzacji w CI/CD), `WebVitals` (biblioteka do monitorowania).
    *   **Zakres:** Czas ładowania kluczowych stron, Core Web Vitals, czas odpowiedzi kluczowych endpointów API. Uruchamiane w CI.
*   **Testy Bezpieczeństwa:**
    *   **Cel:** Podstawowa identyfikacja podatności.
    *   **Narzędzia:** Skanery zależności (`npm audit`), `Snyk` (skanowanie kodu i zależności), manualna weryfikacja logiki autentykacji/autoryzacji w `middleware` i konfiguracji Supabase RLS. `ZAP` (OWASP Zed Attack Proxy - opcjonalnie, dla głębszych testów).
    *   **Zakres:** Mechanizmy logowania/rejestracji, ochrona tras w `middleware`, bezpieczeństwo zależności, potencjalne podatności w obsłudze danych wejściowych API. Skanowanie za pomocą `Snyk` w CI.
*   **Testy Dostępności (Accessibility Tests):**
    *   **Cel:** Podstawowa weryfikacja zgodności z WCAG.
    *   **Narzędzia:** `Axe DevTools` (rozszerzenie przeglądarki), `pa11y` (do automatyzacji w CI).
    *   **Zakres:** Formularze logowania/rejestracji, nawigacja po stronie głównej, kluczowe przyciski akcji. Uruchamiane w CI za pomocą `pa11y`.
*   **Testowanie Poprawności Typów TypeScript:**
    *   **Cel:** Weryfikacja poprawności definicji typów TypeScript.
    *   **Narzędzia:** `tsd`/`dtslint` (lub podobne, skonfigurowane w projekcie).
    *   **Zakres:** Kluczowe publiczne interfejsy API modułów, definicje typów DTO (`src/types.ts`). Uruchamiane w CI.

## 4. Scenariusze Testowe dla Kluczowych Funkcjonalności

*(Scenariusze te powinny być dalej rozwijane w miarę rozwoju aplikacji. Poniżej znajdują się przykłady oparte na aktualnej strukturze projektu)*

### 4.1 Autentykacja i Zarządzanie Kontem (strony: `login.astro`, `register.astro`, `reset-password.astro`, `set-new-password.astro`, `verify-email.astro`, `change-password.astro`; API: `src/pages/api/auth/*`)

*   **Rejestracja:**
    *   Pomyślna rejestracja nowego użytkownika przy użyciu formularza na `/register`.
    *   Próba rejestracji z już istniejącym adresem e-mail - oczekiwany błąd walidacji.
    *   Próba rejestracji z niepoprawnym formatem adresu e-mail - oczekiwany błąd walidacji.
    *   Próba rejestracji ze zbyt krótkim/słabym hasłem (zgodnie z zdefiniowanymi regułami) - oczekiwany błąd walidacji.
    *   Sprawdzenie, czy po pomyślnej rejestracji wysyłany jest e-mail weryfikacyjny.
*   **Logowanie:**
    *   Pomyślne logowanie istniejącego użytkownika (z zweryfikowanym e-mailem) przez formularz na `/login`.
    *   Próba logowania z niepoprawnym adresem e-mail.
    *   Próba logowania z niepoprawnym hasłem.
    *   Próba logowania użytkownika z niezweryfikowanym adresem e-mail (jeśli jest wymagana weryfikacja).
    *   Sprawdzenie przekierowania po pomyślnym logowaniu (np. na `/`).
*   **Weryfikacja E-mail:**
    *   Kliknięcie w link weryfikacyjny z e-maila - pomyślna weryfikacja konta (sprawdzenie strony `/verify-email`).
    *   Próba użycia niepoprawnego lub wygasłego tokenu weryfikacyjnego.
*   **Resetowanie Hasła:**
    *   Poprawne wysłanie prośby o reset hasła przez formularz na `/reset-password`.
    *   Sprawdzenie otrzymania e-maila z linkiem do resetu hasła.
    *   Pomyślne ustawienie nowego hasła za pomocą formularza na `/set-new-password` po kliknięciu w link.
    *   Próba użycia niepoprawnego lub wygasłego tokenu resetu hasła.
    *   Próba ustawienia nowego hasła, które nie spełnia wymagań bezpieczeństwa.
*   **Zmiana Hasła (dla zalogowanego użytkownika):**
    *   Pomyślna zmiana hasła przez zalogowanego użytkownika na stronie `/change-password` (wymaga podania starego hasła).
    *   Próba zmiany hasła z podaniem niepoprawnego starego hasła.
    *   Próba ustawienia nowego hasła, które nie spełnia wymagań bezpieczeństwa.
*   **Ochrona Tras:**
    *   Próba dostępu do stron wymagających zalogowania (np. `/settings`, `/profile`, `/sessions`, `/documents`, `/topics`) przez niezalogowanego użytkownika - oczekiwane przekierowanie na `/login`.
    *   Próba dostępu do stron tylko dla niezalogowanych (np. `/login`, `/register`) przez zalogowanego użytkownika - oczekiwane przekierowanie (np. na `/`).
*   **API Autentykacji (`/api/auth/*`):**
    *   Testowanie endpointów `login`, `register`, `logout`, `verify-email`, `reset-password`, `set-new-password`, `change-password` pod kątem poprawnych odpowiedzi (2xx, 4xx, 5xx), walidacji danych wejściowych i obsługi błędów.
    *   Testowanie ochrony endpointów API wymagających autentykacji (np. próba dostępu bez ważnego tokenu/sesji).

### 4.2 Zarządzanie Dokumentami (strony: `src/pages/documents/*`; API: `src/pages/api/documents/*`; komponenty: `src/components/documents/*`)

*   **Wyświetlanie Listy Dokumentów:**
    *   Poprawne wyświetlenie listy dokumentów dostępnych dla zalogowanego użytkownika.
    *   Testowanie paginacji (jeśli istnieje).
    *   Testowanie filtrowania/sortowania listy (jeśli istnieje).
    *   Wyświetlenie informacji o braku dokumentów, gdy lista jest pusta.
*   **Tworzenie/Upload Dokumentu:**
    *   Pomyślne dodanie/upload nowego dokumentu.
    *   Próba dodania dokumentu o nieobsługiwanym formacie lub przekraczającego limit rozmiaru.
    *   Sprawdzenie walidacji pól formularza (np. nazwa dokumentu).
*   **Wyświetlanie Szczegółów Dokumentu:**
    *   Poprawne wyświetlenie zawartości lub metadanych wybranego dokumentu.
    *   Próba dostępu do dokumentu, do którego użytkownik nie ma uprawnień.
*   **Edycja Dokumentu:**
    *   Pomyślna edycja metadanych dokumentu (np. nazwy).
    *   Próba edycji dokumentu przez użytkownika bez odpowiednich uprawnień.
*   **Usuwanie Dokumentu:**
    *   Pomyślne usunięcie dokumentu.
    *   Potwierdzenie operacji usunięcia (jeśli wymagane).
    *   Próba usunięcia dokumentu przez użytkownika bez odpowiednich uprawnień.
*   **API Dokumentów (`/api/documents/*`):**
    *   Testowanie endpointów CRUD dla dokumentów (GET, POST, PUT/PATCH, DELETE).
    *   Weryfikacja autoryzacji - czy użytkownik może operować tylko na swoich dokumentach lub tych, do których ma dostęp.
    *   Testowanie walidacji danych wejściowych.

### 4.3 Zarządzanie Tematami (strony: `src/pages/topics/*`; API: `src/pages/api/topics/*`; komponenty: `src/components/topics/*`)

*(Scenariusze analogiczne do zarządzania dokumentami, dostosowane do specyfiki tematów)*
*   Wyświetlanie listy tematów.
*   Tworzenie nowego tematu.
*   Wyświetlanie szczegółów tematu (np. powiązanych dokumentów/fiszek).
*   Edycja tematu.
*   Usuwanie tematu.
*   Testowanie API CRUD dla tematów (`/api/topics/*`) z uwzględnieniem autoryzacji.

### 4.4 Zarządzanie Fiszki (Flashcards) (API: `src/pages/api/flashcards/*`; komponenty: `src/components/flashcards/*`)

*(Zakładając, że fiszki są powiązane np. z dokumentami lub tematami)*
*   **Generowanie/Tworzenie Fiszek:**
    *   Pomyślne wygenerowanie/stworzenie fiszek na podstawie dokumentu/tematu.
    *   Obsługa błędów podczas generowania (np. problem z przetwarzaniem dokumentu).
*   **Wyświetlanie Fiszek:**
    *   Poprawne wyświetlenie fiszek powiązanych z danym kontekstem (dokumentem/tematem).
*   **Sesja Nauki (Study Session):**
    *   Rozpoczęcie sesji nauki fiszek.
    *   Przeglądanie fiszek (awers/rewers).
    *   Oznaczanie znajomości fiszki (np. "umiem", "nie umiem").
    *   Zapisywanie postępów sesji.
    *   Wyświetlanie podsumowania sesji.
*   **API Fiszek (`/api/flashcards/*`):**
    *   Testowanie endpointów związanych z fiszkami (np. GET fiszek dla dokumentu, POST do oznaczenia znajomości, API do zarządzania sesjami nauki).
    *   Weryfikacja autoryzacji.

### 4.5 Ogólne Scenariusze E2E

*   **Pełny cykl życia użytkownika:** Rejestracja -> Weryfikacja e-mail -> Logowanie -> Dodanie dokumentu -> Wygenerowanie fiszek -> Sesja nauki -> **Zmiana hasła na stronie `/change-password`** -> Wylogowanie.
*   **Interakcje między modułami:** Sprawdzenie, czy akcje w jednym module (np. dodanie dokumentu) poprawnie odzwierciedlają się w innym (np. pojawienie się opcji generowania fiszek).
*   **Obsługa błędów API:** Symulacja błędów serwera (np. 500) dla różnych endpointów API i sprawdzenie, czy frontend poprawnie je obsługuje (np. wyświetla komunikat błędu).
*   **Responsywność:** Wykonanie kluczowych scenariuszy (logowanie, przeglądanie listy, sesja nauki) na różnych rozdzielczościach ekranu (desktop, tablet, mobile).
*   **Dostępność:** Podstawowa nawigacja klawiaturą po kluczowych stronach i formularzach.

## 5. Środowisko Testowe

*   **Środowisko do testów jednostkowych i integracyjnych (Vitest):** Lokalne maszyny deweloperskie, środowisko CI (Github Actions). Mockowanie `Supabase SDK` (`@supabase/supabase-js`, `@supabase/ssr`) głównie dla testów jednostkowych komponentów/funkcji. Dla testów integracyjnych komponentów frontendowych użycie `MSW` do mockowania API. Dla testów integracyjnych logiki API preferowane jest użycie lokalnej instancji Supabase (Docker). Mockowanie `Openrouter API` (jeśli logika AI jest testowana jednostkowo/integracyjnie).
*   **Środowisko do testów E2E (Playwright), API (automatycznych i manualnych), Wizualnych:** Dedykowane środowisko testowe (staging) naśladujące produkcję lub lokalna instancja aplikacji połączona z lokalną instancją Supabase (Docker). Wymaga:
    *   Uruchomionej instancji aplikacji (lokalnie lub na stagingu) za pomocą adaptera `@astrojs/node`.
    *   Lokalnej instancji Supabase (Docker) lub oddzielnej, testowej instancji projektu Supabase na stagingu, z włączonym RLS i zmigrowaną strukturą bazy danych. Należy regularnie czyścić/resetować dane testowe.
    *   Skonfigurowanych (testowych, z limitami) kluczy API dla `Openrouter.ai`.
*   **Środowisko Storybook:** Lokalne środowisko deweloperskie do pracy z komponentami, potencjalnie wdrażane na platformę (np. Chromatic) do przeglądów i testów wizualnych.
*   **Przeglądarki (dla Playwright/Manualnych):** Chrome (najnowsza wersja), Firefox (najnowsza wersja), Safari (najnowsza wersja) - Playwright wspiera te przeglądarki (silniki: Chromium, Firefox, WebKit).
*   **Urządzenia:** Desktop, symulacja urządzeń mobilnych w Playwright/narzędziach przeglądarki.

## 6. Narzędzia do Testowania

*   **Framework do testów jednostkowych/integracyjnych JS/TS:** `Vitest` (`^3.1.1`)
*   **Biblioteka do testowania komponentów React:** `@testing-library/react` (`^16.3.0`)
*   **Testy statycznych komponentów Astro**`testing-library/dom`
*   **Środowisko DOM dla Vitest:** `jsdom` (`^26.1.0`)
*   **Framework do testów E2E:** `Playwright` (**należy zainstalować i skonfigurować**)
*   **Narzędzie do testowania API (automatyczne):** REST Client + Mock Service Worker (MSW)
*   **Narzędzie do testowania API (manualne):** `Postman`, `Insomnia`
*   **Rozwój i testowanie komponentów UI**: Storybook
*   **Narzędzie do testów wizualnych:** `Playwright` (z funkcją porównywania), `Chromatic`, `Percy` (**Playwright jako punkt wyjścia, inne do rozważenia**)
*   **Narzędzie do testów wydajnościowych (frontend):** `Lighthouse CI + WebVitals` (wbudowane w Chrome DevTools)
*   **Testowanie poprawności typów TypeScript**: tsd/dtslint
*   **Narzędzie do testów bezpieczeństwa (podstawowe):** `npm audit`, manualna analiza kodu, `ZAP` (OWASP Zed Attack Proxy - opcjonalnie, dla głębszych testów) + Snyk
*   **Narzędzie do testów dostępności:** `Axe DevTools/pa11y` (rozszerzenie przeglądarki)
*   **System CI/CD:** Github Actions (skonfigurowany do uruchamiania `vitest` w workflow)
*   **Śledzenie pokrycia kodu testami:** Codecov
*   **System zarządzania testami / raportowania błędów:** Linear.

## 7. Harmonogram Testów

*   **Testy jednostkowe, integracyjne (z MSW), testy typów TypeScript (`tsd/dtslint`):** Pisane na bieżąco przez deweloperów. Uruchamiane automatycznie w CI (Github Actions) przy każdym pushu/pull requeście.
*   **Testy API (automatyczne z Playwright/Vitest):** Pisane równolegle z implementacją endpointów. Uruchamiane w CI wobec lokalnej/testowej instancji Supabase.
*   **Komponenty w Storybook:** Tworzone i aktualizowane wraz z rozwojem komponentów UI.
*   **Testy E2E (Playwright):** Tworzone dla kluczowych przepływów po ustabilizowaniu się funkcjonalności. Uruchamiane regularnie w CI (np. co noc) oraz przed każdym wdrożeniem na produkcję.
*   **Testy Wizualne (Playwright/Chromatic):** Uruchamiane w CI dla pull requestów modyfikujących UI, szczególnie dla komponentów w Storybook.
*   **Manualne testy eksploracyjne (z użyciem REST Client dla API):** Przeprowadzane przed wydaniem większych funkcjonalności lub wersji.
*   **Testy wydajnościowe (`Lighthouse CI`, monitorowanie `WebVitals`):** Uruchamiane automatycznie w CI, regularne przeglądy raportów.
*   **Testy bezpieczeństwa (`npm audit`, `Snyk`):** Skanowanie zależności automatycznie w CI. Okresowa manualna weryfikacja kodu i konfiguracji RLS.
*   **Testy dostępności (`pa11y`):** Uruchamiane automatycznie w CI dla kluczowych stron.
*   **Testy regresji:** Uruchamianie pełnego zestawu testów automatycznych przed każdym wdrożeniem na produkcję.

*Szczegółowy harmonogram z konkretnymi datami powinien zostać opracowany w narzędziu do zarządzania projektem (`Linear`).*

## 8. Kryteria Akceptacji Testów

### Kryteria wejścia (rozpoczęcia fazy testów):

*   Funkcjonalność zaimplementowana i zintegrowana.
*   Kod pomyślnie przeszedł review.
*   Aplikacja wdrożona na środowisku testowym (staging) lub dostępna lokalnie z wszystkimi zależnościami (np. Supabase Docker).
*   Dostępna dokumentacja/specyfikacja/zadania w `Linear` dla testowanej funkcjonalności.
*   Podstawowe testy jednostkowe i integracyjne napisane przez deweloperów przechodzą pomyślnie.
*   Story dla komponentu w `Storybook` (jeśli dotyczy).

### Kryteria wyjścia (zakończenia fazy testów / gotowości do wdrożenia):

*   **Testy automatyczne:** 100% testów jednostkowych, integracyjnych, API i E2E zdefiniowanych jako krytyczne musi przechodzić pomyślnie. Pokrycie kodu testami na poziomie min. X% (np. 70-80%) dla kluczowych modułów, raportowane przez `Codecov`.
*   **Testy Typów:** Wszystkie testy typów (`tsd/dtslint`) przechodzą pomyślnie.
*   **Błędy:** Brak otwartych błędów krytycznych (blokujących) i wysokiego priorytetu w `Linear`. Wszystkie znalezione błędy są zaraportowane i ocenione.
*   **Scenariusze testowe:** Wszystkie zaplanowane scenariusze testowe (manualne i automatyczne) zostały wykonane i ich wyniki są udokumentowane.
*   **Testy wizualne:** Brak niezaakceptowanych regresji wizualnych (z `Playwright` lub `Chromatic`).
*   **Wydajność:** Wyniki z `Lighthouse CI` i monitorowania `WebVitals` mieszczą się w założonych progach.
*   **Bezpieczeństwo:** Wyniki skanowania `Snyk` i `npm audit` przeanalizowane, brak znanych krytycznych podatności.
*   **Dostępność:** Wyniki testów `pa11y` przeanalizowane, kluczowe problemy naprawione.
*   **Akceptacja:** Formalna akceptacja wyników testów przez Product Ownera / klienta (jeśli dotyczy).

## 9. Role i Odpowiedzialności

*   **Deweloperzy:**
    *   Pisanie testów jednostkowych i integracyjnych dla swojego kodu.
    *   Utrzymanie i aktualizacja testów.
    *   Naprawianie błędów znalezionych podczas wszystkich faz testowania.
    *   Dbanie o przechodzenie testów w CI.
*   **Inżynier QA / Tester:**
    *   Tworzenie i utrzymanie planu testów.
    *   Projektowanie i implementacja testów E2E, API, wizualnych, wydajnościowych.
    *   Wykonywanie testów manualnych (eksploracyjnych, regresji).
    *   Raportowanie i śledzenie błędów.
    *   Konfiguracja i utrzymanie środowisk testowych oraz narzędzi do testowania.
    *   Analiza wyników testów i raportowanie statusu jakości.
    *   Współpraca z deweloperami w celu diagnozowania i rozwiązywania problemów.
*   **Product Owner / Manager Projektu:**
    *   Definiowanie wymagań i kryteriów akceptacji.
    *   Priorytetyzacja funkcjonalności do testowania.
    *   Akceptacja wyników testów.
    *   Podejmowanie decyzji o wdrożeniu na podstawie raportów jakości.
*   **DevOps / Inżynier Infrastruktury:**
    *   Konfiguracja i utrzymanie pipeline'ów CI/CD.
    *   Zarządzanie środowiskami testowymi i produkcyjnymi.
    *   Wsparcie w konfiguracji narzędzi testowych w CI.

## 10. Procedury Raportowania Błędów

*   **Narzędzie:** `Linear`.
*   **Proces zgłaszania:**
    1.  Sprawdzenie, czy błąd nie został już zgłoszony w `Linear`.
    2.  Utworzenie nowego zadania/zgłoszenia (issue) w `Linear` z odpowiednim typem (np. "Bug").
    3.  Nadanie jasnego i zwięzłego tytułu.
    4.  Szczegółowy opis błędu, zawierający:
        *   Środowisko (np. Staging, przeglądarka, system operacyjny, wersja aplikacji/commit).
        *   Kroki do reprodukcji (numerowane, precyzyjne).
        *   Obserwowany rezultat.
        *   Oczekiwany rezultat.
        *   Zrzuty ekranu, nagrania wideo, logi (jeśli to możliwe i pomocne).
        *   Priorytet błędu (zgodnie ze skalą w `Linear`).
        *   Przypisanie do odpowiedniej osoby/zespołu (jeśli znane) w `Linear`.
        *   Dodanie odpowiednich etykiet/tagów w `Linear` (np. "bug", "auth", "ui", "api").
*   **Cykl życia błędu:** Zgodny z przepływem pracy (workflow) zdefiniowanym w `Linear` (np. Open, In Progress, In Review, Resolved, Closed, Reopened).
*   **Priorytety błędów (przykładowa definicja, do dostosowania w `Linear`):**
    *   **Blocker/Urgent:** Uniemożliwia korzystanie z kluczowej funkcjonalności, brak obejścia. Wstrzymuje dalsze testy/pracę.
    *   **Critical/High:** Poważny błąd w kluczowej funkcjonalności, utrata danych, luka bezpieczeństwa. Obejście może istnieć, ale jest trudne.
    *   **Major/Medium:** Znaczący błąd w funkcjonalności, ale istnieje obejście. Wpływa na doświadczenie użytkownika.
    *   **Minor/Low:** Drobny błąd funkcjonalny lub problem z UI, który nie wpływa znacząco na działanie aplikacji.
    *   **Trivial/None:** Błąd kosmetyczny, literówka, drobna niedogodność.
*   **Regularne przeglądy błędów (Bug Triage):** Spotkania zespołu w celu przeglądu nowo zgłoszonych błędów w `Linear`, ustalenia priorytetów i przypisania ich do odpowiednich osób. 