# API Plan

## Topics API

### GET /api/topics
- Zwraca listę tematów z paginacją
- Parametry:
  - `page`: numer strony (domyślnie 1)
  - `limit`: liczba elementów na stronę (domyślnie 10)
  - `parent_id`: opcjonalny filtr po temacie nadrzędnym
- Odpowiedź zawiera:
  - `topics`: lista tematów z licznikami dokumentów i fiszek
  - `total`: całkowita liczba tematów

### GET /api/topics/:id
- Zwraca szczegóły pojedynczego tematu
- Zawiera liczniki dokumentów i fiszek

### POST /api/topics
- Tworzy nowy temat
- Wymagane pola:
  - `name`: nazwa tematu
- Opcjonalne pola:
  - `description`: opis tematu
  - `parent_id`: ID tematu nadrzędnego

### PUT /api/topics/:id
- Aktualizuje istniejący temat
- Opcjonalne pola:
  - `name`: nowa nazwa tematu
  - `description`: nowy opis tematu

### DELETE /api/topics/:id
- Usuwa temat
- Kaskadowo usuwa wszystkie powiązane dokumenty i fiszki 