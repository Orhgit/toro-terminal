import type { BrandProfile } from "./brand-guard.js";

// ============================================================
// Layout Architect — calculates overlay coordinates
// ============================================================

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface LayoutElement {
  id: string;
  type: "logo" | "price" | "hook" | "phone" | "gradient_scrim";
  rect: Rect;
  fontSize: number;
  fontFamily: string;
  color: string;
  value: string;
  zIndex: number;
}

export interface ImageLayout {
  canvas: { width: number; height: number };
  aspectRatio: string;
  elements: LayoutElement[];
  safeZone: Rect;
}

// ============================================================
// Safe zone calculation — avoids center 40% of image
// ============================================================

function computeSafeZone(w: number, h: number): Rect {
  const marginX = Math.round(w * 0.3);
  const marginY = Math.round(h * 0.3);
  return {
    x: marginX,
    y: marginY,
    width: w - marginX * 2,
    height: h - marginY * 2,
  };
}

function getAspectLabel(w: number, h: number): string {
  const ratio = w / h;
  if (ratio > 1.7) return "16:9";
  if (ratio > 1.2) return "4:3";
  if (ratio > 0.9) return "1:1";
  if (ratio > 0.6) return "4:5";
  return "9:16";
}

// ============================================================
// Padding + sizing constants
// ============================================================

const PADDING = 24;
const LOGO_HEIGHT = 32;
const PRICE_FONT_BASE = 36;
const HOOK_FONT_BASE = 18;
const PHONE_FONT_BASE = 14;

// ============================================================
// Public API
// ============================================================

/**
 * Calculate pixel coordinates for every overlay element
 * based on image dimensions and the active brand profile.
 * Positions elements in safe zones, avoiding the center of the image.
 */
export function computeLayout(
  imageWidth: number,
  imageHeight: number,
  brand: BrandProfile,
  content: {
    price: string;
    hookText: string;
    phone: string;
  }
): ImageLayout {
  const w = imageWidth;
  const h = imageHeight;
  const safeZone = computeSafeZone(w, h);
  const aspect = getAspectLabel(w, h);

  // Scale fonts for smaller images
  const scale = Math.min(w / 1080, 1);
  const priceFontSize = Math.round(PRICE_FONT_BASE * scale);
  const hookFontSize = Math.round(HOOK_FONT_BASE * scale);
  const phoneFontSize = Math.round(PHONE_FONT_BASE * scale);
  const logoHeight = Math.round(LOGO_HEIGHT * scale);

  const elements: LayoutElement[] = [];

  // 1. Gradient scrim — bottom 45% of image
  const scrimHeight = Math.round(h * 0.45);
  elements.push({
    id: "scrim",
    type: "gradient_scrim",
    rect: { x: 0, y: h - scrimHeight, width: w, height: scrimHeight },
    fontSize: 0,
    fontFamily: "",
    color: "rgba(0,0,0,0.6)",
    value: "linear-gradient(transparent, rgba(0,0,0,0.6))",
    zIndex: 1,
  });

  // 2. Logo — top-left corner (safe, away from center)
  elements.push({
    id: "logo",
    type: "logo",
    rect: {
      x: PADDING,
      y: PADDING,
      width: Math.round(brand.logo.width * scale),
      height: logoHeight,
    },
    fontSize: Math.round(14 * scale),
    fontFamily: brand.fonts.heading,
    color: brand.colors.textOnDark,
    value: brand.watermark,
    zIndex: 10,
  });

  // 3. Price — bottom-right, on top of scrim
  const priceWidth = Math.round(content.price.length * priceFontSize * 0.6);
  elements.push({
    id: "price",
    type: "price",
    rect: {
      x: w - priceWidth - PADDING,
      y: h - PADDING - priceFontSize - 8,
      width: priceWidth,
      height: priceFontSize + 8,
    },
    fontSize: priceFontSize,
    fontFamily: brand.fonts.priceTag,
    color: brand.colors.secondary,
    value: content.price,
    zIndex: 10,
  });

  // 4. Hook text — bottom-left, above phone
  const hookWidth = w - priceWidth - PADDING * 3;
  elements.push({
    id: "hook",
    type: "hook",
    rect: {
      x: PADDING,
      y: h - PADDING - priceFontSize - hookFontSize - 24,
      width: Math.max(hookWidth, 200),
      height: hookFontSize * 2 + 8,
    },
    fontSize: hookFontSize,
    fontFamily: brand.fonts.heading,
    color: brand.colors.textOnDark,
    value: content.hookText,
    zIndex: 10,
  });

  // 5. Phone — bottom-left, lowest line
  elements.push({
    id: "phone",
    type: "phone",
    rect: {
      x: PADDING,
      y: h - PADDING - phoneFontSize,
      width: Math.round(content.phone.length * phoneFontSize * 0.6),
      height: phoneFontSize + 4,
    },
    fontSize: phoneFontSize,
    fontFamily: brand.fonts.body,
    color: brand.colors.accent,
    value: content.phone,
    zIndex: 10,
  });

  return {
    canvas: { width: w, height: h },
    aspectRatio: aspect,
    elements,
    safeZone,
  };
}
