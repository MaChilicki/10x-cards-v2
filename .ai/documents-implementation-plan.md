# API Endpoint Implementation Plan: Documents API Endpoints

## 1. Przegląd punktu końcowego
Endpointy dotyczą operacji CRUD na dokumentach. Umożliwiają:
- Pobranie listy dokumentów (/api/documents) z opcjonalnymi parametrami filtracji i paginacji.
- Utworzenie nowego dokumentu (/api/documents) za pomocą danych w ciele żądania.
- Pobranie szczegółów pojedynczego dokumentu (/api/documents/{id}).
- Aktualizację istniejącego dokumentu (/api/documents/{id}).
- Usunięcie dokumentu (/api/documents/{id}).

Dodatkowo, po pomyślnym dodaniu dokumentu, system automatycznie inicjuje generowanie fiszek przez AI, wykorzystując endpoint POST /api/flashcards/ai-generate, który otrzymuje tekst dokumentu oraz (opcjonalnie) identyfikatory powiązanych encji (np. topic_id).

## 2. Szczegóły żądania

- **GET /api/documents**
  - Metoda HTTP: GET
  - Struktura URL: `/api/documents`
  - Parametry zapytania (Query):
    - Wymagane:
      - `page` (number): Numer strony (większy od 0).
      - `limit` (number): Liczba wyników na stronie (większa od 0).
      - `sort` (string): Klucz sortowania (np. `name`, `-created_at`).
    - Opcjonalne:
      - `name` (string, służy do filtrowania po nazwie dokumentu)
  - Request Body: Brak

- **POST /api/documents**
  - Metoda HTTP: POST
  - Struktura URL: `/api/documents`
  - Request Body (application/json):
    - Wymagane:
      - `name` (string): Nazwa dokumentu (niepusta).
      - `content` (string): Treść dokumentu (długość między 1000 a 10000 znaków).
    - Opcjonalne:
      - `topic_id` (string, UUID): Opcjonalne powiązanie z tematem. *Uwaga: Choć DTO to dopuszcza, obecna specyfikacja API nie wymaga/nie przewiduje `topic_id` w tym miejscu. Pozostawiamy do ewentualnej przyszłej rozbudowy.*

- **GET /api/documents/{id}**
  - Metoda HTTP: GET
  - Struktura URL: `/api/documents/{id}`
  - Parametry (Path):
    - Wymagany:
      - `id` (string): Identyfikator dokumentu w formacie UUID.
  - Request Body: Brak

- **PUT /api/documents/{id}**
  - Metoda HTTP: PUT
  - Struktura URL: `/api/documents/{id}`
  - Parametry (Path):
    - Wymagany:
      - `id` (string): Identyfikator dokumentu w formacie UUID.
  - Request Body (application/json):
    - Wymagane:
      - `name` (string): Nowa nazwa dokumentu (niepusta).
      - `content` (string): Nowa treść dokumentu (długość między 1000 a 10000 znaków).
    - Opcjonalne:
      - `topic_id` (string, UUID): Opcjonalna zmiana powiązania z tematem. *Uwaga: Podobnie jak w POST, obecna specyfikacja API nie obejmuje `topic_id`.*

- **DELETE /api/documents/{id}**
  - Metoda HTTP: DELETE
  - Struktura URL: `/api/documents/{id}`
  - Parametry (Path):
    - Wymagany:
      - `id` (string): Identyfikator dokumentu w formacie UUID.
  - Request Body: Brak
  - Uwaga: Usunięcie dokumentu powoduje również usunięci ewszystkich powiązanych z nim fiszek.

## 3. Wykorzystywane typy
Z pliku `src/types.ts`:
- `DocumentDto`: Do reprezentacji danych dokumentu w odpowiedziach API.
- `DocumentsListResponseDto`: Struktura odpowiedzi dla `GET /api/documents`.
- `DocumentCreateDto` (dostosowane): Interfejs dla danych wejściowych `POST` (tylko `name`, `content`).
- `DocumentUpdateDto` (dostosowane): Interfejs dla danych wejściowych `PUT` (`name`, `content` jako wymagane).

Dla operacji generowania fiszek wykorzystamy typy zdefiniowane dla AI:
- `FlashcardAiGenerateDto` – dane wejściowe dla generacji fiszek przez AI.
- `FlashcardAiResponse` – struktura odpowiedzi z wygenerowanymi fiszkami.

