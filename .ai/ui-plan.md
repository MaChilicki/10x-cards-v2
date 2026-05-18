# Architektura UI dla 10xCards

## 1. Przegląd struktury UI

Aplikacja 10xCards oferuje przejrzystą i hierarchiczną strukturę interfejsu użytkownika, zorganizowaną w logiczny sposób odzwierciedlający proces tworzenia i zarządzania fiszkami edukacyjnymi. Dla niezalogowanych użytkowników dostępny jest jedynie ekran logowania/rejestracji, natomiast po zalogowaniu użytkownik uzyskuje dostęp do pełnej funkcjonalności poprzez topbar zawierający główne elementy nawigacyjne. Struktura interfejsu opiera się na hierarchii: Dashboard → Tematy → Dokumenty → Fiszki, z dostępnymi operacjami CRUD na każdym poziomie.

Aplikacja wykorzystuje nowoczesny stos technologiczny (Astro, TypeScript, React, Tailwind, Shadcn/ui) do zapewnienia responsywności i dostępności na różnych urządzeniach. Designem przewodnim jest podejście "mobile-first" z przejrzystym i intuicyjnym układem, który adaptuje się do różnych rozmiarów ekranu.

## 2. Lista widoków

### AuthView
- **Ścieżka**: `/auth`, `/auth/login`, `/auth/register`, `/auth/reset-password`
- **Główny cel**: Umożliwienie użytkownikom logowania, rejestracji i resetowania hasła
- **Kluczowe informacje**: Formularze uwierzytelniania, linki do alternatywnych akcji
- **Kluczowe komponenty**:
  - Przełącznik logowanie/rejestracja
  - Formularze z walidacją inline
  - Link do resetu hasła
- **UX i dostępność**:
  - Jasne komunikaty błędów
  - Obsługa klawisza Enter
  - Możliwość nawigacji klawiaturą

### DashboardView
- **Ścieżka**: `/dashboard`
- **Główny cel**: Zapewnienie szybkiego dostępu do najczęściej używanych elementów i podstawowych statystyk
- **Kluczowe informacje**: Ostatnio używane tematy/dokumenty, podstawowe statystyki
- **Kluczowe komponenty**:
  - Topbar z menu i awatarem użytkownika
  - Sekcja "Ostatnio aktywne tematy" (karty)
  - Sekcja "Ostatnio edytowane dokumenty" (karty)
  - Podstawowe statystyki (liczba fiszek, tematów, dokumentów)
- **UX i dostępność**:
  - Szybki dostęp do najczęściej używanych elementów
  - Responsywny układ kart (grid vs lista na mobilnych)

### TopicsListView
- **Ścieżka**: `/topics`
- **Główny cel**: Wyświetlanie i zarządzanie wszystkimi tematami użytkownika
- **Kluczowe informacje**: Lista tematów z metadanymi
- **Kluczowe komponenty**:
  - Lista tematów (karty lub wiersze)
  - Przycisk "Dodaj temat"
  - Przyciski akcji dla każdego tematu (edytuj, usuń)
  - Modal dodawania/edycji tematu
- **UX i dostępność**:
  - Sortowanie alfabetyczne
  - Informacja o liczbie dokumentów w temacie
  - Weryfikacja przed usunięciem (blokowanie jeśli zawiera dokumenty)

### TopicDetailView
- **Ścieżka**: `/topics/:id`
- **Główny cel**: Prezentacja szczegółów wybranego tematu i pełne zarządzanie dokumentami w tym temacie
- **Kluczowe informacje**: Nazwa tematu, lista dokumentów z pełnymi metadanymi
- **Kluczowe komponenty**:
  - Nagłówek z nazwą tematu
  - Przyciski akcji dla tematu (edytuj, usuń)
  - Lista dokumentów (karty) zawierająca:
    - Tytuł dokumentu
    - Data utworzenia
    - Liczba fiszek
    - Status dokumentu (AI/manualne)
    - Przyciski akcji dla dokumentów (edytuj, usuń)
  - Przycisk "Dodaj dokument"
- **UX i dostępność**:
  - Informacje o dacie utworzenia tematu
  - Liczba dokumentów i fiszek w temacie
  - Wizualne rozróżnienie informacji o fiszkach AI/manualnych
  - Sortowanie dokumentów (np. według daty utworzenia)

### DocumentDetailView
- **Ścieżka**: `/documents/:id`
- **Główny cel**: Prezentacja szczegółów dokumentu i zawartych w nim fiszek
- **Kluczowe informacje**: Tytuł dokumentu, lista fiszek, metadane
- **Kluczowe komponenty**:
  - Nagłówek z nazwą dokumentu
  - Przyciski akcji (edytuj dokument, dodaj fiszkę ręcznie, generuj fiszki)
  - Lista fiszek
  - Przyciski akcji dla fiszek (edytuj, usuń)
