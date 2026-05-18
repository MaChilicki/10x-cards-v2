import { useState } from "react";
import type { FlashcardFormViewModel } from "../types";

interface UseFlashcardFormProps {
  initialFront?: string;
  initialBack?: string;
  onSubmit: (data: { front: string; back: string }) => Promise<void>;
}

export function useFlashcardForm({ initialFront = "", initialBack = "", onSubmit }: UseFlashcardFormProps) {
  const [formData, setFormData] = useState<FlashcardFormViewModel>({
    front: initialFront,
    back: initialBack,
    errors: {},
    isSubmitting: false,
  });

  const validateForm = () => {
    const errors: { front?: string; back?: string } = {};

    if (!formData.front.trim()) {
      errors.front = "Przód fiszki jest wymagany";
    } else if (formData.front.length > 200) {
      errors.front = "Przód fiszki nie może być dłuższy niż 200 znaków";
    }

    if (!formData.back.trim()) {
      errors.back = "Tył fiszki jest wymagany";
    } else if (formData.back.length > 500) {
      errors.back = "Tył fiszki nie może być dłuższy niż 500 znaków";
    }

    setFormData((prev) => ({ ...prev, errors }));
    return Object.keys(errors).length === 0;
  };

  const updateField = (field: "front" | "back", value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      errors: { ...prev.errors, [field]: undefined },
    }));
  };

  const submitForm = async () => {
    if (!validateForm()) {
      return;
    }

    setFormData((prev) => ({ ...prev, isSubmitting: true }));
    try {
      await onSubmit({
        front: formData.front.trim(),
        back: formData.back.trim(),
      });
      resetForm();
    } catch (error) {
      setFormData((prev) => ({
        ...prev,
        errors: {
          ...prev.errors,
          submit: error instanceof Error ? error.message : "Nieznany błąd",
        },
      }));
    } finally {
      setFormData((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const resetForm = () => {
    setFormData({
      front: "",
      back: "",
      errors: {},
      isSubmitting: false,
    });
  };

  return {
    formData,
    actions: {
      updateField,
      submitForm,
      resetForm,
    },
  };
}
