import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AuthLayout } from "./auth-layout";
import { AuthCard } from "./auth-card";
import { AuthForm } from "./auth-form";
import { useState, useEffect } from "react";
import { logger } from "@/lib/services/logger.service";
import { usePasswordRequirements, passwordSchema } from "./hooks/use-password-requirements";
import { PasswordRequirements } from "./password-requirements";
import { toast } from "sonner";
import type { UseFormReturn } from "react-hook-form";

const registerSchema = z
  .object({
    firstName: z
      .string()
      .min(1, "Imię jest wymagane")
      .min(2, "Imię musi mieć co najmniej 2 znaki")
      .max(50, "Imię nie może być dłuższe niż 50 znaków")
      .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/, "Imię może zawierać tylko litery"),
    lastName: z
      .string()
      .min(1, "Nazwisko jest wymagane")
      .min(2, "Nazwisko musi mieć co najmniej 2 znaki")
      .max(50, "Nazwisko nie może być dłuższe niż 50 znaków")
      .regex(/^[a-zA-ZąćęłńóśźżĄĆĘŁŃÓŚŹŻ]+$/, "Nazwisko może zawierać tylko litery"),
    email: z.string().min(1, "Email jest wymagany").email("Nieprawidłowy format email"),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredEmail, setRegisteredEmail] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const { password, setPassword, passwordRequirements, passwordsMatch } = usePasswordRequirements({
    confirmPassword,
  });
  const [formInstance, setFormInstance] = useState<UseFormReturn<RegisterFormValues> | null>(null);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      // Sprawdzamy czy formularz jest brudny i nie jest w trakcie wysyłania ani nie został pomyślnie wysłany
      if (formInstance?.formState.isDirty && !isSubmitting && !isSuccess) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [isSubmitting, formInstance, isSuccess]);

  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
      window.location.href = "/login";
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const handleSubmit = async (data: RegisterFormValues) => {
    try {
      setIsSubmitting(true);
      logger.info(`Próba rejestracji użytkownika: ${data.email}`);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Wystąpił nieoczekiwany błąd podczas rejestracji");
      }

      logger.info(`Użytkownik zarejestrowany pomyślnie: ${data.email}`);

      // Resetujemy stan formularza
      formInstance?.reset();
      setIsSubmitting(false);

      // Ustawiamy stan sukcesu i zapisujemy email
      setRegisteredEmail(data.email);
      setIsSuccess(true);
    } catch (error) {
      logger.error("Błąd podczas rejestracji", { error, email: data.email });

      if (error instanceof TypeError && error.message === "Failed to fetch") {
        toast.error("Błąd połączenia z serwerem. Sprawdź swoje połączenie internetowe.");
        return;
      }

      toast.error(error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd");
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <AuthLayout>
        <AuthCard
          title="Konto utworzone!"
          description="Sprawdź swoją skrzynkę email"
          footer={
            <div className="text-sm text-muted-foreground">
              <a href="/login" className="text-primary hover:underline">
                Przejdź do logowania
              </a>
            </div>
          }
        >
          <div className="space-y-4 text-center text-muted-foreground">
            <p>
              Na adres <span className="font-medium text-foreground">{registeredEmail}</span> został wysłany link
              aktywacyjny.
            </p>
            <p>Kliknij w link w wiadomości email, aby aktywować konto.</p>
            <p className="text-sm">Jeśli nie widzisz wiadomości, sprawdź folder spam.</p>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <AuthCard
        title="Rejestracja"
        description="Utwórz nowe konto"
        footer={
          <div className="text-sm text-muted-foreground">
            Masz już konto?{" "}
            <a href="/login" className="text-primary hover:underline">
              Zaloguj się
            </a>
          </div>
        }
      >
        <AuthForm
          schema={registerSchema}
          onSubmit={handleSubmit}
          submitButtonText="Zarejestruj się"
          onFormReady={setFormInstance}
        >
          {(form) => (
            <>
              <div className="space-y-2">
                <Label htmlFor="firstName">Imię</Label>
                <Input
                  id="firstName"
                  type="text"
                  placeholder="Jan"
                  disabled={isSubmitting}
                  aria-label="Imię"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.firstName}
                  {...form.register("firstName")}
                />
                {form.formState.errors.firstName && (
                  <p className="text-sm text-destructive">{form.formState.errors.firstName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Nazwisko</Label>
                <Input
                  id="lastName"
                  type="text"
                  placeholder="Kowalski"
                  disabled={isSubmitting}
                  aria-label="Nazwisko"
                  aria-required="true"
                  aria-invalid={!!form.formState.errors.lastName}
                  {...form.register("lastName")}
                />
                {form.formState.errors.lastName && (
                  <p className="text-sm text-destructive">{form.formState.errors.lastName.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
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

              <div className="space-y-2">
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-label="Hasło"
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
                <Label htmlFor="confirmPassword">Potwierdź hasło</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  disabled={isSubmitting}
                  aria-label="Potwierdź hasło"
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
