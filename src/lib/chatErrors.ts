// Shared by the chat API and the chat page, so the page can tell the visitor exactly what went wrong.

export const MAX_MESSAGE_CHARS = 1000;

export const CHAT_ERROR_CODES = [
  "invalid_request",
  "message_too_long",
  "rate_limited",
  "daily_limit",
  "busy",
  "not_configured",
  "unavailable",
  "timeout",
  "internal",
] as const;

export type ChatErrorCode = (typeof CHAT_ERROR_CODES)[number];

export function isChatErrorCode(value: unknown): value is ChatErrorCode {
  return typeof value === "string" && (CHAT_ERROR_CODES as readonly string[]).includes(value);
}
