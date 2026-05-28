import type { ImageLayout, LayoutElement } from "./layout.js";

// ============================================================
// Visual QA — verifies readability of text overlays
// ============================================================

export type QaVerdict = "pass" | "warn" | "fail";

export interface QaCheck {
  elementId: string;
  check: string;
  verdict: QaVerdict;
  suggestion: string | null;
}

export interface QaReport {
  checks: QaCheck[];
  overallVerdict: QaVerdict;
  scrimRecommended: boolean;
  adjustedLayout: ImageLayout | null;
}

// ============================================================
// Luminance estimation from hex color
// ============================================================

function hexToLuminance(hex: string): number {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return 0.5;

  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;

  // Relative luminance (ITU-R BT.709)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrastRatio(l1: number, l2: number): number {
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================
// Check functions
// ============================================================

function checkTextContrast(element: LayoutElement, backgroundLuminance: number): QaCheck {
  const textLum = hexToLuminance(element.color);
  const ratio = contrastRatio(textLum, backgroundLuminance);

  // WCAG AA requires 4.5:1 for normal text, 3:1 for large text
  const threshold = element.fontSize >= 24 ? 3.0 : 4.5;

  if (ratio >= threshold) {
    return {
      elementId: element.id,
      check: "text-contrast",
      verdict: "pass",
      suggestion: null,
    };
  }

  if (ratio >= threshold * 0.7) {
    return {
      elementId: element.id,
      check: "text-contrast",
      verdict: "warn",
      suggestion: `Contrast ratio ${ratio.toFixed(1)}:1 is marginal for "${element.id}". Consider increasing scrim opacity.`,
    };
  }

  return {
    elementId: element.id,
    check: "text-contrast",
    verdict: "fail",
    suggestion: `Contrast ratio ${ratio.toFixed(1)}:1 is too low for "${element.id}". Adding a dark scrim behind text is required.`,
  };
}

function checkOverlap(elements: LayoutElement[]): QaCheck[] {
  const checks: QaCheck[] = [];
  const textElements = elements.filter((e) => e.type !== "gradient_scrim");

  for (let i = 0; i < textElements.length; i++) {
    for (let j = i + 1; j < textElements.length; j++) {
      const a = textElements[i]!;
      const b = textElements[j]!;

      const overlapX = a.rect.x < b.rect.x + b.rect.width && a.rect.x + a.rect.width > b.rect.x;
      const overlapY = a.rect.y < b.rect.y + b.rect.height && a.rect.y + a.rect.height > b.rect.y;

      if (overlapX && overlapY) {
        checks.push({
          elementId: `${a.id}+${b.id}`,
          check: "overlap",
          verdict: "warn",
          suggestion: `Elements "${a.id}" and "${b.id}" overlap. Consider adjusting spacing.`,
        });
      }
    }
  }

  return checks;
}

function checkFontSize(element: LayoutElement): QaCheck {
  if (element.type === "gradient_scrim") {
    return { elementId: element.id, check: "font-size", verdict: "pass", suggestion: null };
  }

  if (element.fontSize < 12) {
    return {
      elementId: element.id,
      check: "font-size",
      verdict: "fail",
      suggestion: `Font size ${element.fontSize}px for "${element.id}" is too small to read on mobile. Minimum: 12px.`,
    };
  }

  return { elementId: element.id, check: "font-size", verdict: "pass", suggestion: null };
}

const META_TEXT_LIMIT_PERCENT = 20;

function checkMetaTextCoverage(layout: ImageLayout): QaCheck {
  const canvasArea = layout.canvas.width * layout.canvas.height;
  const textElements = layout.elements.filter((e) => e.type !== "gradient_scrim");
  const textArea = textElements.reduce(
    (sum, e) => sum + e.rect.width * e.rect.height,
    0,
  );
  const pct = Math.round((textArea / canvasArea) * 1000) / 10;

  if (pct <= META_TEXT_LIMIT_PERCENT) {
    return {
      elementId: "canvas",
      check: "meta-text-coverage",
      verdict: "pass",
      suggestion: null,
    };
  }

  const overBy = Math.round((pct - META_TEXT_LIMIT_PERCENT) * 10) / 10;
  if (pct <= META_TEXT_LIMIT_PERCENT + 3) {
    return {
      elementId: "canvas",
      check: "meta-text-coverage",
      verdict: "warn",
      suggestion: `Text covers ${pct}% of image (${overBy}% over Meta's ${META_TEXT_LIMIT_PERCENT}% limit). May reduce ad reach.`,
    };
  }

  return {
    elementId: "canvas",
    check: "meta-text-coverage",
    verdict: "fail",
    suggestion: `Text covers ${pct}% of image (${overBy}% over Meta's ${META_TEXT_LIMIT_PERCENT}% limit). Ad will be penalized — reduce font sizes.`,
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Run visual QA on a computed layout.
 *
 * @param layout The layout from the Layout Architect
 * @param estimatedBgLuminance Estimated average luminance of the image area
 *   behind text overlays (0 = pure black, 1 = pure white).
 *   In production, this would be computed from actual image pixel sampling.
 *   For mock mode, pass a value like 0.6 (typical bright photo).
 */
export function runVisualQa(
  layout: ImageLayout,
  estimatedBgLuminance: number = 0.6
): QaReport {
  const checks: QaCheck[] = [];

  // Determine effective background luminance after scrim
  const scrimElement = layout.elements.find((e) => e.type === "gradient_scrim");
  const hasScrim = !!scrimElement;

  // Scrim darkens the effective background
  const effectiveLuminance = hasScrim
    ? estimatedBgLuminance * 0.4 // scrim cuts ~60% of light
    : estimatedBgLuminance;

  // Check contrast for all text elements
  for (const element of layout.elements) {
    if (element.type === "gradient_scrim") continue;
    checks.push(checkTextContrast(element, effectiveLuminance));
    checks.push(checkFontSize(element));
  }

  // Check overlaps
  checks.push(...checkOverlap(layout.elements));

  // Check Meta 20% text coverage rule
  checks.push(checkMetaTextCoverage(layout));

  // Determine overall verdict
  const hasFail = checks.some((c) => c.verdict === "fail");
  const hasWarn = checks.some((c) => c.verdict === "warn");
  const overallVerdict: QaVerdict = hasFail ? "fail" : hasWarn ? "warn" : "pass";

  // If background is too bright for white text and no scrim exists, recommend one
  const needsScrim = !hasScrim && estimatedBgLuminance > 0.5;

  // Auto-fix: if scrim is needed, insert one into the layout
  let adjustedLayout: ImageLayout | null = null;
  if (needsScrim) {
    const scrimHeight = Math.round(layout.canvas.height * 0.5);
    const scrimFix: LayoutElement = {
      id: "auto-scrim",
      type: "gradient_scrim",
      rect: {
        x: 0,
        y: layout.canvas.height - scrimHeight,
        width: layout.canvas.width,
        height: scrimHeight,
      },
      fontSize: 0,
      fontFamily: "",
      color: "rgba(0,0,0,0.55)",
      value: "linear-gradient(transparent, rgba(0,0,0,0.55))",
      zIndex: 0,
    };

    adjustedLayout = {
      ...layout,
      elements: [scrimFix, ...layout.elements],
    };
  }

  return {
    checks,
    overallVerdict,
    scrimRecommended: needsScrim,
    adjustedLayout,
  };
}
