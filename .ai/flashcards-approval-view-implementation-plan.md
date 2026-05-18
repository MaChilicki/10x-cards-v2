# Plan implementacji widoku FlashcardsApprovalView

## 1. Przegląd
FlashcardsApprovalView to widok służący do zatwierdzania lub odrzucania fiszek wygenerowanych przez AI. Użytkownik może zatwierdzać fiszki pojedynczo, masowo zaznaczone lub wszystkie naraz. Widok umożliwia również edycję fiszek przed zatwierdzeniem, odwracanie fiszek, aby zobaczyć ich drugą stronę, a także usuwanie (soft-delete) pojedynczych niezatwierdzonych fiszek.

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/documents/:id/flashcards/approve`, gdzie `:id` to identyfikator dokumentu.

## 3. Struktura komponentów
```
FlashcardsApprovalView
├── LoadingIndicator (Wyświetlany podczas ładowania danych dokumentu lub fiszek)
├── ErrorMessage (Wyświetlany w przypadku błędu ładowania danych)
├── DocumentHeader
│   ├── Breadcrumb
│   ├── Button (Powrót)
|   ├── Tytuł Dokumentu (h1)
│   ├── Fragment Treści Dokumentu (p)
│   └── Badge (statystyki fiszek)
├── BulkActionsBar
│   ├── Button (Zaznacz wszystkie)
│   ├── Button (Zatwierdź zaznaczone)
│   └── Button (Zatwierdź wszystkie)
├── FlashcardsSorter (wykorzystanie istniejącego komponentu)
│   ├── Select (Sortuj wg: Front fiszki, Data utworzenia, Data modyfikacji)
│   ├── Select (Kierunek sortowania)
│   ├── Select (Liczba fiszek na stronie [12 | 24 | 36])
├── FlashcardsList
│   ├── LoadingIndicator (Skeleton dla fiszek, widoczny podczas ladowania)
│   ├── EmptyState (jeśli brak fiszek po zastosowaniu sortowania)
│   ├── FlashcarCard 1
│   │   ├── Checkbox
│   │   ├── Button (Odwróć)
│   │   ├── Button (Zatwierdź)
│   │   ├── Button (Usuń)
│   │   ├── Button (Edytuj)
│   │   ├── Div (Kontener karty z logiką odwracania)
│   │   │   ├── Div (Przód fiszki)
│   │   │   └── Div (Tył fiszki)
│   │   ├── Badge (Źródło: AI/Manualne)
│   │   ├── Label (Utworzono: Data czas)
│   │   └── Label (Zaktualizowano: Data czas)
│   ├── FlashcardCard 2
│   │   └── ...
│   ├── ...
├── Pagination (widoczny gdy jest wiele fiszek)
├── FlashcardEditModal
│   ├── Form
│   │   ├── TextArea (przód)
│   │   └── TextArea (tył)
│   ├── Button (Zapisz)
│   └── Button (Anuluj)
└── ConfirmationDialog
    ├── Text (treść)
    ├── Button (Potwierdź)
    └── Button (Anuluj)
