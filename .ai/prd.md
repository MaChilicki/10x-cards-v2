# Dokument wymagań produktu (PRD) - 10xCards

## 1. Przegląd produktu

Aplikacja 10xCards to webowy system do tworzenia i zarządzania fiszkami edukacyjnymi. System umożliwia automatyczne generowanie fiszek przez LLM na podstawie wprowadzonego tekstu, a także ręczne ich tworzenie. Użytkownik ma dostęp do pełnego zestawu operacji CRUD (przeglądanie, edycja, usuwanie), a fiszki są grupowane według dokumentu źródłowego. Projekt integruje otwarty algorytm powtórek, co pozwala na efektywne zarządzanie sesjami nauki opartej na metodzie spaced repetition. System posiada również mechanizmy monitorowania statystyk oraz obsługi błędów komunikacji z API.

Aplikacja oferuje hierarchiczną strukturę organizacji danych: Tematy → Dokumenty → Fiszki, gdzie każdy temat może zawierać wiele dokumentów, a każdy dokument wiele fiszek. Taka struktura pozwala na efektywne zarządzanie i kategoryzowanie materiałów edukacyjnych.

## 2. Problem użytkownika

Głównym problemem, z jakim borykają się użytkownicy, jest czasochłonność ręcznego tworzenia wysokiej jakości fiszek edukacyjnych. Proces ten jest żmudny i wymaga dużego wysiłku, co zniechęca do wykorzystywania efektywnych metod nauki, takich jak spaced repetition. Dodatkowo, użytkownicy potrzebują efektywnego sposobu organizowania swoich materiałów edukacyjnych w logiczne kategorie i grupy.

## 3. Wymagania funkcjonalne

1. Automatyczne generowanie fiszek:
   - System ma wykorzystywać LLM do dynamicznego generowania fiszek na podstawie wprowadzonego tekstu.
   - Liczba generowanych fiszek zależy od długości tekstu i identyfikacji kluczowych informacji.
   - Fiszka składa się z dwóch sekcji: przodu i tyłu, a treść jest tekstowa.

2. Manualne tworzenie fiszek:
   - Użytkownik ma możliwość ręcznego tworzenia fiszek poprzez wyskakujące okno (modal).

3. Operacje CRUD na fiszkach:
   - Możliwość przeglądania, edycji oraz usuwania fiszek, niezależnie od sposobu ich utworzenia.
   - Podczas edycji system porównuje procentową zmianę treści – próg 50% decyduje o klasyfikacji fiszki jako oryginalnej (AI) lub zmodyfikowanej ręcznie.

4. System kont użytkowników:
   - Rejestracja, logowanie, zmiana hasła oraz opcja usunięcia konta.
   - Wszystkie dane użytkownika są prywatne i powiązane z kontem, w tym:
     * Fiszki
     * Dokumenty
     * Tematy
     * Sesje nauki (study_sessions)
     * Statystyki użytkownika (user_statistics)
   - Weryfikacja emaila podczas rejestracji i resetowanie hasła poprzez link wysyłany na email.
   - Automatyczne zarządzanie sesją użytkownika.
   - Ochrona tras aplikacji przed nieautoryzowanym dostępem.
   - Implementacja Row Level Security (RLS) w bazie danych dla wszystkich tabel.
   - Strona logowania jako główna strona serwisu:
     * Niezalogowani użytkownicy są przekierowywani na stronę logowania
     * Zalogowani użytkownicy są automatycznie przekierowywani na dashboard
     * Dostęp do funkcjonalności aplikacji wymaga zalogowania
   - Brak integracji z zewnętrznymi systemami autentykacji (np. GitHub, Google, Facebook).
   - Wykorzystanie standardowego połączenia emaila jako loginu i hasła do autentykacji.

5. Hierarchiczna organizacja treści:
   - System pozwala na tworzenie i zarządzanie tematami, które grupują dokumenty.
   - Możliwość przeglądania, tworzenia, edycji i usuwania tematów.
   - Każdy temat może zawierać wiele dokumentów.

