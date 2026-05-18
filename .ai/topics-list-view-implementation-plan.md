# Plan implementacji widoku TopicsListView

## 1. Przegląd
TopicsListView to widok służący do wyświetlania i zarządzania wszystkimi tematami użytkownika. Umożliwia przeglądanie, tworzenie, edycję i usuwanie tematów, które są podstawową jednostką organizacyjną w hierarchicznej strukturze aplikacji 10xCards. Widok prezentuje tematy w formie listy kart z podstawowymi informacjami o każdym temacie, wraz z funkcjami zarządzania, stronicowane jeśli to potrzebne ze względu na liczbę tematów. 

## 2. Routing widoku
Widok będzie dostępny pod ścieżką: `/topics`

## 3. Struktura komponentów
```
TopicsListView
├── Breadcrumbs
├── AddTopicButton
├── TopicsList
│   ├── TopicCard
│   │   ├── TopicCardHeader
│   │   ├── TopicCardContent
│   │   └── TopicCardActions
├── LoadingTopicsState
├── EmptyTopicsState
├── ErrorTopicsState
├── TopicFormModal
└── DeleteTopicDialog
```

## 4. Szczegóły komponentów

### Breadcrumbs
- Opis komponentu: Komponent nawigacyjny wyświetlający aktualną ścieżkę w hierarchii i umożliwiający szybki powrót do wyższych poziomów
- Główne elementy: Lista linków nawigacyjnych, separatory między linkami
- Obsługiwane interakcje: Kliknięcie w link do przejścia na wyższy poziom
- Obsługiwana walidacja: N/A
- Typy: BreadcrumbItem[]
- Propsy: 
  ```typescript
  {
    items: BreadcrumbItem[];
    onNavigate?: (path: string) => void;
  }
  ```

### TopicsListView
- Opis komponentu: Główny komponent widoku listy tematów, zarządzający stanem i renderujący podkomponenty
- Główne elementy: Kontener z nagłówkiem, filtrami, przyciskiem dodawania i listą tematów
- Obsługiwane interakcje: Inicjalizacja, ładowanie danych, obsługa filtrowania i sortowania
- Obsługiwana walidacja: Sprawdzanie poprawności odpowiedzi API
- Typy: TopicViewModel[], TopicsListResponseDto, TopicFilters, TopicSortOption
- Propsy: N/A (komponent najwyższego poziomu)


### AddTopicButton
- Opis komponentu: Przycisk dodawania nowego tematu
- Główne elementy: Przycisk z ikoną dodawania
- Obsługiwane interakcje: Kliknięcie otwierające modal
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy: 
  ```typescript
  {
    onClick: () => void;
  }
  ```

### TopicsList
- Opis komponentu: Komponent wyświetlający listę tematów w formie kart
- Główne elementy: Grid/lista kart tematów
- Obsługiwane interakcje: Przekazywanie interakcji do kart tematów
- Obsługiwana walidacja: Sprawdzanie czy lista tematów nie jest pusta
- Typy: TopicViewModel[]
- Propsy: 
  ```typescript
  {
    topics: TopicViewModel[];
    onTopicClick: (id: string) => void;
    onEditClick: (topic: TopicViewModel) => void;
    onDeleteClick: (topic: TopicViewModel) => void;
  }
  ```

### TopicCard
- Opis komponentu: Karta pojedynczego tematu z informacjami i przyciskami akcji
- Główne elementy: Nagłówek z nazwą, treść z opisem i metadanymi, przyciski akcji
- Obsługiwane interakcje: Kliknięcie w kartę, kliknięcie przycisków edycji/usunięcia
- Obsługiwana walidacja: N/A
- Typy: TopicViewModel
- Propsy: 
  ```typescript
  {
    topic: TopicViewModel;
    onClick: () => void;
    onEditClick: () => void;
    onDeleteClick: () => void;
  }
  ```

