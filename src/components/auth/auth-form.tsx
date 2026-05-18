import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { UseFormReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { logger } from "@/lib/services/logger.service";
import { useAuth } from "./hooks/use-auth";

interface AuthFormProps<T extends z.ZodType> {
  schema: T;
  onSubmit: (data: z.infer<T>) => Promise<void>;
  children: (form: UseFormReturn<z.infer<T>>) => React.ReactElement;
  submitButtonText: string;
  footer?: React.ReactElement;
  onDirtyChange?: (isDirty: boolean) => void;
  warnOnUnsavedChanges?: boolean;
  onFormReady?: (form: UseFormReturn<z.infer<T>>) => void;
  refreshSessionAfterSubmit?: boolean;
  "data-testid"?: string;
}

export function AuthForm<T extends z.ZodType>({
  schema,
  onSubmit,
  children,
  submitButtonText,
  footer,
  onDirtyChange,
  warnOnUnsavedChanges = true,
  onFormReady,
  refreshSessionAfterSubmit = true,
  "data-testid": dataTestId,
}: AuthFormProps<T>) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);
  const { refreshSession } = useAuth();

  const form = useForm<z.infer<T>>({
    resolver: zodResolver(schema),
  });

  // Przekaż instancję formularza do rodzica
  useEffect(() => {
    if (onFormReady) {
      onFormReady(form);
    }
    return undefined;
  }, [form, onFormReady]);

  // Obsługa zmian w formularzu
  useEffect(() => {
    onDirtyChange?.(form.formState.isDirty);
    return () => onDirtyChange?.(false);
  }, [form.formState.isDirty, onDirtyChange]);

  // Obsługa ostrzeżeń przed opuszczeniem strony
  useEffect(() => {
    if (!warnOnUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (form.formState.isDirty && !isSubmitting) {
        e.preventDefault();
        e.returnValue = "Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?";
        return e.returnValue;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [form.formState.isDirty, isSubmitting, warnOnUnsavedChanges]);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      setGeneralError("Sesja wygasła. Zaloguj się ponownie.");
      window.location.href = "/login";
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const onFormSubmit = async (data: z.infer<T>) => {
    try {
      setIsSubmitting(true);
      setGeneralError(null);
      await onSubmit(data);
      // Odświeżamy sesję po pomyślnym wykonaniu akcji tylko jeśli jest włączone
      if (refreshSessionAfterSubmit) {
        await refreshSession();
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Wystąpił błąd";
      setGeneralError(errorMessage);
      logger.error("Błąd formularza", { error, formData: data });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onFormSubmit)} className="space-y-4" data-testid={dataTestId}>
      {generalError && (
        <Alert variant="destructive" data-testid="auth-form-error">
          <AlertDescription>{generalError}</AlertDescription>
        </Alert>
      )}

      {children(form)}

      <Button type="submit" className="w-full" disabled={isSubmitting} data-testid="auth-submit-button">
        {isSubmitting ? (
          <>
            <LoadingSpinner className="mr-2 h-4 w-4" />
            {submitButtonText}...
          </>
        ) : (
          submitButtonText
        )}
      </Button>

      {footer}
    </form>
  );
}
