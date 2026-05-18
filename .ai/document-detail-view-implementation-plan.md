# Plan implementacji widoku DocumentDetailView

## 1. Przegląd
Widok `DocumentDetailView` służy do prezentacji szczegółowych informacji o wybranym dokumencie oraz zarządzania powiązanymi z nim fiszkami. Umożliwia przeglądanie zatwierdzonych fiszek (zarówno wygenerowanych przez AI, jak i dodanych ręcznie), ich edycję, usuwanie oraz dodawanie nowych fiszek manualnie. Widok zawiera również opcje edycji, usunięcia samego dokumentu oraz inicjowania ponownego generowania fiszek przez AI. Dodatkowo, informuje o liczbie niezatwierdzonych fiszek AI i udostępnia link do dedykowanego widoku ich akceptacji.
Podczas tworzenia elementów widoku z jego użyciem zaleca się używać notacji kebab-case w nazwach plików i notacji PascalCase do nazw komponentów, hooków itp w tych plikach.

## 2. Routing widoku
Widok powinien być dostępny pod dynamiczną ścieżką:
`/documents/:id`
gdzie `:id` jest unikalnym identyfikatorem (UUID) dokumentu.

## 3. Struktura komponentów

```
DocumentDetailView (Kontener React renderowany przez stronę Astro)
  ├── LoadingIndicator (Wyświetlany podczas ładowania danych dokumentu lub fiszek)
  ├── ErrorMessage (Wyświetlany w przypadku błędu ładowania danych)
  ├── DocumentHeader
  │   ├── Breadcrumbs
  │   │   ├── Link (Tematy)
  │   │   ├── Link (Tytuł wybranego tematu)
  │   │   └── Text (Tytuł wybranego dokumentu)
  │   ├── Tytuł Dokumentu (h1)
  │   ├── Fragment Treści Dokumentu (p)
  │   ├── Link do FlashcardsApprovalView (warunkowo, z liczbą niezatwierdzonych fiszek)
  │   ├── Button (Edytuj Dokument) -> Przekierowanie
  │   ├── Button (Usuń Dokument) -> Otwiera ConfirmationDialog
  │   ├── Button (Ponownie Generuj Fiszki AI) -> Otwiera ConfirmationDialog
  ├── Button (Dodaj Fiszkę Ręcznie) -> Otwiera AddFlashcardModal
  ├── FlashcardsSorter
  │   ├── Select (Sortuj wg: A-Z, Typ fiszki: AI/manualna)
  │   ├── Select (Kierunek sortowania)
  ├── FlashcardsList
  │   ├── LoadingIndicator (Skeleton dla fiszek, widoczny podczas ladowania)
  │   ├── EmptyState (jeśli brak fiszek po zastosowaniu sortowania)
  │   └── FlashcardCard[] (mapowanie po liście fiszek)
  │       ├── Div (Kontener karty z logiką odwracania)
  │       │   ├── Div (Przód fiszki)
  │       │   └── Div (Tył fiszki)
  │       ├── Badge (Źródło: AI/Manualne)
  │       ├── Button (Odwróć)
  │       ├── Button (Edytuj) -> Otwiera EditFlashcardModal
  │       ├── Button (Usuń) -> Otwiera ConfirmationDialog (dla fiszki)
  ├── Pagination (widoczny gdy jest wiele fiszek)
  ├── AddFlashcardModal (React Modal/Shadcn Dialog)
  │   ├── FlashcardForm (komponent formularza)
  ├── EditFlashcardModal (React Modal/Shadcn Dialog)
  │   ├── FlashcardForm (komponent formularza z inicjalnymi danymi)
  └── ConfirmationDialog (React Modal/Shadcn AlertDialog)
```

## 4. Szczegóły komponentów

### `Breadcrumbs` (React)
- **Opis:** Komponent nawigacyjny wyświetlający hierarchiczną ścieżkę do aktualnego dokumentu. Umożliwia szybką nawigację do widoku listy tematów lub szczegółów tematu nadrzędnego.
- **Główne elementy:** 
    - Link "Tematy" (`/topics`)
    - Link do tematu nadrzędnego (`/topics/:topicId`)
    - Tekst aktualnego dokumentu (nieaktywny)
    - Separatory między elementami (np. "/")
