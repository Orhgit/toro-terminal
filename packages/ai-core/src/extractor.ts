import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { PropertyStatus, type PropertyInsert } from "@repo/database/schema";
import { isMockMode } from "./mock.js";

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `You are the lead AI engine for Toro — Israel's fastest AI-driven real estate platform.
Your role: expert Israeli real estate data extractor.

You receive raw WhatsApp messages — mostly in Hebrew, sometimes mixed with English — about properties for sale or rent in Israel.

Your sole task: extract structured property data from the unstructured text.

Field-level instructions:
- owner_phone: The property owner's or agent's phone number.
  Israeli mobile numbers typically start with 05X (local) or +9725X (international).
  Normalise to local format (e.g. 052-1234567). If no phone number is found, return "unknown".
- price_asked: The asking price in ILS (Israeli New Shekel).
  Convert shorthand: "1.5 מיליון" → 1500000, "2.8M" → 2800000, "מיליון" → 1000000.
  If the price is clearly stated in USD or EUR, convert to ILS using a rough 3.6 rate.
  If no price is found, return 0.
- status: Infer from context:
  • "draft"          — default when unclear
  • "active"         — explicitly listed / available
  • "under_contract" — deal in progress, signed, pending
  • "sold"           — sold / closed
  • "archived"       — removed / no longer relevant

Return ONLY the JSON matching the required schema. Do not add commentary.`;

// ============================================================
// Extraction schema — all fields required for Structured Outputs
// ============================================================

const PropertyExtractionSchema = z.object({
  owner_phone: z
    .string()
    .describe("Owner/agent phone number in local Israeli format"),
  price_asked: z.number().describe("Asking price in ILS"),
  status: PropertyStatus.describe("Listing status inferred from context"),
});

// ============================================================
// Public API
// ============================================================

export type PropertyExtraction = z.infer<typeof PropertyExtractionSchema>;

export async function extractPropertyDetails(
  rawMessage: string
): Promise<PropertyInsert> {
  if (isMockMode()) {
    return {
      owner_phone: "052-4567890",
      price_asked: 3_200_000,
      status: "active",
    };
  }

  const openai = new OpenAI();
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: rawMessage },
    ],
    response_format: zodResponseFormat(PropertyExtractionSchema, "property"),
  });

  const parsed = response.choices[0]?.message.parsed;

  if (!parsed) {
    const refusal = response.choices[0]?.message.refusal;
    throw new Error(
      refusal
        ? `Model refused extraction: ${refusal}`
        : "Failed to extract property details — no structured output returned"
    );
  }

  return parsed;
}
