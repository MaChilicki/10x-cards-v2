# Plan Wdrożenia API Endpoint: Fiszki (Flashcards)

## 1. Przegląd punktu końcowego
Zestaw endpointów REST API do zarządzania fiszkami (flashcards). Pozwala na tworzenie, pobieranie, aktualizację i usuwanie fiszek, z obsługą paginacji, sortowania i filtrowania. Fiszki mogą być tworzone ręcznie lub generowane przez AI, z różnymi regułami biznesowymi dla każdego źródła.

## 2. Szczegóły żądania

### GET /api/flashcards
- **Metoda HTTP**: GET
- **Parametry zapytania**:
  - **Opcjonalne**: 
    - `page` (number) - numer strony
    - `limit` (number) - liczba elementów na stronę
    - `sort` (string) - pole sortowania
    - `document_id` (string) - filtrowanie po dokumencie
    - `topic_id` (string) - filtrowanie po temacie
    - `source` (string) - filtrowanie po źródle ('ai' lub 'manual')
    - `is_approved` (boolean) - filtrowanie po statusie zatwierdzenia
- **Uwagi**:
    - zwraca tylko te flashcards, które nie są oznaczone jako is_disabled lub jest to zależne od przekanego do endpointa parametru

### POST /api/flashcards
- **Metoda HTTP**: POST
- **Ciało żądania**:
  ```json
  {
    "flashcards": [{
      "front_original": "string",
      "back_original": "string",
      "topic_id": "string",
      "document_id": "string",
      "source": "ai | manual",
      "is_approved": "boolean (opcjonalnie)"
    }]
  }
  ```
- **Uwagi**: 
  - Pole `front_modified` i `back_modified` są inicjalizowane wartościami z pól `front_original` i `back_original`
  - Jeśli `source` to "ai", to `is_approved` jest ustawiane na `false`
  - Jeśli `source` to "manual", to `is_approved` jest ustawiane na `true` niezależnie od wartości przekazanej w żądaniu
  - Z tego endpointa powinny być generowane wyłącznie flashcards source="manual"

### GET /api/flashcards/{id}
- **Metoda HTTP**: GET
- **Parametry ścieżki**:
  - `id` (string) - identyfikator fiszki

### PUT /api/flashcards/{id}
- **Metoda HTTP**: PUT
- **Parametry ścieżki**:
  - `id` (string) - identyfikator fiszki
- **Ciało żądania**:
  ```json
  {
    "front_modified": "string (opcjonalnie)",
    "back_modified": "string (opcjonalnie)"
  }
  ```
- **Uwagi**:
  - Dla fiszek generowanych przez AI oceniany jest stopień modyfikacji
  - Jeśli modyfikacja ≥ 50%, to:
    - Oryginalna fiszka jest oznaczana jako zmodyfikowana (`is_modified = true`)
    - Ustawiany jest `modification_percentage`
    - Oryginalna fiszka jest oznaczana jako nieaktywna (`is_disabled = true`)
    - Tworzona jest nowa fiszka z tą samą treścią, ale oznaczona jako ręcznie utworzona (`source = manual`) i zatwierdzona (`is_approved = true`)
  - Dla fiszek generowanych ręcznie, `is_approved` zawsze pozostaje `true`
  - Metoda oceniająca stopień modyfikacji fiszki powinna być zamarkowana prostą logiką - jeśli original i manual na obu polach są zgodne to poziom modyfikacji wynosi 0%. Jeśli nie są zgodne to poziom modyfikacji wynosi 100%.

### PATCH /api/flashcards/{id}/approve
- **Metoda HTTP**: PATCH
- **Parametry ścieżki**:
  - `id` (string) - identyfikator fiszki
- **Ciało żądania**: brak
- **Uwagi**:
  - Ustawia `is_approved = true` dla pojedynczej fiszki
  - Działa tylko dla fiszek o `source = "ai"`

### PATCH /api/flashcards/approve-bulk
- **Metoda HTTP**: PATCH
- **Ciało żądania**:
  ```json
  {
    "flashcard_ids": ["string"]
  }
  ```
