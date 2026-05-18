# Testy dla DocumentDetailView

## Zaimplementowane testy

1. **useFlashcardsList**
   - Test ładowania fiszek przy inicjalizacji
   - Test zmiany strony
   - Test zmiany sortowania
   - Test obsługi błędów API

2. **handleRegenerateFlashcards**
   - Test pobierania istniejących fiszek AI i wyświetlania dialogu potwierdzenia
   - Test obsługi odpowiedzi API z wygenerowanymi fiszkami i przekierowania
   - Test obsługi timeoutu podczas regeneracji
   - Test obsługi braku wygenerowanych fiszek
   - Test obsługi błędu API podczas regeneracji

3. **handleAddFlashcard**
   - Test dodawania fiszki przy poprawnej odpowiedzi API
   - Test obsługi błędu API podczas dodawania
   - Test przekierowania na stronę logowania przy wygaśnięciu sesji (status 401)

4. **Obsługa wygaśnięcia sesji**
   - Test dodawania obserwatora zdarzenia session-expired
   - Test przekierowania do logowania po zdarzeniu session-expired
   - Test usuwania obserwatora przy odmontowaniu komponentu

5. **Renderowanie warunkowe**
   - Test wyświetlania loadera podczas ładowania dokumentu
   - Test wyświetlania loadera podczas ładowania fiszek
   - Test wyświetlania błędu ładowania dokumentu
   - Test wyświetlania błędu ładowania fiszek
   - Test wyświetlania stanu pustego
   - Test wyświetlania listy fiszek

## Sugerowane dodatkowe testy

1. **handleEditFlashcard**
   - Test edycji fiszki przy poprawnej odpowiedzi API
   - Test obsługi błędów API podczas edycji
   - Test walidacji danych wejściowych

2. **handleDeleteFlashcard**
   - Test usuwania fiszki przy poprawnej odpowiedzi API
   - Test potwierdzenia przed usunięciem
   - Test obsługi błędów API podczas usuwania

3. **handleDeleteDocument**
   - Test usuwania dokumentu
   - Test potwierdzenia przed usunięciem dokumentu
   - Test przekierowania po pomyślnym usunięciu

4. **Interakcje użytkownika**
   - Test interakcji z komponentem FlashcardsSorter
   - Test interakcji z komponentem paginacji
   - Test zamykania i otwierania modali

5. **Integracja z API**
   - Testy integracyjne z rzeczywistymi endpointami API
   - Testy e2e procesu tworzenia i zarządzania fiszkami

## Uwagi dotyczące wdrożenia testów

1. **Problemy linterowe**
   - Niepoprawne importy (require vs import)
   - Typowanie dla funkcji i argumentów

2. **Instalacja zależności testowych**
   - @testing-library/react
   - vitest

3. **Konfiguracja testów**
   - Należy zaktualizować konfigurację vitest, aby uwzględnić katalogi testowe
   - Skonfigurować JSdom dla testów komponentów React

4. **Mocki i podejście testowe**
   - Zastosowano podejście oparte na mockach dla zewnętrznych zależności
   - Testy koncentrują się na logice biznesowej i obsłudze błędów 