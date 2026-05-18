import { useState, useCallback } from "react";
import type { FlashcardsRegenerationDialogState } from "../types";
import type { FlashcardsListResponseDto, AiRegenerateResponseDto } from "@/types";
import { logger } from "@/lib/services/logger.service";

interface UseFlashcardsRegenerationDialogProps {
  documentId: string;
  onRegenerateSuccess: (result: AiRegenerateResponseDto) => void;
  onRegenerateError: (error: Error) => void;
}

export const useFlashcardsRegenerationDialog = ({
  documentId,
  onRegenerateSuccess,
  onRegenerateError,
}: UseFlashcardsRegenerationDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [aiFlashcards, setAiFlashcards] = useState<FlashcardsListResponseDto | null>(null);

  const getDialogContent = useCallback(() => {
    if (isLoading) {
      return `
        <div class="space-y-4">
          <div class="flex items-center justify-center p-4">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span class="ml-2">Pobieranie fiszek...</span>
          </div>
        </div>
      `;
    }

    const baseContent = `
      <div class="space-y-4">
        <p class="text-base">Czy na pewno chcesz zregenerować fiszki AI? Ta operacja:</p>
        <ul class="list-disc list-inside space-y-2">
          <li>Usunie wszystkie istniejące fiszki AI (${aiFlashcards?.data.length || 0})</li>
          <li>Wygeneruje nowe fiszki na podstawie treści dokumentu</li>
        </ul>
    `;

    if (aiFlashcards?.data.length) {
      return `
        ${baseContent}
        <div class="mt-4">
          <p class="font-semibold mb-2">Istniejące fiszki AI:</p>
          <div class="space-y-2 max-h-60 overflow-y-auto">
            ${aiFlashcards.data
              .map(
                (flashcard, index) => `
                <div class="p-3 bg-muted rounded-lg">
                  <p class="text-sm font-medium text-muted-foreground">${index + 1}. ${
                    flashcard.front_modified || flashcard.front_original
                  }</p>
                  <div class="flex gap-2 mt-1">
                    ${
                      flashcard.is_approved
                        ? '<span class="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">Zatwierdzona</span>'
                        : '<span class="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">Niezatwierdzona</span>'
                    }
                    ${
                      flashcard.is_disabled
                        ? '<span class="text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-700">Wyłączona</span>'
                        : ""
                    }
                  </div>
                </div>
              `
              )
              .join("")}
          </div>
        </div>
      </div>
      `;
    }

    return `${baseContent}</div>`;
  }, [isLoading, aiFlashcards]);

  const fetchAiFlashcards = useCallback(async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        document_id: documentId,
        source: "ai",
        is_disabled: "false",
      });

      const response = await fetch(`/api/flashcards?${params.toString()}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek AI");
      }

      const data: FlashcardsListResponseDto = await response.json();
      setAiFlashcards(data);
      return data;
    } catch (error) {
      logger.error("Błąd podczas pobierania fiszek AI:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  const regenerateFlashcards = useCallback(async () => {
    try {
      const response = await fetch("/api/flashcards/ai-regenerate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          document_id: documentId,
        }),
      });

      if (!response.ok) {
        throw new Error("Nie udało się zregenerować fiszek");
      }

      const result: AiRegenerateResponseDto = await response.json();
      logger.info(`Usunięto ${result.deleted_count} fiszek i wygenerowano ${result.flashcards.length} nowych`);
      onRegenerateSuccess(result);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Nieznany błąd podczas regeneracji fiszek";
      logger.error("Błąd podczas regeneracji fiszek:", error);
      onRegenerateError(new Error(errorMessage));
    }
  }, [documentId, onRegenerateSuccess, onRegenerateError]);

  const openDialog = useCallback(async () => {
    setIsOpen(true);
    try {
      await fetchAiFlashcards();
    } catch (error) {
      logger.error("Nie udało się pobrać fiszek AI przed otwarciem dialogu:", error);
      // Dialog zostanie otwarty, ale bez listy istniejących fiszek
    }
  }, [fetchAiFlashcards]);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setAiFlashcards(null);
  }, []);

  return {
    dialogState: {
      isOpen,
      hasExistingAIFlashcards: Boolean(aiFlashcards?.data.length),
      aiFlashcardsCount: aiFlashcards?.data.length || 0,
      onConfirm: regenerateFlashcards,
      onCancel: closeDialog,
    } as FlashcardsRegenerationDialogState,
    isLoading,
    aiFlashcards,
    dialogContent: getDialogContent(),
    openDialog,
    closeDialog,
  };
};
