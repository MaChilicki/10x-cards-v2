# Plan implementacji usługi OpenRouter

Poniższy dokument opisuje pełną specyfikację i przewodnik wdrożenia usługi OpenRouter zgodnie z podanym stackiem technologicznym oraz wytycznymi dotyczącymi czystego kodu.

## 1. Opis usługi
Usługa `OpenRouterService` odpowiada za:
1. Inicjalizację klienta HTTP do komunikacji z API OpenRouter.
2. Budowanie i walidację komunikatów dla roli system, user oraz opcjonalne response_format.
3. Wysyłanie żądań asynchronicznych do endpointu chat/completions.
4. Parsowanie i walidację odpowiedzi zgodnie z podanym schematem JSON.
5. Obsługę błędów sieciowych, API i walidacji.

## 2. Opis konstruktora
```ts
interface OpenRouterConfig {
  apiKey: string;
  baseUrl?: string;          // domyślnie "https://openrouter.ai/api/v1"
  defaultModel?: string;     // np. "openai/gpt-4o"
  defaultParams?: Omit<ChatParams, 'model'>;
}

class OpenRouterService {
  private apiKey: string;
  private baseUrl: string;
  private defaultModel: string;
  private defaultParams: ChatParams;

  constructor(config: OpenRouterConfig) {
    if (!config.apiKey) throw new Error('Brak klucza API');
    this.apiKey = config.apiKey;
    this.baseUrl = config.baseUrl ?? 'https://openrouter.ai/api/v1';
    this.defaultModel = config.defaultModel ?? 'openai/gpt-4o';
    this.defaultParams = config.defaultParams ?? { parameter:1.0, top_p:1.0, frequency_penalty:0.0, presence_penalty:0.0 };
  }
  // ...
}
```

## 3. Publiczne metody i pola
```ts
interface ChatParams {
  model: string;
  parameter: number;
  top_p: number;
  frequency_penalty: number;
  presence_penalty: number;
  response_format?: {
    type: 'json_schema';
    json_schema: {
      name: string;
      strict: boolean;
      schema: Record<string, unknown>;
    };
  };
}

class OpenRouterService {
  // ...existing fields...

  /**
   * Wysyła komunikaty do API OpenRouter i zwraca odpowiedź zachowaną w podanym typie.
   */
  public async chat(
    systemMessage: string,
    userMessage: string,
    params?: Partial<Omit<ChatParams, 'model'>> & Pick<ChatParams, 'model'>
  ): Promise<unknown> {
    const payload = {
      model: params?.model ?? this.defaultModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      parameter: params?.parameter ?? this.defaultParams.parameter,
      top_p: params?.top_p ?? this.defaultParams.top_p,
      frequency_penalty: params?.frequency_penalty ?? this.defaultParams.frequency_penalty,
      presence_penalty: params?.presence_penalty ?? this.defaultParams.presence_penalty,
      response_format: params?.response_format
    };

    return this.sendRequest(payload);
  }

  /**
   * Dostęp do klucza API (tylko do odczytu).
   */
  public getApiKey(): string {
    return this.apiKey;
  }
}
```

## 4. Prywatne metody i pola
```ts
class OpenRouterService {
  // ...existing fields...

  /**
   * Wspólna metoda obsługująca HTTP i błędy.
   */
  private async sendRequest(payload: ChatParams): Promise<unknown> {
    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${this.apiKey}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const json = await response.json();
      return json;
    } catch (err) {
      // Dalsza obsługa lub logowanie
      throw err;
    }
  }
}
```

## 5. Obsługa błędów
1. Brak lub nieprawidłowy klucz API.
2. Błędy sieciowe (timeout, DNS, offline).
3. Nieoczekiwane kody statusu HTTP (!=2xx).
4. Błędy parsowania JSON.
5. Walidacja response_format (brak wymaganych pól).
6. Przekroczone limity API.

Dla każdego przypadku należy:
- rzucać specyficzne błędy typu `ApiError`, `NetworkError`, `ValidationError`.
- Logować szczegóły i propagować.

## 6. Kwestie bezpieczeństwa
- Przechowywać klucz API tylko w bezpiecznym środowisku (zmienne środowiskowe, .env).
- Używać HTTPS.
- Limity rate-limit oraz retry z backoff (np. exponential backoff).
- Unikać wycieków danych w logach.

## 7. Plan wdrożenia krok po kroku
1. Instalacja zależności: `npm install cross-fetch`
2. Utworzenie pliku `src/lib/openrouter-service.ts` i wklejenie klasy `OpenRouterService`.
3. Dodanie typów do `src/types.ts`.
4. Wyrzucenie klucza API do `.env` i konfiguracja w `astro.config.mjs`.
5. Implementacja testów jednostkowych (mock fetch).
6. Dodanie retry logic i testowanie scenariuszy błędów.
7. Dokumentacja w README.
8. CI: GitHub Actions - uruchamianie testów.
9. Deployment: DigitalOcean lub inny hosting z Dockerem.
10. Weryfikacja logów i monitoringu.