6. Zarządzanie dokumentami:
   - Możliwość tworzenia, edycji, przeglądania i usuwania dokumentów.
   - Dokumenty zawierają tekst, który jest podstawą do generowania fiszek.
   - Dokumenty są przypisane do tematów i służą jako źródło dla fiszek.
   - Usunięcie dokumentu powoduje usunięcie wszystkich powiązanych z nim fiszek.

7. Grupowanie fiszek według dokumentu źródłowego:
   - Fiszki są przypisywane do odpowiednich grup tematycznych na podstawie dokumentu źródłowego.
   - Rejestrowane są daty utworzenia oraz informacja, czy fiszka została wygenerowana przez AI czy stworzona/zmodyfikowana ręcznie.

8. Integracja z algorytmem powtórek:
   - System integruje otwarty algorytm powtórek, który automatycznie obsługuje sesje nauki zgodnie z metodą spaced repetition.

9. Monitorowanie i statystyki:
   - System zbiera statystyki dotyczące liczby fiszek generowanych przez AI, akceptacji przez użytkownika oraz udziału modyfikowanych fiszek.

10. Mechanizmy ponownego generowania fiszek:
    - Użytkownik ma możliwość ponownego wysłania tekstu do generowania fiszek. Fiszki odrzucone przez użytkownika nie wliczają się do kryteriów sukcesu.

11. Obsługa błędów:
    - System musi wyświetlać czytelne komunikaty w przypadku błędów komunikacji z API oraz umożliwiać ponowne wysłanie tekstu.

12. Zarządzanie cyklem życia fiszek:
    - Fiszki generowane przez AI (source="ai") są usuwane poprzez soft delete (oznaczenie jako nieaktywne).
    - Fiszki tworzone ręcznie (source="manual") są usuwane poprzez hard delete (całkowite usunięcie z bazy danych).
    - System automatycznie zarządza powiązaniami między fiszkami, dokumentami i tematami, zachowując integralność danych.

## 4. Granice produktu

1. Nie wchodzi w zakres MVP:
   - Własny, zaawansowany algorytm powtórek (np. SuperMemo, Anki)
   - Import różnych formatów plików (PDF, DOCX, itp.)
   - Współdzielenie zestawów fiszek między użytkownikami
   - Integracje z innymi platformami edukacyjnymi
   - Aplikacje mobilne – na początek dostępny jest tylko interfejs webowy

## 5. Historyjki użytkowników

### US-001: Rejestracja i logowanie
- Tytuł: Rejestracja i logowanie użytkownika
- Opis: Użytkownik ma możliwość rejestracji za pomocą email/login i hasła. System umożliwia logowanie, zmianę hasła z mechanizmem weryfikacji (np. przez email) oraz usunięcie konta po potwierdzeniu.
- Kryteria akceptacji:
  1. Użytkownik może utworzyć konto i otrzymać email weryfikacyjny.
  2. Użytkownik loguje się za pomocą poprawnych danych.
  3. Użytkownik może zmienić hasło i usunąć konto po potwierdzeniu.

### US-002: Automatyczne generowanie fiszek z tekstu
- Tytuł: Automatyczne generowanie fiszek przy użyciu AI
- Opis: Po zalogowaniu, użytkownik może wprowadzić tekst, a system korzysta z LLM do wygenerowania dynamicznej listy fiszek. Liczba fiszek jest ustalana w zależności od długości tekstu i zidentyfikowanych kluczowych informacji.
- Kryteria akceptacji:
  1. Użytkownik musi być zalogowany, aby uzyskać dostęp do funkcji generowania fiszek.
  2. Po przesłaniu tekstu system generuje fiszki z podziałem na przód i tył.
  3. Użytkownik widzi informacje o pochodzeniu fiszki (AI).
  4. System umożliwia zaakceptowanie lub odrzucenie wygenerowanych fiszek.