- **Obsługiwane interakcje:** 
    - Kliknięcie linku "Tematy" - przekierowanie do listy tematów
    - Kliknięcie linku tematu - przekierowanie do szczegółów tematu
- **Obsługiwana walidacja:** Brak.
- **Typy:** 
    - `BreadcrumbItem: { id: string; name: string; href: string; }`
- **Propsy:**
    - `items: BreadcrumbItem[]`
    - `currentDocumentTitle: string`

### `DocumentDetailView` (Kontener Główny - React)
- **Opis:** Główny komponent React dla strony `/documents/:id`. Odpowiedzialny za pobranie ID dokumentu, zarządzanie stanem za pomocą hooka `useDocumentDetail`, pobieranie danych dokumentu i fiszek oraz renderowanie podkomponentów.
- **Główne elementy:** Komponenty `DocumentHeader`, `FlashcardFilters`, `FlashcardList`, `PaginationControls`, przycisk "Dodaj Fiszkę Ręcznie", modale (`AddFlashcardModal`, `EditFlashcardModal`, `ConfirmationDialog`), wskaźniki ładowania i błędu.
- **Obsługiwane interakcje:** Brak bezpośrednich, deleguje logikę do hooka i podkomponentów.
- **Obsługiwana walidacja:** Sprawdza poprawność ID dokumentu pobranego z URL (delegowane do logiki Astro/middleware).
- **Typy:** `DocumentDetailViewModel`, `FlashcardListViewModel` (zarządzane przez hooka).
- **Propsy:** `documentId: string` (przekazany ze strony Astro).

### `DocumentHeader` (React)
- **Opis:** Wyświetla nagłówek strony ze szczegółami dokumentu i głównymi akcjami dla dokumentu.
- **Główne elementy:**  (tytuł),  (fragment treści), (link do akceptacji niezatwierdzonych fiszek AI - jeśli istnieją), `Button` (Edytuj, Usuń, Regeneruj).
- **Obsługiwane interakcje:** Kliknięcie przycisków "Edytuj Dokument", "Usuń Dokument", "Ponownie Generuj Fiszki AI". Kliknięcie linku do akceptacji fiszek AI.
- **Obsługiwana walidacja:**
    - Link do akceptacji widoczny tylko jeśli `unapprovedAiFlashcardsCount > 0`.
    - Kliknięcie "Usuń" i "Ponownie Generuj" otwiera modal potwierdzenia.
- **Typy:** `DocumentDto`, `number` (unapprovedAiFlashcardsCount).
- **Propsy:**
    - `document: DocumentDto | null`
    - `unapprovedCount: number`
    - `onEdit: () => void`
    - `onDelete: () => void`
    - `onRegenerate: () => void`
    - `isLoading: boolean`

### `FlashcardsSorter` (React)
- **Opis:** Kontrolka umożliwiająca sortowanie listy fiszek na poziomie API.
- **Główne elementy:** 
  - Select (Sortuj wg: A-Z, Typ fiszki: AI/manualna)
  - Select (Kierunek sortowania)
  - Select (Liczba fiszek na stronę: 12, 24, 36)
- **Obsługiwane interakcje:** 
  - Zmiana kryterium sortowania, zmiana kierunku sortowania.
  - Zmiana liczby fiszek na stronę powoduje zresetowanie paginacji i przeładowanie danych.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `FlashcardsSortModel`.
- **Propsy:**
    - `currentSort: FlashcardsSortModel`
    - `onChange: (sort: FlashcardsSortModel) => void`
    - `itemsPerPage: number`
    - `onItemsPerPageChange: (value: number) => void`

### `FlashcardsList` (React)
- **Opis:** Renderuje listę fiszek lub stan ładowania/pusty.
- **Główne elementy:** `LoadingIndicator` (np. `Skeleton` z Shadcn/ui), `EmptyState`, lista komponentów `FlashcardCard`.
- **Obsługiwane interakcje:** Brak bezpośrednich, deleguje do `FlashcardCard`.
- **Obsługiwana walidacja:** Wyświetla odpowiedni stan (ładowanie, pusty, lista).
- **Typy:** `FlashcardDto[]`.
- **Propsy:**
    - `flashcards: FlashcardDto[]`
    - `isLoading: boolean`
    - `onEditFlashcard: (flashcard: FlashcardDto) => void`
    - `onDeleteFlashcard: (flashcardId: string) => void`