Zostaną utworzone dedykowane schematy `zod` do walidacji:
- Parametrów query dla `GET /api/documents`.
- Parametrów path (`id`) dla `GET/PUT/DELETE /api/documents/{id}`.
- Ciała żądania dla `POST /api/documents`.
- Ciała żądania dla `PUT /api/documents/{id}`.

## 4. Szczegóły odpowiedzi

- **GET /api/documents**
  - Status: 200 OK
  - Payload (`DocumentsListResponseDto`):
    ```json
    {
      "documents": [
        {
          "id": "string",
          "user_id": "string",
          "topic_id": "string | null",
          "name": "string",
          "content": "string", // Uwaga: Rozważyć nie zwracanie pełnej treści w liście dla wydajności
          "created_at": "ISODate string",
          "updated_at": "ISODate string",
          "ai_flashcards_count": "number", // Liczba zatwierdzonych fiszek AI
          "manual_flashcards_count": "number", // Liczba ręcznie dodanych fiszek
          "total_flashcards_count": "number" // Suma wszystkich fiszek
        }
      ],
      "total": number // Całkowita liczba dokumentów pasujących do filtrów
    }
    ```

- **POST /api/documents**
  - Status: 201 Created
  - Payload (`DocumentDto`):
    ```json
    {
      "id": "string",
      "user_id": "string",
      "topic_id": "string | null",
      "name": "string",
      "content": "string",
      "created_at": "ISODate string",
      "updated_at": "ISODate string",
      "ai_flashcards_count": 0,
      "manual_flashcards_count": 0,
      "total_flashcards_count": 0
    }
    ```

- **GET /api/documents/{id}**
  - Status: 200 OK
  - Payload: szczegóły dokumentu (jak wyżej)

- **PUT /api/documents/{id}**
  - Status: 200 OK
  - Payload: zaktualizowany dokument (identyczna struktura jak dla POST)

- **DELETE /api/documents/{id}**
  - Status: 200 OK
  - Payload:
    ```json
    { "message": "Document deleted successfully" }
    ```

- **Kody błędów:**
  - `400 Bad Request`: Błędy walidacji danych wejściowych.
  - `401 Unauthorized`: (Po wdrożeniu Modułu II) Problem z autentykacją.
  - `404 Not Found`: Zasób (dokument) nie został znaleziony.
  - `500 Internal Server Error`: Wewnętrzny błąd serwera (np. błąd bazy danych).

## 5. Przepływ danych

1.  **Żądanie HTTP:** Klient wysyła żądanie do odpowiedniego endpointu API Astro (`/src/pages/api/documents/...`).
2.  **Middleware (Astro):** (Po wdrożeniu Modułu II) Middleware weryfikuje token JWT i dołącza sesję użytkownika oraz klienta Supabase (`context.locals.supabase`, `context.locals.session`) do kontekstu żądania (`APIContext`). Obecnie markujemy użytkownika z DEFAULT_USER_ID.
3.  **API Route Handler:**
    *   Odczytuje parametry (path, query) i ciało żądania.
    *   **Walidacja:** Używa schematów `zod` do walidacji danych wejściowych. W przypadku błędu zwraca `400 Bad Request` z informacją o błędach.
    *   Wywołuje odpowiednią metodę w serwisie `documentsService`, przekazując zwalidowane dane oraz klienta Supabase i ID użytkownika z `context.locals`.
