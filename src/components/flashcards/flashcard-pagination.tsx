import * as React from "react";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";
import type { PaginationModel } from "@/components/documents/types";

interface FlashcardPaginationProps {
  pagination: PaginationModel;
  onPageChange: (page: number) => void;
  className?: string;
}

export function FlashcardPagination({
  pagination: { currentPage, totalPages },
  onPageChange,
  className,
}: FlashcardPaginationProps) {
  const getVisiblePages = () => {
    const delta = 2;
    const range: number[] = [];
    const rangeWithDots: number[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i);
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push(-1);
        }
      }
      rangeWithDots.push(i);
      l = i;
    });

    return rangeWithDots;
  };

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
              currentPage <= 1 ? "pointer-events-none opacity-50" : ""
            )}
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="mr-2 h-4 w-4"
            >
              <path d="m15 18-6-6 6-6" />
            </svg>
            Poprzednia
          </button>
        </PaginationItem>

        {getVisiblePages().map((pageNumber, index) => (
          <PaginationItem key={index}>
            {pageNumber === -1 ? (
              <span className="flex h-9 w-9 items-center justify-center">...</span>
            ) : (
              <button
                className={cn(
                  "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9",
                  pageNumber === currentPage ? "bg-primary text-primary-foreground hover:bg-primary/90" : ""
                )}
                onClick={() => onPageChange(pageNumber)}
              >
                {pageNumber}
              </button>
            )}
          </PaginationItem>
        ))}

        <PaginationItem>
          <button
            className={cn(
              "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 px-4 py-2",
              currentPage >= totalPages ? "pointer-events-none opacity-50" : ""
            )}
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            Następna
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="ml-2 h-4 w-4"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
