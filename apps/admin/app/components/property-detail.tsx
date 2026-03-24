"use client";

import { useState } from "react";
import {
  Copy, Check, Sparkles, Eye, Image, Info,
  Film, Music, Camera, Type, Palette, Heart, Zap,
  Users, MessageCircle, TrendingUp,
} from "lucide-react";
import { type DashboardProperty, type LeadMatchDisplay, STATUS_CONFIG } from "../data/mock";

function formatPrice(price: number): string {
  return new Intl.NumberFormat("he-IL", {
    style: "currency",
    currency: "ILS",
    maximumFractionDigits: 0,
  }).format(price);
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 rounded-lg border border-(--color-border) bg-(--color-surface) px-3 py-1.5 text-xs font-medium text-slate-500 transition-all hover:border-indigo-300 hover:text-indigo-600 hover:shadow-sm"
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-emerald-500" />
          <span className="text-emerald-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label}
        </>
      )}
    </button>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </h3>
      {children}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const color =
    score >= 85
      ? "from-emerald-500 to-emerald-600 text-white"
      : score >= 70
        ? "from-blue-500 to-blue-600 text-white"
        : "from-slate-400 to-slate-500 text-white";

  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br text-xs font-bold ${color}`}
    >
      {score}
    </span>
  );
}

function whatsappLink(phone: string, message: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0") ? `972${digits.slice(1)}` : digits;
  return `https://wa.me/${international}?text=${encodeURIComponent(message)}`;
}

