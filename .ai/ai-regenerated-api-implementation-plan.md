# Plan wdrożenia endpointu API: POST /api/flashcards/ai-regenerate

## 1. Przegląd punktu końcowego
Endpoint do regeneracji fiszek dla istniejącego dokumentu lub tekstu. Usuwa wszystkie fiszki AI dokumentu (hard-delete) niezależnie od ich statusu (wylaczone, zatwierdzone) i generuje nowe, zapewniając aktualizację zestawu fiszek.

## 2. Szczegóły żądania
- Metoda HTTP: POST
- Struktura URL: `/api/flashcards/ai-regenerate`
- Parametry:
  - Wymagane: brak (ale co najmniej document_id lub text musi być dostarczony)
  - Opcjonalne: brak
- Request Body:
  ```typescript
  {
    text?: string,
    document_id?: string,
    topic_id?: string,
    force_regenerate?: boolean
  }
  ```

## 3. Wykorzystywane typy
```typescript
// Schema DTO dla validacji wejścia
export const flashcardAiRegenerateSchema = z.object({
  text: z.string()
    .min(1000, "Tekst musi mieć co najmniej 1000 znaków")
    .max(10000, "Tekst nie może przekraczać 10000 znaków")
    .optional(),
  document_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  topic_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  force_regenerate: z.boolean().default(false).optional()
}).refine(
  (data) => data.text !== undefined || data.document_id !== undefined,
  { message: "Musisz podać tekst lub identyfikator dokumentu" }
);

// Response DTO
interface AiRegenerateResponseDto {
  flashcards: FlashcardDto[];
  disabled_count: number;
}
```

## 4. Szczegóły odpowiedzi
- Status 200 OK:
  ```typescript
  {
    flashcards: [
      {
        id: string,
        user_id: string,
        document_id: string | null,
        topic_id: string | null,
        front_original: string,
        back_original: string,
        front_modified: string | null,
        back_modified: string | null,
        source: "ai",
        is_modified: boolean,
        is_approved: boolean,
        modification_percentage: number,
        is_disabled: boolean,
        created_at: string,
        updated_at: string
      },
      // ... więcej fiszek
    ],
    disabled_count: number
  }
  ```
- Status 400 Bad Request:
  ```typescript
  {
    error: {
      code: string,
      message: string,
      details: any
    }
  }
  ```
- Status 404 Not Found:
  ```typescript
  {
    error: {
      code: "DOCUMENT_NOT_FOUND",
      message: "Nie znaleziono dokumentu o podanym ID"
    }
  }
  ```
- Status 500 Internal Server Error:
  ```typescript
  {
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: string,
      details?: string
    }
  }
  ```

## 5. Przepływ danych
1. Walidacja danych wejściowych za pomocą schemy Zod
2. Jeśli podano document_id:
   - Sprawdzenie istnienia dokumentu
   - Pobranie tekstu dokumentu
   - Pobranie liczby wszystkich dotychczasowych fiszek AI.
   - Usunięcie wszystkich fiszek, które mają source="AI".
3. Generowanie nowych fiszek przez API AI - za pomocą generateFlashcards z /src/lib/services/ai-generate.service.ts
4. Zapisanie nowych fiszek w bazie danych
5. Zwrócenie nowych fiszek wraz z liczbą wyłączonych

## 6. Względy bezpieczeństwa
- Walidacja danych wejściowych za pomocą Zod
- Sprawdzenie właściciela dokumentu przed regeneracją fiszek
- Filtrowanie fiszek tylko dla użytkownika wykonującego żądanie
- Sanityzacja generowanych treści przed zapisem
- Uwierzytelnianie użytkownika przez Supabase (z `context.locals`)
- Zabezpieczenie przed atakami typu SQL Injection

## 7. Obsługa błędów
- Nieprawidłowy format JSON: 400 Bad Request
- Nieprawidłowe dane wejściowe (walidacja): 400 Bad Request
- Brak obowiązkowych pól (tekst lub document_id): 400 Bad Request
- Dokument nie istnieje: 404 Not Found
- Niewystarczające uprawnienia: 403 Forbidden
- Błąd integracji z AI: 500 Internal Server Error
- Błąd bazy danych: 500 Internal Server Error

## 8. Rozważania dotyczące wydajności
- Indeksy bazy danych dla `flashcards.document_id` są już zdefiniowane
- Operacja usuwania istniejących fiszek (hard-delete) powinna być wykonana w jednej transakcji
- Generacja może trwać długo, należy rozważyć mechanizm timeoutu lub progresywnej odpowiedzi
- Limitowanie liczby fiszek do regeneracji na pojedyncze żądanie

## 9. Etapy wdrożenia

### 1. Utworzenie pliku endpointu
Utworzenie pliku `src/pages/api/flashcards/ai-regenerate.ts`:

