import { test, expect, type Page } from "@playwright/test";
import { LoginPage, TopicsListPage, DeleteTopicDialog, MainNavigation, TopicFormModal } from "../pom";
import { TEST_USER, generateUniqueName } from "../test-data/auth";
import { logger } from "@/lib/services/logger.service";

// Funkcja pomocnicza do przeładowania strony i zapewnienia, że użytkownik jest zalogowany na stronie tematów
async function reloadPageAndEnsureLoggedInOnTopics(page: Page, topicsPage: TopicsListPage) {
  await page.reload();
  // Poczekaj na stabilizację strony po przeładowaniu
  await page.waitForLoadState("domcontentloaded");

  const mainNav = new MainNavigation(page);
  if (!(await mainNav.isUserLoggedIn())) {
    // isUserLoggedIn domyślnie ma timeout 1s
    logger.warn("Sesja użytkownika została utracona po page.reload(). Próba ponownego zalogowania.");
    const loginPageInstance = new LoginPage(page);
    await loginPageInstance.goto(); // Przejdź na stronę logowania
    await loginPageInstance.login(TEST_USER.email, TEST_USER.password); // Zaloguj się
    // Upewnij się, że logowanie przekierowało na stronę, gdzie nawigacja jest widoczna
    await expect(mainNav.navContainer, "Nawigacja główna powinna być widoczna po ponownym zalogowaniu.").toBeVisible({
      timeout: 10000,
    });
  }

  // Po upewnieniu się, że jesteśmy zalogowani (lub ponownym zalogowaniu), przejdź na stronę tematów
  logger.info("Nawigacja na stronę tematów (/topics).");
  await topicsPage.goto();
  // Sprawdź, czy na pewno jesteśmy na stronie /topics i nie zostaliśmy przekierowani z powrotem na /login
  await expect(page, "URL powinien wskazywać na /topics po nawigacji.").toHaveURL("/topics", { timeout: 5000 });

  await expect(await topicsPage.isLoaded(), "Strona tematów powinna być załadowana.").toBeTruthy();
  await topicsPage.waitForLoadingToComplete();
}