### US-003: Przeglądanie wygenerowanych fiszek
- Tytuł: Przeglądanie fiszek
- Opis: Zalogowany użytkownik może przeglądać wszystkie swoje fiszki, zarówno te wygenerowane przez AI, jak i stworzone ręcznie.
- Kryteria akceptacji:
  1. Dostęp do listy fiszek wymaga zalogowania.
  2. System prezentuje listę wszystkich fiszek powiązanych z kontem użytkownika i dokumentem.
  3. Możliwe jest filtrowanie fiszek według źródła (AI, manualnie) oraz daty utworzenia.

### US-004: Edycja fiszki
- Tytuł: Edycja i modyfikacja fiszek
- Opis: Użytkownik ma możliwość edycji treści fiszki. Po edycji system porównuje procentową zmianę treści, aby określić, czy modyfikacja przekracza próg 50%.
- Kryteria akceptacji:
  1. Po edycji system wylicza procentową zmianę treści fiszki.
  2. Jeśli zmiana przekracza 50%, fiszka jest oznaczona jako zmodyfikowana ręcznie, a oryginał pozostaje jako odrzucony.
  3. Użytkownik otrzymuje odpowiednie powiadomienie o wyniku edycji.

### US-005: Usuwanie fiszki
- Tytuł: Usuwanie fiszki
- Opis: Użytkownik może usunąć wybraną fiszkę, która nie jest już potrzebna.
- Kryteria akceptacji:
  1. Po potwierdzeniu, fiszka jest trwale usuwana z systemu.
  2. Fiszka nie pojawia się już na liście przeglądanych fiszek.

### US-006: Ręczne tworzenie fiszki
- Tytuł: Ręczne tworzenie fiszki przy użyciu modala
- Opis: Zalogowany użytkownik może ręcznie utworzyć nową fiszkę poprzez modal, wprowadzając osobno treść przodu i tyłu.
- Kryteria akceptacji:
  1. Dostęp do funkcji tworzenia fiszek wymaga zalogowania.
  2. Modal umożliwia wprowadzenie i walidację treści.
  3. Po zatwierdzeniu fiszka zostaje zapisana i widoczna w systemie.

### US-007: Monitorowanie statystyk fiszek
- Tytuł: Wyświetlanie statystyk fiszek
- Opis: System gromadzi dane o liczbie fiszek generowanych przez AI, liczbie zaakceptowanych fiszek oraz proporcji fiszek zmodyfikowanych ręcznie.
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do panelu statystyk.
  2. Panel wyświetla procent akceptacji, liczbę fiszek oraz daty utworzenia.

### US-008: Ponowne wysyłanie tekstu do generowania fiszek
- Tytuł: Re-generacja fiszek
- Opis: Użytkownik może ponownie przesłać tekst w celu wygenerowania nowego zestawu fiszek. Fiszki odrzucone nie są wliczane do kryteriów sukcesu.
- Kryteria akceptacji:
  1. Po przesłaniu tekstu system generuje nowy zestaw fiszek bez usuwania poprzednich odrzuconych.
  2. Użytkownik otrzymuje informację o nowej liczbie wygenerowanych fiszek.

### US-009: Grupowanie fiszek według źródła tekstu
- Tytuł: Grupowanie fiszek na podstawie dokumentu źródłowego
- Opis: System automatycznie grupuje fiszki według dokumentu, z którego pochodzi wprowadzony tekst. Dla każdej grupy rejestrowana jest data utworzenia oraz źródło (AI lub modyfikacja ręczna).
- Kryteria akceptacji:
  1. Fiszki generowane z jednego dokumentu są przypisane do tej samej grupy.
  2. Użytkownik może przeglądać fiszki według grup tematycznych.

### US-010: Obsługa błędów komunikacji z API
- Tytuł: Zarządzanie błędami podczas generowania fiszek
- Opis: W przypadku problemów z komunikacją z API generującym fiszki, system wyświetla czytelne komunikaty i umożliwia ponowne wysłanie tekstu.
- Kryteria akceptacji:
  1. W sytuacji awarii API użytkownik otrzymuje komunikat o błędzie.
  2. System umożliwia ponowne wysłanie tekstu do generacji fiszek.

