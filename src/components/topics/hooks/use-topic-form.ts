import { useState, useEffect, useRef } from "react";
import type { TopicCreateDto, TopicUpdateDto } from "@/types.ts";

interface UseTopicFormProps {
  initialData?: TopicCreateDto;
  onSubmit?: (data: TopicCreateDto | TopicUpdateDto) => Promise<void>;
  isEditMode?: boolean;
}

interface TopicFormErrors {
  name?: string;
  description?: string;
  general?: string;
}

const defaultFormData: TopicCreateDto = {
  name: "",
  description: undefined,
  parent_id: null,
};

export function useTopicForm({ initialData, onSubmit, isEditMode = false }: UseTopicFormProps = {}) {
  const [formData, setFormData] = useState<TopicCreateDto>(initialData || defaultFormData);
  const [errors, setErrors] = useState<TopicFormErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const prevInitialDataRef = useRef<TopicCreateDto | undefined>(initialData);

  // Aktualizuj dane formularza tylko gdy initialData zmienia się z zewnątrz
  useEffect(() => {
    if (!initialData) return undefined;
    if (!prevInitialDataRef.current) {
      // Pierwsze ustawienie
      prevInitialDataRef.current = initialData;
      setFormData(initialData);
      return undefined;
    }

    // Sprawdź, czy initialData faktycznie się zmieniło
    const prevData = prevInitialDataRef.current;
    const hasChanged =
      initialData.name !== prevData.name ||
      initialData.description !== prevData.description ||
      initialData.parent_id !== prevData.parent_id;

    if (hasChanged) {
      setFormData(initialData);
      setErrors({});
      prevInitialDataRef.current = initialData;
    }
    return undefined;
  }, [initialData]);

  const validate = () => {
    const newErrors: TopicFormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nazwa tematu jest wymagana";
    } else if (formData.name.length < 3) {
      newErrors.name = "Nazwa tematu musi mieć co najmniej 3 znaki";
    } else if (formData.name.length > 100) {
      newErrors.name = "Nazwa tematu nie może przekraczać 100 znaków";
    }

    if (formData.description && formData.description.length > 500) {
      newErrors.description = "Opis nie może przekraczać 500 znaków";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (name: keyof TopicCreateDto, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async () => {
    if (!onSubmit) return;

    if (!validate()) {
      return;
    }

    setSubmitting(true);
    setErrors({});

    try {
      if (isEditMode) {
        const submittedData: TopicUpdateDto = {};

        // Dodaj tylko zmienione pola
        if (formData.name !== initialData?.name) {
          submittedData.name = formData.name.trim();
        }
        if (formData.description !== initialData?.description) {
          submittedData.description = formData.description?.trim() || undefined;
        }

        await onSubmit(submittedData);
      } else {
        const submittedData: TopicCreateDto = {
          name: formData.name.trim(),
          description: formData.description?.trim() || undefined,
          parent_id: formData.parent_id,
        };
        await onSubmit(submittedData);
      }
    } catch (err) {
      setErrors({
        general: err instanceof Error ? err.message : "Wystąpił nieznany błąd",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const reset = () => {
    setFormData(initialData || defaultFormData);
    setErrors({});
    setSubmitting(false);
  };

  return {
    formData,
    errors,
    submitting,
    handleChange,
    handleSubmit,
    reset,
    setFormData,
  };
}
