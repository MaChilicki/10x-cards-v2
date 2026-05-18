import type { Page, Locator } from "@playwright/test";
import { logger } from "@/lib/services/logger.service";

/**
 * Page Object Model dla głównej nawigacji
 */
export class MainNavigation {
  readonly page: Page;
  readonly navContainer: Locator;
  readonly appLogo: Locator;
  readonly navMenu: Locator;
  readonly navHome: Locator;
  readonly navTopics: Locator;
  readonly navSessions: Locator;
  readonly navStatistics: Locator;
  readonly userMenuTrigger: Locator;
  readonly navProfile: Locator;
  readonly navChangePassword: Locator;
  readonly navLogout: Locator;
  readonly navLogin: Locator;
  readonly authLoading: Locator;
  readonly userMenuContent: Locator;

  constructor(page: Page) {
    this.page = page;
    this.navContainer = page.getByTestId("main-navigation");
    this.appLogo = page.getByTestId("app-logo");
    this.navMenu = page.getByTestId("navigation-menu");
    this.navHome = page.getByTestId("nav-home");
    this.navTopics = page.getByTestId("nav-topics");
    this.navSessions = page.getByTestId("nav-sessions");
    this.navStatistics = page.getByTestId("nav-statistics");
    this.userMenuTrigger = page.getByTestId("user-menu-trigger");
    this.navProfile = page.getByTestId("nav-profile");
    this.navChangePassword = page.getByTestId("nav-change-password");
    this.navLogout = page.getByTestId("nav-logout");
    this.navLogin = page.getByTestId("nav-login");
    this.authLoading = page.getByTestId("auth-loading");
    // Dowolny element wewnątrz menu użytkownika
    this.userMenuContent = page.locator('role=menu[name*="mchilicki@gmail.com"]');
  }

  /**
   * Sprawdza czy nawigacja jest widoczna
   */
  async isVisible() {
    await this.navContainer.waitFor({ state: "visible" });
    return this.navContainer.isVisible();
  }

  /**
   * Klika w logo aplikacji
   */
  async clickLogo() {
    await this.appLogo.click();
  }

  /**
   * Klika w link do strony głównej
   */
  async goToHome() {
    await this.navHome.click();
  }

  /**
   * Klika w link do strony z tematami
   */
  async goToTopics() {
    await this.navTopics.click();
  }

  /**
   * Klika w link do strony z sesjami nauki
   */
  async goToSessions() {
    await this.navSessions.click();
  }

  /**
   * Klika w link do strony ze statystykami
   */
  async goToStatistics() {
    await this.navStatistics.click();
  }

  /**
   * Sprawdza czy menu użytkownika jest już otwarte
   */
  async isUserMenuOpen() {
    try {
      // Sprawdź czy menu jest widoczne
      const menuVisible = await this.userMenuContent.isVisible({ timeout: 1000 });
      if (menuVisible) return true;

      // Alternatywnie sprawdź atrybuty przyciska menu
      const buttonState = await this.userMenuTrigger.getAttribute("data-state");
      const expanded = await this.userMenuTrigger.getAttribute("aria-expanded");
      return buttonState === "open" || expanded === "true";
    } catch {
      return false;
    }
  }

  /**
   * Otwiera menu użytkownika
   */
  async openUserMenu() {
    // Najpierw sprawdź czy menu jest już otwarte
    if (await this.isUserMenuOpen()) {
      logger.info("Menu użytkownika jest już otwarte");
      return;
    }

    try {
      // Próba standardowego kliknięcia
      await this.userMenuTrigger.click({ timeout: 3000 });
    } catch {
      logger.warn("Standardowe kliknięcie w menu użytkownika nie zadziałało, próbuję wymusić kliknięcie");
      try {
        // Spróbuj z wymuszoną opcją, aby ominąć nakładkę
        await this.userMenuTrigger.click({ force: true, timeout: 3000 });
      } catch {
        logger.error("Również wymuszone kliknięcie nie działa, próbuję bezpośrednio kliknąć przycisk wylogowania");
        // Jeśli nawet to nie działa, spróbujmy bezpośrednio kliknąć element wylogowania
        await this.navLogout.click({ force: true });
      }
    }

    // Poczekaj krótko, aby menu miało czas się otworzyć
    await this.page.waitForTimeout(500);
  }

  /**
   * Klika w link do profilu użytkownika (wymaga otwartego menu)
   */
  async goToProfile() {
    await this.openUserMenu();
    await this.navProfile.click();
  }

  /**
   * Klika w link do zmiany hasła (wymaga otwartego menu)
   */
  async goToChangePassword() {
    await this.openUserMenu();
    await this.navChangePassword.click();
  }

  /**
   * Klika przycisk wylogowania (wymaga otwartego menu)
   */
  async clickLogout() {
    // Jeśli menu użytkownika jest już otwarte, kliknij bezpośrednio w wyloguj
    if (await this.isUserMenuOpen()) {
      await this.navLogout.click({ timeout: 5000 });
      return;
    }

    try {
      // Standardowa ścieżka
      await this.openUserMenu();
      await this.navLogout.click();
    } catch {
      logger.warn("Standardowe wylogowanie nie zadziałało, próbuję alternatywną metodę");
      // Próba bezpośredniego kliknięcia w przycisk wylogowania, nawet jeśli nie otworzono menu
      await this.navLogout.click({ force: true });
    }
  }

  /**
   * Klika w link do strony logowania (gdy użytkownik nie jest zalogowany)
   */
  async goToLogin() {
    await this.navLogin.click();
  }

  /**
   * Sprawdza czy użytkownik jest zalogowany (sprawdza czy przycisk menu użytkownika jest widoczny)
   */
  async isUserLoggedIn() {
    try {
      await this.userMenuTrigger.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Sprawdza czy wyświetla się informacja o ładowaniu danych autoryzacji
   */
  async isAuthLoading() {
    try {
      await this.authLoading.waitFor({ state: "visible", timeout: 1000 });
      return true;
    } catch {
      return false;
    }
  }
}
