import { z } from "zod";

export const registerSchema = z.object({
  firstName: z.string().min(2, "Imię musi mieć co najmniej 2 znaki").max(50, "Imię nie może być dłuższe niż 50 znaków"),
  lastName: z
    .string()
    .min(2, "Nazwisko musi mieć co najmniej 2 znaki")
    .max(50, "Nazwisko nie może być dłuższe niż 50 znaków"),
  email: z.string().email("Nieprawidłowy adres email"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny"),
});

export const loginSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
  password: z.string().min(1, "Hasło jest wymagane"),
});

export const resetPasswordSchema = z.object({
  email: z.string().email("Nieprawidłowy adres email"),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Aktualne hasło jest wymagane"),
  password: z
    .string()
    .min(8, "Hasło musi mieć co najmniej 8 znaków")
    .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
    .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
    .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
    .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny"),
});

export const setNewPasswordSchema = z
  .object({
    token: z.string().min(1, "Token jest wymagany"),
    password: z
      .string()
      .min(8, "Hasło musi mieć co najmniej 8 znaków")
      .regex(/[A-Z]/, "Hasło musi zawierać co najmniej jedną wielką literę")
      .regex(/[a-z]/, "Hasło musi zawierać co najmniej jedną małą literę")
      .regex(/[0-9]/, "Hasło musi zawierać co najmniej jedną cyfrę")
      .regex(/[^A-Za-z0-9]/, "Hasło musi zawierać co najmniej jeden znak specjalny"),
    confirmPassword: z.string().min(1, "Potwierdzenie hasła jest wymagane"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Hasła nie są identyczne",
    path: ["confirmPassword"],
  });

export type RegisterData = z.infer<typeof registerSchema>;
export type LoginData = z.infer<typeof loginSchema>;
export type ResetPasswordData = z.infer<typeof resetPasswordSchema>;
export type ChangePasswordData = z.infer<typeof changePasswordSchema>;
