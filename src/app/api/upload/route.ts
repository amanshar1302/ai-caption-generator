import { NextRequest, NextResponse } from "next/server";
import { generateAICaptions, getSimulatedCaptions } from "@/lib/ai-service";
import { classifyImage, ClassificationResult } from "@/lib/tm-service";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const files = formData.getAll("images") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No images provided" }, { status: 400 });
    }

    const results = [];

    for (const file of files) {
      try {
        const buffer = Buffer.from(await file.arrayBuffer());
        const base64Image = buffer.toString('base64');

        // 1. Classification (Direct Service Call)
        let classification: ClassificationResult = { 
          category: "Standard", 
          confidence: "0", 
          heuristics: { orientation: "landscape", brightness: "balanced" } 
        };
        try {
          const modelUrl = process.env.NEXT_PUBLIC_TM_MODEL_URL || "";
          classification = await classifyImage(buffer, modelUrl);
        } catch (cErr: any) {
          console.warn("Classification fallback active.");
        }

        let aiOutput;
        let aiError = null;

        try {
          // 2. Multi-Model AI Generation (Gemini -> OpenAI)
          aiOutput = await generateAICaptions(base64Image, classification.category);
        } catch (err: any) {
          console.warn(`AI Vision failed: ${err.message}. Triggering Smart Simulator.`);
          aiError = err.message.includes("quota") ? "QUOTA_EXCEEDED" : "API_ERROR";
          aiOutput = getSimulatedCaptions(classification, file.name);
        }

        const dataToLog = {
          submitterName: name || "Anonymous",
          fileName: file.name,
          category: classification.category,
          confidence: classification.confidence,
          ...aiOutput,
          aiError,
          timestamp: new Date().toISOString(),
          source: aiOutput.source
        };

        // 3. Async Send to n8n (Background Storage)
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL;
        if (n8nWebhookUrl) {
          fetch(n8nWebhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...dataToLog, image: base64Image })
          }).catch(e => console.warn("n8n Sync failed"));
        }

        results.push(dataToLog);
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err.message);
        results.push({ fileName: file.name, error: "Processing failed", details: err.message });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