- **Uwagi**:
  - Ustawia `is_approved = true` dla wielu fiszek naraz
  - Działa tylko dla fiszek o `source = "ai"`

### PATCH /api/flashcards/approve-by-document
- **Metoda HTTP**: PATCH
- **Ciało żądania**:
  ```json
  {
    "document_id": "string"
  }
  ```
- **Uwagi**:
  - Ustawia `is_approved = true` dla wszystkich fiszek powiązanych z danym dokumentem
  - Działa tylko dla fiszek o `source = "ai"` i `is_disabled = false`

### DELETE /api/flashcards/{id}
- **Metoda HTTP**: DELETE
- **Parametry ścieżki**:
  - `id` (string) - identyfikator fiszki
- **Uwagi**: 
  - Fiszki generowane przez AI (`source = "ai"`) są usuwane przez soft delete (`is_disabled = true`)
  - Fiszki generowane ręcznie (`source = "manual"`) są usuwane przez hard delete (rzeczywiste usunięcie z bazy danych)

## 3. Wykorzystywane typy
- `FlashcardDto` - reprezentacja fiszki w odpowiedziach
- `FlashcardCreateDto` - model do tworzenia fiszki
- `FlashcardsCreateCommand` - komenda do tworzenia wielu fiszek
- `FlashcardUpdateDto` - model do aktualizacji fiszki
- `FlashcardApproveDto` - model do akceptacji wielu fiszek (zawiera tablicę identyfikatorów)
- `FlashcardApproveByDocumentDto` - model do akceptacji fiszek dla dokumentu (zawiera identyfikator dokumentu)
- `PaginationDto` - obsługa paginacji w odpowiedziach
- `FlashcardsListResponseDto` - odpowiedź zawierająca listę fiszek z paginacją

## 4. Szczegóły odpowiedzi

### GET /api/flashcards
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "data": [FlashcardDto],
    "pagination": {
      "page": number,
      "limit": number,
      "total": number
    }
  }
  ```

### POST /api/flashcards
- **Status**: 201 Created
- **Ciało odpowiedzi**:
  ```json
  {
    "data": [FlashcardDto]
  }
  ```

### GET /api/flashcards/{id}
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "data": FlashcardDto
  }
  ```

### PUT /api/flashcards/{id}
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "data": FlashcardDto,
    "new_flashcard": FlashcardDto (opcjonalnie, gdy utworzono nową fiszkę)
  }
  ```

### PATCH /api/flashcards/{id}/approve
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "data": FlashcardDto
  }
  ```

### PATCH /api/flashcards/approve-bulk
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "data": {
      "approved_count": number,
      "flashcards": [FlashcardDto]
    }
  }
  ```

### PATCH /api/flashcards/approve-by-document
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "data": {
      "approved_count": number,
      "flashcards": [FlashcardDto]
    }
  }
  ```

### DELETE /api/flashcards/{id}
- **Status**: 200 OK
- **Ciało odpowiedzi**:
  ```json
  {
    "message": "Fiszka usunięta pomyślnie"
  }
  ```

## 5. Przepływ danych

### GET /api/flashcards
1. Walidacja parametrów zapytania przy użyciu Zod
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Budowa zapytania SQL z uwzględnieniem filtrów, sortowania i paginacji
4. Wywołanie SupabaseClient.from('flashcards').select() z odpowiednimi filtrami
5. Bezpośrednia transformacja wyników do struktury odpowiedzi API
6. Zwrócenie danych i informacji o paginacji

### POST /api/flashcards
1. Walidacja ciała żądania przy użyciu Zod
2. Sprawdzenie czy podano document_id i topic_id oraz czy istnieją
3. Pobranie zalogowanego użytkownika z context.locals.user
4. Przygotowanie danych do wstawienia (dodanie user_id)
5. Automatyczne ustawienie is_approved na false dla fiszek AI i true dla fiszek manualnych
6. Ustawienie front_modified i back_modified na wartości z front_original i back_original
7. Wywołanie SupabaseClient.from('flashcards').insert()
8. Bezpośrednia transformacja wyników do struktury odpowiedzi API
9. Zwrócenie utworzonych fiszek

