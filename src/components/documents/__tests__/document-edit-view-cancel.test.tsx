import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DocumentEditView } from "../document-edit-view";

// Mockowanie modułów
vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

// Mockowanie hooków nawigacyjnych
const navigateMock = vi.fn();
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => navigateMock,
}));

// Przygotowanie zmiennych dla moka useNavigationPrompt
let dialogIsOpen = false;
const onConfirmHandler = vi.fn();
const onCancelHandler = vi.fn();

vi.mock("../hooks/use-navigation-prompt", () => ({
  useNavigationPrompt: () => ({
    dialogState: {
      isOpen: dialogIsOpen,
      onConfirm: onConfirmHandler,
      onCancel: onCancelHandler,
    },
    handleNavigation: vi.fn(async (callback) => {
      dialogIsOpen = true;
      onConfirmHandler.mockImplementation(async () => {
        dialogIsOpen = false;
        await callback();
      });
      onCancelHandler.mockImplementation(() => {
        dialogIsOpen = false;
      });
    }),
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

describe("DocumentEditView - anulowanie", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    dialogIsOpen = false;
    onConfirmHandler.mockReset();
    onCancelHandler.mockReset();
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
  });

  it("powinien nawigować z powrotem do dokumentu po anulowaniu bez zmian", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Testowy dokument",
      content: "Treść testowego dokumentu".repeat(100),
      topic_id: "456",
      topic_title: "Test Topic",
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDocument),
    });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Poczekaj na załadowanie formularza
    await waitFor(() => {
      expect(screen.getByText("Anuluj")).toBeInTheDocument();
    });

    // Kliknij anuluj bez wprowadzania zmian
    fireEvent.click(screen.getByText("Anuluj"));

    // Sprawdzenie
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/documents/123");
    });
  });

  it("powinien wyświetlić dialog potwierdzenia przy anulowaniu po wprowadzeniu zmian", async () => {
    // Przygotowanie
    const mockDocument = {
      id: "123",
      name: "Testowy dokument",
      content: "Treść testowego dokumentu".repeat(100),
      topic_id: "456",
      topic_title: "Test Topic",
    };

    global.fetch = vi.fn().mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockDocument),
    });

    // Działanie
    render(<DocumentEditView documentId="123" />);

    // Poczekaj na załadowanie formularza
    await waitFor(() => {
      expect(screen.getByDisplayValue("Testowy dokument")).toBeInTheDocument();
    });

    // Zmień tytuł dokumentu
    await userEvent.clear(screen.getByLabelText("Tytuł dokumentu"));
    await userEvent.type(screen.getByLabelText("Tytuł dokumentu"), "Zmieniony tytuł");

    // Kliknij anuluj po wprowadzeniu zmian
    fireEvent.click(screen.getByText("Anuluj"));

    // Sprawdzenie czy dialog potwierdzebia został wyświetlony
    expect(dialogIsOpen).toBe(true);
  });

  it("powinien nawigować do widoku tematu dla nowego dokumentu", async () => {
    // Działanie
    render(<DocumentEditView topicId="456" />);

    // Poczekaj na załadowanie formularza
    await waitFor(() => {
      expect(screen.getByText("Anuluj")).toBeInTheDocument();
    });

    // Kliknij anuluj
    fireEvent.click(screen.getByText("Anuluj"));

    // Sprawdzenie
    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith("/topics/456");
    });
  });
});
