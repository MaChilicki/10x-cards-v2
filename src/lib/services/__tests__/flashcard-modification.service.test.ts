import { describe, it, expect } from "vitest";
import { FlashcardModificationService } from "../flashcard-modification.service";
import type { Flashcard } from "../../../types";

describe("FlashcardModificationService", () => {
  const service = new FlashcardModificationService();

  describe("calculateModificationPercentage", () => {
    it("powinien zwrócić 0% gdy nie ma modyfikacji", () => {
      // Arrange
      const originalFlashcard: Pick<Flashcard, "front_original" | "back_original"> = {
        front_original: "Pytanie testowe",
        back_original: "Odpowiedź testowa",
      };
      const modifiedContent = {
        front_modified: "Pytanie testowe",
        back_modified: "Odpowiedź testowa",
      };

      // Act
      const result = service.calculateModificationPercentage(originalFlashcard, modifiedContent);

      // Assert
      expect(result).toBe(0);
    });

    it("powinien zwrócić 100% gdy zmodyfikowano front", () => {
      // Arrange
      const originalFlashcard: Pick<Flashcard, "front_original" | "back_original"> = {
        front_original: "Pytanie testowe",
        back_original: "Odpowiedź testowa",
      };
      const modifiedContent = {
        front_modified: "Zmodyfikowane pytanie",
        back_modified: "Odpowiedź testowa",
      };

      // Act
      const result = service.calculateModificationPercentage(originalFlashcard, modifiedContent);

      // Assert
      expect(result).toBe(100);
    });

    it("powinien zwrócić 100% gdy zmodyfikowano back", () => {
      // Arrange
      const originalFlashcard: Pick<Flashcard, "front_original" | "back_original"> = {
        front_original: "Pytanie testowe",
        back_original: "Odpowiedź testowa",
      };
      const modifiedContent = {
        front_modified: "Pytanie testowe",
        back_modified: "Zmodyfikowana odpowiedź",
      };

      // Act
      const result = service.calculateModificationPercentage(originalFlashcard, modifiedContent);

      // Assert
      expect(result).toBe(100);
    });

    it("powinien zwrócić 100% gdy zmodyfikowano front i back", () => {
      // Arrange
      const originalFlashcard: Pick<Flashcard, "front_original" | "back_original"> = {
        front_original: "Pytanie testowe",
        back_original: "Odpowiedź testowa",
      };
      const modifiedContent = {
        front_modified: "Zmodyfikowane pytanie",
        back_modified: "Zmodyfikowana odpowiedź",
      };

      // Act
      const result = service.calculateModificationPercentage(originalFlashcard, modifiedContent);

      // Assert
      expect(result).toBe(100);
    });
  });

  describe("shouldCreateNewVersion", () => {
    it("powinien zwrócić false dla modyfikacji poniżej 50%", () => {
      // Arrange
      const modificationPercentage = 49;

      // Act
      const result = service.shouldCreateNewVersion(modificationPercentage);

      // Assert
      expect(result).toBe(false);
    });

    it("powinien zwrócić true dla modyfikacji równej 50%", () => {
      // Arrange
      const modificationPercentage = 50;

      // Act
      const result = service.shouldCreateNewVersion(modificationPercentage);

      // Assert
      expect(result).toBe(true);
    });

    it("powinien zwrócić true dla modyfikacji powyżej 50%", () => {
      // Arrange
      const modificationPercentage = 100;

      // Act
      const result = service.shouldCreateNewVersion(modificationPercentage);

      // Assert
      expect(result).toBe(true);
    });
  });
});