### GET /api/flashcards/{id}
1. Walidacja parametru id
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Wywołanie SupabaseClient.from('flashcards').select().eq('id', id).eq('user_id', userId).single()
4. Sprawdzenie czy fiszka istnieje
5. Bezpośrednia transformacja wyniku do struktury odpowiedzi API
6. Zwrócenie danych fiszki

### PUT /api/flashcards/{id}
1. Walidacja parametru id i ciała żądania
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Pobranie aktualnej fiszki z bazy danych
4. Sprawdzenie czy fiszka istnieje i należy do użytkownika
5. Przygotowanie danych do aktualizacji
6. Jeśli source = "ai":
   a. Obliczenie stopnia modyfikacji (porównanie pól original i modified)
   b. Jeśli modyfikacja ≥ 50%:
      - Zaktualizowanie fiszki AI z is_modified = true, odpowiednim modification_percentage i is_disabled = true
      - Utworzenie nowej fiszki z tą samą treścią, ale z source = "manual" i is_approved = true
   c. W przeciwnym razie, zwykła aktualizacja fiszki
7. Jeśli source = "manual", zwykła aktualizacja fiszki z zachowaniem is_approved = true
8. Wywołanie SupabaseClient.from('flashcards').update()
9. Bezpośrednia transformacja wyniku do struktury odpowiedzi API
10. Zwrócenie zaktualizowanej fiszki (lub ewentualnie nowej fiszki)

### PATCH /api/flashcards/{id}/approve
1. Walidacja parametru id
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Pobranie fiszki z bazy danych
4. Sprawdzenie czy fiszka istnieje, należy do użytkownika, ma source = "ai", is_approved = false i is_disabled = false
5. Wywołanie SupabaseClient.from('flashcards').update({ is_approved: true }).eq('id', id).eq('user_id', userId)
6. Bezpośrednia transformacja wyniku do struktury odpowiedzi API
7. Zwrócenie zaktualizowanej fiszki

### PATCH /api/flashcards/approve-bulk
1. Walidacja ciała żądania
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Sprawdzenie czy wszystkie fiszki istnieją i należą do użytkownika, mają source = "ai", is_approved = false i is_disabled = false
4. Wywołanie SupabaseClient.from('flashcards').update({ is_approved: true }).in('id', flashcardIds).eq('user_id', userId).eq('source', 'ai').eq('is_disabled', false)
5. Pobranie zaktualizowanych fiszek
6. Bezpośrednia transformacja wyników do struktury odpowiedzi API
7. Zwrócenie liczby zatwierdzonych fiszek i ich danych

### PATCH /api/flashcards/approve-by-document
1. Walidacja ciała żądania
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Sprawdzenie czy dokument istnieje i należy do użytkownika
4. Wywołanie SupabaseClient.from('flashcards').update({ is_approved: true }).eq('document_id', documentId).eq('user_id', userId).eq('source', 'ai').eq('is_disabled', false)
5. Pobranie zaktualizowanych fiszek
6. Bezpośrednia transformacja wyników do struktury odpowiedzi API
7. Zwrócenie liczby zatwierdzonych fiszek i ich danych

### DELETE /api/flashcards/{id}
1. Walidacja parametru id
2. Pobranie zalogowanego użytkownika z context.locals.user
3. Pobranie fiszki z bazy danych
4. Sprawdzenie czy fiszka istnieje i należy do użytkownika
5. Jeśli source = "ai":
   - Wywołanie SupabaseClient.from('flashcards').update({ is_disabled: true }).eq('id', id).eq('user_id', userId)
6. Jeśli source = "manual":
   - Wywołanie SupabaseClient.from('flashcards').delete().eq('id', id).eq('user_id', userId)
7. Zwrócenie komunikatu o pomyślnym usunięciu

