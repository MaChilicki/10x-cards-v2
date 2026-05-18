import React from "react";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertConfirmDialog } from "../ui/alert-confirm-dialog";
import { cn } from "@/lib/utils";
import type { FlashcardDto } from "@/types";

interface BulkActionsBarProps {
  selectedCount: number;
  totalCount: number;
  allSelected: boolean;
  onSelectAll: (value: boolean) => void;
  onApproveSelected: () => void;
  onApproveAll: () => void;
  isLoading: boolean;
  selectedFlashcards: FlashcardDto[];
  allFlashcards: FlashcardDto[];
}

export function BulkActionsBar({
  selectedCount,
  totalCount,
  allSelected,
  onSelectAll,
  onApproveSelected,
  onApproveAll,
  isLoading,
  selectedFlashcards,
  allFlashcards,
}: BulkActionsBarProps) {
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = React.useState(false);
  const [isApprovingAll, setIsApprovingAll] = React.useState(false);

  const handleApproveClick = (approveAll: boolean) => {
    setIsApprovingAll(approveAll);
    setIsConfirmDialogOpen(true);
  };

  const handleConfirm = async () => {
    if (isApprovingAll) {
      await onApproveAll();
    } else {
      await onApproveSelected();
    }
    setIsConfirmDialogOpen(false);
  };

  const renderFlashcardsList = () => {
    const flashcards = isApprovingAll ? allFlashcards : selectedFlashcards;
    const count = isApprovingAll ? totalCount : selectedCount;

    const dialogContent = `
      <div class="space-y-4">
        <p class="text-base font-medium">
          Czy na pewno chcesz zatwierdzić ${count} ${count === 1 ? "fiszkę" : "fiszki"}?
        </p>
        <div class="space-y-2 max-h-[300px] overflow-y-auto">
          ${flashcards
            .map(
              (flashcard, index) => `
            <div class="p-3 bg-muted rounded-lg">
              <p class="text-sm font-medium text-muted-foreground">${index + 1}. ${flashcard.front_modified || flashcard.front_original}</p>
            </div>
          `
            )
            .join("")}
        </div>
      </div>
    `;

    return dialogContent;
  };

  return (
    <div className="flex items-center justify-between p-4 bg-background border rounded-lg shadow-sm">
      <div className="flex items-center space-x-4">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Checkbox
                id="select-all"
                checked={allSelected}
                onCheckedChange={onSelectAll}
                disabled={isLoading || totalCount === 0}
                className={cn(
                  "border-2 bg-white cursor-pointer border-gray-400 hover:border-gray-500",
                  "data-[state=checked]:bg-white data-[state=checked]:text-primary",
                  "disabled:cursor-not-allowed disabled:opacity-50"
                )}
              />
            </TooltipTrigger>
            <TooltipContent>
              <p>Zaznacz wszystkie fiszki</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        <label htmlFor="select-all" className="text-sm text-muted-foreground">
          {selectedCount > 0 ? `Zaznaczono ${selectedCount} z ${totalCount} fiszek` : "Zaznacz wszystkie fiszki"}
        </label>
      </div>

      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          onClick={() => handleApproveClick(false)}
          disabled={isLoading || selectedCount === 0}
          className="border-2 border-gray-400 hover:border-gray-500"
        >
          Zatwierdź zaznaczone ({selectedCount})
        </Button>

        <Button variant="default" onClick={() => handleApproveClick(true)} disabled={isLoading || totalCount === 0}>
          Zatwierdź wszystkie ({totalCount})
        </Button>
      </div>

      <AlertConfirmDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        title="Zatwierdzanie fiszek"
        description={renderFlashcardsList()}
        onConfirm={handleConfirm}
        isSubmitting={isLoading}
        className="sm:max-w-[600px]"
        confirmText="Zatwierdź"
      />
    </div>
  );
}