### `FlashcardCard` (React)
- **Opis:** Reprezentuje pojedynczą fiszkę na liście, z możliwością odwracania i akcjami.
- **Główne elementy:** Kontener Card (Shadcn/ui) z logiką CSS do odwracania, `div` dla przodu, `div` dla tyłu, `Badge` (Shadcn/ui) dla źródła, `Button` (Odwróć, Edytuj, Usuń).
- **Obsługiwane interakcje:** Kliknięcie "Odwróć", "Edytuj", "Usuń".
- **Obsługiwana walidacja:** Przycisk "Usuń" otwiera modal potwierdzenia.
- **Typy:** `FlashcardDto`.
- **Propsy:**
    - `flashcard: FlashcardDto`
    - `onEdit: (flashcard: FlashcardDto) => void`
    - `onDelete: (flashcardId: string) => void`

### `Pagination` (React)
- **Opis:** Komponenty paginacji z shadcn/ui do nawigacji między stronami fiszek.
- **Główne elementy:** Przyciski Poprzednia/Następna, numery stron, wielokropek dla dużej liczby stron.
- **Obsługiwane interakcje:** Kliknięcie numeru strony, kliknięcie Poprzednia/Następna.
- **Obsługiwana walidacja:** Brak.
- **Typy:** `PaginationModel`.
- **Propsy:** 
    - `currentPage: number`
    - `totalPages: number`
    - `onPageChange: (page: number) => void`

### `AddFlashcardModal` / `EditFlashcardModal` (React)
- **Opis:** Modale (dialogi Shadcn/ui) zawierające formularz do tworzenia/edycji fiszki.
- **Główne elementy:** `Dialog` (Shadcn/ui), `FlashcardForm`.
- **Obsługiwane interakcje:** Wysłanie formularza, anulowanie.
- **Obsługiwana walidacja:** Delegowana do `FlashcardForm`.
- **Typy:** `FlashcardCreateDto` (dla Add), `FlashcardUpdateDto` (dla Edit), `FlashcardDto` (dane początkowe dla Edit).
- **Propsy:**
    - `isOpen: boolean`
    - `onClose: () => void`
    - `onSubmit: (data: FlashcardCreateDto | FlashcardUpdateDto) => Promise<void>`
    - `initialData?: FlashcardDto` (tylko dla Edit)
    - `isSubmitting: boolean`

### `FlashcardForm` (React)
- **Opis:** Wewnętrzny komponent formularza używany w modalach dodawania/edycji.
- **Główne elementy:** `form`, `Textarea` (Shadcn/ui) dla przodu, `Textarea` dla tyłu, komunikaty błędów, `Button` (Zapisz, Anuluj).
- **Obsługiwane interakcje:** Wprowadzanie tekstu, wysłanie formularza.
- **Obsługiwana walidacja:** Pola "przód" i "tył" nie mogą być puste. Wyświetla komunikaty błędów.
- **Typy:** `FlashcardFormViewModel`.
- **Propsy:**
    - `initialFront?: string`
    - `initialBack?: string`
    - `onSubmit: (data: { front: string; back: string }) => void`
    - `onCancel: () => void`
    - `isSubmitting: boolean`

### `ConfirmationDialog` (React)
- **Opis:** Generyczny dialog potwierdzający (np. `AlertDialog` z Shadcn/ui).
- **Główne elementy:** Tytuł, opis, przyciski "Potwierdź", "Anuluj".
- **Obsługiwane interakcje:** Kliknięcie przycisków.
- **Obsługiwana walidacja:** Brak.
- **Typy:** Brak specyficznych DTO/ViewModel.
- **Propsy:**
    - `isOpen: boolean`
    - `title: string`
    - `description: string`
    - `confirmText?: string`
    - `onConfirm: () => void`
    - `onCancel: () => void`

## 5. Typy

