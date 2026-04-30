"use client";

import { useState, useEffect, useRef } from "react";
import {
  Building2,
  Megaphone,
  ChevronDown,
  Sparkles,
  Film,
  Palette,
  Heart,
  Users,
  TrendingUp,
  CheckCircle2,
  Clock,
  ArrowRight,
  Hand,
  Rocket,
  Globe,
  Eye,
  Zap,
  Activity,
  Bot,
  Camera,
  Type,
  Cpu,
  Loader2,
  Check,
  ShieldCheck,
  ShieldAlert,
  ShieldX,
  Workflow,
  ScanEye,
  LayoutGrid,
  Upload,
} from "lucide-react";
import {
  MOCK_DASHBOARD_PROPERTIES,
  type DashboardProperty,
} from "../data/mock";

// ============================================================
// Brand configuration
// ============================================================

type Brand = "all" | "merkaz" | "kidomedia";

interface BrandConfig {
  id: Brand;
  name: string;
  nameHe: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
}

const BRANDS: BrandConfig[] = [
  {
    id: "all",
    name: "All Brands",
    nameHe: "כל המותגים",
    icon: Globe,
    color: "text-slate-700",
    bgColor: "bg-slate-50",
    borderColor: "border-slate-200",
  },
  {
    id: "merkaz",
    name: "Merkaz HaNechasim",
    nameHe: "מרכז הנכסים",
    icon: Building2,
    color: "text-indigo-700",
    bgColor: "bg-indigo-50",
    borderColor: "border-indigo-200",
  },
  {
    id: "kidomedia",
    name: "Kidomedia",
    nameHe: "קידומדיה",
    icon: Megaphone,
    color: "text-fuchsia-700",
    bgColor: "bg-fuchsia-50",
    borderColor: "border-fuchsia-200",
  },
];

// Assign brands to properties based on index for demo
function getPropertyBrand(propertyId: string): Brand {
  const brandMap: Record<string, Brand> = {
    "f47ac10b-58cc-4372-a567-0e02b2c3d479": "merkaz",
    "6ba7b810-9dad-41d4-80b5-e00d4aecf8a0": "merkaz",
    "7c9e6679-7425-40de-944b-e07fc1f90ae7": "kidomedia",
    "550e8400-e29b-41d4-a716-446655440000": "merkaz",
    "c56a4180-65aa-42ec-a945-5fd21dec0538": "kidomedia",
  };
  return brandMap[propertyId] ?? "merkaz";
}

// ============================================================
// Kanban column types
// ============================================================

type KanbanColumn = "ready_to_design" | "ready_to_post" | "live";

interface KanbanCard {
  property: DashboardProperty;
  column: KanbanColumn;
  assignee: string | null;
  brand: Brand;
  complianceScore: number;
}

// ============================================================
// Compliance Badge
// ============================================================

function ComplianceBadge({ score }: { score: number }) {
  if (score >= 100) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2 py-0.5 text-[10px] font-semibold text-emerald-700" title="Meta compliant — safe to dispatch">
        <ShieldCheck className="h-3 w-3" />
        {score}
      </span>
    );
  }
  if (score >= 70) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[10px] font-semibold text-amber-700" title="Minor compliance issues — review recommended">
        <ShieldAlert className="h-3 w-3" />
        {score}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 border border-red-200 px-2 py-0.5 text-[10px] font-semibold text-red-700" title="Blocked — Guardian found critical issues">
      <ShieldX className="h-3 w-3" />
      {score}
    </span>
  );
}

function resolveColumn(p: DashboardProperty): KanbanColumn {
  if (p.marketingStatus === "published") return "live";
  if (p.marketingStatus === "in_review" || (p.generatedAssets && p.generatedAssets.length > 0))
    return "ready_to_post";
  return "ready_to_design";
}

const COLUMN_CONFIG: Record<
  KanbanColumn,
  { title: string; icon: React.ComponentType<{ className?: string }>; color: string; dotColor: string }
