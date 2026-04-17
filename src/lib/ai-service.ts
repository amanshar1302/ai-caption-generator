import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

import { APP_CONFIG } from "./config";

export interface AIOutput {
  descriptive: string;
  creative: string;
  accessibility: string;
  tags: string[];
  source: string;
}

const CAPTION_PROMPT = (category: string) => `
You are a professional content writer and image analyst. Analyze the provided image carefully and return ONLY a valid JSON object — no markdown, no code fences, no extra text.

Category hint: ${category}

Your task:
1. "descriptive": Write a detailed, factual description of what is LITERALLY visible in this specific image (colors, objects, people, setting, actions, mood). Be concrete and specific — mention exact details unique to THIS image. Avoid vague filler. 2-3 sentences.
2. "creative": Write a vivid, imaginative, engaging caption for social media. Make it emotionally resonant and distinctive — NOT generic travel/food/lifestyle clichés. It must feel tailored to what makes THIS image unique. 1-2 punchy sentences. Vary your sentence structure and opening word from any previous response.
3. "accessibility": Write a clear, concise alt-text description for visually impaired users. Start with the most important element. 1 sentence.
4. "tags": Generate 5–8 highly relevant lowercase hashtag-style tags specific to THIS image content. No generic tags like "photo" or "image".

IMPORTANT: Every response must be fresh and distinct. Do not repeat phrases, sentence structures, or themes across images. Be specific to what you observe.

Return format (and nothing else):
{"descriptive": "...", "creative": "...", "accessibility": "...", "tags": ["tag1", "tag2", "tag3"]}
`.trim();

/**
 * Detect the MIME type of an image from its base64-encoded bytes.
 * Falls back to image/jpeg if unknown.
 */
function detectMimeType(base64: string): string {
  const header = base64.substring(0, 16);
  const bytes = Buffer.from(header, 'base64');
  if (bytes[0] === 0x89 && bytes[1] === 0x50) return "image/png";
  if (bytes[0] === 0x47 && bytes[1] === 0x49) return "image/gif";
  if (bytes[0] === 0x52 && bytes[8] === 0x57) return "image/webp";
  return "image/jpeg"; // default
}

