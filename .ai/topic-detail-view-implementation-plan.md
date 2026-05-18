# Plan implementacji widoku TopicDetailView

## 1. Przegląd
TopicDetailView to widok prezentujący szczegóły wybranego tematu wraz z listą przypisanych do niego dokumentów. Widok umożliwia pełne zarządzanie dokumentami (przeglądanie, tworzenie, edycję, usuwanie). Stanowi kluczowy element w hierarchicznej organizacji treści aplikacji 10xCards (Tematy → Dokumenty → Fiszki).

## 2. Routing widoku
Widok dostępny pod ścieżką: `/topics/:id` gdzie `:id` to identyfikator tematu.

## 3. Struktura komponentów
```
TopicDetailView
├── TopicHeader
│   ├── Breadcrumbs
│   └── BackButton
├── DocumentsList
│   ├── DocumentsSorter
│   ├── DocumentCard (wiele instancji)
│   │   ├── EditDocumentButton
│   │   └── DeleteDocumentButton
│   ├── DocumentsSkeleton (widoczny podczas ładowania)
│   ├── DocumentsPerPageSelect
│   ├── Pagination (widoczny gdy jest wiele dokumentów)
│   └── AddDocumentButton
├── EmptyStateComponent
└── ConfirmDeleteModal (widoczny warunkowo)
```

## 4. Szczegóły komponentów

### TopicDetailView
- Opis komponentu: Główny komponent widoku, odpowiedzialny za zarządzanie stanem, pobieranie danych i renderowanie komponentów potomnych.
- Główne elementy: Container z TopicHeader, DocumentsList i modalnymi komponentami.
- Obsługiwane interakcje: Inicjalizacja widoku, obsługa zmiany sortowania dokumentów, nawigacja do innych widoków.
- Obsługiwana walidacja: Weryfikacja poprawności ID tematu, obsługa przypadku nieistniejącego tematu.
- Typy: `TopicDetailViewModel`, `DocumentViewModel[]`.
- Propsy: Brak (komponent główny routingu).

### TopicHeader
- Opis komponentu: Nagłówek widoku zawierający nazwę tematu, ścieżkę nawigacji i przycisk powrotu.
- Główne elementy: Breadcrumbs, tytuł tematu, opis tematu (opcjonalnie), licznik dokumentów, przycisk powrotu.
- Obsługiwane interakcje: Kliknięcie przycisku powrotu (nawigacja do TopicsListView).
- Obsługiwana walidacja: Brak.
- Typy: `TopicDetailViewModel`.
- Propsy: `topic: TopicDetailViewModel, onBack: () => void`.

### DocumentsList
- Opis komponentu: Lista dokumentów w temacie z możliwością sortowania i paginacji.
- Główne elementy: Panel sortowania, lista kart dokumentów, przycisk dodawania dokumentu, paginacja.
- Obsługiwane interakcje: Sortowanie, przewijanie listy, zmiana strony, zmiana liczby dokumentów na stronę, nawigacja do tworzenia nowego dokumentu.
- Obsługiwana walidacja: Obsługa pustej listy dokumentów.
- Typy: `DocumentViewModel[]`, `DocumentsSortModel`.
- Propsy: `documents: DocumentViewModel[], isLoading: boolean, onSortChange: (sort: DocumentsSortModel) => void, topicId: string, pagination: PaginationModel, onPageChange: (page: number) => void, onPerPageChange: (perPage: number) => void`.

### DocumentsSorter
- Opis komponentu: Kontrolka umożliwiająca sortowanie dokumentów na poziomie API.
- Główne elementy: Select z opcjami sortowania (nazwa, data utworzenia, data aktualizacji) oraz kierunku sortowania (rosnąco, malejąco).
- Obsługiwane interakcje: Zmiana kryterium sortowania, zmiana kierunku sortowania.
- Obsługiwana walidacja: Brak.
- Typy: `DocumentsSortModel`.
- Propsy: `value: DocumentsSortModel, onChange: (sort: DocumentsSortModel) => void`.

