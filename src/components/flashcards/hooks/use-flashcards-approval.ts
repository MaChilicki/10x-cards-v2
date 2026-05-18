import { useState, useCallback, useMemo } from "react";
import type {
  DocumentDto,
  FlashcardDto,
  FlashcardUpdateDto,
  FlashcardsListResponseDto,
  ConfirmDialogState,
} from "@/types";
import { logger } from "@/lib/services/logger.service";
import { toast } from "sonner";

interface UseFlashcardsApprovalState {
  // Stan dokumentu
  document: DocumentDto | null;
  isLoadingDocument: boolean;
  documentError: Error | null;

  // Stan fiszek
  flashcards: FlashcardDto[];
  isLoadingFlashcards: boolean;
  flashcardsError: Error | null;
  totalUnapprovedCount: number;

  // Stan paginacji
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };

  // Stan sortowania
  sort: {
    sortBy: "created_at" | "updated_at" | "front_modified";
    sortOrder: "asc" | "desc";
  };

  // Stan zaznaczenia
  selectedFlashcards: Record<string, boolean>;
  selectedCount: number;
  allSelected: boolean;

  // Stan modalów
  editModalState: {
    isOpen: boolean;
    flashcard: FlashcardDto | null;
    isSubmitting: boolean;
  };
  confirmDialogState: ConfirmDialogState;

  // Stan powiadomień
  toast: {
    isVisible: boolean;
    message: string;
    type: "success" | "error" | "info";
  };
}

const initialState: UseFlashcardsApprovalState = {
  document: null,
  isLoadingDocument: true,
  documentError: null,
  flashcards: [],
  isLoadingFlashcards: true,
  flashcardsError: null,
  totalUnapprovedCount: 0,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
    itemsPerPage: 12,
  },
  sort: {
    sortBy: "created_at",
    sortOrder: "desc",
  },
  selectedFlashcards: {},
  selectedCount: 0,
  allSelected: false,
  editModalState: {
    isOpen: false,
    flashcard: null,
    isSubmitting: false,
  },
  confirmDialogState: {
    isOpen: false,
    title: "",
    description: "",
    confirmText: "",
    onConfirm: null,
  },
  toast: {
    isVisible: false,
    message: "",
    type: "success",
  },
};

export type ApproveFlashcardFn = (id: string) => Promise<void>;
export type DeleteFlashcardFn = (id: string) => Promise<void>;

