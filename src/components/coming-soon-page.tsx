import { Button } from "@/components/ui/button";
import { useNavigate } from "@/components/hooks/use-navigate";
import { APP_CONSTANTS } from "@/constants/app";

export function ComingSoonPage() {
  const navigate = useNavigate();

  return (
    <div className="flex-1 flex items-center justify-center p-4">
      <div className="text-center space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.svg" alt={`${APP_CONSTANTS.name} Logo`} className="h-24 w-24" />
          <h1 className="text-4xl font-bold">Strona w przygotowaniu</h1>
        </div>
        <p className="text-lg text-muted-foreground">Pracujemy nad tą funkcjonalnością. Wróć wkrótce!</p>
        <Button onClick={() => navigate("/")}>Wróć do strony głównej</Button>
      </div>
    </div>
  );
}
