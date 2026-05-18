# Komponenty Tematów

## TopicDetailView

Komponent odpowiedzialny za wyświetlanie szczegółów tematu wraz z listą dokumentów.

### Optymalizacje wydajności

1. **Memoizacja komponentów**
   - `MemoizedTopicHeader` - zapobiega niepotrzebnym przerenderowaniom nagłówka
   - `MemoizedDocumentList` - optymalizuje renderowanie listy dokumentów
   - `MemoizedDocumentsPerPageSelect` - optymalizuje renderowanie selektora liczby dokumentów

2. **Memoizacja funkcji obsługi zdarzeń**
   - `handleSort` - obsługa sortowania
   - `handlePageChange` - obsługa zmiany strony
   - `handlePerPageChange` - obsługa zmiany liczby dokumentów na stronie
   - `handleAddDocument` - obsługa dodawania dokumentu
   - `handleDeleteDocument` - obsługa usuwania dokumentu
   - `handleConfirmDelete` - obsługa potwierdzenia usunięcia
   - `updateUrlParams` - obsługa aktualizacji parametrów URL

3. **Memoizacja propsów**
   - `topicHeaderProps` - props dla nagłówka
   - `documentListProps` - props dla listy dokumentów
   - `documentsPerPageSelectProps` - props dla selektora liczby dokumentów

### Obsługa błędów

1. **Błędy ładowania**
   - Wyświetlanie komunikatu o błędzie ładowania tematu
   - Wyświetlanie komunikatu o błędzie ładowania dokumentów
   - Możliwość ponownego załadowania danych

2. **Błędy operacji**
   - Obsługa błędów usuwania dokumentu
   - Wyświetlanie komunikatów błędów w modalu

### Responsywność

Komponent jest w pełni responsywny dzięki:
- Wykorzystaniu klas Tailwind do responsywnego układu
- Responsywnym komponentom z biblioteki shadcn/ui
- Dostosowaniu interfejsu do różnych rozmiarów ekranu

### Testy

1. **Testy jednostkowe**
   - Sprawdzanie poprawności renderowania
   - Testowanie obsługi błędów
   - Testowanie interakcji użytkownika

2. **Testy wydajnościowe**
   - Pomiar czasu pierwszego renderowania
   - Pomiar czasu ponownego renderowania
   - Analiza wydajności dla różnych liczb dokumentów

### Użycie

```tsx
import TopicDetailView from "./components/topics/topic-detail-view";

function App() {
  return <TopicDetailView topicId="123" />;
}
```

### Props

| Nazwa   | Typ     | Opis                    | Wymagane |
|---------|---------|-------------------------|----------|
| topicId | string  | ID tematu do wyświetlenia | Tak      |

### Zależności

- React
- Tailwind CSS
- shadcn/ui
- @tanstack/react-virtual (do wirtualizacji listy)

### Znane problemy

1. Wydajność przy dużej liczbie dokumentów (>1000)
   - Rozwiązanie: Implementacja wirtualizacji listy
   - Status: W trakcie implementacji

2. Opóźnienia w aktualizacji URL
   - Rozwiązanie: Debouncing aktualizacji URL
   - Status: Do zaimplementowania

### TODO

1. Implementacja wirtualizacji listy dla lepszej wydajności
2. Dodanie debouncing dla aktualizacji URL
3. Optymalizacja ładowania obrazów
4. Dodanie testów E2E 