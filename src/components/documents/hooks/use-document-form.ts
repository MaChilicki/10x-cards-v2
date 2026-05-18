import { useState } from "react";
import type { FormValues } from "../types";

interface UseDocumentFormProps {
  initialValues: FormValues;
  onSubmit: (values: FormValues) => Promise<void>;
}

interface DocumentFormErrors {
  name?: string;
  content?: string;
  general?: string;
}

export function useDocumentForm({ initialValues, onSubmit }: UseDocumentFormProps) {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<DocumentFormErrors>({});
  const [isDirty, setIsDirty] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialContent] = useState(initialValues.content);

  const validate = (): boolean => {
    const newErrors: DocumentFormErrors = {};

    // Walidacja tytułu
    if (!values.name.trim()) {
      newErrors.name = "Tytuł jest wymagany";
    } else if (values.name.length > 100) {
      newErrors.name = "Tytuł nie może przekraczać 100 znaków";
    }

    // Walidacja treści
    if (!values.content.trim()) {
      newErrors.content = "Treść jest wymagana";
    } else if (values.content.length < 1000) {
      newErrors.content = "Treść musi zawierać co najmniej 1000 znaków";
    } else if (values.content.length > 10000) {
      newErrors.content = "Treść nie może przekraczać 10000 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setIsDirty(true);
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    try {
      await onSubmit(values);
      setIsDirty(false);
    } catch (error) {
      setErrors({
        general: error instanceof Error ? error.message : "Wystąpił nieznany błąd",
      });
      console.error("Błąd podczas wysyłania formularza:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const reset = () => {
    setValues(initialValues);
    setErrors({});
    setIsDirty(false);
    setIsSubmitting(false);
  };

  const hasContentChanged = () => {
    return values.content !== initialContent;
  };

  return {
    values,
    errors,
    isDirty,
    isSubmitting,
    handleChange,
    handleSubmit,
    validate,
    reset,
    hasContentChanged,
  };
}
