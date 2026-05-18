import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Plus } from "lucide-react";
import type { DocumentViewModel, DocumentsSortModel } from "./types";
import { DocumentsSorter } from "./documents-sorter";
import { DocumentCard } from "./document-card";

interface DocumentListProps {
  documents: DocumentViewModel[];
  isLoading: boolean;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    availablePerPage: number[];
  };
  onDelete: (document: DocumentViewModel) => void;
  onEdit: (document: DocumentViewModel) => void;
  onSort: (sort: DocumentsSortModel) => void;
  sort: DocumentsSortModel;
  onAddDocument: () => void;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (value: number) => void;
}

export function DocumentList({
  documents,
  isLoading,
  pagination,
  onDelete,
  onEdit,
  onSort,
  sort,
  onAddDocument,
  onPageChange,
  onItemsPerPageChange,
}: DocumentListProps) {
  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <DocumentsSorter
          currentSort={sort}
          onChange={onSort}
          itemsPerPage={pagination.itemsPerPage}
          onItemsPerPageChange={onItemsPerPageChange}
        />
        <Button onClick={onAddDocument} className="gap-2 mb-6">
          <Plus className="h-4 w-4" />
          Dodaj dokument
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <DocumentCard
            key={document.id}
            document={document}
            onDelete={onDelete}
            onEdit={onEdit}
            unapproved_flashcards_count={document.unapproved_flashcards_count}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex justify-center mt-8">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              disabled={pagination.currentPage === 1}
              onClick={() => onPageChange(pagination.currentPage - 1)}
            >
              Poprzednia
            </Button>
            <span className="mx-4">
              Strona {pagination.currentPage} z {pagination.totalPages}
            </span>
            <Button
              variant="outline"
              disabled={pagination.currentPage === pagination.totalPages}
              onClick={() => onPageChange(pagination.currentPage + 1)}
            >
              Następna
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