### DocumentCard
- Opis komponentu: Karta pojedynczego dokumentu w liście dokumentów.
- Główne elementy: Tytuł dokumentu, data utworzenia, liczba fiszek z podziałem na manualne i AI (z ikoną), przyciski akcji.
- Obsługiwane interakcje: Kliknięcie przycisku edycji (nawigacja do DocumentEditView), kliknięcie przycisku usunięcia, kliknięcie karty (nawigacja do DocumentDetailView).
- Obsługiwana walidacja: Brak.
- Typy: `DocumentViewModel`.
- Propsy: `document: DocumentViewModel, onDelete: (document: DocumentViewModel) => void`.

### ConfirmDeleteModal
- Opis komponentu: Modal potwierdzający usunięcie dokumentu.
- Główne elementy: Komunikat ostrzegawczy, informacja o konsekwencjach, przyciski potwierdzenia i anulowania.
- Obsługiwane interakcje: Potwierdzenie, anulowanie.
- Obsługiwana walidacja: Brak.
- Typy: `DocumentViewModel`.
- Propsy: `isOpen: boolean, document: DocumentViewModel, onClose: () => void, onConfirm: () => void, isDeleting: boolean`.

### DocumentsSkeleton
- Opis komponentu: Szkielet ładowania wyświetlany podczas pobierania dokumentów.
- Główne elementy: Kilka szkieletów kart dokumentów.
- Obsługiwane interakcje: Brak.
- Obsługiwana walidacja: Brak.
- Typy: Brak.
- Propsy: `count: number` (liczba wyświetlanych szkieletów).

### DocumentsPerPageSelect
- Opis komponentu: Dropdown umożliwiający wybór liczby dokumentów na stronę.
- Główne elementy: Select z opcjami (np. 10, 25, 50).
- Obsługiwane interakcje: Zmiana wybranej wartości.
- Obsługiwana walidacja: Brak.
- Typy: Brak.
- Propsy: `value: number, onChange: (value: number) => void, options: number[]`.

### Pagination
- Opis komponentu: Komponenty paginacji z shadcn/ui do nawigacji między stronami dokumentów.
- Główne elementy: Przyciski Poprzednia/Następna, numery stron, wielokropek dla dużej liczby stron.
- Obsługiwane interakcje: Kliknięcie numeru strony, kliknięcie Poprzednia/Następna.
- Obsługiwana walidacja: Brak.
- Typy: `PaginationModel`.
- Propsy: `currentPage: number, totalPages: number, onPageChange: (page: number) => void`.

### EmptyStateComponent
- Opis komponentu: Komponent wyświetlany, gdy temat nie zawiera żadnych dokumentów.
- Główne elementy: Ilustracja, komunikat zachęcający, przycisk dodawania dokumentu.
- Obsługiwane interakcje: Kliknięcie przycisku dodawania dokumentu (nawigacja do DocumentEditView).
- Obsługiwana walidacja: Brak.
- Typy: Brak.
- Propsy: `topicId: string`.

## 5. Typy

### TopicDetailViewModel
```typescript
interface TopicDetailViewModel {
  id: string;
  name: string;
  description?: string;
  parent_id: string | null;
  documents_count: number;
  flashcards_count: number;
  created_at: string;
  updated_at: string;
  breadcrumbs: Array<{id: string, name: string}>;
}
```

### DocumentViewModel
```typescript
interface DocumentViewModel {
  id: string;
  name: string;
  content: string;
  topic_id: string;
  created_at: string;
  updated_at: string;
  has_flashcards: boolean;
  flashcards_count: number;
  isAiGenerated?: boolean;
}
```

### DocumentsSortModel
```typescript
interface DocumentsSortModel {
  sortBy: "name" | "created_at" | "updated_at";
  sortOrder: "asc" | "desc";
  page: number;
  limit: number;
}
```

### PaginationModel
```typescript
interface PaginationModel {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  availablePerPage: number[]; // np. [10, 25, 50]
}
```

## 6. Zarządzanie stanem

### Hook useTopicDetail
```typescript
function useTopicDetail(id: string) {
  const [topic, setTopic] = useState<TopicDetailViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Logika pobierania danych tematu
  
  return { topic, isLoading, error, refetch };
}
```

