import type { Page, Locator } from "@playwright/test";

/**
 * Page Object Model dla strony logowania
 */
export class LoginPage {
  readonly page: Page;
  readonly loginCard: Locator;
  readonly loginForm: Locator;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.loginCard = page.getByTestId("login-card");
    this.loginForm = page.getByTestId("login-form");
    this.emailInput = page.getByTestId("login-email-input");
    this.passwordInput = page.getByTestId("login-password-input");
    this.submitButton = page.getByTestId("auth-submit-button");
    this.errorMessage = page.getByTestId("auth-form-error");
  }

  /**
   * Nawiguje do strony logowania
   */
  async goto() {
    await this.page.goto("/login");
  }

  /**
   * Sprawdza czy strona logowania jest załadowana
   */
  async isLoaded() {
    await this.loginCard.waitFor({ state: "visible" });
    return this.loginCard.isVisible();
  }

  /**
   * Wypełnia formularz logowania
   * @param email Adres email
   * @param password Hasło
   */
  async fillLoginForm(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
  }

  /**
   * Klika przycisk logowania
   */
  async submitForm() {
    await this.submitButton.click();
  }

  /**
   * Wykonuje kompletny proces logowania
   * @param email Adres email
   * @param password Hasło
   */
  async login(email: string, password: string) {
    await this.fillLoginForm(email, password);
    await this.submitForm();
  }

  /**
   * Sprawdza czy jest wyświetlany komunikat o błędzie
   * @returns Treść błędu lub null jeśli nie ma błędu
   */
  async getErrorMessage() {
    try {
      await this.errorMessage.waitFor({ state: "visible", timeout: 2000 });
      return this.errorMessage.textContent();
    } catch {
      return null;
    }
  }

  /**
   * Sprawdza czy proces logowania jest w toku
   */
  async isSubmitting() {
    return this.submitButton.isDisabled();
  }
}
