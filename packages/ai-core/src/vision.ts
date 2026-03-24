import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { isMockMode } from "./mock.js";

// ============================================================
// Schema
// ============================================================

export const VisualDna = z.object({
  style: z
    .string()
    .describe("Architectural style: Modern, Industrial, Vintage, Minimalist, Mediterranean, Bauhaus, etc."),
  strengths: z
    .array(z.string())
    .describe("Top 3 visual selling points, e.g. 'Natural light', 'High ceilings', 'Parquet floors'"),
  vibe: z
    .string()
    .describe("Emotional feeling: 'Family cozy', 'Bachelor pad', 'Executive suite', 'Bohemian retreat', etc."),
});

export type VisualDna = z.infer<typeof VisualDna>;

export const VisionAnalysis = z.object({
  qualityScore: z
    .number()
    .int()
    .min(1)
    .max(10)
    .describe("Overall property photo quality from 1 (poor) to 10 (stunning)"),
  roomTags: z
    .array(z.string())
    .describe("Descriptive tags for rooms and features visible in the images"),
  visualDna: VisualDna.describe("The Visual DNA profile of this property"),
});

export type VisionAnalysis = z.infer<typeof VisionAnalysis>;

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `You are the lead AI engine for Toro — Israel's fastest AI-driven real estate platform.
Your role: expert Israeli real estate photo analyst and visual profiler.

You receive one or more images of a property listing. Analyze them and return:

1. qualityScore (1-10): Judge overall photo quality, staging, lighting, and appeal.
2. roomTags: Short descriptive English tags for every room/feature you can identify.
3. visualDna: The property's "Visual DNA":
   - style: The architectural/interior design style (Modern, Industrial, Vintage, Minimalist, Mediterranean, Bauhaus, etc.)
   - strengths: Exactly 3 top visual selling points (e.g. "Natural light", "Parquet floors", "High ceilings")
   - vibe: The emotional feeling a buyer would experience (e.g. "Family cozy", "Bachelor pad", "Executive suite", "Bohemian retreat")

Be specific and honest. Return at least one roomTag per image.`;

// ============================================================
// Mock data
// ============================================================

const MOCK_RESULTS: VisionAnalysis[] = [
  {
    qualityScore: 8,
    roomTags: ["renovated kitchen", "private garden", "marble flooring", "spacious living room", "modern bathroom"],
    visualDna: { style: "Modern Mediterranean", strengths: ["Natural light", "Indoor-outdoor flow", "Premium finishes"], vibe: "Family cozy" },
  },
  {
    qualityScore: 9,
    roomTags: ["sea view", "rooftop terrace", "floor-to-ceiling windows", "chef kitchen", "private elevator", "master suite"],
    visualDna: { style: "Contemporary Luxury", strengths: ["Panoramic sea view", "High ceilings", "Designer lighting"], vibe: "Executive suite" },
  },
  {
    qualityScore: 7,
    roomTags: ["modern design", "partial sea view", "sunlit balcony", "covered parking", "open plan kitchen"],
    visualDna: { style: "Minimalist", strengths: ["Clean lines", "Natural materials", "Sunlit spaces"], vibe: "Young professional" },
  },
];

let mockIndex = 0;

// ============================================================
// Public API
// ============================================================

export async function analyzePropertyImages(
  imageUrls: string[]
): Promise<VisionAnalysis> {
  if (isMockMode()) {
    const result = MOCK_RESULTS[mockIndex % MOCK_RESULTS.length]!;
    mockIndex++;
    return result;
  }

  const openai = new OpenAI();
  const imageContent: OpenAI.Chat.Completions.ChatCompletionContentPart[] =
    imageUrls.map((url) => ({
      type: "image_url" as const,
      image_url: { url, detail: "low" as const },
    }));

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: [
          { type: "text", text: "Analyze these property images:" },
          ...imageContent,
        ],
      },
    ],
    response_format: zodResponseFormat(VisionAnalysis, "vision_analysis"),
  });

  const parsed = response.choices[0]?.message.parsed;

  if (!parsed) {
    const refusal = response.choices[0]?.message.refusal;
    throw new Error(
      refusal
        ? `Vision model refused: ${refusal}`
        : "Failed to analyze property images — no structured output returned"
    );
  }

  return parsed;
}
