import { z } from "zod";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { AuthForm } from "./auth-form";
import { useState } from "react";
import { useNavigate } from "@/components/hooks/use-navigate";
import { toast } from "sonner";
import { logger } from "@/lib/services/logger.service";
import type { UseFormReturn } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle2 } from "lucide-react";
import { usePasswordManagement } from "./hooks/use-password-management";

const resetPasswordSchema = z.object({
  email: z
    .string()
    .min(1, "Email jest wymagany")
    .email("Nieprawidłowy format email")
    .max(255, "Email nie może być dłuższy niż 255 znaków")
    .regex(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Nieprawidłowy format adresu email"),
});

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export function ResetPasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [resetEmail, setResetEmail] = useState<string>("");
  const navigate = useNavigate();
  const [formInstance, setFormInstance] = useState<UseFormReturn<ResetPasswordFormValues> | null>(null);
  const { isLoading: isSubmitting, resetPassword } = usePasswordManagement();

  const handleSubmit = async (data: ResetPasswordFormValues) => {
    try {
      logger.info(`Próba resetowania hasła dla użytkownika: ${data.email}`);

      // Używamy hooka usePasswordManagement zamiast bezpośredniego fetch
      await resetPassword(data.email);

      logger.info(`Link do resetowania hasła wysłany pomyślnie: ${data.email}`);
      setResetEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      logger.error("Błąd podczas resetowania hasła", { error, email: data.email });

      // Obsługa błędów
      if (error instanceof Error) {
        const errorMessage = error.message;

        // Sprawdzamy czy błąd dotyczy nieznalezionego użytkownika
        if (errorMessage.includes("not found") || errorMessage.includes("nie znaleziono")) {
          if (formInstance) {
            formInstance.setError("email", {
              message: "Nie znaleziono konta z podanym adresem email",
            });
          }
          toast.error("Nie znaleziono konta z podanym adresem email");
          return;
        }

        toast.error(errorMessage);
      } else {
        toast.error("Wystąpił nieoczekiwany błąd");
      }
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard
          title="Link wysłany"
          description="Sprawdź swoją skrzynkę email"
          footer={
            <div className="text-sm text-muted-foreground">
              <Button variant="link" onClick={() => navigate("/login")} className="text-primary hover:underline">
                Powrót do logowania
              </Button>
            </div>
          }
        >
          <div className="space-y-4">
            <Alert className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertTitle className="text-green-800">Link do resetowania hasła został wysłany</AlertTitle>
              <AlertDescription className="text-green-700 mt-2">
                <p className="mb-2">
                  Wysłaliśmy link do resetowania hasła na adres: <strong>{resetEmail}</strong>
                </p>
                <p className="mb-2">Aby zresetować hasło:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Sprawdź swoją skrzynkę email</li>
                  <li>Kliknij w link do resetowania hasła w otrzymanym mailu</li>
                  <li>Ustaw nowe hasło zgodnie z instrukcjami</li>
                </ol>
                <p className="mt-2 text-sm">
                  Jeśli nie otrzymałeś maila, sprawdź folder ze spamem lub spróbuj ponownie za kilka minut.
                </p>
              </AlertDescription>
            </Alert>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Resetowanie hasła"
        description="Wprowadź swój adres email, aby zresetować hasło"
        footer={
          <div className="text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Powrót do logowania
            </a>
          </div>
        }
      >
        <AuthForm
          schema={resetPasswordSchema}
          onSubmit={handleSubmit}
          submitButtonText="Wyślij link resetujący"
          onFormReady={setFormInstance}
          warnOnUnsavedChanges={false}
          refreshSessionAfterSubmit={false}
        >
          {(form) => (
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="jan@example.com"
                disabled={isSubmitting}
                aria-label="Email"
                aria-required="true"
                aria-invalid={!!form.formState.errors.email}
                {...form.register("email")}
              />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
              )}
            </div>
          )}
        </AuthForm>
      </AuthCard>
    </AuthLayout>
  );
}