- **Istniejące (z `src/types.ts`):**
    - `DocumentDto`: Używane do wyświetlania danych dokumentu.
    - `FlashcardDto`: Używane do wyświetlania danych fiszek, edycji.
    - `FlashcardsListResponseDto`: Typ odpowiedzi dla listy fiszek.
    - `PaginationDto`: Typ danych paginacji.
    - `FlashcardCreateDto`: Używane jako payload do tworzenia manualnego (opakowane w `FlashcardsCreateCommand`).
    - `FlashcardUpdateDto`: Używane jako payload do aktualizacji fiszki.
    - `FlashcardSource`: `'ai' | 'manual'`.

- **Nowe Typy ViewModel:**
    - `BreadcrumbItem`:
        - `id: string`
        - `name: string`
        - `href: string`
    - `DocumentDetailViewModel`:
        - `document: DocumentDto | null`
        - `isLoadingDocument: boolean`
        - `documentError: string | null`
        - `unapprovedAiFlashcardsCount: number`
    - `FlashcardsListViewModel`:
        - `flashcards: FlashcardDto[]`
        - `pagination: PaginationDto | null`
        - `isLoadingFlashcards: boolean`
        - `flashcardsError: string | null`
        - `currentPage: number`
        - `currentSort: FlashcardsSortModel`
    - `FlashcardFormViewModel`:
        - `front: string`
        - `back: string`
        - `errors: { front?: string; back?: string }`
        - `isSubmitting: boolean`
    - `ConfirmDialogState`:
        - `isOpen: boolean`
        - `title: string`
        - `description: string`
        - `confirmText?: string`
        - `onConfirm: (() => void) | null`
    - `FlashcardsSortModel`:
        - `sortBy: "front" | "created_at" | "updated_at" | "source"`
        - `sortOrder: "asc" | "desc"`

## 6. Zarządzanie stanem

### Hook useDocumentDetail
```typescript
function useDocumentDetail(id: string) {
  const [document, setDocument] = useState<DocumentDetailViewModel | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [unapprovedAiFlashcardsCount, setUnapprovedAiFlashcardsCount] = useState(0);
  
  // Logika pobierania danych dokumentu i liczby niezatwierdzonych fiszek AI
  // Obsługa edycji, usuwania dokumentu i regeneracji fiszek
  
  return { 
    document, 
    isLoading, 
    error, 
    unapprovedAiFlashcardsCount,
    actions: {
      editDocument,
      deleteDocument,
      regenerateFlashcards
    },
    refetch 
  };
}
```

### Hook useFlashcardsList
  -**Opis**: Hook umożliwia dynamiczne ustawienie liczby fiszek na stronę. Wartość `itemsPerPage` jest synchronizowana ze stanem `pagination` i wykorzystywana przy pobieraniu danych z API.
```typescript
function useFlashcardsList(documentId: string, sort: FlashcardsSortModel) {
  const [itemsPerPage, setItemsPerPage] = useState(24);
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const availablePerPage = [12, 24, 36];
  const [pagination, setPagination] = useState<PaginationModel>({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 24, // dopasowane do itemsPerPage powyżej
    availablePerPage
  });
  
  useEffect(() => {
  setPagination((prev) => ({
    ...prev,
    currentPage: 1, // resetuj na pierwszą stronę
    itemsPerPage
  }));
}, [itemsPerPage]);
  // Logika pobierania listy fiszek z uwzględnieniem sortowania i paginacji
  // Sortowanie jest realizowane na poziomie API, a nie na froncie
  // Obsługa CRUD dla fiszek (dodawanie, edycja, usuwanie)
  
  return {
    flashcards,
    total,
    isLoading,
    error,
    pagination,
    actions: {
        addFlashcard,
        editFlashcard,
        deleteFlashcard,
        setPage,
        setItemsPerPage, // <--- nowa funkcja
        setSort
    },
    refetch
  };
}
```

### Hook useFlashcardForm
```typescript
function useFlashcardForm(initialData?: FlashcardDto) {
  const [formData, setFormData] = useState<FlashcardFormViewModel>({
    front: initialData?.front || '',
    back: initialData?.back || '',
    errors: {},
    isSubmitting: false
  });
  
  // Logika walidacji i obsługi formularza
  // Obsługa submitu i resetowania formularza
  
  return {
    formData,
    actions: {
      updateField,
      validateForm,
      submitForm,
      resetForm
    }
  };
}
```

