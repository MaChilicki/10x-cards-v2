import { renderHook, act } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest";
import { useNavigationPrompt } from "../use-navigation-prompt";

describe("useNavigationPrompt", () => {
  it("powinien pozwolić na nawigację bez promptu gdy formularz nie jest modyfikowany", () => {
    const { result } = renderHook(() => useNavigationPrompt(false));

    const mockNavigationAction = vi.fn();

    act(() => {
      result.current.handleNavigation(mockNavigationAction);
    });

    // Sprawdzamy, czy akcja nawigacji została wywołana bezpośrednio
    expect(mockNavigationAction).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it("powinien pokazać prompt gdy formularz jest modyfikowany", () => {
    const { result } = renderHook(() => useNavigationPrompt(true));

    const mockNavigationAction = vi.fn();

    act(() => {
      result.current.handleNavigation(mockNavigationAction);
    });

    // Sprawdzamy, czy prompt został pokazany zamiast bezpośredniego wywołania akcji
    expect(mockNavigationAction).not.toHaveBeenCalled();
    expect(result.current.dialogState.isOpen).toBe(true);
  });

  it("powinien wywołać akcję nawigacji po potwierdzeniu", () => {
    const { result } = renderHook(() => useNavigationPrompt(true));

    const mockNavigationAction = vi.fn();

    // Najpierw wywołujemy handleNavigation
    act(() => {
      result.current.handleNavigation(mockNavigationAction);
    });

    // Następnie potwierdzamy nawigację
    act(() => {
      result.current.dialogState.onConfirm();
    });

    // Sprawdzamy, czy akcja nawigacji została wywołana po potwierdzeniu
    expect(mockNavigationAction).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it("powinien anulować nawigację po odrzuceniu", () => {
    const { result } = renderHook(() => useNavigationPrompt(true));

    const mockNavigationAction = vi.fn();

    // Najpierw wywołujemy handleNavigation
    act(() => {
      result.current.handleNavigation(mockNavigationAction);
    });

    // Następnie anulujemy nawigację
    act(() => {
      result.current.dialogState.onCancel();
    });

    // Sprawdzamy, czy akcja nawigacji NIE została wywołana po anulowaniu
    expect(mockNavigationAction).not.toHaveBeenCalled();
    expect(result.current.dialogState.isOpen).toBe(false);
  });
});
