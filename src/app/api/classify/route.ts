import { NextRequest, NextResponse } from "next/server";
import { classifyImage } from "@/lib/tm-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const modelUrl = req.headers.get("x-tm-model-url") || formData.get("modelUrl") as string || process.env.NEXT_PUBLIC_TM_MODEL_URL;

    if (!image) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (!modelUrl) {
      return NextResponse.json({ error: "No model URL provided" }, { status: 400 });
    }

    const buffer = Buffer.from(await image.arrayBuffer());
    const result = await classifyImage(buffer, modelUrl);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Classification error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
