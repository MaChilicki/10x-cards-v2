# Dane testowe do API dokumentów

## Konfiguracja środowiska
1. Zaimportuj kolekcję `documents-api.postman_collection.json` do Postmana
2. Ustaw zmienne środowiskowe w Postmanie:
   - `baseUrl`: `http://localhost:3000` (lub adres Twojego serwera)
   - `documentId`: (zostanie automatycznie zaktualizowane po utworzeniu dokumentu)

## Przykładowe scenariusze testowe

### 1. Tworzenie dokumentu
```json
{
  "name": "Test Document",
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
  "topic_id": "123e4567-e89b-12d3-a456-426614174000"
}
```

### 2. Aktualizacja dokumentu
```json
{
  "name": "Updated Document Name",
  "content": "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
}
```

### 3. Parametry listy dokumentów
- Podstawowe:
  ```
  GET /api/documents?page=1&limit=20
  ```

- Z sortowaniem:
  ```
  GET /api/documents?page=1&limit=20&sort=-created_at
  GET /api/documents?page=1&limit=20&sort=name
  ```

- Z filtrowaniem:
  ```
  GET /api/documents?page=1&limit=20&name=Test
  ```

## Scenariusze testowe

1. **Tworzenie i pobieranie dokumentu**
   - Wykonaj request "Utwórz dokument"
   - Skopiuj `id` z odpowiedzi do zmiennej `documentId`
   - Wykonaj request "Pobierz dokument"
   - Sprawdź czy dane się zgadzają

2. **Aktualizacja dokumentu**
   - Wykonaj request "Aktualizuj dokument"
   - Sprawdź czy nazwa i treść zostały zaktualizowane
   - Sprawdź czy inne pola pozostały bez zmian

3. **Listowanie i filtrowanie**
   - Wykonaj request "Lista dokumentów" bez parametrów
   - Dodaj filtr po nazwie
   - Zmień sortowanie
   - Sprawdź paginację

4. **Usuwanie dokumentu**
   - Wykonaj request "Usuń dokument"
   - Spróbuj pobrać usunięty dokument (powinien zwrócić 404)
   - Sprawdź czy fiszki zostały również usunięte

## Testowanie błędów

1. **Nieprawidłowe dane wejściowe**
   ```json
   {
     "name": "",
     "content": "Za krótka treść"
   }
   ```

2. **Nieprawidłowy format UUID**
   ```
   GET /api/documents/invalid-uuid
   ```

3. **Nieprawidłowy Content-Type**
   - Usuń header `Content-Type` z requestu POST/PUT

4. **Nieprawidłowe parametry paginacji**
   ```
   GET /api/documents?page=0&limit=1000
   ```

## Oczekiwane kody odpowiedzi

- 200: Sukces (GET, PUT)
- 201: Dokument utworzony (POST)
- 400: Nieprawidłowe dane wejściowe
- 404: Dokument nie istnieje
- 415: Nieprawidłowy Content-Type
- 500: Błąd serwera 