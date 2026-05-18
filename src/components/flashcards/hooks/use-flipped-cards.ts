import { useState } from "react";

export function useFlippedCards() {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const isCardFlipped = (cardId: string) => flippedCards.has(cardId);

  return {
    isCardFlipped,
    toggleCard,
  };
}
