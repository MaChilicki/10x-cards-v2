# Instrukcja wdrożenia API dokumentów

## Przegląd
Ten dokument zawiera instrukcje dotyczące wdrożenia API dokumentów w aplikacji. API obsługuje podstawowe operacje CRUD na dokumentach oraz integrację z systemem generowania fiszek.

## Wymagania
- Node.js 18+
- Supabase (baza danych)
- Astro 5+

## Kroki wdrożenia

### 1. Przygotowanie środowiska
1. Upewnij się, że wszystkie zależności są zainstalowane:
   ```bash
   npm install
   ```

2. Sprawdź, czy zmienne środowiskowe są poprawnie skonfigurowane:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (dla operacji administracyjnych)

### 2. Weryfikacja przed wdrożeniem
1. Uruchom testy:
   ```bash
   npm run test
   ```

2. Sprawdź zgodność typów:
   ```bash
   npm run typecheck
   ```

3. Uruchom lintera:
   ```bash
   npm run lint
   ```

### 3. Wdrożenie na środowisko stagingowe
1. Zbuduj aplikację:
   ```bash
   npm run build
   ```

2. Wdróż na staging:
   ```bash
   npm run deploy:staging
   ```

3. Wykonaj testy integracyjne na środowisku stagingowym:
   ```bash
   npm run test:e2e:staging
   ```

### 4. Wdrożenie na produkcję
1. Po pomyślnej weryfikacji na stagingu, wdróż na produkcję:
   ```bash
   npm run deploy:prod
   ```

2. Zweryfikuj działanie na produkcji:
   - Sprawdź logi
   - Wykonaj podstawowe operacje CRUD
   - Monitoruj metryki wydajności

## Monitorowanie i utrzymanie

### Logi
- Wszystkie błędy są logowane przez `logger.service`
- Monitoruj szczególnie:
  - Błędy 500 (problemy z bazą danych)
  - Błędy w procesie generowania fiszek
  - Nieprawidłowe żądania (400, 415)

### Metryki
Monitoruj:
- Czas odpowiedzi endpointów
- Liczbę żądań
- Wykorzystanie zasobów bazy danych
- Skuteczność generowania fiszek

### Backup i odzyskiwanie
- Regularne backupy bazy danych (Supabase)
- Plan odzyskiwania po awarii
- Procedury rollback'u

## Rozwiązywanie problemów

### Znane problemy
1. Długi czas generowania fiszek:
   - Monitoruj kolejkę zadań
   - Rozważ skalowanie horizontalne

2. Problemy z wydajnością przy dużych dokumentach:
   - Zoptymalizuj zapytania do bazy
   - Rozważ implementację cache'owania

### Kontakty
- Team deweloperski: dev@example.com
- DevOps: devops@example.com
- Product Owner: po@example.com

## Aktualizacje i utrzymanie
- Regularnie aktualizuj zależności
- Monitoruj wydajność i optymalizuj kod
- Utrzymuj aktualną dokumentację API 