// Zawsze definiujemy mocki przed importami
vi.mock("../logger.service", () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
  },
}));

import { describe, it, expect, vi, beforeEach } from "vitest";
import { TopicsService } from "../topics.service";
import type { SupabaseClient } from "@/db/supabase.client";
import type { TopicDto } from "../../../types";

describe("TopicsService", () => {
  const userId = "test-user-id";
  let mockSupabase: SupabaseClient;
  let topicsService: TopicsService;

  // Mock danych tematu
  const mockTopic: TopicDto = {
    id: "test-topic-id",
    user_id: userId,
    name: "Test temat",
    description: "Opis testowego tematu",
    parent_id: null,
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
    documents_count: 2,
    flashcards_count: 5,
    breadcrumbs: [],
  };

  beforeEach(() => {
    // Resetujemy wszystkie mocki przed każdym testem
    vi.resetAllMocks();

    // Tworzymy prosty mock dla SupabaseClient
    mockSupabase = {} as unknown as SupabaseClient;

    // Inicjalizujemy serwis z mockiem Supabase
    topicsService = new TopicsService(mockSupabase, userId);
  });

  describe("list", () => {
    it("powinien zwrócić pustą listę tematów", async () => {
      // Arrange
      const originalMethod = topicsService.list;
      topicsService.list = vi.fn().mockResolvedValue({
        topics: [],
        total: 0,
      });

      // Act
      const result = await topicsService.list({ page: 1, limit: 10, sort: "name" });

      // Assert
      expect(topicsService.list).toHaveBeenCalledWith({ page: 1, limit: 10, sort: "name" });
      expect(result.topics).toHaveLength(0);
      expect(result.total).toBe(0);

      // Clean up
      topicsService.list = originalMethod;
    });

    it("powinien zwrócić listę tematów z prawidłowymi parametrami wyszukiwania", async () => {
      // Arrange
      const mockTopics = [
        { ...mockTopic, id: "topic-1", name: "Temat 1" },
        { ...mockTopic, id: "topic-2", name: "Temat 2" },
      ];

      const originalMethod = topicsService.list;
      topicsService.list = vi.fn().mockResolvedValue({
        topics: mockTopics,
        total: 2,
      });

      // Act
      const result = await topicsService.list({
        page: 1,
        limit: 10,
        sort: "name",
        name: "Temat",
        parent_id: "parent-id",
      });

      // Assert
      expect(topicsService.list).toHaveBeenCalledWith({
        page: 1,
        limit: 10,
        sort: "name",
        name: "Temat",
        parent_id: "parent-id",
      });
      expect(result.topics).toHaveLength(2);
      expect(result.total).toBe(2);

      // Clean up
      topicsService.list = originalMethod;
    });

    it("powinien obsłużyć błąd z bazy danych", async () => {
      // Arrange
      const originalMethod = topicsService.list;
      topicsService.list = vi.fn().mockRejectedValue(new Error("Błąd podczas pobierania tematów: Database error"));

      // Act & Assert
      await expect(topicsService.list({ page: 1, limit: 10, sort: "name" })).rejects.toThrow(
        "Błąd podczas pobierania tematów: Database error"
      );

      // Clean up
      topicsService.list = originalMethod;
    });
  });

  describe("getById", () => {
    it("powinien pobrać temat po ID", async () => {
      // Arrange
      const topicId = "123e4567-e89b-12d3-a456-426614174000"; // Prawidłowy format UUID

      const originalMethod = topicsService.getById;
      topicsService.getById = vi.fn().mockResolvedValue(mockTopic);

      // Act
      const result = await topicsService.getById(topicId);

      // Assert
      expect(topicsService.getById).toHaveBeenCalledWith(topicId);
      expect(result).toEqual(expect.objectContaining(mockTopic));

      // Clean up
      topicsService.getById = originalMethod;
    });

    it("powinien rzucić błąd dla nieprawidłowego ID", async () => {
      // Arrange
      const originalMethod = topicsService.getById;
      topicsService.getById = vi.fn().mockRejectedValue(new Error("Invalid uuid"));

      // Act & Assert
      await expect(topicsService.getById("invalid-id@")).rejects.toThrow("Invalid uuid");

      // Clean up
      topicsService.getById = originalMethod;
    });

    it("powinien rzucić błąd gdy temat nie istnieje", async () => {
      // Arrange
      const topicId = "123e4567-e89b-12d3-a456-426614174001"; // Prawidłowy format UUID

      const originalMethod = topicsService.getById;
      topicsService.getById = vi.fn().mockRejectedValue(new Error("Błąd podczas pobierania tematu: Not found"));

      // Act & Assert
      await expect(topicsService.getById(topicId)).rejects.toThrow("Błąd podczas pobierania tematu: Not found");

      // Clean up
      topicsService.getById = originalMethod;
    });
  });

  describe("create", () => {
    it("powinien utworzyć nowy temat", async () => {
      // Arrange
      const newTopicData = {
        name: "Nowy temat",
        description: "Opis nowego tematu",
      };

      const originalMethod = topicsService.create;
      topicsService.create = vi.fn().mockResolvedValue({
        ...mockTopic,
        ...newTopicData,
      });

      // Act
      const result = await topicsService.create(newTopicData);

      // Assert
      expect(topicsService.create).toHaveBeenCalledWith(newTopicData);
      expect(result.name).toBe(newTopicData.name);
      expect(result.description).toBe(newTopicData.description);

      // Clean up
      topicsService.create = originalMethod;
    });

    it("powinien rzucić błąd jeśli nazwa tematu już istnieje", async () => {
      // Arrange
      const duplicateTopicData = {
        name: "Duplikat",
      };

      const originalMethod = topicsService.create;
      topicsService.create = vi
        .fn()
        .mockRejectedValue(new Error("Temat o tej nazwie już istnieje dla tego samego rodzica"));

      // Act & Assert
      await expect(topicsService.create(duplicateTopicData)).rejects.toThrow(
        "Temat o tej nazwie już istnieje dla tego samego rodzica"
      );

      // Clean up
      topicsService.create = originalMethod;
    });
  });
});
