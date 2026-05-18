# Komponenty Autoryzacji

## AuthForm

Główny komponent formularza autoryzacji, obsługujący logowanie i rejestrację.

### Props

```typescript
interface AuthFormProps {
  mode: 'login' | 'register';
  onSuccess?: (user: User) => void;
  onError?: (error: Error) => void;
  onDirtyChange?: (isDirty: boolean) => void;
  warnOnUnsavedChanges?: boolean;
}
```

### Przykład użycia

```tsx
<AuthForm
  mode="login"
  onSuccess={(user) => {
    console.log('Zalogowano:', user);
  }}
  onError={(error) => {
    console.error('Błąd logowania:', error);
  }}
  onDirtyChange={(isDirty) => {
    console.log('Formularz zmodyfikowany:', isDirty);
  }}
  warnOnUnsavedChanges={true}
/>
```

## LogoutDialog

Komponent dialogu potwierdzenia wylogowania.

### Props

```typescript
interface LogoutDialogProps {
  isOpen: boolean;
  onClose: () => void;
  hasUnsavedChanges?: boolean;
}
```

### Przykład użycia

```tsx
<LogoutDialog
  isOpen={isLogoutDialogOpen}
  onClose={() => setIsLogoutDialogOpen(false)}
  hasUnsavedChanges={hasUnsavedChanges}
/>
```

## EmailVerificationForm

Formularz weryfikacji adresu email.

### Props

```typescript
interface EmailVerificationFormProps {
  email: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### Przykład użycia

```tsx
<EmailVerificationForm
  email="user@example.com"
  onSuccess={() => {
    console.log('Email zweryfikowany');
  }}
  onError={(error) => {
    console.error('Błąd weryfikacji:', error);
  }}
/>
```

## ResetPasswordForm

Formularz resetowania hasła.

### Props

```typescript
interface ResetPasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### Przykład użycia

```tsx
<ResetPasswordForm
  onSuccess={() => {
    console.log('Link do resetowania hasła wysłany');
  }}
  onError={(error) => {
    console.error('Błąd resetowania hasła:', error);
  }}
/>
```

## ChangePasswordForm

Formularz zmiany hasła.

### Props

```typescript
interface ChangePasswordFormProps {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}
```

### Przykład użycia

```tsx
<ChangePasswordForm
  onSuccess={() => {
    console.log('Hasło zmienione');
  }}
  onError={(error) => {
    console.error('Błąd zmiany hasła:', error);
  }}
/>
```

## Wspólne funkcjonalności

### Obsługa niezapisanych zmian
Wszystkie formularze obsługują ostrzeżenia o niezapisanych zmianach poprzez:
- Śledzenie stanu `isDirty` formularza
- Wyświetlanie ostrzeżenia przy próbie opuszczenia strony
- Integrację z `LogoutDialog` przy wylogowaniu

### Walidacja
- Walidacja emaila zgodnie z RFC 5322
- Walidacja hasła zgodnie z wymaganiami bezpieczeństwa
- Walidacja po stronie klienta i serwera

### Obsługa błędów
- Wyświetlanie błędów w formie toastów
- Logowanie błędów do konsoli
- Obsługa błędów sieciowych

### Stylowanie
- Wykorzystanie Tailwind CSS
- Komponenty z biblioteki shadcn/ui
- Responsywny design
- Dostępność (a11y) 