import { useState, useCallback } from "react";
import type { TopicDto } from "@/types";

interface UseTopicFetchResult {
  topic: TopicDto | null;
  isLoading: boolean;
  error: string | null;
  fetchTopic: () => Promise<void>;
}

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000;

export function useTopicFetch(topicId?: string): UseTopicFetchResult {
  const [topic, setTopic] = useState<TopicDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWithRetry = useCallback(
    async (retries = 0): Promise<TopicDto | null> => {
      if (!topicId) return null;

      try {
        const response = await fetch(`/api/topics/${topicId}`);
        if (!response.ok) {
          throw new Error("Nie udało się pobrać tematu");
        }
        return await response.json();
      } catch (err) {
        if (retries < MAX_RETRIES) {
          await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
          return fetchWithRetry(retries + 1);
        }
        throw err;
      }
    },
    [topicId]
  );

  const fetchTopic = useCallback(async () => {
    if (!topicId) {
      setTopic(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchWithRetry();
      setTopic(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił nieoczekiwany błąd");
      setTopic(null);
    } finally {
      setIsLoading(false);
    }
  }, [topicId, fetchWithRetry]);

  return {
    topic,
    isLoading,
    error,
    fetchTopic,
  };
}