test.describe("Usuwanie tematu", () => {
  // Zaloguj się przed każdym testem
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login(TEST_USER.email, TEST_USER.password);
    // Poczekaj na przekierowanie do strony głównej
    await page.waitForURL("/");
  });

  test("usuwanie pustego tematu", async ({ page }) => {
    // Inicjalizacja klas POM
    const topicsPage = new TopicsListPage(page);
    const deleteDialog = new DeleteTopicDialog(page);

    // Przejdź do strony tematów
    await topicsPage.goto();
    await topicsPage.isLoaded();
    await topicsPage.waitForLoadingToComplete();

    // Utwórz unikalną nazwę dla tematu testowego
    const testTopicName = generateUniqueName("Temat do usunięcia");

    // Dodaj nowy temat (potrzebujemy utworzyć temat, który będziemy mogli usunąć)
    await topicsPage.clickAddTopic();
    await page.getByTestId("topic-name-input").fill(testTopicName);
    await page.getByTestId("topic-submit-button").click();

    // Odśwież stronę, aby upewnić się, że temat został dodany
    await reloadPageAndEnsureLoggedInOnTopics(page, topicsPage);

    // Kliknij przycisk usuwania dla utworzonego tematu
    await topicsPage.clickDeleteTopic(testTopicName);

    // Sprawdź czy dialog jest widoczny
    await expect(await deleteDialog.isVisible()).toBeTruthy();

    // Potwierdź usunięcie
    logger.info("Potwierdzam usunięcie tematu");
    await deleteDialog.confirm();

    // Poczekaj dodatkowy czas na przetworzenie operacji usunięcia
    logger.info("Czekam na przetworzenie operacji usunięcia");
    await page.waitForTimeout(2000);

    // Odśwież stronę, aby upewnić się, że temat został usunięty
    await reloadPageAndEnsureLoggedInOnTopics(page, topicsPage);

    // Sprawdź czy temat zniknął z listy
    const topicElement = topicsPage.getTopicByName(testTopicName);
    await expect(topicElement).not.toBeVisible();
  });

  test("anulowanie usuwania tematu", async ({ page }) => {
    // Inicjalizacja klas POM
    const topicsPage = new TopicsListPage(page);
    const deleteDialog = new DeleteTopicDialog(page);

    // Przejdź do strony tematów
    await topicsPage.goto();
    await topicsPage.isLoaded();
    await topicsPage.waitForLoadingToComplete();

    // Utwórz unikalną nazwę dla tematu testowego
    const testTopicName = generateUniqueName("Temat do anulowania");
    logger.info(`Wygenerowano nazwę tematu do anulowania: "${testTopicName}"`);

    // Dodaj nowy temat
    await topicsPage.clickAddTopic();
    await page.getByTestId("topic-name-input").fill(testTopicName);
    await page.getByTestId("topic-submit-button").click();

    // POCZEKAJ I ZWERYFIKUJ, ŻE TEMAT JEST WIDOCZNY PRZED PRZEŁADOWANIEM
    // Może być konieczne poczekanie na zamknięcie modala, jeśli nie zamyka się automatycznie
    const topicForm = new TopicFormModal(page);
    try {
      await expect(topicForm.modal, "Modal dodawania tematu powinien się zamknąć.").not.toBeVisible({ timeout: 5000 });
    } catch (error) {
      logger.warn(`Modal dodawania tematu nie zamknął się automatycznie, próbuję kliknąć poza nim. Błąd: ${error}`);
      await page.mouse.click(10, 10);
      await expect(
        topicForm.modal,
        "Modal dodawania tematu powinien się zamknąć po kliknięciu na zewnątrz."
      ).not.toBeVisible({ timeout: 2000 });
    }

    // POCZEKAJ NA ZAKOŃCZENIE ŁADOWANIA LISTY TEMATÓW PO DODANIU NOWEGO
    logger.info("Oczekuję na zakończenie ładowania listy tematów po dodaniu nowego tematu (zniknięcie spinnera).");
    await topicsPage.waitForLoadingToComplete();
    logger.info("Ładowanie listy tematów zakończone (spinner zniknął).");

    // ZNAJDŹ FAKTYCZNĄ NAZWĘ DODANEGO TEMATU
    const allTopicTitleElements = page.locator('[data-testid="topic-title"]');
    const lastTopicTitleElement = allTopicTitleElements.last();

    const actualTopicNameAdded = await lastTopicTitleElement.textContent();
    if (!actualTopicNameAdded) {
      throw new Error("Nie udało się pobrać tekstu ostatniego tytułu tematu po dodaniu.");
    }
    logger.info(`Faktyczna nazwa ostatniego tematu na liście (uznana za nowo dodany): "${actualTopicNameAdded}"`);
    logger.info(`Pierwotnie wygenerowana nazwa (dla porównania): "${testTopicName}"`);

    await expect(
      lastTopicTitleElement,
      `Nowo dodany temat (ostatni na liście: "${actualTopicNameAdded}") powinien być widoczny przed pierwszym przeładowaniem.`
    ).toBeVisible({ timeout: 10000 });
    logger.info(`Temat "${actualTopicNameAdded}" jest widoczny na liście po dodaniu.`);

    await reloadPageAndEnsureLoggedInOnTopics(page, topicsPage);

    logger.info(`Będę klikał usuń dla tematu o faktycznej nazwie: "${actualTopicNameAdded}"`);
    await topicsPage.clickDeleteTopic(actualTopicNameAdded);

    await expect(await deleteDialog.isVisible()).toBeTruthy();

    await deleteDialog.cancel();

    await expect(await deleteDialog.isVisible()).toBeFalsy();

    await reloadPageAndEnsureLoggedInOnTopics(page, topicsPage);

    await page.waitForTimeout(500);
    logger.info(`Będę szukał tematu o faktycznej nazwie (po anulowaniu): "${actualTopicNameAdded}"`);

    const visibleTopicTitles = await page.locator('[data-testid="topic-title"]').allTextContents();
    logger.info(`Aktualnie widoczne tytuły tematów na stronie: ${JSON.stringify(visibleTopicTitles)}`);

    const topicElement = topicsPage.getTopicByName(actualTopicNameAdded);
    await expect(topicElement).toBeVisible();
  });
});
