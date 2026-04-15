import { NextRequest, NextResponse } from "next/server";
import { updateFeedback } from "@/lib/sheets-service";

export async function POST(req: NextRequest) {
  try {
    const { fileName, rating, feedback } = await req.json();

    if (!fileName || rating === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    await updateFeedback(fileName, rating, feedback);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Feedback error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
