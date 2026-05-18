# System autentykacji dla 10xCards

## 1. ARCHITEKTURA INTERFEJSU UŻYTKOWNIKA

### 1.1. Strony i Layouty
- **`/src/layouts/AuthLayout.astro`**
  - Layout dla stron autentykacji
  - Brak górnego menu i topbara
  - Logo aplikacji w nagłówku
  - Wykorzystanie istniejącego komponentu Footer
  - Przekazywanie sesji do komponentów React

- **`/src/layouts/AppLayout.astro`**
  - Layout dla chronionych stron
  - Górne menu z opcjami użytkownika
  - Topbar z nawigacją
  - Wykorzystanie istniejącego komponentu Footer
  - Przekazywanie sesji do komponentów React
  - Obsługa przekierowań dla niezalogowanych

### 1.2. Strony Autentykacji
- **`/src/pages/login.astro`**
  - Formularz logowania
  - Linki do rejestracji i resetu hasła
  - Przekazywanie sesji do LoginForm
  - Przekierowanie do dashboard dla zalogowanych
  - Wykorzystanie AuthLayout (bez topbara i menu)

- **`/src/pages/register.astro`**
  - Formularz rejestracji
  - Walidacja danych
  - Weryfikacja email
  - Przekierowanie do logowania
  - Wykorzystanie AuthLayout (bez topbara i menu)

- **`/src/pages/reset-password.astro`**
  - Formularz resetu hasła
  - Wysłanie linku resetującego
  - Przekierowanie do logowania
  - Wykorzystanie AuthLayout (bez topbara i menu)

- **`/src/pages/set-new-password.astro`**
  - Formularz nowego hasła
  - Walidacja siły hasła
  - Przekierowanie do logowania
  - Wykorzystanie AuthLayout (bez topbara i menu)

### 1.3. Komponenty React
- **`/src/components/auth/LoginForm.tsx`**
  - Integracja z react-hook-form i zod
  - Walidacja danych
  - Obsługa błędów API
  - Przekierowania po zalogowaniu
  - Implementacja ARIA

- **`/src/components/auth/RegisterForm.tsx`**
  - Podobna struktura jak LoginForm
  - Dodatkowe pola i walidacja
  - Weryfikacja email
  - Implementacja ARIA

- **`/src/components/auth/ResetPasswordForm.tsx`**
  - Prosty formularz z polem email
  - Wysłanie linku resetującego
  - Implementacja ARIA

- **`/src/components/auth/SetNewPasswordForm.tsx`**
  - Walidacja siły hasła
  - Sprawdzanie zgodności haseł
  - Implementacja ARIA

- **`/src/components/auth/LogoutDialog.tsx`**
  - Potwierdzenie wylogowania
  - Obsługa stanu ładowania
  - Przekierowanie do logowania

### 1.4. Store i Hooks
- **`/src/stores/auth-store.ts`**
  - Zarządzanie stanem autentykacji
  - Integracja z Supabase Auth
  - Obsługa sesji
  - Przekazywanie stanu do komponentów

- **`/src/hooks/use-auth.ts`**
  - Hook do zarządzania autentykacją
  - Sprawdzanie sesji
  - Obsługa logowania/wylogowania
  - Walidacja dostępu

### 1.5. Walidacja i Błędy
- **Schematy Zod**
```typescript
// Wspólne schematy
const emailSchema = z.string()
  .min(1, "Email jest wymagany")
  .email("Nieprawidłowy format email")

const passwordSchema = z.string()
  .min(1, "Hasło jest wymagane")
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
  .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
  .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny")
```

- **Obsługa błędów**
  - Walidacja po stronie klienta
  - Komunikaty błędów API
  - Logowanie błędów
  - Przekierowania w przypadku błędów

## 2. LOGIKA BACKENDOWA

### 2.1. Endpointy API
- **`/api/auth/session`**
  - Sprawdzanie sesji
  - Zwracanie informacji o użytkowniku
  - Używany przez middleware
  - Obsługa niezapisanych zmian przed przekierowaniem

- **`/api/auth/register`**
  - Walidacja danych
  - Tworzenie użytkownika w Supabase
  - Weryfikacja email

- **`/api/auth/login`**
  - Walidacja danych
  - Logowanie w Supabase
  - Ustawianie cookies sesji

