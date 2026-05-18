import { LoadingSpinner } from "@/components/ui/loading-spinner";
import type { FlashcardDto } from "@/types";
import { FlashcardCard } from "./flashcard-card";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { useFlippedCards } from "./hooks/use-flipped-cards";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface FlashcardsListProps {
  flashcards: FlashcardDto[];
  isLoading: boolean;
  mode?: "view" | "approve" | "learn";
  selectedFlashcards?: Record<string, boolean>;
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
  onEditFlashcard: (flashcardId: string, updates: Partial<FlashcardDto>) => Promise<void>;
  onDeleteFlashcard: (flashcardId: string) => Promise<void>;
  onPageChange?: (page: number) => void;
  onToggleSelect?: (id: string) => void;
  onApproveFlashcard?: (id: string) => Promise<void>;
}

export function FlashcardsList({
  flashcards,
  isLoading,
  mode = "view",
  selectedFlashcards = {},
  pagination,
  onEditFlashcard,
  onDeleteFlashcard,
  onPageChange,
  onToggleSelect,
  onApproveFlashcard,
}: FlashcardsListProps) {
  const { isCardFlipped, toggleCard } = useFlippedCards();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <p className="text-muted-foreground">
          {mode === "approve" ? "Brak fiszek do zatwierdzenia" : "Brak fiszek do wyświetlenia"}
        </p>
      </div>
    );
  }

  // Funkcja generująca tablicę numerów stron do wyświetlenia
  const getPageNumbers = () => {
    if (!pagination) return [];
    const { currentPage, totalPages } = pagination;
    const delta = 2; // Ile stron pokazać przed i po aktualnej stronie
    const pages: number[] = [];

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 || // Pierwsza strona
        i === totalPages || // Ostatnia strona
        (i >= currentPage - delta && i <= currentPage + delta) // Strony wokół aktualnej
      ) {
        pages.push(i);
      }
    }

    // Dodaj "..." między nieciągłymi numerami stron
    const withEllipsis: (number | "ellipsis")[] = [];
    pages.forEach((page, index) => {
      if (index > 0) {
        if (page - pages[index - 1] > 1) {
          withEllipsis.push("ellipsis");
        }
      }
      withEllipsis.push(page);
    });

    return withEllipsis;
  };

  return (
    <div className="space-y-6 mb-16">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {flashcards.map((flashcard) => (
          <FlashcardCard
            key={flashcard.id}
            flashcard={flashcard}
            onEdit={(updates) => onEditFlashcard(flashcard.id, updates)}
            onDelete={() => onDeleteFlashcard(flashcard.id)}
            isFlipped={isCardFlipped(flashcard.id)}
            onFlip={() => toggleCard(flashcard.id)}
            mode={mode}
            isSelected={mode === "approve" ? selectedFlashcards[flashcard.id] : undefined}
            onToggleSelect={mode === "approve" && onToggleSelect ? () => onToggleSelect(flashcard.id) : undefined}
            onApprove={mode === "approve" && onApproveFlashcard ? () => onApproveFlashcard(flashcard.id) : undefined}
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <Pagination className="mt-8">
          <PaginationContent>
            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === 1}
                onClick={() => onPageChange?.(pagination.currentPage - 1)}
                className="gap-2"
              >
                <ChevronLeft className="h-4 w-4" />
                <span>Poprzednia</span>
              </Button>
            </PaginationItem>

            {getPageNumbers().map((pageNumber, index) =>
              pageNumber === "ellipsis" ? (
                <PaginationItem key={`ellipsis-${index}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              ) : (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    onClick={(e) => {
                      e.preventDefault();
                      onPageChange?.(pageNumber);
                    }}
                    isActive={pagination.currentPage === pageNumber}
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              )
            )}

            <PaginationItem>
              <Button
                variant="outline"
                size="sm"
                disabled={pagination.currentPage === pagination.totalPages}
                onClick={() => onPageChange?.(pagination.currentPage + 1)}
                className="gap-2"
              >
                <span>Następna</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}
    </div>
  );
}
