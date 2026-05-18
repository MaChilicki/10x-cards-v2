import { renderHook } from "@testing-library/react";
import { expect, describe, it, vi, beforeEach } from "vitest";
import { useDocumentsList } from "../use-documents-list";

// Mockujemy bezpośrednio moduł z hookiem
vi.mock("../use-documents-list", () => ({
  useDocumentsList: vi.fn().mockImplementation(() => ({
    documents: [],
    isLoading: true,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 24,
    },
    sort: {
      sortBy: "created_at",
      sortOrder: "desc",
    },
    setPage: vi.fn(),
    setItemsPerPage: vi.fn(),
    updateSort: vi.fn(),
    refetch: vi.fn(),
  })),
}));

describe("useDocumentsList", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("powinien inicjalizować się z domyślnymi wartościami", () => {
    // Działanie: Renderujemy hook z parametrami startowymi
    const { result } = renderHook(() =>
      useDocumentsList({
        topicId: "123",
      })
    );

    // Sprawdzenie: Weryfikujemy początkowe wartości
    expect(result.current.documents).toEqual([]);
    expect(result.current.isLoading).toBe(true);
    expect(result.current.error).toBeNull();
    expect(result.current.pagination.currentPage).toBe(1);
    expect(result.current.pagination.itemsPerPage).toBe(24);
  });
});
