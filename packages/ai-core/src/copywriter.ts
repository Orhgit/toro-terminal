import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PropertyDraft } from "@repo/database/schema";
import { isMockMode } from "./mock.js";

// ============================================================
// Schema
// ============================================================

export const MarketingCopy = z.object({
  shortHook: z
    .string()
    .describe("Punchy one-liner in Hebrew for the video/feed overlay — max ~15 words"),
  fullDescription: z
    .string()
    .describe("Full marketing description in persuasive, modern Israeli real estate Hebrew — 3-5 sentences"),
});

export type MarketingCopy = z.infer<typeof MarketingCopy>;

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `You are the lead AI engine for Toro — Israel's fastest AI-driven real estate platform.
Your role: elite Israeli real estate copywriter.

You write compelling Hebrew marketing copy for property listings.
Your audience: young Israeli professionals and families browsing the Toro TikTok-style property feed on their phones.

Style rules:
- shortHook: A single punchy Hebrew sentence. Think billboard — short, bold, emotional. No emojis.
  Good: "פנטהאוז עם נוף שישבור לכם את הלב"
  Bad:  "דירה יפה למכירה בתל אביב"
- fullDescription: 3-5 sentences of persuasive modern Hebrew. Highlight unique selling points.
  Mention specific features (rooms, renovation, parking, views, neighborhood vibe).
  Close with a subtle call-to-action. No emojis. Professional but warm tone.

If vision tags are provided, weave them naturally into the copy (e.g. "sunlit balcony" → "מרפסת שטופת שמש").`;

// ============================================================
// Public API
// ============================================================

export async function generateMarketingCopy(
  propertyData: PropertyDraft,
  visionTags: string[]
): Promise<MarketingCopy> {
  if (isMockMode()) {
    return {
      shortHook: "דירת גן בלב המשתלה — בית פרטי בתוך העיר",
      fullDescription:
        "דירת גן מרהיבה בלב שכונת המשתלה, אחת השכונות המבוקשות בתל אביב. 4 חדרים מרווחים עם גינה פרטית ירוקה, חניה כפולה ומחסן בטאבו. המטבח עוצב עם משטחי קוורץ ואי מרכזי. לרציניים בלבד.",
    };
  }

  const openai = new OpenAI();
  const propertyContext = [
    `Price: ₪${propertyData.price_asked.toLocaleString("he-IL")}`,
    `Status: ${propertyData.status}`,
    `Owner phone: ${propertyData.owner_phone}`,
  ].join("\n");

  const visionContext =
    visionTags.length > 0
      ? `\nVisual features from photos: ${visionTags.join(", ")}`
      : "";

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Write marketing copy for this property:\n\n${propertyContext}${visionContext}`,
      },
    ],
    response_format: zodResponseFormat(MarketingCopy, "marketing_copy"),
  });

  const parsed = response.choices[0]?.message.parsed;

  if (!parsed) {
    const refusal = response.choices[0]?.message.refusal;
    throw new Error(
      refusal
        ? `Copywriter model refused: ${refusal}`
        : "Failed to generate marketing copy — no structured output returned"
    );
  }

  return parsed;
}
