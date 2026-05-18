# Diagram Podróży Użytkownika - System Autentykacji

Diagram przedstawia pełną podróż użytkownika przez system autentykacji, w tym procesy rejestracji, logowania, zarządzania kontem i resetowania hasła.

```mermaid
stateDiagram-v2
    [*] --> StronaGlowna
    StronaGlowna --> FormularzLogowania: Kliknięcie "Zaloguj się"
    StronaGlowna --> FormularzRejestracji: Kliknięcie "Zarejestruj się"
    
    state "Proces Rejestracji" as Rejestracja {
        [*] --> FormularzRejestracji
        FormularzRejestracji --> WalidacjaDanych: Wypełnienie formularza
        WalidacjaDanych --> WyslanieMaila: Dane poprawne
        WalidacjaDanych --> FormularzRejestracji: Dane niepoprawne
        WyslanieMaila --> OczekiwanieNaWeryfikacje: Email wysłany
        OczekiwanieNaWeryfikacje --> FormularzLogowania: Email zweryfikowany
    }
    
    state "Proces Logowania" as Logowanie {
        [*] --> FormularzLogowania
        FormularzLogowania --> WalidacjaLogowania: Wypełnienie formularza
        WalidacjaLogowania --> Dashboard: Dane poprawne
        WalidacjaLogowania --> FormularzLogowania: Dane niepoprawne
    }
    
    state "Zarządzanie Kontem" as Konto {
        [*] --> MenuUzytkownika
        MenuUzytkownika --> FormularzZmianyHasla: Wybór "Zmień hasło"
        MenuUzytkownika --> FormularzLogowania: Wybór "Wyloguj się"
        FormularzZmianyHasla --> MenuUzytkownika: Hasło zmienione
    }
    
    state "Reset Hasła" as Reset {
        [*] --> FormularzResetuHasla
        FormularzResetuHasla --> WyslanieLinkuReset: Wprowadzenie emaila
        WyslanieLinkuReset --> FormularzNowegoHasla: Link wysłany
        FormularzNowegoHasla --> FormularzLogowania: Hasło zresetowane
    }
    
    Dashboard --> MenuUzytkownika: Kliknięcie awatara
    FormularzLogowania --> FormularzResetuHasla: Kliknięcie "Zapomniałem hasła"
    
    note right of FormularzRejestracji
        Wymagane pola:
        - Email
        - Hasło (min. 8 znaków)
        - Potwierdzenie hasła
    end note
    
    note right of FormularzLogowania
        Wymagane pola:
        - Email
        - Hasło
    end note
    
    note right of FormularzZmianyHasla
        Wymagane pola:
        - Aktualne hasło
        - Nowe hasło
        - Potwierdzenie hasła
    end note
    
    note right of FormularzResetuHasla
        Wymagane pole:
        - Email
    end note
```

Diagram został utworzony przy użyciu narzędzia Mermaid i przedstawia:
- Stany systemu
- Przejścia między stanami
- Warunki przejść
- Notatki informacyjne
