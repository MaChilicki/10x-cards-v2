import "@testing-library/jest-dom";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

// Automatyczne czyszczenie po każdym teście
afterEach(() => {
  cleanup();
});

// Konfiguracja środowiska testowego
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mockowanie funkcji fetch dla testów
global.fetch = vi.fn();

// Mockowanie localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: vi.fn(() => null),
    setItem: vi.fn(() => null),
    removeItem: vi.fn(() => null),
    clear: vi.fn(() => null),
  },
  writable: true,
});
