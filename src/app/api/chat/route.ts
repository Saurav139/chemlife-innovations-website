import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { PROMPTS } from "./prompts";

// Configure Pinecone Client
let pcClient: Pinecone | null = null;
function getPineconeIndex() {
  if (!pcClient) {
    pcClient = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY || "",
    });
  }
  return pcClient.index("chemlife-knowledge");
}

const ROUTER_PROMPT = `You are a query classifier. Classify the following query as either 'kukku' (poultry-related: chickens, broilers, layers, eggs, hens, feed, poultry diseases, chicks, swine, pigs) or 'mikku' (dairy-related: cows, buffaloes, milk, rumen, dairy, calves, lactation, fertility in cattle, silages). Return ONLY the single word 'kukku' or 'mikku' with no punctuation or explanation.`;

const PRODUCT_URLS: Record<string, string> = {
  "maxdmold plus": "/products?expand=MaxDmold+Plus",
  "maxdmold-plus": "/products?expand=MaxDmold+Plus",
  "maxdmold": "/products?expand=MaxDmold",
  "feedgenie forte": "/products?expand=FeedGenie+Forte",
  "feedgenie-forte": "/products?expand=FeedGenie+Forte",
  "chemdmold": "/products?expand=FeedGenie+Forte",
  "feedgenie prime": "/products?expand=FeedGenie+Prime",
  "feedgenie-prime": "/products?expand=FeedGenie+Prime",
  "feedgenie": "/products?expand=FeedGenie+Prime",
  "growgenie-phyto": "/products?expand=GroGenie",
  "growgenie": "/products?expand=GroGenie",
  "grobiozen": "/products?expand=GroGenie",
  "grogenie": "/products?expand=GroGenie",
  "egggenie": "/products?expand=EggGenie",
  "livprogenie": "/products?expand=LivproGenie",
  "gutprogenie": "/products?expand=GutproGenie",
  "syndmold": "/products?expand=SynDmold",
  "methiowiz": "/products?expand=MethioWiz",
  "mbiowiz plus": "/products?expand=MBioWiz+Plus",
  "mbiowiz-plus": "/products?expand=MBioWiz+Plus",
  "mbiowiz ts": "/products?expand=MBioWiz+TS",
  "mbiowiz-ts": "/products?expand=MBioWiz+TS",
  "choliwiz": "/products?expand=CholiWiz",
  "rumiwiz": "/products?expand=RumiWiz",
  "aflamlock": "/products?expand=AflaMlock",
  "smart fertility enhancer": "/products?expand=MBioWiz+Plus",
  "fertility enhancer": "/products?expand=MBioWiz+Plus",
  "rumen ecosystem enhancer": "/products?expand=MBioWiz+Plus",
  "ecosystem enhancer": "/products?expand=MBioWiz+Plus",
  "ultimate aflatoxin binder": "/products?expand=AflaMlock",
  "aflatoxin binder": "/products?expand=AflaMlock",
  "milk yield enhancer": "/products?expand=CholiWiz",
  "milk yield": "/products?expand=CholiWiz",
  "rumen bypass choline": "/products?expand=CholiWiz",
  "bypass choline": "/products?expand=CholiWiz",
  "chelated trace minerals": "/products?expand=MinBioZen",
  "trace minerals": "/products?expand=MinBioZen",
  "maxdmold spray": "/products?expand=MaxDmold+Spray",
  "maxdmold-spray": "/products?expand=MaxDmold+Spray",
  "minbiozen": "/products?expand=MinBioZen",
  "ddgs-dtox": "/products?expand=DDGS-Dtox",
  "ddgs dtox": "/products?expand=DDGS-Dtox",
};

async function classifyQuery(message: string): Promise<"kukku" | "mikku"> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const resp = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: ROUTER_PROMPT },
        { role: "user", content: message },
      ],
      max_tokens: 5,
      temperature: 0,
    }),
  });

  if (!resp.ok) return "kukku"; // Fallback to poultry
  const data = await resp.json();
  const raw = data.choices[0].message.content.trim().toLowerCase();
  return raw.includes("mikku") ? "mikku" : "kukku";
}

