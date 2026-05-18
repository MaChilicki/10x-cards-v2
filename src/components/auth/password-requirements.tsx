import { Check, X } from "lucide-react";
import type { PasswordRequirement } from "./hooks/use-password-requirements";

interface PasswordRequirementsProps {
  password: string;
  requirements: PasswordRequirement[];
}

export function PasswordRequirements({ password, requirements }: PasswordRequirementsProps) {
  return (
    <div className="space-y-1 text-sm">
      {requirements.map((requirement, index) => (
        <div key={index} className="flex items-center gap-2">
          {requirement.validate(password) ? (
            <Check className="h-4 w-4 text-emerald-600" />
          ) : (
            <X className="h-4 w-4 text-destructive" />
          )}
          <span className={requirement.validate(password) ? "text-emerald-600" : "text-muted-foreground"}>
            {requirement.label}
          </span>
        </div>
      ))}
    </div>
  );
}
