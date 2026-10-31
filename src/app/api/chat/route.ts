import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { PROMPTS } from "./prompts";
import { MAX_MESSAGE_CHARS, type ChatErrorCode } from "@/lib/chatErrors";
import { RateLimiter, clientIp } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";

type BotKey = "kukku" | "mikku";
type Turn = { role: "user" | "assistant"; content: string };

const HISTORY_TURNS = 10;
const MAX_BODY_BYTES = 64 * 1024;
const OPENAI_TIMEOUT_MS = { classify: 8_000, embed: 8_000, answer: 30_000 };
const PINECONE_TIMEOUT_MS = 8_000;

// Per visitor: 10 questions a minute and 100 a day. Site-wide: CHAT_DAILY_LIMIT a day (each costs about $0.001).
const perMinute = new RateLimiter(10, 60_000);
const perDay = new RateLimiter(100, 86_400_000);
const siteWide = new RateLimiter(Number(process.env.CHAT_DAILY_LIMIT) || 3000, 86_400_000);

const ERROR_STATUS: Record<ChatErrorCode, number> = {
  invalid_request: 400,
  message_too_long: 400,
  rate_limited: 429,
  daily_limit: 429,
  busy: 503,
  not_configured: 503,
  unavailable: 503,
  timeout: 504,
  internal: 500,
};

const ERROR_TEXT: Record<ChatErrorCode, string> = {
  invalid_request: "Invalid request",
  message_too_long: `Message is longer than ${MAX_MESSAGE_CHARS} characters`,
  rate_limited: "Too many messages, try again in a minute",
  daily_limit: "Daily message limit reached",
  busy: "The assistant is busy, try again shortly",
  not_configured: "The assistant is not set up",
  unavailable: "The assistant is temporarily unavailable",
  timeout: "The assistant took too long to respond",
  internal: "Internal server error",
};

/** A failure the visitor is told about by its code. The message holds the details and only goes to the server log. */
class ChatFailure extends Error {
  constructor(readonly code: ChatErrorCode, detail: string, readonly retryAfter?: number) {
    super(detail);
  }
}

function isConfigured() {
  return Boolean(process.env.OPENAI_API_KEY && process.env.PINECONE_API_KEY);
}

// Configure Pinecone Client
let pcClient: Pinecone | null = null;
function getPineconeIndex() {
  if (!pcClient) {
    pcClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
      // One retry at most, so an outage fails within the time limit instead of after several backoffs.
      maxRetries: 1,
    });
  }
  return pcClient.index({ name: process.env.PINECONE_INDEX_NAME || "chemlife-knowledge" });
}

function upstreamFailure(service: string, err: unknown): ChatFailure {
  if (err instanceof ChatFailure) return err;
  const e = err as { name?: string; message?: string } | null;
  if (e?.name === "TimeoutError") return new ChatFailure("timeout", `${service} timed out`);
  return new ChatFailure("unavailable", `${service} failed: ${e?.name ?? "Error"}: ${e?.message ?? String(err)}`);
}

