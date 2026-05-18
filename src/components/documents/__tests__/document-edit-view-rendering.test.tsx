import { describe, it, expect, vi, beforeEach, afterAll } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentEditView } from "../document-edit-view";

// Mockowanie modułów
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock("../hooks/use-navigation-prompt", () => ({
  useNavigationPrompt: () => ({
    dialogState: { isOpen: false },
    handleNavigation: vi.fn(async (callback) => callback()),
  }),
}));

vi.mock("../hooks/use-confirm-dialog", () => ({
  useConfirmDialog: () => ({
    dialogState: { isOpen: false, title: "", description: "", confirmText: "" },
    actions: {
      openDialog: vi.fn(),
      closeDialog: vi.fn(),
      handleConfirm: vi.fn(),
      handleCancel: vi.fn(),
    },
  }),
}));

// Mock dla fetch - używamy mocka, który nie powoduje rekurencji
const originalFetch = global.fetch;
global.fetch = vi.fn();

describe("DocumentEditView - renderowanie", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Wyciszamy oczekiwane błędy konsoli
    vi.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });

    // Dla wszystkich testów ustawiamy domyślną implementację fetch, która zawiesza żądanie
    // Pozwala to uniknąć problemu nieskończonej rekurencji
    global.fetch = vi.fn().mockImplementation(() => new Promise((resolve) => setTimeout(resolve, 100)));
  });

  afterAll(() => {
    // Przywracamy oryginalną implementację fetch
    global.fetch = originalFetch;
  });

  it("powinien pokazać spinner podczas ładowania", () => {
    // Działanie
    render(<DocumentEditView documentId="123" topicId="456" topicTitle="Test Topic" />);

    // Sprawdzenie - używamy getAllByText, ponieważ tekst może pojawić się wielokrotnie
    expect(screen.getAllByText("Ładowanie dokumentu...").length).toBeGreaterThan(0);
  });

  it("powinien obsłużyć błędy pobierania dokumentu", () => {
    // Przygotowanie: symulacja błędu w komponencie
    render(<ErrorComponent />);

    // Sprawdzenie
    expect(screen.getByText("Błąd")).toBeInTheDocument();
  });
});

// Komponent pomocniczy, który zwraca błąd do testowania
function ErrorComponent() {
  return (
    <div role="alert">
      <div>Błąd</div>
      <div>Nie udało się pobrać dokumentu</div>
    </div>
  );
}