### Hook useConfirmDialog
```typescript
function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: '',
    description: '',
    confirmText: undefined,
    onConfirm: null
  });
  
  // Logika zarządzania stanem modalu potwierdzenia
  
  return {
    dialogState,
    actions: {
      openDialog,
      closeDialog,
      confirm
    }
  };
}
```

Hooki te współpracują ze sobą w następujący sposób:
1. `useDocumentDetail` zarządza głównym stanem dokumentu i jego operacjami
2. `useFlashcardsList` obsługuje listę fiszek, paginację i sortowanie
3. `useFlashcardForm` obsługuje formularz dodawania/edycji fiszki
4. `useConfirmDialog` zarządza stanem modali potwierdzenia dla operacji usuwania

Każdy hook zwraca:
- Aktualny stan
- Obiekt `actions` z metodami do manipulacji stanem
- Funkcję `refetch` do odświeżania danych (gdzie ma to zastosowanie)

## 7. Integracja API

- **Pobranie Dokumentu:**
    - Endpoint: `GET /api/documents/{id}`
    - Żądanie: Brak payloadu.
    - Odpowiedź: `DocumentDto` (lub rozszerzony typ z `unapprovedAiFlashcardsCount`).
- **Pobranie Liczby Niezatwierdzonych Fiszek AI (jeśli nie ma w `DocumentDto`):**
    - Endpoint: `GET /api/flashcards`
    - Żądanie: Query params: `document_id={id}&is_approved=false&source=ai&limit=0`.
    - Odpowiedź: `FlashcardsListResponseDto` (interesuje nas tylko pole `total`).
- **Pobranie Listy Fiszek:**
    - Endpoint: `GET /api/flashcards`
    - Żądanie: Query params: `document_id={id}`, `page`, `limit`, `sort` (np. `front_modified_asc`), `source` (jeśli nie 'all'), `is_approved=true`, `is_disabled=false`.
    - Odpowiedź: `FlashcardsListResponseDto`.
- **Dodanie Fiszki Manualnej:**
    - Endpoint: `POST /api/flashcards`
    - Żądanie: `{ flashcards: [FlashcardCreateDto] }`, gdzie `FlashcardCreateDto` ma `source: 'manual'`, `is_approved: true`, `document_id`.
    - Odpowiedź: Status 201, `{ message: string }`.
- **Edycja Fiszki:**
    - Endpoint: `PUT /api/flashcards/{flashcardId}`
    - Żądanie: `FlashcardUpdateDto`.
    - Odpowiedź: Status 200, `{ message: string, data: FlashcardDto }`.
- **Usunięcie Fiszki:**
    - Endpoint: `DELETE /api/flashcards/{flashcardId}`
    - Żądanie: Brak payloadu.
    - Odpowiedź: Status 200, `{ message: string }`.
- **Usunięcie Dokumentu:**
    - Endpoint: `DELETE /api/documents/{id}`
    - Żądanie: Brak payloadu.
    - Odpowiedź: Status 200, `{ message: string }`.
- **Ponowne Generowanie Fiszek AI:**
    - Endpoint: `POST /api/flashcards/ai-generate`
    - Żądanie: `{ document_id: string; content: string; regenerate: true }`
    - Typ odpowiedzi: `{ message: string; data: { document_id: string; flashcards_count: number } }`
    - Użycie: Inicjowanie procesu ponownej generacji fiszek AI dla dokumentu
    - Uwagi: 
        - Endpoint wymaga nagłówka `Content-Type: application/json`
        - Po pomyślnym wygenerowaniu fiszek, należy przekierować użytkownika do widoku akceptacji fiszek
        - W przypadku błędów, wyświetlić odpowiedni komunikat w UI

## 8. Interakcje użytkownika

