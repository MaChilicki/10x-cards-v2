import { expect } from "@playwright/test";
import type { Page, Locator } from "@playwright/test";

/**
 * Wzorzec Page Object Model dla strony głównej
 * Zapewnia enkapsulację selektorów i działań dla strony głównej
 */
export class HomePage {
  readonly page: Page;
  readonly logo: Locator;
  readonly navigationLinks: Locator;
  readonly heading: Locator;
  readonly loginButton: Locator;
  readonly registerButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.logo = page.getByAltText("10xCards Logo");
    this.navigationLinks = page.getByRole("navigation").getByRole("link");
    this.heading = page.getByRole("heading", { level: 1 });
    this.loginButton = page.getByRole("link", { name: "Zaloguj się" });
    this.registerButton = page.getByRole("link", { name: "Zarejestruj się" });
  }

  /**
   * Nawiguje do strony głównej
   */
  async goto() {
    await this.page.goto("/");
  }

  /**
   * Sprawdza czy strona główna załadowała się poprawnie
   */
  async expectPageLoaded() {
    await expect(this.logo).toBeVisible();
    await expect(this.heading).toBeVisible();
    await expect(this.page).toHaveTitle(/10xCards/);
  }

  /**
   * Klika link w menu nawigacyjnym o podanej nazwie
   */
  async clickNavLink(name: string) {
    await this.page.getByRole("link", { name }).click();
  }

  /**
   * Przechodzi do strony logowania
   */
  async navigateToLogin() {
    await this.loginButton.click();
    await expect(this.page).toHaveURL(/.*login/);
  }

  /**
   * Przechodzi do strony rejestracji
   */
  async navigateToRegister() {
    await this.registerButton.click();
    await expect(this.page).toHaveURL(/.*register/);
  }

  /**
   * Sprawdza czy user jest zalogowany
   */
  async expectUserLoggedIn(username: string) {
    await expect(this.page.getByText(`Witaj, ${username}`)).toBeVisible();
  }
}
