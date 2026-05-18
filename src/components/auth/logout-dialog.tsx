import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { logger } from "@/lib/services/logger.service";
import { useAuth } from "./hooks/use-auth";
import { useNavigate } from "@/components/hooks/use-navigate";
import { toast } from "sonner";

interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  hasUnsavedChanges?: boolean;
}

export function LogoutDialog({ isOpen, onClose, onConfirm, hasUnsavedChanges = false }: LogoutDialogProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { refreshSession } = useAuth();
  const navigate = useNavigate();

  // Obsługa wygaśnięcia sesji
  useEffect(() => {
    const handleSessionExpired = () => {
      toast.error("Sesja wygasła. Zaloguj się ponownie.");
      navigate("/login");
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, [navigate]);

  // Obsługa ostrzeżeń przed opuszczeniem strony
  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = "Masz niezapisane zmiany. Czy na pewno chcesz opuścić stronę?";
      return e.returnValue;
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await onConfirm();
      // Odświeżamy sesję przed przekierowaniem
      await refreshSession();
      // Przekieruj do strony logowania po pomyślnym wylogowaniu
      navigate("/login");
    } catch (error) {
      logger.error("Błąd podczas wylogowania", error);
      toast.error("Wystąpił błąd podczas wylogowania");
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]" data-testid="logout-dialog">
        <DialogHeader>
          <DialogTitle>Wylogowanie</DialogTitle>
          <DialogDescription>
            {hasUnsavedChanges
              ? "Masz niezapisane zmiany. Czy na pewno chcesz się wylogować? Wszystkie niezapisane zmiany zostaną utracone."
              : "Czy na pewno chcesz się wylogować?"}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            aria-busy={isLoading}
            data-testid="logout-cancel-button"
          >
            Anuluj
          </Button>
          <Button
            variant="destructive"
            onClick={handleLogout}
            disabled={isLoading}
            aria-busy={isLoading}
            data-testid="logout-confirm-button"
          >
            {isLoading ? "Wylogowywanie..." : "Wyloguj"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
