import { cn } from "@/lib/utils";

interface ValidationMessageProps {
  message: string;
  className?: string;
}

export function ValidationMessage({ message, className }: ValidationMessageProps) {
  if (!message) return null;

  return <p className={cn("text-sm font-medium text-destructive mt-2", className)}>{message}</p>;
}
