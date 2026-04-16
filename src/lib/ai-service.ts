import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export interface AIOutput {
  descriptive: string;
  creative: string;
  accessibility: string;
  tags: string[];
  source: string;
}

export async function generateAICaptions(
  base64Image: string, 
  category: string,
  overrides?: { geminiKey?: string; openaiKey?: string }
): Promise<AIOutput> {
  const geminiKey = overrides?.geminiKey || process.env.GEMINI_API_KEY;
  const openaiKey = overrides?.openaiKey || process.env.OPENAI_API_KEY;

  // 1. Try Google Gemini (High Quality / Often Free)
  if (geminiKey) {
    try {
      const dynamicGenAI = new GoogleGenerativeAI(geminiKey);
      const model = dynamicGenAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const prompt = `Analyze this image. Category: ${category}. Return JSON ONLY: {"descriptive": "factual description", "creative": "engaging story", "accessibility": "alt text", "tags": ["tag1", "tag2"]}`;
      
      const result = await model.generateContent([
        prompt,
        {
          inlineData: {
            data: base64Image,
            mimeType: "image/jpeg"
          }
        }
      ]);
      
      const text = result.response.text();
      // Clean up markdown code blocks if present
      const cleanJson = text.replace(/```json|```/gi, "").trim();
      const aiOutput = JSON.parse(cleanJson);
      
      return { ...aiOutput, source: overrides?.geminiKey ? "gemini-user-key" : "gemini-vision" };
    } catch (err: any) {
      console.warn("Gemini Vision failed, trying OpenAI...", err.message);
    }
  }

  // 2. Try OpenAI (Primary)
  if (openaiKey) {
    try {
      const dynamicOpenAI = new OpenAI({ apiKey: openaiKey });
      const chatCompletion = await dynamicOpenAI.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              { 
                type: "text", 
                text: `Analyze this image. Category: ${category}. Return JSON: {"descriptive": "...", "creative": "...", "accessibility": "...", "tags": ["tag1", "tag2"]}` 
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        response_format: { type: "json_object" },
      });

      const aiOutput = JSON.parse(chatCompletion.choices[0].message.content || "{}");
      return { ...aiOutput, source: overrides?.openaiKey ? "openai-user-key" : "openai-vision" };
    } catch (err: any) {
      console.warn("OpenAI Vision failed...", err.message);
      if (err.status !== 429) {
        throw err; // Re-throw if it's not a quota error
      }
    }
  }

  throw new Error("All AI Vision providers failed or are unconfigured.");
}

// Fallback logic for Simulator in case of complete AI failure
export function getSimulatedCaptions(classification: any, fileName: string): AIOutput {
  const { category, heuristics } = classification;
  const { orientation, brightness } = heuristics || {};

  const orientationDesc = orientation === "portrait" ? "elegant vertical composition" : (orientation === "landscape" ? "expansive panoramic view" : "balanced square frame");
  const lightingDesc = brightness === "dark" ? "moody, low-light atmosphere" : (brightness === "light" ? "bright, high-key lighting" : "naturallly balanced illumination");

  const sims: Record<string, any> = {
    "Landscape": {
      descriptive: `An ${orientationDesc} of a serene landscape under ${lightingDesc}.`,
      creative: "A moment where time stands still in the heart of the wild.",
      tags: ["landscape", orientation, brightness, "scenic"]
    },
    // ... same as before but encapsulated here
  };

  const selected = sims[category] || {
    descriptive: `A ${orientationDesc} capturing unique visual patterns and ${lightingDesc}.`,
    creative: "Innovation met with vision to create this striking visual impact.",
    tags: ["general", orientation, brightness, "composition"]
  };

  return { 
    ...selected, 
    accessibility: `A ${orientationDesc} image with ${lightingDesc} showing ${category.toLowerCase()} elements.`,
    source: 'web (simulator-fallback)' 
  };
}
