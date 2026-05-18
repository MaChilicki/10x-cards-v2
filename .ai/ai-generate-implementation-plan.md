/* Plan wdrożenia endpointów AI-Generated Flashcards */

# API Endpoint Implementation Plan: AI-Generated Flashcards

## 1. Przegląd punktu końcowego
Celem endpointów jest automatyczne generowanie fiszek na podstawie przekazanego tekstu za pomocą zewnętrznego modelu AI. System obsługuje następujące endpointy:
- **POST /api/flashcards/ai-generate** – generacja fiszek na podstawie podanego tekstu
- **POST /api/flashcards/ai-regenerate** – regeneracja fiszek dla istniejącego dokumentu lub tekstu z usunięciem starych fiszek AI

Endpointy mają służyć do przetwarzania tekstu wejściowego, komunikacji z systemem AI oraz zwracania wygenerowanych danych fiszek w zunifikowanej strukturze.

## 2. Szczegóły żądania
- **Metoda HTTP:** POST
- **Struktura URL:**
  - `/api/flashcards/ai-generate` dla pierwszej generacji
  - `/api/flashcards/ai-regenerate` dla regeneracji fiszek z usunięciem starych

- **Parametry (Request Body) dla `/api/flashcards/ai-generate`:**
  - `text` (string, wymagany) – tekst wejściowy do generacji fiszek
    - *Walidacja:* Użycie zod do sprawdzenia, czy długość tekstu mieści się w przedziale 1000-10000 znaków
  - `document_id` (string, opcjonalny) – identyfikator dokumentu powiązanego z tekstem
  - `topic_id` (string, opcjonalny) – identyfikator tematu powiązanego z tekstem

- **Parametry (Request Body) dla `/api/flashcards/ai-regenerate`:**
  - `text` (string, wymagany) – tekst wejściowy do regeneracji fiszek
    - *Walidacja:* Użycie zod do sprawdzenia, czy długość tekstu mieści się w przedziale 1000-10000 znaków
  - `document_id` (string, opcjonalny) – identyfikator dokumentu powiązanego z tekstem
  - `topic_id` (string, opcjonalny) – identyfikator tematu powiązanego z tekstem
  - `force_regenerate` (boolean, opcjonalny, domyślnie false) – flaga określająca czy wymusić regenerację nawet jeśli niektóre fiszki są już zatwierdzone

## 3. Wykorzystywane typy
- **FlashcardAiGenerateDto:** Typ reprezentujący dane wejściowe dla generacji fiszek.
- **FlashcardAiResponse:** Typ odpowiedzi zawierający tablicę wygenerowanych fiszek.
- **FlashcardProposalDto:** Tymczasowy typ reprezentujący pojedynczą propozycję fiszki przed zapisem do bazy.
  - `front_original`: Przód fiszki (maksymalnie 200 znaków)
  - `back_original`: Tył fiszki (maksymalnie 500 znaków)
  - `front_modified`: Początkowa wartość równa `front_original` (pole do późniejszej modyfikacji przez użytkownika)
  - `back_modified`: Początkowa wartość równa `back_original` (pole do późniejszej modyfikacji przez użytkownika)
- **FlashcardAiRegenerateDto:** Typ rozszerzający FlashcardAiGenerateDto o pole force_regenerate dla regeneracji fiszek.
- **FlashcardAiRegenerateResponse:** Typ rozszerzający FlashcardAiResponse o pole disabled_count informujące o liczbie dezaktywowanych fiszek.

