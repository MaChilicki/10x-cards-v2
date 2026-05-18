import { useState, useEffect, useCallback } from "react";
import type { TopicDto } from "@/types";

interface UseTopicDetailResult {
  topic: TopicDto | null;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Hook do pobierania szczegółów tematu
 * @param id - ID tematu
 * @returns Obiekt zawierający dane tematu, stan ładowania, błąd i funkcję odświeżającą
 */
export function useTopicDetail(id: string): UseTopicDetailResult {
  const [topic, setTopic] = useState<TopicDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTopic = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch(`/api/topics/${id}`);

      if (!response.ok) {
        throw new Error(`Błąd podczas pobierania tematu: ${response.statusText}`);
      }

      const data = await response.json();
      setTopic(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Nieznany błąd"));
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void fetchTopic();
    return undefined;
  }, [fetchTopic]);

  return {
    topic,
    isLoading,
    error,
    refetch: fetchTopic,
  };
}
