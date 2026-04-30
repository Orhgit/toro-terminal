import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { PropertyDraft } from "@repo/database/schema";
import type { MarketingCopy } from "../copywriter.js";
import type { ReelScript } from "../director.js";
import { isMockMode } from "../mock.js";

// ============================================================
// Quality Report types
// ============================================================

export type Verdict = "approved" | "revision_needed";

export interface AgentReview {
  agent: string;
  verdict: Verdict;
  feedback: string;
  iterations: number;
}

export interface QualityReport {
  reviews: AgentReview[];
  overallStatus: "all_approved" | "approved_with_revisions" | "partial";
  totalIterations: number;
}

// ============================================================
// Critique schema (shared by all editor agents)
// ============================================================

export const CritiqueResult = z.object({
  verdict: z.enum(["approved", "revision_needed"]),
  feedback: z
    .string()
    .describe("If revision_needed: specific, actionable feedback. If approved: brief confirmation."),
});

export type CritiqueResult = z.infer<typeof CritiqueResult>;

// ============================================================
// DataArchitect — validates extracted property data
// ============================================================

const DATA_ARCHITECT_PROMPT = `You are the DataArchitect for Toro — Israel's fastest AI-driven real estate platform.

You review structured property data extracted by the Extractor agent.
Check for:
1. Phone number format — must look like a valid Israeli number (05X-XXXXXXX) or "unknown". Reject random strings.
2. Price sanity — Israeli property prices typically range ₪500K–₪30M. Flag if 0 or clearly wrong.
3. Status validity — must be one of: draft, active, under_contract, sold, archived.
4. Completeness — all fields must have meaningful values.

If everything looks good, verdict = "approved".
If any issue found, verdict = "revision_needed" with specific feedback for the Extractor to fix.`;

export async function critiquePropertyData(
  property: PropertyDraft
): Promise<CritiqueResult> {
  if (isMockMode()) {
    // Mock: DataArchitect approves on first pass
    return {
      verdict: "approved",
      feedback: "Property data is complete and valid. Phone format correct, price within expected Israeli market range.",
    };
  }

  const openai = new OpenAI();
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: DATA_ARCHITECT_PROMPT },
      {
        role: "user",
        content: `Review this extracted property data:\n\n${JSON.stringify(property, null, 2)}`,
      },
    ],
    response_format: zodResponseFormat(CritiqueResult, "critique"),
  });

  return response.choices[0]?.message.parsed ?? { verdict: "approved", feedback: "No critique generated" };
}

// ============================================================
// CreativeEditor — reviews marketing copy & reel scripts
// ============================================================

const CREATIVE_EDITOR_PROMPT = `You are the CreativeEditor for Toro — Israel's fastest AI-driven real estate platform.

You review AI-generated Hebrew marketing copy and video scripts.
Check for:
1. Hebrew grammar and spelling — must be correct, natural modern Hebrew.
2. Hook quality — the shortHook must be punchy (max 15 words), emotional, and unique. Reject generic hooks like "דירה יפה למכירה".
3. Description quality — fullDescription must be 3-5 sentences, persuasive, mention specific features. No emojis.
4. Reel script coherence — 3 scenes, each with clear visual direction, Hebrew text overlays, and matching audio vibe.
5. Brand voice — must feel premium, modern, confident. Not salesy or desperate.

If everything meets Toro standards, verdict = "approved".
If any issue, verdict = "revision_needed" with specific, actionable Hebrew-aware feedback.`;

export async function critiqueCreativeOutput(
  copy: MarketingCopy,
  reel: ReelScript
): Promise<CritiqueResult> {
  if (isMockMode()) {
    // Mock: Editor rejects first pass, provides feedback
    return {
      verdict: "revision_needed",
      feedback: "Hook \"דירת גן בלב המשתלה — בית פרטי בתוך העיר\" is too descriptive, not emotional enough. Needs a stronger opening verb or question. Suggest: \"תארו לעצמכם גינה פרטית בלב תל אביב\" or similar. Description is solid. Reel script approved.",
    };
  }

  const openai = new OpenAI();
  const content = [
    `Short Hook: ${copy.shortHook}`,
    `Full Description: ${copy.fullDescription}`,
    `\nReel Script:`,
    ...reel.scenes.map(
      (s, i) => `Scene ${i + 1}: Visual="${s.visual_cue}" | Text="${s.text_overlay}" | Audio="${s.audio_vibe}"`
    ),
  ].join("\n");

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: CREATIVE_EDITOR_PROMPT },
      { role: "user", content: `Review this creative output:\n\n${content}` },
    ],
    response_format: zodResponseFormat(CritiqueResult, "critique"),
  });

  return response.choices[0]?.message.parsed ?? { verdict: "approved", feedback: "No critique generated" };
}

