import { useEffect, useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import type { FlashcardDto } from "@/types";

const MAX_FRONT_LENGTH = 200;
const MAX_BACK_LENGTH = 500;

interface FlashcardFormData {
  front: string;
  back: string;
}

interface FlashcardFormErrors {
  front?: string;
  back?: string;
  general?: string;
}

const defaultFormData: FlashcardFormData = {
  front: "",
  back: "",
};

interface FlashcardFormProps {
  initialData?: Pick<FlashcardDto, "front_original" | "front_modified" | "back_original" | "back_modified">;
  onSubmit: (data: FlashcardFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export function FlashcardForm({ initialData, onSubmit, onCancel, isSubmitting = false }: FlashcardFormProps) {
  const [formData, setFormData] = useState<FlashcardFormData>(() => ({
    front: initialData?.front_modified || initialData?.front_original || "",
    back: initialData?.back_modified || initialData?.back_original || "",
  }));
  const [errors, setErrors] = useState<FlashcardFormErrors>({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        front: initialData.front_modified || initialData.front_original,
        back: initialData.back_modified || initialData.back_original,
      });
      setErrors({});
    }
    return undefined;
  }, [initialData]);

  const validate = () => {
    const newErrors: FlashcardFormErrors = {};

    if (!formData.front.trim()) {
      newErrors.front = "Przód fiszki jest wymagany";
    } else if (formData.front.length > MAX_FRONT_LENGTH) {
      newErrors.front = `Przód fiszki nie może przekraczać ${MAX_FRONT_LENGTH} znaków (obecnie ${formData.front.length})`;
    }

    if (!formData.back.trim()) {
      newErrors.back = "Tył fiszki jest wymagany";
    } else if (formData.back.length > MAX_BACK_LENGTH) {
      newErrors.back = `Tył fiszki nie może przekraczać ${MAX_BACK_LENGTH} znaków (obecnie ${formData.back.length})`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field: keyof FlashcardFormData, value: string) => {
    const maxLength = field === "front" ? MAX_FRONT_LENGTH : MAX_BACK_LENGTH;
    const truncatedValue = value.slice(0, maxLength);

    setFormData((prev) => ({ ...prev, [field]: truncatedValue }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    try {
      await onSubmit(formData);
      setFormData(defaultFormData);
      setErrors({});
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        general: err instanceof Error ? err.message : "Wystąpił nieznany błąd",
      }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors.general && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errors.general}</AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <label htmlFor="front" className="text-sm font-medium">
          Przód fiszki
        </label>
        <div className="relative">
          <Textarea
            id="front"
            placeholder="Wpisz treść przodu fiszki..."
            className={`min-h-[150px] ${errors.front ? "border-destructive" : ""}`}
            value={formData.front}
            onChange={(e) => handleChange("front", e.target.value)}
            disabled={isSubmitting}
            aria-label="Przód fiszki"
            aria-required="true"
            aria-invalid={!!errors.front}
            maxLength={MAX_FRONT_LENGTH}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {formData.front.length}/{MAX_FRONT_LENGTH}
          </div>
        </div>
        {errors.front && <p className="text-sm text-destructive mt-1">{errors.front}</p>}
      </div>

      <div className="space-y-2">
        <label htmlFor="back" className="text-sm font-medium">
          Tył fiszki
        </label>
        <div className="relative">
          <Textarea
            id="back"
            placeholder="Wpisz treść tyłu fiszki..."
            className={`min-h-[200px] ${errors.back ? "border-destructive" : ""}`}
            value={formData.back}
            onChange={(e) => handleChange("back", e.target.value)}
            disabled={isSubmitting}
            aria-label="Tył fiszki"
            aria-required="true"
            aria-invalid={!!errors.back}
            maxLength={MAX_BACK_LENGTH}
          />
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            {formData.back.length}/{MAX_BACK_LENGTH}
          </div>
        </div>
        {errors.back && <p className="text-sm text-destructive mt-1">{errors.back}</p>}
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Anuluj
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <LoadingSpinner className="mr-2 h-4 w-4" />
              Zapisywanie...
            </>
          ) : (
            "Zapisz"
          )}
        </Button>
      </div>
    </form>
  );
}
