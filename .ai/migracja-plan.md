# Plan migracji dla zmiany relacji documents-topics

## Problem
Obecnie dokumenty mogą być powiązane z wieloma tematami poprzez tabelę pośrednią `document_topics`. Chcemy zmienić tę relację na jeden-do-wielu, gdzie każdy dokument może należeć tylko do jednego tematu.

## Analiza obecnego kodu

Po analizie kodu endpointu `/api/topics/[id]` oraz serwisu `TopicsService` zauważyłem, że logika już przewiduje sprawdzanie dokumentów po polu `topic_id`. Fragmenty kodu w `topics.service.ts`:

```typescript
// Sprawdzenie czy temat ma przypisane dokumenty
const { data: documents, error: docError } = await this.supabase
  .from('documents')
  .select('id, name')
  .eq('topic_id', id);

if (docError) {
  throw new Error(`Błąd podczas sprawdzania dokumentów: ${docError.message}`);
}

if (documents && documents.length > 0) {
  throw new Error('Nie można usunąć tematu, który ma przypisane dokumenty');
}
```

To oznacza, że część kodu backendowego już jest przygotowana na zmianę struktury bazy danych.

## Kroki migracji

### 1. Dodanie kolumny topic_id do tabeli documents
```sql
ALTER TABLE documents ADD COLUMN topic_id UUID REFERENCES topics(id) ON DELETE SET NULL;
```

### 2. Utworzenie indeksu dla nowej kolumny
```sql
CREATE INDEX idx_documents_topic_id ON documents(topic_id);
```

### 3. Przepisanie wartości z tabeli pośredniej
W przypadku, gdy dokument jest powiązany z wieloma tematami, wybieramy pierwszy z nich (według daty utworzenia powiązania):
```sql
UPDATE documents d
SET topic_id = dt.topic_id
FROM (
  SELECT DISTINCT ON (document_id) document_id, topic_id
  FROM document_topics
  ORDER BY document_id, created_at
) dt
WHERE d.id = dt.document_id;
```

### 4. Raport dokumentów z wieloma tematami
Generujemy raport informacyjny o dokumentach, które były powiązane z wieloma tematami (mogą wymagać ręcznej weryfikacji):
```sql
DO $$
DECLARE
  multi_topic_docs INTEGER;
BEGIN
  SELECT COUNT(DISTINCT document_id) INTO multi_topic_docs
  FROM (
    SELECT document_id
    FROM document_topics
    GROUP BY document_id
    HAVING COUNT(*) > 1
  ) t;
  
  RAISE NOTICE 'Dokumentów z wieloma tematami: %', multi_topic_docs;
END $$;
```

### 5. Usunięcie tabeli pośredniej
```sql
DROP TABLE document_topics;
```

## Uwagi
1. Migracja zakłada, że w przypadku dokumentów powiązanych z wieloma tematami, zostanie zachowane tylko jedno powiązanie.
2. Należy zweryfikować dokumenty, które były powiązane z wieloma tematami, czy wybór pierwszego tematu jest odpowiedni.
3. Po wykonaniu migracji konieczne będzie dostosowanie endpointów API obsługujących dokumenty i tematy.

## Kolejne kroki po migracji
1. Aktualizacja endpoint'u `/api/topics/[id]` dotyczącego usuwania tematów
2. Aktualizacja pozostałych endpointów, które korzystały z tabeli `document_topics`
3. Aktualizacja frontendu w zakresie obsługi dokumentów i tematów 