# Drzewo komponentów dla strony logowania

## Proces renderowania strony z middleware

```
Żądanie HTTP
├── middleware/index.ts (Astro middleware)
│   ├── Sprawdzenie parametrów weryfikacyjnych URL
│   │   └── (Warunkowo) Przekierowanie do /verify-email
│   ├── Sprawdzenie czy ścieżka jest publiczna (PUBLIC_PATHS)
│   │   └── [Strona /login jest w PUBLIC_PATHS] -> Pominięcie sprawdzania autoryzacji
│   └── Renderowanie strony publicznej bez weryfikacji użytkownika
└── Renderowanie strony
    └── login.astro
```

## login.astro
```
login.astro
├── AuthLayout.astro
│   ├── <head>
│   │   └── <script> (Astro locals)
│   ├── <body>
│   │   ├── <main>
│   │   │   └── <slot> (zawartość strony login.astro)
│   │   │       └── LoginForm.tsx (React component)
│   │   │           └── AuthLayout (React component)
│   │   │               └── AuthCard (React component)
│   │   │                   ├── Card
│   │   │                   │   ├── CardHeader
│   │   │                   │   │   ├── img (logo)
│   │   │                   │   │   ├── CardTitle
│   │   │                   │   │   └── CardDescription
│   │   │                   │   ├── CardContent
│   │   │                   │   │   └── AuthForm (React component)
│   │   │                   │   │       ├── form
│   │   │                   │   │       │   ├── Alert (warunkowy)
│   │   │                   │   │       │   │   └── AlertDescription
│   │   │                   │   │       │   ├── children
│   │   │                   │   │       │   │   ├── Input (Email)
│   │   │                   │   │       │   │   ├── p (błąd Email)
│   │   │                   │   │       │   │   ├── Input (Hasło)
│   │   │                   │   │       │   │   └── p (błąd Hasło)
│   │   │                   │   │       │   └── Button (Zaloguj się)
│   │   │                   │   │       │       └── LoadingSpinner (warunkowy)
│   │   │                   │   │       └── footer (Link do resetowania hasła)
│   │   │                   │   └── CardFooter
│   │   │                   │       └── div (Link do rejestracji)
│   │   │
│   │   └── Footer.tsx (React component)
│   │       └── footer
│   │           └── div (container)
│   │               └── div
│   │                   ├── img (logo)
│   │                   └── span (tekst)
│   │
│   └── <style>
``` 