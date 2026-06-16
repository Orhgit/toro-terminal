"use client";

import { useState } from "react";
import NextImage from "next/image";
import {
  Film,
  Camera,
  Type,
  Music,
  X,
  Copy,
  Check,
  Palette,
  Heart,
  Clapperboard,
  Sparkles,
  Clock,
  CheckCircle2,
  Loader2,
  Wand2,
  Image,
  Eye,
} from "lucide-react";
import {
  MOCK_DASHBOARD_PROPERTIES,
  type DashboardProperty,
  type GeneratedAsset,
  type CardPreview,
  type VisualStylePreview,
} from "../data/mock";

// ============================================================
// Task status mapping
// ============================================================

type TaskStatus = "no_script" | "script_ready" | "assets_generated" | "in_production" | "done";

function getTaskStatus(p: DashboardProperty): TaskStatus {
  if (!p.reelScript || p.reelScript.length === 0) return "no_script";
  if (p.marketingStatus === "published") return "done";
  if (p.marketingStatus === "in_review") return "in_production";
  if (p.generatedAssets && p.generatedAssets.length > 0) return "assets_generated";
  return "script_ready";
}

const TASK_STATUS_CONFIG: Record<
  TaskStatus,
  { label: string; icon: React.ComponentType<{ className?: string }>; color: string }
> = {
  no_script: { label: "Awaiting AI", icon: Loader2, color: "bg-amber-50 text-amber-700 border-amber-200" },
  script_ready: { label: "Script Ready", icon: Clapperboard, color: "bg-blue-50 text-blue-700 border-blue-200" },
  assets_generated: { label: "Assets Generated", icon: Image, color: "bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200" },
  in_production: { label: "In Production", icon: Clock, color: "bg-violet-50 text-violet-700 border-violet-200" },
  done: { label: "Done", icon: CheckCircle2, color: "bg-emerald-50 text-emerald-700 border-emerald-200" },
};

// ============================================================
// Copy helper
// ============================================================

