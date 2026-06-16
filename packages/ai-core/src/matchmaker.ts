import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PropertyDraft, Lead } from "@repo/database/schema";
import type { VisionAnalysis } from "./vision.js";
import type { MarketingCopy } from "./copywriter.js";
import { isMockMode } from "./mock.js";

// ============================================================
// Schema
// ============================================================

export const LeadMatch = z.object({
  leadId: z.string().describe("The lead's UUID"),
  score: z.number().int().min(0).max(100).describe("Match score 0-100"),
  reasoning: z.string().describe("Short explanation of why this lead matches"),
  whatsappHook: z
    .string()
    .describe("Personalized Hebrew WhatsApp message to send this lead"),
});

export type LeadMatch = z.infer<typeof LeadMatch>;

export const MatchResult = z.object({
  matches: z.array(LeadMatch).describe("Scored matches, highest first"),
});

export type MatchResult = z.infer<typeof MatchResult>;

// ============================================================
// Input type
// ============================================================

export interface MatchInput {
  property: PropertyDraft;
  city: string;
  vision: VisionAnalysis | null;
  copy: MarketingCopy;
}

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `You are the lead AI engine for Toro — Israel's fastest AI-driven real estate platform.
Your role: smart property-to-buyer matchmaker.

You receive a property listing (with AI-enriched data) and a list of potential buyer leads.
Score each lead 0-100 based on how well the property fits their requirements.

Scoring criteria (weighted):
- Budget fit (35%): Is the property price within the lead's budget_max? Closer to budget = higher score. Over budget by >20% = strong penalty.
- City match (25%): Does the property city match the lead's preferred city? Same city = full points. Nearby city = partial.
- Room count (15%): Does the property meet the lead's min_rooms requirement?
- Style & needs match (25%): Does the property's visual style, vibe, or features align with the lead's specific_needs text?

For leads scoring > 80, generate a compelling personalized WhatsApp message in Hebrew:
"היי [שם], מצאתי לך בטורו [תיאור קצר של הנכס] ב[עיר] שמתאימה בול ל[צורך ספציפי שלהם]..."

For leads scoring <= 80, still generate a shorter, less aggressive message.

Return matches sorted by score (highest first).`;

// ============================================================
// Mock scoring heuristic
// ============================================================

function mockScore(property: PropertyDraft, city: string, lead: Lead): number {
  let score = 50;

  // Budget fit
  if (property.price_asked <= lead.budget_max) {
    score += 25;
    if (property.price_asked >= lead.budget_max * 0.7) score += 10; // sweet spot
  } else if (property.price_asked <= lead.budget_max * 1.1) {
    score += 10; // slightly over
  } else {
    score -= 20;
  }

  // City match
  if (city === lead.city_preferred) score += 25;

  // We don't have rooms in PropertyDraft, so skip room scoring in mock

  return Math.max(0, Math.min(100, score));
}

const MOCK_HOOKS: Record<string, string> = {
  high: "היי {name}, מצאתי לך בטורו נכס מדהים ב{city} שמתאים בול לדרישה שלך — {need}. כדאי לך לראות את זה לפני שנגמר!",
  medium: "היי {name}, יש לנו נכס חדש ב{city} שאולי יעניין אותך. רוצה לשמוע פרטים?",
};

function buildMockHook(lead: Lead, city: string, score: number): string {
  const template = score > 80 ? MOCK_HOOKS.high! : MOCK_HOOKS.medium!;
  return template
    .replace("{name}", lead.name)
    .replace("{city}", city)
    .replace("{need}", lead.specific_needs ?? "");
}

// ============================================================
// Public API
// ============================================================

export async function matchPropertyToLeads(
  input: MatchInput,
  leads: Lead[]
): Promise<LeadMatch[]> {
  if (isMockMode()) {
    return leads
      .map((lead) => {
        const score = mockScore(input.property, input.city, lead);
        return {
          leadId: lead.id,
          score,
          reasoning:
            score > 80
              ? `Budget fits (₪${(lead.budget_max / 1_000_000).toFixed(1)}M), city match (${lead.city_preferred}), aligns with: ${lead.specific_needs}`
              : score > 60
                ? `Partial match — budget close, ${lead.city_preferred === input.city ? "same city" : "different city"}`
                : `Weak match — budget or location mismatch`,
          whatsappHook: buildMockHook(lead, input.city, score),
        };
      })
      .sort((a, b) => b.score - a.score);
  }

  const openai = new OpenAI();

  const propertyContext = [
    `City: ${input.city}`,
    `Price: ₪${input.property.price_asked.toLocaleString("he-IL")}`,
    `Status: ${input.property.status}`,
    `Marketing hook: ${input.copy.shortHook}`,
  ];

  if (input.vision) {
    propertyContext.push(
      `Style: ${input.vision.visualDna.style}`,
      `Vibe: ${input.vision.visualDna.vibe}`,
      `Features: ${input.vision.roomTags.join(", ")}`
    );
  }

  const leadsContext = leads.map(
    (l) =>
      `ID: ${l.id} | Name: ${l.name} | Budget: ₪${l.budget_max.toLocaleString("he-IL")} | City: ${l.city_preferred} | Min rooms: ${l.min_rooms} | Needs: ${l.specific_needs ?? "none"}`
  );

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Property:\n${propertyContext.join("\n")}\n\nLeads:\n${leadsContext.join("\n")}`,
      },
    ],
    response_format: zodResponseFormat(MatchResult, "match_result"),
  });

  const parsed = response.choices[0]?.message.parsed;

  if (!parsed) {
    const refusal = response.choices[0]?.message.refusal;
    throw new Error(
      refusal
        ? `Matchmaker model refused: ${refusal}`
        : "Failed to match leads — no structured output returned"
    );
  }

  return parsed.matches;
}