### Hook useDocumentsList
```typescript
function useDocumentsList(topicId: string, sort: DocumentsSortModel) {
  const [documents, setDocuments] = useState<DocumentViewModel[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [pagination, setPagination] = useState<PaginationModel>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
    availablePerPage: [10, 25, 50]
  });
  
  // Logika pobierania listy dokumentów z uwzględnieniem sortowania i paginacji
  // Sortowanie jest realizowane na poziomie API, a nie na froncie
  
  return { documents, total, isLoading, error, pagination, refetch };
}
```

## 7. Integracja API

### Pobieranie szczegółów tematu
- Endpoint: `GET /api/topics/{id}`
- Typ odpowiedzi: `TopicDto`
- Użycie: Inicjalizacja widoku

### Pobieranie listy dokumentów
- Endpoint: `GET /api/documents?topic_id={id}&page={page}&limit={limit}&sortBy={sortBy}&sortOrder={sortOrder}`
- Parametry: `topic_id`, `page`, `limit`, `sortBy` (name, created_at, updated_at), `sortOrder` (asc, desc)
- Typ odpowiedzi: `DocumentsListResponseDto`
- Użycie: Inicjalizacja widoku, zmiana sortowania, zmiana strony, zmiana liczby dokumentów na stronę
- **Uwaga**: Sortowanie jest realizowane bezpośrednio przez endpoint API, co zwiększa wydajność przy dużych zbiorach danych. Komponent DocumentsSorter wysyła parametry sortowania do API, a nie sortuje dane po stronie klienta.

### Usuwanie dokumentu
- Endpoint: `DELETE /api/documents/{id}`
- Typ odpowiedzi: `{ message: string }`
- Użycie: Potwierdzenie usunięcia dokumentu

## 8. Interakcje użytkownika

### Przeglądanie tematu i dokumentów
1. Użytkownik wchodzi na stronę `/topics/{id}`
2. System wyświetla szczegóły tematu i listę dokumentów
3. Użytkownik może przewijać listę dokumentów, sortować je według różnych kryteriów i nawigować między stronami
4. Użytkownik może zmienić liczbę dokumentów wyświetlanych na stronie

### Tworzenie dokumentu
1. Użytkownik klika przycisk "Dodaj dokument"
2. System przekierowuje użytkownika do widoku DocumentEditView na ścieżce `/topics/:id/documents/new`
3. Użytkownik wypełnia formularz i klika "Zapisz" lub "Generuj fiszki"
4. W przypadku kliknięcia "Zapisz":
   - System zapisuje dokument i wraca do TopicDetailView
5. W przypadku kliknięcia "Generuj fiszki":
   - System zapisuje dokument i przekierowuje do FlashcardsApprovalView

### Edycja dokumentu
1. Użytkownik klika przycisk edycji przy dokumencie
2. System przekierowuje użytkownika do widoku DocumentEditView na ścieżce `/documents/:id/edit`
3. Użytkownik modyfikuje dane i klika "Zapisz" lub "Generuj fiszki"
4. W przypadku kliknięcia "Zapisz":
   - System aktualizuje dokument i wraca do TopicDetailView
5. W przypadku kliknięcia "Generuj fiszki":
   - System aktualizuje dokument, wyświetla ostrzeżenie o ponownym generowaniu fiszek
   - Po potwierdzeniu przekierowuje do FlashcardsApprovalView

### Usuwanie dokumentu
1. Użytkownik klika przycisk usunięcia przy dokumencie
2. System wyświetla modal potwierdzający z ostrzeżeniem o usunięciu powiązanych fiszek
3. Użytkownik potwierdza usunięcie
4. System wysyła żądanie usunięcia, zamyka modal i odświeża listę dokumentów

### Przejście do szczegółów dokumentu
1. Użytkownik klika na kartę dokumentu
2. System przekierowuje użytkownika do widoku DocumentDetailView na ścieżce `/documents/:id`

### Zmiana liczby dokumentów na stronie
1. Użytkownik wybiera nową wartość z dropdownu liczby dokumentów na stronę
2. System odświeża listę dokumentów z nowym parametrem `limit` i resetuje numer strony na 1