- **Ładowanie widoku:** Użytkownik widzi wskaźniki ładowania dla nagłówka i listy fiszek (skeleton?).
- **Wyświetlenie danych:** Po załadowaniu użytkownik widzi nagłówek dokumentu i pierwszą stronę listy fiszek.
- **Nawigacja (Paginacja):** Kliknięcie "Następna"/"Poprzednia" ładuje odpowiednią stronę fiszek.
- **Sortowanie:** Wybór opcji sortowania odświeża listę fiszek zgodnie z wybranymi kryteriami (A-Z, data utworzenia, data modyfikacji, typ fiszki).
- **Odwracanie fiszki:** Kliknięcie "Odwróć" na `FlashcardCard` pokazuje drugą stronę fiszki.
- **Dodawanie fiszki:** Kliknięcie "Dodaj Fiszkę Ręcznie" otwiera `AddFlashcardModal`. Wypełnienie i wysłanie formularza dodaje fiszkę i odświeża listę.
- **Edycja fiszki:** Kliknięcie "Edytuj" na `FlashcardCard` otwiera `EditFlashcardModal` z danymi fiszki. Wysłanie formularza aktualizuje fiszkę i odświeża listę.
- **Usuwanie fiszki:** Kliknięcie "Usuń" na `FlashcardCard` otwiera `ConfirmationDialog`. Potwierdzenie usuwa fiszkę i odświeża listę.
- **Edycja dokumentu:** Kliknięcie "Edytuj Dokument" przekierowuje do widoku edycji.
- **Usuwanie dokumentu:** Kliknięcie "Usuń Dokument" otwiera `ConfirmationDialog`. Potwierdzenie usuwa dokument i fiszki i przekierowuje użytkownika do nadrzędnego tematu.
- **Regeneracja fiszek AI:** Kliknięcie "Ponownie Generuj..." otwiera `ConfirmationDialog`. Potwierdzenie inicjuje proces w backendzie, wyświetla powiadomienie i aktualizuje licznik niezatwierdzonych fiszek.

## 9. Warunki i walidacja

- **ID Dokumentu w URL:** Musi być poprawnym UUID (walidacja na poziomie routingu Astro).
- **Formularz Dodawania/Edycji Fiszki:**
    - Pola "Przód" i "Tył" nie mogą być puste. P{rzód nie może być dłuższy niż 200 znaków, a tył niż 500 znaków.} Walidacja w komponencie `FlashcardForm` przed wysłaniem. Wyświetlanie komunikatów o błędach przy polach. Przycisk "Zapisz" jest nieaktywny, jeśli formularz jest nieprawidłowy lub trwa wysyłanie.
- **Paginacja:** Przyciski "Poprzednia"/"Następna" są nieaktywne, jeśli użytkownik jest odpowiednio na pierwszej/ostatniej stronie (`currentPage === 1` lub `currentPage * limit >= total`).
- **Link do Akceptacji AI:** Wyświetlany tylko jeśli `unapprovedAiFlashcardsCount > 0`.
- **Potwierdzenia:** Operacje usuwania (dokumentu, fiszki) oraz regeneracji AI wymagają potwierdzenia w `ConfirmationDialog` przed wywołaniem API.

## 10. Obsługa błędów

- **Błędy ładowania danych (Dokument/Fiszki):** Wyświetlanie komunikatu o błędzie w miejscu danych (`ErrorMessage`). Możliwość dodania przycisku "Spróbuj ponownie".
- **Błędy API podczas akcji (Dodaj/Edytuj/Usuń/Regeneruj):**
    - Wyświetlanie komunikatów o błędach za pomocą komponentu `Sonner` (Shadcn/ui) lub `Alert` (Shadcn/ui).
    - W przypadku błędów walidacji (400) w modalach, błędy powinny być wyświetlane przy odpowiednich polach formularza.
- **Nie znaleziono dokumentu (404):** Wyświetlenie dedykowanej strony błędu 404 lub komunikatu w komponencie głównym.
- **Błędy sieciowe:** Globalna obsługa lub specyficzna w hooku `useDocumentDetail`, informująca użytkownika o problemie z połączeniem.
- **Logowanie błędów:** Wszystkie nieoczekiwane błędy powinny być logowane po stronie frontendu (np. do konsoli lub systemu monitoringu) dla celów debugowania.

## 11. Testowanie

