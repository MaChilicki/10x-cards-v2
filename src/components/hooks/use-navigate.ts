import { useCallback } from "react";

interface NavigateOptions {
  /** Czy nawigacja ma zastąpić bieżący wpis w historii */
  replace?: boolean;
}

/**
 * Hook nawigacji do zarządzania historią przeglądarki
 * @returns Funkcja nawigacji
 */
export function useNavigate() {
  return useCallback((...args: unknown[]) => {
    const [path, options = {}] = args;

    if (typeof path !== "string") {
      throw new Error("Path must be a string");
    }

    const navigationOptions = options as NavigateOptions;

    if (navigationOptions.replace) {
      window.location.replace(path);
    } else {
      window.location.assign(path);
    }
  }, []);
}
