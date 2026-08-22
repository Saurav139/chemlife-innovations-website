const API_URL = process.env.NEXT_PUBLIC_CHATBOT_API_URL || '/chatbot-api';

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

export async function routeQuery(message: string): Promise<'kukku' | 'mikku'> {
  const res = await fetch(`${API_URL}/api/route`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  });
  if (!res.ok) {
    throw new Error(`Route API error: ${res.status}`);
  }
  const data = await res.json();
  return data.bot as 'kukku' | 'mikku';
}

export async function sendMessage(
  message: string,
  bot: string,
  history: Turn[]
): Promise<ChatResponse> {
  const res = await fetch(`${API_URL}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message, bot, history }),
  });
  if (!res.ok) {
    throw new Error(`Chat API error: ${res.status}`);
  }
  return res.json();
}

export async function fetchFaqs(bot: string, n: number = 3): Promise<string[]> {
  const res = await fetch(`${API_URL}/api/faqs?bot=${bot}&n=${n}`);
  if (!res.ok) {
    throw new Error(`FAQs API error: ${res.status}`);
  }
  const data = await res.json();
  return data.questions ?? [];
}