4.  **`documentsService` (`src/lib/services/documents.service.ts`):**
    *   Otrzymuje żądanie od kontrolera API.
    *   Korzysta z przekazanego klienta Supabase (`SupabaseClient` z `context.locals`) do interakcji z bazą danych. Klient ten ma wbudowany kontekst RLS (Row Level Security) dla uwierzytelnionego użytkownika.
    *   **Logika biznesowa:**
        *   `GET /api/documents`: 
            * Buduje zapytanie do Supabase z uwzględnieniem filtrowania (`name`), sortowania (`sort`) i paginacji (`page`, `limit`). 
            * Po pobraniu dokumentów, wykonuje dwa dodatkowe zapytania pobierające wszystkie fiszki AI i manual dla tych dokumentów.
            * Zlicza fiszki po stronie aplikacji dla każdego dokumentu i tworzy mapy z liczbami.
            * Łączy dane dokumentów z policzonymi statystykami i zwraca kompletną odpowiedź.
            * W przypadku błędu podczas pobierania statystyk, zwraca dokumenty bez statystyk.
        *   `POST /api/documents`: Wstawia nowy rekord do tabeli `documents`, używając `user_id` z kontekstu. Po pomyślnym zapisie, inicjuje **asynchroniczne** zadanie generowania fiszek, przekazując `document_id` i `content`.
        *   `GET /api/documents/{id}`: Pobiera dokument o podanym `id` i wykonuje dwa zapytania pobierające wszystkie fiszki AI i manual dla tego dokumentu. W odpowiedzi zwraca dokument wzbogacony o statystyki fiszek.
        *   `PUT /api/documents/{id}`: Aktualizuje dokument o podanym `id`. Po aktualizacji pobiera aktualne statystyki fiszek przez wywołanie `getDocumentById`.
        *   `DELETE /api/documents/{id}`:
            1.  Wykonuje zapytanie do Supabase, aby usunąć wszystkie fiszki powiązane z danym `document_id`.
            2.  Wykonuje zapytanie do Supabase, aby usunąć dokument o podanym `id`.
    *   Zwraca wynik operacji (dane lub potwierdzenie) do API Route Handler.
5.  **Odpowiedź HTTP:** API Route Handler formatuje odpowiedź (sukces lub błąd) i wysyła ją do klienta.

## 6. Względy bezpieczeństwa

- **Autentykacja:** (Po wdrożeniu Modułu II) Implementacja za pomocą Supabase Auth i JWT. Middleware Astro będzie odpowiedzialne za weryfikację tokenu.
- **Autoryzacja:** Egzekwowana przez polityki RLS w bazie danych Supabase (`@db-plan (139-155)`). Serwis musi używać klienta Supabase z kontekstu (`context.locals.supabase`), aby RLS działało poprawnie.
- **Walidacja danych wejściowych:** Kluczowa dla zapobiegania atakom (np. XSS, SQL Injection) i zapewnienia integralności danych. Należy rygorystycznie stosować schematy `zod` dla wszystkich danych wejściowych (parametry query, path, ciało żądania). Szczególną uwagę zwrócić na walidację długości pola `content`.
- **Rate Limiting:** Rozważyć implementację mechanizmu ograniczania liczby żądań (np. na poziomie bramy API lub middleware) w celu ochrony przed atakami typu DoS/brute-force.
- **Bezpieczeństwo zadania asynchronicznego:** Mechanizm wywołujący generowanie fiszek musi być zabezpieczony przed nieautoryzowanym wywołaniem i zapewniać idempotencję (jeśli to możliwe), aby uniknąć wielokrotnego generowania dla tego samego dokumentu w przypadku ponowienia.

## 7. Obsługa błędów

- **Błędy walidacji (400 Bad Request):** Zwracane przez API Route Handler, gdy dane wejściowe nie przejdą walidacji `zod`. Odpowiedź powinna zawierać szczegóły dotyczące błędnych pól.
- **Brak autoryzacji (401 Unauthorized):** Zwracane przez middleware (po wdrożeniu Modułu II), gdy token JWT jest nieprawidłowy lub go brakuje.
- **Nie znaleziono zasobu (404 Not Found):** Zwracane przez serwis lub API Route Handler, gdy dokument o podanym `id` nie istnieje lub użytkownik nie ma do niego dostępu (RLS może skutkować brakiem wyników, co należy interpretować jako 404).
- **Błędy serwera (500 Internal Server Error):** Zwracane w przypadku nieoczekiwanych problemów, np. błędów połączenia z bazą danych, nieprzechwyconych wyjątków w serwisie. Wszystkie błędy 5xx powinny być szczegółowo logowane.
- **Logowanie:** Należy wdrożyć centralny mechanizm logowania (np. wykorzystując integrację Astro lub dedykowaną bibliotekę). Logować zarówno błędy 4xx (dla monitoringu), jak i krytyczne błędy 5xx (ze śladem stosu). Rozważyć logowanie informacji o wywołaniu zadania asynchronicznego i jego statusie.

## 8. Rozważania dotyczące wydajności

