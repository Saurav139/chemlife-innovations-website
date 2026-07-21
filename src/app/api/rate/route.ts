import { NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";

const FILE_PATH = path.join(process.cwd(), "ratings.json");

interface RatingEntry {
  rating: number;
  comment?: string;
  timestamp: string;
}

async function getRatings(): Promise<RatingEntry[]> {
  try {
    const data = await fs.readFile(FILE_PATH, "utf8");
    return JSON.parse(data);
  } catch (e) {
    // If file doesn't exist, return empty array
    return [];
  }
}

async function saveRatings(ratings: RatingEntry[]): Promise<void> {
  await fs.writeFile(FILE_PATH, JSON.stringify(ratings, null, 2), "utf8");
}

export async function GET() {
  try {
    const entries = await getRatings();
    const count = entries.length;
    
    let average = 0;
    if (count > 0) {
      const sum = entries.reduce((acc, curr) => acc + curr.rating, 0);
      average = Number((sum / count).toFixed(1));
    }

    return NextResponse.json({
      success: true,
      stats: {
        count,
        average,
      },
      ratings: entries,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { rating, comment } = body;

    if (typeof rating !== "number" || rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: "Rating must be a number between 1 and 5." },
        { status: 400 }
      );
    }

    const newEntry: RatingEntry = {
      rating,
      comment: typeof comment === "string" ? comment.trim() : "",
      timestamp: new Date().toISOString(),
    };

    const entries = await getRatings();
    entries.unshift(newEntry); // Newest ratings first
    await saveRatings(entries);

    return NextResponse.json({ success: true, entry: newEntry });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
