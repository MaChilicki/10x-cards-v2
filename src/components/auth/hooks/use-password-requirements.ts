import { useState, useEffect } from "react";
import { z } from "zod";

export interface PasswordRequirement {
  label: string;
  validate: (value: string) => boolean;
}

export const passwordRequirements: PasswordRequirement[] = [
  {
    label: "Co najmniej 8 znaków",
    validate: (value: string) => value.length >= 8,
  },
  {
    label: "Co najmniej jedna wielka litera",
    validate: (value: string) => /[A-Z]/.test(value),
  },
  {
    label: "Co najmniej jedna mała litera",
    validate: (value: string) => /[a-z]/.test(value),
  },
  {
    label: "Co najmniej jedna cyfra",
    validate: (value: string) => /[0-9]/.test(value),
  },
  {
    label: "Co najmniej jeden znak specjalny",
    validate: (value: string) => /[^A-Za-z0-9]/.test(value),
  },
];

export const passwordSchema = z
  .string()
  .min(1, "Hasło jest wymagane")
  .min(8, "Hasło musi mieć co najmniej 8 znaków")
  .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
  .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
  .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
  .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny");

interface UsePasswordRequirementsProps {
  confirmPassword?: string;
}

export function usePasswordRequirements({ confirmPassword = "" }: UsePasswordRequirementsProps = {}) {
  const [password, setPassword] = useState("");
  const [passwordsMatch, setPasswordsMatch] = useState(true);

  useEffect(() => {
    if (confirmPassword && password !== confirmPassword) {
      setPasswordsMatch(false);
    } else {
      setPasswordsMatch(true);
    }
    return undefined;
  }, [password, confirmPassword]);

  return {
    password,
    setPassword,
    passwordRequirements,
    passwordSchema,
    passwordsMatch,
  };
}