```

## 4. Szczegóły komponentów

### FlashcardsApprovalView
- Opis komponentu: Główny komponent widoku, odpowiedzialny za koordynację wszystkich podkomponentów i zarządzanie stanem.
- Główne elementy: LoadingIndicator, ErrorMessage, DocumentHeader, BulkActionsBar, FlashcardsSorter, FlashcardsList, Pagination, FlashcardEditModal, ConfirmationDialog, Toast
- Obsługiwane interakcje: Pobieranie dokumentu i fiszek, zarządzanie zaznaczeniem, otwieranie/zamykanie modali, sortowanie/filtrowanie fiszek
- Obsługiwana walidacja: Sprawdzanie czy dokument istnieje, czy są niezatwierdzone fiszki
- Typy: DocumentDto, FlashcardDto, FlashcardsApprovalViewModel
- Propsy: N/A (komponent na poziomie strony)

### LoadingIndicator
- Opis komponentu: Wskaźnik ładowania wyświetlany podczas pobierania danych (dokumentu lub fiszek).
- Główne elementy: Animacja ładowania, opcjonalny tekst z informacją co jest ładowane
- Obsługiwane interakcje: N/A (komponent informacyjny)
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy:
  ```typescript
  {
    message?: string; // Opcjonalny tekst opisujący co jest ładowane
    size?: 'small' | 'medium' | 'large'; // Rozmiar wskaźnika ładowania
  }
  ```

### ErrorMessage
- Opis komponentu: Komunikat błędu wyświetlany gdy wystąpił problem z ładowaniem danych.
- Główne elementy: Ikona błędu, tekst z opisem błędu, przycisk ponownej próby
- Obsługiwane interakcje: Kliknięcie przycisku ponownej próby
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy:
  ```typescript
  {
    message: string; // Tekst błędu
    onRetry?: () => void; // Opcjonalna funkcja wywoływana przy ponownej próbie
  }
  ```

### DocumentHeader
- Opis komponentu: Nagłówek z informacjami o dokumencie, breadcrumbami i przyciskiem powrotu.
- Główne elementy: Breadcrumb, Button (powrót), tekst z tytułem dokumentu, tekst z fragmentem dokumentu (500 pierwszych znaków]) Badge (liczba niezatwierdzonych fiszek)
- Obsługiwane interakcje: Kliknięcie przycisku powrotu, nawigacja przez breadcrumby
- Obsługiwana walidacja: N/A
- Typy: DocumentDto, BreadcrumbItem[]
- Propsy:
  ```typescript
  {
    document: DocumentDto | null;
    breadcrumbs: BreadcrumbItem[];
    unapprovedCount: number;
    aiFlashcardsCount: number;
    manualFlashcardsCount: number;
    onBack: () => void;
    isLoading?: boolean;
  }
  ```

### BulkActionsBar
- Opis komponentu: Pasek akcji do operacji zbiorczych na fiszkach.
- Główne elementy: Button (Zaznacz wszystkie), Button (Zatwierdź zaznaczone), Button (Zatwierdź wszystkie), informacja o liczbie zaznaczonych fiszek
- Obsługiwane interakcje: Zaznaczanie wszystkich, zatwierdzanie zaznaczonych, zatwierdzanie wszystkich
- Obsługiwana walidacja: Czy są zaznaczone fiszki, czy są fiszki do zatwierdzenia
- Typy: N/A
- Propsy:
  ```typescript
  {
    selectedCount: number;
    totalCount: number;
    allSelected: boolean;
    onSelectAll: (value: boolean) => void;
    onApproveSelected: () => void;
    onApproveAll: () => void;
    isLoading: boolean;
  }
  ```

### FlashcardsList
- Opis komponentu: Lista fiszek do zatwierdzenia z opcją zaznaczania.
- Główne elementy: LoadingIndicator (skeleton), EmptyState, FlashcardCard dla każdej fiszki
- Obsługiwane interakcje: N/A (interakcje są obsługiwane przez komponenty potomne)
- Obsługiwana walidacja: Czy są fiszki do wyświetlenia
- Typy: FlashcardDto[], SelectedFlashcardsMap
- Propsy:
  ```typescript
  {
    flashcards: FlashcardDto[];
    selectedFlashcards: Record<string, boolean>;
    isLoading: boolean;
    isEmpty: boolean;
    onToggleSelect: (id: string) => void;
    onApprove: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (flashcard: FlashcardDto) => void;
  }
  ```

### LoadingIndicator (Skeleton)
- Opis komponentu: Placeholder wyświetlany podczas ładowania fiszek.
- Główne elementy: Animowane elementy reprezentujące ładujące się fiszki
- Obsługiwane interakcje: N/A
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy:
  ```typescript
  {
    count: number; // Liczba placeholderów do wyświetlenia
  }
  ```

### EmptyState
- Opis komponentu: Komunikat wyświetlany gdy brak fiszek do pokazania.
- Główne elementy: Ikona, tekst informacyjny, opcjonalny przycisk akcji
- Obsługiwane interakcje: Kliknięcie przycisku akcji (jeśli dostępny)
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy:
  ```typescript
  {
    message: string; // Tekst do wyświetlenia
    actionText?: string; // Opcjonalny tekst przycisku
    onAction?: () => void; // Opcjonalna funkcja wywoływana po kliknięciu przycisku
  }
  ```

### FlashcardCard
- Opis komponentu: Komponent reprezentujący pojedynczą fiszkę z kontrolkami.
- Główne elementy: Checkbox, kontener z logiką odwracania (przód/tył), Button (Odwróć), Button (Zatwierdź), Button (Usuń), Button (Edytuj), Badge (źródło), Label (data utworzenia i aktualizacji)
- Obsługiwane interakcje: Zaznaczanie, odwracanie, zatwierdzanie, usuwanie, edycja
- Obsługiwana walidacja: N/A
- Typy: FlashcardDto, boolean (isSelected, isFlipped)
- Propsy:
  ```typescript
  {
    flashcard: FlashcardDto;
    isSelected: boolean;
    onToggleSelect: (id: string) => void;
    onApprove: (id: string) => void;
    onDelete: (id: string) => void;
    onEdit: (flashcard: FlashcardDto) => void;
  }
  ```

### Pagination
- Opis komponentu: Kontrolka paginacji dla listy fiszek.
- Główne elementy: Przyciski nawigacji (pierwsza, poprzednia, następna, ostatnia strona), wskaźnik aktualnej strony
- Obsługiwane interakcje: Zmiana strony
- Obsługiwana walidacja: Czy dany przycisk nawigacji powinien być aktywny
- Typy: N/A
- Propsy:
  ```typescript
  {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    isLoading?: boolean;
  }
  ```

### FlashcardEditModal
- Opis komponentu: Modal do edycji treści fiszki.
- Główne elementy: Form z polami TextArea (przód i tył), Button (Zapisz), Button (Anuluj)
- Obsługiwane interakcje: Edycja treści, zapisywanie zmian, anulowanie
- Obsługiwana walidacja: Niepuste pola, maksymalna długość treści (200 znaków dla przodu, 500 dla tyłu)
- Typy: FlashcardDto, FlashcardUpdateDto
- Propsy:
  ```typescript
  {
    isOpen: boolean;
    flashcard: FlashcardDto | null;
    onClose: () => void;
    onSave: (data: FlashcardUpdateDto) => Promise<void>;
    isSubmitting: boolean;
  }
  ```

### ConfirmationDialog
- Opis komponentu: Dialog potwierdzenia dla operacji zbiorczych.
- Główne elementy: Tekst z pytaniem, Button (Potwierdź), Button (Anuluj)
- Obsługiwane interakcje: Potwierdzenie, anulowanie
- Obsługiwana walidacja: N/A
- Typy: ConfirmDialogState
- Propsy:
  ```typescript
  {
    isOpen: boolean;
    title: string;
    description: string;
    confirmText?: string;
    onConfirm: (() => void) | null;
    onClose: () => void;
  }
  ```

## 5. Typy

### FlashcardsApprovalViewModel
```typescript
interface FlashcardsApprovalViewModel {
  // Dokument
  document: DocumentDto | null;
  isLoadingDocument: boolean;
  documentError: Error | null;
  
