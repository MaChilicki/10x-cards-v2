import type { ComponentProps, ComponentPropsWithoutRef, FC, ReactNode } from "react";

declare global {
  namespace React {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
      "data-slot"?: string;
      "data-[state]"?: string;
      "data-[side]"?: string;
      "aria-invalid"?: boolean | "true" | "false";
    }

    export { ComponentProps, ComponentPropsWithoutRef, FC, ReactNode };

    // Dodajemy brakujące hooki
    export const useState: typeof import("react").useState;
    export const useEffect: typeof import("react").useEffect;
    export const useCallback: typeof import("react").useCallback;
    export const useMemo: typeof import("react").useMemo;
    export const useRef: typeof import("react").useRef;
    export const useContext: typeof import("react").useContext;
    export const useReducer: typeof import("react").useReducer;
    export const useLayoutEffect: typeof import("react").useLayoutEffect;
    export const useImperativeHandle: typeof import("react").useImperativeHandle;
    export const useDebugValue: typeof import("react").useDebugValue;
  }

  namespace jest {
    interface Matchers<R> {
      toBeInTheDocument(): R;
      toHaveValue(value: string | number | string[] | undefined): R;
      toBeDisabled(): R;
      toHaveAttribute(attr: string, value?: string): R;
    }
  }
}
