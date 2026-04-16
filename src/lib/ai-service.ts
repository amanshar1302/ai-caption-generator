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

export async function generateAICaptions(
  base64Image: string, 
  category: string,
  overrides?: { geminiKey?: string, openaiKey?: string }
): Promise<AIOutput> {
  const geminiKey = APP_CONFIG.GEMINI_API_KEY || overrides?.geminiKey || process.env.GEMINI_API_KEY;
  const openaiKey = APP_CONFIG.OPENAI_API_KEY || overrides?.openaiKey || process.env.OPENAI_API_KEY;

  // 1. Try Google Gemini (High Quality / Often Free)
  if (geminiKey) {
    const dynamicGenAI = new GoogleGenerativeAI(geminiKey);
    const modelsToTry = ["gemini-1.5-pro", "gemini-1.5-flash", "gemini-pro-vision"];
    const prompt = `Analyze this image. Category: ${category}. Return JSON ONLY: {"descriptive": "factual description", "creative": "engaging story", "accessibility": "alt text", "tags": ["tag1", "tag2"]}`;

    for (const modelName of modelsToTry) {
      try {
        const model = dynamicGenAI.getGenerativeModel({ model: modelName });
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
        
        return { ...aiOutput, source: `gemini (${modelName})` };
      } catch (err: any) {
        console.warn(`Gemini Warning: Model ${modelName} failed -`, err.message);
        // Continue to the next model in the array
      }
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
      return { ...aiOutput, source: "openai-vision" };
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

  const orientationDesc = orientation === "portrait" ? "elegant vertical frame" : (orientation === "landscape" ? "sweeping panoramic vista" : "perfectly balanced square composition");
  const lightingDesc = brightness === "dark" ? "moody and dramatic shadows" : (brightness === "light" ? "ethereal, high-key illumination" : "vibrant natural light");

  const creativeVariations = [
    `A fleeting whisper of time, captured forever within this ${orientationDesc}.`,
    `Shadows and light dance together, creating a visual symphony of ${lightingDesc}.`,
    `Beyond the lens lies a story untold, framed by an ${orientationDesc}.`,
    `Breathing life into the stillness, this shot explores the profound depths of ${category}.`,
    `An evocative juxtaposition of form and feeling, elevated by ${lightingDesc}.`
  ];

  const randomCreative = creativeVariations[Math.floor(Math.random() * creativeVariations.length)];

  const sims: Record<string, any> = {
    "Landscape": {
      descriptive: `An expansive and breathtaking ${orientationDesc} featuring a lush landscape, enhanced by ${lightingDesc}.`,
      creative: `Where the earth meets the sky in a timeless embrace. ${randomCreative}`,
      tags: ["landscape", orientation, "scenic", "horizon"]
    },
    "Food": {
      descriptive: `A delectable close-up shot emphasizing texture and plating, captured in ${lightingDesc}.`,
      creative: `A culinary masterpiece that tantalizes the senses. ${randomCreative}`,
      tags: ["food", "culinary", "appetizing", brightness]
    },
    "People": {
      descriptive: `A striking portrait framed as an ${orientationDesc}, highlighting human emotion and expression.`,
      creative: `A soul laid bare before the camera, frozen in a moment of pure authenticity. ${randomCreative}`,
      tags: ["portrait", "human", "emotion", "candid"]
    }
  };

  const selected = sims[category] || {
    descriptive: `A stunning ${orientationDesc} capturing unique visual patterns, illuminated by ${lightingDesc}.`,
    creative: randomCreative,
    tags: ["creative", "visual", orientation, brightness, category === "Standard" ? "abstract" : (category || "abstract")]
  };

  return { 
    ...selected, 
    accessibility: `A ${orientationDesc} image with ${lightingDesc} showing ${category === "Standard" ? "abstract" : (category?.toLowerCase() || 'abstract')} elements.`,
    source: 'web (smart-simulator)' 
  };
}
