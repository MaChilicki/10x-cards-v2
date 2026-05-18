import { APP_CONSTANTS } from "@/constants/app";

interface AuthLayoutProps {
  children: React.ReactElement;
  "data-testid"?: string;
}

export function AuthLayout({ children, "data-testid": dataTestId }: AuthLayoutProps) {
  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center p-4" data-testid={dataTestId}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">{APP_CONSTANTS.name}</h1>
          <p className="text-muted-foreground">{APP_CONSTANTS.slogan}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