> = {
  ready_to_design: {
    title: "Ready to Design",
    icon: Palette,
    color: "text-blue-600",
    dotColor: "bg-blue-500",
  },
  ready_to_post: {
    title: "Ready to Post",
    icon: Rocket,
    color: "text-amber-600",
    dotColor: "bg-amber-500",
  },
  live: {
    title: "Live",
    icon: Globe,
    color: "text-emerald-600",
    dotColor: "bg-emerald-500",
  },
};

// ============================================================
// Live Workflow — per-asset Guardian & Visual QA status
// ============================================================

type PipelineStage = "layout" | "overlay" | "visual_qa" | "guardian" | "export" | "done";

interface AssetWorkflow {
  propertyId: string;
  address: string;
  imageUrl: string;
  brand: Brand;
  stage: PipelineStage;
  guardianScore: number;
  qaVerdict: "pass" | "warn" | "fail" | "pending";
  qaChecks: { name: string; verdict: "pass" | "warn" | "fail" }[];
  textCoveragePercent: number;
  exported: boolean;
}

const PIPELINE_STAGES: { id: PipelineStage; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "layout", label: "Layout", icon: LayoutGrid },
  { id: "overlay", label: "Overlay", icon: Palette },
  { id: "visual_qa", label: "Visual QA", icon: ScanEye },
  { id: "guardian", label: "Guardian", icon: ShieldCheck },
  { id: "export", label: "Export", icon: Upload },
  { id: "done", label: "Done", icon: CheckCircle2 },
];

function buildMockWorkflows(): AssetWorkflow[] {
  return MOCK_DASHBOARD_PROPERTIES
    .filter((p) => p.imageUrls.length > 0 && p.reelScript && p.reelScript.length > 0)
    .map((p) => {
      const isPublished = p.marketingStatus === "published";
      const isReview = p.marketingStatus === "in_review";
      const hasAssets = p.generatedAssets && p.generatedAssets.length > 0;

      let stage: PipelineStage = "layout";
      let qaVerdict: AssetWorkflow["qaVerdict"] = "pending";
      let guardianScore = 0;
      let exported = false;

      if (isPublished) {
        stage = "done";
        qaVerdict = "pass";
        guardianScore = 100;
        exported = true;
      } else if (isReview && hasAssets) {
        stage = "guardian";
        qaVerdict = "warn";
        guardianScore = 80;
      } else if (hasAssets) {
        stage = "export";
        qaVerdict = "pass";
        guardianScore = 100;
      } else {
        stage = "overlay";
        qaVerdict = "pending";
        guardianScore = 0;
      }

      return {
        propertyId: p.property.id,
        address: p.address,
        imageUrl: p.imageUrls[0]!,
        brand: getPropertyBrand(p.property.id),
        stage,
        guardianScore,
        qaVerdict,
        qaChecks: [
          { name: "Text Contrast", verdict: qaVerdict === "pending" ? "pass" as const : qaVerdict },
          { name: "Meta 20% Rule", verdict: isReview ? "warn" as const : "pass" as const },
          { name: "Font Size", verdict: "pass" as const },
          { name: "Element Overlap", verdict: "pass" as const },
          { name: "Safe Zone", verdict: guardianScore < 70 ? "fail" as const : "pass" as const },
        ],
        textCoveragePercent: isReview ? 18.4 : isPublished ? 12.1 : 15.6,
        exported,
      };
    });
}

