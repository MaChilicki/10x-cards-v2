import type { APIContext, APIRoute } from "astro";
import { vi, expect } from "vitest";
import type { SupabaseClient } from "../../src/db/supabase.client";

/* eslint-disable @typescript-eslint/no-namespace */
declare global {
  namespace App {
    interface Locals {
      authorized?: boolean;
      userId?: string;
    }
  }
}
/* eslint-enable @typescript-eslint/no-namespace */

export type TestContext = Pick<APIContext, "locals" | "params" | "request">;

type RequestBody = Record<string, unknown>;

// Tworzymy mockową implementację Supabase
const mockSupabase = () => {
  return {
    from: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    data: null,
    error: null,
    auth: {
      signOut: vi.fn(),
      signInWithPassword: vi.fn(),
      signUp: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn(),
    },
  } as unknown as SupabaseClient;
};

/**
 * Funkcja pomocnicza do tworzenia mockowanego loggera
 */
export const createMockedLogger = () => ({
  error: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
});

/**
 * Funkcja pomocnicza do tworzenia mockowanego serwisu autoryzacji
 */
export const createMockedAuthService = () => ({
  checkAuthorization: vi.fn().mockImplementation((locals) => {
    if (locals.authorized === false) {
      return {
        authorized: false,
        response: new Response(JSON.stringify({ error: "Unauthorized" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }),
      };
    }
    return {
      authorized: true,
      userId: locals.userId || "test-user-id",
    };
  }),
});

/**
 * Tworzy mockowany obiekt kontekstu API dla testów
 */
export const createMockContext = (params: Partial<TestContext> = {}): APIContext =>
  ({
    locals: {
      authorized: true,
      userId: "test-user-id",
      supabase: mockSupabase(),
      session: null,
      user: null,
      supabaseUrl: "https://example.com",
      supabaseAnonKey: "test-key",
    },
    params: {},
    request: new Request("https://example.com"),
    ...params,
  }) as APIContext;

/**
 * Tworzy mockowany obiekt żądania HTTP
 */
export const createMockRequest = (
  url = "https://example.com",
  method = "GET",
  headers: Record<string, string> = { "Content-Type": "application/json" },
  body?: string | RequestBody
): Request => {
  const options: RequestInit = {
    method,
    headers,
  };

  if (body !== undefined) {
    if (typeof body === "string") {
      options.body = body;
    } else {
      options.body = JSON.stringify(body);
    }
  }

  return new Request(url, options);
};

/**
 * Wykonuje test dla przypadku nieautoryzowanego żądania
 * @param handler Handler API do przetestowania
 * @param mockParams Opcjonalne parametry kontekstu
 */
export const testUnauthorizedRequest = async (handler: APIRoute, mockParams: Partial<TestContext> = {}) => {
  const mockContext = createMockContext({
    locals: {
      authorized: false,
      supabase: mockSupabase(),
      session: null,
      user: null,
      supabaseUrl: "https://example.com",
      supabaseAnonKey: "test-key",
    },
    ...mockParams,
  });

  const response = await handler(mockContext);

  expect(response.status).toBe(401);
  const data = await response.json();
  expect(data).toHaveProperty("error");

  return { response, data };
};

/**
 * Wykonuje test dla przypadku nieprawidłowego typu zawartości
 * @param handler Handler API do przetestowania
 * @param url Adres URL (opcjonalny)
 */
export const testInvalidContentType = async (handler: APIRoute, url = "https://example.com") => {
  const request = createMockRequest(url, "POST", { "Content-Type": "text/plain" }, "test");

  const mockContext = createMockContext({
    request,
  });

  const response = await handler(mockContext);

  expect(response.status).toBe(415);
  const data = await response.json();
  expect(data.error).toHaveProperty("code", "INVALID_CONTENT_TYPE");

  return { response, data };
};

/**
 * Wykonuje test dla przypadku nieprawidłowego JSON
 * @param handler Handler API do przetestowania
 * @param url Adres URL (opcjonalny)
 * @param method Metoda HTTP (opcjonalna)
 */
export const testInvalidJson = async (handler: APIRoute, url = "https://example.com", method = "POST") => {
  const request = createMockRequest(url, method, { "Content-Type": "application/json" }, "{invalid-json");

  const mockContext = createMockContext({
    request,
  });

  const response = await handler(mockContext);

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toHaveProperty("code", "INVALID_JSON");

  return { response, data };
};

/**
 * Wykonuje test dla przypadku nieprawidłowej walidacji danych
 * @param handler Handler API do przetestowania
 * @param invalidBody Nieprawidłowe dane wejściowe
 * @param url Adres URL (opcjonalny)
 * @param method Metoda HTTP (opcjonalna)
 */
export const testValidationError = async (
  handler: APIRoute,
  invalidBody: RequestBody,
  url = "https://example.com",
  method = "POST"
) => {
  const request = createMockRequest(url, method, { "Content-Type": "application/json" }, invalidBody);

  const mockContext = createMockContext({
    request,
  });

  const response = await handler(mockContext);

  expect(response.status).toBe(400);
  const data = await response.json();
  expect(data.error).toHaveProperty("code", "VALIDATION_ERROR");

  return { response, data };
};
