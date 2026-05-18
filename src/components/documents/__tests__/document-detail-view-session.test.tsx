import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { DocumentDetailView } from "../document-detail-view";
import { toast } from "sonner";

// Mocks
vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

// Mock dla useNavigate
const navigateMock = vi.fn();
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => navigateMock,
}));

// Mock dla useDocumentDetail
vi.mock("../hooks/use-document-detail", () => ({
  useDocumentDetail: () => ({
    document: { id: "doc123", title: "Test Document", topic_id: "topic123" },
    isLoadingDocument: false,
    documentError: null,
    actions: {
      deleteDocument: vi.fn(),
      editDocument: vi.fn(),
    },
    refetch: vi.fn(),
  }),
}));

// Mock dla useFlashcardsList
vi.mock("../../flashcards/hooks/use-flashcards-list", () => ({
  useFlashcardsList: () => ({
    flashcards: [{ id: "1", front_original: "Testowa fiszka", back_original: "Testowa odpowiedź" }],
    isLoading: false,
    error: null,
    pagination: { currentPage: 1, totalPages: 1, totalItems: 1, itemsPerPage: 24 },
    setPage: vi.fn(),
    setItemsPerPage: vi.fn(),
    sort: { sortBy: "created_at", sortOrder: "desc" },
    updateSort: vi.fn(),
    refetch: vi.fn(),
  }),
}));

// Mock dla useConfirmDialog
vi.mock("../hooks/use-confirm-dialog", () => ({
  useConfirmDialog: () => ({
    dialogState: { isOpen: false },
    actions: {
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      handleConfirm: vi.fn(),
    },
  }),
}));

describe("Obsługa wygaśnięcia sesji", () => {
  // Przechowujemy funkcje obsługi zdarzeń
  let eventHandlers: Record<string, EventListener[]> = {};

  beforeEach(() => {
    vi.resetAllMocks();

    // Resetujemy eventHandlers przed każdym testem
    eventHandlers = {};

    // Mockujemy addEventListener bez wywoływania oryginalnej funkcji
    vi.spyOn(window, "addEventListener").mockImplementation((event, handler) => {
      if (!eventHandlers[event]) {
        eventHandlers[event] = [];
      }
      eventHandlers[event].push(handler as EventListener);
    });

    // Mockujemy removeEventListener
    vi.spyOn(window, "removeEventListener").mockImplementation((event, handler) => {
      if (eventHandlers[event]) {
        eventHandlers[event] = eventHandlers[event].filter((h) => h !== handler);
      }
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("powinien dodać obserwator zdarzenia session-expired przy montowaniu komponentu", () => {
    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="doc123" />);

    // Sprawdzenie: Weryfikujemy, że addEventListener został wywołany dla session-expired
    expect(window.addEventListener).toHaveBeenCalledWith("session-expired", expect.any(Function));
  });

  it("powinien przekierować do logowania gdy zostanie wyemitowane zdarzenie session-expired", async () => {
    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="doc123" />);

    // Sprawdzamy czy handler został zarejestrowany
    expect(eventHandlers["session-expired"]).toBeDefined();
    expect(eventHandlers["session-expired"].length).toBeGreaterThan(0);

    // Wywołujemy funkcję obsługi zdarzenia
    eventHandlers["session-expired"][0]({} as Event);

    // Sprawdzenie: Weryfikujemy, że nastąpiło przekierowanie do strony logowania
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Sesja wygasła"));
      expect(navigateMock).toHaveBeenCalledWith("/login");
    });
  });

  it("powinien usunąć obserwator zdarzenia przy odmontowaniu komponentu", () => {
    // Przygotowanie: Renderujemy komponent
    const { unmount } = render(<DocumentDetailView documentId="doc123" />);

    // Zapisujemy liczbę handlerów przed odmontowaniem
    const handlersBeforeUnmount = eventHandlers["session-expired"] ? [...eventHandlers["session-expired"]] : [];
    expect(handlersBeforeUnmount.length).toBeGreaterThan(0);

    // Działanie: Odmontowujemy komponent
    unmount();

    // Sprawdzenie: Weryfikujemy, że removeEventListener został wywołany
    expect(window.removeEventListener).toHaveBeenCalledWith("session-expired", expect.any(Function));

    // Sprawdzamy czy liczba handlerów zmniejszyła się
    const handlersAfterUnmount = eventHandlers["session-expired"] || [];
    expect(handlersAfterUnmount.length).toBeLessThan(handlersBeforeUnmount.length);
  });
});