- **Weryfikacja wszystkich ścieżek użytkownika:**
  - Ścieżka podstawowa: przeglądanie fiszek, sortowanie, paginacja
  - Ścieżka CRUD fiszek: dodawanie, edycja, usuwanie
  - Ścieżka zarządzania dokumentem: edycja, usuwanie, regeneracja AI
  - Ścieżka obsługi błędów: brak połączenia, błędy API, nieistniejące zasoby
- **Weryfikacja obsługi błędów:**
  - Testowanie wszystkich scenariuszy błędów API
  - Testowanie komunikatów błędów
  - Testowanie mechanizmów retry
- **Weryfikacja wydajności:**
  - Testowanie przy dużej liczbie fiszek (>100)
  - Testowanie responsywności UI podczas ładowania danych
  - Testowanie wydajności sortowania i filtrowania
- **Testowanie na różnych urządzeniach i rozmiarach ekranu:**
  - Desktop (>= 1024px)
  - Tablet (>= 768px i < 1024px)
  - Mobile (< 768px)
- **Testowanie dostępności:**
  - Nawigacja klawiaturą
  - Zgodność z czytnikami ekranowymi
  - Kontrast kolorów i czytelność tekstu

## 12. Kroki implementacji

1. Utworzenie podstawowej struktury widoku DocumentDetailView
   - Zdefiniowanie ścieżki routingu
   - Implementacja wstępnej struktury komponentu
   - Podczas tworzenia elementów widoku zaleca się używać notacji kebab-case w nazwach plików i notacji PascalCase do nazw komponentów, hooków itp. w tych plikach
   - Przykłady nazewnictwa:
     - Pliki: `document-detail-view.tsx`, `document-header.tsx`, `flashcard-card.tsx`
     - Komponenty: `DocumentDetailView`, `DocumentHeader`, `FlashcardCard`
     - Hooki: `useDocumentDetail`, `useFlashcardsList`

2. Implementacja modeli i typów danych
   - Zdefiniowanie typów ViewModel
   - Implementacja mapperów do konwersji typów API na typy ViewModel
   - Implementacja `FlashcardsSortModel` i powiązanych typów

3. Implementacja hooków zarządzania stanem
   - useDocumentDetail
   - useFlashcardsList z obsługą paginacji i sortowania na poziomie API
   - useFlashcardForm
   - useConfirmDialog

4. Implementacja komponentów podrzędnych
   - DocumentHeader z Breadcrumbs
   - FlashcardsList z dokumentami i sorterem API
   - Pagination z shadcn/ui
   - FlashcardCard
   - FlashcardsSorter
   - EmptyState
   - ConfirmationDialog

5. Integracja z API
   - Pobieranie szczegółów dokumentu
   - Pobieranie listy fiszek z paginacją i sortowaniem po stronie API
   - Obsługa usuwania dokumentu i fiszek
   - Obsługa generowania fiszek AI

6. Implementacja nawigacji
   - Przekierowanie do widoku edycji przy edycji dokumentu
   - Przekierowanie do widoku akceptacji przy generowaniu fiszek AI
   - Przekierowanie do tematu przy usunięciu dokumentu

7. Implementacja obsługi błędów
   - Komunikaty błędów API
   - Obsługa nieistniejących zasobów
   - Obsługa problemów z połączeniem

8. Implementacja responsywności
   - Układy dla desktop, tablet i mobilny
   - Media queries dla różnych rozmiarów ekranu
   - Dostosowanie modali dla urządzeń mobilnych

9. Optymalizacja wydajności
   - Implementacja wirtualizowanej listy dla dużej ilości fiszek
   - Memoizacja komponentów
   - Optymalizacja ponownego renderowania

