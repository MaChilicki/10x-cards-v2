# Plan dokończenia wdrożenia autoryzacji

## 1. Stan obecny

### 1.1. Zrealizowane komponenty
- ✅ login-form.tsx - formularz logowania z walidacją
- ✅ register-form.tsx - formularz rejestracji z walidacją
- ✅ reset-password-form.tsx - formularz resetu hasła
- ✅ set-new-password-form.tsx - formularz ustawiania nowego hasła
- ✅ verify-email.tsx - komponent weryfikacji email
- ✅ auth-layout.tsx - layout dla stron autentykacji
- ✅ auth-card.tsx - komponent karty autentykacji
- ✅ auth-form.tsx - bazowy komponent formularza
- ✅ logout-handler.tsx - obsługa wylogowania
- ✅ logout-dialog.tsx - dialog potwierdzenia wylogowania

### 1.2. Zrealizowane endpointy
- ✅ /api/auth/login - endpoint logowania
- ✅ /api/auth/register - endpoint rejestracji
- ✅ /api/auth/logout - endpoint wylogowania
- ✅ /api/auth/verify-email - endpoint weryfikacji emaila
- ✅ /api/auth/reset-password - endpoint resetu hasła
- ✅ /api/auth/change-password - endpoint zmiany hasła
- ✅ /api/auth/me - endpoint informacji o użytkowniku

### 1.3. Zrealizowane strony Astro
- ✅ /auth/login.astro - strona logowania
- ✅ /auth/register.astro - strona rejestracji
- ✅ /auth/reset-password.astro - strona resetu hasła
- ✅ /auth/verify-email.astro - strona weryfikacji emaila
- ✅ /auth/logout.astro - strona wylogowania
- ✅ /auth/profile.astro - strona profilu (ComingSoon)

### 1.4. Zrealizowane elementy bezpieczeństwa
- ✅ RLS dla wszystkich tabel
- ✅ Polityki dostępu
- ✅ Middleware autoryzacji
- ✅ Obsługa sesji i tokenów
- ✅ Walidacja danych wejściowych

## 2. Do zrealizowania

### 2.1. Strony Astro
- [ ] /auth/set-new-password.astro - strona ustawiania nowego hasła

### 2.2. Testy
- [ ] Testy jednostkowe dla komponentów
- [ ] Testy integracyjne dla endpointów
- [ ] Testy RLS i polityk dostępu
- [ ] Testy przepływów autoryzacji

### 2.3. Dokumentacja
- [ ] Dokumentacja API
- [ ] Dokumentacja komponentów
- [ ] Dokumentacja przepływów autoryzacji
- [ ] Instrukcja wdrożenia

## 3. Plan implementacji

### 3.1. Etap 1 - Strona ustawiania nowego hasła (1 dzień)
1. Implementacja strony /auth/set-new-password.astro
   - Integracja z set-new-password-form
   - Obsługa tokenu resetowania
   - Przekierowania po zmianie hasła
   - Obsługa błędów

### 3.2. Etap 2 - Testy (2-3 dni)
1. Testy jednostkowe
   - Testy komponentów formularzy
   - Testy walidacji
   - Testy obsługi błędów
   - Testy przekierowań

2. Testy integracyjne
   - Testy endpointów API
   - Testy przepływów autoryzacji
   - Testy RLS
   - Testy sesji

### 3.3. Etap 3 - Dokumentacja (1 dzień)
1. Dokumentacja techniczna
   - Dokumentacja API
   - Dokumentacja komponentów
   - Dokumentacja przepływów
   - Instrukcja wdrożenia

## 4. Priorytety

### 4.1. Wysoki
- [ ] Implementacja strony set-new-password.astro
- [ ] Testy jednostkowe
- [ ] Testy integracyjne

### 4.2. Średni
- [ ] Dokumentacja API
- [ ] Dokumentacja komponentów

### 4.3. Niski
- [ ] Dokumentacja przepływów
- [ ] Instrukcja wdrożenia