function WorkflowPipeline({ workflow }: { workflow: AssetWorkflow }) {
  const currentIdx = PIPELINE_STAGES.findIndex((s) => s.id === workflow.stage);
  const brandConfig = BRANDS.find((b) => b.id === workflow.brand)!;

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-3 mb-3">
        {/* Thumbnail */}
        {/* eslint-disable-next-line @next/next/no-img-element -- TODO(RIN-410): migrate to next/image */}
        <img
          src={workflow.imageUrl}
          alt={workflow.address}
          className="h-12 w-12 flex-shrink-0 rounded-lg object-cover"
        />
        <div className="min-w-0 flex-1">
          <h4 className="text-xs font-semibold text-gray-900 truncate">{workflow.address}</h4>
          <div className="flex items-center gap-2 mt-0.5">
            <span className={`inline-flex items-center gap-0.5 rounded px-1 py-0.5 text-[9px] font-semibold ${brandConfig.bgColor} ${brandConfig.color}`}>
              {brandConfig.nameHe}
            </span>
            <ComplianceBadge score={workflow.guardianScore} />
          </div>
        </div>
      </div>

      {/* Pipeline stages */}
      <div className="flex items-center gap-1 mb-3">
        {PIPELINE_STAGES.map((stage, i) => {
          const StageIcon = stage.icon;
          const isComplete = i < currentIdx;
          const isCurrent = i === currentIdx;

          return (
            <div key={stage.id} className="flex items-center gap-1 flex-1">
              <div
                className={`flex items-center justify-center rounded-full h-6 w-6 transition-all ${
                  isComplete
                    ? "bg-emerald-500 text-white"
                    : isCurrent
                      ? "bg-indigo-500 text-white ring-2 ring-indigo-200"
                      : "bg-slate-100 text-slate-400"
                }`}
                title={stage.label}
              >
                {isComplete ? (
                  <Check className="h-3 w-3" />
                ) : isCurrent ? (
                  <StageIcon className="h-3 w-3 animate-pulse" />
                ) : (
                  <StageIcon className="h-3 w-3" />
                )}
              </div>
              {i < PIPELINE_STAGES.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full ${isComplete ? "bg-emerald-300" : "bg-slate-200"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* QA checks row */}
      <div className="flex flex-wrap gap-1.5">
        {workflow.qaChecks.map((check) => (
          <span
            key={check.name}
            className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-[9px] font-semibold border ${
              check.verdict === "pass"
                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                : check.verdict === "warn"
                  ? "bg-amber-50 text-amber-700 border-amber-200"
                  : "bg-red-50 text-red-700 border-red-200"
            }`}
          >
            {check.verdict === "pass" ? (
              <CheckCircle2 className="h-2.5 w-2.5" />
            ) : check.verdict === "warn" ? (
              <ShieldAlert className="h-2.5 w-2.5" />
            ) : (
              <ShieldX className="h-2.5 w-2.5" />
            )}
            {check.name}
          </span>
        ))}
      </div>

      {/* Text coverage bar */}
      <div className="mt-2.5 flex items-center gap-2">
        <span className="text-[10px] text-slate-400 whitespace-nowrap">Text: {workflow.textCoveragePercent}%</span>
        <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              workflow.textCoveragePercent <= 15
                ? "bg-emerald-400"
                : workflow.textCoveragePercent <= 20
                  ? "bg-amber-400"
                  : "bg-red-400"
            }`}
            style={{ width: `${Math.min(workflow.textCoveragePercent / 25 * 100, 100)}%` }}
          />
        </div>
        <span className="text-[10px] text-slate-400">20% max</span>
      </div>

      {/* Export status */}
      <div className="mt-2 flex items-center gap-1.5">
        {workflow.exported ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-emerald-600">
            <Upload className="h-3 w-3" />
            Exported to Supabase &ldquo;Ready to Post&rdquo;
          </span>
        ) : workflow.stage === "done" || workflow.stage === "export" ? (
          <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600">
            <Loader2 className="h-3 w-3 animate-spin" />
            Exporting to Supabase...
          </span>
        ) : (
          <span className="text-[10px] text-slate-400">
            Awaiting pipeline completion
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Agent telemetry mock data
// ============================================================

interface TelemetryEvent {
  id: string;
  agent: string;
  action: string;
  detail: string;
  timestamp: Date;
  status: "running" | "done" | "queued";
}

const AGENT_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Extractor: Zap,
  Vision: Eye,
  Copywriter: Type,
  Director: Film,
  Matchmaker: Users,
  Critic: Bot,
};
const AGENT_COLORS: Record<string, string> = {
  Extractor: "text-amber-500",
  Vision: "text-cyan-500",
  Copywriter: "text-violet-500",
  Director: "text-rose-500",
  Matchmaker: "text-emerald-500",
  Critic: "text-orange-500",
};

const TELEMETRY_ACTIONS = [
  { agent: "Extractor", action: "Parsing", detail: "Hebrew WhatsApp message → structured data" },
  { agent: "Vision", action: "Analyzing", detail: "Property photos → Visual DNA extraction" },
  { agent: "Copywriter", action: "Generating", detail: "Marketing copy in Hebrew (hook + description)" },
  { agent: "Director", action: "Scripting", detail: "15s Reel script → 3 scenes composed" },
  { agent: "Matchmaker", action: "Scoring", detail: "Property ↔ Lead matching (6 candidates)" },
  { agent: "Critic", action: "Reviewing", detail: "Quality critique loop — iteration 2/3" },
  { agent: "Vision", action: "Complete", detail: "Quality score: 8/10 — Modern Mediterranean" },
  { agent: "Copywriter", action: "Complete", detail: "Hook: \"הגינה הפרטית שתמיד חלמתם עליה\"" },
  { agent: "Director", action: "Complete", detail: "3 scenes locked — Warm Acoustic Guitar" },
  { agent: "Matchmaker", action: "Complete", detail: "2 hot leads found (92, 78 match score)" },
  { agent: "Extractor", action: "Parsing", detail: "New listing from Yad2 → extracting fields" },
  { agent: "Critic", action: "Approved", detail: "Copy passed quality gate — ready for design" },
];

function useTelemetryFeed(): TelemetryEvent[] {
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const counterRef = useRef(0);

  useEffect(() => {
    // Seed initial events
    const initial: TelemetryEvent[] = TELEMETRY_ACTIONS.slice(0, 4).map((t, i) => ({
      id: `init-${i}`,
      agent: t.agent,
      action: t.action,
      detail: t.detail,
      timestamp: new Date(Date.now() - (4 - i) * 8000),
      status: i < 2 ? "done" as const : i === 2 ? "running" as const : "queued" as const,
    }));
    setEvents(initial);

    const interval = setInterval(() => {
      counterRef.current += 1;
      const idx = counterRef.current % TELEMETRY_ACTIONS.length;
      const template = TELEMETRY_ACTIONS[idx]!;

      setEvents((prev) => {
        const updated = prev.map((e) =>
          e.status === "running" ? { ...e, status: "done" as const } : e,
        );
        const newEvent: TelemetryEvent = {
          id: `evt-${counterRef.current}`,
          agent: template.agent,
          action: template.action,
          detail: template.detail,
          timestamp: new Date(),
          status: template.action === "Complete" || template.action === "Approved" ? "done" : "running",
        };
        return [...updated, newEvent].slice(-8);
      });
    }, 3500);

    return () => clearInterval(interval);
  }, []);

  return events;
}

// ============================================================
// Helper
// ============================================================

function formatPrice(price: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = Math.floor(diff / 3_600_000);
  if (hours < 1) return "Just now";
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

// ============================================================
// Brand Selector
// ============================================================

function BrandSelector({
  selected,
  onSelect,
}: {
  selected: Brand;
  onSelect: (b: Brand) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = BRANDS.find((b) => b.id === selected)!;
  const CurrentIcon = current.icon;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm font-medium transition-all hover:shadow-sm ${current.bgColor} ${current.borderColor} ${current.color}`}
      >
        <CurrentIcon className="h-4 w-4" />
        <span>{current.name}</span>
        <span className="text-xs opacity-60">({current.nameHe})</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-2 w-72 rounded-xl border border-(--color-border) bg-(--color-surface) p-2 shadow-xl">
            {BRANDS.map((brand) => {
              const Icon = brand.icon;
              const isActive = brand.id === selected;
              return (
                <button
                  key={brand.id}
                  onClick={() => {
                    onSelect(brand.id);
                    setOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-all ${
                    isActive
                      ? `${brand.bgColor} ${brand.color} font-semibold`
                      : "text-slate-600 hover:bg-(--color-surface-alt)"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <div className="flex-1">
                    <p className="font-medium">{brand.name}</p>
                    <p className="text-xs opacity-60">{brand.nameHe}</p>
                  </div>
                  {isActive && <Check className="h-4 w-4" />}
                </button>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ============================================================
// Today's Priorities
// ============================================================

function PriorityCard({ data }: { data: DashboardProperty }) {
  const brand = getPropertyBrand(data.property.id);
  const brandConfig = BRANDS.find((b) => b.id === brand)!;
  const BrandIcon = brandConfig.icon;

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex items-start gap-3">
        {/* Thumbnail */}
        {data.imageUrls[0] ? (
          // eslint-disable-next-line @next/next/no-img-element -- TODO(RIN-410): migrate to next/image
          <img
            src={data.imageUrls[0]}
            alt={data.address}
            className="h-16 w-16 flex-shrink-0 rounded-lg object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
            <Camera className="h-6 w-6 text-slate-300" />
          </div>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-semibold ${brandConfig.bgColor} ${brandConfig.color} ${brandConfig.borderColor} border`}>
              <BrandIcon className="h-2.5 w-2.5" />
              {brandConfig.nameHe}
            </span>
            <span className="text-[10px] text-slate-400">{timeAgo(data.property.updated_at)}</span>
          </div>
          <h4 className="text-sm font-semibold text-gray-900 truncate">{data.address}</h4>
          <p className="text-xs text-slate-400">{data.city} &middot; {formatPrice(data.property.price_asked)}</p>
        </div>
      </div>

      {/* AI Brief summary */}
      {data.shortHook && (
        <div className="mt-3 rounded-lg bg-indigo-50/70 border border-indigo-100 px-3 py-2">
          <p className="text-xs font-medium text-indigo-800 line-clamp-1">
            <Sparkles className="ml-1 inline h-3 w-3 text-indigo-400" />
            {data.shortHook}
          </p>
        </div>
      )}

      {/* Quick stats + compliance */}
      <div className="mt-3 flex items-center gap-3 text-[11px] text-slate-400">
        <ComplianceBadge score={100} />
        {data.reelScript && (
          <span className="flex items-center gap-1">
            <Film className="h-3 w-3" />
            {data.reelScript.length} scenes
          </span>
        )}
        {data.visualDna && (
          <span className="flex items-center gap-1">
            <Palette className="h-3 w-3" />
            {data.visualDna.style}
          </span>
        )}
        {data.matches.length > 0 && (
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {data.matches.length} leads
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Kanban Card
// ============================================================

function SocialCard({
  card,
  onClaim,
  onAdvance,
}: {
  card: KanbanCard;
  onClaim: () => void;
  onAdvance: () => void;
}) {
  const { property: data, assignee } = card;
  const brandConfig = BRANDS.find((b) => b.id === card.brand)!;
  const BrandIcon = brandConfig.icon;

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-4 shadow-sm hover:shadow-md transition-all">
      {/* Image + brand */}
      <div className="relative mb-3">
        {data.imageUrls[0] ? (
          <div className="relative aspect-[16/9] overflow-hidden rounded-lg">
            {/* eslint-disable-next-line @next/next/no-img-element -- TODO(RIN-410): migrate to next/image */}
            <img
              src={data.imageUrls[0]}
              alt={data.address}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            <span className={`absolute top-2 left-2 inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 text-[9px] font-semibold backdrop-blur-sm ${brandConfig.bgColor} ${brandConfig.color} ${brandConfig.borderColor}`}>
              <BrandIcon className="h-2.5 w-2.5" />
              {brandConfig.nameHe}
            </span>
            {data.cardPreview && (
              <div className="absolute bottom-2 left-2 right-2">
                <p className="text-[11px] font-bold text-white truncate drop-shadow">{data.cardPreview.headline}</p>
              </div>
            )}
          </div>
        ) : (
          <div className="flex aspect-[16/9] items-center justify-center rounded-lg bg-slate-100">
            <Camera className="h-8 w-8 text-slate-300" />
          </div>
        )}
      </div>

      {/* Info */}
      <h4 className="text-sm font-semibold text-gray-900 truncate">{data.address}</h4>
      <p className="text-xs text-slate-400 mb-2">{data.city} &middot; {formatPrice(data.property.price_asked)}</p>

      {/* AI Brief */}
      {data.shortHook && (
        <p className="rounded-lg bg-indigo-50/70 border border-indigo-100 px-2.5 py-1.5 text-[11px] font-medium text-indigo-800 line-clamp-2 mb-3">
          <Sparkles className="ml-1 inline h-2.5 w-2.5 text-indigo-400" />
          {data.shortHook}
        </p>
      )}

      {/* Visual DNA chips */}
      {data.visualDna && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-200 px-1.5 py-0.5 text-[10px] font-semibold text-violet-700">
            <Palette className="h-2.5 w-2.5" />
            {data.visualDna.style}
          </span>
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-1.5 py-0.5 text-[10px] font-semibold text-rose-700">
            <Heart className="h-2.5 w-2.5" />
            {data.visualDna.vibe}
          </span>
        </div>
      )}

      {/* Matches teaser */}
      {data.matches.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3 text-[11px] text-slate-400">
          <TrendingUp className="h-3 w-3" />
          {data.matches.filter((m) => m.score >= 80).length} hot lead{data.matches.filter((m) => m.score >= 80).length !== 1 ? "s" : ""} matched
        </div>
      )}

      {/* Compliance + Assignee + Actions */}
      <div className="flex items-center justify-between border-t border-(--color-border) pt-3">
        <div className="flex items-center gap-2">
          <ComplianceBadge score={card.complianceScore} />
          {assignee ? (
            <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              {assignee}
            </span>
          ) : (
            <button
              onClick={onClaim}
              className="inline-flex items-center gap-1 rounded-lg border border-indigo-200 bg-indigo-50 px-2 py-1 text-[11px] font-medium text-indigo-700 transition-all hover:bg-indigo-100"
            >
              <Hand className="h-3 w-3" />
              I&apos;m on it
            </button>
          )}
        </div>

        {card.column !== "live" && (
          card.complianceScore >= 100 ? (
            <button
              onClick={onAdvance}
              className="inline-flex items-center gap-1 rounded-lg bg-(--color-brand) px-2.5 py-1.5 text-[11px] font-medium text-white transition-all hover:bg-(--color-brand-hover)"
            >
              <ArrowRight className="h-3 w-3" />
              {card.column === "ready_to_design" ? "To Post" : "Go Live"}
            </button>
          ) : (
            <span className="text-[10px] text-red-500 font-medium">
              Guardian review needed
            </span>
          )
        )}

        {card.column === "live" && (
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 border border-emerald-200 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
            <Globe className="h-3 w-3" />
            Published
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Agent Telemetry Widget
// ============================================================

function AgentTelemetryWidget() {
  const events = useTelemetryFeed();

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-(--color-border) px-4 py-3 bg-gradient-to-r from-slate-50 to-white">
        <div className="relative">
          <Cpu className="h-4 w-4 text-indigo-500" />
          <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-emerald-400 status-pulse" />
        </div>
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
          Agent Studio — Live
        </h3>
      </div>

      {/* Event feed */}
      <div className="divide-y divide-(--color-border) max-h-[420px] overflow-y-auto">
        {events.map((event) => {
          const AgentIcon = AGENT_ICONS[event.agent] ?? Bot;
          const agentColor = AGENT_COLORS[event.agent] ?? "text-slate-500";

          return (
            <div
              key={event.id}
              className={`flex items-start gap-2.5 px-4 py-2.5 transition-colors ${
                event.status === "running" ? "bg-indigo-50/50" : ""
              }`}
            >
              {/* Agent icon */}
              <div className="mt-0.5 flex-shrink-0">
                {event.status === "running" ? (
                  <Loader2 className={`h-3.5 w-3.5 animate-spin ${agentColor}`} />
                ) : event.status === "done" ? (
                  <AgentIcon className={`h-3.5 w-3.5 ${agentColor}`} />
                ) : (
                  <Clock className="h-3.5 w-3.5 text-slate-300" />
                )}
              </div>

              {/* Content */}
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className={`text-[11px] font-semibold ${agentColor}`}>
                    {event.agent}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {event.action}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate">{event.detail}</p>
              </div>

              {/* Status dot */}
              <div className="mt-1 flex-shrink-0">
                {event.status === "running" && (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-indigo-500 status-pulse" />
                )}
                {event.status === "done" && (
                  <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                )}
                {event.status === "queued" && (
                  <span className="inline-flex h-1.5 w-1.5 rounded-full bg-slate-300" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer pulse */}
      <div className="flex items-center gap-2 border-t border-(--color-border) px-4 py-2 bg-slate-50/50">
        <Activity className="h-3 w-3 text-emerald-500" />
        <span className="text-[10px] text-slate-400">
          AI Swarm active — {events.filter((e) => e.status === "running").length} agent{events.filter((e) => e.status === "running").length !== 1 ? "s" : ""} working
        </span>
      </div>
    </div>
  );
}

// ============================================================
// Page
// ============================================================

export default function MissionControlPage() {
  const [selectedBrand, setSelectedBrand] = useState<Brand>("all");
  const [cards, setCards] = useState<KanbanCard[]>(() =>
    MOCK_DASHBOARD_PROPERTIES.filter((p) => p.reelScript && p.reelScript.length > 0).map((p) => {
      // Mock compliance: published = 100, in_review = 80, others = 100
      const score = p.marketingStatus === "in_review" ? 80 : 100;
      return {
        property: p,
        column: resolveColumn(p),
        assignee: p.marketingStatus === "published" ? "Sarah K." : null,
        brand: getPropertyBrand(p.property.id),
        complianceScore: score,
      };
    }),
  );
  const [workflows] = useState<AssetWorkflow[]>(() => buildMockWorkflows());

  const filteredCards =
    selectedBrand === "all"
      ? cards
      : cards.filter((c) => c.brand === selectedBrand);

  // Today's priorities: just-finished AI processing (have script, not yet published)
  const priorities = MOCK_DASHBOARD_PROPERTIES.filter((p) => {
    if (selectedBrand !== "all" && getPropertyBrand(p.property.id) !== selectedBrand) return false;
    return p.reelScript && p.reelScript.length > 0 && p.marketingStatus !== "published";
  });

  function handleClaim(propertyId: string) {
    setCards((prev) =>
      prev.map((c) =>
        c.property.property.id === propertyId
          ? { ...c, assignee: "You" }
          : c,
      ),
    );
  }

  function handleAdvance(propertyId: string) {
    setCards((prev) =>
      prev.map((c) => {
        if (c.property.property.id !== propertyId) return c;
        const next: KanbanColumn =
          c.column === "ready_to_design" ? "ready_to_post" : "live";
        return { ...c, column: next };
      }),
    );
  }

  const columns: KanbanColumn[] = ["ready_to_design", "ready_to_post", "live"];

  return (
    <div className="flex h-full">
      {/* Main content */}
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header + Brand Selector */}
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Mission Control</h1>
            <p className="mt-1 text-sm text-slate-500">
              Team workspace — manage social assets across all brands
            </p>
          </div>
          <BrandSelector selected={selectedBrand} onSelect={setSelectedBrand} />
        </div>

        {/* Today's Priorities */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-4.5 w-4.5 text-amber-500" />
            <h2 className="text-base font-bold text-gray-900">Today&apos;s Priorities</h2>
            <span className="rounded-full bg-amber-50 border border-amber-200 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
              {priorities.length} properties
            </span>
          </div>
          {priorities.length > 0 ? (
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
              {priorities.map((p) => (
                <PriorityCard key={p.property.id} data={p} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-alt) p-8 text-center">
              <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-400 mb-2" />
              <p className="text-sm font-medium text-slate-500">All caught up!</p>
              <p className="text-xs text-slate-400">No pending priorities for this brand.</p>
            </div>
          )}
        </section>

        {/* Live Workflow — Guardian & Visual QA per asset */}
        <section className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Workflow className="h-4.5 w-4.5 text-violet-500" />
            <h2 className="text-base font-bold text-gray-900">Live Workflow</h2>
            <span className="rounded-full bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
              Guardian + Visual QA
            </span>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
            {workflows
              .filter((w) => selectedBrand === "all" || w.brand === selectedBrand)
              .map((w) => (
                <WorkflowPipeline key={w.propertyId} workflow={w} />
              ))}
          </div>
          {workflows.filter((w) => selectedBrand === "all" || w.brand === selectedBrand).length === 0 && (
            <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-alt) p-8 text-center">
              <ScanEye className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-sm font-medium text-slate-500">No assets in pipeline</p>
              <p className="text-xs text-slate-400">Process properties to see QA status here.</p>
            </div>
          )}
        </section>

        {/* Social Dispatch Board — Kanban */}
        <section>
          <div className="flex items-center gap-2 mb-4">
            <Rocket className="h-4.5 w-4.5 text-indigo-500" />
            <h2 className="text-base font-bold text-gray-900">Social Dispatch</h2>
          </div>

          <div className="grid grid-cols-3 gap-4">
            {columns.map((col) => {
              const config = COLUMN_CONFIG[col];
              const colCards = filteredCards.filter((c) => c.column === col);
              const ColIcon = config.icon;

              return (
                <div key={col} className="space-y-3">
                  {/* Column header */}
                  <div className="flex items-center gap-2 rounded-xl bg-(--color-surface) border border-(--color-border) px-4 py-3 shadow-sm">
                    <span className={`h-2 w-2 rounded-full ${config.dotColor}`} />
                    <ColIcon className={`h-4 w-4 ${config.color}`} />
                    <span className="text-sm font-semibold text-gray-900">{config.title}</span>
                    <span className="mr-auto rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                      {colCards.length}
                    </span>
                  </div>

                  {/* Cards */}
                  <div className="space-y-3">
                    {colCards.map((card) => (
                      <SocialCard
                        key={card.property.property.id}
                        card={card}
                        onClaim={() => handleClaim(card.property.property.id)}
                        onAdvance={() => handleAdvance(card.property.property.id)}
                      />
                    ))}

                    {colCards.length === 0 && (
                      <div className="rounded-xl border border-dashed border-(--color-border) bg-(--color-surface-alt) p-6 text-center">
                        <p className="text-xs text-slate-400">No items</p>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>

      {/* Right sidebar — Agent Telemetry */}
      <aside className="w-80 flex-shrink-0 border-l border-(--color-border) bg-(--color-surface-alt) p-4 overflow-y-auto">
        <AgentTelemetryWidget />
      </aside>
    </div>
  );
}
