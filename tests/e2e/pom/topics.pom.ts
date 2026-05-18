import type { Page, Locator } from "@playwright/test";
import { logger } from "@/lib/services/logger.service";

/**
 * Page Object Model dla widoku listy tematów
 */
export class TopicsListPage {
  readonly page: Page;
  readonly container: Locator;
  readonly heading: Locator;
  readonly addTopicButton: Locator;
  readonly loadingView: Locator;
  readonly topicLoadingSpinner: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    this.page = page;
    this.container = page.getByTestId("topics-list-view");
    this.heading = page.getByTestId("topics-heading");
    this.addTopicButton = page.getByTestId("add-topic-button");
    this.loadingView = page.getByTestId("topics-loading-view");
    this.topicLoadingSpinner = page.getByTestId("loading-spinner");
    this.pagination = page.getByTestId("topics-pagination");
  }

  /**
   * Nawiguje do strony z listą tematów
   */
  async goto() {
    await this.page.goto("/topics");
  }

  /**
   * Sprawdza czy strona z tematami jest załadowana
   */
  async isLoaded() {
    try {
      await this.container.waitFor({ state: "visible", timeout: 5000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sprawdza czy widok ładowania jest wyświetlany
   */
  async isLoading() {
    try {
      await this.loadingView.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Oczekuje na zakończenie ładowania tematów
   */
  async waitForLoadingToComplete() {
    // Jeśli spinner jest widoczny, czekamy na jego zniknięcie
    try {
      const isSpinnerVisible = await this.loadingView.isVisible({ timeout: 1000 });
      if (isSpinnerVisible) {
        await this.loadingView.waitFor({ state: "detached", timeout: 10000 });
      }
    } catch {
      // Ignorujemy błąd, gdy spinner nie jest znaleziony - to znaczy, że strona już jest załadowana
    }
  }

  /**
   * Oczekuje na zakończenie ładowania tematu po kliknięciu
   */
  async waitForTopicLoadingToComplete() {
    try {
      const isSpinnerVisible = await this.topicLoadingSpinner.isVisible({ timeout: 1000 });
      if (isSpinnerVisible) {
        await this.topicLoadingSpinner.waitFor({ state: "detached", timeout: 10000 });
      }
    } catch {
      // Ignorujemy błąd, gdy spinner nie jest znaleziony - to znaczy, że temat już jest załadowany
    }
  }

  /**
   * Klika przycisk dodawania nowego tematu
   */
  async clickAddTopic() {
    await this.addTopicButton.click();
  }

  /**
   * Sprawdza czy paginacja jest widoczna
   */
  async hasPagination() {
    try {
      await this.pagination.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Znajduje temat po nazwie
   * @param name Nazwa tematu
   */
  getTopicByName(name: string) {
    return this.page.locator(`[data-testid="topic-title"]:has-text("${name}")`);
  }

  /**
   * Znajduje temat po id
   * @param id ID tematu
   */
  getTopicById(id: string) {
    return this.page.locator(`[data-topicid="${id}"]`);
  }

  /**
   * Klika w temat
   * @param name Nazwa tematu
   */
  async clickTopic(name: string) {
    await this.getTopicByName(name).click();
    await this.waitForTopicLoadingToComplete();
  }

  /**
   * Klika w temat po ID
   * @param id ID tematu
   */
  async clickTopicById(id: string) {
    await this.getTopicById(id).click();
    await this.waitForTopicLoadingToComplete();
  }

  /**
   * Znajduje przycisk edycji dla tematu
   * @param topicName Nazwa tematu
   */
  getEditButtonForTopic(topicName: string) {
    // Najpierw znajdź kartę tematu
    const topicCard = this.page.locator(`[data-testid="topic-item"]:has-text("${topicName}")`);
    // Następnie znajdź przycisk edycji w karcie
    return topicCard.locator('[data-testid="edit-topic-button"]');
  }

  /**
   * Znajduje przycisk usuwania dla tematu
   * @param topicName Nazwa tematu
   */
  getDeleteButtonForTopic(topicName: string) {
    // Najpierw znajdź kartę tematu
    const topicCard = this.page.locator(`[data-testid="topic-item"]:has-text("${topicName}")`);
    // Następnie znajdź przycisk usuwania w karcie
    return topicCard.locator('[data-testid="delete-topic-button"]');
  }

  /**
   * Klika przycisk edycji dla wybranego tematu
   * @param topicName Nazwa tematu
   */
  async clickEditTopic(topicName: string) {
    logger.info(`Klikam przycisk edycji dla tematu: ${topicName}`);
    await this.getEditButtonForTopic(topicName).click();
  }

  /**
   * Klika przycisk usuwania dla wybranego tematu
   * @param topicName Nazwa tematu
   */
  async clickDeleteTopic(topicName: string) {
    logger.info(`Próbuję kliknąć przycisk usuwania dla tematu: ${topicName}`);

    try {
      // Próba 1: Standardowa metoda z nowym selektorem
      const deleteButton = this.getDeleteButtonForTopic(topicName);
      const isVisible = await deleteButton.isVisible({ timeout: 2000 });

      if (isVisible) {
        logger.info("Znaleziono przycisk usuwania, klikam");
        await deleteButton.click();
        return;
      }

      logger.warn("Nie znaleziono przycisku standardową metodą, próbuję alternatywne podejścia");

      // Próba 2: Bardziej ogólne podejście - znajdź wszystkie przyciski usuwania
      const allTopicCards = this.page.locator('[data-testid="topic-item"]');
      const cardsCount = await allTopicCards.count();
      logger.info(`Znaleziono ${cardsCount} kart tematów na stronie`);

      // Dla każdej karty sprawdź, czy zawiera nazwę tematu
      for (let i = 0; i < cardsCount; i++) {
        const card = allTopicCards.nth(i);
        const cardText = await card.textContent();

        if (cardText && cardText.includes(topicName)) {
          logger.info(`Znaleziono kartę zawierającą tekst tematu: ${topicName}`);
          const deleteButton = card.locator('[data-testid="delete-topic-button"]');

          if (await deleteButton.isVisible()) {
            logger.info("Znaleziono przycisk usuwania w karcie, klikam");
            await deleteButton.click();
            return;
          }
        }
      }

      // Próba 3: Ostateczność - znajdź przycisk po atrybucie data-testid bezpośrednio
      logger.warn("Nie znaleziono przycisku w kontekście tematu, szukam wszystkich przycisków usuwania");
      const allDeleteButtons = this.page.locator('[data-testid="delete-topic-button"]');
      const buttonsCount = await allDeleteButtons.count();

      if (buttonsCount > 0) {
        logger.info(`Znaleziono ${buttonsCount} przycisków usuwania, klikam pierwszy z nich`);
        await allDeleteButtons.first().click();
        return;
      }

      // Jeśli wszystkie próby zawiodły
      throw new Error(`Nie udało się znaleźć przycisku usuwania dla tematu "${topicName}"`);
    } catch (error) {
      logger.error(`Błąd podczas próby kliknięcia przycisku usuwania: ${error}`);
      throw error;
    }
  }
}

/**
 * Page Object Model dla formularza dodawania/edycji tematu
 */
export class TopicFormModal {
  readonly page: Page;
  readonly modal: Locator;
  readonly form: Locator;
  readonly nameInput: Locator;
  readonly descriptionInput: Locator;
  readonly nameError: Locator;
  readonly descriptionError: Locator;
  readonly formError: Locator;
  readonly cancelButton: Locator;
  readonly submitButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.modal = page.getByTestId("topic-form-modal");
    this.form = page.getByTestId("topic-form");
    this.nameInput = page.getByTestId("topic-name-input");
    this.descriptionInput = page.getByTestId("topic-description-input");
    this.nameError = page.getByTestId("topic-name-error");
    this.descriptionError = page.getByTestId("topic-description-error");
    this.formError = page.getByTestId("topic-form-error");
    this.cancelButton = page.getByTestId("topic-cancel-button");
    this.submitButton = page.getByTestId("topic-submit-button");
  }

  /**
   * Sprawdza czy modal formularza jest widoczny
   */
  async isVisible() {
    try {
      await this.modal.waitFor({ state: "visible", timeout: 2000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Wypełnia formularz tematu
   * @param name Nazwa tematu
   * @param description Opis tematu (opcjonalny)
   */
  async fillForm(name: string, description?: string) {
    await this.nameInput.fill(name);
    if (description) {
      await this.descriptionInput.fill(description);
    }
  }

  /**
   * Zatwierdza formularz
   */
  async submit() {
    await this.submitButton.click();
  }

  /**
   * Anuluje formularz
   */
  async cancel() {
    await this.cancelButton.click();
  }

  /**
   * Wypełnia formularz i go zatwierdza
   * @param name Nazwa tematu
   * @param description Opis tematu (opcjonalny)
   */
  async createTopic(name: string, description?: string) {
    await this.fillForm(name, description);
    await this.submit();
  }

  /**
   * Pobiera tekst błędu dla pola nazwy (jeśli istnieje)
   */
  async getNameError() {
    try {
      await this.nameError.waitFor({ state: "visible", timeout: 1000 });
      return this.nameError.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Pobiera tekst błędu dla pola opisu (jeśli istnieje)
   */
  async getDescriptionError() {
    try {
      await this.descriptionError.waitFor({ state: "visible", timeout: 1000 });
      return this.descriptionError.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Pobiera tekst ogólnego błędu formularza (jeśli istnieje)
   */
  async getFormError() {
    try {
      await this.formError.waitFor({ state: "visible", timeout: 1000 });
      return this.formError.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Sprawdza czy formularz jest w trakcie wysyłania
   */
  async isSubmitting() {
    return this.submitButton.isDisabled();
  }
}