- **UX i dostępność**:
  - Karty fiszek z możliwością podglądu przodu/tyłu
  - Oznaczenia źródła fiszek (AI/manual)
  - Sortowanie alfabetyczne według pola front_modified

### DocumentEditView
- **Ścieżka**: `/documents/:id/edit`, `/topics/:id/documents/new`
- **Główny cel**: Tworzenie nowego lub edycja istniejącego dokumentu
- **Kluczowe informacje**: Formularz edycji, opcje generowania fiszek
- **Kluczowe komponenty**:
  - Formularz edycji (tytuł, treść)
  - Przycisk "Generuj fiszki"
  - Przyciski "Zapisz zmiany" i "Anuluj"
- **UX i dostępność**:
  - Ostrzeżenie przed opuszczeniem strony z niezapisanymi zmianami
  - Ostrzeżenie przy ponownym generowaniu fiszek

### FlashcardsApprovalView
- **Ścieżka**: `/documents/:id/flashcards/approve`
- **Główny cel**: Zatwierdzanie lub odrzucanie fiszek wygenerowanych przez AI
- **Kluczowe informacje**: Lista niezatwierdzonych fiszek AI (source='AI', is_disabled=FALSE, is_approved=FALSE), opcje pojedynczej i zbiorczej akceptacji
- **Kluczowe komponenty**:
  - DocumentHeader z informacją o dokumencie źródłowym
  - Breadcrumbs (Tematy > Tytuł tematu > Tytuł dokumentu > Akceptacja fiszek AI)
  - Lista fiszek do akceptacji z możliwością zaznaczania wielu naraz
  - Checkboxy do zaznaczania pojedynczych fiszek
  - Kontrolki dla każdej fiszki:
    - Przycisk "Zatwierdź" (pojedyncza fiszka)
    - Przycisk "Edytuj" (otwiera modal edycji)
    - Przycisk odwracania fiszki (podgląd przód/tył)
  - Akcje zbiorcze:
    - Przycisk "Zatwierdź zaznaczone"
    - Przycisk "Zatwierdź wszystkie"
    - Przycisk "Zaznacz wszystkie"
  - ConfirmationDialog dla akceptacji zbiorczej
  - EditFlashcardModal do edycji pojedynczej fiszki
- **UX i dostępność**:
  - Możliwość szybkiego przeglądania i odwracania fiszek (przód/tył)
  - Wyraźne oznaczenie źródła fiszek (AI)
  - Informacja o liczbie zaznaczonych/wszystkich fiszek
  - Fiszki po edycji nie są automatycznie akceptowane
  - Jasne komunikaty o statusie operacji
  - Zmiana fiszki AI na manualną skutkuje utworzeniem nowej fiszki i dezaktywacją oryginalnej (is_disabled=TRUE)

### StudySessionPlaceholderView
- **Ścieżka**: `/study`
- **Główny cel**: Informacja o planowanej funkcjonalności sesji nauki
- **Kluczowe informacje**: Opis planowanej funkcjonalności
- **Kluczowe komponenty**:
  - Informacja o statusie "W przygotowaniu"
  - Ilustracja/mockup
- **UX i dostępność**:
  - Jasna informacja o statusie "W przygotowaniu"

### StatisticsPlaceholderView
- **Ścieżka**: `/statistics`
- **Główny cel**: Informacja o planowanej funkcjonalności statystyk
- **Kluczowe informacje**: Opis planowanej funkcjonalności
- **Kluczowe komponenty**:
  - Informacja o statusie "W przygotowaniu"
  - Ilustracja/mockup
- **UX i dostępność**:
  - Jasna informacja o statusie "W przygotowaniu"

## 3. Mapa podróży użytkownika

### Rejestracja i pierwsze logowanie
1. Użytkownik wchodzi na stronę → AuthView (rejestracja)
2. Wypełnia formularz rejestracji → otrzymuje email weryfikacyjny
3. Potwierdza email → AuthView (logowanie)
4. Loguje się → DashboardView (pusty stan)
5. Jest zachęcany do utworzenia pierwszego tematu

### Nawigacja do dokumentu
1. Użytkownik przechodzi do TopicListView
2. Otwiera jeden z utworzonych tematów w widoku TopicDetailView
3. Otwiera jeden z dokumentów dostępny przez komponent TopicCard klikając w kartę dokumentu.
4. Widzi nagłówek dokumentu - jego tytuł i fragment treści (pierwsze 100 wyrazów). W nagłówku jest klawisz do edycji, usunięcia i ponownej generacji fiszek AI. Jeśli dokument posiada nie zatwierdzone fiszki AI to jest link do listy fiszek do akceptacji wraz z liczbą. 
5. poniżej widzi zatwierdzone aktywne fiszki z CRUD'em. Fiszki geenerowane przez AI mają oznaczenie "AI". Fiszki można sortować i mają paginację.

