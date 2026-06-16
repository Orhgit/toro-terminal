import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PropertyDraft } from "@repo/database/schema";
import type { MarketingCopy } from "../copywriter.js";
import type { VisionAnalysis } from "../vision.js";
import type { ReelScript } from "../director.js";
import type { QualityReport } from "./engine.js";
import { isMockMode } from "../mock.js";

// ============================================================
// Types
// ============================================================

export interface DispatchInput {
  property: PropertyDraft;
  city: string;
  vision: VisionAnalysis | null;
  copy: MarketingCopy;
  reel: ReelScript;
  qualityReport: QualityReport;
}

export type QueueDecision = "auto_publish" | "needs_review" | "hold";

export interface DispatchDecision {
  decision: QueueDecision;
  reason: string;
  qualityScore: number;
}

export interface EmployeeBriefing {
  role: "graphic_designer" | "social_media_manager";
  title: string;
  description: string;
  deliverables: string[];
  priority: "urgent" | "normal" | "low";
  deadline: string;
}

export interface DispatchResult {
  decision: DispatchDecision;
  briefings: EmployeeBriefing[];
}

// ============================================================
// Schema for live mode
// ============================================================

const BriefingSchema = z.object({
  role: z.enum(["graphic_designer", "social_media_manager"]),
  title: z.string(),
  description: z.string(),
  deliverables: z.array(z.string()),
  priority: z.enum(["urgent", "normal", "low"]),
  deadline: z.string(),
});

const DispatchSchema = z.object({
  briefings: z.array(BriefingSchema).length(2),
});

// ============================================================
// System prompt
// ============================================================

const BRIEFING_PROMPT = `You are the Autopilot Dispatcher for Toro — Israel's fastest AI-driven real estate platform.

You generate personalized task briefings for team members based on an approved property listing.

Generate exactly 2 briefings:

1. **Graphic Designer** briefing:
   - Focus on the Visual DNA (style, vibe, strengths)
   - Reference specific overlay requirements from the reel script
   - List exact deliverables (social media cards, story templates, reel thumbnails)
   - Mention the color palette and typography from the visual style

2. **Social Media Manager** briefing:
   - Focus on the viral hook and posting strategy
   - Include the marketing copy and reel script as assets
   - Suggest posting schedule (best times for Israeli audience)
   - List platform-specific deliverables (Instagram, TikTok, Facebook)

Be specific, actionable, and reference actual property details. Write in professional English.`;

// ============================================================
// Core logic
// ============================================================

function computeQualityScore(report: QualityReport): number {
  const reviews = report.reviews;
  if (reviews.length === 0) return 0;

  let score = 100;
  for (const review of reviews) {
    if (review.verdict === "revision_needed") score -= 20;
    if (review.iterations > 1) score -= (review.iterations - 1) * 5;
  }

  return Math.max(0, Math.min(100, score));
}

export function evaluateForDispatch(input: DispatchInput): DispatchDecision {
  const qualityScore = computeQualityScore(input.qualityReport);

  if (qualityScore >= 90) {
    return {
      decision: "auto_publish",
      reason: "All agents approved, quality score exceeds threshold — auto-publishing to social queue",
      qualityScore,
    };
  }

  if (qualityScore >= 70) {
    return {
      decision: "needs_review",
      reason: `Quality score ${qualityScore} — some revisions detected, manual review recommended`,
      qualityScore,
    };
  }

  return {
    decision: "hold",
    reason: `Quality score ${qualityScore} — significant issues found, holding for manual intervention`,
    qualityScore,
  };
}

// ============================================================
// Employee Briefing Generator
// ============================================================

export async function generateBriefings(
  input: DispatchInput
): Promise<EmployeeBriefing[]> {
  if (isMockMode()) {
    const style = input.vision?.visualDna.style ?? "Modern";
    const vibe = input.vision?.visualDna.vibe ?? "Professional";
    const strengths = input.vision?.visualDna.strengths ?? [];
    const price = `₪${input.property.price_asked.toLocaleString("he-IL")}`;

    return [
      {
        role: "graphic_designer",
        title: `Property Card — ${input.city} ${style}`,
        description: `Design the visual assets for a ${style} property in ${input.city} (${price}). The Visual DNA is "${vibe}" with key strengths: ${strengths.join(", ")}. Use the provided overlay specifications from the reel script for consistent branding. Apply the Toro brand watermark on all assets.`,
        deliverables: [
          "3x Instagram feed cards (1080x1080) with property overlays",
          "1x Instagram Story template (1080x1920) with swipe-up CTA",
          "1x TikTok/Reel thumbnail (1080x1920) matching Scene 1 visual",
          "1x Facebook cover variant (1200x630)",
        ],
        priority: "urgent",
        deadline: "24 hours",
      },
      {
        role: "social_media_manager",
        title: `Social Campaign — "${input.copy.shortHook}"`,
        description: `Launch the social campaign for the ${input.city} property. The viral hook is: "${input.copy.shortHook}". The 15-second reel script has 3 scenes ready for production. Use the full marketing description for captions. Target: Israeli professionals 28-45 in the ${input.city} metro area.`,
        deliverables: [
          "Schedule Instagram Reel post (Sunday 10:00 IST — peak engagement)",
          "Schedule TikTok cross-post (Sunday 12:00 IST)",
          "Create Facebook Marketplace listing with full description",
          "Prepare WhatsApp broadcast to matched leads (3 personalized messages)",
          "Monitor engagement for 48h and report metrics",
        ],
        priority: "urgent",
        deadline: "48 hours",
      },
    ];
  }

  const openai = new OpenAI();

  const context = [
    `Property: ${input.city}, ₪${input.property.price_asked.toLocaleString("he-IL")}`,
    `Hook: ${input.copy.shortHook}`,
    `Description: ${input.copy.fullDescription}`,
  ];

  if (input.vision) {
    context.push(
      `Visual DNA: ${input.vision.visualDna.style} / ${input.vision.visualDna.vibe}`,
      `Strengths: ${input.vision.visualDna.strengths.join(", ")}`,
      `Room tags: ${input.vision.roomTags.join(", ")}`
    );
  }

  context.push(
    `Reel: ${input.reel.scenes.map((s, i) => `Scene ${i + 1}: "${s.text_overlay}"`).join(" | ")}`
  );

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0.5,
    messages: [
      { role: "system", content: BRIEFING_PROMPT },
      { role: "user", content: context.join("\n") },
    ],
    response_format: zodResponseFormat(DispatchSchema, "dispatch"),
  });

  return response.choices[0]?.message.parsed?.briefings ?? [];
}

// ============================================================
// Full dispatch pipeline
// ============================================================

export async function dispatchProperty(
  input: DispatchInput
): Promise<DispatchResult> {
  const decision = evaluateForDispatch(input);
  const briefings = await generateBriefings(input);
  return { decision, briefings };
}