### Zmiana strony
1. Użytkownik klika numer strony lub przyciski Poprzednia/Następna w komponencie paginacji
2. System odświeża listę dokumentów z nowym parametrem `page`

### Sortowanie dokumentów
1. Użytkownik wybiera kryterium i kierunek sortowania w komponencie DocumentsSorter
2. System wysyła żądanie do API z nowymi parametrami sortowania
3. API zwraca posortowane wyniki, które są wyświetlane użytkownikowi
4. Sortowanie jest realizowane na poziomie bazy danych, co zapewnia wydajność nawet przy dużych zbiorach danych

## 9. Warunki i walidacja

### Walidacja usunięcia dokumentu
- Sprawdzenie czy dokument istnieje
- Wyświetlenie ostrzeżenia o usunięciu powiązanych fiszek

## 10. Obsługa błędów

### Błędy API
- Błąd pobierania tematu: Wyświetlenie komunikatu z opcją ponownego próbowania
- Błąd pobierania dokumentów: Wyświetlenie komunikatu z opcją ponownego próbowania
- Błąd usuwania dokumentu: Wyświetlenie komunikatu w modalu, opcja ponownej próby

### Błędy nawigacji
- Nieprawidłowe ID tematu: Przekierowanie do strony błędu 404

## 11. Responsywność

### Układ desktop (>= 1024px)
- Dokumenty wyświetlane w siatce (grid) 3-4 karty w rzędzie
- Modal usuwania wyświetlany jako okno centralne

### Układ tablet (>= 768px, < 1024px)
- Dokumenty wyświetlane w siatce 2 karty w rzędzie
- Modal usuwania wyświetlany jako okno centralne

### Układ mobilny (< 768px)
- Dokumenty wyświetlane w jednej kolumnie
- Modal usuwania wyświetlany jako pełnoekranowy
- Sortowanie i wybór liczby dokumentów na stronie umieszczone w menu rozwijalnym

## 12. Kroki implementacji

1. Utworzenie podstawowej struktury widoku TopicDetailView
   - Zdefiniowanie ścieżki routingu
   - Implementacja wstępnej struktury komponentu

2. Implementacja modeli i typów danych
   - Zdefiniowanie typów ViewModel
   - Implementacja mapperów do konwersji typów API na typy ViewModel

3. Implementacja hooków zarządzania stanem
   - useTopicDetail
   - useDocumentsList z obsługą paginacji i sortowania na poziomie API

4. Implementacja komponentów podrzędnych
   - TopicHeader z Breadcrumbs
   - DocumentsList z dokumentami i sorterem API
   - Pagination z shadcn/ui
   - DocumentsPerPageSelect
   - DocumentsSkeleton
   - EmptyStateComponent
   - ConfirmDeleteModal

5. Integracja z API
   - Pobieranie szczegółów tematu
   - Pobieranie listy dokumentów z paginacją i sortowaniem po stronie API
   - Obsługa usuwania dokumentów

6. Implementacja nawigacji
   - Przekierowanie do DocumentEditView przy tworzeniu/edycji dokumentu
   - Przekierowanie do DocumentDetailView przy kliknięciu na kartę dokumentu

7. Obsługa interakcji użytkownika
   - Obsługa sortowania dokumentów (wysyłanie parametrów do API)
   - Obsługa paginacji
   - Obsługa modali
   - Obsługa nawigacji

8. Implementacja obsługi błędów
   - Komunikaty błędów API
   - Obsługa nieistniejących zasobów
   - Obsługa problemów z połączeniem

9. Implementacja responsywności
   - Układy dla desktop, tablet i mobilny
   - Media queries dla różnych rozmiarów ekranu
   - Dostosowanie modali dla urządzeń mobilnych

10. Testowanie
    - Weryfikacja wszystkich ścieżek użytkownika
    - Weryfikacja obsługi błędów
    - Weryfikacja wydajności przy dużej liczbie dokumentów
    - Testowanie na różnych urządzeniach i rozmiarach ekranu

11. Optymalizacja wydajności
    - Implementacja wirtualizowanej listy dla dużej ilości dokumentów
    - Memoizacja komponentów
    - Optymalizacja ponownego renderowania 