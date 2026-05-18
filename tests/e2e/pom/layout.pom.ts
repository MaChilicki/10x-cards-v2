import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model dla głównego layoutu aplikacji
 */
export class MainLayout {
  readonly page: Page;
  readonly mainLayoutContainer: Locator;
  readonly mainContent: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainLayoutContainer = page.getByTestId("main-layout");
    this.mainContent = page.getByTestId("main-content");
    this.loadingSpinner = page.getByTestId("loading-spinner");
  }

  /**
   * Sprawdza czy główny layout jest widoczny
   */
  async isVisible() {
    await this.mainLayoutContainer.waitFor({ state: "visible" });
    return this.mainLayoutContainer.isVisible();
  }

  /**
   * Sprawdza czy główna treść jest widoczna
   */
  async isContentVisible() {
    await this.mainContent.waitFor({ state: "visible" });
    return this.mainContent.isVisible();
  }

  /**
   * Oczekuje na zakończenie ładowania zawartości
   */
  async waitForLoadingToComplete() {
    try {
      const isSpinnerVisible = await this.loadingSpinner.isVisible({ timeout: 1000 });
      if (isSpinnerVisible) {
        await this.loadingSpinner.waitFor({ state: "detached", timeout: 10000 });
      }
    } catch {
      // Ignorujemy błąd, gdy spinner nie jest znaleziony - to znaczy, że strona już jest załadowana
    }
  }
}

/**
 * Page Object Model dla layoutu autoryzacji
 */
export class AuthLayout {
  readonly page: Page;
  readonly authLayoutContainer: Locator;
  readonly authContainer: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.authLayoutContainer = page.getByTestId("auth-layout");
    this.authContainer = page.getByTestId("auth-container");
    this.loadingSpinner = page.getByTestId("loading-spinner");
  }

  /**
   * Sprawdza czy layout autoryzacji jest widoczny
   */
  async isVisible() {
    await this.authLayoutContainer.waitFor({ state: "visible" });
    return this.authLayoutContainer.isVisible();
  }

  /**
   * Sprawdza czy kontener autoryzacji jest widoczny
   */
  async isContainerVisible() {
    await this.authContainer.waitFor({ state: "visible" });
    return this.authContainer.isVisible();
  }

  /**
   * Oczekuje na zakończenie ładowania zawartości
   */
  async waitForLoadingToComplete() {
    try {
      const isSpinnerVisible = await this.loadingSpinner.isVisible({ timeout: 1000 });
      if (isSpinnerVisible) {
        await this.loadingSpinner.waitFor({ state: "detached", timeout: 10000 });
      }
    } catch {
      // Ignorujemy błąd, gdy spinner nie jest znaleziony - to znaczy, że strona już jest załadowana
    }
  }
}