### US-011: Tworzenie i zarządzanie tematami
- Tytuł: Tworzenie i zarządzanie hierarchią tematów
- Opis: Zalogowany użytkownik może tworzyć, przeglądać, edytować i usuwać tematy, które służą do grupowania dokumentów. Tematy mogą mieć strukturę hierarchiczną (tematy nadrzędne i podrzędne).
- Kryteria akceptacji:
  1. Dostęp do zarządzania tematami wymaga zalogowania.
  2. Użytkownik może utworzyć nowy temat podając jego nazwę i opcjonalny opis.
  3. Tematy mogą być tworzone jako nadrzędne lub podrzędne względem innych tematów.
  4. Użytkownik może przeglądać listę wszystkich swoich tematów.
  5. Użytkownik może edytować nazwę i opis istniejącego tematu.
  6. Użytkownik może usunąć temat, o ile nie zawiera on żadnych dokumentów ani podrzędnych tematów.

### US-012: Przeglądanie tematów
- Tytuł: Przeglądanie listy tematów i ich szczegółów
- Opis: Użytkownik ma dostęp do listy wszystkich swoich tematów z możliwością filtrowania i sortowania. Może również przejść do szczegółów tematu, aby zobaczyć zawarte w nim dokumenty.
- Kryteria akceptacji:
  1. System wyświetla listę tematów z informacjami o liczbie dokumentów i dacie utworzenia.
  2. Użytkownik może filtrować tematy według różnych kryteriów.
  3. System wyświetla szczegóły wybranego tematu wraz z listą zawartych w nim dokumentów.

### US-013: Tworzenie dokumentu
- Tytuł: Tworzenie nowego dokumentu w temacie
- Opis: Zalogowany użytkownik może utworzyć nowy dokument w wybranym temacie, podając jego nazwę i treść. Po utworzeniu dokumentu system automatycznie inicjuje proces generowania fiszek przez AI.
- Kryteria akceptacji:
  1. Dostęp do tworzenia dokumentów wymaga zalogowania.
  2. Użytkownik może utworzyć nowy dokument w wybranym temacie.
  3. System waliduje poprawność wprowadzonych danych (niepusta nazwa, odpowiednia długość treści).
  4. Po utworzeniu dokumentu system automatycznie rozpoczyna generowanie fiszek.
  5. Użytkownik jest przekierowany do widoku zatwierdzania wygenerowanych fiszek.

### US-014: Edycja dokumentu
- Tytuł: Edycja istniejącego dokumentu
- Opis: Zalogowany użytkownik może edytować nazwę i treść istniejącego dokumentu. Po edycji treści system oferuje możliwość ponownego wygenerowania fiszek, z ostrzeżeniem o konsekwencjach.
- Kryteria akceptacji:
  1. Dostęp do edycji dokumentów wymaga zalogowania.
  2. Użytkownik może edytować nazwę i treść dokumentu.
  3. System waliduje poprawność wprowadzonych danych.
  4. Po edycji treści system wyświetla monit o możliwości ponownego wygenerowania fiszek.
  5. Jeśli użytkownik zdecyduje się na ponowne generowanie fiszek, system oznacza poprzednie fiszki jako nieaktywne i generuje nowe.

### US-015: Przeglądanie dokumentów
- Tytuł: Przeglądanie listy dokumentów i ich szczegółów
- Opis: Zalogowany użytkownik może przeglądać listę wszystkich dokumentów w temacie oraz szczegóły wybranego dokumentu, w tym powiązane z nim fiszki.
- Kryteria akceptacji:
  1. Dostęp do przeglądania dokumentów wymaga zalogowania.
  2. System wyświetla listę dokumentów w temacie z informacjami o dacie utworzenia i liczbie fiszek.
  3. Użytkownik może filtrować i sortować dokumenty.
  4. System wyświetla szczegóły wybranego dokumentu wraz z listą powiązanych fiszek.
  5. Użytkownik ma dostęp do akcji zarządzania dokumentem (edycja, usunięcie) oraz fiszkkami (dodanie, edycja, usunięcie).