export function PropertyDetail({ data }: { data: DashboardProperty }) {
  const { property, address, city, shortHook, fullDescription, visionTags, qualityScore, visualDna, reelScript, matches, imageUrls, marketingStatus } = data;
  const config = STATUS_CONFIG[marketingStatus];

  return (
    <div className="space-y-5 rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-base font-semibold text-gray-900">{address}</h2>
          <p className="mt-0.5 text-sm text-slate-500">
            {city} &middot; {formatPrice(property.price_asked)}
          </p>
        </div>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.bgColor} ${config.textColor}`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${config.dotColor} ${config.pulse ? "status-pulse" : ""}`} />
          {config.label}
        </span>
      </div>

      {/* Visual DNA */}
      {visualDna && (
        <div className="space-y-2.5">
          <SectionHeader icon={Palette} title="Visual DNA" />
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-50 to-fuchsia-50 border border-violet-200 px-3 py-1.5 text-xs font-semibold text-violet-700">
              <Palette className="h-3 w-3" />
              {visualDna.style}
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700">
              <Heart className="h-3 w-3" />
              {visualDna.vibe}
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visualDna.strengths.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs text-emerald-700"
              >
                <Zap className="h-2.5 w-2.5" />
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* AI Hook */}
      {shortHook && (
        <div className="space-y-2">
          <SectionHeader icon={Sparkles} title="AI Hook">
            <CopyButton text={shortHook} label="Copy" />
          </SectionHeader>
          <p className="rounded-lg bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 px-4 py-3 text-sm font-medium text-indigo-900">
            {shortHook}
          </p>
        </div>
      )}

      {/* Full Description */}
      {fullDescription && (
        <div className="space-y-2">
          <SectionHeader icon={Sparkles} title="Full Description">
            <CopyButton text={fullDescription} label="Copy" />
          </SectionHeader>
          <p className="rounded-lg bg-(--color-surface-alt) px-4 py-3 text-sm leading-relaxed text-slate-600">
            {fullDescription}
          </p>
        </div>
      )}

      {/* Video Assets — Reel Script Timeline */}
      {reelScript && reelScript.length > 0 && (
        <div className="space-y-3">
          <SectionHeader icon={Film} title="Video Assets — 15s Reel Script" />
          <div className="relative space-y-0">
            {reelScript.map((scene, i) => (
              <div key={i} className="relative flex gap-3 pb-4 last:pb-0">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  <div className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-600">
                    {i + 1}
                  </div>
                  {i < reelScript.length - 1 && (
                    <div className="mt-1 w-px flex-1 bg-indigo-100" />
                  )}
                </div>

                {/* Scene content */}
                <div className="flex-1 rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3 space-y-2">
                  <div className="flex items-start gap-1.5 text-xs text-slate-600">
                    <Camera className="mt-0.5 h-3 w-3 flex-shrink-0 text-slate-400" />
                    <span>{scene.visual_cue}</span>
                  </div>
                  <div className="flex items-start gap-1.5 text-xs font-semibold text-indigo-700">
                    <Type className="mt-0.5 h-3 w-3 flex-shrink-0 text-indigo-400" />
                    <span>&ldquo;{scene.text_overlay}&rdquo;</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                    <Music className="h-3 w-3" />
                    {scene.audio_vibe}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Potential Matches */}
      {matches.length > 0 && (
        <div className="space-y-3">
          <SectionHeader icon={Users} title={`Potential Matches (${matches.length})`}>
            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-600">
              <TrendingUp className="ml-1 inline h-3 w-3" />
              {matches.filter((m) => m.score >= 80).length} hot
            </span>
          </SectionHeader>
          <div className="space-y-2">
            {matches.map((match) => (
              <div
                key={match.leadPhone}
                className="rounded-lg border border-(--color-border) bg-(--color-surface-alt) p-3"
              >
                <div className="flex items-start gap-3">
                  <ScoreBadge score={match.score} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-slate-800">{match.leadName}</p>
                      <span className="text-[11px] text-slate-400">{match.leadPhone}</span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-slate-400">
                      Budget: {new Intl.NumberFormat("he-IL", { style: "currency", currency: "ILS", maximumFractionDigits: 0 }).format(match.budgetMax)}
                      {" "}&middot; {match.cityPreferred} &middot; {match.specificNeeds}
                    </p>
                    <p className="mt-1.5 text-xs text-slate-600">{match.reasoning}</p>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-2">
                  <a
                    href={whatsappLink(match.leadPhone, match.whatsappHook)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#25D366] to-[#128C7E] px-3 py-1.5 text-xs font-medium text-white shadow-sm transition-all hover:shadow-md hover:brightness-110"
                  >
                    <MessageCircle className="h-3 w-3" />
                    Send WhatsApp
                  </a>
                  <CopyButton text={match.whatsappHook} label="Copy Message" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Vision Tags */}
      {visionTags.length > 0 && (
        <div className="space-y-2">
          <SectionHeader icon={Eye} title="Vision Analysis">
            {qualityScore !== null && (
              <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                {qualityScore}/10
              </span>
            )}
          </SectionHeader>
          <div className="flex flex-wrap gap-1.5">
            {visionTags.map((tag) => (
              <span
                key={tag}
                className="rounded-md border border-(--color-border) bg-(--color-surface-alt) px-2.5 py-1 text-xs text-slate-600"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Image URLs */}
      {imageUrls.length > 0 && (
        <div className="space-y-2">
          <SectionHeader icon={Image} title={`Image Assets (${imageUrls.length})`} />
          <div className="space-y-1.5">
            {imageUrls.map((url, i) => (
              <div
                key={url}
                className="flex items-center justify-between rounded-lg bg-(--color-surface-alt) px-3 py-2"
              >
                <span className="truncate pl-3 font-mono text-[11px] text-slate-400">
                  {i + 1}. {url.split("photo-")[1]?.split("?")[0] ?? url}
                </span>
                <CopyButton text={url} label="Copy" />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Property metadata */}
      <div className="space-y-2 border-t border-(--color-border) pt-4">
        <SectionHeader icon={Info} title="Property Details" />
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
          <div>
            <dt className="text-xs text-slate-400">Owner Phone</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{property.owner_phone}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Property Status</dt>
            <dd className="mt-0.5 font-medium capitalize text-slate-700">{property.status}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Created</dt>
            <dd className="mt-0.5 font-medium text-slate-700">
              {new Date(property.created_at).toLocaleDateString("en-IL")}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">ID</dt>
            <dd className="mt-0.5 font-mono text-[11px] text-slate-400">{property.id}</dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