```typescript
import type { APIRoute } from "astro";
import { AiGenerateService } from "../../../lib/services/ai-generate.service";
import { flashcardAiRegenerateSchema } from "../../../lib/schemas/ai-regenerate.schema";
import { logger } from "../../../lib/services/logger.service";

export const prerender = false;

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Sprawdzanie nagłówka Content-Type
    if (!request.headers.get("Content-Type")?.includes("application/json")) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_CONTENT_TYPE",
            message: "Nieprawidłowy format danych",
            details: "Wymagany Content-Type: application/json",
          },
        }),
        {
          status: 415,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Parsowanie body requestu
    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_JSON",
            message: "Nieprawidłowy format JSON",
            details: "Nie można sparsować body requestu",
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Walidacja danych wejściowych
    const validationResult = flashcardAiRegenerateSchema.safeParse(body);
    if (!validationResult.success) {
      logger.info("Nieprawidłowe dane wejściowe dla regeneracji fiszek AI:");
      logger.error("Szczegóły błędów walidacji:", validationResult.error.errors);
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Nieprawidłowe dane wejściowe",
            details: validationResult.error.format(),
          },
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Inicjalizacja serwisu i regeneracja fiszek
    const aiService = new AiGenerateService(locals.supabase);
    const result = await aiService.regenerateFlashcards(validationResult.data);

    logger.debug("Pomyślnie zregenerowano fiszki AI");

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Obsługa specyficznych błędów
    if (error instanceof Error) {
      if (error.message.includes("not found") || error.message.includes("nie znaleziono")) {
        return new Response(
          JSON.stringify({
            error: {
              code: "DOCUMENT_NOT_FOUND",
              message: "Nie znaleziono dokumentu o podanym ID",
              details: error.message,
            },
          }),
          {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    // Ogólna obsługa błędów
    logger.error("Błąd podczas regenerowania fiszek AI:", error);
    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "Wystąpił błąd podczas regenerowania fiszek",
          details: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
};
```

### 2. Utworzenie schematu walidacji
Utworzenie pliku `src/lib/schemas/ai-regenerate.schema.ts`:

```typescript
import { z } from "zod";

export const flashcardAiRegenerateSchema = z.object({
  text: z
    .string()
    .min(1000, "Tekst musi mieć co najmniej 1000 znaków")
    .max(10000, "Tekst nie może przekraczać 10000 znaków")
    .optional(),
  document_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  topic_id: z.string().uuid("Nieprawidłowy format UUID").optional(),
  force_regenerate: z.boolean().default(false).optional()
}).refine(
  (data) => data.text !== undefined || data.document_id !== undefined,
  { message: "Musisz podać tekst lub identyfikator dokumentu" }
);

export type FlashcardAiRegenerateSchema = typeof flashcardAiRegenerateSchema;
```

### 3. Rozszerzenie serwisu AI-generate
Dodanie nowej metody do serwisu w `src/lib/services/ai-generate.service.ts`:

```typescript
async regenerateFlashcards(data: z.infer<typeof flashcardAiRegenerateSchema>): Promise<AiRegenerateResponseDto> {
  try {
    // Inicjalizacja licznika wyłączonych fiszek
    let disabledCount = 0;
    let textToProcess = data.text;

    // Jeśli podano document_id, pobierz dokument i jego tekstową zawartość
    if (data.document_id) {
      logger.debug(`Regeneracja fiszek dla dokumentu: ${data.document_id}`);
      
      // Sprawdzenie istnienia dokumentu
      const { data: document, error: documentError } = await this.supabase
        .from("documents")
        .select("*")
        .eq("id", data.document_id)
        .single();
      
      if (documentError || !document) {
        throw new Error(`Nie znaleziono dokumentu o ID: ${data.document_id}`);
      }
      
      // Ustawienie tekstowej zawartości dokumentu jako źródło do generacji fiszek
      textToProcess = document.content;
      
      // Wyłączenie istniejących fiszek AI (soft-delete)
      const { data: updatedFlashcards, error: updateError } = await this.supabase
        .from("flashcards")
        .update({ is_disabled: true, updated_at: new Date().toISOString() })
        .eq("document_id", data.document_id)
        .eq("source", "ai")
        .eq("is_disabled", false)
        .select("id");
      
      if (updateError) {
        throw new Error(`Błąd podczas wyłączania istniejących fiszek: ${updateError.message}`);
      }
      
      disabledCount = updatedFlashcards?.length || 0;
      logger.info(`Wyłączono ${disabledCount} istniejących fiszek AI dla dokumentu ${data.document_id}`);
    }
    
    // Sprawdzenie czy text jest dostępny do przetworzenia
    if (!textToProcess) {
      throw new Error("Brak tekstu do przetworzenia. Podaj tekst lub poprawne ID dokumentu.");
    }
    
    // Wygenerowanie nowych fiszek z tekstu
    const aiGenerateDto: FlashcardAiGenerateDto = {
      text: textToProcess,
      topic_id: data.topic_id,
      document_id: data.document_id
    };
    
    const generationResult = await this.generateFlashcards(aiGenerateDto);
    
    return {
      flashcards: generationResult.flashcards,
      disabled_count: disabledCount
    };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
    logger.error(`Błąd podczas regeneracji fiszek: ${errorMessage}`, error);
    throw error;
  }
}
```

### 4. Dodanie typów AiRegenerateResponseDto
Dodanie interfejsu do pliku `src/types.ts`:

```typescript
// Dodać do sekcji Flashcard DTOs
export interface AiRegenerateResponseDto {
  flashcards: FlashcardProposalDto[];
  disabled_count: number;
}
```

### 5. Dodanie testów jednostkowych
Utworzenie pliku `src/pages/api/flashcards/__tests__/ai-regenerate.test.ts`:

```typescript
// Podstawowe testy dla endpointu ai-regenerate
```

### 6. Dokumentacja API
Dodanie dokumentacji nowego endpointu.

### 7. Testy integracyjne
Przeprowadzenie testów integracyjnych z bazą danych Supabase. 