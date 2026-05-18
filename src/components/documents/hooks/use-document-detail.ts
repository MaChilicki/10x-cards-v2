import { useState, useCallback } from "react";
import type { DocumentDto } from "@/types";
import type { DocumentDetailViewModel } from "../types";
import { logger } from "@/lib/services/logger.service";

export function useDocumentDetail(id: string) {
  const [state, setState] = useState<DocumentDetailViewModel>({
    document: null,
    isLoadingDocument: true,
    documentError: null,
    unapprovedAiFlashcardsCount: 0,
  });

  const fetchDocument = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoadingDocument: true, documentError: null }));
    try {
      const response = await fetch(`/api/documents/${id}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać dokumentu");
      }
      const data: DocumentDto = await response.json();
      setState((prev) => ({
        ...prev,
        document: data,
        isLoadingDocument: false,
      }));

      // Pobierz liczbę niezatwierdzonych fiszek AI
      const flashcardsResponse = await fetch(`/api/flashcards?document_id=${id}&is_approved=false&source=ai&limit=1`);
      if (flashcardsResponse.ok) {
        const { total } = await flashcardsResponse.json();
        setState((prev) => ({
          ...prev,
          unapprovedAiFlashcardsCount: total,
        }));
      }
    } catch (error) {
      setState((prev) => ({
        ...prev,
        isLoadingDocument: false,
        documentError: error instanceof Error ? error.message : "Nieznany błąd",
      }));
    }
  }, [id]);

  const editDocument = useCallback(() => {
    window.location.href = `/documents/${id}/edit`;
  }, [id]);

  const deleteDocument = useCallback(async () => {
    try {
      const response = await fetch(`/api/documents/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Nie udało się usunąć dokumentu");
      }
      // Po usunięciu przekieruj do listy dokumentów
      window.location.href = "/documents";
    } catch (error) {
      logger.error("Błąd podczas usuwania dokumentu:", error);
      throw error;
    }
  }, [id]);

  const regenerateFlashcards = useCallback(async () => {
    if (!state.document) return;

    try {
      const response = await fetch("/api/flashcards/ai-generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: id,
          content: state.document.content,
          regenerate: true,
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się wygenerować fiszek");
      }

      // Po pomyślnym wygenerowaniu przekieruj do widoku akceptacji
      window.location.href = `/documents/${id}/flashcards/approve`;
    } catch (error) {
      logger.error("Błąd podczas generowania fiszek:", error);
      throw error;
    }
  }, [id, state.document]);

  return {
    ...state,
    actions: {
      editDocument,
      deleteDocument,
      regenerateFlashcards,
    },
    refetch: fetchDocument,
  };
}