export function useFlashcardsApproval(documentId: string) {
  const [state, setState] = useState<UseFlashcardsApprovalState>(initialState);

  // Obliczane wartości
  const selectedCount = useMemo(
    () => Object.values(state.selectedFlashcards).filter(Boolean).length,
    [state.selectedFlashcards]
  );

  const allSelected = useMemo(
    () => state.flashcards.length > 0 && selectedCount === state.flashcards.length,
    [state.flashcards.length, selectedCount]
  );

  // Efekty pobierania danych
  const fetchDocument = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingDocument: true, documentError: null }));
    try {
      const response = await fetch(`/api/documents/${documentId}`);
      if (!response.ok) {
        throw new Error(`Błąd podczas pobierania dokumentu: ${response.statusText}`);
      }
      const data = await response.json();
      setState((prev) => ({ ...prev, document: data, isLoadingDocument: false }));
    } catch (error) {
      logger.error("Błąd podczas pobierania dokumentu:", error);
      setState((prev) => ({
        ...prev,
        documentError: error as Error,
        isLoadingDocument: false,
      }));
    }
  }, [documentId]);

  const fetchFlashcards = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingFlashcards: true, flashcardsError: null }));
    try {
      const params = new URLSearchParams({
        document_id: documentId,
        source: "ai",
        is_approved: "false",
        is_disabled: "false",
        page: state.pagination.currentPage.toString(),
        limit: state.pagination.itemsPerPage.toString(),
        sort: state.sort.sortOrder === "desc" ? `-${state.sort.sortBy}` : state.sort.sortBy,
      });

      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Błąd podczas pobierania fiszek: ${response.statusText}`);
      }

      const data: FlashcardsListResponseDto = await response.json();
      setState((prev) => ({
        ...prev,
        flashcards: data.data,
        pagination: {
          ...prev.pagination,
          totalItems: data.pagination.total,
          totalPages: Math.ceil(data.pagination.total / prev.pagination.itemsPerPage),
        },
        isLoadingFlashcards: false,
      }));
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszek:", error);
      setState((prev) => ({
        ...prev,
        flashcardsError: error as Error,
        isLoadingFlashcards: false,
      }));
    }
  }, [documentId, state.pagination.currentPage, state.pagination.itemsPerPage, state.sort]);

  // Funkcja pomocnicza do sprawdzania i przekierowania
  const checkAndRedirectIfAllApproved = useCallback(async () => {
    try {
      // Pobierz aktualne niezatwierdzone fiszki
      const params = new URLSearchParams({
        document_id: documentId,
        source: "ai",
        is_approved: "false",
        is_disabled: "false",
        limit: "1000",
      });

      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        throw new Error(`Błąd podczas sprawdzania fiszek: ${response.statusText}`);
      }

      const data: FlashcardsListResponseDto = await response.json();

      // Aktualizujemy stan z całkowitą liczbą niezatwierdzonych fiszek
      setState((prev) => ({
        ...prev,
        totalUnapprovedCount: data.pagination.total,
      }));

      // Jeśli nie ma już niezatwierdzonych fiszek, przekieruj do widoku dokumentu
      if (data.pagination.total === 0) {
        window.location.href = `/documents/${documentId}`;
      }
    } catch (error) {
      logger.error("Błąd podczas sprawdzania statusu fiszek:", error);
    }
  }, [documentId]);

  // Funkcje pomocnicze
  function showToast(message: string, type: "success" | "error" | "info" = "success") {
    setState((prev) => ({
      ...prev,
      toast: { isVisible: true, message, type },
    }));
    setTimeout(() => setState((prev) => ({ ...prev, toast: { ...prev.toast, isVisible: false } })), 3000);
  }

  type ApproveSelectedFlashcardsFn = () => Promise<void>;
  type ApproveAllFlashcardsFn = () => Promise<void>;

  // Funkcje zatwierdzania
  const approveFlashcard: ApproveFlashcardFn = async (id: string) => {
    const flashcard = state.flashcards.find((f) => f.id === id);
    if (!flashcard) {
      throw new Error(`Nie znaleziono fiszki o ID: ${id}`);
    }

    try {
      // Najpierw aktualizujemy stan lokalnie
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.filter((f) => f.id !== id),
        selectedFlashcards: { ...prev.selectedFlashcards, [id as keyof typeof prev.selectedFlashcards]: false },
      }));

      // Następnie wysyłamy żądanie do API
      const response = await fetch(`/api/flashcards/${id}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        // W przypadku błędu przywracamy poprzedni stan
        setState((prev) => ({
          ...prev,
          flashcards: [...prev.flashcards, flashcard],
          selectedFlashcards: { ...prev.selectedFlashcards, [id as keyof typeof prev.selectedFlashcards]: false },
        }));
        throw new Error(`Błąd podczas zatwierdzania fiszki: ${response.statusText}`);
      }

      await response.json();

      // Pokazujemy toast po pomyślnym zatwierdzeniu
      toast.success("Fiszka została zatwierdzona");

      // Odświeżamy dokument w tle
      void fetchDocument();

      // Sprawdzamy przekierowanie tylko jeśli nie ma już żadnych fiszek
      if (state.flashcards.length <= 1) {
        await checkAndRedirectIfAllApproved();
      }
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszki:", error);
      toast.error(`Błąd podczas zatwierdzania fiszki: ${(error as Error).message}`);
      throw error;
    }
  };

  const approveSelectedFlashcards: ApproveSelectedFlashcardsFn = useCallback(async () => {
    const selectedIds = Object.entries(state.selectedFlashcards)
      .filter(([, selected]) => selected)
      .map(([id]) => id);

    if (selectedIds.length === 0) {
      toast.error("Nie wybrano żadnych fiszek do zatwierdzenia");
      return;
    }

    try {
      const response = await fetch("/api/flashcards/approve-bulk", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ flashcard_ids: selectedIds }),
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas zatwierdzania fiszek: ${response.statusText}`);
      }

      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.filter((f) => !selectedIds.includes(f.id)),
        selectedFlashcards: {},
      }));

      toast.success(`Zatwierdzono ${selectedIds.length} fiszek`);
      await fetchDocument();
      await checkAndRedirectIfAllApproved();
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszek:", error);
      toast.error(`Błąd podczas zatwierdzania fiszek: ${(error as Error).message}`);
    }
  }, [state.selectedFlashcards, fetchDocument, checkAndRedirectIfAllApproved]);

  const approveAllFlashcards: ApproveAllFlashcardsFn = useCallback(async () => {
    try {
      const response = await fetch(`/api/flashcards/approve-by-document`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas zatwierdzania fiszek: ${response.statusText}`);
      }

      setState((prev) => ({
        ...prev,
        flashcards: [],
        selectedFlashcards: {},
      }));

      toast.success("Zatwierdzono wszystkie fiszki");
      await fetchDocument();
      await checkAndRedirectIfAllApproved();
    } catch (error) {
      logger.error("Błąd podczas zatwierdzania fiszek:", error);
      toast.error(`Błąd podczas zatwierdzania fiszek: ${(error as Error).message}`);
    }
  }, [documentId, fetchDocument, checkAndRedirectIfAllApproved]);

  // Funkcje zaznaczania
  function handleToggleSelect(id: string) {
    setState((prev) => ({
      ...prev,
      selectedFlashcards: {
        ...prev.selectedFlashcards,
        [id]: !prev.selectedFlashcards[id],
      },
    }));
  }

  function handleSelectAll(value: boolean) {
    if (value) {
      const newSelected = state.flashcards.reduce(
        (acc, flashcard) => {
          acc[flashcard.id] = true;
          return acc;
        },
        {} as Record<string, boolean>
      );
      setState((prev) => ({
        ...prev,
        selectedFlashcards: newSelected,
      }));
    } else {
      setState((prev) => ({
        ...prev,
        selectedFlashcards: {},
      }));
    }
  }

  // Funkcje sortowania i paginacji
  function handleSortChange(newSort: typeof state.sort) {
    setState((prev) => ({
      ...prev,
      sort: newSort,
      pagination: { ...prev.pagination, currentPage: 1 },
    }));
  }

  function handlePageChange(page: number) {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, currentPage: page },
    }));
  }

  function handleItemsPerPageChange(count: number) {
    setState((prev) => ({
      ...prev,
      pagination: { ...prev.pagination, itemsPerPage: count, currentPage: 1 },
    }));
  }

  // Funkcje edycji
  function handleEditFlashcard(flashcard: FlashcardDto) {
    setState((prev) => ({
      ...prev,
      editModalState: {
        isOpen: true,
        flashcard,
        isSubmitting: false,
      },
    }));
  }

  async function handleSaveEdit(id: string, data: FlashcardUpdateDto) {
    setState((prev) => ({
      ...prev,
      editModalState: { ...prev.editModalState, isSubmitting: true },
    }));

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas aktualizacji fiszki: ${response.statusText}`);
      }

      const result = await response.json();
      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.map((f) => (f.id === id ? result.data : f)),
        editModalState: {
          isOpen: false,
          flashcard: null,
          isSubmitting: false,
        },
      }));
      showToast("Fiszka została zaktualizowana");
    } catch (error) {
      logger.error("Błąd podczas aktualizacji fiszki:", error);
      showToast((error as Error).message, "error");
      setState((prev) => ({
        ...prev,
        editModalState: { ...prev.editModalState, isSubmitting: false },
      }));
    }
  }

  function handleCloseEdit() {
    setState((prev) => ({
      ...prev,
      editModalState: {
        isOpen: false,
        flashcard: null,
        isSubmitting: false,
      },
    }));
  }

  // Funkcje dialogu potwierdzenia
  function showConfirmDialog(title: string, description: string, onConfirm: () => void, confirmText?: string) {
    setState((prev) => ({
      ...prev,
      confirmDialogState: {
        isOpen: true,
        title,
        description,
        confirmText,
        onConfirm,
      },
    }));
  }

  function closeConfirmDialog() {
    setState((prev) => ({
      ...prev,
      confirmDialogState: { ...prev.confirmDialogState, isOpen: false, onConfirm: null },
    }));
  }

  // Funkcje usuwania
  const handleDeleteFlashcard: DeleteFlashcardFn = async (id: string) => {
    const flashcard = state.flashcards.find((f) => f.id === id);
    if (!flashcard) {
      throw new Error(`Nie znaleziono fiszki o ID: ${id}`);
    }

    try {
      const response = await fetch(`/api/flashcards/${id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ source: flashcard.source }),
      });

      if (!response.ok) {
        throw new Error(`Błąd podczas usuwania fiszki: ${response.statusText}`);
      }

      setState((prev) => ({
        ...prev,
        flashcards: prev.flashcards.filter((f) => f.id !== id),
        selectedFlashcards: { ...prev.selectedFlashcards, [id as keyof typeof prev.selectedFlashcards]: false },
      }));

      toast.success("Fiszka została usunięta");
      await fetchDocument();
      await checkAndRedirectIfAllApproved();
    } catch (error) {
      logger.error("Błąd podczas usuwania fiszki:", error);
      toast.error(`Błąd podczas usuwania fiszki: ${(error as Error).message}`);
    }
  };

  // Akcje
  const actions = {
    approveFlashcard,
    approveSelectedFlashcards,
    approveAllFlashcards,
    handleToggleSelect,
    handleSelectAll,
    handleSortChange,
    handlePageChange,
    handleItemsPerPageChange,
    handleEditFlashcard,
    handleSaveEdit,
    handleCloseEdit,
    handleDeleteFlashcard,
    showConfirmDialog,
    closeConfirmDialog,
  };

  return {
    ...state,
    selectedCount,
    allSelected,
    actions,
    fetchDocument,
    fetchFlashcards,
  };
}
