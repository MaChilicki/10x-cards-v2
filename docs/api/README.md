# Dokumentacja API 10xCards

## Przegląd

Dokumentacja API jest napisana w formacie OpenAPI (Swagger) 3.0.0. Zawiera szczegółowy opis wszystkich endpointów, modeli danych, parametrów żądań i odpowiedzi.

## Struktura

- `auth.yaml` - Dokumentacja API dla endpointów autoryzacji
- `documents.yaml` - Dokumentacja API dla endpointów zarządzania dokumentami
- `flashcards.yaml` - Dokumentacja API dla endpointów zarządzania fiszkami
- `topics.yaml` - Dokumentacja API dla endpointów zarządzania tematami

## Jak używać

### Online Editor

1. Wejdź na [Swagger Editor](https://editor.swagger.io/)
2. Skopiuj zawartość wybranego pliku YAML
3. Wklej do edytora
4. Po prawej stronie zobaczysz interaktywną dokumentację

### Lokalne przeglądanie

1. Zainstaluj `swagger-ui`:
   ```bash
   npm install -g swagger-ui-cli
   ```

2. Uruchom UI dla wybranego API:
   ```bash
   # Dla autoryzacji
   swagger-ui-cli serve auth.yaml

   # Dla dokumentów
   swagger-ui-cli serve documents.yaml

   # Dla fiszek
   swagger-ui-cli serve flashcards.yaml

   # Dla tematów
   swagger-ui-cli serve topics.yaml
   ```

3. Otwórz przeglądarkę pod adresem: http://localhost:8080

## Endpointy

### Autoryzacja (Auth)

- `POST /api/auth/login` - Logowanie użytkownika
- `POST /api/auth/register` - Rejestracja nowego użytkownika
- `POST /api/auth/logout` - Wylogowanie użytkownika
- `POST /api/auth/reset-password` - Wysłanie linku do resetowania hasła
- `POST /api/auth/change-password` - Zmiana hasła użytkownika
- `GET /api/auth/me` - Pobranie informacji o zalogowanym użytkowniku

### Dokumenty (Documents)

- `GET /api/documents` - Lista dokumentów z filtrowaniem i paginacją
- `POST /api/documents` - Tworzenie nowego dokumentu
- `GET /api/documents/{id}` - Pobranie pojedynczego dokumentu
- `PUT /api/documents/{id}` - Aktualizacja dokumentu
- `DELETE /api/documents/{id}` - Usunięcie dokumentu

### Fiszki (Flashcards)

- `GET /api/flashcards` - Lista fiszek z filtrowaniem i paginacją
- `POST /api/flashcards` - Tworzenie nowych fiszek
- `GET /api/flashcards/{id}` - Pobranie pojedynczej fiszki
- `PUT /api/flashcards/{id}` - Aktualizacja fiszki
- `PATCH /api/flashcards/{id}/approve` - Zatwierdzenie pojedynczej fiszki
- `PATCH /api/flashcards/approve-bulk` - Zatwierdzenie wielu fiszek
- `PATCH /api/flashcards/approve-by-document` - Zatwierdzenie wszystkich fiszek dla dokumentu
- `DELETE /api/flashcards/{id}` - Usunięcie fiszki

### Tematy (Topics)

- `GET /api/topics` - Lista tematów z filtrowaniem
- `POST /api/topics` - Tworzenie nowego tematu
- `GET /api/topics/{id}` - Pobranie pojedynczego tematu
- `PUT /api/topics/{id}` - Aktualizacja tematu
- `DELETE /api/topics/{id}` - Usunięcie tematu

## Modele danych

### User

Model reprezentujący użytkownika w systemie.

### Document

Główny model reprezentujący dokument w systemie.

### FlashcardDto

Główny model reprezentujący fiszkę w systemie.

### Topic

Główny model reprezentujący temat w systemie.

### PaginationDto

Model reprezentujący informacje o paginacji.

### ErrorResponse

Model reprezentujący odpowiedź z błędem.

## Kody odpowiedzi

- `200` - Sukces
- `201` - Zasób utworzony
- `400` - Nieprawidłowe żądanie
- `401` - Brak autoryzacji
- `404` - Zasób nie znaleziony
- `409` - Konflikt (np. zasób już istnieje)
- `415` - Nieprawidłowy format danych
- `500` - Błąd serwera

## Uwagi

- Wszystkie endpointy wymagają nagłówka `Content-Type: application/json`
- Daty są zwracane w formacie ISO 8601
- UUID są używane jako identyfikatory zasobów 
- Autoryzacja oparta jest na tokenach JWT przechowywanych w httpOnly cookie
- Wymagana jest weryfikacja emaila przed dostępem do chronionych funkcji 