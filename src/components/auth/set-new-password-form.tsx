import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthForm } from "./auth-form";
import { usePasswordRequirements, passwordSchema } from "./hooks/use-password-requirements";
import { PasswordRequirements } from "./password-requirements";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { usePasswordManagement } from "./hooks/use-password-management";
import { logger } from "@/lib/services/logger.service";
import type { UseFormReturn } from "react-hook-form";

const setNewPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type SetNewPasswordFormData = z.infer<typeof setNewPasswordSchema>;

export function SetNewPasswordForm() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);
  const [email, setEmail] = useState<string>("");
  const { password, setPassword, passwordRequirements } = usePasswordRequirements();
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);
  const [formInstance, setFormInstance] = useState<UseFormReturn<SetNewPasswordFormData> | null>(null);
  const { isLoading, setNewPassword, verifyResetToken } = usePasswordManagement();
  const verificationAttemptedRef = useRef(false);
  const isMountedRef = useRef(true);

  // Efekt czyszczący przy odmontowaniu
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      logger.warn("Sesja wygasła podczas resetowania hasła");
      toast.error("Sesja wygasła. Rozpocznij proces resetowania hasła od nowa.");

      // Resetujemy stan formularza
      if (formInstance) {
        formInstance.reset();
      }

      // Resetujemy stan komponentu
      setIsVerifying(true);
      setVerificationError(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");

      // Przekierowujemy do strony resetowania hasła
      window.location.href = "/reset-password";
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [formInstance, setPassword]);

  // Efekt weryfikacji tokenu
  useEffect(() => {
    const verifyToken = async () => {
      if (verificationAttemptedRef.current || !isMountedRef.current) {
        return;
      }

      verificationAttemptedRef.current = true;

      try {
        const params = new URLSearchParams(window.location.search);
        const token = params.get("token") || params.get("code");

        if (!token) {
          logger.error("Brak tokenu resetowania hasła");
          throw new Error("Brak tokenu resetowania hasła");
        }

        logger.info(`Pobrano token z URL: ${token}`);
        logger.debug("Weryfikacja tokenu przez API...");

        // Próbujemy zweryfikować token
        const { email: verifiedEmail } = await verifyResetToken(token);

        if (isMountedRef.current) {
          if (verifiedEmail) {
            logger.info(`Token zweryfikowany pomyślnie dla: ${verifiedEmail}`);
            setEmail(verifiedEmail);
            setIsVerifying(false);
          } else {
            logger.error("Token zweryfikowany, ale brak emaila w odpowiedzi");
            throw new Error("Nie udało się pobrać adresu email");
          }
        }
      } catch (error) {
        if (!isMountedRef.current) return;

        logger.error("Błąd weryfikacji tokenu przez API", { error });

        // Sprawdzamy czy błąd zawiera szczegółowe informacje
        const errorDetails = error instanceof Error ? error.cause : null;
        const errorData =
          errorDetails && typeof errorDetails === "object" ? (errorDetails as Record<string, unknown>) : null;

        if (errorData) {
          logger.debug(`Szczegóły błędu API: ${JSON.stringify(errorData)}`);

          // Obsługa konkretnych kodów błędów
          switch (errorData.code) {
            case "AUTH_SESSION_MISSING":
              setVerificationError(
                "Sesja logowania wygasła. Proszę spróbować zresetować hasło ponownie lub zalogować się."
              );
              break;
            case "TOKEN_VERIFICATION_ERROR":
            case "EMAIL_LINK_INVALID":
            case "EMAIL_LINK_EXPIRED":
              setVerificationError(
                "Link do resetowania hasła wygasł lub jest nieprawidłowy. Proszę spróbować zresetować hasło ponownie."
              );
              break;
            case "MANUAL_EMAIL_REQUIRED":
              setVerificationError(null);
              break;
            default:
              setVerificationError("Wystąpił błąd podczas weryfikacji. Proszę spróbować ponownie za chwilę.");
          }
        } else {
          setVerificationError("Nie można zweryfikować tokenu. Proszę spróbować zresetować hasło ponownie.");
        }

        setEmail("");
        setIsVerifying(false);

        if (!verificationError) {
          setVerificationError(
            "Wystąpił nieoczekiwany błąd. Proszę spróbować ponownie za chwilę lub skontaktować się z administratorem."
          );
        }
      }
    };

    if (isVerifying) {
      verifyToken();
    }

    return () => undefined;
  }, [isVerifying, verificationError, verifyResetToken]);

  // Efekt sprawdzający zgodność haseł
  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
    return () => undefined;
  }, [password, confirmPassword]);

  const onSubmit = async (data: SetNewPasswordFormData) => {
    try {
      // Pobierz token z URL, bo będzie potrzebny do ustawienia nowego hasła
      const params = new URLSearchParams(window.location.search);
      const token = params.get("token") || params.get("code");

      if (!token) {
        throw new Error("Brak tokenu resetowania hasła");
      }

      logger.info("Rozpoczynam zmianę hasła...");

      // Wywołanie API do ustawienia nowego hasła
      await setNewPassword(data.password, token);
      setIsSuccess(true);
    } catch (error) {
      logger.error("Błąd podczas ustawiania nowego hasła", { error });

      // Obsługa znanych kodów błędów
      if (error instanceof Error) {
        const errorMessage = error.message;

        if (errorMessage.includes("same_password")) {
          if (formInstance) {
            formInstance.setError("password", {
              message: "Nowe hasło musi być inne niż poprzednie",
            });
          }
          toast.error("Nowe hasło musi być inne niż poprzednie");
          return;
        }

        toast.error(errorMessage);
      } else {
        toast.error("Wystąpił nieoczekiwany błąd");
      }
    }
  };

  if (verificationError) {
    logger.debug("Renderuję ekran błędu weryfikacji tokenu");
    return (
      <AuthLayout>
        <AuthCard
          title="Błąd weryfikacji tokenu"
          description="Wystąpił problem podczas weryfikacji tokenu resetowania hasła"
          footer={
            <div className="flex flex-col space-y-2 text-sm text-center">
              <a href="/reset-password" className="text-primary hover:underline">
                Wróć do strony resetowania hasła
              </a>
              <a href="/login" className="text-primary hover:underline">
                Przejdź do strony logowania
              </a>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="text-center text-destructive">{verificationError}</div>
            <div className="text-center text-muted-foreground text-sm">
              Jeśli problem się powtarza, skontaktuj się z administratorem systemu.
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (isVerifying) {
    logger.debug("Renderuję spinner weryfikacji tokenu");
    return (
      <AuthLayout>
        <AuthCard title="Weryfikacja tokenu" description="Weryfikujemy token resetowania hasła...">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (isSuccess) {
    logger.debug(`Renderuję ekran sukcesu zmiany hasła`);
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
          <div className="text-center text-muted-foreground">Możesz teraz zalogować się używając nowego hasła.</div>
        </AuthCard>
      </AuthLayout>
    );
  }

  if (!email) {
    logger.debug(`Renderuję formularz do wprowadzenia emaila`);
    return (
      <AuthLayout>
        <AuthCard
          title="Wprowadź email"
          description="Podaj swój adres email, aby zakończyć proces resetowania hasła"
          footer={
            <div className="text-sm text-muted-foreground">
              <a href="/reset-password" className="text-primary hover:underline">
                Spróbuj ponownie
              </a>
            </div>
          }
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const emailInput = e.currentTarget.querySelector('input[type="email"]') as HTMLInputElement;
              if (emailInput && emailInput.value) {
                setEmail(emailInput.value);
              } else {
                toast.error("Podaj prawidłowy adres email");
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="email-input">Email</Label>
              <Input id="email-input" type="email" required placeholder="Twój adres email" aria-label="Email" />
            </div>
            <button
              type="submit"
              className="w-full inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
            >
              Kontynuuj
            </button>
          </form>
        </AuthCard>
      </AuthLayout>
    );
  }

  // Mamy email, pokazujemy formularz zmiany hasła
  logger.debug(`Renderuję formularz zmiany hasła dla: ${email}`);
  return (
    <AuthLayout>
      <AuthCard
        title="Ustaw nowe hasło"
        description="Ustaw nowe hasło do swojego konta"
        footer={
          <div className="text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Powrót do logowania
            </a>
          </div>
        }
      >
        <AuthForm
          schema={setNewPasswordSchema}
          onSubmit={onSubmit}
          submitButtonText="Ustaw nowe hasło"
          onFormReady={setFormInstance}
          warnOnUnsavedChanges={false}
        >
          {(form) => (
            <>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={email} disabled className="bg-muted" aria-label="Email" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Nowe hasło</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isLoading}
                  aria-label="Nowe hasło"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.password}
                  {...form.register("password", {
                    onChange: (e) => setPassword(e.target.value),
                  })}
                />
                <PasswordRequirements password={password} requirements={passwordRequirements} />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
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
