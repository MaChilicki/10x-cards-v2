import { renderHook, act } from "@testing-library/react";
import { expect, describe, it, vi } from "vitest";
import { useDocumentForm } from "../use-document-form";

describe("useDocumentForm", () => {
  const initialValues = {
    name: "Test Document",
    content: "Lorem ipsum dolor sit amet. ".repeat(100), // 2600 znaków
  };

  const mockSubmit = vi.fn().mockResolvedValue(undefined);

  it("powinien inicjalizować się z podanymi wartościami", () => {
    const { result } = renderHook(() =>
      useDocumentForm({
        initialValues,
        onSubmit: mockSubmit,
      })
    );

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("powinien aktualizować wartości formularza po zmianie", () => {
    const { result } = renderHook(() =>
      useDocumentForm({
        initialValues,
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Updated Name" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    expect(result.current.values.name).toBe("Updated Name");
    expect(result.current.isDirty).toBe(true);
  });

  it("powinien walidować formularz i pokazywać błędy", () => {
    const { result } = renderHook(() =>
      useDocumentForm({
        initialValues: { name: "", content: "" },
        onSubmit: mockSubmit,
      })
    );

    act(() => {
      result.current.validate();
    });

    expect(result.current.errors.name).toBeDefined();
    expect(result.current.errors.content).toBeDefined();
  });

  it("powinien zresetować formularz do wartości początkowych", () => {
    const { result } = renderHook(() =>
      useDocumentForm({
        initialValues,
        onSubmit: mockSubmit,
      })
    );

    // Najpierw modyfikujemy formularz
    act(() => {
      result.current.handleChange({
        target: { name: "name", value: "Updated Name" },
      } as React.ChangeEvent<HTMLInputElement>);
    });

    // Następnie resetujemy
    act(() => {
      result.current.reset();
    });

    expect(result.current.values).toEqual(initialValues);
    expect(result.current.isDirty).toBe(false);
    expect(result.current.errors).toEqual({});
  });

  it("powinien poprawnie wysłać formularz gdy dane są prawidłowe", async () => {
    const { result } = renderHook(() =>
      useDocumentForm({
        initialValues,
        onSubmit: mockSubmit,
      })
    );

    await act(async () => {
      await result.current.handleSubmit({
        preventDefault: () => {
          return;
        },
      } as React.FormEvent);
    });

    expect(mockSubmit).toHaveBeenCalledWith(initialValues);
    expect(result.current.isSubmitting).toBe(false);
    expect(result.current.isDirty).toBe(false);
  });
});
