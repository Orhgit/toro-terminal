import type { ReelScene } from "../director.js";
import type { VisualDna } from "../vision.js";
import { isMockMode } from "../mock.js";

// ============================================================
// Types
// ============================================================

export interface FontSpec {
  family: string;
  weight: number;
  /** CSS font-style */
  style: "normal" | "italic";
}

export interface ColorPalette {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
}

export interface VisualStyle {
  palette: ColorPalette;
  headingFont: FontSpec;
  bodyFont: FontSpec;
  overlayOpacity: number;
  borderRadius: number;
}

export interface SceneDesign {
  scene: ReelScene;
  textColor: string;
  bgGradient: string;
  fontScale: number;
  /** Suggested motion: "fade-in" | "slide-up" | "zoom" | "pan" */
  motion: string;
}

export interface SocialPackage {
  style: VisualStyle;
  scenes: SceneDesign[];
  cardPreview: {
    headline: string;
    subline: string;
    accentColor: string;
    badgeText: string;
  };
  generatedAt: string;
}

// ============================================================
// Style presets keyed by VisualDna vibe / style keywords
// ============================================================

const STYLE_PRESETS: Record<string, VisualStyle> = {
  luxury: {
    palette: { primary: "#1a1a2e", secondary: "#c9a84c", accent: "#e8d5a3", background: "#0f0f1a", text: "#ffffff" },
    headingFont: { family: "Playfair Display", weight: 700, style: "normal" },
    bodyFont: { family: "Inter", weight: 400, style: "normal" },
    overlayOpacity: 0.6,
    borderRadius: 4,
  },
  modern: {
    palette: { primary: "#6366f1", secondary: "#818cf8", accent: "#c7d2fe", background: "#f8fafc", text: "#1e293b" },
    headingFont: { family: "Inter", weight: 800, style: "normal" },
    bodyFont: { family: "Inter", weight: 400, style: "normal" },
    overlayOpacity: 0.5,
    borderRadius: 12,
  },
  cozy: {
    palette: { primary: "#78350f", secondary: "#d97706", accent: "#fde68a", background: "#fffbeb", text: "#451a03" },
    headingFont: { family: "Merriweather", weight: 700, style: "normal" },
    bodyFont: { family: "Source Sans Pro", weight: 400, style: "normal" },
    overlayOpacity: 0.45,
    borderRadius: 16,
  },
  minimalist: {
    palette: { primary: "#18181b", secondary: "#71717a", accent: "#e4e4e7", background: "#fafafa", text: "#09090b" },
    headingFont: { family: "DM Sans", weight: 700, style: "normal" },
    bodyFont: { family: "DM Sans", weight: 400, style: "normal" },
    overlayOpacity: 0.4,
    borderRadius: 8,
  },
};

const DEFAULT_STYLE = STYLE_PRESETS["modern"]!;

// ============================================================
// Motion mapping by scene position
// ============================================================

const SCENE_MOTIONS = ["zoom", "slide-up", "fade-in"] as const;

// ============================================================
// Helpers
// ============================================================

function resolveStyle(visualDna: VisualDna | null): VisualStyle {
  if (!visualDna) return DEFAULT_STYLE;

  const key = [visualDna.vibe, visualDna.style]
    .join(" ")
    .toLowerCase();

  if (key.includes("luxury") || key.includes("executive")) return STYLE_PRESETS["luxury"]!;
  if (key.includes("cozy") || key.includes("family") || key.includes("warm")) return STYLE_PRESETS["cozy"]!;
  if (key.includes("minimalist") || key.includes("clean") || key.includes("young")) return STYLE_PRESETS["minimalist"]!;
  return STYLE_PRESETS["modern"]!;
}

function buildSceneDesign(scene: ReelScene, index: number, style: VisualStyle): SceneDesign {
  const motion = SCENE_MOTIONS[index % SCENE_MOTIONS.length]!;
  // Hook scene gets larger text, CTA gets medium, showcase is default
  const fontScale = index === 0 ? 1.3 : index === 2 ? 1.15 : 1.0;

  return {
    scene,
    textColor: style.palette.text === "#ffffff" ? "#ffffff" : style.palette.primary,
    bgGradient: `linear-gradient(135deg, ${style.palette.primary}, ${style.palette.secondary})`,
    fontScale,
    motion,
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Takes the Director's Reel Script + property VisualDna and produces
 * a complete SocialPackage with colour palette, typography, per-scene
 * styling, and a card preview spec for the admin UI.
 */
export async function packageForSocial(
  scenes: ReelScene[],
  visualDna: VisualDna | null,
  hookText: string,
  price: number,
): Promise<SocialPackage> {
  const style = resolveStyle(visualDna);
  const formattedPrice = `₪${price.toLocaleString("he-IL")}`;

  const sceneDesigns = scenes.map((scene, i) => buildSceneDesign(scene, i, style));

  return {
    style,
    scenes: sceneDesigns,
    cardPreview: {
      headline: hookText,
      subline: formattedPrice,
      accentColor: style.palette.secondary,
      badgeText: visualDna?.style ?? "Property",
    },
    generatedAt: new Date().toISOString(),
  };
}
