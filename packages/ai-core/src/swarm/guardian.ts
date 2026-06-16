import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import type { MarketingCopy } from "../copywriter.js";
import type { ImageLayout } from "../studio/layout.js";
import { isMockMode } from "../mock.js";

// ============================================================
// Types
// ============================================================

export interface GuardianCheck {
  category: string;
  passed: boolean;
  severity: "critical" | "warning" | "info";
  detail: string;
  fix: string | null;
}

export interface GuardianReport {
  score: number;
  verdict: "safe" | "needs_revision" | "blocked";
  checks: GuardianCheck[];
  revisedCopy: MarketingCopy | null;
}

// ============================================================
// Meta Housing Policy rules (hardcoded for determinism)
// ============================================================

const AGGRESSIVE_TERMS = [
  "חייב לקנות", "הזדמנות אחרונה", "עכשיו או לעולם לא", "מהרו", "רק היום",
  "מבצע חיסול", "הנחה מטורפת", "בזול", "חינם", "מתנה",
  "FOMO", "limited time", "last chance", "act now", "exclusive deal",
];

const DISCRIMINATORY_TERMS = [
  "רק לזוגות", "ללא ערבים", "ללא חרדים", "לדתיים בלבד", "ליהודים בלבד",
  "לחילונים בלבד", "בלי ילדים", "ללא נכים", "גיל מסוים",
  "families only", "no children", "no pets", "jews only", "arabs only",
  "religious only", "secular only",
];

const META_TEXT_RATIO_LIMIT = 0.20; // 20% rule

// ============================================================
// System prompt for live mode
// ============================================================

const GUARDIAN_PROMPT = `You are the Guardian Agent for Toro — Israel's fastest AI-driven real estate platform.
Your role: Meta/WhatsApp policy compliance expert for Israeli real estate marketing.

You review marketing copy and ensure 100% compliance with:
1. Meta Housing Ad Category rules (no discriminatory targeting by race, religion, gender, family status, disability)
2. WhatsApp Business Policy (no spam, no aggressive sales language)
3. Fair Housing standards (equal opportunity language)
4. Israeli Consumer Protection Law (no misleading claims)

For each issue found, provide:
- The exact problematic text
- Why it violates policy
- A specific fix that maintains marketing effectiveness

If copy is safe, confirm with a 100/100 score.`;

const GuardianSchema = z.object({
  score: z.number().int().min(0).max(100),
  issues: z.array(z.object({
    category: z.string(),
    severity: z.enum(["critical", "warning", "info"]),
    detail: z.string(),
    fix: z.string().nullable(),
  })),
  revisedShortHook: z.string().nullable(),
  revisedFullDescription: z.string().nullable(),
});

// ============================================================
// Local checks (deterministic, no AI needed)
// ============================================================

function checkAggressiveLanguage(text: string): GuardianCheck[] {
  const lower = text.toLowerCase();
  const checks: GuardianCheck[] = [];

  for (const term of AGGRESSIVE_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      checks.push({
        category: "Aggressive Sales Language",
        passed: false,
        severity: "warning",
        detail: `Found aggressive term: "${term}"`,
        fix: `Remove or soften "${term}" — Meta flags high-pressure sales language in housing ads`,
      });
    }
  }

  return checks;
}

function checkDiscriminatoryLanguage(text: string): GuardianCheck[] {
  const lower = text.toLowerCase();
  const checks: GuardianCheck[] = [];

  for (const term of DISCRIMINATORY_TERMS) {
    if (lower.includes(term.toLowerCase())) {
      checks.push({
        category: "Housing Discrimination",
        passed: false,
        severity: "critical",
        detail: `Discriminatory term detected: "${term}"`,
        fix: `Remove "${term}" immediately — violates Meta Housing Ad Category and Fair Housing laws`,
      });
    }
  }

  return checks;
}

function checkTextToImageRatio(layout: ImageLayout | null): GuardianCheck {
  if (!layout) {
    return {
      category: "Text-to-Image Ratio",
      passed: true,
      severity: "info",
      detail: "No layout provided — skipping ratio check",
      fix: null,
    };
  }

  const canvasArea = layout.canvas.width * layout.canvas.height;
  const textElements = layout.elements.filter(
    (e) => e.type !== "gradient_scrim"
  );

  let textArea = 0;
  for (const el of textElements) {
    textArea += el.rect.width * el.rect.height;
  }

  const ratio = textArea / canvasArea;

  if (ratio <= META_TEXT_RATIO_LIMIT) {
    return {
      category: "Text-to-Image Ratio",
      passed: true,
      severity: "info",
      detail: `Text covers ${(ratio * 100).toFixed(1)}% of image (limit: 20%)`,
      fix: null,
    };
  }

  return {
    category: "Text-to-Image Ratio",
    passed: false,
    severity: "warning",
    detail: `Text covers ${(ratio * 100).toFixed(1)}% of image — exceeds Meta's 20% limit`,
    fix: "Reduce text overlay size or move text outside the image. Consider using a separate caption instead.",
  };
}

