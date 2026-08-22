import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const bot = searchParams.get("bot") || "kukku";
    const nStr = searchParams.get("n") || "3";
    const n = parseInt(nStr, 10);

    const filename = bot === "mikku" ? "educational_faqs_dairy.json" : "educational_faqs_poultry.json";
    const filePath = path.join(process.cwd(), "chatbot-backend", "data", "faqs", filename);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ questions: [] });
    }

    const raw = fs.readFileSync(filePath, "utf-8");
    const data = JSON.parse(raw);

    const questions: string[] = [];
    for (const section of data.sections || []) {
      for (const qa of section.qas || []) {
        const q = qa.q?.trim();
        const a = qa.a?.trim();
        if (q && a) {
          questions.push(q);
        }
      }
    }

    // Shuffle questions
    const shuffled = questions.sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, n);

    return NextResponse.json({ questions: selected });
  } catch (error) {
    console.error("FAQs API error:", error);
    return NextResponse.json({ questions: [] });
  }
}
