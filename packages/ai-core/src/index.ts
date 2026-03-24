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

export { runPropertyPipeline } from "./orchestrator.js";
export type { PipelineResult } from "./orchestrator.js";

export { burnOverlay, burnOverlayBatch, packageForSocial } from "./studio/index.js";
export type {
  OverlayLayer,
  OverlaySpec,
  OverlayResult,
  FontSpec,
  ColorPalette,
  VisualStyle,
  SceneDesign,
  SocialPackage,
} from "./studio/index.js";
