export { burnOverlay, burnOverlayBatch } from "./overlay.js";
export type { OverlayLayer, OverlaySpec, OverlayResult } from "./overlay.js";

export { packageForSocial } from "./social-packager.js";
export type {
  FontSpec,
  ColorPalette,
  VisualStyle,
  SceneDesign,
  SocialPackage,
} from "./social-packager.js";

export { detectBrand, getBrand, listBrands } from "./brand-guard.js";
export type { BrandProfile } from "./brand-guard.js";

export { computeLayout } from "./layout.js";
export type { Rect, LayoutElement, ImageLayout } from "./layout.js";

export { runVisualQa } from "./visual-qa.js";
export type { QaVerdict, QaCheck, QaReport } from "./visual-qa.js";

export { exportAsset, exportPropertyAssets } from "./export.js";
export type { ExportTarget, ExportResult, BatchExportResult } from "./export.js";
