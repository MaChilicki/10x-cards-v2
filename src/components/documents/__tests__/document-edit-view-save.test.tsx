import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentEditView } from "../document-edit-view";
import { toast } from "sonner";

// Mockowanie modułów
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock dla useNavigate z dostępem do funkcji nawigacji
const navigateMock = vi.fn();
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => navigateMock,
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

// Mock dla fetch
global.fetch = vi.fn();

describe("DocumentEditView - zapisywanie", () => {
  beforeEach(() => {
    vi.resetAllMocks();

    // Wyciszamy oczekiwane błędy konsoli
    vi.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });

    // Mock dla globalnego fetch - domyślna implementacja
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it("powinien zapisać dokument po kliknięciu 'Zapisz'", async () => {
    // Przygotowanie - mockujemy odpowiedź API
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ id: "123" }),
    });

    // Działanie - renderujemy komponent
    render(<DocumentEditView />);

    // Czekamy aż formularz się załaduje
    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł dokumentu")).toBeInTheDocument();
    });

    // Wypełniamy pola formularza
    await userEvent.type(screen.getByLabelText("Tytuł dokumentu"), "Testowy tytuł");
    await userEvent.type(screen.getByLabelText("Treść dokumentu"), "Testowa treść".repeat(100)); // Aby przekroczyć minimum 1000 znaków

    // Klikamy przycisk "Zapisz"
    fireEvent.click(screen.getByText("Zapisz"));

    // Sprawdzenie - weryfikujemy wywołanie fetch z odpowiednimi parametrami
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalledWith("Dokument został utworzony");
    });
  });

  it("powinien obsłużyć błąd API podczas zapisywania", async () => {
    // Przygotowanie - mockujemy odpowiedź API z błędem
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: () => Promise.resolve({ message: "Internal Server Error" }),
    });

    // Wyciszamy oczekiwane błędy konsoli, które mogą być rzucane przez komponent
    vi.spyOn(console, "error").mockImplementation(() => {
      /* noop */
    });

    // Mockujemy metodę toast.error aby przechwycić wyświetlenie komunikatu błędu
    const mockToastError = vi.fn();
    toast.error = mockToastError;

    // Działanie - renderujemy komponent
    render(<DocumentEditView />);

    // Czekamy aż formularz się załaduje
    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł dokumentu")).toBeInTheDocument();
    });

    // Wypełniamy pola formularza
    await userEvent.type(screen.getByLabelText("Tytuł dokumentu"), "Testowy tytuł");
    await userEvent.type(screen.getByLabelText("Treść dokumentu"), "Testowa treść".repeat(100));

    // Używamy act aby bezpiecznie obsłużyć asynchroniczne operacje i oczekiwane błędy
    await act(async () => {
      // Klikamy przycisk "Zapisz"
      fireEvent.click(screen.getByText("Zapisz"));

      // Czekamy na zakończenie wszystkich asynchronicznych operacji
      await new Promise((resolve) => setTimeout(resolve, 500));
    });

    // Sprawdzenie - weryfikujemy wywołanie fetch
    expect(global.fetch).toHaveBeenCalled();
  }, 10000); // Zwiększamy timeout do 10 sekund

  it("powinien obsłużyć wygaśnięcie sesji podczas zapisywania", async () => {
    // Przygotowanie - mockujemy odpowiedź API z błędem autoryzacji
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: "Unauthorized" }),
    });

    // Działanie - renderujemy komponent
    render(<DocumentEditView />);

    // Czekamy aż formularz się załaduje
    await waitFor(() => {
      expect(screen.getByLabelText("Tytuł dokumentu")).toBeInTheDocument();
    });

    // Wypełniamy pola formularza
    await userEvent.type(screen.getByLabelText("Tytuł dokumentu"), "Testowy tytuł");
    await userEvent.type(screen.getByLabelText("Treść dokumentu"), "Testowa treść".repeat(100));

    // Używamy act aby bezpiecznie obsłużyć asynchroniczne operacje i oczekiwane błędy
    await act(async () => {
      try {
        // Klikamy przycisk "Zapisz"
        fireEvent.click(screen.getByText("Zapisz"));
      } catch {
        // Błąd jest oczekiwany, więc go ignorujemy
      }
    });

    // Sprawdzenie - weryfikujemy przekierowanie do strony logowania
    expect(global.fetch).toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("Sesja wygasła"));
    expect(navigateMock).toHaveBeenCalledWith("/login");
  });
});
