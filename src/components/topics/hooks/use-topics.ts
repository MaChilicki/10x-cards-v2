import { useState, useCallback, useEffect, useRef } from "react";
import type { TopicDto, TopicCreateDto, TopicUpdateDto, TopicsListResponseDto } from "@/types";
import { logger } from "@/lib/services/logger.service";

interface TopicFilters {
  search?: string;
  parentId?: string;
  hasDocuments?: boolean;
}

type TopicSortField = "name" | "created_at" | "updated_at" | "documentsCount";
type SortDirection = "asc" | "desc";

interface TopicSortOption {
  field: TopicSortField;
  direction: SortDirection;
}

interface TopicViewModel extends TopicDto {
  documentsCount: number;
  hasChildren: boolean;
  isParent: boolean;
  isChild: boolean;
  parentName?: string;
}

export const useTopics = (initialFilters?: TopicFilters, initialSort?: TopicSortOption) => {
  // Stany
  const [topics, setTopics] = useState<TopicViewModel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<TopicFilters>(initialFilters || {});
  const [sort, setSort] = useState<TopicSortOption>(initialSort || { field: "name", direction: "asc" });
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0 });

  // Ref do śledzenia, czy komponent jest zamontowany
  const isMounted = useRef(true);

  // Funkcja pobierająca tematy
  const fetchTopics = useCallback(async () => {
    if (!isMounted.current) return;

    setLoading(true);
    setError(null);

    try {
      const searchParams = new URLSearchParams();

      // Dodanie filtrów
      if (filters.search) searchParams.append("name", filters.search);
      if (filters.parentId) searchParams.append("parent_id", filters.parentId);

      // Dodanie paginacji
      searchParams.append("page", pagination.page.toString());
      searchParams.append("limit", pagination.limit.toString());

      // Dodanie sortowania
      searchParams.append("sort", sort.field);

      const response = await fetch(`/api/topics?${searchParams.toString()}`);

      if (!isMounted.current) return;

      if (!response.ok) {
        throw new Error(`Błąd pobierania tematów: ${response.status}`);
      }

      const data: TopicsListResponseDto = await response.json();

      if (!isMounted.current) return;

      // Mapowanie na model widoku
      const topicsViewModel: TopicViewModel[] = data.topics.map((topic) => ({
        ...topic,
        documentsCount: topic.documents_count || 0,
        hasChildren: false, // W API można dodać informację o dzieciach
        isParent: !topic.parent_id,
        isChild: !!topic.parent_id,
        parentName: "", // Należy uzupełnić na podstawie relacji
      }));

      setTopics(topicsViewModel);
      setPagination((prev) => ({ ...prev, total: data.total }));
    } catch (err) {
      if (isMounted.current) {
        const error = err instanceof Error ? err : new Error("Nieznany błąd");
        logger.error("Błąd podczas pobierania tematów:", error);
        setError(error);
      }
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [filters.search, filters.parentId, pagination.page, pagination.limit, sort.field]);

  // Funkcja dodająca temat
  const addTopic = async (topicData: TopicCreateDto) => {
    try {
      const response = await fetch("/api/topics", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Błąd tworzenia tematu");
      }

      const createdTopic: TopicDto = await response.json();
      return createdTopic;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Nieznany błąd");
      logger.error("Błąd podczas tworzenia tematu:", error);
      throw error;
    }
  };

  // Funkcja aktualizująca temat
  const updateTopic = async (id: string, topicData: TopicUpdateDto) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(topicData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Błąd aktualizacji tematu");
      }

      const updatedTopic: TopicDto = await response.json();
      return updatedTopic;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Nieznany błąd");
      logger.error("Błąd podczas aktualizacji tematu:", error);
      throw error;
    }
  };

  // Funkcja usuwająca temat
  const deleteTopic = async (id: string) => {
    try {
      const response = await fetch(`/api/topics/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || "Błąd usuwania tematu");
      }

      return true;
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Nieznany błąd");
      logger.error("Błąd podczas usuwania tematu:", error);
      throw error;
    }
  };

  // Efekt pobierający dane
  useEffect(() => {
    fetchTopics();
    return undefined;
  }, [fetchTopics]);

  // Efekt czyszczący
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // Reset filtrów
  const resetFilters = () => {
    setFilters({});
    setSort({ field: "name", direction: "asc" });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  return {
    topics,
    loading,
    error,
    filters,
    sort,
    pagination,
    setFilters,
    setSort,
    setPagination,
    fetchTopics,
    addTopic,
    updateTopic,
    deleteTopic,
    resetFilters,
  };
};