function useClipboard() {
  const [copied, setCopied] = useState(false);

  async function copy(text: string) {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return { copied, copy };
}

// ============================================================
// Mock asset generation logic (simulates overlay + social packager)
// ============================================================

function generateMockAssets(p: DashboardProperty): {
  assets: GeneratedAsset[];
  cardPreview: CardPreview;
  visualStyle: VisualStylePreview;
} {
  const formattedPrice = `₪${p.property.price_asked.toLocaleString("he-IL")}`;

  const assets: GeneratedAsset[] = p.imageUrls.map((url) => ({
    renderedUrl: `${url}${url.includes("?") ? "&" : "?"}overlay=toro`,
    overlayApplied: true,
  }));

  // Pick style preset based on visual DNA
  const vibe = (p.visualDna?.vibe ?? "").toLowerCase();
  const style = (p.visualDna?.style ?? "").toLowerCase();
  const combined = `${vibe} ${style}`;

  let primaryColor = "#6366f1";
  let secondaryColor = "#818cf8";
  let headingFont = "Inter";
  let borderRadius = 12;

  if (combined.includes("luxury") || combined.includes("executive")) {
    primaryColor = "#1a1a2e";
    secondaryColor = "#c9a84c";
    headingFont = "Playfair Display";
    borderRadius = 4;
  } else if (combined.includes("cozy") || combined.includes("family") || combined.includes("warm")) {
    primaryColor = "#78350f";
    secondaryColor = "#d97706";
    headingFont = "Merriweather";
    borderRadius = 16;
  } else if (combined.includes("minimalist") || combined.includes("clean") || combined.includes("young")) {
    primaryColor = "#18181b";
    secondaryColor = "#71717a";
    headingFont = "DM Sans";
    borderRadius = 8;
  }

  return {
    assets,
    cardPreview: {
      headline: p.shortHook,
      subline: formattedPrice,
      accentColor: secondaryColor,
      badgeText: p.visualDna?.style ?? "Property",
    },
    visualStyle: {
      primaryColor,
      secondaryColor,
      headingFont,
      borderRadius,
    },
  };
}

// ============================================================
// Script Modal
// ============================================================

function ScriptModal({
  property,
  onClose,
}: {
  property: DashboardProperty;
  onClose: () => void;
}) {
  const { copied, copy } = useClipboard();
  const scenes = property.reelScript ?? [];

  const fullScriptText = scenes
    .map(
      (s, i) =>
        `Scene ${i + 1}:\nVisual: ${s.visual_cue}\nText: ${s.text_overlay}\nAudio: ${s.audio_vibe}`
    )
    .join("\n\n");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-2xl rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Film className="h-5 w-5 text-indigo-500" />
              <h2 className="text-lg font-bold text-gray-900">Reel Script — 15s</h2>
            </div>
            <p className="text-sm text-slate-500">{property.address}, {property.city}</p>
            {property.visualDna && (
              <div className="mt-2 flex gap-2">
                <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
                  <Palette className="h-2.5 w-2.5" />
                  {property.visualDna.style}
                </span>
                <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 border border-rose-200 px-2 py-0.5 text-[11px] font-semibold text-rose-700">
                  <Heart className="h-2.5 w-2.5" />
                  {property.visualDna.vibe}
                </span>
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-alt) hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Timeline */}
        <div className="space-y-0 mb-6">
          {scenes.map((scene, i) => (
            <div key={i} className="relative flex gap-4 pb-5 last:pb-0">
              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 text-sm font-bold text-white shadow-md shadow-indigo-500/20">
                  {i + 1}
                </div>
                {i < scenes.length - 1 && (
                  <div className="mt-1 w-px flex-1 bg-gradient-to-b from-indigo-200 to-transparent" />
                )}
              </div>

              {/* Scene card */}
              <div className="flex-1 rounded-xl border border-(--color-border) bg-(--color-surface-alt) p-4 space-y-2.5">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  <span>{i === 0 ? "Hook — 0-5s" : i === 1 ? "Showcase — 5-10s" : "CTA — 10-15s"}</span>
                </div>
                <div className="flex items-start gap-2 text-sm text-slate-700">
                  <Camera className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                  <span>{scene.visual_cue}</span>
                </div>
                <div className="flex items-start gap-2 text-sm font-semibold text-indigo-800">
                  <Type className="mt-0.5 h-4 w-4 flex-shrink-0 text-indigo-400" />
                  <span>&ldquo;{scene.text_overlay}&rdquo;</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-400">
                  <Music className="h-3.5 w-3.5" />
                  {scene.audio_vibe}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-(--color-border) pt-4">
          <p className="text-xs text-slate-400">
            Generated by Toro AI Director Agent
          </p>
          <button
            onClick={() => copy(fullScriptText)}
            className="inline-flex items-center gap-2 rounded-lg bg-(--color-brand) px-4 py-2 text-xs font-medium text-white transition-all hover:bg-(--color-brand-hover)"
          >
            {copied ? (
              <>
                <Check className="h-3.5 w-3.5" />
                Copied!
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5" />
                Copy Script to Clipboard
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Asset Preview Modal — shows the "designed" property card
// ============================================================

function AssetPreviewModal({
  property,
  onClose,
}: {
  property: DashboardProperty;
  onClose: () => void;
}) {
  const card = property.cardPreview;
  const style = property.visualStyle;
  const assets = property.generatedAssets ?? [];

  if (!card || !style) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-4 w-full max-w-lg rounded-2xl border border-(--color-border) bg-(--color-surface) p-8 shadow-2xl">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="h-5 w-5 text-fuchsia-500" />
              <h2 className="text-lg font-bold text-gray-900">Generated Property Card</h2>
            </div>
            <p className="text-sm text-slate-500">{property.address}, {property.city}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-(--color-surface-alt) hover:text-slate-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Property Card Preview */}
        <div
          className="relative overflow-hidden shadow-lg"
          style={{ borderRadius: `${style.borderRadius}px` }}
        >
          {/* Hero image with overlay simulation */}
          <div className="relative aspect-[4/3]">
            {assets.length > 0 && property.imageUrls[0] ? (
              <NextImage
                src={property.imageUrls[0]}
                alt={property.address}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200">
                <Image className="h-12 w-12 text-slate-400" />
              </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

            {/* Toro Logo badge */}
            <div className="absolute top-3 left-3">
              <span
                className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-black tracking-wider text-white"
                style={{ backgroundColor: style.primaryColor }}
              >
                TORO
              </span>
            </div>

            {/* Style badge */}
            <div className="absolute top-3 right-3">
              <span
                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-white backdrop-blur-sm"
                style={{ backgroundColor: `${card.accentColor}cc` }}
              >
                <Palette className="h-2.5 w-2.5" />
                {card.badgeText}
              </span>
            </div>

            {/* Bottom text overlays */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
              <p className="text-base font-bold text-white leading-tight drop-shadow-md">
                {card.headline}
              </p>
              <p
                className="mt-1 text-xl font-black drop-shadow-md"
                style={{ color: card.accentColor }}
              >
                {card.subline}
              </p>
            </div>
          </div>
        </div>

        {/* Visual Style Info */}
        <div className="mt-5 space-y-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Applied Visual Style
          </h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3">
              <p className="text-[11px] text-slate-400 mb-1.5">Color Palette</p>
              <div className="flex gap-2">
                <div
                  className="h-6 w-6 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: style.primaryColor }}
                  title={`Primary: ${style.primaryColor}`}
                />
                <div
                  className="h-6 w-6 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: style.secondaryColor }}
                  title={`Secondary: ${style.secondaryColor}`}
                />
                <div
                  className="h-6 w-6 rounded-full border border-white shadow-sm"
                  style={{ backgroundColor: card.accentColor }}
                  title={`Accent: ${card.accentColor}`}
                />
              </div>
            </div>
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3">
              <p className="text-[11px] text-slate-400 mb-1.5">Typography</p>
              <p className="text-sm font-semibold text-slate-700">{style.headingFont}</p>
            </div>
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3">
              <p className="text-[11px] text-slate-400 mb-1.5">Border Radius</p>
              <p className="text-sm font-semibold text-slate-700">{style.borderRadius}px</p>
            </div>
            <div className="rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3">
              <p className="text-[11px] text-slate-400 mb-1.5">Branded Assets</p>
              <p className="text-sm font-semibold text-slate-700">{assets.length} image{assets.length !== 1 ? "s" : ""}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex items-center justify-between border-t border-(--color-border) pt-4">
          <p className="text-xs text-slate-400">
            Generated by Toro Visual Studio &amp; Social Packager
          </p>
          <div className="flex items-center gap-1.5">
            <span className="inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            <span className="text-xs font-medium text-emerald-600">Ready for production</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Task Card
// ============================================================

function TaskCard({
  data,
  onViewScript,
  onMagicGenerate,
  onViewAssets,
}: {
  data: DashboardProperty;
  onViewScript: () => void;
  onMagicGenerate: () => void;
  onViewAssets: () => void;
}) {
  const taskStatus = getTaskStatus(data);
  const config = TASK_STATUS_CONFIG[taskStatus];
  const StatusIcon = config.icon;

  return (
    <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm transition-all hover:shadow-md">
      {/* Status + Visual DNA */}
      <div className="flex items-center justify-between mb-3">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium ${config.color}`}
        >
          <StatusIcon className={`h-3 w-3 ${taskStatus === "no_script" ? "animate-spin" : ""}`} />
          {config.label}
        </span>
        {data.visualDna && (
          <span className="inline-flex items-center gap-1 rounded-md bg-violet-50 border border-violet-200 px-2 py-0.5 text-[11px] font-semibold text-violet-700">
            <Palette className="h-2.5 w-2.5" />
            {data.visualDna.style}
          </span>
        )}
      </div>

      {/* Address */}
      <h3 className="text-sm font-semibold text-gray-900">{data.address}</h3>
      <p className="mt-0.5 text-xs text-slate-400">{data.city}</p>

      {/* Hook preview */}
      {data.shortHook && (
        <p className="mt-3 rounded-lg bg-indigo-50/70 border border-indigo-100 px-3 py-2 text-xs font-medium text-indigo-800 line-clamp-2">
          <Sparkles className="ml-1 inline h-3 w-3 text-indigo-400" />
          {data.shortHook}
        </p>
      )}

      {/* Generated Card Preview (thumbnail) */}
      {taskStatus === "assets_generated" && data.cardPreview && data.visualStyle && (
        <div
          className="mt-3 relative overflow-hidden cursor-pointer group"
          style={{ borderRadius: `${data.visualStyle.borderRadius}px` }}
          onClick={onViewAssets}
        >
          <div className="relative aspect-[16/9]">
            {data.imageUrls[0] ? (
              <NextImage
                src={data.imageUrls[0]}
                alt={data.address}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-slate-200">
                <Image className="h-8 w-8 text-slate-400" />
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
            <span
              className="absolute top-2 left-2 inline-flex items-center rounded px-1.5 py-0.5 text-[9px] font-black tracking-wider text-white"
              style={{ backgroundColor: data.visualStyle.primaryColor }}
            >
              TORO
            </span>
            <div className="absolute bottom-2 left-2 right-2">
              <p className="text-[11px] font-bold text-white truncate drop-shadow">{data.cardPreview.headline}</p>
              <p
                className="text-xs font-black drop-shadow"
                style={{ color: data.cardPreview.accentColor }}
              >
                {data.cardPreview.subline}
              </p>
            </div>
            {/* Hover overlay */}
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="inline-flex items-center gap-1 rounded-lg bg-white/90 px-3 py-1.5 text-xs font-medium text-slate-700">
                <Eye className="h-3 w-3" />
                View Full Preview
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Scene count + actions */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-slate-400">
          {data.reelScript ? (
            <span className="flex items-center gap-1">
              <Film className="h-3 w-3" />
              {data.reelScript.length} scenes &middot; 15s
            </span>
          ) : (
            <span className="flex items-center gap-1">
              <Loader2 className="h-3 w-3 animate-spin" />
              AI generating script...
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Magic Generate button — only for script_ready */}
          {taskStatus === "script_ready" && (
            <button
              onClick={onMagicGenerate}
              className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-fuchsia-500 to-violet-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
            >
              <Wand2 className="h-3 w-3" />
              Magic Generate
            </button>
          )}

          {/* View Assets — for assets_generated state */}
          {taskStatus === "assets_generated" && (
            <button
              onClick={onViewAssets}
              className="inline-flex items-center gap-1.5 rounded-lg bg-fuchsia-500 px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-fuchsia-600"
            >
              <Image className="h-3 w-3" />
              View Assets
            </button>
          )}

          {/* View Script — always available if script exists */}
          {data.reelScript && data.reelScript.length > 0 && (
            <button
              onClick={onViewScript}
              className="inline-flex items-center gap-1.5 rounded-lg bg-(--color-brand) px-3 py-1.5 text-xs font-medium text-white transition-all hover:bg-(--color-brand-hover)"
            >
              <Clapperboard className="h-3 w-3" />
              View Script
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Page
// ============================================================

export default function MarketingTasksPage() {
  const [properties, setProperties] = useState<DashboardProperty[]>(
    MOCK_DASHBOARD_PROPERTIES,
  );
  const [selectedProperty, setSelectedProperty] = useState<DashboardProperty | null>(null);
  const [previewProperty, setPreviewProperty] = useState<DashboardProperty | null>(null);
  const [generating, setGenerating] = useState<string | null>(null);

  function handleMagicGenerate(propertyId: string) {
    setGenerating(propertyId);

    // Simulate a short processing delay
    setTimeout(() => {
      setProperties((prev) =>
        prev.map((p) => {
          if (p.property.id !== propertyId) return p;

          const { assets, cardPreview, visualStyle } = generateMockAssets(p);
          return {
            ...p,
            generatedAssets: assets,
            cardPreview,
            visualStyle,
          };
        }),
      );
      setGenerating(null);
    }, 1500);
  }

  const stats = {
    total: properties.length,
    ready: properties.filter((t) => getTaskStatus(t) === "script_ready").length,
    generated: properties.filter((t) => getTaskStatus(t) === "assets_generated").length,
    done: properties.filter((t) => getTaskStatus(t) === "done").length,
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Marketing Tasks</h1>
          <p className="mt-1 text-sm text-slate-500">
            AI-Generated Reel Scripts & Creative Assets
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-blue-500">{stats.ready}</p>
            <p className="text-xs text-slate-400">Scripts Ready</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-fuchsia-500">{stats.generated}</p>
            <p className="text-xs text-slate-400">Assets Ready</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-emerald-500">{stats.done}</p>
            <p className="text-xs text-slate-400">Done</p>
          </div>
        </div>
      </div>

      {/* Task Grid */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
        {properties.map((task) => {
          const isGenerating = generating === task.property.id;

          return isGenerating ? (
            <div
              key={task.property.id}
              className="rounded-xl border border-fuchsia-200 bg-gradient-to-br from-fuchsia-50 to-violet-50 p-5 shadow-sm"
            >
              <div className="flex flex-col items-center justify-center py-8 space-y-3">
                <div className="relative">
                  <Wand2 className="h-8 w-8 text-fuchsia-500 animate-pulse" />
                  <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-violet-400 animate-bounce" />
                </div>
                <p className="text-sm font-semibold text-fuchsia-700">Generating Assets...</p>
                <p className="text-xs text-fuchsia-400">
                  Burning overlays &amp; packaging styles
                </p>
                <div className="flex gap-1">
                  <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <div className="h-1.5 w-1.5 rounded-full bg-fuchsia-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </div>
          ) : (
            <TaskCard
              key={task.property.id}
              data={task}
              onViewScript={() => setSelectedProperty(task)}
              onMagicGenerate={() => handleMagicGenerate(task.property.id)}
              onViewAssets={() => setPreviewProperty(task)}
            />
          );
        })}
      </div>

      {/* Script Modal */}
      {selectedProperty && (
        <ScriptModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}

      {/* Asset Preview Modal */}
      {previewProperty && (
        <AssetPreviewModal
          property={previewProperty}
          onClose={() => setPreviewProperty(null)}
        />
      )}
    </div>
  );
}
