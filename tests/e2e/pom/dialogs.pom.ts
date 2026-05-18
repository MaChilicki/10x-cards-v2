import type { Page, Locator } from "@playwright/test";
import { logger } from "@/lib/services/logger.service";

/**
 * Page Object Model dla dialogu wylogowania
 */
export class LogoutDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("logout-dialog");
    this.confirmButton = page.getByTestId("logout-confirm-button");
    this.cancelButton = page.getByTestId("logout-cancel-button");
  }

  /**
   * Sprawdza czy dialog jest widoczny
   */
  async isVisible() {
    try {
      await this.dialog.waitFor({ state: "visible", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Potwierdza wylogowanie
   */
  async confirm() {
    await this.confirmButton.click();
  }

  /**
   * Anuluje wylogowanie
   */
  async cancel() {
    logger.info("Klikam przycisk anulowania wylogowania");
    await this.cancelButton.click();

    // Dodajemy czekanie na zamknięcie dialogu
    try {
      // Oczekuj, że dialog zniknie w ciągu 3 sekund
      await this.dialog.waitFor({ state: "hidden", timeout: 3000 });
      logger.info("Dialog został zamknięty");
    } catch {
      logger.warn("Dialog nie został zamknięty po kliknięciu anuluj");

      // Próba alternatywnego zamknięcia dialogu
      try {
        // Kliknij gdzieś poza dialogiem, aby go zamknąć
        await this.page.mouse.click(0, 0);
        logger.info("Kliknięto poza dialogiem");

        // Sprawdź, czy dialog jest teraz ukryty
        const isStillVisible = await this.isVisible();
        logger.info(`Dialog nadal widoczny po kliknięciu poza nim: ${isStillVisible}`);

        if (isStillVisible) {
          // Jako ostateczność spróbuj wcisnąć Escape
          await this.page.keyboard.press("Escape");
          logger.info("Wciśnięto Escape");
        }
      } catch {
        logger.error("Nie udało się zamknąć dialogu alternatywnymi metodami");
      }
    }
  }

  /**
   * Sprawdza czy przycisk potwierdzenia jest wyłączony (np. podczas ładowania)
   */
  async isConfirmButtonDisabled() {
    return this.confirmButton.isDisabled();
  }
}

/**
 * Page Object Model dla dialogu usuwania tematu
 */
export class DeleteTopicDialog {
  readonly page: Page;
  readonly dialog: Locator;
  readonly confirmButton: Locator;
  readonly cancelButton: Locator;
  readonly contentWarning: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.dialog = page.getByTestId("delete-topic-dialog");
    this.confirmButton = page.getByTestId("delete-topic-confirm-button");
    this.cancelButton = page.getByTestId("delete-topic-cancel-button");
    this.contentWarning = page.getByTestId("delete-topic-content-warning");
    this.errorMessage = page.getByTestId("delete-topic-error");
  }

  /**
   * Sprawdza czy dialog jest widoczny
   */
  async isVisible() {
    try {
      await this.dialog.waitFor({ state: "visible", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Potwierdza usunięcie tematu
   */
  async confirm() {
    await this.confirmButton.click();
  }

  /**
   * Anuluje usunięcie tematu
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Sprawdza czy przycisk potwierdzenia jest wyłączony (np. podczas usuwania lub gdy temat ma zawartość)
   */
  async isConfirmButtonDisabled() {
    return this.confirmButton.isDisabled();
  }

  /**
   * Sprawdza czy ostrzeżenie o zawartości tematu jest widoczne
   */
  async hasContentWarning() {
    try {
      await this.contentWarning.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sprawdza czy komunikat o błędzie jest wyświetlany
   * @returns Treść błędu lub null jeśli nie ma błędu
   */
  async getErrorMessage() {
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 1000 });
      return this.errorMessage.textContent();
    } catch {
      return null;
    }
  }
}
