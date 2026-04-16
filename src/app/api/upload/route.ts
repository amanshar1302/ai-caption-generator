export const dynamic = 'force-dynamic';

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
          
          // Strict 5-second timeout for local/TM classification network request
          const classTimeout = new Promise<ClassificationResult>((_, reject) => 
            setTimeout(() => reject(new Error("TM_TIMEOUT")), 5000)
          );
          
          classification = await Promise.race([
            classifyImage(buffer, modelUrl),
            classTimeout
          ]);
        } catch (cErr: any) {
          console.warn("Classification fallback active due to:", cErr.message);
        }

        // Extract optional User API Keys from headers
        const geminiKey = req.headers.get("x-gemini-key") || undefined;
        const openaiKey = req.headers.get("x-openai-key") || undefined;

        let aiOutput: any;
        let aiError = null;

        try {
          // 2. Multi-Model AI Generation (Gemini -> OpenAI)
          // Implement a strict 15-second timeout to prevent infinite hangs
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error("AI_PROVIDER_TIMEOUT")), 15000)
          );
          
          aiOutput = await Promise.race([
            generateAICaptions(base64Image, classification.category, { geminiKey, openaiKey }),
            timeoutPromise
          ]);
        } catch (err: any) {
          console.warn(`AI Vision failed: ${err.message}. Triggering Smart Simulator.`);
          aiError = err.message.includes("quota") ? "QUOTA_EXCEEDED" : (err.message === "AI_PROVIDER_TIMEOUT" ? "TIMEOUT" : "API_ERROR");
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
          source: aiOutput.source || "System"
        };

        results.push(dataToLog);
      } catch (err: any) {
        console.error(`Error processing ${file.name}:`, err.message);
        results.push({ 
          fileName: file.name, 
          error: "Processing failed", 
          details: err.message,
          descriptive: "Analysis failed. Please check your API keys or try again.",
          creative: "The vision system is currently recalibrating.",
          category: "Error",
          source: "System"
        });
      }
    }

    return NextResponse.json({ results });
  } catch (error: any) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