async function getEmbedding(text: string): Promise<number[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

  const resp = await fetch("https://api.openai.com/v1/embeddings", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      input: [text],
      model: "text-embedding-3-small",
    }),
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    throw new Error(`OpenAI Embedding error: ${resp.status} - ${errorText}`);
  }

  const data = await resp.json();
  return data.data[0].embedding;
}

function normalizeUrl(url: string): string {
  const urlLower = url.toLowerCase();
  if (urlLower.includes("chemlifeinnovations.com")) {
    if (urlLower.includes("chemdmold")) {
      return "/products?expand=FeedGenie+Forte";
    } else if (urlLower.includes("maxdmol")) {
      return "/products?expand=MaxDmold";
    } else if (urlLower.includes("grobiozen")) {
      return "/products?expand=GroGenie";
    } else if (urlLower.includes("feedgenie")) {
      return "/products?expand=FeedGenie+Prime";
    } else if (urlLower.includes("product_model2")) {
      return "/products?expand=EggGenie";
    } else if (urlLower.includes("minbiozen")) {
      return "/products?expand=MinBioZen";
    } else if (urlLower.includes("ruminantss.php")) {
      const match = urlLower.match(/id=(\d+)/);
      if (match) {
        const idx = match[1];
        if (idx === "1" || idx === "2") {
          return "/products?expand=MBioWiz+Plus";
        } else if (idx === "3") {
          return "/products?expand=AflaMlock";
        } else if (idx === "4" || idx === "5") {
          return "/products?expand=CholiWiz";
        } else if (idx === "6") {
          return "/products?expand=MinBioZen";
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
  try {
    const { message, bot, history } = await request.json();

    if (!message || !bot) {
      return NextResponse.json({ error: "Missing message or bot" }, { status: 400 });
    }

    // 1. Router Classification
    const classifiedBot = await classifyQuery(message);
    if (classifiedBot !== bot) {
      return NextResponse.json({
        reply: "",
        sources: [],
        redirect_to: classifiedBot,
      });
    }

    // 2. Embed the query
    const queryVec = await getEmbedding(message);

    // 3. Query Pinecone
    const namespace = bot === "mikku" ? "dairy" : "poultry";
    const index = getPineconeIndex();
    const queryResponse = await index.query({
      vector: queryVec,
      namespace,
      topK: 8,
      includeMetadata: true,
    });

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
    const systemPrompt = PROMPTS[bot as "kukku" | "mikku"] || PROMPTS.kukku;
    const messages: any[] = [{ role: "system", content: systemPrompt }];

    // Include last 10 turns of history
    const historySlice = (history || []).slice(-10);
    for (const turn of historySlice) {
      if ((turn.role === "user" || turn.role === "assistant") && turn.content) {
        messages.push({ role: turn.role, content: turn.content });
      }
    }

    // Current prompt
    const augmentedUserPrompt = `Use the following knowledge-base context to answer the user's question. If the context doesn't contain relevant information, say so.

${contextBlock}

CRITICAL: You MUST strictly format your response using the Response Formatting Guidelines specified in your system prompt. Use the exact bold headers (**Overview**, **Key Benefits**, **Dosage & Usage**, **Next Step** for products; OR **Direct Answer**, **Actionable Tips**, **Chemlife Solution** for general queries).

User question: ${message}`;

    messages.push({ role: "user", content: augmentedUserPrompt });

    // 6. Generate Response
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) throw new Error("Missing OPENAI_API_KEY");

    const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    });

    if (!chatResponse.ok) {
      const errorText = await chatResponse.text();
      throw new Error(`OpenAI Chat completion error: ${chatResponse.status} - ${errorText}`);
    }

    const chatData = await chatResponse.json();
    let replyText = chatData.choices[0].message.content || "";

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
  } catch (error: any) {
    console.error("Chat API endpoint error:", error);
    return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 });
  }
}
