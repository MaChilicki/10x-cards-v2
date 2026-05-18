import { Button } from "@/components/ui/button";
import { AuthCard } from "./auth-card";
import { AuthLayout } from "./auth-layout";
import { toast } from "sonner";
import { useEffect, useState } from "react";
import { logger } from "@/lib/services/logger.service";
import { createSupabaseBrowserClient } from "@/db/supabase.client";
import { useCountdownRedirect } from "./hooks/use-countdown-redirect";

interface VerifyEmailProps {
  userEmail?: string;
  token?: string | null;
  type?: string | null;
  initialVerified?: boolean;
}

export function VerifyEmail({ userEmail = "", token, type, initialVerified = false }: VerifyEmailProps) {
  // Stan weryfikacji emaila
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState(userEmail);
  const [isVerified, setIsVerified] = useState(initialVerified);
  const [isVerificationAttempted, setIsVerificationAttempted] = useState(false);
  const [error, setError] = useState("");
  const [errorDetails, setErrorDetails] = useState("");
  const [isChecking, setIsChecking] = useState(false);

  // Hook do obsługi przekierowania z odliczaniem
  const { redirectPath, counterText } = useCountdownRedirect(5);

  // Sprawdzamy, czy użytkownik został przekierowany z procesu weryfikacji Supabase
  useEffect(() => {
    // Sprawdzamy czy jest to przekierowanie bezpośrednio po weryfikacji przez Supabase
    const urlParams = new URLSearchParams(window.location.search);
    const fromSupabaseAuth = urlParams.has("token_hash") || urlParams.has("error_description");

    if (fromSupabaseAuth || initialVerified) {
      // Jeśli użytkownik przyszedł bezpośrednio z procesu weryfikacji Supabase,
      // uznajemy, że email został już zweryfikowany
      setIsVerified(true);
      setIsVerificationAttempted(true);
      logger.info("Wykryto przekierowanie z procesu weryfikacji Supabase, email już zweryfikowany");

      // Przekierowanie na stronę główną po 5 sekundach
      const redirectTimeout = setTimeout(() => {
        window.location.href = "/";
      }, 5000);

      return () => {
        clearTimeout(redirectTimeout);
      };
    } else if (token && type) {
      // Jeśli mamy token i type, ale nie jest to przekierowanie z Supabase,
      // ustawiamy flagę isChecking na true i będziemy próbować weryfikować przez API
      setIsChecking(true);
    }
  }, [initialVerified, token, type]);

  // Weryfikacja tokena przez nasze API (tylko jeśli mamy token, type i nie została
  // wykryta weryfikacja bezpośrednio przez Supabase)
  useEffect(() => {
    if (!token || !type || isVerified) return;

    const abortController = new AbortController();

    const verifyToken = async () => {
      try {
        // Próbujemy zweryfikować przez API
        const response = await fetch(`/api/auth/verify-email?token=${token}&type=${type}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Błąd weryfikacji emaila");
        }

        setIsVerified(true);
        setIsVerificationAttempted(true);
        logger.info("Email zweryfikowany pomyślnie");

        // Przekierowanie po udanej weryfikacji
        setTimeout(() => {
          window.location.href = "/";
        }, 5000);
      } catch (error) {
        // W przypadku błędu sprawdzamy, czy może użytkownik już jest zweryfikowany
        try {
          const supabase = createSupabaseBrowserClient();
          const {
            data: { user },
          } = await supabase.auth.getUser();

          if (user?.email_confirmed_at) {
            // Email jest zweryfikowany mimo błędu z tokenem
            setIsVerified(true);
            setIsVerificationAttempted(true);
            logger.info("Email już zweryfikowany mimo błędu tokena");
            // Przekierowanie po 5 sekundach
            setTimeout(() => {
              window.location.href = "/";
            }, 5000);
          } else {
            // Obsługa rzeczywistego błędu weryfikacji
            const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
            setIsVerified(false);
            setError("Weryfikacja nie powiodła się");
            setErrorDetails(errorMessage);
            logger.error(`Błąd podczas weryfikacji tokenu: ${errorMessage}`);
          }
        } catch (secondError) {
          // Jeśli wszystko zawiedzie, pokazujemy oryginalny błąd
          const errorMessage = error instanceof Error ? error.message : "Nieznany błąd";
          setIsVerified(false);
          setError("Weryfikacja nie powiodła się");
          setErrorDetails(errorMessage);
          logger.error(`Błąd podczas weryfikacji tokenu: ${errorMessage}`, {
            originalError: error,
            checkError: secondError,
          });
        }
      } finally {
        setIsChecking(false);
        setIsVerificationAttempted(true);
      }
    };

    verifyToken();

    // Funkcja czyszcząca
    return () => {
      abortController.abort();
    };
  }, [token, type, isVerified]);

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
      window.location.href = "/login";
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  // Funkcja do ponownego wysłania emaila weryfikacyjnego
  const handleResendVerification = async () => {
    try {
      setIsResending(true);
      const currentEmail = email || userEmail;
      setEmail(currentEmail);

      const supabase = createSupabaseBrowserClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: currentEmail,
      });

      if (error) throw error;

      toast.success("Link weryfikacyjny został wysłany ponownie");
    } catch (error) {
      logger.error("Błąd podczas ponownego wysyłania linku weryfikacyjnego", { error });
      toast.error(error instanceof Error ? error.message : "Nie udało się wysłać linku weryfikacyjnego");
    } finally {
      setIsResending(false);
    }
  };

  // Jeśli jest ustawione przekierowanie z opóźnieniem
  if (redirectPath) {
    return (
      <AuthLayout>
        <AuthCard title="Przekierowanie" description="Za chwilę zostaniesz przekierowany...">
          <div className="flex flex-col justify-center items-center space-y-4 p-8 text-center">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md w-full dark:bg-emerald-950 dark:text-emerald-300">
              <p className="font-medium">Konto zostało aktywowane!</p>
              <p className="text-sm mt-1">Możesz teraz korzystać ze wszystkich funkcji aplikacji.</p>
            </div>

            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4 mt-2"></div>
            <p className="text-sm text-muted-foreground">
              Trwa przekierowanie na {redirectPath === "/" ? "stronę główną" : "stronę logowania"}...
            </p>
            <p className="text-sm text-muted-foreground">
              Przekierowanie nastąpi automatycznie za <span className="font-medium">{counterText}</span>.
            </p>
            <Button asChild className="mt-4">
              <a href={redirectPath}>Przejdź teraz</a>
            </Button>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // Podczas ładowania
  if (isChecking) {
    return (
      <AuthLayout>
        <AuthCard title="Weryfikacja adresu email" description="Sprawdzamy status Twojego adresu email...">
          <div className="flex justify-center items-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // Stan po kliknięciu w link i pomyślnej weryfikacji
  if (isVerificationAttempted && isVerified) {
    return (
      <AuthLayout>
        <AuthCard
          title="Email zweryfikowany!"
          description="Twój adres email został pomyślnie zweryfikowany. Możesz teraz zalogować się na swoje konto."
          footer={
            <div className="text-sm text-center text-muted-foreground">
              <p>Dziękujemy za zweryfikowanie adresu email.</p>
            </div>
          }
        >
          <div className="space-y-4 text-center">
            <div className="p-3 bg-emerald-50 text-emerald-700 rounded-md mb-4 dark:bg-emerald-950 dark:text-emerald-300">
              <p className="font-medium">Konto zostało pomyślnie aktywowane!</p>
            </div>
            <p className="text-muted-foreground">
              Twoje konto jest już aktywne i możesz korzystać ze wszystkich funkcji aplikacji.
            </p>
            <div className="flex justify-center">
              <Button asChild>
                <a href="/login">Przejdź do logowania</a>
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // Stan po kliknięciu w link, ale weryfikacja się nie powiodła
  if (isVerificationAttempted && !isVerified) {
    return (
      <AuthLayout>
        <AuthCard
          title="Błąd weryfikacji"
          description={`Nie udało się zweryfikować Twojego adresu email. ${error}`}
          footer={
            <div className="text-sm text-center text-muted-foreground">
              <a href="/login" className="text-primary hover:underline">
                Przejdź do logowania
              </a>
            </div>
          }
        >
          <div className="space-y-4 text-center">
            <div className="text-sm text-muted-foreground">
              <p>Możliwe przyczyny błędu:</p>
              <ul className="list-disc mt-2 inline-block text-left">
                <li>Link weryfikacyjny wygasł</li>
                <li>Link został już wykorzystany</li>
                <li>Token jest nieprawidłowy</li>
              </ul>
            </div>
            {errorDetails && (
              <div className="text-xs bg-muted p-2 rounded text-muted-foreground">
                <code>{errorDetails}</code>
              </div>
            )}
            <div className="flex justify-center">
              <Button variant="outline" onClick={handleResendVerification} disabled={isResending}>
                {isResending ? "Wysyłanie..." : "Wyślij link ponownie"}
              </Button>
            </div>
          </div>
        </AuthCard>
      </AuthLayout>
    );
  }

  // Stan oczekiwania na weryfikację - nie kliknięto jeszcze w link
  return (
    <AuthLayout>
      <AuthCard
        title="Weryfikacja adresu email"
        description={
          <>
            Na adres <span className="font-medium text-foreground">{email}</span> został wysłany link weryfikacyjny.
          </>
        }
        footer={
          <div className="text-sm text-center text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Powrót do logowania
            </a>
          </div>
        }
      >
        <div className="space-y-4 text-center text-muted-foreground">
          <p>Sprawdź swoją skrzynkę pocztową i kliknij w link, aby aktywować konto.</p>
          <p>
            Aby dokończyć proces rejestracji, musisz zweryfikować swój adres email. Po weryfikacji będziesz mógł
            zalogować się do swojego konta.
          </p>
          <p className="text-sm">Jeśli nie widzisz wiadomości, sprawdź folder spam.</p>

          <Button variant="outline" onClick={handleResendVerification} disabled={isResending} className="mt-4">
            {isResending ? "Wysyłanie..." : "Wyślij link ponownie"}
          </Button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
}