## 6. Względy bezpieczeństwa
- **Autentykacja:** (Po wdrożeniu Modułu II) Implementacja za pomocą Supabase Auth i JWT. Middleware Astro będzie odpowiedzialne za weryfikację tokenu.
- **Autoryzacja:** Egzekwowana przez polityki RLS w bazie danych Supabase. Serwis musi używać klienta Supabase z kontekstu (`context.locals.supabase`), aby RLS działało poprawnie.
- Autoryzacja poprzez Row Level Security w Supabase, wyłączona na etapie developmentu
- Walidacja wszystkich danych wejściowych przy użyciu Zod
- **Middleware (Astro):** (Po wdrożeniu Modułu II) Middleware weryfikuje token JWT i dołącza sesję użytkownika oraz klienta Supabase (`context.locals.supabase`, `context.locals.session`) 
- **Walidacja/sanityzacja danych wejściowych:** Kluczowa dla zapobiegania atakom (np. XSS, SQL Injection) i zapewnienia integralności danych. Należy rygorystycznie stosować schematy `zod` dla wszystkich danych wejściowych (parametry query, path, ciało żądania). Szczególną uwagę zwrócić na walidację długości pola `content`.
- **Rate Limiting:** Rozważyć implementację mechanizmu ograniczania liczby żądań (np. na poziomie middleware) w celu ochrony przed atakami typu DoS/brute-force.

## 7. Obsługa błędów
- **400 Bad Request**:
  - Brakujące wymagane pola
  - Nieprawidłowy format danych
  - Nieprawidłowe wartości parametrów
  - Próba zatwierdzenia fiszki, która nie pochodzi z AI
- **401 Unauthorized**: (po wdrożeniu Modułu II)
  - Brak tokenu JWT
  - Nieprawidłowy token JWT
- **404 Not Found**:
  - Fiszka nie istnieje
  - Dokument lub temat nie istnieją
- **500 Internal Server Error**:
  - Błędy połączenia z bazą danych
  - Nieoczekiwane błędy serwera

## 8. Rozważania dotyczące wydajności
- Indeksy w bazie danych na kolumnach:
  - user_id
  - topic_id
  - document_id
  - is_disabled
  - source
  - is_approved
- Paginacja wyników zapytań
- Ograniczenie liczby zwracanych kolumn w zapytaniach do niezbędnego minimum
- Cachowanie częstych zapytań
- Monitorowanie wydajności zapytań
- Transakcje dla operacji aktualizacji fiszek AI z tworzeniem nowych fiszek manualnych

## 9. Etapy wdrożenia
1. Utworzenie pliku `src/pages/api/flashcards/index.ts` dla obsługi GET i POST
2. Utworzenie pliku `src/pages/api/flashcards/[id].ts` dla obsługi GET, PUT i DELETE
3. Utworzenie pliku `src/pages/api/flashcards/[id]/approve.ts` dla obsługi PATCH przy zatwierdzaniu pojedynczej fiszki
4. Utworzenie pliku `src/pages/api/flashcards/approve-bulk.ts` dla obsługi PATCH przy zatwierdzaniu wielu fiszek
5. Utworzenie pliku `src/pages/api/flashcards/approve-by-document.ts` dla obsługi PATCH przy zatwierdzaniu fiszek dla dokumentu
6. Implementacja przez aktualizację serwisu `src/lib/services/flashcard.service.ts` z metodami do obsługi wszystkich endpointów
7. Implementacja pomocniczego serwisu `src/lib/services/flashcard-modification.service.ts` do oceny stopnia modyfikacji fiszek
8. Implementacja schematów walidacyjnych Zod w `src/lib/validation/flashcard.schema.ts`
9. Utworzenie testów dla endpointów i serwisów
10. Przygotoanie postman_collection do testów endpointów w postmanie
11. Dodanie dokumentacji API
12. Testowanie integracyjne z frontendem
13. Wdrożenie do środowiska testowego
14. Monitorowanie wydajności i błędów 