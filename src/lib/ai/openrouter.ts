/**
 * Thin wrapper around the OpenRouter chat-completion API.
 * OpenRouter is OpenAI-compatible, so we hit the same endpoint shape.
 */

const BASE_URL = "https://openrouter.ai/api/v1";

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

export interface ChatOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  /** Pass a JSON schema to get structured JSON back (OpenRouter supports response_format) */
  responseFormat?: "json_object";
}

export class OpenRouterError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "OpenRouterError";
  }
}

export async function chat(
  messages: ChatMessage[],
  options: ChatOptions = {},
): Promise<string> {
  const key = process.env.OPENROUTER_API_KEY;
  if (!key) throw new OpenRouterError(500, "OPENROUTER_API_KEY is not set");

  const model = options.model ?? process.env.OPENROUTER_MODEL ?? "mistralai/mistral-7b-instruct";

  const body: Record<string, unknown> = {
    model,
    messages,
    temperature: options.temperature ?? 0.2,
    max_tokens: options.max_tokens ?? 1024,
  };

  if (options.responseFormat === "json_object") {
    body.response_format = { type: "json_object" };
  }

  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000",
      "X-Title": "FinanceAI",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    throw new OpenRouterError(res.status, `OpenRouter ${res.status}: ${text}`);
  }

  const json = await res.json();
  return (json.choices?.[0]?.message?.content ?? "").trim();
}