function checkMisleadingClaims(text: string): GuardianCheck[] {
  const checks: GuardianCheck[] = [];
  const patterns = [
    { regex: /תשואה מובטחת|guaranteed return/i, label: "Guaranteed returns" },
    { regex: /עלייה בטוחה במחיר|price will rise/i, label: "Price predictions" },
    { regex: /ללא סיכון|risk.?free/i, label: "Risk-free claims" },
  ];

  for (const { regex, label } of patterns) {
    if (regex.test(text)) {
      checks.push({
        category: "Misleading Claims",
        passed: false,
        severity: "critical",
        detail: `Potentially misleading: "${label}"`,
        fix: `Remove or qualify the claim — Israeli Consumer Protection Law prohibits unsubstantiated financial promises in real estate ads`,
      });
    }
  }

  return checks;
}

// ============================================================
// Public API
// ============================================================

/**
 * Run the full Guardian compliance review on marketing copy and layout.
 * Returns a score (0-100), detailed checks, and optionally revised copy.
 */
export async function runGuardianReview(
  copy: MarketingCopy,
  layout: ImageLayout | null = null
): Promise<GuardianReport> {
  const allText = `${copy.shortHook} ${copy.fullDescription}`;

  // Run deterministic checks first
  const checks: GuardianCheck[] = [
    ...checkAggressiveLanguage(allText),
    ...checkDiscriminatoryLanguage(allText),
    ...checkMisleadingClaims(allText),
    checkTextToImageRatio(layout),
  ];

  // Add "all clear" checks for categories that passed
  if (!checks.some((c) => c.category === "Aggressive Sales Language")) {
    checks.push({ category: "Aggressive Sales Language", passed: true, severity: "info", detail: "No aggressive sales terms detected", fix: null });
  }
  if (!checks.some((c) => c.category === "Housing Discrimination")) {
    checks.push({ category: "Housing Discrimination", passed: true, severity: "info", detail: "No discriminatory language detected", fix: null });
  }
  if (!checks.some((c) => c.category === "Misleading Claims")) {
    checks.push({ category: "Misleading Claims", passed: true, severity: "info", detail: "No misleading financial claims detected", fix: null });
  }

  // Add WhatsApp-specific checks
  if (copy.fullDescription.length > 1024) {
    checks.push({
      category: "WhatsApp Message Length",
      passed: false,
      severity: "warning",
      detail: `Description is ${copy.fullDescription.length} chars — WhatsApp template limit is 1024`,
      fix: "Shorten the description to under 1024 characters for WhatsApp template approval",
    });
  } else {
    checks.push({ category: "WhatsApp Message Length", passed: true, severity: "info", detail: `Description is ${copy.fullDescription.length} chars (limit: 1024)`, fix: null });
  }

  // Calculate score
  const criticalFails = checks.filter((c) => !c.passed && c.severity === "critical").length;
  const warnings = checks.filter((c) => !c.passed && c.severity === "warning").length;
  let score = 100 - criticalFails * 30 - warnings * 10;
  score = Math.max(0, Math.min(100, score));

  const verdict: GuardianReport["verdict"] =
    criticalFails > 0 ? "blocked" : warnings > 0 ? "needs_revision" : "safe";

  // In live mode, use AI to generate revised copy if needed
  let revisedCopy: MarketingCopy | null = null;

  if (verdict !== "safe" && !isMockMode()) {
    const openai = new OpenAI();
    const failedChecks = checks.filter((c) => !c.passed).map((c) => `[${c.category}] ${c.detail} → Fix: ${c.fix}`).join("\n");

    const response = await openai.beta.chat.completions.parse({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: GUARDIAN_PROMPT },
        {
          role: "user",
          content: `Revise this copy to fix compliance issues:\n\nHook: ${copy.shortHook}\nDescription: ${copy.fullDescription}\n\nIssues:\n${failedChecks}`,
        },
      ],
      response_format: zodResponseFormat(GuardianSchema, "guardian_review"),
    });

    const parsed = response.choices[0]?.message.parsed;
    if (parsed?.revisedShortHook || parsed?.revisedFullDescription) {
      revisedCopy = {
        shortHook: parsed.revisedShortHook ?? copy.shortHook,
        fullDescription: parsed.revisedFullDescription ?? copy.fullDescription,
      };
    }
  }

  // Mock: if copy is clean, return safe. If we want to demo a fix, simulate one
  if (isMockMode() && verdict === "safe") {
    checks.push({
      category: "Meta Housing Category",
      passed: true,
      severity: "info",
      detail: "Copy approved for Meta Housing Ad category — equal opportunity language verified",
      fix: null,
    });
  }

  return { score, verdict, checks, revisedCopy };
}
