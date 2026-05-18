import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_CONSTANTS } from "@/constants/app";

interface AuthCardProps {
  title: string;
  description: React.ReactNode;
  children: React.ReactElement;
  footer?: React.ReactElement;
  "data-testid"?: string;
}

export function AuthCard({ title, description, children, footer, "data-testid": dataTestId }: AuthCardProps) {
  return (
    <Card className="cursor-default" data-testid={dataTestId}>
      <CardHeader className="flex flex-col items-center">
        <img src="/logo.svg" alt={`${APP_CONSTANTS.name} Logo`} className="w-24 h-24 mb-4" />
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>{children}</CardContent>
      {footer && <CardFooter className="flex justify-center">{footer}</CardFooter>}
    </Card>
  );
}