  // Fiszki
  flashcards: FlashcardDto[];
  isLoadingFlashcards: boolean;
  flashcardsError: Error | null;
  
  // Paginacja
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  } | null;
  
  // Sortowanie
  sort: FlashcardsSortModel;
  
  // Stan zaznaczenia
  selectedFlashcards: Record<string, boolean>;
  allSelected: boolean;
  selectedCount: number;
  
  // Stan modalów
  editModalState: {
    isOpen: boolean;
    flashcard: FlashcardDto | null;
    isSubmitting: boolean;
  };
  confirmDialogState: ConfirmDialogState;
  
  // Stan powiadomień
  toast: {
    isVisible: boolean;
    message: string;
    type: 'success' | 'error' | 'info';
  };
}
```

### SelectedFlashcardsMap
```typescript
type SelectedFlashcardsMap = Record<string, boolean>;
```

### EditFlashcardFormData
```typescript
interface EditFlashcardFormData {
  front_modified: string;
  back_modified: string;
}
```

### FlashcardItemViewModel
```typescript
interface FlashcardItemViewModel {
  flashcard: FlashcardDto;
  isSelected: boolean;
  isFlipped: boolean;
  onSelect: (id: string) => void;
  onApprove: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit: (flashcard: FlashcardDto) => void;
  onFlip: (id: string) => void;
}
```

### FlashcardsSortOptions
```typescript
interface FlashcardsSortModel {
  sortBy: 'created_at' | 'updated_at' | 'front_modified';
  sortOrder: 'asc' | 'desc';
}
```

### BreadcrumbItem
```typescript
interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
}
```

## 6. Zarządzanie stanem

Stan widoku będzie zarządzany przez główny hook `useFlashcardsApproval`, który będzie zawierał:

```typescript
function useFlashcardsApproval(documentId: string) {
  // Stan dokumentu
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [isLoadingDocument, setIsLoadingDocument] = useState(true);
  const [documentError, setDocumentError] = useState<Error | null>(null);
  
  // Stan fiszek
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoadingFlashcards, setIsLoadingFlashcards] = useState(true);
  const [flashcardsError, setFlashcardsError] = useState<Error | null>(null);
  
  // Stan paginacji
  const [pagination, setPagination] = useState({
    currentPage: 1,
    itemsPerPage: 12, // Domyślnie 12 fiszek na stronie
    totalItems: 0,
    totalPages: 0,
  });
  
  // Stan sortowania
  const [sort, setSort] = useState<FlashcardsSortModel>({
    sortBy: 'created_at', // Domyślnie sortowanie po dacie utworzenia
    sortOrder: 'desc', // Domyślnie od najnowszych
  });
  
  // Stan zaznaczenia
  const [selectedFlashcards, setSelectedFlashcards] = useState<Record<string, boolean>>({});
  const selectedCount = useMemo(() => 
    Object.values(selectedFlashcards).filter(Boolean).length, 
    [selectedFlashcards]
  );
  const allSelected = useMemo(() => 
    flashcards.length > 0 && selectedCount === flashcards.length, 
    [flashcards.length, selectedCount]
  );
  
  // Stan dla modala edycji
  const [editModalState, setEditModalState] = useState({
    isOpen: false,
    flashcard: null as FlashcardDto | null,
    isSubmitting: false,
  });
  
  // Stan dla dialogu potwierdzenia
  const [confirmDialogState, setConfirmDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    onConfirm: null,
  });
  
  // Stan dla notyfikacji
  const [toast, setToast] = useState({
    isVisible: false,
    message: "",
    type: 'success' as 'success' | 'error' | 'info',
  });
  
  // Funkcja obsługująca zmianę sortowania
  const handleSortChange = useCallback((newSort: FlashcardsSortModel) => {
    setSort(newSort);
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset do pierwszej strony po zmianie sortowania
  }, []);
  
  const handleItemsPerPageChange = useCallback((count: number) => {
    setPagination(prev => ({ 
      ...prev, 
      itemsPerPage: count, 
      currentPage: 1 // Reset do pierwszej strony po zmianie liczby elementów
    }));
  }, []);
  
  // Funkcje obsługujące zaznaczanie
  const handleToggleSelect = useCallback((id: string) => {
    setSelectedFlashcards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  }, []);
  
  const handleSelectAll = useCallback((value: boolean) => {
    if (value) {
      const newSelected = flashcards.reduce((acc, flashcard) => {
        acc[flashcard.id] = true;
        return acc;
      }, {} as Record<string, boolean>);
      setSelectedFlashcards(newSelected);
    } else {
      setSelectedFlashcards({});
    }
  }, [flashcards]);
  
  // Funkcje fetczowania danych, zatwierdzania, zaznaczania, edycji, usuwania, itd.
  // ...
  
  return {
    // Stan
    document,
    isLoadingDocument,
    documentError,
    flashcards,
    isLoadingFlashcards,
    flashcardsError,
    pagination,
    sort,
    selectedFlashcards,
    selectedCount,
    allSelected,
    editModalState,
    confirmDialogState,
    toast,
    
    // Funkcje
    handleSortChange,
    handleItemsPerPageChange,
    handleToggleSelect,
    handleSelectAll,
    // inne funkcje...
  };
}
```

Dodatkowo, dla zarządzania stanem odwracania fiszek, zostanie stworzony hook `useFlashcardFlip`:

```typescript
function useFlashcardFlip(initialState = false) {
  const [isFlipped, setIsFlipped] = useState(initialState);
  
  const toggleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);
  
  return {
    isFlipped,
    toggleFlip,
  };
}
```

## 7. Integracja API

### Pobieranie dokumentu
```typescript
async function fetchDocument(id: string): Promise<DocumentDto> {
  const response = await fetch(`/api/documents/${id}`);
  
  if (!response.ok) {
    throw new Error(`Błąd podczas pobierania dokumentu: ${response.statusText}`);
  }
  
  return await response.json();
}
```

### Pobieranie niezatwierdzonych fiszek
```typescript
async function fetchUnapprovedFlashcards(
  documentId: string, 
  page: number, 
  limit: number,
  sort: FlashcardsSortModel
): Promise<FlashcardsListResponseDto> {
  const params = new URLSearchParams({
    document_id: documentId,
    source: 'ai',
    is_approved: 'false',
    is_disabled: 'false',
    page: page.toString(),
    limit: limit.toString(),
    sort: sort.sortBy,
    direction: sort.sortOrder,
  });
  
  const response = await fetch(`/api/flashcards?${params.toString()}`);
  
  if (!response.ok) {
    throw new Error(`Błąd podczas pobierania fiszek: ${response.statusText}`);
  }
  
  return await response.json();
}
```

### Zatwierdzanie pojedynczej fiszki
```typescript
async function approveFlashcard(id: string): Promise<FlashcardDto> {
  const response = await fetch(`/api/flashcards/${id}/approve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Błąd podczas zatwierdzania fiszki: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
}
```

### Masowe zatwierdzanie fiszek
```typescript
async function approveFlashcardsBulk(
  ids: string[]
): Promise<{ approved_count: number, flashcards: FlashcardDto[] }> {
  const response = await fetch('/api/flashcards/approve-bulk', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ flashcard_ids: ids }),
  });
  
  if (!response.ok) {
    throw new Error(`Błąd podczas masowego zatwierdzania fiszek: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
}
```

### Zatwierdzanie wszystkich fiszek dokumentu
```typescript
async function approveFlashcardsByDocument(
  documentId: string
): Promise<{ approved_count: number, flashcards: FlashcardDto[] }> {
  const response = await fetch('/api/flashcards/approve-by-document', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ document_id: documentId }),
  });
  
  if (!response.ok) {
    throw new Error(`Błąd podczas zatwierdzania wszystkich fiszek: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
}
```

### Aktualizacja fiszki
```typescript
async function updateFlashcard(id: string, data: FlashcardUpdateDto): Promise<FlashcardDto> {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    throw new Error(`Błąd podczas aktualizacji fiszki: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.data;
}
```

### Usuwanie fiszki
```typescript
async function deleteFlashcard(id: string): Promise<void> {
  const response = await fetch(`/api/flashcards/${id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  if (!response.ok) {
    throw new Error(`Błąd podczas usuwania fiszki: ${response.statusText}`);
  }
}
```

## 8. Interakcje użytkownika

### Zaznaczanie fiszek
- Kliknięcie checkbox przy fiszce → zmiana stanu zaznaczenia
- Kliknięcie "Zaznacz wszystkie" → zaznaczenie wszystkich fiszek
- Kliknięcie "Zaznacz wszystkie" gdy wszystkie zaznaczone → odznaczenie wszystkich

### Zatwierdzanie fiszek
- Kliknięcie "Zatwierdź" przy fiszce → zatwierdzenie fiszki i aktualizacja UI
- Kliknięcie "Zatwierdź zaznaczone" → otwarcie dialogu potwierdzenia
- Potwierdzenie w dialogu → zatwierdzenie zaznaczonych fiszek i aktualizacja UI
- Kliknięcie "Zatwierdź wszystkie" → otwarcie dialogu potwierdzenia
- Potwierdzenie w dialogu → zatwierdzenie wszystkich fiszek, powiadomienie i przekierowanie do widoku dokumentu

### Usuwanie fiszek
- Kliknięcie "Usuń" przy fiszce → otwarcie dialogu potwierdzenia usunięcia
- Potwierdzenie w dialogu → usunięcie fiszki (soft-delete) i aktualizacja UI

### Edycja fiszek
- Kliknięcie "Edytuj" przy fiszce → otwarcie modalu edycji
- Edycja treści i kliknięcie "Zapisz" → zapisanie zmian, zamknięcie modalu i aktualizacja UI
- Edycja >50% treści i zapisanie → oznaczenie fiszki jako zmodyfikowanej ręcznie
- Kliknięcie "Anuluj" → zamknięcie modalu bez zapisywania zmian

### Przeglądanie fiszek
- Kliknięcie "Odwróć" przy fiszce → odwrócenie fiszki (pokazanie drugiej strony)
- Ponowne kliknięcie "Odwróć" → powrót do pierwszej strony

### Sortowanie i filtrowanie
- Zmiana opcji w selektorze sortowania (Front fiszki/Data utworzenia/Data modyfikacji) → zastosowanie nowego sortowania i odświeżenie listy
- Zmiana kierunku sortowania (Rosnąco/Malejąco) → zastosowanie nowego kierunku i odświeżenie listy
- Zmiana liczby fiszek na stronie → zastosowanie nowej wartości i odświeżenie listy

### Paginacja
- Kliknięcie przycisku strony → przejście na wybraną stronę i odświeżenie listy fiszek

### Nawigacja
- Kliknięcie przycisku powrotu → powrót do widoku dokumentu
- Kliknięcie elementu breadcrumb → nawigacja do wybranego widoku

## 9. Warunki i walidacja

### Zatwierdzanie fiszek
- Przycisk "Zatwierdź zaznaczone" jest aktywny tylko gdy co najmniej jedna fiszka jest zaznaczona
- Przycisk "Zatwierdź wszystkie" jest aktywny tylko gdy istnieje co najmniej jedna niezatwierdzona fiszka
- Przycisk zatwierdzania przy pojedynczej fiszce jest aktywny dla każdej niezatwierdzonej fiszki AI

### Usuwanie fiszek
- Przycisk usuwania przy pojedynczej fiszce jest aktywny dla każdej niezatwierdzonej fiszki AI

### Edycja fiszek
- Pola formularza edycji nie mogą być puste
- Maksymalna długość pola "przód" to 200 znaków
- Maksymalna długość pola "tył" to 500 znaków
- Przycisk "Zapisz" jest aktywny tylko gdy wprowadzono zmiany i spełniono wymagania walidacji

### Paginacja
- Przyciski nawigacji paginacji są aktywne tylko gdy istnieją kolejne/poprzednie strony
- Domyślnie wyświetlanych jest 12 fiszek na stronie, z możliwością zmiany na 24 lub 36

## 10. Obsługa błędów

### Błędy pobierania danych
- Błąd pobierania dokumentu → wyświetlenie komponentu ErrorMessage z przyciskiem ponownej próby
- Błąd pobierania fiszek → wyświetlenie komponentu ErrorMessage z przyciskiem ponownej próby

### Błędy zatwierdzania
- Błąd zatwierdzania pojedynczej fiszki → wyświetlenie komunikatu błędu, pozostawienie fiszki na liście
- Błąd masowego zatwierdzania → wyświetlenie komunikatu błędu z informacją o liczbie niezatwierdzonych fiszek
- Błąd zatwierdzania wszystkich fiszek → wyświetlenie komunikatu błędu, pozostawienie wszystkich fiszek na liście

### Błędy usuwania
- Błąd usuwania pojedynczej fiszki → wyświetlenie komunikatu błędu, pozostawienie fiszki na liście

### Błędy edycji
- Błąd aktualizacji fiszki → wyświetlenie komunikatu błędu, pozostawienie modalu otwartego
- Błędy walidacji → wyświetlenie komunikatów przy odpowiednich polach

### Inne błędy
- Brak niezatwierdzonych fiszek → wyświetlenie komponentu EmptyState z informacją "Brak fiszek do zatwierdzenia" i przyciskiem powrotu
- Dokument nie istnieje → wyświetlenie komunikatu błędu z przyciskiem powrotu do listy dokumentów

## 11. Kroki implementacji

1. Utworzenie podstawowej struktury widoku FlashcardsApprovalView
   - Zdefiniowanie komponentu z podstawowymi elementami
   - Dodanie routingu w głównym pliku Astro

2. Implementacja hooka useFlashcardsApproval
   - Dodanie stanu dla dokumentu, fiszek, zaznaczenia, sortowania, paginacji itp.
   - Implementacja funkcji pobierania danych
   - Implementacja funkcji zatwierdzania, zaznaczania, edycji, usuwania

3. Implementacja komponentów stanu
   - LoadingIndicator
   - ErrorMessage
   - EmptyState

4. Implementacja komponentu DocumentHeader
   - Wykorzystanie istniejącego komponentu z odpowiednimi propsami
   - Dodanie breadcrumbów, tytułu dokumentu, fragmentu treści i przycisku powrotu

5. Implementacja komponentu BulkActionsBar
   - Dodanie przycisków akcji zbiorczych (zaznacz wszystkie, zatwierdź zaznaczone, zatwierdź wszystkie)
   - Dodanie licznika zaznaczonych fiszek

6. Integracja istniejącego komponentu FlashcardsSorter
   - Import komponentu z `src/components/flashcards/flashcards-sorter.tsx`
   - Przygotowanie propsów na podstawie stanu w hooku useFlashcardsApproval
   - Konfiguracja dla widoku zatwierdzania fiszek (wyłączenie filtrowania po źródle)
   - Przekazanie wymaganych propsów:
     ```tsx
     <FlashcardsSorter
       currentSort={sort}
       onChange={handleSortChange}
       itemsPerPage={pagination.itemsPerPage}
       onItemsPerPageChange={handleItemsPerPageChange}
       // Opcjonalne propsy sourceFilter i onSourceFilterChange pomijamy, 
       // ponieważ w widoku zatwierdzania mamy tylko fiszki AI
     />
     ```
   - Upewnienie się, że struktura stanu `sort` w hooku `useFlashcardsApproval` jest zgodna z typem `FlashcardsSortModel`

7. Implementacja komponentu FlashcardsList
   - Dodanie listy fiszek z paginacją
   - Integracja z komponentem FlashcardCard

8. Implementacja komponentu FlashcardCard
   - Dodanie checkboxa, kontenerów z treścią fiszki i przycisków akcji (odwróć, zatwierdź, usuń, edytuj)
   - Implementacja logiki odwracania fiszki
   - Dodanie informacji o źródle i datach

9. Implementacja komponentu Pagination
   - Dodanie kontrolek paginacji
   - Połączenie z hookiem useFlashcardsApproval

10. Implementacja komponentu FlashcardEditModal
    - Dodanie formularza z polami edycji
    - Implementacja walidacji
    - Implementacja funkcji zapisywania zmian

11. Implementacja komponentu ConfirmationDialog
    - Dodanie dialogu z tekstem i przyciskami
    - Integracja z akcjami zbiorczymi (zatwierdzanie) i indywidualnymi (usuwanie)

12. Dodanie obsługi powiadomień (Toast)
    - Implementacja wyświetlania powiadomień o sukcesie/błędzie

13. Testowanie i optymalizacja
    - Testowanie wszystkich interakcji użytkownika
    - Optymalizacja renderowania przy dużej liczbie fiszek
    - Testowanie obsługi błędów

14. Implementacja responsive design
    - Dostosowanie układu do różnych rozmiarów ekranu
    - Testowanie na urządzeniach mobilnych 