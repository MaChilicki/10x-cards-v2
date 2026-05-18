import { z } from "zod";

/**
 * Stałe dla walidacji dokumentów
 */
export const DOCUMENT_VALIDATION = {
  CONTENT_MIN_LENGTH: 1000,
  CONTENT_MAX_LENGTH: 10000,
  NAME_MIN_LENGTH: 1,
  MAX_PAGE_SIZE: 100,
} as const;

/**
 * Schema dla parametrów zapytania GET /api/documents
 */
export const documentsQuerySchema = z.object({
  page: z.coerce
    .number()
    .int("Numer strony musi być liczbą całkowitą")
    .positive("Numer strony musi być większy od 0")
    .default(1),
  limit: z.coerce
    .number()
    .int("Limit wyników musi być liczbą całkowitą")
    .positive("Limit wyników musi być większy od 0")
    .max(DOCUMENT_VALIDATION.MAX_PAGE_SIZE, `Maksymalny limit wyników to ${DOCUMENT_VALIDATION.MAX_PAGE_SIZE}`)
    .default(20),
  sort: z
    .enum(["created_at", "name", "-created_at", "-name", "updated_at", "-updated_at"], {
      errorMap: () => ({
        message: "Dozwolone wartości sortowania: created_at, name, -created_at, -name, updated_at, -updated_at",
      }),
    })
    .default("created_at"),
  name: z.string().optional(),
  topic_id: z.string().uuid().optional(),
});

/**
 * Schema dla tworzenia dokumentu
 */
export const documentCreateSchema = z.object({
  name: z.string().min(DOCUMENT_VALIDATION.NAME_MIN_LENGTH, "Nazwa dokumentu nie może być pusta"),
  content: z
    .string()
    .min(
      DOCUMENT_VALIDATION.CONTENT_MIN_LENGTH,
      `Treść dokumentu musi zawierać co najmniej ${DOCUMENT_VALIDATION.CONTENT_MIN_LENGTH} znaków`
    )
    .max(
      DOCUMENT_VALIDATION.CONTENT_MAX_LENGTH,
      `Treść dokumentu nie może przekraczać ${DOCUMENT_VALIDATION.CONTENT_MAX_LENGTH} znaków`
    ),
  topic_id: z.string().uuid("Nieprawidłowy format UUID dla topic_id"),
});

/**
 * Schema dla aktualizacji dokumentu
 */
export const documentUpdateSchema = z.object({
  name: z.string().min(DOCUMENT_VALIDATION.NAME_MIN_LENGTH, "Nazwa dokumentu nie może być pusta"),
  content: z
    .string()
    .min(
      DOCUMENT_VALIDATION.CONTENT_MIN_LENGTH,
      `Treść dokumentu musi zawierać co najmniej ${DOCUMENT_VALIDATION.CONTENT_MIN_LENGTH} znaków`
    )
    .max(
      DOCUMENT_VALIDATION.CONTENT_MAX_LENGTH,
      `Treść dokumentu nie może przekraczać ${DOCUMENT_VALIDATION.CONTENT_MAX_LENGTH} znaków`
    ),
});

/**
 * Schema dla parametru ID dokumentu
 */
export const documentIdSchema = z.string().uuid("Nieprawidłowy format UUID dla ID dokumentu");

// Eksport typów
export type DocumentsQueryParams = z.infer<typeof documentsQuerySchema>;
export type DocumentCreateParams = z.infer<typeof documentCreateSchema>;
export type DocumentUpdateParams = z.infer<typeof documentUpdateSchema>;
