# Plan wdrożenia endpointów API Topics

## 1. Przegląd zestawu endpointów
Endpointy API Topics służą do zarządzania hierarchiczną strukturą tematów używanych do kategoryzacji fiszek. Każdy temat posiada unikalną nazwę w ramach tej samej kombinacji użytkownika i rodzica. Tematy tworzą strukturę drzewiastą poprzez relację parent-child. Implementacja obejmuje 5 standardowych endpointów REST:
- Pobieranie listy tematów (GET)
- Tworzenie nowego tematu (POST)
- Pobieranie szczegółów konkretnego tematu (GET/{id})
- Aktualizacja istniejącego tematu (PUT/{id})
- Usuwanie tematu (DELETE/{id})

## 2. Szczegóły żądania

### GET /api/topics
**Opis:** Pobiera listę tematów dla zalogowanego użytkownika. Umożliwia paginację, sortowanie i filtrowanie tematów po rodzicu. Domyślnie zwraca tematy najwyższego poziomu (bez rodzica).

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/topics`
- **Parametry zapytania:**
  - `page` (number, opcjonalny) - numer strony, domyślnie 1
  - `limit` (number, opcjonalny) - liczba wyników na stronę, domyślnie 20
  - `sort` (string, opcjonalny) - pole do sortowania, domyślnie 'created_at'
  - `parent_id` (string, opcjonalny) - filtrowanie po ID rodzica, domyślnie wszystkie tematy główne (gdzie parent_id IS NULL)

### POST /api/topics
**Opis:** Tworzy nowy temat dla zalogowanego użytkownika. Temat może być podrzędny względem innego tematu (hierarchiczna struktura) lub znajdować się na najwyższym poziomie. Zapewnia unikalność nazwy w ramach tego samego poziomu hierarchii.

- **Metoda HTTP:** POST
- **Struktura URL:** `/api/topics`
- **Request Body:**
  ```json
  {
    "name": "string",
    "description": "string (opcjonalny)",
    "parent_id": "string UUID (opcjonalny)"
  }
  ```
- **Walidacja:**
  - `name`: niepuste, maksymalnie 100 znaków
  - `description`: opcjonalny, maksymalnie 500 znaków
  - `parent_id`: opcjonalny, musi istnieć w tabeli topics i należeć do użytkownika

### GET /api/topics/{id}
**Opis:** Pobiera szczegółowe informacje o konkretnym temacie na podstawie jego identyfikatora. Endpoint zwraca dane tylko jeśli temat należy do zalogowanego użytkownika.

- **Metoda HTTP:** GET
- **Struktura URL:** `/api/topics/{id}`
- **Parametry ścieżki:**
  - `id` (string UUID) - identyfikator tematu

### PUT /api/topics/{id}
**Opis:** Aktualizuje istniejący temat należący do zalogowanego użytkownika. Umożliwia zmianę nazwy i opisu tematu, zachowując unikalność nazwy w ramach tego samego poziomu hierarchii.

- **Metoda HTTP:** PUT
- **Struktura URL:** `/api/topics/{id}`
- **Parametry ścieżki:**
  - `id` (string UUID) - identyfikator tematu
- **Request Body:**
  ```json
  {
    "name": "string (opcjonalny)",
    "description": "string (opcjonalny)"
  }
  ```
- **Walidacja:**
  - `name`: jeśli podano, niepuste, maksymalnie 100 znaków
  - `description`: opcjonalny, maksymalnie 500 znaków

### DELETE /api/topics/{id}
**Opis:** Usuwa temat należący do zalogowanego użytkownika. Usunięcie jest możliwe tylko wtedy, gdy temat nie ma podrzędnych tematów ani przypisanych dokumentów/fiszek.

- **Metoda HTTP:** DELETE
- **Struktura URL:** `/api/topics/{id}`
- **Parametry ścieżki:**
  - `id` (string UUID) - identyfikator tematu
- **Kody odpowiedzi:**
  - **200 OK:** Temat został pomyślnie usunięty
  - **404 Not Found:** Temat o podanym id nie istnieje
  - **409 Conflict:** Nie można usunąć tematu, ponieważ ma elementy podrzędne

- **Odpowiedź dla 409 Conflict:**
  ```json
  {
    "error": {
      "code": "TOPIC_HAS_DEPENDENCIES",
      "message": "Nie można usunąć tematu, ponieważ ma elementy podrzędne",
      "details": {
        "childTopics": [
          {
            "id": "string UUID",
            "name": "string"
          }
        ],
        "documents": [
          {
            "id": "string UUID",
            "name": "string"
          }
        ],
        "flashcards": 5
      }
    }
  }
  ```

### Konwencja nazewnictwa plików
- Wszystkie pliki związane z API powinny używać konwencji kebab-case.
- Przykład: `topics-service.ts`, `topic-query-schema.ts`


## 3. Wykorzystywane typy
Implementacja będzie wykorzystywać następujące typy zdefiniowane w `src/types.ts`:

- **TopicDto**: Reprezentacja tematu zwracana przez API
- **TopicCreateDto**: Model danych wejściowych dla tworzenia nowego tematu
- **TopicUpdateDto**: Model danych wejściowych dla aktualizacji tematu
- **TopicsListResponseDto**: Model odpowiedzi dla endpointu listującego tematy
- **PaginationDto**: Model paginacji używany w odpowiedzi listującej

Dodatkowo, należy zdefiniować schematy walidacyjne Zod:
- `topicCreateSchema`: Schemat walidacyjny dla tworzenia tematu
- `topicUpdateSchema`: Schemat walidacyjny dla aktualizacji tematu
- `topicQuerySchema`: Schemat walidacyjny dla parametrów zapytania

## 4. Szczegóły odpowiedzi

### GET /api/topics
- **Sukces (200 OK):**
  ```json
  {
    "topics": [
      {
        "id": "string UUID",
        "user_id": "string UUID",
        "name": "string",
        "description": "string lub null",
        "parent_id": "string UUID lub null",
        "created_at": "ISO string",
        "updated_at": "ISO string"
      }
    ],
    "total": "number"
  }
  ```

### POST /api/topics
- **Sukces (201 Created):**
  ```json
  {
    "id": "string UUID",
    "user_id": "string UUID",
    "name": "string",
    "description": "string lub null",
    "parent_id": "string UUID lub null",
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
  ```

### GET /api/topics/{id}
- **Sukces (200 OK):**
  ```json
  {
    "id": "string UUID",
    "user_id": "string UUID",
    "name": "string",
    "description": "string lub null",
    "parent_id": "string UUID lub null",
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
  ```

### PUT /api/topics/{id}
- **Sukces (200 OK):**
  ```json
  {
    "id": "string UUID",
    "user_id": "string UUID",
    "name": "string",
    "description": "string lub null",
    "parent_id": "string UUID lub null",
    "created_at": "ISO string",
    "updated_at": "ISO string"
  }
  ```

### DELETE /api/topics/{id}
- **Sukces (200 OK):**
  ```json
  {
    "message": "Temat został pomyślnie usunięty"
  }
  ```

### Kody błędów (dla wszystkich endpointów):
- **400 Bad Request:** Nieprawidłowe dane wejściowe
- **401 Unauthorized:** Brak autoryzacji
- **404 Not Found:** Temat nie znaleziony
- **409 Conflict:** Nazwa tematu już istnieje dla tego samego rodzica i użytkownika
- **500 Internal Server Error:** Nieoczekiwany błąd serwera

## 5. Przepływ danych

### GET /api/topics
1. Middleware Astro weryfikuje zapytanie i pobiera parametry `page`, `limit`, `sort`, `parent_id`
2. Walidacja parametrów zapytania przy użyciu schematu Zod
3. Zastosowanie paginacji, sortowania i filtrowania
4. Pobranie klienta Supabase z middleware.context.locals (/src/middleware/index.ts?)
5. Wywołanie zapytania do bazy danych z zastosowaniem RLS (Row Level Security)
6. Zwrócenie przetworzonych danych w formacie TopicsListResponseDto

### POST /api/topics
1. Middleware Astro weryfikuje zapytanie i pobiera dane z body
2. Walidacja danych wejściowych przy użyciu schematu Zod
3. Sprawdzenie, czy temat o takiej nazwie już istnieje dla tego samego rodzica i użytkownika
4. Pobranie klienta Supabase z middleware.context.locals
5. Wstawienie nowego rekordu do tabeli topics
6. Zwrócenie utworzonego obiektu tematu

### GET /api/topics/{id}
1. Middleware Astro weryfikuje zapytanie i pobiera parametr `id`
2. Walidacja id (czy jest poprawnym UUID)
3. Pobranie klienta Supabase z middleware.context.locals
4. Zapytanie do bazy danych o temat o podanym id (z uwzględnieniem RLS)
5. Sprawdzenie, czy temat istnieje
6. Zwrócenie danych tematu

### PUT /api/topics/{id}
1. Middleware Astro weryfikuje zapytanie i pobiera parametr `id` oraz dane z body
2. Walidacja id i danych wejściowych przy użyciu schematu Zod
3. Pobranie klienta Supabase z middleware.context.locals
4. Sprawdzenie, czy temat istnieje
5. Jeśli zmieniono nazwę, sprawdzenie unikalności nazwy dla kombinacji użytkownik+rodzic
6. Aktualizacja rekordu w tabeli topics
7. Zwrócenie zaktualizowanego obiektu tematu

### DELETE /api/topics/{id}
1. Middleware Astro weryfikuje zapytanie i pobiera parametr `id`
2. Walidacja id (czy jest poprawnym UUID)
3. Pobranie klienta Supabase z middleware.context.locals
4. Sprawdzenie, czy temat istnieje
5. Ponieważ topica nie można usunąć jeśli nie jest pusty sprawdzić czy nie ma topiców - dzieci
6. Sprawdzić czy nie ma dokumentów z tym topic_id
7. Usunięcie rekordu z tabeli topics
8. Zwrócenie komunikatu o pomyślnym usunięciu lub komunikatu o braku możliwości usunięcia

## 6. Względy bezpieczeństwa

### Uwierzytelnianie i autoryzacja
- Wykorzystanie Supabase Auth do uwierzytelniania użytkowników
- Middleware Astro weryfikuje, czy użytkownik jest zalogowany dla wszystkich endpointów
- Sprawdzanie, czy użytkownik ma uprawnienia do danego tematu (właściciel)
- Korzystanie z RLS (Row Level Security) w Supabase do ograniczenia dostępu do danych

### Walidacja danych
- Zastosowanie biblioteki Zod do walidacji danych wejściowych
- Sanityzacja danych wejściowych, aby zapobiec atakom SQL Injection
- Sprawdzanie istnienia i własności zasobów przed operacjami aktualizacji i usuwania

### Zabezpieczenia przed często spotykanymi atakami
- Ochrona przed CSRF przez używanie tokenów sesji
- Ochrona przed XSS przez sanityzację danych wejściowych i wyjściowych
- Ograniczenie częstotliwości żądań (rate limiting) na poziomie Astro middleware

## 7. Obsługa błędów

### Ogólna strategia
- Wczesne niepowodzenie (fail fast) przez walidację danych wejściowych
- Odpowiednie kody statusów HTTP dla różnych typów błędów
- Spójna struktura komunikatów błędów

### Potencjalne scenariusze błędów
- **400 Bad Request:**
  - Nieprawidłowy format danych wejściowych
  - Brakujące wymagane pola
  - Niepoprawne typy danych
  - Nieprawidłowy format UUID
  - Przekroczenie limitu długości pól
- **401 Unauthorized:**
  - Brak tokenu uwierzytelniającego
  - Wygasły token uwierzytelniający
- **404 Not Found:**
  - Temat o podanym id nie istnieje
  - Temat o podanym id nie należy do zalogowanego użytkownika
- **409 Conflict:**
  - Temat o podanej nazwie już istnieje dla tego samego rodzica i użytkownika
  - Nie można usunąć tematu, ponieważ ma elementy podrzędne (podrzędne tematy, dokumenty lub fiszki)
- **500 Internal Server Error:**
  - Nieoczekiwane błędy serwera
  - Problemy z bazą danych

### Struktura odpowiedzi błędu
```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object (opcjonalny)"
  }
}
```

## 8. Rozważania dotyczące wydajności

### Optymalizacja zapytań
- Wykorzystanie indeksów bazy danych (idx_topics_user_id, idx_topics_parent_id)
- Paginacja dla endpointu listującego (page, limit)
- Selektywne pobieranie tylko potrzebnych pól

### Caching
- Implementacja prostego cachowania po stronie klienta za pomocą nagłówków Cache-Control
- Walidacja cache za pomocą ETag lub Last-Modified

### Szybkość odpowiedzi
- Ograniczenie liczby zapytań do bazy danych
- Używanie przygotowanych zapytań (prepared statements)
- Optymalne wykorzystanie RLS w Supabase

## 9. Etapy wdrożenia

1. **Przygotowanie schematów walidacyjnych Zod:**
   - Utworzenie `src/schemas/topics.schema.ts` z definicjami schematów walidacyjnych
   - Zdefiniowanie `topicCreateSchema`, `topicUpdateSchema` i `topicQuerySchema`

2. **Utworzenie serwisu Topics:**
   - Utworzenie `src/lib/services/topics.service.ts`
   - Implementacja metod do pobierania, tworzenia, aktualizacji i usuwania tematów
   - Dodanie logiki weryfikacji unikalności nazw tematów

3. **Implementacja endpointów API:**
   - Utworzenie plików dla każdego endpointu w `src/pages/api/topics/`:
     - `index.ts` (GET i POST)
     - `[id].ts` (GET, PUT, DELETE)
   - Implementacja logiki obsługi żądań dla każdej metody HTTP

4. **Implementacja walidacji danych wejściowych:**
   - Wykorzystanie zdefiniowanych schematów Zod w endpointach
   - Dodanie obsługi błędów walidacji

5. **Implementacja mechanizmu uwierzytelniania:**
   - Integracja z Supabase Auth
   - Dodanie middleware sprawdzającego uwierzytelnianie
   - Wykorzystanie RLS w Supabase

6. **Testowanie endpointów:**
   - Utworzenie testów jednostkowych dla każdego endpointu
   - Testowanie różnych scenariuszy błędów i poprawnych żądań
   - Weryfikacja poprawności odpowiedzi

7. **Dokumentacja API:**
   - Aktualizacja dokumentacji API
   - Dodanie przykładów użycia dla każdego endpointu
   - Dokumentacja struktur danych i kodów błędów

8. **Finalizacja i wdrożenie:**
   - Przegląd kodu
   - Optymalizacja wydajności
   - Wdrożenie na środowisko deweloperskie 