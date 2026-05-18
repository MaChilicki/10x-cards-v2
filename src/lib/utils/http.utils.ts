import { ZodError } from "zod";
import { logger } from "../services/logger.service";

/**
 * Stałe dla kodów statusów HTTP
 */
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  UNSUPPORTED_MEDIA_TYPE: 415,
  INTERNAL_SERVER_ERROR: 500,
} as const;

/**
 * Konfiguracja dla odpowiedzi HTTP
 */
const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
} as const;

/**
 * Tworzy odpowiedź HTTP z danymi
 */
export function createJsonResponse(data: unknown, status: number = HTTP_STATUS.OK) {
  return new Response(JSON.stringify(data), {
    status,
    headers: DEFAULT_HEADERS,
  });
}

/**
 * Tworzy odpowiedź z błędem
 */
export function createErrorResponse(
  message: string,
  details?: unknown,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
) {
  return new Response(
    JSON.stringify({
      error: message,
      details: details ?? "Brak szczegółów",
    }),
    {
      status,
      headers: DEFAULT_HEADERS,
    }
  );
}

/**
 * Obsługuje błędy walidacji Zod
 */
export function handleZodError(error: ZodError) {
  logger.error("Błąd walidacji:", error.errors);
  return createErrorResponse("Nieprawidłowe dane wejściowe", error.errors, HTTP_STATUS.BAD_REQUEST);
}

/**
 * Obsługuje nieoczekiwane błędy
 */
export function handleUnexpectedError(error: unknown, context: string) {
  logger.error(`Nieoczekiwany błąd podczas ${context}:`, error);
  return createErrorResponse("Wystąpił nieoczekiwany błąd", error instanceof Error ? error.message : "Nieznany błąd");
}

/**
 * Sprawdza czy request ma prawidłowy Content-Type
 */
export function validateContentType(request: Request, expectedType = "application/json") {
  const contentType = request.headers.get("Content-Type");
  if (!contentType?.includes(expectedType)) {
    return createErrorResponse(
      "Nieprawidłowy format danych",
      `Wymagany Content-Type: ${expectedType}`,
      HTTP_STATUS.UNSUPPORTED_MEDIA_TYPE
    );
  }
  return null;
}
