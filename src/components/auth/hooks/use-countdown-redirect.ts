import { useState, useEffect } from "react";
import { logger } from "@/lib/services/logger.service";

type RedirectPath = string | null;

interface UseCountdownRedirectReturn {
  counter: number;
  redirectPath: RedirectPath;
  counterText: string;
  redirect: (path: string, seconds?: number) => void;
  cancelRedirect: () => void;
}

/**
 * Hook do obsługi odliczania i automatycznego przekierowania
 *
 * @param initialSeconds Początkowa liczba sekund do odliczania (domyślnie 5)
 * @returns Obiekt zawierający stan odliczania, ścieżkę przekierowania oraz funkcje pomocnicze
 */
export function useCountdownRedirect(initialSeconds = 5): UseCountdownRedirectReturn {
  const [counter, setCounter] = useState(initialSeconds);
  const [redirectPath, setRedirectPath] = useState<RedirectPath>(null);
  const [shouldStartCountdown, setShouldStartCountdown] = useState(false);

  // Funkcja pomocnicza do generowania polskiej odmiany jednostek czasu
  const getTimeUnitText = (value: number): string => {
    if (value === 1) return "sekundę";
    if (value > 1 && value < 5) return "sekundy";
    return "sekund";
  };

  // Tekst odliczania z poprawną odmianą
  const counterText = `${counter} ${getTimeUnitText(counter)}`;

  // Rozpocznij przekierowanie za określoną liczbę sekund
  function redirect(path: string, seconds: number = initialSeconds) {
    logger.info(`Ustawiam przekierowanie na: ${path} za ${seconds} sekund`);
    setRedirectPath(path);
    setCounter(seconds);
    setShouldStartCountdown(true);
  }

  // Anuluj zaplanowane przekierowanie
  function cancelRedirect() {
    setRedirectPath(null);
    setShouldStartCountdown(false);
  }

  // Efekt do obsługi odliczania i przekierowania
  useEffect(() => {
    // Uruchamiamy odliczanie tylko gdy flaga shouldStartCountdown jest true
    if (!redirectPath || !shouldStartCountdown) return;

    logger.info(`Rozpoczynam odliczanie: ${counter} sekund, przekierowanie: ${redirectPath}`);

    // Jeśli mamy już 0, przekierowujemy od razu
    if (counter <= 0) {
      logger.info(`Przekierowuję od razu na ${redirectPath}`);
      window.location.href = redirectPath;
      return;
    }

    // Ustawiamy interwał odliczania
    const interval = setInterval(() => {
      setCounter((prev) => {
        const newCount = prev - 1;

        if (newCount <= 0) {
          clearInterval(interval);
          logger.info(`Zakończono odliczanie, przekierowuję na ${redirectPath}`);
          window.location.href = redirectPath;
          return 0;
        }

        logger.debug(`Odliczanie: ${newCount} ${getTimeUnitText(newCount)}`);
        return newCount;
      });
    }, 1000);

    // Czyścimy interwał przy odmontowaniu komponentu
    return () => {
      logger.debug(`Czyszczę interwał odliczania`);
      clearInterval(interval);
    };
  }, [redirectPath, counter, shouldStartCountdown]);

  return {
    counter,
    redirectPath,
    counterText,
    redirect,
    cancelRedirect,
  };
}
