/**
 * Odmienia słowo w zależności od liczby
 * @param count - liczba
 * @param word - słowo w mianowniku liczby pojedynczej
 * @param plural - słowo w mianowniku liczby mnogiej
 * @param genitive - słowo w dopełniaczu liczby mnogiej
 * @returns odmienione słowo
 */
export function pluralize(count: number, word: string, plural: string, genitive: string): string {
  if (count === 1) return word;
  if (count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 10 || count % 100 >= 20)) return plural;
  return genitive;
}

/**
 * Odmienia słowo "dokument" w zależności od liczby
 */
export function pluralizeDocument(count: number): string {
  return pluralize(count, "dokument", "dokumenty", "dokumentów");
}

/**
 * Odmienia słowo "fiszka" w zależności od liczby
 */
export function pluralizeFlashcard(count: number): string {
  return pluralize(count, "fiszka", "fiszki", "fiszek");
}
