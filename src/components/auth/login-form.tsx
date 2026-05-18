import { z } from "zod";
import { Input } from "@/components/ui/input";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { AuthForm } from "./auth-form";
import { logger } from "@/lib/services/logger.service";
import { useState, useEffect } from "react";
import { useAuth } from "./hooks/use-auth";
import { useNavigate } from "@/components/hooks/use-navigate";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

const loginSchema = z.object({
  email: z.string().min(1, "Email jest wymagany").email("Nieprawidłowy format email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [formInstance, setFormInstance] = useState<UseFormReturn<LoginFormValues> | null>(null);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  const handleSubmit = async (data: LoginFormValues): Promise<void> => {
    try {
      setIsSubmitting(true);
      logger.info("Próba logowania użytkownika");

      // Używamy funkcji signIn z hooka useAuth zamiast bezpośredniego fetch
      // Przekazujemy formInstance do obsługi błędów walidacji
      const result = await signIn(data, formInstance || undefined);

      if (!result.success) {
        throw new Error("Nieprawidłowy email lub hasło");
      }

      logger.info("Zalogowano użytkownika");

      // Sprawdzamy czy email jest zweryfikowany
      if (result.user && !result.user.email_verified) {
        navigate("/auth/verify-email");
        return;
      }

      // Przekierowujemy do strony głównej
      navigate("/");
    } catch (error) {
      logger.error("Błąd podczas logowania", error);

      // Obsługa błędów sieciowych
      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe.");
        return;
      }

      // Obsługa innych błędów
      toast.error(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      throw error;
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthLayout data-testid="auth-layout">
      <AuthCard
        title="Logowanie"
        description="Zaloguj się do swojego konta"
        footer={
          <div className="text-sm text-muted-foreground">
            Nie masz konta?{" "}
            <a href="/register" className="text-primary hover:underline">
              Zarejestruj się
            </a>
          </div>
        }
        data-testid="login-card"
      >
        <AuthForm<typeof loginSchema>
          schema={loginSchema}
          onSubmit={handleSubmit}
          submitButtonText="Zaloguj się"
          onFormReady={setFormInstance}
          warnOnUnsavedChanges={false}
          footer={
            <a href="/reset-password" className="text-sm text-muted-foreground hover:text-primary transition-colors">
              Nie pamiętasz hasła?
            </a>
          }
          data-testid="login-form"
        >
          {(form) => (
            <>
              <div className="space-y-2">
                <Input
                  type="email"
                  placeholder="Email"
                  disabled={isSubmitting}
                  aria-label="Email"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.email}
                  data-testid="login-email-input"
                  {...form.register("email")}
                />
                {form.formState.errors.email && (
                  <p className="text-sm text-destructive">{form.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Input
                  type="password"
                  placeholder="Hasło"
                  disabled={isSubmitting}
                  aria-label="Hasło"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.password}
                  data-testid="login-password-input"
                  {...form.register("password")}
                />
                {form.formState.errors.password && (
                  <p className="text-sm text-destructive">{form.formState.errors.password.message}</p>
                )}
              </div>
            </>
          )}
        </AuthForm>
      </AuthCard>
    </AuthLayout>
  );
}
