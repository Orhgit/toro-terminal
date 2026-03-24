import { isMockMode } from "../mock.js";

// ============================================================
// Types
// ============================================================

export interface OverlayLayer {
  type: "logo" | "price" | "hook" | "gradient";
  position: "top-left" | "top-right" | "bottom-left" | "bottom-right" | "center" | "bottom-center";
  /** CSS-like value, e.g. "48px" or "24px" */
  size: string;
  /** Hex colour for text / tint */
  color: string;
  value: string;
}

export interface OverlaySpec {
  baseImageUrl: string;
  width: number;
  height: number;
  layers: OverlayLayer[];
}

export interface OverlayResult {
  /** The "rendered" image URL — in mock mode this points to the original with an overlay query param */
  renderedUrl: string;
  spec: OverlaySpec;
  generatedAt: string;
}

// ============================================================
// Defaults
// ============================================================

const TORO_LOGO_MARK = "TORO";
const DEFAULT_WIDTH = 1080;
const DEFAULT_HEIGHT = 1080;

// ============================================================
// Overlay builder
// ============================================================

function buildSpec(
  imageUrl: string,
  price: number,
  hookText: string,
): OverlaySpec {
  const formattedPrice = `₪${price.toLocaleString("he-IL")}`;

  const layers: OverlayLayer[] = [
    // Dark gradient scrim at the bottom for legibility
    {
      type: "gradient",
      position: "bottom-center",
      size: "100%",
      color: "rgba(0,0,0,0.55)",
      value: "linear-gradient(transparent, rgba(0,0,0,0.55))",
    },
    // Toro logo mark — top-left
    {
      type: "logo",
      position: "top-left",
      size: "36px",
      color: "#ffffff",
      value: TORO_LOGO_MARK,
    },
    // Property price — bottom-right
    {
      type: "price",
      position: "bottom-right",
      size: "32px",
      color: "#ffffff",
      value: formattedPrice,
    },
    // Short hook text — bottom-left
    {
      type: "hook",
      position: "bottom-left",
      size: "20px",
      color: "#ffffff",
      value: hookText,
    },
  ];

  return {
    baseImageUrl: imageUrl,
    width: DEFAULT_WIDTH,
    height: DEFAULT_HEIGHT,
    layers,
  };
}

// ============================================================
// Public API
// ============================================================

/**
 * Simulates "burning" the Toro logo, property price, and marketing hook
 * onto a property image.  In production this would call an image-processing
 * service (Sharp / Canvas / Cloudinary).  For now it returns the overlay
 * spec and a decorated URL that the UI can interpret.
 */
export async function burnOverlay(
  imageUrl: string,
  price: number,
  hookText: string,
): Promise<OverlayResult> {
  const spec = buildSpec(imageUrl, price, hookText);

  // In a real system we'd POST to an image service here.
  // For the demo we append an `overlay=toro` search param so the UI knows
  // this image has been "branded".
  const separator = imageUrl.includes("?") ? "&" : "?";
  const renderedUrl = `${imageUrl}${separator}overlay=toro&price=${encodeURIComponent(spec.layers.find((l) => l.type === "price")!.value)}`;

  return {
    renderedUrl,
    spec,
    generatedAt: new Date().toISOString(),
  };
}

/**
 * Batch-burn overlays for all images of a property.
 */
export async function burnOverlayBatch(
  imageUrls: string[],
  price: number,
  hookText: string,
): Promise<OverlayResult[]> {
  return Promise.all(
    imageUrls.map((url) => burnOverlay(url, price, hookText)),
  );
}
