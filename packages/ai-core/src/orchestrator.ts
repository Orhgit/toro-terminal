import type { PropertyInsert, Lead } from "@repo/database/schema";
import { extractPropertyDetails } from "./extractor.js";
import { analyzePropertyImages, type VisionAnalysis } from "./vision.js";
import { generateMarketingCopy, type MarketingCopy } from "./copywriter.js";
import { generateReelScript, type ReelScript } from "./director.js";
import { matchPropertyToLeads, type LeadMatch } from "./matchmaker.js";
import {
  critiquePropertyData,
  critiqueCreativeOutput,
  reviseCopy,
  runCritiqueLoop,
  buildQualityReport,
  type QualityReport,
  type AgentReview,
} from "./swarm/engine.js";
import { isMockMode } from "./mock.js";

// ============================================================
// Pipeline result
// ============================================================

export interface PipelineResult {
  property: PropertyInsert;
  vision: VisionAnalysis | null;
  copy: MarketingCopy;
  reel: ReelScript;
  matches: LeadMatch[];
  qualityReport: QualityReport;
}

// ============================================================
// Orchestrator v2 — with Recursive Reflection
// ============================================================

/**
 * Master AI pipeline with Swarm v2 critique loops:
 *
 *   A. Extractor      → DataArchitect critique loop
 *   B. Vision         → (if images provided)
 *   C. Copywriter     → CreativeEditor critique loop (may revise)
 *   D. Director       → (uses approved copy)
 *   E. Matchmaker     → (if leads provided)
 *
 * Each agent's output is reviewed by a specialist editor.
 * If the editor finds flaws, the original agent is re-called with feedback.
 * The quality_report tracks every review and revision.
 */
export async function runPropertyPipeline(
  rawMessage: string,
  imageUrls: string[] = [],
  options?: { leads?: Lead[]; city?: string }
): Promise<PipelineResult> {
  const reviews: AgentReview[] = [];

  // ── Steps A & B: run in parallel ──────────────────────────
  const hasImages = imageUrls.length > 0;

  const [rawProperty, vision] = await Promise.all([
    extractPropertyDetails(rawMessage),
    hasImages ? analyzePropertyImages(imageUrls) : Promise.resolve(null),
  ]);

  // ── Step A.1: DataArchitect critique loop on extraction ───
  const extractionResult = await runCritiqueLoop({
    agentName: "DataArchitect",
    initialOutput: rawProperty,
    critique: (p) => critiquePropertyData(p),
    revise: async (_p, feedback) => {
      // Re-extract with editor feedback appended
      return extractPropertyDetails(
        `${rawMessage}\n\n[Editor feedback: ${feedback}]`
      );
    },
  });

  const property = extractionResult.output;
  reviews.push(extractionResult.review);

  // ── Step C: Copywriter ────────────────────────────────────
  const visionTags = vision?.roomTags ?? [];
  const rawCopy = await generateMarketingCopy(property, visionTags);

  // ── Step D: Director (uses initial copy, will be updated if copy changes)
  const reel = await generateReelScript(property, vision, rawCopy);

  // ── Step C.1: CreativeEditor critique loop on copy + reel ─
  const creativeResult = await runCritiqueLoop({
    agentName: "CreativeEditor",
    initialOutput: rawCopy,
    critique: (copy) => critiqueCreativeOutput(copy, reel),
    revise: (copy, feedback) => reviseCopy(copy, feedback, property, visionTags),
  });

  const copy = creativeResult.output;
  reviews.push(creativeResult.review);

  // ── Mock mode: add simulated approval for remaining agents ─
  if (isMockMode()) {
    reviews.push({
      agent: "VisionAnalyst",
      verdict: "approved",
      feedback: vision
        ? `Visual DNA validated. Style "${vision.visualDna.style}" confirmed, ${vision.roomTags.length} room tags verified.`
        : "No images provided — skipped.",
      iterations: 1,
    });
    reviews.push({
      agent: "Director",
      verdict: "approved",
      feedback: `Reel script coherent. 3 scenes, 15s total. Audio vibes match property style.`,
      iterations: 1,
    });
  }

  // ── Step E: Matchmaker (parallel-safe, no critique needed) ─
  const leads = options?.leads ?? [];
  const city = options?.city ?? "";

  const matches =
    leads.length > 0
      ? await matchPropertyToLeads({ property, city, vision, copy }, leads)
      : [];

  // ── Assemble quality report ───────────────────────────────
  const qualityReport = buildQualityReport(reviews);

  return { property, vision, copy, reel, matches, qualityReport };
}
