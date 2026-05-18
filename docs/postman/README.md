# Kolekcja Postman dla 10xCards API

## Jak używać

1. Zainstaluj [Postman](https://www.postman.com/downloads/)
2. Zaimportuj kolekcję:
   - Otwórz Postman
   - Kliknij "Import" w górnym lewym rogu
   - Przeciągnij plik `10xCards.postman_collection.json` lub wybierz go z dysku
   - Kliknij "Import"

## Konfiguracja środowiska

1. Utwórz nowe środowisko w Postman:
   - Kliknij ikonę koła zębatego (⚙️) w prawym górnym rogu
   - Wybierz "Manage Environments"
   - Kliknij "Add"
   - Nazwij środowisko (np. "10xCards Local")

2. Dodaj zmienne środowiskowe:
   ```json
   {
     "baseUrl": "http://localhost:3000"
   }
   ```

3. Zapisz środowisko i wybierz je z rozwijanej listy w prawym górnym rogu

## Przykłady użycia

### Regeneracja fiszek AI

Endpoint: `POST {{baseUrl}}/api/flashcards/ai-regenerate`

Przykładowe dane:
```json
{
  "document_id": "dbcc7c6e-51f9-4c32-b8f2-9019dca0d525",
  "force_regenerate": true
}
```

Ten request:
1. Wyłączy wszystkie istniejące fiszki AI dla dokumentu (soft-delete)
2. Wygeneruje nowy zestaw fiszek
3. Zwróci listę nowych fiszek wraz z liczbą wyłączonych

Spodziewana odpowiedź:
```json
{
  "flashcards": [
    {
      "front_original": "Co to jest TypeScript?",
      "back_original": "TypeScript to typowany nadzbiór JavaScript...",
      "topic_id": "123e4567-e89b-12d3-a456-426614174000",
      "document_id": "dbcc7c6e-51f9-4c32-b8f2-9019dca0d525",
      "source": "ai",
      "is_approved": false
    }
  ],
  "disabled_count": 5
}
```

## Testy

Kolekcja zawiera wbudowane testy sprawdzające:
- Kod odpowiedzi (200)
- Obecność tablicy `flashcards` w odpowiedzi
- Obecność pola `disabled_count` w odpowiedzi

Aby uruchomić testy:
1. Otwórz request "Regenerate AI Flashcards"
2. Kliknij przycisk "Send"
3. Przejdź do zakładki "Test Results" w dolnym panelu 