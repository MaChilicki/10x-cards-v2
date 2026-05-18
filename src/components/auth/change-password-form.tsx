import { useState, useEffect } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthForm } from "./auth-form";
import { usePasswordRequirements, passwordSchema } from "./hooks/use-password-requirements";
import { PasswordRequirements } from "./password-requirements";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { useAuth } from "./hooks/use-auth";
import { usePasswordManagement } from "./hooks/use-password-management";
import { logger } from "@/lib/services/logger.service";
import type { UseFormReturn } from "react-hook-form";

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Aktualne hasło jest wymagane"),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;

export function ChangePasswordForm() {
  const [isSuccess, setIsSuccess] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const {
    password: newPassword,
    setPassword: setNewPassword,
    passwordRequirements,
    passwordsMatch,
  } = usePasswordRequirements({
    confirmPassword,
  });
  const [formInstance, setFormInstance] = useState<UseFormReturn<ChangePasswordFormData> | null>(null);
  const { signOut } = useAuth();
  const { isLoading, changePassword } = usePasswordManagement();

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const onSubmit = async (data: ChangePasswordFormData) => {
    try {
      logger.info("Rozpoczynam zmianę hasła...");

      await changePassword(data.currentPassword, data.newPassword);

      toast.success("Hasło zostało zmienione pomyślnie");
      setIsSuccess(true);

      // Wyloguj użytkownika i poczekaj na zakończenie
      await signOut();

      // Daj czas na zakończenie wylogowania
      await new Promise((resolve) => setTimeout(resolve, 1000));
    } catch (error) {
      logger.error("Błąd podczas zmiany hasła", { error });

      // Obsługa znanych kodów błędów
      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.includes("same_password")) {
          if (formInstance) {
            formInstance.setError("newPassword", {
              message: "Nowe hasło musi być inne niż obecne",
            });
          }
          toast.error("Nowe hasło musi być inne niż obecne");
          return;
        }

        if (errorMessage.includes("INVALID_CURRENT_PASSWORD") || errorMessage.includes("nieprawidłowe")) {
          if (formInstance) {
            formInstance.setError("currentPassword", {
              message: "Nieprawidłowe aktualne hasło",
            });
          }
          toast.error("Nieprawidłowe aktualne hasło");
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
          title="Hasło zmienione"
          description="Twoje hasło zostało pomyślnie zmienione"
          footer={
            <div className="text-sm text-muted-foreground">
              <a href="/login" className="text-primary hover:underline">
                Przejdź do logowania
              </a>
            </div>
          }
        >
          <div className="text-center text-muted-foreground">
            Zostałeś wylogowany. Zaloguj się ponownie używając nowego hasła.
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Zmiana hasła"
        description="Zmień hasło do swojego konta"
        footer={
          <div className="text-sm text-muted-foreground">
            <a href="/" className="text-primary hover:underline">
              Powrót do strony głównej
            </a>
          </div>
        }
      >
        <AuthForm
          schema={changePasswordSchema}
          onSubmit={onSubmit}
          submitButtonText="Zmień hasło"
          onFormReady={setFormInstance}
        >
          {(form) => (
            <>
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Aktualne hasło</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Aktualne hasło"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.currentPassword}
                  {...form.register("currentPassword")}
                />
                {form.formState.errors.currentPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.currentPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">Nowe hasło</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Nowe hasło"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.newPassword}
                  {...form.register("newPassword", {
                    onChange: (e) => setNewPassword(e.target.value),
                  })}
                />
                <PasswordRequirements password={newPassword} requirements={passwordRequirements} />
                {form.formState.errors.newPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.newPassword.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potwierdź nowe hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Potwierdź nowe hasło"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.confirmPassword || !passwordsMatch}
                  {...form.register("confirmPassword", {
                    onChange: (e) => setConfirmPassword(e.target.value),
                  })}
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{form.formState.errors.confirmPassword.message}</p>
                )}
                {!passwordsMatch && confirmPassword && (
                  <p className="text-sm text-destructive">Hasła nie są identyczne</p>
                )}
              </div>
            </>
          )}
        </AuthForm>
      </AuthCard>
    </AuthLayout>
  );
}
