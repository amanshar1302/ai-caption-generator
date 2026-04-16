export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getImages } from "@/lib/sheets-service";

export async function GET() {
  try {
    const images = await getImages();
    return NextResponse.json(images);
  } catch (error: any) {
    console.error("Fetch error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
