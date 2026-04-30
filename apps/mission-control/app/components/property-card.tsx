"use client";

import { useState } from "react";
import {
  MapPin,
  Bed,
  Maximize,
  Building2,
  Users,
  MessageCircle,
  Copy,
  Check,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  Eye,
  Sparkles,
  ScanEye,
  ShieldCheck,
} from "lucide-react";
import type { DashboardProperty } from "../data/properties";
import { STATUS_CONFIG } from "../data/properties";
import { ComplianceBadge } from "./compliance-badge";
import { VideoPreview } from "./video-preview";

export function PropertyCard({
  data,
  onOpenLanding,
}: {
  data: DashboardProperty;
  onOpenLanding: (id: string) => void;
}) {
  const [imgIndex, setImgIndex] = useState(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"copy" | "reel" | "matches">("copy");

  const status = STATUS_CONFIG[data.marketingStatus];
  const hasImages = data.imageUrls.length > 0;
  const price = data.property.price_asked.toLocaleString("he-IL");

  function copyToClipboard(text: string, field: string) {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }

  function nextImage() {
    setImgIndex((i) => (i + 1) % data.imageUrls.length);
  }

  function prevImage() {
    setImgIndex((i) => (i - 1 + data.imageUrls.length) % data.imageUrls.length);
  }

  return (
    <div className="card animate-fade-in overflow-hidden">
      {/* ── Image Carousel ─────────────────────────────────── */}
      <div className="relative aspect-[16/9] bg-zinc-900 overflow-hidden">
        {hasImages ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element -- TODO(RIN-410): migrate to next/image */}
            <img
              src={data.imageUrls[imgIndex]}
              alt={data.address}
              className="w-full h-full object-cover"
            />

            {/* Navigation arrows */}
            {data.imageUrls.length > 1 && (
              <>
                <button
                  onClick={nextImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  onClick={prevImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 transition-colors"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            )}

            {/* Image dots */}
            {data.imageUrls.length > 1 && (
              <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5">
                {data.imageUrls.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`h-1.5 rounded-full transition-all ${
                      i === imgIndex
                        ? "w-6 bg-white"
                        : "w-1.5 bg-white/40 hover:bg-white/60"
                    }`}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <Building2 className="h-10 w-10 text-zinc-700 mx-auto mb-2" />
              <p className="text-xs text-(--color-text-muted)">Processing images...</p>
            </div>
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

        {/* Meta-Safe pulse ring — only for guardian-approved properties */}
        {data.guardian?.verdict === "safe" && (
          <div className="absolute inset-0 rounded-t-[11px] pointer-events-none animate-meta-safe" />
        )}

        {/* Price tag — glassmorphism */}
        <div className="absolute bottom-3 right-3 glass-price rounded-xl px-4 py-2">
          <span className="text-white text-lg font-bold tracking-tight">
            ₪{price}
          </span>
        </div>

        {/* Hunt source badge */}
        {data.huntSource && (
          <div className="absolute bottom-3 left-3 glass-price rounded-lg px-2.5 py-1">
            <span className="text-[10px] font-semibold text-white/70 uppercase tracking-wider">
              {data.huntSource}
            </span>
          </div>
        )}

        {/* Status + Compliance badges */}
        <div className="absolute top-3 right-3 flex items-center gap-2">
          <span className={`badge ${status.bg} ${status.color}`}>
            {status.pulse && (
              <span className={`h-1.5 w-1.5 rounded-full ${status.color.replace("text-", "bg-")} animate-pulse-soft`} />
            )}
            {status.label}
          </span>
          <ComplianceBadge guardian={data.guardian} />
        </div>

        {/* Quality score + Visual QA */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          {data.qualityScore !== null && (
            <div
              className={`h-10 w-10 rounded-full flex items-center justify-center text-sm font-bold border-2 ${
                data.qualityScore >= 8
                  ? "border-emerald-400 text-emerald-400 bg-emerald-400/10"
                  : data.qualityScore >= 6
                    ? "border-amber-400 text-amber-400 bg-amber-400/10"
                    : "border-rose-400 text-rose-400 bg-rose-400/10"
              }`}
            >
              {data.qualityScore}
            </div>
          )}
          {data.visualQa && (
            <div
              className={`badge backdrop-blur-sm ${
                data.visualQa.verdict === "pass"
                  ? "bg-emerald-400/15 text-emerald-400"
                  : data.visualQa.verdict === "warn"
                    ? "bg-amber-400/15 text-amber-400"
                    : "bg-rose-400/15 text-rose-400"
              }`}
            >
              <ScanEye className="h-3 w-3" />
              QA {data.visualQa.verdict === "pass" ? "Pass" : data.visualQa.verdict === "warn" ? "Warn" : "Fail"}
            </div>
          )}
        </div>
      </div>

      {/* ── Property Info ──────────────────────────────────── */}
      <div className="p-4">
        {/* Address + specs */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h3 className="text-sm font-semibold text-(--color-text-primary) mb-1">
              {data.address}
            </h3>
            <div className="flex items-center gap-1 text-xs text-(--color-text-muted)">
              <MapPin className="h-3 w-3" />
              {data.city}
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs text-(--color-text-secondary)">
            <span className="flex items-center gap-1">
              <Bed className="h-3.5 w-3.5 text-(--color-text-muted)" />
              {data.rooms}
            </span>
            <span className="flex items-center gap-1">
              <Maximize className="h-3.5 w-3.5 text-(--color-text-muted)" />
              {data.sqm}m²
            </span>
            <span className="flex items-center gap-1">
              <Building2 className="h-3.5 w-3.5 text-(--color-text-muted)" />
              {data.floor}
            </span>
          </div>
        </div>

        {/* Meta-Safe strip */}
        {data.guardian?.verdict === "safe" && (
          <div className="flex items-center gap-1.5 mb-3 px-2.5 py-1.5 rounded-lg bg-emerald-400/5 border border-emerald-400/10">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-semibold text-emerald-400">Meta-Safe</span>
            <span className="text-[10px] text-emerald-400/60 mr-auto">
              Guardian {data.guardian.score}/100
            </span>
            {data.visualQa?.verdict === "pass" && (
              <>
                <ScanEye className="h-3 w-3 text-emerald-400/60" />
                <span className="text-[10px] text-emerald-400/60">
                  QA Pass · {data.visualQa.textCoveragePercent}% text
                </span>
              </>
            )}
          </div>
        )}

        {/* Vision tags */}
        {data.visionTags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {data.visionTags.slice(0, 5).map((tag) => (
              <span
                key={tag}
                className="badge bg-(--color-bg-hover) text-(--color-text-secondary)"
              >
                {tag}
              </span>
            ))}
            {data.visualDna && (
              <span className="badge bg-indigo-500/10 text-indigo-400">
                {data.visualDna.style}
              </span>
            )}
          </div>
        )}

        {/* ── Tabs ───────────────────────────────────────── */}
        <div className="flex gap-1 mb-3 border-b border-(--color-border)">
          {(["copy", "reel", "matches"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-2 text-xs font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? "border-indigo-500 text-indigo-400"
                  : "border-transparent text-(--color-text-muted) hover:text-(--color-text-secondary)"
              }`}
            >
              {tab === "copy" && "AI Copy"}
              {tab === "reel" && "Reel"}
              {tab === "matches" && (
                <span className="flex items-center gap-1.5">
                  Matches
                  {data.matches.length > 0 && (
                    <span className="h-4 min-w-[16px] px-1 rounded-full bg-indigo-500/20 text-indigo-400 text-[10px] font-bold flex items-center justify-center">
                      {data.matches.length}
                    </span>
                  )}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Tab Content ────────────────────────────────── */}

        {/* AI Copy */}
        {activeTab === "copy" && (
          <div className="space-y-3">
            {data.shortHook ? (
              <>
                {/* Hook */}
                <div className="relative group">
                  <div className="rounded-lg bg-(--color-bg-hover) p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) mb-1">
                      Hook
                    </p>
                    <p className="text-sm font-semibold text-(--color-text-primary)" dir="rtl">
                      {data.shortHook}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(data.shortHook, "hook")}
                    className="absolute top-2 left-2 h-7 w-7 rounded-md bg-(--color-bg-card) border border-(--color-border) flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === "hook" ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-(--color-text-muted)" />
                    )}
                  </button>
                </div>

                {/* Full description */}
                <div className="relative group">
                  <div className="rounded-lg bg-(--color-bg-hover) p-3">
                    <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) mb-1">
                      Full Description
                    </p>
                    <p className="text-xs leading-relaxed text-(--color-text-secondary)" dir="rtl">
                      {data.fullDescription}
                    </p>
                  </div>
                  <button
                    onClick={() => copyToClipboard(data.fullDescription, "desc")}
                    className="absolute top-2 left-2 h-7 w-7 rounded-md bg-(--color-bg-card) border border-(--color-border) flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    {copiedField === "desc" ? (
                      <Check className="h-3 w-3 text-emerald-400" />
                    ) : (
                      <Copy className="h-3 w-3 text-(--color-text-muted)" />
                    )}
                  </button>
                </div>
              </>
            ) : (
              <div className="text-center py-6">
                <Sparkles className="h-6 w-6 text-indigo-400/50 mx-auto mb-2" />
                <p className="text-xs text-(--color-text-muted)">
                  AI is generating marketing copy...
                </p>
              </div>
            )}
          </div>
        )}

        {/* Reel */}
        {activeTab === "reel" && (
          <VideoPreview
            reelScript={data.reelScript}
            propertyId={data.property.id}
            imageUrl={data.imageUrls[0]}
          />
        )}

        {/* Matches */}
        {activeTab === "matches" && (
          <div className="space-y-2.5">
            {data.matches.length === 0 ? (
              <div className="text-center py-6">
                <Users className="h-6 w-6 text-(--color-text-muted) mx-auto mb-2" />
                <p className="text-xs text-(--color-text-muted)">No matches yet</p>
              </div>
            ) : (
              data.matches.map((match) => (
                <div
                  key={match.leadName}
                  className="rounded-lg bg-(--color-bg-hover) p-3"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          match.score >= 90
                            ? "bg-emerald-400/15 text-emerald-400"
                            : match.score >= 70
                              ? "bg-amber-400/15 text-amber-400"
                              : "bg-zinc-700 text-(--color-text-muted)"
                        }`}
                      >
                        {match.score}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-(--color-text-primary)">
                          {match.leadName}
                        </p>
                        <p className="text-[10px] text-(--color-text-muted)">
                          {match.cityPreferred} · ₪{match.budgetMax.toLocaleString("he-IL")}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => copyToClipboard(match.whatsappHook, `wa-${match.leadName}`)}
                      className="btn-ghost text-[10px] py-1 px-2"
                    >
                      {copiedField === `wa-${match.leadName}` ? (
                        <Check className="h-3 w-3 text-emerald-400" />
                      ) : (
                        <MessageCircle className="h-3 w-3" />
                      )}
                      WhatsApp
                    </button>
                  </div>
                  <p className="text-[11px] text-(--color-text-muted) mb-1.5">
                    {match.reasoning}
                  </p>
                  <div className="rounded-md bg-(--color-bg-card) p-2">
                    <p className="text-[11px] text-(--color-text-secondary) leading-relaxed" dir="rtl">
                      {match.whatsappHook}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* ── Actions ────────────────────────────────────── */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-(--color-border)">
          <button
            onClick={() => onOpenLanding(data.property.id)}
            className="btn-primary flex-1"
          >
            <Eye className="h-4 w-4" />
            Landing Page
          </button>
          {data.linearIssueUrl && (
            <a
              href={data.linearIssueUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              <ExternalLink className="h-4 w-4" />
              {data.linearIssueId}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
