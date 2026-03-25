export { isMockMode } from "./mock.js";

export { extractPropertyDetails } from "./extractor.js";
export type { PropertyExtraction } from "./extractor.js";

export { analyzePropertyImages } from "./vision.js";
export type { VisionAnalysis, VisualDna } from "./vision.js";

export { generateMarketingCopy } from "./copywriter.js";
export type { MarketingCopy } from "./copywriter.js";

export { generateReelScript } from "./director.js";
export type { ReelScript, ReelScene } from "./director.js";

export { matchPropertyToLeads } from "./matchmaker.js";
export type { LeadMatch, MatchResult, MatchInput } from "./matchmaker.js";

export { scoutProperty } from "./scout.js";
export type { ScoutResult } from "./scout.js";

// Swarm engine
export {
  runCritiqueLoop,
  critiquePropertyData,
  critiqueCreativeOutput,
  reviseCopy,
  buildQualityReport,
} from "./swarm/engine.js";
export type {
  QualityReport,
  AgentReview,
  Verdict,
  CritiqueResult,
  CritiqueLoopResult,
} from "./swarm/engine.js";

// Swarm dispatcher
export {
  evaluateForDispatch,
  generateBriefings,
  dispatchProperty,
} from "./swarm/dispatcher.js";
export type {
  DispatchInput,
  DispatchDecision,
  DispatchResult,
  EmployeeBriefing,
  QueueDecision,
} from "./swarm/dispatcher.js";

// Swarm guardian
export { runGuardianReview } from "./swarm/guardian.js";
export type {
  GuardianCheck,
  GuardianReport,
} from "./swarm/guardian.js";

// WhatsApp service
export { sendServiceFirst, sendFullMarketingKit } from "./services/whatsapp.js";
export type {
  WhatsAppTemplateMessage,
  WhatsAppFreeformMessage,
  SendResult,
} from "./services/whatsapp.js";

// Orchestrator
export { runPropertyPipeline } from "./orchestrator.js";
export type { PipelineResult } from "./orchestrator.js";

// Studio — overlay, social, brand, layout, QA
export {
  burnOverlay,
  burnOverlayBatch,
  packageForSocial,
  detectBrand,
  getBrand,
  listBrands,
  computeLayout,
  runVisualQa,
  exportAsset,
  exportPropertyAssets,
} from "./studio/index.js";
export type {
  OverlayLayer,
  OverlaySpec,
  OverlayResult,
  FontSpec,
  ColorPalette,
  VisualStyle,
  SceneDesign,
  SocialPackage,
  BrandProfile,
  Rect,
  LayoutElement,
  ImageLayout,
  QaVerdict,
  QaCheck,
  QaReport,
  ExportTarget,
  ExportResult,
  BatchExportResult,
} from "./studio/index.js";
