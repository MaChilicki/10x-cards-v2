import * as React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import type { FlashcardDto, FlashcardUpdateDto, FlashcardCreateDto } from "@/types";
import { logger } from "@/lib/services/logger.service";
import { FlashcardForm } from "./flashcard-form";

export interface EditFlashcardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FlashcardUpdateDto | FlashcardCreateDto) => Promise<void>;
  flashcard?: FlashcardDto | null;
  isSubmitting?: boolean;
  mode: "edit" | "add";
}

export function EditFlashcardModal({
  isOpen,
  onClose,
  onSubmit,
  flashcard,
  isSubmitting = false,
  mode,
}: EditFlashcardModalProps) {
  const handleFormSubmit = async (formData: { front: string; back: string }) => {
    try {
      const data =
        mode === "edit"
          ? ({
              front_modified: formData.front,
              back_modified: formData.back,
              is_modified: true,
              modification_percentage: calculateModificationPercentage(
                formData.front,
                formData.back,
                flashcard?.front_original || "",
                flashcard?.back_original || ""
              ),
            } as FlashcardUpdateDto)
          : ({
              front_original: formData.front,
              back_original: formData.back,
              source: "manual" as const,
              is_approved: true,
            } as FlashcardCreateDto);

      await onSubmit(data);
      onClose();
    } catch (error) {
      logger.error("Błąd podczas zapisywania fiszki:", error);
      throw new Error("Wystąpił błąd podczas zapisywania fiszki");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{mode === "edit" ? "Edytuj fiszkę" : "Dodaj nową fiszkę"}</DialogTitle>
          <DialogDescription>
            {mode === "edit" ? "Zmodyfikuj treść fiszki" : "Wprowadź treść nowej fiszki"}
          </DialogDescription>
        </DialogHeader>

        <FlashcardForm
          initialData={
            flashcard
              ? {
                  front_original: flashcard.front_original,
                  front_modified: flashcard.front_modified,
                  back_original: flashcard.back_original,
                  back_modified: flashcard.back_modified,
                }
              : undefined
          }
          onSubmit={handleFormSubmit}
          onCancel={onClose}
          isSubmitting={isSubmitting}
        />
      </DialogContent>
    </Dialog>
  );
}

function calculateModificationPercentage(
  newFront: string,
  newBack: string,
  originalFront: string,
  originalBack: string
): number {
  const frontDiff = calculateDiffPercentage(newFront, originalFront);
  const backDiff = calculateDiffPercentage(newBack, originalBack);
  return Math.round((frontDiff + backDiff) / 2);
}

function calculateDiffPercentage(newText: string, originalText: string): number {
  if (!originalText) return 100;

  const maxLen = Math.max(newText.length, originalText.length);
  let differences = 0;

  for (let i = 0; i < maxLen; i++) {
    if (newText[i] !== originalText[i]) {
      differences++;
    }
  }

  return Math.round((differences / maxLen) * 100);
}
