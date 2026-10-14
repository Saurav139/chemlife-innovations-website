import { isChatErrorCode, type ChatErrorCode } from '@/lib/chatErrors';

const API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || '';
const CHAT_TIMEOUT_MS = 60_000;

export interface Turn {
  role: 'user' | 'assistant';
  content: string;
}

export interface Source {
  title: string;
  url: string;
}

export interface ChatResponse {
  reply: string;
  sources: Source[];
  redirect_to?: string;
}

/** The API's error codes, plus the two the browser detects itself. */
export type ChatFailureCode = ChatErrorCode | 'offline' | 'network';

export class ChatError extends Error {
  readonly code: ChatFailureCode;

  constructor(code: ChatFailureCode) {
    super(`Chat request failed: ${code}`);
    this.name = 'ChatError';
    this.code = code;
  }
}

// For replies that aren't the API's own JSON, such as a proxy error page.
function codeForStatus(status: number): ChatErrorCode {
  if (status === 429) return 'rate_limited';
  if (status === 504) return 'timeout';
  if (status === 502 || status === 503) return 'unavailable';
  if (status === 413) return 'message_too_long';
  return 'internal';
}

export async function sendMessage(
  message: string,
  bot: string,
  history: Turn[]
): Promise<ChatResponse> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, bot, history }),
      signal: AbortSignal.timeout(CHAT_TIMEOUT_MS),
    });
  } catch (err) {
    if ((err as { name?: string } | null)?.name === 'TimeoutError') throw new ChatError('timeout');
    throw new ChatError(navigator.onLine ? 'network' : 'offline');
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ChatError(isChatErrorCode(body?.code) ? body.code : codeForStatus(res.status));
  }
  return res.json().catch(() => {
    throw new ChatError('internal');
  });
}

/** Whether the chat API has its keys: true or false, or null if the check itself failed. */
export async function fetchChatAvailability(): Promise<boolean | null> {
  try {
    const res = await fetch(`${API_URL}/api/chat`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.available === 'boolean' ? data.available : null;
  } catch {
    return null;
  }
}

export async function fetchFaqs(bot: string, n: number = 3): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/faqs?bot=${bot}&n=${n}`);
  if (!res.ok) {
    throw new Error(`FAQs API error: ${res.status}`);
  }
  const data = await res.json();
  return data.questions ?? [];
}
