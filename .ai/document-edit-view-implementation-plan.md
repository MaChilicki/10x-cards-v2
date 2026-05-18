#Plan implementacji widoku DocumentEditView

## 1. Przegląd
DocumentEditView to widok umożliwiający tworzenie nowego dokumentu lub edycję istniejącego. Użytkownik może wprowadzić tytuł i treść dokumentu i zapisać zmiany. Widok obsługuje walidację danych, ostrzega przed utratą niezapisanych zmian oraz informuje o konsekwencjach ponownego generowania fiszek. Po zapisaniu nowego dokumentu następuje automatyczne generowanie fiszek AI i przekierowanie do widoku FlashcardsApprovalView. W przypadku edycji istniejącego dokumentu system pyta użytkownika, czy chce wygenerować nowe fiszki, z odpowiednim ostrzeżeniem o usunięciu istniejących fiszek AI.

> **UWAGA: Funkcjonalność regenerowania fiszek powinna być na razie zamarkowana (oznaczona jako niedostępna), ponieważ endpoint do regeneracji fiszek nie jest jeszcze gotowy.**

## 2. Routing widoku
- `/documents/:id/edit` - edycja istniejącego dokumentu
- `/topics/:id/documents/new` - tworzenie nowego dokumentu w ramach tematu

## 3. Struktura komponentów
```
DocumentEditView
├── Breadcrumbs
├── DocumentEditForm
│   ├── TitleInput
│   ├── ContentTextarea
│   │   └── CharacterCounter
│   └── ValidationMessage
├── SubmitButtonGroup
├── NavigationPrompt (warunkowy)
└── FlashcardsRegenerationDialog (warunkowy)
```

## 4. Szczegóły komponentów
### DocumentEditView
- Opis komponentu: Główny kontener widoku, zarządza stanem dokumentu, pobiera dane istniejącego dokumentu lub inicjalizuje nowy, obsługuje zapisywanie i generowanie fiszek, a następnie widok ich akceptacji.
- Główne elementy: Breadcrumbs, DocumentEditForm, komponenty modalne (NavigationPrompt, RegenerationWarningDialog, FlashcardsRegenerationDialog)
- Obsługiwane interakcje: Inicjalizacja formularza, przekazanie callbacków do formularza
- Obsługiwana walidacja: brak (delegowana do DocumentEditForm)
- Typy: DocumentViewModel, FormContextType
- Propsy: 
  ```typescript
  {
    documentId?: string; // ID dokumentu przy edycji
    topicId?: string;    // ID tematu przy tworzeniu nowego dokumentu
    referrer?: "document_detail"; // Informacja o źródle wywołania
  }
  ```

### DocumentEditForm
- Opis komponentu: Formularz zawierający pola do wprowadzania tytułu i treści dokumentu
- Główne elementy: TitleInput, ContentTextarea, ValidationMessage, SubmitButtonGroup
- Obsługiwane interakcje: onChange dla inputów, onSubmit dla formularza
- Obsługiwana walidacja: 
  - Tytuł: wymagany, maksymalnie 100 znaków
  - Treść: wymagana, między 1000 a 10000 znaków
- Typy: DocumentFormProps, FormValues
- Propsy: 
  ```typescript
  {
    initialValues: FormValues;
    onSubmit: (values: FormValues) => Promise<void>;
    onCancel: () => void;
    onGenerateFlashcards: () => Promise<void>;
    isSaving: boolean;
    isGenerating: boolean;
    errors: Record<string, string>;
    referrer?: string;
  }
  ```

### TitleInput
- Opis komponentu: Pole tekstowe do wprowadzania tytułu dokumentu
- Główne elementy: Input (z shadcn/ui), Label
- Obsługiwane interakcje: onChange, onBlur
- Obsługiwana walidacja: wymagane, maksymalnie 100 znaków
- Typy: proste (string)
- Propsy: 
  ```typescript
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onBlur?: () => void;
    error?: string;
  }
  ```

### ContentTextarea
- Opis komponentu: Obszar tekstowy do wprowadzania treści dokumentu
- Główne elementy: Textarea (z shadcn/ui), Label, CharacterCounter
- Obsługiwane interakcje: onChange, onBlur
- Obsługiwana walidacja: wymagane, między 1000 a 10000 znaków
- Typy: proste (string)
- Propsy: 
  ```typescript
  {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    onBlur?: () => void;
    error?: string;
  } 
  ```