### LoadingTopicsState
- Opis komponentu: Komponent wyświetlany podczas ładowania listy tematów
- Główne elementy: Wskaźnik ładowania, placeholder'y / skeletony kart
- Obsługiwane interakcje: N/A
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy: N/A

### EmptyTopicsState
- Opis komponentu: Komponent wyświetlany gdy lista tematów jest pusta
- Główne elementy: Informacja o braku tematów, przycisk tworzenia tematu
- Obsługiwane interakcje: Kliknięcie przycisku tworzenia tematu
- Obsługiwana walidacja: N/A
- Typy: N/A
- Propsy: 
  ```typescript
  {
    onCreateTopicClick: () => void;
  }
  ```

### ErrorTopicsState
- Opis komponentu: Komponent wyświetlany w przypadku błędu ładowania tematów
- Główne elementy: Komunikat błędu, przycisk ponowienia ładowania
- Obsługiwane interakcje: Kliknięcie przycisku ponowienia
- Obsługiwana walidacja: N/A
- Typy: Error
- Propsy: 
  ```typescript
  {
    error: Error;
    onRetry: () => void;
  }
  ```

### TopicFormModal
- Opis komponentu: Modal z formularzem do tworzenia/edycji tematu
- Główne elementy: Formularz z polami nazwy i opisu. Temat nadrzędny ma pozostawać null na etapie MVP.
- Obsługiwane interakcje: Wprowadzanie danych, przesyłanie formularza, anulowanie
- Obsługiwana walidacja: 
  - Nazwa tematu jest wymagana
  - Nazwa tematu musi być unikalna
  - Nazwa tematu musi mieć od 3 do 100 znaków
  - Opis nie może przekraczać 500 znaków
- Typy: TopicFormData, TopicCreateDto, TopicUpdateDto
- Propsy: 
  ```typescript
  {
    isOpen: boolean;
    isEditMode: boolean;
    initialData?: TopicFormData;
    availableParents?: TopicDto[];
    onClose: () => void;
    onSubmit: (data: TopicFormData) => Promise<void>;
  }
  ```

### DeleteTopicDialog
- Opis komponentu: Dialog potwierdzenia usunięcia tematu
- Główne elementy: Komunikat ostrzeżenia, przyciski potwierdzenia i anulowania
- Obsługiwane interakcje: Potwierdzenie lub anulowanie usunięcia
- Obsługiwana walidacja: Sprawdzanie czy temat nie zawiera dokumentów ani fiszek
- Typy: TopicViewModel
- Propsy: 
  ```typescript
  {
    isOpen: boolean;
    topic: TopicViewModel | null;
    deleting: boolean;
    error: Error | null;
    onClose: () => void;
    onConfirm: () => Promise<void>;
  }
  ```

## 5. Typy

### Istniejące typy z types.ts
```typescript
// Podstawowe typy dla tematów
type Topic = Database["public"]["Tables"]["topics"]["Row"];
type TopicDto = Topic;

// DTO do tworzenia tematu
interface TopicCreateDto {
  name: string;
  description?: string;
  parent_id?: string;
}

// DTO do aktualizacji tematu
type TopicUpdateDto = Partial<{
  name: string;
  description: string;
}>;

// DTO dla odpowiedzi z listą tematów
interface TopicsListResponseDto {
  topics: TopicDto[];
  total: number;
}
```