- **`/api/auth/logout`**
  - Wylogowanie z Supabase
  - Usuwanie cookies sesji

- **`/api/auth/reset-password`**
  - Wysłanie linku resetującego
  - Walidacja email

- **`/api/auth/change-password`**
  - Walidacja haseł
  - Aktualizacja w Supabase

- **`/api/auth/verify-email`**
  - Weryfikacja emaila po rejestracji
  - Sprawdzanie statusu weryfikacji
  - Blokowanie dostępu do chronionych funkcji przed weryfikacją

### 2.2. Middleware
- **Sprawdzanie sesji**
  - Dla stron chronionych
  - Przekierowania dla niezalogowanych
  - Przechodzenie dalej dla stron publicznych

### 2.3. Integracja z Astro
- **Konfiguracja**
```typescript
// astro.config.mjs
export default defineConfig({
  output: "server",
  integrations: [react(), sitemap()],
  server: { port: 3000 },
  vite: {
    plugins: [tailwindcss()],
  },
  adapter: node({
    mode: "standalone",
  }),
  experimental: {
    session: true,
  },
});
```

- **Przekazywanie sesji**
  - Sesja przekazywana przez props w index.astro
  - Dostęp do sesji w komponentach React
  - Walidacja dostępu do stron

## 3. SYSTEM AUTENTYKACJI

### 3.1. Supabase Auth
- **Konfiguracja**
  - Inicjalizacja klienta
  - Ustawienia autentykacji
  - Obsługa sesji
  - Wymagana weryfikacja emaila
  - Obsługa niezapisanych zmian

- **Funkcjonalności**
  - Rejestracja użytkownika
  - Logowanie/wylogowanie
  - Reset hasła
  - Weryfikacja email
  - Zarządzanie sesją

### 3.2. Bezpieczeństwo
- **Ochrona danych**
  - Wszystkie dane powiązane z kontem
  - Dostęp tylko po autentykacji
  - Implementacja RLS

- **Walidacja sesji**
  - Sprawdzanie w każdym endpoincie
  - Zwracanie 401 dla braku sesji
  - Bezpieczne przekierowania

### 3.3. Obsługa błędów
- **Błędy walidacji**
  - Komunikaty w języku polskim
  - Wyświetlanie przy polach formularza
  - Walidacja po stronie klienta i serwera

- **Błędy API**
  - Komunikaty w komponencie Alert
  - Logowanie błędów
  - Obsługa różnych typów błędów

## 4. MIGRACJA

### 4.1. Endpointy
- **Aktualizacja istniejących endpointów**
  - Usunięcie DEFAULT_USER_ID
  - Pobieranie user_id z sesji
  - Implementacja walidacji sesji

### 4.2. Dane
- **Migracja danych**
  - Powiązanie z kontami użytkowników
  - Implementacja RLS
  - Aktualizacja zapytań

## 5. MODYFIKACJE ENDPOINTÓW

### 5.1. Endpointy do modyfikacji
- **`/api/topics`**
  - Usunięcie DEFAULT_USER_ID
  - Dodanie sprawdzania sesji
  - Implementacja RLS w Supabase
  - Przekazywanie user_id z sesji

- **`/api/documents`**
  - Usunięcie DEFAULT_USER_ID
  - Dodanie sprawdzania sesji
  - Implementacja RLS w Supabase
  - Przekazywanie user_id z sesji

- **`/api/flashcards`**
  - Usunięcie DEFAULT_USER_ID
  - Dodanie sprawdzania sesji
  - Implementacja RLS w Supabase
  - Przekazywanie user_id z sesji

- **`/api/study-sessions`**
  - Usunięcie DEFAULT_USER_ID
  - Dodanie sprawdzania sesji
  - Implementacja RLS w Supabase
  - Przekazywanie user_id z sesji

- **`/api/user-statistics`**
  - Usunięcie DEFAULT_USER_ID
  - Dodanie sprawdzania sesji
  - Implementacja RLS w Supabase
  - Przekazywanie user_id z sesji

### 5.2. Zmiany w zapytaniach
- **Supabase Queries**
  - Dodanie warunków WHERE z user_id
  - Implementacja RLS dla każdej tabeli
  - Aktualizacja JOIN-ów
  - Dodanie walidacji dostępu

