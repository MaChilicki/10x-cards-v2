import { vi } from "vitest";
import { render } from "@testing-library/react";
import type { RenderOptions } from "@testing-library/react";

/**
 * Pomocnicze funkcje dla testów Vitest
 */

/**
 * Funkcja mockująca moduł z użyciem wzorca fabryki
 * @param mockImplementation Implementacja mocka
 */
export function createModuleMock<T>(mockImplementation: Partial<T>) {
  return vi.fn(() => mockImplementation);
}

/**
 * Mockowanie fetch API
 * @param data Dane, które ma zwrócić fetch
 * @param status Status HTTP
 */
export function mockFetch<T>(data: T, status = 200) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: vi.fn().mockResolvedValue(data),
    text: vi.fn().mockResolvedValue(JSON.stringify(data)),
  });
}

/**
 * Pomocnicze funkcje dla testów Playwright
 */

/**
 * Generuje unikalny email dla testów
 */
export function generateTestEmail(): string {
  const timestamp = new Date().getTime();
  return `test-${timestamp}@example.com`;
}

/**
 * Generuje losowe hasło dla testów
 */
export function generateTestPassword(): string {
  return `Test${Math.floor(Math.random() * 1000000)}!`;
}

/**
 * Niestandardowa funkcja renderująca z opcjonalnym providerem
 */
export function customRender(ui: Parameters<typeof render>[0], options?: Omit<RenderOptions, "wrapper">) {
  return render(ui, {
    ...options,
  });
}

// Re-eksportuj wszystko z testing-library
export * from "@testing-library/react";