// ============================================================
// Revised copy after critique (mock returns improved version)
// ============================================================

export async function reviseCopy(
  original: MarketingCopy,
  feedback: string,
  propertyData: PropertyDraft,
  visionTags: string[]
): Promise<MarketingCopy> {
  if (isMockMode()) {
    return {
      shortHook: "תארו לעצמכם גינה פרטית בלב תל אביב — זה אמיתי",
      fullDescription: original.fullDescription,
    };
  }

  const openai = new OpenAI();
  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0.7,
    messages: [
      {
        role: "system",
        content: `You are the lead copywriter for Toro. You received editorial feedback on your previous draft. Revise ONLY what was criticized. Keep what was approved.`,
      },
      {
        role: "user",
        content: [
          `Original hook: ${original.shortHook}`,
          `Original description: ${original.fullDescription}`,
          `\nEditor feedback: ${feedback}`,
          `\nProperty: ₪${propertyData.price_asked.toLocaleString("he-IL")}, ${propertyData.status}`,
          visionTags.length > 0 ? `Visual features: ${visionTags.join(", ")}` : "",
        ].join("\n"),
      },
    ],
    response_format: zodResponseFormat(
      z.object({
        shortHook: z.string(),
        fullDescription: z.string(),
      }),
      "revised_copy"
    ),
  });

  return response.choices[0]?.message.parsed ?? original;
}

// ============================================================
// Critique loop — generic recursive reflection engine
// ============================================================

const MAX_ITERATIONS = 3;

export interface CritiqueLoopResult<T> {
  output: T;
  review: AgentReview;
}

/**
 * Run an agent output through a critique loop.
 * If the critic finds flaws, call the revision function and re-critique.
 * Max iterations = 3 (original + 2 revisions).
 */
export async function runCritiqueLoop<T>(config: {
  agentName: string;
  initialOutput: T;
  critique: (output: T) => Promise<CritiqueResult>;
  revise: (output: T, feedback: string) => Promise<T>;
}): Promise<CritiqueLoopResult<T>> {
  let output = config.initialOutput;
  let iterations = 1;
  let lastCritique: CritiqueResult;

  for (let i = 0; i < MAX_ITERATIONS; i++) {
    lastCritique = await config.critique(output);

    if (lastCritique.verdict === "approved") {
      return {
        output,
        review: {
          agent: config.agentName,
          verdict: "approved",
          feedback: lastCritique.feedback,
          iterations,
        },
      };
    }

    // Revision needed — re-call the agent with feedback
    if (i < MAX_ITERATIONS - 1) {
      output = await config.revise(output, lastCritique.feedback);
      iterations++;
    } else {
      // Max iterations reached — accept with note
      return {
        output,
        review: {
          agent: config.agentName,
          verdict: "revision_needed",
          feedback: `Max iterations reached. Last feedback: ${lastCritique.feedback}`,
          iterations,
        },
      };
    }
  }

  // Fallback (should not reach here)
  return {
    output,
    review: {
      agent: config.agentName,
      verdict: "approved",
      feedback: "Completed",
      iterations,
    },
  };
}

// ============================================================
// Build quality report from reviews
// ============================================================

export function buildQualityReport(reviews: AgentReview[]): QualityReport {
  const totalIterations = reviews.reduce((sum, r) => sum + r.iterations, 0);
  const allApproved = reviews.every((r) => r.verdict === "approved");
  const hadRevisions = reviews.some((r) => r.iterations > 1);

  return {
    reviews,
    overallStatus: allApproved
      ? hadRevisions
        ? "approved_with_revisions"
        : "all_approved"
      : "partial",
    totalIterations,
  };
}