### CharacterCounter
- Opis komponentu: Wyświetla liczbę wprowadzonych znaków oraz informację o limitach
- Główne elementy: Tekst informacyjny
- Obsługiwane interakcje: brak (komponent wyświetlający)
- Obsługiwana walidacja: brak
- Typy: proste (number)
- Propsy: 
  ```typescript
  {
    count: number;
    min: number;
    max: number;
  }
  ```

### SubmitButtonGroup
- Opis komponentu: Grupa przycisków do zapisywania, anulowania i generowania fiszek
- Główne elementy: Button (z shadcn/ui)
- Obsługiwane interakcje: onClick dla każdego przycisku
- Obsługiwana walidacja: brak
- Typy: funkcje callback
- Propsy: 
  ```typescript
  {
    onSave: () => void;
    onCancel: () => void;
    onGenerateFlashcards: () => void;
    isSaving: boolean;
    isGenerating: boolean;
    disableGenerate: boolean;
  }
  ```

### ValidationMessage
- Opis komponentu: Wyświetla komunikaty o błędach walidacji
- Główne elementy: Tekst błędu
- Obsługiwane interakcje: brak (komponent wyświetlający)
- Obsługiwana walidacja: brak
- Typy: proste (string)
- Propsy: 
  ```typescript
  {
    message: string;
  }
  ```

### NavigationPrompt
- Opis komponentu: Dialog wyświetlany przy próbie nawigacji z niezapisanymi zmianami
- Główne elementy: Dialog (z shadcn/ui)
- Obsługiwane interakcje: onConfirm, onCancel
- Obsługiwana walidacja: brak
- Typy: funkcje callback
- Propsy: 
  ```typescript
  {
    isOpen: boolean;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

### FlashcardsRegenerationDialog
- Opis komponentu: Dialog wyświetlany po zapisie edytowanego dokumentu, pytający o generowanie nowych fiszek
- Główne elementy: Dialog (z shadcn/ui), tekst ostrzeżenia o trwałym usunięciu istniejących fiszek AI (jeśli dokument ma fiszki AI)
- Obsługiwane interakcje: onConfirm, onCancel
- Obsługiwana walidacja: brak
- Typy: funkcje callback
- Propsy: 
  ```typescript
  {
    isOpen: boolean;
    hasExistingAIFlashcards: boolean;
    aiFlashcardsCount: number;
    onConfirm: () => void;
    onCancel: () => void;
  }
  ```

### Breadcrumbs
- Opis komponentu: Wyświetla ścieżkę nawigacji do bieżącego widoku
- Główne elementy: Lista linków
- Obsługiwane interakcje: Kliknięcie w element nawigacji
- Obsługiwana walidacja: brak
- Typy: BreadcrumbItem[]
- Propsy: 
  ```typescript
  {
    items: BreadcrumbItem[];
  }
  ```

## 5. Typy
```typescript
// ViewModel dla dokumentu
interface DocumentViewModel {
  id?: string;
  name: string;
  content: string;
  topic_id?: string;
  topic_title?: string;
  isNew: boolean;
  isSaving: boolean;
  isGenerating: boolean;
  errors: Record<string, string>;
  initialContent?: string; // Wartość początkowa treści (do wykrywania zmian)
  ai_flashcards_count?: number; // Liczba fiszek AI w dokumencie
}

// Wartości formularza
interface FormValues {
  name: string;
  content: string;
}

// Propsy dla formularza
interface DocumentFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
  onCancel: () => void;
  onGenerateFlashcards: () => Promise<void>;
  isSaving: boolean;
  isGenerating: boolean;
  errors: Record<string, string>;
  referrer?: string;
}

// Kontekst formularza
interface FormContextType {
  values: FormValues;
  errors: Record<string, string>;
  handleChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isDirty: boolean;
  hasContentChanged: () => boolean;
}

