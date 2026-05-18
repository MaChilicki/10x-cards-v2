import { renderHook, act } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest";
import { useConfirmDialog } from "../use-confirm-dialog";

// Mockowanie useNavigate
vi.mock("@/components/hooks/use-navigate", () => ({
  useNavigate: () => vi.fn(),
}));

describe("useConfirmDialog", () => {
  it("powinien inicjalizować się z domyślnymi wartościami", () => {
    const { result } = renderHook(() => useConfirmDialog());

    expect(result.current.dialogState.isOpen).toBe(false);
    expect(result.current.dialogState.title).toBe("");
    expect(result.current.dialogState.description).toBe("");
    expect(result.current.dialogState.confirmText).toBe("Potwierdź");
  });

  it("powinien otworzyć dialog z podanymi parametrami", () => {
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.actions.openDialog({
        title: "Tytuł testu",
        description: "Opis testu",
        confirmText: "OK",
        onConfirm: async () => {
          return;
        },
      });
    });

    expect(result.current.dialogState.isOpen).toBe(true);
    expect(result.current.dialogState.title).toBe("Tytuł testu");
    expect(result.current.dialogState.description).toBe("Opis testu");
    expect(result.current.dialogState.confirmText).toBe("OK");
  });

  it("powinien zamknąć dialog po wywołaniu closeDialog", () => {
    const { result } = renderHook(() => useConfirmDialog());

    // Najpierw otwieramy dialog
    act(() => {
      result.current.actions.openDialog({
        title: "Tytuł testu",
        description: "Opis testu",
        onConfirm: async () => {
          return;
        },
      });
    });

    // Następnie zamykamy dialog
    act(() => {
      result.current.actions.closeDialog();
    });

    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it("powinien wywołać onConfirm i zamknąć dialog po potwierdzeniu", async () => {
    const mockConfirm = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.actions.openDialog({
        title: "Tytuł testu",
        description: "Opis testu",
        onConfirm: mockConfirm,
      });
    });

    await act(async () => {
      await result.current.actions.handleConfirm();
    });

    expect(mockConfirm).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.isOpen).toBe(false);
  });

  it("powinien wywołać onCancel i zamknąć dialog po anulowaniu", () => {
    const mockCancel = vi.fn();
    const { result } = renderHook(() => useConfirmDialog());

    act(() => {
      result.current.actions.openDialog({
        title: "Tytuł testu",
        description: "Opis testu",
        onConfirm: async () => {
          return;
        },
        onCancel: mockCancel,
      });
    });

    act(() => {
      result.current.actions.handleCancel();
    });

    expect(mockCancel).toHaveBeenCalledTimes(1);
    expect(result.current.dialogState.isOpen).toBe(false);
  });
});
