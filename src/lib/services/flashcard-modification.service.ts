import type { Flashcard } from "../../types";

export class FlashcardModificationService {
  /**
   * Oblicza procent modyfikacji fiszki
   * Jeśli oryginalna i zmodyfikowana treść są identyczne - 0%
   * Jeśli są różne - 100%
   */
  calculateModificationPercentage(
    originalFlashcard: Pick<Flashcard, "front_original" | "back_original">,
    modifiedContent: {
      front_modified?: string;
      back_modified?: string;
    }
  ): number {
    const frontModified =
      modifiedContent.front_modified !== undefined &&
      modifiedContent.front_modified !== originalFlashcard.front_original;

    const backModified =
      modifiedContent.back_modified !== undefined && modifiedContent.back_modified !== originalFlashcard.back_original;

    if (!frontModified && !backModified) {
      return 0;
    }

    return 100;
  }

  /**
   * Sprawdza czy fiszka wymaga utworzenia nowej wersji
   * Jeśli modyfikacja >= 50% - true
   * W przeciwnym razie - false
   */
  shouldCreateNewVersion(modificationPercentage: number): boolean {
    return modificationPercentage >= 50;
  }
}
