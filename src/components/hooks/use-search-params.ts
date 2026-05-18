import { useState, useEffect } from "react";

interface UseSearchParamsResult {
  searchParams: URLSearchParams;
  setParam: SetParamFn;
  setParams: SetParamsFn;
  removeParam: RemoveParamFn;
}

type SetParamFn = (key: string, value: string) => void;
type SetParamsFn = (params: Record<string, string>) => void;
type RemoveParamFn = (key: string) => void;

/**
 * Hook do zarządzania parametrami URL w sposób reaktywny
 * Zgodny z architekturą Astro i praktykami React
 */
export function useSearchParams(): UseSearchParamsResult {
  const [searchParams, setSearchParams] = useState<URLSearchParams>(new URLSearchParams());

  useEffect(() => {
    // Inicjalizacja searchParams tylko po stronie klienta
    setSearchParams(new URLSearchParams(window.location.search));

    const handleLocationChange = () => {
      setSearchParams(new URLSearchParams(window.location.search));
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const setParam = (key: string, value: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.set(key, value);
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
    setSearchParams(newSearchParams);
  };

  const setParams = (params: Record<string, string>) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    Object.entries(params).forEach(([key, value]) => {
      newSearchParams.set(key, value);
    });
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
    setSearchParams(newSearchParams);
  };

  const removeParam = (key: string) => {
    const newSearchParams = new URLSearchParams(searchParams.toString());
    newSearchParams.delete(key);
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
    setSearchParams(newSearchParams);
  };

  return {
    searchParams,
    setParam,
    setParams,
    removeParam,
  };
}
