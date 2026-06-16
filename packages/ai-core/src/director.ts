import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PropertyDraft } from "@repo/database/schema";
import type { VisionAnalysis } from "./vision.js";
import type { MarketingCopy } from "./copywriter.js";
import { isMockMode } from "./mock.js";

// ============================================================
// Schema
// ============================================================

export const ReelScene = z.object({
  visual_cue: z
    .string()
    .describe("Camera direction — what the videographer should film for this scene"),
  text_overlay: z
    .string()
    .describe("Punchy Hebrew text to appear on screen during this scene"),
  audio_vibe: z
    .string()
    .describe("Music/sound mood for this scene, e.g. 'Upbeat Tech', 'Soft Jazz', 'Lofi Beats'"),
});

export type ReelScene = z.infer<typeof ReelScene>;

export const ReelScript = z.object({
  scenes: z
    .array(ReelScene)
    .length(3)
    .describe("Exactly 3 scenes for a 15-second property Reel"),
});

export type ReelScript = z.infer<typeof ReelScript>;

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `You are the lead AI engine for Toro — Israel's fastest AI-driven real estate platform.
Your role: creative video director specializing in 15-second Instagram/TikTok property Reels.

You receive structured property data, vision analysis, and marketing copy.
Generate a 3-scene Reel script (5 seconds per scene = 15 seconds total).

Rules:
- Scene 1 (Hook — 0-5s): Grab attention immediately. Show the most impressive feature. Text overlay should be bold and short.
- Scene 2 (Showcase — 5-10s): Highlight 2-3 key features. Camera movement (pan, dolly, reveal). Text overlay adds context.
- Scene 3 (CTA — 10-15s): Emotional close + call to action. Show the lifestyle. Text overlay drives urgency.

Style:
- visual_cue: Write like you're directing a cameraman. Be specific about angles, movements, lighting.
- text_overlay: Hebrew. Punchy. Max 8 words per scene. Think TikTok text — bold, emotional.
- audio_vibe: Match the property's vibe. Luxury = "Elegant Piano", Modern = "Upbeat Tech House", Cozy = "Warm Acoustic".

Return exactly 3 scenes.`;

// ============================================================
// Mock data
// ============================================================

const MOCK_SCRIPTS: ReelScript[] = [
  {
    scenes: [
      {
        visual_cue: "Drone shot descending into the private garden through morning light. Slow reveal of the green space.",
        text_overlay: "הגינה הפרטית שתמיד חלמתם עליה",
        audio_vibe: "Warm Acoustic Guitar",
      },
      {
        visual_cue: "Steady dolly through the renovated kitchen — focus on quartz countertops, island, then pan to the open living room.",
        text_overlay: "מטבח שף • סלון ענק • 4 חדרים",
        audio_vibe: "Warm Acoustic Guitar",
      },
      {
        visual_cue: "Golden hour shot from the garden looking back at the house. Family silhouettes. Fade to Toro logo.",
        text_overlay: "הבית שלכם מחכה — דברו איתנו",
        audio_vibe: "Warm Acoustic Guitar — soft fade",
      },
    ],
  },
  {
    scenes: [
      {
        visual_cue: "Wide establishing shot from the rooftop terrace — Mediterranean sea fills the frame. Camera tilts down to reveal the penthouse.",
        text_overlay: "הנוף הזה? שלכם. כל יום.",
        audio_vibe: "Elegant Piano & Strings",
      },
      {
        visual_cue: "Gimbal walk-through: private elevator opens → floor-to-ceiling windows → pan across the chef kitchen → reveal the master suite.",
        text_overlay: "180 מ״ר • מעלית פרטית • מטבח שף",
        audio_vibe: "Elegant Piano & Strings — building",
      },
      {
        visual_cue: "Sunset timelapse from the 60sqm terrace. Wine glass in foreground, sea in background. Toro logo fade in.",
        text_overlay: "פנטהאוז שאי אפשר לסרב לו",
        audio_vibe: "Elegant Piano & Strings — crescendo",
      },
    ],
  },
  {
    scenes: [
      {
        visual_cue: "Fast tracking shot along the modern building facade. Sun flares between clean architectural lines.",
        text_overlay: "עיצוב שמדבר בשקט",
        audio_vibe: "Upbeat Tech House",
      },
      {
        visual_cue: "Interior: low-angle through the minimalist living space — natural materials, sunlit balcony pull-focus, open kitchen.",
        text_overlay: "בוטיק • 3 חד׳ • דקות מהים",
        audio_vibe: "Upbeat Tech House",
      },
      {
        visual_cue: "Beach sunset walk — cut to the balcony view. Phone notification animation: 'Your Toro match is ready'.",
        text_overlay: "ההשקעה החכמה הבאה שלכם",
        audio_vibe: "Upbeat Tech House — drop",
      },
    ],
  },
];

let mockIndex = 0;

// ============================================================
// Public API
// ============================================================

export async function generateReelScript(
  propertyData: PropertyDraft,
  vision: VisionAnalysis | null,
  copy: MarketingCopy
): Promise<ReelScript> {
  if (isMockMode()) {
    const result = MOCK_SCRIPTS[mockIndex % MOCK_SCRIPTS.length]!;
    mockIndex++;
    return result;
  }

  const openai = new OpenAI();

  const context = [
    `Property: ₪${propertyData.price_asked.toLocaleString("he-IL")}, status: ${propertyData.status}`,
    `Marketing hook: ${copy.shortHook}`,
    `Full description: ${copy.fullDescription}`,
  ];

  if (vision) {
    context.push(
      `Visual DNA: Style=${vision.visualDna.style}, Vibe=${vision.visualDna.vibe}`,
      `Strengths: ${vision.visualDna.strengths.join(", ")}`,
      `Room tags: ${vision.roomTags.join(", ")}`,
      `Photo quality: ${vision.qualityScore}/10`
    );
  }

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0.8,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Create a 15-second Reel script for this property:\n\n${context.join("\n")}`,
      },
    ],
    response_format: zodResponseFormat(ReelScript, "reel_script"),
  });

  const parsed = response.choices[0]?.message.parsed;

  if (!parsed) {
    const refusal = response.choices[0]?.message.refusal;
    throw new Error(
      refusal
        ? `Director model refused: ${refusal}`
        : "Failed to generate reel script — no structured output returned"
    );
  }

  return parsed;
}
