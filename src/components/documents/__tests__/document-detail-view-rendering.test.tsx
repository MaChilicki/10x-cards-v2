import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { DocumentDetailView } from "../document-detail-view";
import { useDocumentDetail } from "../hooks/use-document-detail";
import { useFlashcardsList } from "../../flashcards/hooks/use-flashcards-list";

// Mock dla własnych hooków
vi.mock("../hooks/use-document-detail", () => ({
  useDocumentDetail: vi.fn(),
}));

vi.mock("../../flashcards/hooks/use-flashcards-list", () => ({
  useFlashcardsList: vi.fn(),
}));

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

// Mock dla UseNavigate
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => vi.fn(),
}));

// Interfejs dla propów FlashcardsEmptyState
interface FlashcardsEmptyStateProps {
  onRegenerate: () => void;
  isRegenerating?: boolean;
}

describe("Renderowanie warunkowe DocumentDetailView", () => {
  it("powinien wyświetlić LoadingSpinner gdy ładowane są dane dokumentu", () => {
    // Przygotowanie: Mockujemy hook useDocumentDetail zwracający stan ładowania
    const useDocumentDetailMock = vi.mocked(useDocumentDetail);
    useDocumentDetailMock.mockReturnValue({
      document: null,
      isLoadingDocument: true,
      documentError: null,
      unapprovedAiFlashcardsCount: 0,
      actions: {
        editDocument: vi.fn(),
        deleteDocument: vi.fn().mockResolvedValue({}),
        regenerateFlashcards: vi.fn().mockResolvedValue({}),
      },
      refetch: vi.fn(),
    });

    // Mockujemy hook useFlashcardsList z załadowanymi danymi
    const useFlashcardsListMock = vi.mocked(useFlashcardsList);
    useFlashcardsListMock.mockReturnValue({
      flashcards: [],
      isLoading: false,
      error: null,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 },
      setPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      sort: { sortBy: "created_at", sortOrder: "desc" },
      updateSort: vi.fn(),
      refetch: vi.fn(),
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="123e4567-e89b-12d3-a456-426614174000" />);

    // Sprawdzenie: Weryfikujemy, że wyświetlany jest LoadingSpinner dla dokumentu
    const loadingElements = screen.getAllByText("Ładowanie dokumentu...");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("powinien wyświetlić LoadingSpinner gdy ładowane są fiszki", () => {
    // Przygotowanie: Mockujemy hook useDocumentDetail zwracający załadowany dokument
    const useDocumentDetailMock = vi.mocked(useDocumentDetail);
    useDocumentDetailMock.mockReturnValue({
      document: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test Document",
        name: "Test Document",
        user_id: "123e4567-e89b-12d3-a456-426614174005",
        topic_id: "123e4567-e89b-12d3-a456-426614174001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoadingDocument: false,
      documentError: null,
      unapprovedAiFlashcardsCount: 0,
      actions: {
        editDocument: vi.fn(),
        deleteDocument: vi.fn().mockResolvedValue({}),
        regenerateFlashcards: vi.fn().mockResolvedValue({}),
      },
      refetch: vi.fn(),
    });

    // Mockujemy hook useFlashcardsList w stanie ładowania
    const useFlashcardsListMock = vi.mocked(useFlashcardsList);
    useFlashcardsListMock.mockReturnValue({
      flashcards: [],
      isLoading: true,
      error: null,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 },
      setPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      sort: { sortBy: "created_at", sortOrder: "desc" },
      updateSort: vi.fn(),
      refetch: vi.fn(),
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="123e4567-e89b-12d3-a456-426614174000" />);

    // Sprawdzenie: Weryfikujemy, że wyświetlany jest LoadingSpinner dla fiszek
    const loadingElements = screen.getAllByText("Ładowanie fiszek...");
    expect(loadingElements.length).toBeGreaterThan(0);
  });

  it("powinien wyświetlić ErrorAlert gdy wystąpił błąd ładowania dokumentu", () => {
    // Przygotowanie: Mockujemy hook useDocumentDetail zwracający błąd dokumentu
    const documentError = "Błąd pobierania dokumentu";

    const useDocumentDetailMock = vi.mocked(useDocumentDetail);
    useDocumentDetailMock.mockReturnValue({
      document: null,
      isLoadingDocument: false,
      documentError,
      unapprovedAiFlashcardsCount: 0,
      actions: {
        editDocument: vi.fn(),
        deleteDocument: vi.fn().mockResolvedValue({}),
        regenerateFlashcards: vi.fn().mockResolvedValue({}),
      },
      refetch: vi.fn(),
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="123e4567-e89b-12d3-a456-426614174000" />);

    // Sprawdzenie: Weryfikujemy, że wyświetlany jest komunikat o błędzie dokumentu
    expect(screen.getByText(/Błąd podczas ładowania dokumentu/i)).toBeInTheDocument();
    expect(screen.getByText("Spróbuj ponownie")).toBeInTheDocument();
  });

  it("powinien wyświetlić ErrorAlert gdy wystąpił błąd ładowania fiszek", () => {
    // Przygotowanie: Mockujemy hook useDocumentDetail zwracający załadowany dokument
    const useDocumentDetailMock = vi.mocked(useDocumentDetail);
    useDocumentDetailMock.mockReturnValue({
      document: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test Document",
        name: "Test Document",
        user_id: "123e4567-e89b-12d3-a456-426614174005",
        topic_id: "123e4567-e89b-12d3-a456-426614174001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoadingDocument: false,
      documentError: null,
      unapprovedAiFlashcardsCount: 0,
      actions: {
        editDocument: vi.fn(),
        deleteDocument: vi.fn().mockResolvedValue({}),
        regenerateFlashcards: vi.fn().mockResolvedValue({}),
      },
      refetch: vi.fn(),
    });

    // Mockujemy hook useFlashcardsList zwracający błąd
    const flashcardsError = new Error("Błąd pobierania fiszek");

    const useFlashcardsListMock = vi.mocked(useFlashcardsList);
    useFlashcardsListMock.mockReturnValue({
      flashcards: [],
      isLoading: false,
      error: flashcardsError,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 24 },
      setPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      sort: { sortBy: "created_at", sortOrder: "desc" },
      updateSort: vi.fn(),
      refetch: vi.fn(),
    });

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="123e4567-e89b-12d3-a456-426614174000" />);

    // Sprawdzenie: Weryfikujemy, że wyświetlany jest komunikat o błędzie fiszek
    expect(screen.getByText(/Błąd podczas ładowania fiszek/i)).toBeInTheDocument();
    expect(screen.getByText("Spróbuj ponownie")).toBeInTheDocument();
  });

  it("powinien wyświetlić stan pusty gdy nie ma fiszek", () => {
    // Przygotowanie: Mockujemy hook useDocumentDetail zwracający załadowany dokument
    const useDocumentDetailMock = vi.mocked(useDocumentDetail);
    useDocumentDetailMock.mockReturnValue({
      document: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test Document",
        name: "Test Document",
        user_id: "123e4567-e89b-12d3-a456-426614174005",
        topic_id: "123e4567-e89b-12d3-a456-426614174001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoadingDocument: false,
      documentError: null,
      unapprovedAiFlashcardsCount: 0,
      actions: {
        editDocument: vi.fn(),
        deleteDocument: vi.fn().mockResolvedValue({}),
        regenerateFlashcards: vi.fn().mockResolvedValue({}),
      },
      refetch: vi.fn(),
    });

    // Mockujemy hook useFlashcardsList zwracający pustą listę fiszek
    const useFlashcardsListMock = vi.mocked(useFlashcardsList);
    useFlashcardsListMock.mockReturnValue({
      flashcards: [],
      isLoading: false,
      error: null,
      pagination: { currentPage: 1, totalPages: 0, totalItems: 0, itemsPerPage: 24 },
      setPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      sort: { sortBy: "created_at", sortOrder: "desc" },
      updateSort: vi.fn(),
      refetch: vi.fn(),
    });

    // Mock dla komponentu FlashcardsEmptyState
    vi.mock("../flashcards-empty-state", () => ({
      FlashcardsEmptyState: ({ onRegenerate }: FlashcardsEmptyStateProps) => (
        <div data-testid="flashcards-empty-state">
          Stan pusty fiszek
          <button onClick={onRegenerate}>Regeneruj</button>
        </div>
      ),
    }));

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="123e4567-e89b-12d3-a456-426614174000" />);

    // Sprawdzenie: Weryfikujemy, że wyświetlany jest stan pusty dla fiszek
    expect(screen.getByTestId("flashcards-empty-state")).toBeInTheDocument();
  });

  it("powinien wyświetlić listę fiszek gdy są dostępne", () => {
    // Przygotowanie: Mockujemy hook useDocumentDetail zwracający załadowany dokument
    const useDocumentDetailMock = vi.mocked(useDocumentDetail);
    useDocumentDetailMock.mockReturnValue({
      document: {
        id: "123e4567-e89b-12d3-a456-426614174000",
        content: "Test Document",
        name: "Test Document",
        user_id: "123e4567-e89b-12d3-a456-426614174005",
        topic_id: "123e4567-e89b-12d3-a456-426614174001",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      isLoadingDocument: false,
      documentError: null,
      unapprovedAiFlashcardsCount: 0,
      actions: {
        editDocument: vi.fn(),
        deleteDocument: vi.fn().mockResolvedValue({}),
        regenerateFlashcards: vi.fn().mockResolvedValue({}),
      },
      refetch: vi.fn(),
    });

    // Mockujemy hook useFlashcardsList zwracający listę fiszek
    const useFlashcardsListMock = vi.mocked(useFlashcardsList);
    useFlashcardsListMock.mockReturnValue({
      flashcards: [
        {
          id: "123e4567-e89b-12d3-a456-426614174002",
          front_original: "Pytanie 1",
          back_original: "Odpowiedź 1",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: "manual",
          status: "approved",
          document_id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174005",
          front_modified: "Pytanie 1",
          back_modified: "Odpowiedź 1",
          is_approved: true,
          is_disabled: false,
        },
        {
          id: "123e4567-e89b-12d3-a456-426614174003",
          front_original: "Pytanie 2",
          back_original: "Odpowiedź 2",
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          source: "ai",
          status: "approved",
          document_id: "123e4567-e89b-12d3-a456-426614174000",
          user_id: "123e4567-e89b-12d3-a456-426614174005",
          front_modified: "Pytanie 2",
          back_modified: "Odpowiedź 2",
          is_approved: true,
          is_disabled: false,
        },
      ],
      isLoading: false,
      error: null,
      pagination: { currentPage: 1, totalPages: 1, totalItems: 2, itemsPerPage: 24 },
      setPage: vi.fn(),
      setItemsPerPage: vi.fn(),
      sort: { sortBy: "created_at", sortOrder: "desc" },
      updateSort: vi.fn(),
      refetch: vi.fn(),
    });

    // Mock dla komponentu FlashcardsList
    vi.mock("../../flashcards", () => ({
      FlashcardsList: () => <div data-testid="flashcards-list">Lista fiszek</div>,
      FlashcardsSorter: () => <div data-testid="flashcards-sorter">Sortowanie</div>,
    }));

    // Działanie: Renderujemy komponent
    render(<DocumentDetailView documentId="123e4567-e89b-12d3-a456-426614174000" />);

    // Sprawdzenie: Weryfikujemy, że wyświetlana jest lista fiszek
    expect(screen.getByTestId("flashcards-list")).toBeInTheDocument();
    expect(screen.getByTestId("flashcards-sorter")).toBeInTheDocument();
    expect(screen.getByText("Dodaj fiszkę ręcznie")).toBeInTheDocument();
  });
});