## 4. Szczegóły odpowiedzi
### Dla `/api/flashcards/ai-generate`:
- **Status 201 Created:** W przypadku pomyślnej generacji fiszek.
- **Struktura odpowiedzi:**
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string lub null",
        "topic_id": "string lub null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string lub null",
        "back_modified": "string lub null",
        "source": "ai",
        "is_modified": false,
        "is_approved": false,
        "modification_percentage": 0,
        "is_disabled": false,
        "spaced_repetition_data": {},
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ]
  }
  ```

### Dla `/api/flashcards/ai-regenerate`:
- **Status 200 OK:** W przypadku pomyślnej regeneracji fiszek.
- **Struktura odpowiedzi:**
  ```json
  {
    "flashcards": [
      {
        "id": "string",
        "user_id": "string",
        "document_id": "string lub null",
        "topic_id": "string lub null",
        "front_original": "string",
        "back_original": "string",
        "front_modified": "string lub null",
        "back_modified": "string lub null",
        "source": "ai",
        "is_modified": false,
        "is_approved": false,
        "modification_percentage": 0,
        "is_disabled": false,
        "spaced_repetition_data": {},
        "created_at": "ISODate string",
        "updated_at": "ISODate string"
      }
    ],
    "disabled_count": 5
  }
  ```

- **Błędy:**
  - 400 Bad Request – nieprawidłowe lub niekompletne dane wejściowe
  - 401 Unauthorized – nieautoryzowany dostęp (w przyszłych modułach po wdrożeniu autoryzacji)
  - 404 Not Found – gdy podany document_id nie istnieje (tylko dla `/api/flashcards/ai-regenerate`)
  - 500 Internal Server Error / 502 Bad Gateway – błędy po stronie serwera lub komunikacji z modelem AI (błędy komunikacji będą logowane)

## 5. Przepływ danych

### Dla `/api/flashcards/ai-generate`:
1. Klient wysyła żądanie POST z danymi wejściowymi do endpointu.
2. Warstwa API waliduje dane wejściowe za pomocą bibliotek typu zod, w tym sprawdzenie, czy długość pola `text` mieści się w zakresie 1000-10000 znaków.
3. Po udanej walidacji dane są przekazywane do warstwy serwisowej (`ai-generate.service`), która:
   - Komunikuje się z zewnętrznym API modelu AI w celu wygenerowania fiszek.
   - Przetwarza odpowiedź z modelu AI, dokonując ewentualnej filtracji lub transformacji danych.
   - Waliduje wygenerowane fiszki pod kątem długości:
     - Przód fiszki (`front_original`) nie może przekraczać 200 znaków
     - Tył fiszki (`back_original`) nie może przekraczać 500 znaków
   - Przygotowuje fiszki do zapisu, kopiując wartości z pól `front_original` do `front_modified` oraz z `back_original` do `back_modified`.
   - Zapisuje wygenerowane fiszki w bazie danych.
4. Serwis zwraca zapisane fiszki, które są wysyłane jako odpowiedź do klienta.

### Dla `/api/flashcards/ai-regenerate`:
1. Klient wysyła żądanie POST z danymi wejściowymi do endpointu.
2. Warstwa API waliduje dane wejściowe za pomocą bibliotek typu zod.
3. Jeśli podano `document_id`, API sprawdza, czy dokument istnieje w bazie danych.
4. Po udanej walidacji dane są przekazywane do warstwy serwisowej (`ai-generate.service`), która:
   - Jeśli podano `document_id`, dezaktywuje istniejące fiszki AI powiązane z dokumentem (poprzez ustawienie `is_disabled = true`).
   - Komunikuje się z zewnętrznym API modelu AI w celu wygenerowania nowych fiszek.
   - Przetwarza odpowiedź z modelu AI.
   - Waliduje wygenerowane fiszki pod kątem długości:
     - Przód fiszki (`front_original`) nie może przekraczać 200 znaków
     - Tył fiszki (`back_original`) nie może przekraczać 500 znaków
   - Przygotowuje fiszki do zapisu, kopiując wartości z pól `front_original` do `front_modified` oraz z `back_original` do `back_modified`.
   - Zapisuje nowo wygenerowane fiszki w bazie danych.
5. Serwis zwraca zapisane fiszki oraz liczbę dezaktywowanych fiszek, które są wysyłane jako odpowiedź do klienta.

## 6. Względy bezpieczeństwa
- **Autoryzacja:** Aktualnie bez JWT; w Module II wprowadzić autoryzację z użyciem Supabase Auth i nagłówka `Authorization: Bearer <token>`.
- **Walidacja:** Użycie schematów zod do walidacji danych wejściowych, aby upewnić się o poprawności typu i długości tekstu.
- **Walidacja wygenerowanych fiszek:** Sprawdzanie, czy wygenerowane przez AI fiszki spełniają wymagania:
  - Przód fiszki (`front_original`) nie dłuższy niż 200 znaków
  - Tył fiszki (`back_original`) nie dłuższy niż 500 znaków
- **Sanityzacja danych wejściowych:** Aby chronić przed SQL Injection i innymi atakami.
- **Rate Limiting:** Implementacja mechanizmów ograniczających liczbę żądań do endpointu, aby zapobiegać nadużyciom.

## 7. Obsługa błędów
- **400 Bad Request:** Zwracane, gdy dane wejściowe są niekompletne lub niezgodne z oczekiwaniami (np. brak pola `text`).
- **401 Unauthorized:** Zwracane, gdy próba dostępu nastąpi bez odpowiednich danych autoryzacyjnych (przy wdrożeniu autoryzacji w Module II).
- **500 Internal Server Error / 502 Bad Gateway:** Zwracane w przypadku błędów po stronie serwera lub problemów z integracją z zewnętrznym API AI. Dodatkowe logowanie błędów komunikacji będzie realizowane w middleware.

## 8. Rozważania dotyczące wydajności
- **Caching:** Wprowadzenie mechanizmów cache'owania wyników dla zbliżonych zapytań, aby zmniejszyć obciążenie modelu AI.
- **Rate Limiting:** Ograniczenie liczby zapytań do API, aby zabezpieczyć system przed przeciążeniem.
- **Asynchroniczność:** Rozważenie asynchronicznego przetwarzania żądań, zwłaszcza w scenariuszach, gdzie API modelu AI może mieć dłuższy czas odpowiedzi (timeout do 60 sekund).
- **Optymalizacja komunikacji:** Użycie odpowiednich timeoutów i retries w komunikacji z zewnętrznym API.

## 9. Etapy wdrożenia
1. **Definicja schematów walidacyjnych:**
   - Utworzenie schematów z użyciem zod dla `FlashcardAiGenerateDto` i `FlashcardAiRegenerateDto`, w tym walidacja długości pola `text` (1000-10000 znaków).
   - Utworzenie schematów walidacyjnych dla `FlashcardProposalDto`, uwzględniających maksymalne długości pól:
     - `front_original`: maksymalnie 200 znaków
     - `back_original`: maksymalnie 500 znaków

2. **Implementacja endpointów:**
   - Utworzenie endpointu POST `/api/flashcards/ai-generate` z implementacją logiki walidacji oraz przekazania danych do serwisu.
   - Utworzenie endpointu POST `/api/flashcards/ai-regenerate` z implementacją logiki walidacji, sprawdzania istnienia dokumentu, usuwania starych fiszek oraz generowania nowych.
   
3. **Rozszerzenie warstwy serwisowej:**
   - Wyodrębnienie logiki generacji fiszek do dedykowanego serwisu o nazwie **ai-generate.service**.
   - Implementacja metody `generateFlashcards` do pierwszej generacji fiszek.
   - Implementacja metody `regenerateFlashcards` do usuwania starych fiszek i generowania nowych.
   - Dodanie walidacji wygenerowanych fiszek pod kątem długości pól `front_original` i `back_original`.
   - Implementacja mechanizmu skracania lub odrzucania fiszek niespełniających wymagań dotyczących długości.
   - Implementacja integracji z zewnętrznym API modelu AI (konfiguracja timeoutów, retry, obsługa błędów API).
   - Na tym etapie skorzystamy z mocków zamiast wywoływania serwisu AI.
   
4. **Implementacja typów:**
   - Utworzenie typów `FlashcardAiGenerateDto`, `FlashcardAiResponse`, `FlashcardProposalDto`.
   - Utworzenie typów `FlashcardAiRegenerateDto` (rozszerzenie `FlashcardAiGenerateDto`) i `FlashcardAiRegenerateResponse`.
   
5. **Dodanie mechanizmu uwierzytelniania przez Supabase Auth:**
   - Na tym etapie zastosujemy domyślnego użytkownika z supabase.client.ts.
   
6. **Implementacja logiki endpointów:**
   - Wykorzystanie utworzonego serwisu do obsługi endpointów.
   - Wykorzystanie middleware do komunikacji z bazą.
   - Implementacja automatycznego kopiowania wartości z pól `front_original` do `front_modified` oraz z `back_original` do `back_modified` podczas zapisu nowych fiszek.
   
7. **Middleware i logowanie błędów:**
   - Dodanie logowania akcji i błędów, w tym błędów komunikacji z zewnętrznym API AI.
   - Dodanie logowania liczby dezaktywowanych fiszek podczas regeneracji.

/* Koniec planu wdrożenia endpointów AI-Generated Flashcards */