### Dodatkowe typy dla widoku
```typescript
// Rozszerzony model widoku dla tematu
interface TopicViewModel extends TopicDto {
  documentsCount: number; // Liczba dokumentów w temacie
  hasChildren: boolean; // Czy temat ma podtematy
  isParent: boolean; // Czy jest tematem nadrzędnym (rodzic)
  isChild: boolean; // Czy jest tematem podrzędnym (dziecko)
  parentName?: string; // Nazwa tematu nadrzędnego (jeśli jest)
}

// Element nawigacji breadcrumb
interface BreadcrumbItem {
  label: string;
  path: string;
  isCurrent: boolean;
}

// Dane formularza do tworzenia/edycji tematu
interface TopicFormData {
  name: string;
  description: string;
  parent_id?: string;
}

// Filtry dla listy tematów
interface TopicFilters {
  search?: string; // Wyszukiwanie po nazwie
  parentId?: string; // Filtrowanie po rodzicu
  hasDocuments?: boolean; // Filtrowanie po posiadaniu dokumentów
}

// Opcje sortowania tematów
type TopicSortField = 'name' | 'created_at' | 'updated_at' | 'documentsCount';
type SortDirection = 'asc' | 'desc';

interface TopicSortOption {
  field: TopicSortField;
  direction: SortDirection;
}
```

## 6. Zarządzanie stanem

### Hook useTopics
```typescript
const useTopics = (initialFilters?: TopicFilters, initialSort?: TopicSortOption) => {
  // Stany
  const [topics, setTopics] = useState<TopicViewModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TopicFilters>(initialFilters || {});
  const [sort, setSort] = useState<TopicSortOption>(initialSort || { field: 'name', direction: 'asc' });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Funkcje zarządzające tematami
  const fetchTopics = useCallback(async () => {/* ... */}, [filters, sort, pagination]);
  const addTopic = async (topicData: TopicCreateDto) => {/* ... */};
  const updateTopic = async (id: string, topicData: TopicUpdateDto) => {/* ... */};
  const deleteTopic = async (id: string) => {/* ... */};
  const resetFilters = () => {/* ... */};

  // Efekty pobierające dane
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return {
    topics,
    loading,
    error,
    filters,
    sort,
    pagination,
    setFilters,
    setSort,
    fetchTopics,
    addTopic,
    updateTopic,
    deleteTopic,
    resetFilters,
  };
};
```

### Hook useTopicForm
```typescript
const useTopicForm = (initialData?: TopicFormData, onSubmit?: (data: TopicFormData) => Promise<void>) => {
  // Stany formularza
  const [formData, setFormData] = useState<TopicFormData>(initialData || { name: '', description: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Obsługa zmian w formularzu
  const handleChange = (name: string, value: string) => {/* ... */};
  
  // Walidacja formularza
  const validate = (): boolean => {/* ... */};
  
  // Obsługa przesłania formularza
  const handleSubmit = async () => {/* ... */};
  
  // Reset formularza
  const reset = () => {/* ... */};

  return {
    formData,
    errors,
    submitting,
    handleChange,
    handleSubmit,
    reset,
    setFormData,
  };
};
```

### Stany w komponencie głównym
```typescript
function TopicsListView() {
  // Hook z logiką zarządzania tematami
  const {
    topics,
    loading,
    error,
    filters,
    sort,
    setFilters,
    setSort,
    fetchTopics,
    addTopic,
    updateTopic,
    deleteTopic,
  } = useTopics();

  // Elementy nawigacyjne (breadcrumbs)
  const breadcrumbItems: BreadcrumbItem[] = [
    { label: 'Dashboard', path: '/dashboard', isCurrent: false },
    { label: 'Tematy', path: '/topics', isCurrent: true }
  ];
  
  const handleBreadcrumbNavigate = (path: string) => {
    window.location.href = path;
  };

  // Stany UI
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  const [currentTopic, setCurrentTopic] = useState<TopicDto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [topicToDelete, setTopicToDelete] = useState<TopicViewModel | null>(null);
  const [deleteError, setDeleteError] = useState<Error | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  // Funkcje obsługujące UI
  const handleOpenModal = (editMode = false, topic?: TopicDto) => {/* ... */};
  const handleCloseModal = () => {/* ... */};
  const handleOpenDeleteDialog = (topic: TopicViewModel) => {/* ... */};
  const handleCloseDeleteDialog = () => {/* ... */};
  const handleFormSubmit = async (data: TopicFormData) => {/* ... */};
  const handleConfirmDelete = async () => {/* ... */};

  // Renderowanie komponentu
  // ...
}
```

