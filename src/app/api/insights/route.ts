import { after, NextResponse } from "next/server";
import { getInsights } from "@/lib/insights";
import { syncIfDue } from "@/lib/insights-store/auto-sync";

export const maxDuration = 60;

export async function GET() {
  after(() => syncIfDue());
  return NextResponse.json(await getInsights());
}
