import { useState, useEffect, useCallback } from "react";
import type { FlashcardDto } from "@/types";
import type { FlashcardsSortModel } from "../types";

interface UseFlashcardsListProps {
  documentId: string;
  topicId?: string;
  initialSort?: FlashcardsSortModel;
  initialPage?: number;
  initialItemsPerPage?: number;
  is_approved?: boolean;
  is_disabled?: boolean;
}

interface FlashcardsResponse {
  data: FlashcardDto[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
}

const getSortQueryParam = (sort: FlashcardsSortModel): string => {
  const prefix = sort.sortOrder === "desc" ? "-" : "";
  return `${prefix}${sort.sortBy}`;
};

export function useFlashcardsList({
  documentId,
  topicId,
  initialSort = { sortBy: "created_at", sortOrder: "desc" },
  initialPage = 1,
  initialItemsPerPage = 12,
  is_approved,
  is_disabled,
}: UseFlashcardsListProps) {
  const [flashcards, setFlashcards] = useState<FlashcardDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [page, setPage] = useState(initialPage);
  const [itemsPerPage, setItemsPerPage] = useState(initialItemsPerPage);
  const [sort, setSort] = useState<FlashcardsSortModel>(initialSort);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialItemsPerPage,
  });

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: itemsPerPage.toString(),
        sort: getSortQueryParam(sort),
        document_id: documentId,
        ...(topicId && { topic_id: topicId }),
        ...(is_approved !== undefined && { is_approved: is_approved.toString() }),
        ...(is_disabled !== undefined && { is_disabled: is_disabled.toString() }),
      });

      const queryString = queryParams.toString();
      const response = await fetch(`/api/flashcards?${queryString}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać fiszek");
      }
      const data: FlashcardsResponse = await response.json();
      setFlashcards(data.data);
      setPagination({
        currentPage: page,
        totalPages: Math.ceil(data.pagination.total / itemsPerPage),
        totalItems: data.pagination.total,
        itemsPerPage,
      });
    } catch (error) {
      setError(error instanceof Error ? error : new Error("Nieznany błąd"));
    } finally {
      setIsLoading(false);
    }
  }, [documentId, topicId, page, itemsPerPage, sort, is_approved, is_disabled]);

  useEffect(() => {
    void fetchFlashcards();
    return undefined;
  }, [fetchFlashcards]);

  const updateSort = (newSort: FlashcardsSortModel) => {
    setSort(newSort);
    setPage(1);
  };

  return {
    flashcards,
    isLoading,
    error,
    pagination,
    refetch: fetchFlashcards,
    setPage,
    setItemsPerPage,
    sort,
    updateSort,
  };
}