### Tworzenie fiszek przy użyciu AI
1. Użytkownik przechodzi do TopicsListView
2. Tworzy nowy temat poprzez modal
3. Przechodzi do nowego tematu → TopicDetailView (pusty stan)
4. Tworzy nowy dokument → DocumentEditView
5. Wprowadza tytuł i tekst dokumentu
6. Klika "Generuj fiszki" → FlashcardsApprovalView
7. Przegląda, edytuje i zatwierdza wygenerowane fiszki
8. Wraca do widoku dokumentu z zatwierdzonymi fiszkami → DocumentDetailView

### Ręczne tworzenie fiszek
1. Użytkownik wybiera dokument → DocumentDetailView
2. Klika "Dodaj fiszkę ręcznie" → otwarcie ManualFlashcardModal
3. Wprowadza przód i tył fiszki
4. Zatwierdza → fiszka pojawia się w DocumentDetailView

### Edycja istniejącego dokumentu i regeneracja fiszek
1. Użytkownik wybiera dokument → DocumentDetailView
2. Klika "Edytuj dokument" → DocumentEditView
3. Modyfikuje tekst dokumentu
4. Klika "Generuj fiszki" → pojawia się alert o konsekwencjach regeneracji
5. Potwierdza regenerację → FlashcardsApprovalView
6. Zatwierdza nowe fiszki → DocumentDetailView z zaktualizowanymi fiszkami

## 4. Układ i struktura nawigacji

### Główna struktura nawigacyjna
- **Topbar** (widoczny po zalogowaniu)
  - Logo (lewa strona) - link do dashboardu
  - Menu główne (lewa strona, zaraz za logo)
    - Dashboard
    - Tematy
    - Sesje nauki (zamarkowane w MVP)
    - Statystyki (zamarkowane w MVP)
  - Przełącznik trybu jasny/ciemny (prawa stona) (opcjonalnie)  
  - Avatar użytkownika z menu (prawa strona)
    - Profil
    - Ustawienia
    - Wyloguj
    

### Nawigacja kontekstowa
- **Breadcrumbs** widoczne na wszystkich widokach poza dashboardem
  - Ścieżka nawigacji: Dashboard > Tematy > [Nazwa tematu] > [Nazwa dokumentu]
- **Przyciski powrotu** do poprzedniego widoku
- **Przyciski akcji** specyficzne dla danego widoku

### Nawigacja mobilna
- **Hamburger menu** zamiast topbara na mniejszych ekranach
  - Rozwija sidebar z tymi samymi opcjami co desktop
- **Bottom bar** (opcjonalnie) z najważniejszymi skrótami

### Hierarchia nawigacji
1. Dashboard (punkt wejścia po zalogowaniu)
2. Tematy (TopicsListView)
3. Szczegóły tematu z listą dokumentów (TopicDetailView)
4. Szczegóły dokumentu (DocumentDetailView)
5. Edycja dokumentu lub zatwierdzanie fiszek (DocumentEditView, FlashcardsApprovalView)

## 5. Kluczowe komponenty

### Komponenty strukturalne
- **Topbar** - pasek nawigacji głównej z logo, menu i awatarem
- **Breadcrumbs** - ścieżka nawigacji z linkami
- **Modal** - okno modalne do szybkich interakcji (tworzenie/edycja/usuwanie)
- **Layout** - bazowy układ strony z nawigacją i przestrzenią na treść

### Komponenty prezentacyjne
- **Card** - komponent do wyświetlania tematów, dokumentów i fiszek
  - Wariant dla tematu: tytuł, opis, liczba dokumentów, data utworzenia
  - Wariant dla dokumentu: tytuł, data utworzenia, liczba fiszek, status
  - Wariant dla fiszki: przód/tył z możliwością odwracania, oznaczenie źródła (AI/manual)
- **List** - alternatywny sposób prezentacji danych w formie listy
- **Badge** - znacznik do oznaczania statusu (AI, ręczne, oczekujące)
- **Avatar** - awatar użytkownika z menu kontekstowym

### Komponenty formularzy
- **TextInput** - pole tekstowe z walidacją
- **TextArea** - pole wieloliniowe dla treści dokumentu
- **Button** - przycisk z różnymi wariantami (primary, secondary, danger)
- **Alert** - komunikat ostrzegawczy lub informacyjny
- **Toast** - tymczasowy komunikat o powodzeniu/błędzie operacji

### Komponenty specjalne
- **FlashcardView** - komponent do wyświetlania fiszki z możliwością odwracania
- **AIGenerationIndicator** - wskaźnik postępu generowania fiszek przez AI
- **EmptyState** - komponent wyświetlany, gdy lista jest pusta
- **ConfirmationDialog** - dialog potwierdzenia dla operacji usuwania
- **Skeleton** - placeholder podczas ładowania danych 