### US-016: Usuwanie dokumentu
- Tytuł: Usuwanie dokumentu i powiązanych fiszek
- Opis: Zalogowany użytkownik może usunąć wybrany dokument, co powoduje również usunięcie wszystkich powiązanych z nim fiszek. System wyświetla ostrzeżenie przed wykonaniem tej operacji.
- Kryteria akceptacji:
  1. Dostęp do usuwania dokumentów wymaga zalogowania.
  2. System wyświetla monit z ostrzeżeniem przed usunięciem dokumentu i powiązanych fiszek.
  3. Po potwierdzeniu, dokument i wszystkie powiązane fiszki są usuwane z systemu.
  4. Użytkownik otrzymuje potwierdzenie pomyślnego usunięcia.

### US-017: Zatwierdzanie fiszek
- Tytuł: Zatwierdzanie fiszek do dokumentu
- Opis: Zalogowany użytkownik może zatwierdzić jedną, wiele lub wszystkie fiszki dokumentu jednocześnie, co znacznie przyspiesza proces akceptacji.
- Kryteria akceptacji:
  1. Dostęp do zatwierdzania fiszek wymaga zalogowania.
  2. System umożliwia zaznaczenie wielu fiszek i zatwierdzenie ich jednym kliknięciem.
  3. Istnieje opcja "Zatwierdź wszystkie" dla fiszek powiązanych z dokumentem.
  4. System wyświetla podsumowanie liczby zatwierdzonych fiszek.
  5. Zatwierdzenie wszystkich fiszek powoduje powrót do widoku document detail.

### US-018: Zarządzanie zależnościami między tematami
- Tytuł: Zachowanie integralności danych podczas zarządzania tematami
- Opis: Zalogowany użytkownik może zarządzać zależnościami między tematami, a system zapobiega usunięciu tematów, które zawierają dokumenty lub podtematy, wymagając od użytkownika opróżnienia tematu przed jego usunięciem.
- Kryteria akceptacji:
  1. Dostęp do zarządzania zależnościami między tematami wymaga zalogowania.
  2. Próba usunięcia tematu zawierającego dokumenty lub podtematy kończy się wyświetleniem komunikatu o błędzie.
  3. System informuje użytkownika o dokładnej liczbie dokumentów i podtematów, które blokują usunięcie.
  4. Po opróżnieniu tematu (przeniesieniu lub usunięciu wszystkich dokumentów i podtematów) temat można usunąć.

### US-019: Rejestracja użytkownika
- Tytuł: Rejestracja nowego użytkownika
- Opis: Użytkownik może zarejestrować się w systemie poprzez dedykowaną stronę rejestracji, podając wymagane dane zgodne z mechanizmem autoryzacji Supabase.
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do strony rejestracji przed zalogowaniem.
  2. Formularz rejestracji zawiera pola: email, hasło (z potwierdzeniem), imię i nazwisko.
  3. System waliduje poprawność wprowadzonych danych (format email, siła hasła).
  4. Po pomyślnej rejestracji użytkownik otrzymuje email weryfikacyjny.
  5. Użytkownik musi potwierdzić email przed uzyskaniem pełnego dostępu do systemu.

### US-020: Logowanie użytkownika
- Tytuł: Logowanie do systemu
- Opis: Użytkownik może zalogować się do systemu poprzez dedykowaną stronę logowania, używając swoich danych uwierzytelniających.
- Kryteria akceptacji:
  1. Użytkownik ma dostęp do strony logowania przed uwierzytelnieniem.
  2. Formularz logowania zawiera pola: email i hasło.
  3. System wyświetla odpowiednie komunikaty w przypadku niepoprawnych danych.
  4. Po pomyślnym zalogowaniu użytkownik jest przekierowany do głównego widoku aplikacji.
  5. System zapamiętuje sesję użytkownika zgodnie z mechanizmem Supabase.