## 7. Integracja API

### Pobieranie listy tematów
```typescript
const fetchTopics = async () => {
  setLoading(true);
  setError(null);
  
  try {
    const searchParams = new URLSearchParams();
    
    // Dodanie filtrów
    if (filters.search) searchParams.append('name', filters.search);
    if (filters.parentId) searchParams.append('parent_id', filters.parentId);
    
    // Dodanie paginacji
    searchParams.append('page', pagination.page.toString());
    searchParams.append('limit', pagination.limit.toString());
    
    // Dodanie sortowania
    searchParams.append('sort', `${sort.field}:${sort.direction}`);
    
    const response = await fetch(`/api/topics?${searchParams.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Błąd pobierania tematów: ${response.status}`);
    }
    
    const data: TopicsListResponseDto = await response.json();
    
    // Mapowanie na model widoku
    const topicsViewModel: TopicViewModel[] = data.topics.map(topic => ({
      ...topic,
      documentsCount: 0, // W API można dodać zliczanie dokumentów
      hasChildren: false, // W API można dodać informację o dzieciach
      isParent: !topic.parent_id,
      isChild: !!topic.parent_id,
      parentName: '', // Należy uzupełnić na podstawie relacji
    }));
    
    setTopics(topicsViewModel);
    setPagination(prev => ({ ...prev, total: data.total }));
  } catch (err) {
    setError(err instanceof Error ? err : new Error('Nieznany błąd'));
  } finally {
    setLoading(false);
  }
};
```

### Tworzenie tematu
```typescript
const addTopic = async (topicData: TopicCreateDto) => {
  try {
    const response = await fetch('/api/topics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topicData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Błąd tworzenia tematu');
    }
    
    const createdTopic: TopicDto = await response.json();
    
    // Odświeżenie listy tematów
    fetchTopics();
    
    return createdTopic;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Nieznany błąd');
  }
};
```

### Aktualizacja tematu
```typescript
const updateTopic = async (id: string, topicData: TopicUpdateDto) => {
  try {
    const response = await fetch(`/api/topics/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(topicData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Błąd aktualizacji tematu');
    }
    
    const updatedTopic: TopicDto = await response.json();
    
    // Aktualizacja tematu na liście
    setTopics(prev => 
      prev.map(topic => 
        topic.id === id ? { ...topic, ...updatedTopic } : topic
      )
    );
    
    return updatedTopic;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Nieznany błąd');
  }
};
```

### Usuwanie tematu
```typescript
const deleteTopic = async (id: string) => {
  try {
    const response = await fetch(`/api/topics/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'Błąd usuwania tematu');
    }
    
    // Usunięcie tematu z listy
    setTopics(prev => prev.filter(topic => topic.id !== id));
    
    return true;
  } catch (err) {
    throw err instanceof Error ? err : new Error('Nieznany błąd');
  }
};
```

## 8. Interakcje użytkownika

### Ładowanie widoku
- Użytkownik wchodzi na stronę `/topics`
- System inicjalizuje breadcrumbs z aktualną ścieżką nawigacyjną
- System wyświetla stan ładowania (LoadingTopicsState)
- System pobiera dane tematów z API
- System wyświetla listę tematów lub stan pusty/błąd

### Filtrowanie tematów
- Użytkownik wprowadza tekst do pola wyszukiwania
- System aktualizuje filtr `search` i pobiera odfiltrowane tematy
- Użytkownik wybiera opcję filtrowania tematów z dokumentami
- System aktualizuje filtr `hasDocuments` i pobiera odfiltrowane tematy

### Sortowanie tematów
- Użytkownik wybiera pole i kierunek sortowania
- System aktualizuje opcję sortowania i pobiera posortowane tematy

### Dodawanie tematu
- Użytkownik klika przycisk "Dodaj temat"
- System otwiera modal formularza w trybie dodawania
- Użytkownik wypełnia pola nazwy i opisu
- Użytkownik wybiera opcjonalnie temat nadrzędny
- Użytkownik zatwierdza formularz
- System waliduje dane
- Jeśli dane są poprawne, system tworzy nowy temat poprzez API
- System zamyka modal i odświeża listę tematów

### Edycja tematu
- Użytkownik klika przycisk edycji przy temacie
- System otwiera modal formularza w trybie edycji z danymi tematu
- Użytkownik modyfikuje dane
- Użytkownik zatwierdza formularz
- System waliduje dane
- Jeśli dane są poprawne, system aktualizuje temat poprzez API
- System zamyka modal i aktualizuje temat na liście

### Usuwanie tematu
- Użytkownik klika przycisk usuwania przy temacie
- System otwiera dialog potwierdzenia
- Jeśli temat zawiera dokumenty lub podtematy, system informuje o tym użytkownika
- Użytkownik potwierdza usunięcie
- System usuwa temat poprzez API
- System zamyka dialog i usuwa temat z listy

### Przejście do szczegółów tematu
- Użytkownik klika w kartę tematu
- System przekierowuje użytkownika do widoku szczegółów tematu (`/topics/{id}`)

## 9. Warunki i walidacja

### Walidacja formularza tematu
- Nazwa tematu:
  - Jest wymagana
  - Musi mieć od 3 do 50 znaków
  - Musi być unikalna w obrębie tematów użytkownika
- Opis tematu:
  - Jest opcjonalny
  - Nie może przekraczać 250 znaków
- Temat nadrzędny:
  - Jest opcjonalny
  - Musi wskazywać na istniejący temat
  - Nie może być tym samym tematem (cykl)

### Walidacja usuwania tematu
- Temat nie może zawierać dokumentów
- Temat nie może mieć podtematów

## 10. Obsługa błędów

### Błędy pobierania tematów
- Wyświetlenie komponentu ErrorTopicsState
- Pokazanie przyjaznego komunikatu błędu
- Możliwość ponowienia próby pobrania danych

### Błędy formularza
- Wyświetlenie komunikatów błędów pod odpowiednimi polami
- W przypadku błędu unikalności nazwy, wyświetlenie komunikatu o duplikacie
- W przypadku błędu serwera, wyświetlenie ogólnego komunikatu błędu
- Możliwość poprawy i ponownego przesłania formularza

### Błędy usuwania
- W przypadku próby usunięcia tematu z dokumentami lub podtematami:
  - Wyświetlenie komunikatu o niemożności usunięcia
  - Informacja o konieczności najpierw usunięcia zawartości
- W przypadku błędu serwera:
  - Wyświetlenie komunikatu o niemożności usunięcia
  - Możliwość ponowienia próby

## 11. Kroki implementacji

1. Utworzenie pliku widoku `/src/pages/topics/index.astro` z podstawową strukturą Astro
2. Implementacja głównego komponentu React `TopicsListView` w `/src/components/topics/TopicsListView.tsx`
3. Implementacja pomocniczych hooków:
   - `useTopics` - logika zarządzania tematami
   - `useTopicForm` - logika formularza tematu
4. Implementacja komponentów UI:
   - `Breadcrumbs` - nawigacja okruszkowa
   - `TopicListFilters` - filtry i sortowanie
   - `TopicsList` - lista tematów
   - `TopicCard` - karta pojedynczego tematu
   - `TopicFormModal` - modal formularza tematu
   - `DeleteTopicDialog` - dialog usuwania tematu
   - `LoadingTopicsState`, `EmptyTopicsState`, `ErrorTopicsState` - stany widoku
5. Implementacja obsługi API i integracja z hookami
6. Implementacja walidacji formularza i obsługi błędów
7. Testowanie komponentów i interakcji
8. Integracja z układem strony i systemem nawigacji
9. Optymalizacja wydajności (memoizacja, wirtualizacja dla dużych list)
10. Testy końcowe i dokumentacja 