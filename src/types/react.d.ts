/// <reference types="react" />

declare namespace React {
  /** @template T - Element type parameter */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface DOMAttributes<T> {
    "data-slot"?: string;
  }

  type ComponentPropsWithoutRef<T> = T extends new (...args: unknown[]) => unknown
    ? Omit<React.ComponentProps<T>, "ref">
    : T extends keyof JSX.IntrinsicElements
      ? Omit<JSX.IntrinsicElements[T], "ref">
      : never;

  type ForwardRefExoticComponent<P> = React.ExoticComponent<P> & {
    defaultProps?: Partial<P>;
    displayName?: string;
  };

  interface RefAttributes<T> {
    ref?: React.Ref<T>;
  }

  type PropsWithoutRef<P> = P extends unknown ? Omit<P, "ref"> : P;

  type ForwardRefRenderFunction<T, P = Record<string, unknown>> = (
    props: PropsWithoutRef<P> & RefAttributes<T>,
    ref: React.Ref<T>
  ) => React.ReactElement | null;

  function forwardRef<T, P = Record<string, unknown>>(
    render: ForwardRefRenderFunction<T, P>
  ): ForwardRefExoticComponent<PropsWithoutRef<P> & RefAttributes<T>>;

  interface ButtonHTMLAttributes<T> extends HTMLAttributes<T> {
    autoFocus?: boolean;
    disabled?: boolean;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    name?: string;
    type?: "submit" | "reset" | "button";
    value?: string | readonly string[] | number;
  }
}

declare module "react" {
  /** @template T - Element type parameter */

  interface HTMLAttributes<T> extends AriaAttributes, DOMAttributes<T> {
    "data-slot"?: string;
    "data-[state]"?: string;
    "data-[side]"?: string;
    "aria-invalid"?: boolean | "true" | "false";
    className?: string;
  }

  type EffectCallback = () => undefined | (() => void);

  export const useState: <T>(initialState: T | (() => T)) => [T, (newState: T | ((prevState: T) => T)) => void];
  export const useEffect: (effect: EffectCallback, deps?: readonly unknown[]) => void;
  export const useCallback: <T extends (...args: unknown[]) => unknown>(callback: T, deps: readonly unknown[]) => T;
  export const useMemo: <T>(factory: () => T, deps: readonly unknown[]) => T;
  export const useRef: <T>(initialValue: T) => { current: T };
  export const useContext: <T>(context: React.Context<T>) => T;
  export const useReducer: <R extends React.Reducer<unknown, unknown>, I>(
    reducer: R,
    initializerArg: I & React.ReducerState<R>,
    initializer?: (arg: I & React.ReducerState<R>) => React.ReducerState<R>
  ) => [React.ReducerState<R>, React.Dispatch<React.ReducerAction<R>>];
  export const useLayoutEffect: (effect: EffectCallback, deps?: readonly unknown[]) => void;
  export const useImperativeHandle: <T, R extends T>(
    ref: React.Ref<T> | undefined,
    init: () => R,
    deps?: readonly unknown[]
  ) => void;
  export const useDebugValue: <T>(value: T, format?: (value: T) => unknown) => void;
  export const forwardRef: typeof React.forwardRef;
  export type ComponentPropsWithoutRef<T> = React.ComponentPropsWithoutRef<T>;
  export type ButtonHTMLAttributes<T> = React.ButtonHTMLAttributes<T>;

  export type ComponentProps<T> = T extends new (...args: unknown[]) => unknown
    ? Omit<InstanceType<T>, keyof Component<unknown, unknown>>
    : T extends keyof JSX.IntrinsicElements
      ? JSX.IntrinsicElements[T]
      : never;
}
