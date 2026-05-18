import { renderHook, act } from "@testing-library/react";
import { expect, describe, it, vi, beforeEach } from "vitest";
import { useDocumentDetail } from "../use-document-detail";

// Mockowanie fetch
global.fetch = vi.fn();

describe("useDocumentDetail", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("powinien załadować dokument przy inicjalizacji", async () => {
    // Przygotowanie: Mockujemy odpowiedź fetch dla dokumentu
    const mockDocument = { id: "123", name: "Test Document", content: "Test content" };

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockDocument),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total: 5 }),
      });

    // Działanie: Renderujemy hook
    const { result } = renderHook(() => useDocumentDetail("123"));

    // Początkowo isLoadingDocument powinno być true
    expect(result.current.isLoadingDocument).toBe(true);

    // Wywołujemy refetch, aby upewnić się, że dane zostaną pobrane
    await act(async () => {
      await result.current.refetch();
    });

    // Sprawdzenie: Weryfikujemy, że hook poprawnie ustawił stan po otrzymaniu danych
    expect(result.current.document).toEqual(mockDocument);
    expect(result.current.isLoadingDocument).toBe(false);
    expect(result.current.documentError).toBeNull();
    expect(result.current.unapprovedAiFlashcardsCount).toBe(5);
  });

  it("powinien obsłużyć błąd przy pobieraniu dokumentu", async () => {
    // Przygotowanie: Mockujemy błąd w odpowiedzi fetch
    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // Działanie: Renderujemy hook
    const { result } = renderHook(() => useDocumentDetail("123"));

    // Wywołujemy refetch, aby upewnić się, że dane zostaną pobrane
    await act(async () => {
      await result.current.refetch();
    });

    // Sprawdzenie: Weryfikujemy, że hook poprawnie obsłużył błąd
    expect(result.current.isLoadingDocument).toBe(false);
    expect(result.current.documentError).toBe("Nie udało się pobrać dokumentu");
    expect(result.current.document).toBeNull();
  });

  it("powinien umożliwić usunięcie dokumentu", async () => {
    // Przygotowanie: Mockujemy poprawną odpowiedź na usunięcie
    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ id: "123", name: "Test" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ total: 0 }),
      })
      .mockResolvedValueOnce({
        ok: true,
      });

    // Mockujemy window.location.href
    const originalLocation = window.location;
    const locationMock = { href: "" };
    Object.defineProperty(window, "location", {
      value: locationMock,
      writable: true,
    });

    // Działanie: Renderujemy hook
    const { result } = renderHook(() => useDocumentDetail("123"));

    // Wywołujemy refetch, aby upewnić się, że dane zostaną pobrane
    await act(async () => {
      await result.current.refetch();
    });

    // Usuwamy dokument
    await act(async () => {
      await result.current.actions.deleteDocument();
    });

    // Sprawdzenie: Weryfikujemy, że fetch został wywołany z odpowiednimi parametrami
    expect(global.fetch).toHaveBeenLastCalledWith("/api/documents/123", {
      method: "DELETE",
    });

    // Przywracamy oryginalne window.location
    Object.defineProperty(window, "location", {
      value: originalLocation,
      writable: true,
    });
  });
});
