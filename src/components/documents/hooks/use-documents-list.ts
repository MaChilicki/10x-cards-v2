import { useState, useEffect } from "react";
import type { DocumentsSortModel, DocumentViewModel } from "../types";

interface UseDocumentsListProps {
  topicId: string;
  initialSort?: DocumentsSortModel;
  initialPage?: number;
  initialItemsPerPage?: number;
}

interface DocumentsResponse {
  documents: DocumentViewModel[];
  total: number;
}

const getSortQueryParam = (sort: DocumentsSortModel): string => {
  const prefix = sort.sortOrder === "desc" ? "-" : "";
  return `${prefix}${sort.sortBy}`;
};

export const useDocumentsList = ({
  topicId,
  initialSort = { sortBy: "created_at", sortOrder: "desc" },
  initialPage = 1,
  initialItemsPerPage = 24,
}: UseDocumentsListProps) => {
  const [documents, setDocuments] = useState<DocumentViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [sort, setSort] = useState<DocumentsSortModel>(initialSort);
  const [pagination, setPagination] = useState({
    currentPage: initialPage,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: initialItemsPerPage,
  });

  useEffect(() => {
    setSort(initialSort);
    setPagination((prev) => ({
      ...prev,
      currentPage: initialPage,
      itemsPerPage: initialItemsPerPage,
    }));
    return undefined;
  }, [initialSort, initialPage, initialItemsPerPage]);

  useEffect(() => {
    const fetchDocuments = async () => {
      if (!topicId) return;

      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams({
          topic_id: topicId,
          page: String(pagination.currentPage),
          limit: String(pagination.itemsPerPage),
          sort: getSortQueryParam(sort),
        });

        const response = await fetch(`/api/documents?${queryParams}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error?.message || "Failed to fetch documents");
        }

        const data: DocumentsResponse = await response.json();
        setDocuments(data.documents);
        setPagination((prev) => ({
          ...prev,
          totalItems: data.total,
          totalPages: Math.ceil(data.total / pagination.itemsPerPage),
        }));
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
      } finally {
        setIsLoading(false);
      }
    };

    void fetchDocuments();
    return undefined;
  }, [topicId, pagination.currentPage, pagination.itemsPerPage, sort]);

  const setPage = (page: number): void => {
    setPagination((prev) => ({ ...prev, currentPage: page }));
  };

  const setItemsPerPage = (perPage: number): void => {
    setPagination((prev) => ({ ...prev, itemsPerPage: perPage, currentPage: 1 }));
  };

  const updateSort = (newSort: DocumentsSortModel): void => {
    setSort(newSort);
    setPagination((prev) => ({ ...prev, currentPage: 1 }));
  };

  const refetch = async () => {
    if (!topicId) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        topic_id: topicId,
        page: String(pagination.currentPage),
        limit: String(pagination.itemsPerPage),
        sort: getSortQueryParam(sort),
      });

      const response = await fetch(`/api/documents?${queryParams}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Failed to fetch documents");
      }

      const data: DocumentsResponse = await response.json();
      setDocuments(data.documents);
      setPagination((prev) => ({
        ...prev,
        totalItems: data.total,
        totalPages: Math.ceil(data.total / pagination.itemsPerPage),
      }));
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    documents,
    isLoading,
    error,
    pagination,
    setPage,
    setItemsPerPage,
    sort,
    updateSort,
    refetch,
  };
};