10. Testowanie
    - Weryfikacja wszystkich ścieżek użytkownika:
      - Ścieżka podstawowa: przeglądanie fiszek, sortowanie, paginacja
      - Ścieżka CRUD fiszek: dodawanie, edycja, usuwanie
      - Ścieżka zarządzania dokumentem: edycja, usuwanie, regeneracja AI
      - Ścieżka obsługi błędów: brak połączenia, błędy API, nieistniejące zasoby
    - Weryfikacja obsługi błędów:
      - Testowanie wszystkich scenariuszy błędów API
      - Testowanie komunikatów błędów
      - Testowanie mechanizmów retry
    - Weryfikacja wydajności:
      - Testowanie przy dużej liczbie fiszek (>100)
      - Testowanie responsywności UI podczas ładowania danych
      - Testowanie wydajności sortowania i filtrowania
    - Testowanie na różnych urządzeniach i rozmiarach ekranu:
      - Desktop (>= 1024px)
      - Tablet (>= 768px i < 1024px)
      - Mobile (< 768px)
    - Testowanie dostępności:
      - Nawigacja klawiaturą
      - Zgodność z czytnikami ekranowymi
      - Kontrast kolorów i czytelność tekstu

11. Responsywność

### Desktop (>= 1024px)
- Układ dwukolumnowy
- Nagłówek dokumentu zajmuje pełną szerokość
- Lista fiszek wyświetlana w siatce 3x3
- Modalne okna zajmują 50% szerokości ekranu
- Pełne menu opcji w nagłówku

### Tablet (>= 768px i < 1024px)
- Układ jednokolumnowy
- Nagłówek dokumentu zajmuje pełną szerokość
- Lista fiszek wyświetlana w siatce 2x2
- Modalne okna zajmują 70% szerokości ekranu
- Zwinięte menu opcji w nagłówku z rozwijanym menu

### Mobile (< 768px)
- Układ jednokolumnowy
- Nagłówek dokumentu zajmuje pełną szerokość, z mniejszym rozmiarem czcionki
- Lista fiszek wyświetlana w układzie 1x1
- Modalne okna zajmują 90% szerokości ekranu
- Menu opcji w formie przycisku z ikoną hamburger menu

## 13. Kroki implementacji

1. Utworzenie podstawowej struktury widoku DocumentDetailView
   - Zdefiniowanie ścieżki routingu
   - Implementacja wstępnej struktury komponentu
   - Podczas tworzenia elementów widoku zaleca się używać notacji kebab-case w nazwach plików i notacji PascalCase do nazw komponentów, hooków itp. w tych plikach
   - Przykłady nazewnictwa:
     - Pliki: `document-detail-view.tsx`, `document-header.tsx`, `flashcard-card.tsx`
     - Komponenty: `DocumentDetailView`, `DocumentHeader`, `FlashcardCard`
     - Hooki: `useDocumentDetail`, `useFlashcardsList`

2. Implementacja modeli i typów danych
   - Zdefiniowanie typów ViewModel
   - Implementacja mapperów do konwersji typów API na typy ViewModel
   - Implementacja `FlashcardsSortModel` i powiązanych typów

3. Implementacja hooków zarządzania stanem
   - useDocumentDetail
   - useFlashcardsList z obsługą paginacji i sortowania na poziomie API
   - useFlashcardForm
   - useConfirmDialog

4. Implementacja komponentów podrzędnych
   - DocumentHeader z Breadcrumbs
   - FlashcardsList z dokumentami i sorterem API
   - Pagination z shadcn/ui
   - FlashcardCard
   - FlashcardsSorter
   - EmptyState
   - ConfirmationDialog

5. Integracja z API
   - Pobieranie szczegółów dokumentu
   - Pobieranie listy fiszek z paginacją i sortowaniem po stronie API
   - Obsługa usuwania dokumentu i fiszek
   - Obsługa generowania fiszek AI

6. Implementacja nawigacji
   - Przekierowanie do widoku edycji przy edycji dokumentu
   - Przekierowanie do widoku akceptacji przy generowaniu fiszek AI
   - Przekierowanie do tematu przy usunięciu dokumentu

7. Implementacja obsługi błędów
   - Komunikaty błędów API
   - Obsługa nieistniejących zasobów
   - Obsługa problemów z połączeniem

8. Implementacja responsywności
   - Układy dla desktop, tablet i mobilny
   - Media queries dla różnych rozmiarów ekranu
   - Dostosowanie modali dla urządzeń mobilnych

9. Optymalizacja wydajności
   - Implementacja wirtualizowanej listy dla dużej ilości fiszek
   - Memoizacja komponentów
   - Optymalizacja ponownego renderowania