## 5. Uwagi i Zalecenia

1. ✅ Zachować spójność w obsłudze błędów
2. ✅ Implementować walidację po stronie klienta i serwera
3. [ ] Dodać testy jednostkowe i integracyjne
4. [ ] Dokumentować zmiany w API
5. [ ] Monitorować wydajność i bezpieczeństwo
6. ✅ Utrzymywać spójną notację kebab-case dla nazw plików

## 6. Wytyczne implementacji

### 6.1. Middleware i Sesja
1. ✅ Używać `@supabase/ssr` zamiast `auth-helpers`
2. ✅ Zawsze używać `getAll` i `setAll` do zarządzania cookies
3. ✅ NIE używać pojedynczych metod `get`, `set`, ani `remove` dla cookies
4. ✅ Implementować prawidłowe zarządzanie sesją w middleware oparte na JWT
5. ✅ Przekazywać dane użytkownika przez `Astro.locals`
6. ✅ Wstrzykiwać dane użytkownika do klienta przez `window.__ASTRO_LOCALS__`
7. ✅ Obsługiwać przekierowania dla niezalogowanych użytkowników

### 6.2. Bezpieczeństwo
1. ✅ Ustawić odpowiednie opcje cookies:
   - `httpOnly: true`
   - `secure: true`
   - `sameSite: 'lax'`
2. ✅ Nigdy nie eksponować kluczy Supabase w komponentach klienckich
3. ✅ Walidować wszystkie dane wejściowe po stronie serwera
4. ✅ Implementować prawidłowe logowanie błędów
5. [ ] Obsługiwać niezapisane zmiany przed przekierowaniem

### 6.3. Integracja z Supabase
1. ✅ Używać `createServerClient` z `@supabase/ssr`
2. ✅ Przywrócić i zaimplementować RLS dla wszystkich tabel
3. ✅ Powiązać dane z `user_id` z sesji
4. ✅ Blokować dostęp do chronionych funkcji przed weryfikacją emaila
5. ✅ Obsługiwać wygaśnięcie sesji i odświeżanie tokenów
6. ✅ Implementować bezpieczne zapytania

### 6.4. Bezpieczeństwo Danych
1. ✅ Implementacja RLS dla każdej tabeli
2. ✅ Walidacja `user_id`
3. ✅ Bezpieczne zapytania
4. ✅ Obsługa błędów

## 7. Analiza zgodności istniejących komponentów

### 7.1. Zgodne elementy
1. Walidacja danych:
   - ✅ Użycie Zod do walidacji formularzy
   - ✅ Walidacja po stronie klienta
   - ✅ Obsługa błędów walidacji
   - ✅ Komunikaty błędów w języku polskim

2. Dostępność:
   - ✅ Atrybuty ARIA dla pól formularza
   - ✅ Etykiety dla pól formularza
   - ✅ Obsługa stanów błędów
   - ✅ Komunikaty o błędach

3. UX:
   - ✅ Wskaźniki ładowania
   - ✅ Walidacja w czasie rzeczywistym
   - ✅ Przejrzyste komunikaty błędów
   - ✅ Linki do powiązanych stron

### 7.2. Wymagające poprawy
1. Bezpieczeństwo:
   - ✅ Usunięcie zapisywania danych użytkownika w localStorage
   - [ ] Implementacja obsługi niezapisanych zmian
   - ✅ Dodanie obsługi wygaśnięcia sesji
   - ✅ Bezpieczne przekazywanie danych użytkownika do klienta

2. Integracja z Supabase:
   - ✅ Użycie `@supabase/ssr` zamiast bezpośrednich wywołań API
   - ✅ Implementacja prawidłowego zarządzania sesją
   - ✅ Obsługa odświeżania tokenów
   - ✅ Prawidłowe typowanie danych użytkownika

3. Obsługa błędów:
   - ✅ Bardziej szczegółowe komunikaty błędów
   - ✅ Obsługa różnych typów błędów API
   - ✅ Logowanie błędów po stronie serwera 