### US-021: Wylogowanie użytkownika
- Tytuł: Bezpieczne wylogowanie z systemu
- Opis: Użytkownik może bezpiecznie wylogować się z systemu, co powoduje zakończenie sesji i przekierowanie do strony logowania.
- Kryteria akceptacji:
  1. W menu użytkownika dostępna jest opcja wylogowania.
  2. Po wylogowaniu sesja użytkownika jest prawidłowo zakończona.
  3. Użytkownik jest przekierowany do strony logowania.
  4. Po wylogowaniu nie ma możliwości powrotu do chronionych widoków bez ponownego zalogowania.

### US-022: Zmiana hasła
- Tytuł: Zmiana hasła użytkownika
- Opis: Użytkownik może zmienić swoje hasło poprzez dedykowany formularz, wymagający podania aktualnego hasła i nowego hasła (z potwierdzeniem).
- Kryteria akceptacji:
  1. W ustawieniach użytkownika dostępna jest opcja zmiany hasła.
  2. Formularz wymaga podania aktualnego hasła w celu weryfikacji.
  3. Nowe hasło musi spełniać wymagania bezpieczeństwa (minimalna długość, złożoność).
  4. System wyświetla potwierdzenie pomyślnej zmiany hasła.
  5. Po zmianie hasła użytkownik musi zalogować się ponownie.

### US-023: Reset hasła
- Tytuł: Resetowanie zapomnianego hasła
- Opis: Użytkownik może zresetować swoje hasło w przypadku jego zapomnienia, poprzez mechanizm wysyłania linku resetującego na zarejestrowany email.
- Kryteria akceptacji:
  1. Na stronie logowania dostępna jest opcja "Zapomniałem hasła".
  2. Użytkownik podaje swój email, na który zostanie wysłany link resetujący.
  3. Link resetujący prowadzi do formularza ustawiania nowego hasła.
  4. Nowe hasło musi spełniać wymagania bezpieczeństwa.
  5. Po pomyślnym zresetowaniu hasła użytkownik może zalogować się nowymi danymi.

### US-024: Zarządzanie sesją
- Tytuł: Automatyczne zarządzanie sesją użytkownika
- Opis: System automatycznie zarządza sesją użytkownika zgodnie z mechanizmem Supabase, w tym odświeżaniem tokenów i obsługą wygaśnięcia sesji.
- Kryteria akceptacji:
  1. System automatycznie odświeża tokeny autoryzacyjne przed ich wygaśnięciem.
  2. W przypadku wygaśnięcia sesji użytkownik jest przekierowany do strony logowania.
  3. Niezapisane zmiany są zachowane przed przekierowaniem do logowania.
  4. System wyświetla odpowiednie komunikaty o stanie sesji.

## 6. Metryki sukcesu

1. 75% fiszek generowanych przez AI musi być zaakceptowanych przez użytkowników.
2. Co najmniej 75% wszystkich fiszek w systemie powinno pochodzić z automatycznego generowania przez AI.
3. Precyzyjna ocena modyfikacji fiszek – zmiana poniżej 50% oznacza fiszkę pozostającą w wersji AI, powyżej 50% skutkuje uznaniem fiszki jako ręcznie modyfikowanej.
4. Niska liczba błędów komunikacji z API oraz wysoka skuteczność ponownych prób generowania fiszek.
5. Utrzymanie wysokiej jakości interfejsu użytkownika z pełną funkcjonalnością operacji CRUD.
6. Efektywna organizacja treści poprzez strukturę tematów i dokumentów – średnio co najmniej 3 dokumenty na temat i 10 fiszek na dokument.
7. Wysoka skuteczność nawigacji w hierarchicznej strukturze danych – średni czas potrzebny na znalezienie konkretnej fiszki nie powinien przekraczać 30 sekund. 