export async function generateAICaptions(
  base64Image: string, 
  category: string,
  overrides?: { geminiKey?: string, openaiKey?: string }
): Promise<AIOutput> {
  // Priority 1: Server-side environment variables (Supreme priority for security/stability)
  // Priority 2: Client-side overrides (only if server env is missing)
  // Priority 3: Baked-in config fallback
  
  const envOpenAI = process.env.OPENAI_API_KEY;
  const envGemini = process.env.GEMINI_API_KEY;

  const openaiKey = (envOpenAI && envOpenAI.trim() !== "")
    ? envOpenAI
    : ((overrides?.openaiKey && overrides.openaiKey.trim() !== "") ? overrides.openaiKey : APP_CONFIG.OPENAI_API_KEY);

  const geminiKey = (envGemini && envGemini.trim() !== "")
    ? envGemini
    : ((overrides?.geminiKey && overrides.geminiKey.trim() !== "") ? overrides.geminiKey : APP_CONFIG.GEMINI_API_KEY);

  // Masked logging for debugging (only showing prefix/suffix)
  const mask = (key?: string) => key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : "MISSING";
  console.log(`[AI-Pipeline] Using OpenAI Key: ${mask(openaiKey)}`);
  console.log(`[AI-Pipeline] Using Gemini Key: ${mask(geminiKey)}`);

  const prompt = CAPTION_PROMPT(category);
  const mimeType = detectMimeType(base64Image);

  // 1. Try Google Gemini
  // Only attempt if the key looks valid (Google AI Studio keys start with "AIza")
  const isValidGeminiKey = geminiKey && geminiKey.startsWith("AIza");
  if (isValidGeminiKey) {
    const dynamicGenAI = new GoogleGenerativeAI(geminiKey!);
    // gemini-pro-vision is deprecated — only try current models
    const modelsToTry = ["gemini-1.5-flash", "gemini-1.5-pro"];

    for (const modelName of modelsToTry) {
      try {
        const model = dynamicGenAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 1.2, topP: 0.95 }
        });

        // 6-second per-model timeout so failures are fast
        const modelTimeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("MODEL_TIMEOUT")), 6000)
        );

        const result = await Promise.race([
          model.generateContent([
            prompt,
            { inlineData: { data: base64Image, mimeType } }
          ]),
          modelTimeout
        ]);

        const text = result.response.text();
        const cleanJson = text.replace(/```json|```/gi, "").trim();
        const aiOutput = JSON.parse(cleanJson);
        return { ...aiOutput, source: `gemini (${modelName})` };
      } catch (err: any) {
        console.warn(`Gemini Warning: Model ${modelName} failed -`, err.message);
      }
    }
  } else if (geminiKey) {
    console.warn("Gemini key format invalid (must start with 'AIza'). Skipping Gemini.");
  }

  // 2. Try OpenAI GPT-4o Vision
  if (openaiKey) {
    try {
      const dynamicOpenAI = new OpenAI({ apiKey: openaiKey });
      
      // 30-second timeout for OpenAI call (Vision can be slow)
      const openaiTimeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("OPENAI_TIMEOUT")), 30000)
      );

      const chatCompletion = await Promise.race([
        dynamicOpenAI.chat.completions.create({
          model: "gpt-4o",
          temperature: 1.1,
          messages: [
            {
              role: "user",
              content: [
                { type: "text", text: prompt },
                { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64Image}`, detail: "auto" } },
              ],
            },
          ],
          response_format: { type: "json_object" },
        }),
        openaiTimeout
      ]);

      const aiOutput = JSON.parse(chatCompletion.choices[0].message.content || "{}");
      return { ...aiOutput, source: "openai-vision" };
    } catch (err: any) {
      console.warn("OpenAI Vision failed...", err.message);
      
      // Categorize the error for the route handler
      if (err.message.includes("quota") || err.status === 429) {
        throw new Error("QUOTA_EXCEEDED");
      }
      if (err.message.includes("API key") || err.status === 401) {
        throw new Error("INVALID_KEY");
      }
      if (err.message === "OPENAI_TIMEOUT") throw err;
      
      throw new Error(`OPENAI_ERROR: ${err.message}`);
    }
  }

  throw new Error("All AI Vision providers failed or are unconfigured.");
}

// Fallback logic for Simulator in case of complete AI failure
export function getSimulatedCaptions(classification: any, fileName: string): AIOutput {
  const { category, heuristics } = classification;
  const { orientation, brightness } = heuristics || {};

  // Use a seed based on fileName + timestamp for per-image variety
  const seed = fileName.split('').reduce((a, c) => a + c.charCodeAt(0), 0) + Date.now() % 997;
  const pick = <T>(arr: T[]) => arr[(seed + arr.length) % arr.length];

  const orientationDesc = orientation === "portrait"
    ? pick(["elegant vertical frame", "tall portrait composition", "upright close-up framing"])
    : orientation === "landscape"
      ? pick(["sweeping panoramic vista", "wide cinematic frame", "expansive horizontal view"])
      : pick(["perfectly balanced square composition", "centered square crop", "symmetrical format"]);

  const lightingDesc = brightness === "dark"
    ? pick(["moody dramatic shadows", "deep low-key tones", "rich chiaroscuro contrast"])
    : brightness === "light"
      ? pick(["ethereal high-key illumination", "airy overexposed glow", "clean bright daylight"])
      : pick(["vibrant natural light", "balanced golden-hour tones", "soft diffused midday light"]);

  const creativePool = [
    `The kind of moment that stops scrolling cold — raw, real, and entirely its own.`,
    `Not every frame needs explanation. This one speaks for itself.`,
    `Light, shadow, and something quietly extraordinary.`,
    `Details others walk past. You stopped. Good call.`,
    `This is what ${lightingDesc} does to an ordinary scene — turns it into something else entirely.`,
    `Framed in ${orientationDesc}, this image holds more than meets the eye.`,
    `A visual pause in an otherwise fast-moving world.`,
    `Some images are felt before they are understood.`,
  ];

  const randomCreative = creativePool[(seed * 3 + 7) % creativePool.length];

  const categoryData: Record<string, any> = {
    "Landscape": {
      descriptive: pick([
        `An expansive ${orientationDesc} of a natural landscape rendered in ${lightingDesc}, with visible depth and texture across the terrain.`,
        `A wide ${orientationDesc} view capturing the interplay of land and sky under ${lightingDesc}.`,
        `This ${orientationDesc} landscape scene features layered natural forms illuminated by ${lightingDesc}.`,
      ]),
      creative: pick([
        `The horizon doesn't end here — it opens. ${randomCreative}`,
        `Earth, sky, and that peculiar silence in between. ${randomCreative}`,
        `Not a backdrop. A place that existed long before the lens arrived. ${randomCreative}`,
      ]),
      tags: ["landscape", orientation, "scenic", "horizon", "outdoors", "nature"]
    },
    "Food": {
      descriptive: pick([
        `A close-up food shot emphasizing texture, color, and plating detail under ${lightingDesc}.`,
        `The dish is composed with deliberate visual intent — textures and garnishes visible in ${lightingDesc}.`,
        `Food photography captured in ${orientationDesc} with ${lightingDesc}, showcasing culinary craft.`,
      ]),
      creative: pick([
        `Before the first bite, there's this. ${randomCreative}`,
        `Plated with intention, eaten with abandon. ${randomCreative}`,
        `The kind of food that makes you forget you were on a diet. ${randomCreative}`,
      ]),
      tags: ["food", "culinary", "plating", brightness, "gastronomy", "mealtime"]
    },
    "People": {
      descriptive: pick([
        `A ${orientationDesc} portrait capturing a human subject with visible emotion, framed under ${lightingDesc}.`,
        `The subject is photographed in ${orientationDesc} with ${lightingDesc} highlighting facial features and expression.`,
        `A candid or posed human moment rendered in ${orientationDesc} and ${lightingDesc}.`,
      ]),
      creative: pick([
        `Behind the eyes — a whole story the camera almost caught. ${randomCreative}`,
        `The kind of portrait you come back to. ${randomCreative}`,
        `Real people. Real light. Real moments. ${randomCreative}`,
      ]),
      tags: ["portrait", "people", "emotion", "candid", "human", orientation]
    }
  };

  const selected = categoryData[category] || {
    descriptive: `A ${orientationDesc} image with ${lightingDesc}, showcasing distinctive visual elements and composition.`,
    creative: randomCreative,
    tags: ["visual", orientation, brightness, category?.toLowerCase() || "abstract", "photography"]
  };

  return {
    ...selected,
    accessibility: `A ${orientationDesc} image with ${lightingDesc} showing ${category === "Standard" ? "abstract" : (category?.toLowerCase() || 'abstract')} elements.`,
    source: 'web (smart-simulator)'
  };
}