// Element nawigacji
interface BreadcrumbItem {
  id: string;
  name: string;
  href: string;
}
```

## 6. Zarządzanie stanem
Zarządzanie stanem w DocumentEditView odbywa się za pomocą kilku hooków React:

### useDocumentForm
```typescript
const useDocumentForm = (initialValues: FormValues, onSubmit: (values: FormValues) => Promise<void>) => {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialContent, setInitialContent] = useState(initialValues.content);

  // Metody zarządzania formularzem (handleChange, validate, handleSubmit, reset)
  
  // Funkcja sprawdzająca, czy treść dokumentu została zmieniona
  const hasContentChanged = () => values.content !== initialContent;
  
  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset,
    hasContentChanged
  };
};
```

### useDocumentFetch
```typescript
const useDocumentFetch = (id?: string) => {
  const [document, setDocument] = useState<DocumentDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Logika pobierania dokumentu

  return {
    document,
    isLoading,
    error,
    fetchDocument
  };
};
```

### useGenerateFlashcards
```typescript
const useGenerateFlashcards = (documentId?: string, content?: string) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  // Logika generowania fiszek

  return {
    isGenerating,
    error,
    generateFlashcards
  };
};
```

### useFlashcardsRegenerationDialog
```typescript
const useFlashcardsRegenerationDialog = (document?: DocumentDto | null) => {
  const [isOpen, setIsOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<(() => void) | null>(null);
  
  const hasExistingAIFlashcards = !!document?.ai_flashcards_count && document.ai_flashcards_count > 0;
  
  const openDialog = (onConfirm: () => void) => {
    setIsOpen(true);
    setPendingAction(() => onConfirm);
  };
  
  const closeDialog = () => {
    setIsOpen(false);
    setPendingAction(null);
  };
  
  const confirmDialog = () => {
    if (pendingAction) {
      pendingAction();
    }
    closeDialog();
  };
  
  return {
    isOpen,
    hasExistingAIFlashcards,
    aiFlashcardsCount: document?.ai_flashcards_count || 0,
    openDialog,
    closeDialog,
    confirmDialog
  };
};
```

### useNavigationPrompt
```typescript
const useNavigationPrompt = (isDirty: boolean) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<(() => void) | null>(null);

  // Logika obsługi promptu nawigacyjnego

  return {
    showPrompt,
    confirmNavigation,
    cancelNavigation,
    handleNavigation
  };
};
```

## 7. Integracja API
DocumentEditView korzysta z kilku endpointów API:

### 1. Zarządzanie dokumentem
- **Pobieranie dokumentu (edycja)**
  - Endpoint: `GET /api/documents/{id}`
  - Żądanie: brak body
  - Odpowiedź: `DocumentDto`
  - Wywołanie: przy ładowaniu komponentu (jeśli ścieżka zawiera ID dokumentu)

- **Zapisywanie dokumentu**
  - Nowy dokument:
    - Endpoint: `POST /api/documents`
    - Żądanie: `DocumentCreateDto`
    - Odpowiedź: `DocumentDto`
    - Wywołanie: po kliknięciu przycisku "Zapisz zmiany" lub przed generowaniem fiszek
    - Zachowanie: endpoint automatycznie generuje fiszki AI
    - Po zapisaniu: przekierowanie do `/documents/{id}/flashcards/approve`
  - Aktualizacja:
    - Endpoint: `PUT /api/documents/{id}`
    - Żądanie: `DocumentUpdateDto`
    - Odpowiedź: `DocumentDto`
    - Wywołanie: po kliknięciu przycisku "Zapisz zmiany"
    - Po zapisaniu: 
      - Jeśli użytkownik wybierze generowanie fiszek: przekierowanie do `/documents/{id}/flashcards/approve`
      - Jeśli użytkownik nie wybierze generowania fiszek: przekierowanie do `/documents/{id}`

### 2. Ponowne Generowanie fiszek
- Endpoint: `POST /api/flashcards/ai-regenerate`
- Żądanie: 
  ```typescript
  {
    document_id: string;
    force_regenerate?: boolean; // opcjonalne, domyślnie false
  }
  ```
- Odpowiedź: 
  ```typescript
  {
    flashcards: FlashcardDto[];
    disabled_count: number;
  }
  ```
- Wywołanie: 
  - Po zapisie edycji dokumentu i wyborze generowania fiszek
- Zachowanie: endpoint usuwa wszystkie istniejące fiszki AI (zatwierdzone, niezatwierdzone i soft-deleted) poprzez hard-delete i generuje nowe

## 8. Interakcje użytkownika
1. **Wprowadzanie tytułu i treści dokumentu**
   - Aktualizacja stanu formularza
   - Aktualizacja licznika znaków dla treści
   - Walidacja w locie

2. **Zapisywanie dokumentu**
   - Kliknięcie przycisku "Zapisz zmiany"
   - Walidacja formularza
   - Wysłanie danych do API
   - Różne zachowanie zależnie od typu operacji:
     - Dla nowego dokumentu: automatyczne przekierowanie do `/documents/{id}/flashcards/approve` (logika generowania fiszek do nowego dokumentu jest zaimplementowana w endpoincie zapisu fiszki)
     - Dla edycji dokumentu: wyświetlenie dialogu z pytaniem o generowanie nowych fiszek
       - Jeśli dokument ma już fiszki AI: dodanie ostrzeżenia o usunięciu istniejących fiszek w tym samym dialogu
       - Jeśli użytkownik potwierdzi: regeneracja fiszek i przekierowanie do `/documents/{id}/flashcards/approve`
       - Jeśli użytkownik odmówi: przekierowanie do `/documents/{id}`

3. **Anulowanie edycji**
   - Kliknięcie przycisku "Anuluj"
   - Wyświetlenie NavigationPrompt jeśli są niezapisane zmiany
   - Przekierowanie:
     - Dla istniejącego dokumentu (edycja): powrót do widoku szczegółów dokumentu (`/documents/{id}`)
     - Dla nowego dokumentu (dodawanie): powrót do widoku listy dokumentów w temacie (`/topics/{topic_id}`)

4. **Generowanie fiszek**
   - Jeśli dokument ma już fiszki AI: wyświetlenie RegenerationWarningDialog z ostrzeżeniem o trwałym usunięciu istniejących fiszek
   - Zapisanie dokumentu (jeśli nowy lub ma niezapisane zmiany)
   - Wywołanie API regeneracji fiszek, które usuwa wszystkie istniejące fiszki AI (hard-delete) - tylko przy edycji dokumentu.
   - Przekierowanie do `/documents/{id}/flashcards/approve`

> **UWAGA: Funkcjonalność regenerowania fiszek jest teraz dostępna poprzez endpoint `/api/flashcards/ai-regenerate`.**

5. **Nawigacja z niezapisanymi zmianami**
   - Wyświetlenie NavigationPrompt
   - Kontynuacja nawigacji lub anulowanie

## 9. Warunki i walidacja
### Walidacja formularza
1. **Tytuł dokumentu**
   - Warunek: pole wymagane, maksymalnie 100 znaków
   - Komunikat: "Tytuł jest wymagany" lub "Tytuł nie może przekraczać 100 znaków"
   - Komponent: TitleInput

2. **Treść dokumentu**
   - Warunek: pole wymagane, od 1000 do 10000 znaków
   - Komunikat: "Treść jest wymagana", "Treść musi zawierać co najmniej 1000 znaków" lub "Treść nie może przekraczać 10000 znaków"
   - Komponent: ContentTextarea, CharacterCounter

### Walidacja generowania fiszek
- Warunek: dokument musi być zapisany przed generowaniem fiszek
- Warunek: treść dokumentu musi spełniać wymogi długości (1000-10000 znaków)
- Komunikat: odpowiedni komunikat błędu zależny od warunku
- Komponent: SubmitButtonGroup (przycisk "Generuj fiszki" dezaktywowany jeśli warunki nie są spełnione)

## 10. Obsługa błędów
1. **Błędy pobierania dokumentu**
   - Sytuacja: nie udało się pobrać dokumentu do edycji
   - Obsługa: wyświetlenie komunikatu o błędzie, opcja ponowienia próby lub powrotu

2. **Błędy zapisywania dokumentu**
   - Sytuacja: nie udało się zapisać dokumentu
   - Obsługa: wyświetlenie komunikatu o błędzie, zachowanie formularza w stanie edycji

3. **Błędy walidacji**
   - Sytuacja: dane formularza nie spełniają warunków
   - Obsługa: wyświetlenie komunikatów przy odpowiednich polach

4. **Błędy generowania fiszek**
   - Sytuacja: nie udało się wygenerować fiszek (np. błąd API, timeout)
   - Obsługa: wyświetlenie komunikatu o błędzie, możliwość ponowienia próby

5. **Nieoczekiwane błędy**
   - Sytuacja: inne nieoczekiwane błędy
   - Obsługa: wyświetlenie ogólnego komunikatu o błędzie, możliwość zgłoszenia problemu

## 11. Integracja z DocumentDetailView
1. **Breadcrumbs**
   - Przy wywołaniu z DocumentDetailView:
     ```typescript
     [
       { id: "topics", name: "Tematy", href: "/topics" },
       { id: document.topic_id, name: document.topic_title, href: `/topics/${document.topic_id}` },
       { id: document.id, name: document.name, href: `/documents/${document.id}` },
       { id: "edit", name: "Edycja", href: "#" }
     ]
     ```
   - Przy standardowym wywołaniu:
     ```typescript
     [
       { id: "topics", name: "Tematy", href: "/topics" },
       { id: document.topic_id, name: document.topic_title, href: `/topics/${document.topic_id}` },
       { id: isNew ? "new" : "edit", name: isNew ? "Nowy dokument" : "Edycja", href: "#" }
     ]
     ```

2. **Obsługa przycisku "Edytuj" w DocumentDetailView**
   - Przekazywanie handlera `onEdit` w DocumentHeader (już zaimplementowane)
   - Implementacja przekierowania z DocumentDetailView:
     ```javascript
     const handleEditDocument = () => {
       window.location.href = `/documents/${documentId}/edit?referrer=document_detail`;
     };
     ```

## 12. Kroki implementacji
1. **Utworzenie podstawowych typów**
   - Zdefiniowanie interfejsów i typów wymaganych przez komponenty
   - Rozszerzenie DocumentViewModel o pole initialContent i ai_flashcards_count

2. **Implementacja hooków zarządzania stanem**
   - Rozszerzenie useDocumentForm o funkcję hasContentChanged
   - Implementacja hooka useFlashcardsRegenerationDialog
   - Implementacja logiki kierującej użytkownika do odpowiedniego widoku po zapisie

3. **Implementacja komponentów pomocniczych**
   - Implementacja komponentu Breadcrumbs z dynamiczną ścieżką
   - Implementacja komponentu FlashcardsRegenerationDialog
   - Utworzenie pozostałych komponentów pomocniczych

4. **Implementacja komponentów formularza**
   - Utworzenie komponentów formularza z obsługą nowych propsów

5. **Implementacja logiki różnych ścieżek**
   - Oddzielna logika dla nowego dokumentu (automatyczne generowanie)
   - Oddzielna logika dla edycji dokumentu (dialog z pytaniem)
   - Ostrzeżenie o usunięciu istniejących fiszek AI
   - **Zamarkowanie funkcjonalności regenerowania fiszek jako niedostępnej** (z odpowiednim wyjaśnieniem w UI)

6. **Implementacja widoku głównego**
   - Utworzenie DocumentEditView z obsługą propsów documentId, topicId i referrer
   - Implementacja logiki przekierowań po zapisie

7. **Dodanie obsługi routingu**
   - Konfiguracja obsługi parametru referrer w URL
   - Konfiguracja ścieżek `/documents/:id/edit` i `/topics/:id/documents/new`

8. **Integracja z API**
   - Implementacja obsługi endpointów API dla pobierania, zapisywania dokumentu i generowania fiszek
   - Rozszerzenie logiki o wykrywanie zmian w treści dokumentu
   - **Przygotowanie miejsca dla przyszłej integracji z endpointem regeneracji fiszek** (gdy będzie gotowy)

9. **Implementacja walidacji**
   - Dodanie walidacji formularza, wyświetlanie komunikatów o błędach

10. **Implementacja obsługi błędów**
    - Dodanie mechanizmów obsługi błędów API i nieoczekiwanych sytuacji

11. **Testy i debugowanie**
    - Testowanie różnych ścieżek użytkownika, weryfikacja poprawności działania
    - Sprawdzenie poprawności przekierowań po operacjach

12. **Optymalizacja i refaktoryzacja**
    - Analiza wydajności, usunięcie zbędnego kodu, poprawa jakości 