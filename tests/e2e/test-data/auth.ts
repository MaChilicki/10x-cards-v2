/**
 * Dane testowe użytkownika do testów E2E
 * Wartości są odczytywane z pliku .env.test
 */
export const TEST_USER = {
  id: process.env.E2E_USERNAME_ID || "test-user-id",
  email: process.env.E2E_USERNAME || "test@example.com",
  password: process.env.E2E_PASSWORD || "test123",
};

/**
 * Funkcja pomocnicza do generowania unikalnych nazw z timestampem
 * @param prefix Prefiks nazwy
 * @returns Unikalna nazwa w formacie: "prefix timestamp"
 */
export function generateUniqueName(prefix: string): string {
  return `${prefix} ${Date.now()}`;
}