### 5.3. Migracja danych
- **Proces migracji**
  - Utworzenie kopii zapasowej danych
  - Aktualizacja user_id w istniejących rekordach
  - Weryfikacja integralności danych
  - Testowanie nowych zapytań

### 5.4. Testowanie
- **Scenariusze testowe**
  - Testy autoryzacji dla każdego endpointu
  - Testy RLS w Supabase
  - Testy przekierowań
  - Testy obsługi błędów

## 6. INTEGRACJA Z UI

### 6.1. Komponenty Shadcn/ui
- **Formularze**
  - Wykorzystanie komponentów Form, Input, Button
  - Integracja z react-hook-form
  - Obsługa stanów ładowania
  - Wyświetlanie błędów walidacji

- **Modale i Dialogi**
  - LogoutDialog z potwierdzeniem
  - Alert dla komunikatów błędów
  - LoadingSpinner dla stanów ładowania

- **Nawigacja**
  - Menu użytkownika w topbarze (tylko dla stron chronionych)
  - Linki do stron autentykacji
  - Przekierowania po akcjach

- **Logo i Stopka**
  - **Logo**
    - Wykorzystanie `@logo.svg` w komponencie Card
    - Responsywność (h-16 na desktop, h-12 na mobile)
    - Alt text dla dostępności
    - Link do strony głównej
  
  - **Stopka**
    - Wykorzystanie istniejącego komponentu `Footer`
    - Stała pozycja na dole strony
    - Tekst copyright w języku polskim
    - Responsywność (py-4 na desktop, py-2 na mobile)
    - Styl zgodny z design systemem (text-sm text-muted-foreground)
    - Link do licencji MIT
    - Logo i nazwa aplikacji

### 6.2. Stany i Efekty
- **Zarządzanie stanem**
  - Stan sesji w auth-store
  - Stan ładowania w formularzach
  - Stan błędów i komunikatów
  - Stan walidacji formularzy

- **Efekty i Hooks**
  - useAuth dla zarządzania autentykacją
  - useEffect dla sprawdzania sesji
  - useRouter dla nawigacji
  - useForm dla formularzy

### 6.3. Obsługa Błędów UI
- **Komunikaty błędów**
  - Walidacja formularzy
  - Błędy API
  - Błędy autoryzacji
  - Błędy sesji

- **Stany ładowania**
  - Formularze
  - Przekierowania
  - Akcje użytkownika
  - Sprawdzanie sesji

## 7. BEZPIECZEŃSTWO I WALIDACJA

### 7.1. Ochrona Danych
- **RLS w Supabase**
  - Polityki dostępu dla każdej tabeli
  - Powiązanie z user_id
  - Brak dostępu do danych innych użytkowników
  - Walidacja uprawnień
  - Blokada dostępu przed weryfikacją emaila

- **Sesja i Tokeny**
  - Bezpieczne przechowywanie tokenów
  - Odświeżanie sesji
  - Obsługa wygaśnięcia sesji
  - Przekierowania bezpieczeństwa

### 7.2. Walidacja Danych
- **Formularze**
  - Walidacja po stronie klienta
  - Walidacja po stronie serwera
  - Komunikaty błędów w języku polskim
  - Obsługa różnych typów błędów
  - Walidacja aktualnego hasła przy zmianie
  - Obsługa niezapisanych zmian przed przekierowaniem

- **API**
  - Walidacja parametrów
  - Walidacja uprawnień
  - Obsługa błędów
  - Logowanie błędów

## 8. TESTY I WALIDACJA

### 8.1. Testy Jednostkowe
- **Komponenty**
  - Testy formularzy
  - Testy modali
  - Testy nawigacji
  - Testy stanów

- **Hooks i Store**
  - Testy useAuth
  - Testy auth-store
  - Testy walidacji
  - Testy sesji

### 8.2. Testy Integracyjne
- **API**
  - Testy endpointów
  - Testy autoryzacji
  - Testy RLS
  - Testy błędów

- **UI**
  - Testy przepływów
  - Testy przekierowań
  - Testy formularzy
  - Testy komunikatów

### 8.3. Testy Wydajności
- **Obciążenie**
  - Testy sesji
  - Testy formularzy
  - Testy API
  - Testy RLS