async function callOpenAI(path: "chat/completions" | "embeddings", body: object, timeoutMs: number): Promise<any> {
  try {
    const resp = await fetch(`https://api.openai.com/v1/${path}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });

    if (!resp.ok) {
      const detail = (await resp.text().catch(() => "")).slice(0, 500);
      // OpenAI sends 429 both for "slow down" and for "out of credit". Only the first clears up by itself.
      const outOfCredit = detail.includes("insufficient_quota");
      const reason = outOfCredit ? " (the account is out of credit)" : resp.status === 401 ? " (the API key was rejected)" : "";
      const code = resp.status === 429 && !outOfCredit ? "busy" : "unavailable";
      throw new ChatFailure(code, `OpenAI ${path} returned ${resp.status}${reason}: ${detail}`);
    }

    return await resp.json();
  } catch (err) {
    throw upstreamFailure(`OpenAI ${path}`, err);
  }
}

async function queryKnowledgeBase(vector: number[], namespace: string) {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(
      () => reject(new ChatFailure("timeout", `Pinecone query timed out after ${PINECONE_TIMEOUT_MS} ms`)),
      PINECONE_TIMEOUT_MS
    );
  });
  try {
    return await Promise.race([
      getPineconeIndex().query({ vector, namespace, topK: 8, includeMetadata: true }),
      timeout,
    ]);
  } catch (err) {
    // A vector-size error here means the index was built with a different embedding model.
    throw upstreamFailure("Pinecone query", err);
  } finally {
    clearTimeout(timer);
  }
}

function parseHistory(value: unknown): Turn[] {
  if (value === undefined || value === null) return [];
  if (!Array.isArray(value) || value.length > 40) {
    throw new ChatFailure("invalid_request", "history must be an array of at most 40 turns");
  }
  return value
    .filter(
      (t): t is Turn =>
        (t?.role === "user" || t?.role === "assistant") && typeof t.content === "string" && t.content.trim() !== ""
    )
    .slice(-HISTORY_TURNS)
    .map((t) => ({ role: t.role, content: t.content.slice(0, 2000) }));
}

async function readRequest(request: Request): Promise<{ message: string; bot: BotKey; history: Turn[] }> {
  if (Number(request.headers.get("content-length")) > MAX_BODY_BYTES) {
    throw new ChatFailure("invalid_request", "Request body is too large");
  }
  const raw = await request.text();
  if (raw.length > MAX_BODY_BYTES) throw new ChatFailure("invalid_request", "Request body is too large");

  let body: any;
  try {
    body = JSON.parse(raw);
  } catch {
    throw new ChatFailure("invalid_request", "Request body is not valid JSON");
  }

  const message = typeof body?.message === "string" ? body.message.trim() : "";
  if (!message) throw new ChatFailure("invalid_request", "Missing message");
  if (message.length > MAX_MESSAGE_CHARS) {
    throw new ChatFailure("message_too_long", `Message is ${message.length} characters`);
  }
  if (body.bot !== "kukku" && body.bot !== "mikku") {
    throw new ChatFailure("invalid_request", "bot must be kukku or mikku");
  }
  return { message, bot: body.bot, history: parseHistory(body.history) };
}

function checkRateLimits(ip: string | null) {
  // Without the visitor's address, per-visitor limits would lump everyone together, so only the site-wide one applies.
  if (ip) {
    const waitMinute = perMinute.retryAfter(ip);
    if (waitMinute) throw new ChatFailure("rate_limited", `${ip} sent more than 10 messages in a minute`, waitMinute);
    const waitDay = perDay.retryAfter(ip);
    if (waitDay) throw new ChatFailure("daily_limit", `${ip} sent more than 100 messages today`, waitDay);
  }
  const waitSite = siteWide.retryAfter("site");
  if (waitSite) throw new ChatFailure("busy", "The site-wide daily chat limit was reached", waitSite);

  if (ip) {
    perMinute.consume(ip);
    perDay.consume(ip);
  }
  siteWide.consume("site");
}

export function GET() {
  // Lets the chat page show the bots as offline before anyone types a question.
  return NextResponse.json({ available: isConfigured() }, { headers: { "Cache-Control": "no-store" } });
}

const ROUTER_PROMPT = `You are a query classifier. Classify the following query as either 'kukku' (poultry-related: chickens, broilers, layers, eggs, hens, feed, poultry diseases, chicks, swine, pigs) or 'mikku' (dairy-related: cows, buffaloes, milk, rumen, dairy, calves, lactation, fertility in cattle, silages). Return ONLY the single word 'kukku' or 'mikku' with no punctuation or explanation.`;

const PRODUCT_URLS: Record<string, string> = {
  "maxdmold plus": "/products/maxdmold-plus",
  "maxdmold-plus": "/products/maxdmold-plus",
  "maxdmold": "/products/maxdmold",
  "feedgenie forte": "/products/feedgenie-forte",
  "feedgenie-forte": "/products/feedgenie-forte",
  "chemdmold": "/products/feedgenie-forte",
  "feedgenie prime": "/products/feedgenie-prime",
  "feedgenie-prime": "/products/feedgenie-prime",
  "feedgenie": "/products/feedgenie-prime",
  "growgenie-phyto": "/products/grogenie-12-60",
  "growgenie": "/products/grogenie-12-60",
  "grobiozen": "/products/grogenie-12-60",
  "grogenie": "/products/grogenie-12-60",
  "egggenie": "/products/egggenie",
  "livprogenie": "/products/livprogenie",
  "gutprogenie": "/products/gutprogenie",
  "syndmold": "/products/syndmold",
  "methiowiz": "/products/methiowiz",
  "mbiowiz plus": "/products/mbiowiz-plus",
  "mbiowiz-plus": "/products/mbiowiz-plus",
  "mbiowiz ts": "/products/mbiowiz-ts",
  "mbiowiz-ts": "/products/mbiowiz-ts",
  "choliwiz": "/products/choliwiz",
  "rumiwiz": "/products/rumiwiz",
  "aflamlock": "/products/aflamlock",
  "smart fertility enhancer": "/products/mbiowiz-plus",
  "fertility enhancer": "/products/mbiowiz-plus",
  "rumen ecosystem enhancer": "/products/mbiowiz-plus",
  "ecosystem enhancer": "/products/mbiowiz-plus",
  "ultimate aflatoxin binder": "/products/aflamlock",
  "aflatoxin binder": "/products/aflamlock",
  "milk yield enhancer": "/products/choliwiz",
  "milk yield": "/products/choliwiz",
  "rumen bypass choline": "/products/choliwiz",
  "bypass choline": "/products/choliwiz",
  "chelated trace minerals": "/products/minbiozen",
  "trace minerals": "/products/minbiozen",
  "maxdmold spray": "/products/maxdmold-spray",
  "maxdmold-spray": "/products/maxdmold-spray",
  "minbiozen": "/products/minbiozen",
  "ddgs-dtox": "/products/ddgs-dtox",
  "ddgs dtox": "/products/ddgs-dtox",
};

/** Which bot should answer, or null if the classifier fails or is unsure, so the visitor stays where they are. */
async function classifyQuery(message: string, requestId: string): Promise<BotKey | null> {
  try {
    const data = await callOpenAI(
      "chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: ROUTER_PROMPT },
          { role: "user", content: message },
        ],
        max_tokens: 5,
        temperature: 0,
      },
      OPENAI_TIMEOUT_MS.classify
    );
    const raw = String(data?.choices?.[0]?.message?.content ?? "").trim().toLowerCase();
    return raw.includes("mikku") ? "mikku" : raw.includes("kukku") ? "kukku" : null;
  } catch (err) {
    console.warn(`[chat ${requestId}] classifier skipped: ${err instanceof Error ? err.message : String(err)}`);
    return null;
  }
}

async function getEmbedding(text: string): Promise<number[]> {
  const data = await callOpenAI(
    "embeddings",
    { input: [text], model: "text-embedding-3-small" },
    OPENAI_TIMEOUT_MS.embed
  );
  const embedding = data?.data?.[0]?.embedding;
  if (!Array.isArray(embedding)) throw new ChatFailure("unavailable", "OpenAI embeddings returned no vector");
  return embedding;
}

function normalizeUrl(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes("chemlifeinnovations.com")) {
    if (urlLower.includes("chemdmold")) {
      return "/products/feedgenie-forte";
    } else if (urlLower.includes("maxdmol")) {
      return "/products/maxdmold";
    } else if (urlLower.includes("grobiozen")) {
      return "/products/grogenie-12-60";
    } else if (urlLower.includes("feedgenie")) {
      return "/products/feedgenie-prime";
    } else if (urlLower.includes("product_model2")) {
      return "/products/egggenie";
    } else if (urlLower.includes("minbiozen")) {
      return "/products/minbiozen";
    } else if (urlLower.includes("ruminantss.php")) {
      const match = urlLower.match(/id=(\d+)/);
      if (match) {
        const idx = match[1];
        if (idx === "1" || idx === "2") {
          return "/products/mbiowiz-plus";
        } else if (idx === "3") {
          return "/products/aflamlock";
        } else if (idx === "4" || idx === "5") {
          return "/products/choliwiz";
        } else if (idx === "6") {
          return "/products/minbiozen";
        }
      }
    }
    return "/products";
  }
  return url;
}

function cleanTitle(title: string): string {
  const titleLower = title.toLowerCase();
  if (titleLower.includes("chemdmold")) return "FeedGenie Forte";
  if (titleLower.includes("feedgenie-prime") || titleLower.includes("feedgenie prime") || titleLower.includes("feedgenie")) return "FeedGenie Prime";
  if (titleLower.includes("grobiozen") || titleLower.includes("growgenie")) return "GroGenie";
  if (titleLower.includes("minbiozen") || titleLower.includes("chembmin")) return "MinBioZen";
  if (titleLower.includes("ruminantss") || titleLower.includes("fertility")) return "MBioWiz Plus";
  if (titleLower.includes("aflatoxin")) return "AflaMlock";
  if (titleLower.includes("choline") || titleLower.includes("milk yield")) return "CholiWiz";
  return title;
}

function isSourceReferenced(reply: string, title: string, url: string): boolean {
  const replyLower = reply.toLowerCase();
  const titleLower = title.toLowerCase();
  const urlLower = url.toLowerCase();

  if (url && replyLower.includes(urlLower)) return true;
  if (title && replyLower.includes(titleLower)) return true;

  let cleanT = titleLower.replace(/\.pdf$/, "").trim();
  cleanT = cleanT.replace(/[-_]/g, " ");

  if (cleanT && replyLower.includes(cleanT)) return true;

  const words = cleanT.split(/\s+/).filter((w) => w.length > 3);
  if (words.length >= 2) {
    if (words.every((w) => replyLower.includes(w))) return true;
  }
  return false;
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID().slice(0, 8);
  try {
    const { message, bot, history } = await readRequest(request);

    checkRateLimits(clientIp(request));

    if (!isConfigured()) {
      throw new ChatFailure("not_configured", "OPENAI_API_KEY or PINECONE_API_KEY is not set");
    }

    // 1. Router Classification, for the first message only. Follow-ups stay with this bot,
    // which hands over itself with a <redirect> tag when a question belongs to the other one.
    if (history.length === 0) {
      const classifiedBot = await classifyQuery(message, requestId);
      if (classifiedBot && classifiedBot !== bot) {
        return NextResponse.json({
          reply: "",
          sources: [],
          redirect_to: classifiedBot,
        });
      }
    }

    // 2. Embed the query
    const queryVec = await getEmbedding(message);

    // 3. Query Pinecone
    const namespace = bot === "mikku" ? "dairy" : "poultry";
    const queryResponse = await queryKnowledgeBase(queryVec, namespace);

    const chunks: any[] = [];
    const seenTexts = new Set<string>();

    for (const match of queryResponse.matches || []) {
      const meta = match.metadata as any;
      if (!meta) continue;
      const text = meta.text || "";

      // Skip YouTube docs without transcripts
      if (meta.source === "youtube" && !meta.has_transcript) {
        continue;
      }

      // Deduplicate
      const fingerprint = text.slice(0, 200);
      if (seenTexts.has(fingerprint)) continue;
      seenTexts.add(fingerprint);

      chunks.push({
        text,
        title: meta.title || "",
        source: meta.source || "",
        url: meta.url || "",
        score: match.score || 0,
      });
    }

    // 4. Build Context Block
    let contextBlock = "No relevant context found in the knowledge base.";
    if (chunks.length > 0) {
      contextBlock = chunks
        .map((c, i) => {
          let sourceInfo = `[Source: ${c.source} — ${c.title}]`;
          if (c.url) sourceInfo += ` (${c.url})`;
          return `--- Context ${i + 1} ${sourceInfo} ---\n${c.text}`;
        })
        .join("\n\n");
    }

    // 5. Build messages array
    const messages: any[] = [{ role: "system", content: PROMPTS[bot] }];

    // Last 10 turns of history, already checked by readRequest
    messages.push(...history);

    // Current prompt
    const augmentedUserPrompt = `Use the following knowledge-base context to answer the user's question. If the context doesn't contain relevant information, say so.

${contextBlock}

CRITICAL: You MUST strictly format your response using the Response Formatting Guidelines specified in your system prompt. Use the exact bold headers (**Overview**, **Key Benefits**, **Dosage & Usage**, **Next Step** for products; OR **Direct Answer**, **Actionable Tips**, **Chemlife Solution** for general queries).

User question: ${message}`;

    messages.push({ role: "user", content: augmentedUserPrompt });

    // 6. Generate Response
    const chatData = await callOpenAI(
      "chat/completions",
      {
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      },
      OPENAI_TIMEOUT_MS.answer
    );
    let replyText: string = chatData?.choices?.[0]?.message?.content ?? "";
    if (!replyText.trim()) throw new ChatFailure("unavailable", "OpenAI returned an empty answer");

    // 7. Scan and normalize source references
    const sources: any[] = [];
    const seenUrls = new Set<string>();
    const replyLower = replyText.toLowerCase();

    // Check if the reply is a refusal
    const isOffTopic =
      replyLower.includes("i specialise in poultry nutrition") ||
      replyLower.includes("i specialise in dairy nutrition") ||
      replyLower.includes("don't have enough detail");

    if (!isOffTopic) {
      // Chunk sources
      for (const c of chunks) {
        if (!c.url) continue;
        const normUrl = normalizeUrl(c.url);
        if (seenUrls.has(normUrl)) continue;

        if (isSourceReferenced(replyText, c.title, c.url)) {
          sources.push({
            title: cleanTitle(c.title),
            url: normUrl,
          });
          seenUrls.add(normUrl);
        }
      }

      // Scanner for products mentioned in reply text
      for (const [prodName, prodUrl] of Object.entries(PRODUCT_URLS)) {
        if (seenUrls.has(prodUrl)) continue;
        if (replyLower.includes(prodName)) {
          const displayTitle = cleanTitle(prodName.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()));
          sources.push({
            title: displayTitle,
            url: prodUrl,
          });
          seenUrls.add(prodUrl);
        }
      }

      // Fallback
      if (sources.length === 0 && chunks.length > 0) {
        for (const c of chunks.slice(0, 2)) {
          if (c.url && !seenUrls.has(c.url)) {
            const normUrl = normalizeUrl(c.url);
            sources.push({
              title: cleanTitle(c.title),
              url: normUrl,
            });
            seenUrls.add(normUrl);
          }
        }
      }
    }

    // 8. Cross-bot redirects
    let redirectTo: string | undefined;
    const redirectMatch = replyText.match(/<redirect>(mikku|kukku)<\/redirect>/i);
    if (redirectMatch) {
      redirectTo = redirectMatch[1].toLowerCase();
      replyText = replyText.replace(/<redirect>(mikku|kukku)<\/redirect>/gi, "").trim();
    }

    return NextResponse.json({
      reply: replyText,
      sources,
      redirect_to: redirectTo || null,
    });
  } catch (error) {
    const failure =
      error instanceof ChatFailure
        ? error
        : new ChatFailure("internal", error instanceof Error ? error.stack ?? error.message : String(error));
    const status = ERROR_STATUS[failure.code];
    (status < 500 ? console.warn : console.error)(`[chat ${requestId}] ${failure.code}: ${failure.message}`);

    const headers: Record<string, string> = { "X-Request-Id": requestId };
    if (failure.retryAfter) headers["Retry-After"] = String(failure.retryAfter);
    return NextResponse.json({ error: ERROR_TEXT[failure.code], code: failure.code, requestId }, { status, headers });
  }
}
