import { renderHook, act } from "@testing-library/react";
import { expect, describe, it, vi, beforeEach } from "vitest";
import { useFlashcardsList } from "../use-flashcards-list";

// Mockujemy moduł fetch, ponieważ useFlashcardsList używa bezpośrednio fetch
global.fetch = vi.fn();

describe("useFlashcardsList", () => {
  beforeEach(() => {
    // Resetujemy wszystkie mocki przed każdym testem
    vi.resetAllMocks();
  });

  it("powinien załadować fiszki przy inicjalizacji", async () => {
    // Przygotowanie: Mockujemy odpowiedź fetch z przykładowymi fiszkami
    const mockFlashcards = [{ id: "1", front_original: "Test", back_original: "Test" }];

    // Mockujemy fetch aby zwrócił JSON z danymi fiszek
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: mockFlashcards,
          pagination: { page: 1, limit: 24, total: 1 },
        }),
    });

    // Działanie: Renderujemy hook z parametrami startowymi
    const { result } = renderHook(() =>
      useFlashcardsList({
        documentId: "123",
        initialSort: { sortBy: "created_at", sortOrder: "desc" },
        initialPage: 1,
        initialItemsPerPage: 24,
        is_approved: true,
        is_disabled: false,
      })
    );

    // Początkowo flashcards powinno być puste
    expect(result.current.flashcards).toEqual([]);
    expect(result.current.isLoading).toBe(true);

    // Używamy act do czekania na aktualizację stanu
    await act(async () => {
      // Czekamy na zakończenie asynchronicznego ładowania danych
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Sprawdzenie: Weryfikujemy, że hook poprawnie ustawił stan po otrzymaniu danych
    expect(result.current.flashcards).toEqual(mockFlashcards);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("powinien obsłużyć zmianę strony", async () => {
    // Przygotowanie: Mockujemy odpowiedź dla pierwszego żądania
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          pagination: { page: 1, limit: 24, total: 50 },
        }),
    });

    // Działanie: Renderujemy hook
    const { result } = renderHook(() =>
      useFlashcardsList({
        documentId: "123",
        initialSort: { sortBy: "created_at", sortOrder: "desc" },
        initialPage: 1,
        initialItemsPerPage: 24,
        is_approved: true,
        is_disabled: false,
      })
    );

    // Czekamy na zakończenie pierwszego ładowania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Przygotowanie: Mockujemy odpowiedź dla drugiego żądania (po zmianie strony)
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          pagination: { page: 2, limit: 24, total: 50 },
        }),
    });

    // Działanie: Zmieniamy stronę
    await act(async () => {
      result.current.setPage(2);
      // Czekamy na zakończenie drugiego ładowania
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Sprawdzenie: Weryfikujemy, że paginacja została zaktualizowana
    expect(result.current.pagination.currentPage).toBe(2);

    // Sprawdzenie: Weryfikujemy, że fetch został wywołany z odpowiednimi parametrami
    expect(global.fetch).toHaveBeenLastCalledWith(expect.stringMatching(/page=2/));
  });

  it("powinien obsłużyć zmianę sortowania", async () => {
    // Przygotowanie: Mockujemy odpowiedź API
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          pagination: { page: 1, limit: 24, total: 0 },
        }),
    });

    // Działanie: Renderujemy hook
    const { result } = renderHook(() =>
      useFlashcardsList({
        documentId: "123",
        initialSort: { sortBy: "created_at", sortOrder: "desc" },
        initialPage: 1,
        initialItemsPerPage: 24,
        is_approved: true,
        is_disabled: false,
      })
    );

    // Czekamy na zakończenie pierwszego ładowania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Przygotowanie odpowiedzi dla drugiego fetch po zmianie sortowania
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          pagination: { page: 1, limit: 24, total: 0 },
        }),
    });

    // Działanie: Zmieniamy parametry sortowania
    await act(async () => {
      result.current.updateSort({ sortBy: "front_modified", sortOrder: "asc" });
      // Czekamy na zakończenie drugiego ładowania
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Sprawdzenie: Weryfikujemy, że sortowanie zostało zaktualizowane
    expect(result.current.sort).toEqual({
      sortBy: "front_modified",
      sortOrder: "asc",
    });

    // Sprawdzenie: Weryfikujemy, że fetch został wywołany z odpowiednimi parametrami sortowania
    expect(global.fetch).toHaveBeenLastCalledWith(expect.stringMatching(/sort=front_modified/));
  });

  it("powinien obsłużyć błąd API", async () => {
    // Przygotowanie: Mockujemy błąd API
    global.fetch = vi.fn().mockRejectedValueOnce(new Error("Błąd serwera"));

    // Działanie: Renderujemy hook
    const { result } = renderHook(() =>
      useFlashcardsList({
        documentId: "123",
        initialSort: { sortBy: "created_at", sortOrder: "desc" },
        initialPage: 1,
        initialItemsPerPage: 24,
        is_approved: true,
        is_disabled: false,
      })
    );

    // Czekamy na zakończenie ładowania (które zakończy się błędem)
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Sprawdzenie: Weryfikujemy, że hook poprawnie zapisał błąd w stanie
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe("Błąd serwera");
    expect(result.current.isLoading).toBe(false);
  });

  it("powinien filtrować fiszki po statusie zatwierdzenia", async () => {
    // Przygotowanie: Mockujemy odpowiedź API z zatwierdzonymi fiszkami
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [{ id: "1", is_approved: true }],
          pagination: { page: 1, limit: 24, total: 1 },
        }),
    });

    // Działanie: Renderujemy hook z filtrem is_approved=true
    renderHook(() =>
      useFlashcardsList({
        documentId: "123",
        initialSort: { sortBy: "created_at", sortOrder: "desc" },
        initialPage: 1,
        initialItemsPerPage: 24,
        is_approved: true,
        is_disabled: false,
      })
    );

    // Czekamy na zakończenie ładowania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Sprawdzenie: Weryfikujemy, że fetch został wywołany z parametrem is_approved=true
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/is_approved=true/));
  });

  it("powinien filtrować fiszki po topicId", async () => {
    // Przygotowanie: Mockujemy odpowiedź API
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () =>
        Promise.resolve({
          data: [],
          pagination: { page: 1, limit: 24, total: 0 },
        }),
    });

    // Działanie: Renderujemy hook z parametrem topicId
    renderHook(() =>
      useFlashcardsList({
        documentId: "123",
        topicId: "456", // Używamy dostępnego w interfejsie parametru topicId
        initialSort: { sortBy: "created_at", sortOrder: "desc" },
        initialPage: 1,
        initialItemsPerPage: 24,
        is_approved: true,
        is_disabled: false,
      })
    );

    // Czekamy na zakończenie ładowania
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // Sprawdzenie: Weryfikujemy, że fetch został wywołany z parametrem topicId
    expect(global.fetch).toHaveBeenCalledWith(expect.stringMatching(/topic_id=456/));
  });
});