- **Paginacja i filtrowanie:** Kluczowe dla `GET /api/documents`. Zapewnić, że paginacja, sortowanie i filtrowanie są efektywnie realizowane na poziomie zapytania do bazy danych.
- **Indeksy bazodanowe:** Wykorzystać istniejące indeksy na `user_id` i `topic_id` (`@db-plan (102-116)`). Rozważyć dodanie indeksu na `name`, jeśli filtrowanie po nazwie będzie częstą operacją.
- **Selektywne pobieranie danych:** W endpointcie `GET /api/documents` rozważyć niepobieranie pełnej, potencjalnie dużej, treści (`content`) dokumentów, a jedynie ich metadane (id, name, created_at itp.), chyba że jest to jawnie wymagane. Pełną treść pobierać tylko w `GET /api/documents/{id}`.
- **Operacja DELETE:** Usunięcie powiązanych fiszek przed usunięciem dokumentu może być kosztowne, jeśli dokument ma ich bardzo dużo. Wykonać te operacje w ramach transakcji, jeśli Supabase client/Astro to umożliwia, aby zapewnić spójność.
- **Zadanie asynchroniczne:** Generowanie fiszek przez AI może być czasochłonne. Odseparowanie go jako zadania asynchronicznego zapobiega blokowaniu odpowiedzi `POST /api/documents`. Należy monitorować wydajność i czas wykonania tych zadań.
- **Cache:** Dla często odczytywanych dokumentów lub wyników `GET /api/documents` (jeśli dane nie zmieniają się często) można rozważyć implementację warstwy cache (np. Redis).

## 9. Etapy wdrożenia

1.  **Definicja schematów walidacyjnych Zod:**
    *   Utworzenie plików ze schematami `zod` dla parametrów query (`GET`), path (`GET/PUT/DELETE {id}`) oraz ciała żądania (`POST`, `PUT`) w `src/lib/validators/document.validators.ts`.
2.  **Implementacja warstwy serwisowej (`documentsService`):**
    *   Utworzenie pliku `src/lib/services/documents.service.ts`.
    *   Implementacja metod serwisu (`listDocuments`, `createDocument`, `getDocumentById`, `updateDocument`, `deleteDocument`) wykorzystujących `SupabaseClient` przekazany z kontekstu.
    *   Dodanie logiki usuwania powiązanych fiszek w `deleteDocument`.
    *   Dodanie logiki inicjowania zadania asynchronicznego generowania fiszek w `createDocument`.
    *   Implementacja pobierania statystyk fiszek (liczba AI i manual) dla każdego dokumentu.
3.  **Implementacja API Routes (Kontrolery):**
    *   Utworzenie/modyfikacja pliku `src/pages/api/documents/index.ts` dla obsługi `GET` i `POST`.
    *   Utworzenie/modyfikacja pliku `src/pages/api/documents/[id].ts` dla obsługi `GET`, `PUT` i `DELETE` dla konkretnego ID.
    *   Integracja z walidacją `zod`.
    *   Wywoływanie odpowiednich metod `documentsService`.
    *   Formatowanie odpowiedzi HTTP (sukces/błąd).
4.  **Obsługa błędów i logowanie:**
    *   Implementacja spójnej obsługi błędów w API Routes i serwisie.
    *   Integracja z centralnym mechanizmem logowania.
5.  **Testowanie:**
    *   Napisanie testów jednostkowych dla logiki serwisu `documentsService` (mockując klienta Supabase).
    *   Napisanie testów integracyjnych dla API Routes (np. przy użyciu narzędzi do testowania API jak `supertest` lub dedykowanych bibliotek Astro), sprawdzających pełny przepływ żądania i odpowiedzi, w tym walidację i kody statusu.
    *   Szczególny test dla `DELETE`, weryfikujący usunięcie dokumentu ORAZ powiązanych fiszek.
6.  **Code Review:**
    *   Przegląd kodu pod kątem zgodności z planem, standardami kodowania (`shared.mdc`, `backend.mdc`, `astro.mdc`) i najlepszymi praktykami.
7.  **Dokumentacja:**
    *   Aktualizacja dokumentacji API (np. w Swagger/OpenAPI, jeśli jest używana, lub w plikach `.md`).
8.  **Wdrożenie:**
    *   Wdrożenie zmian na środowisko stagingowe, a następnie produkcyjne, zgodnie z procesem CI/CD.