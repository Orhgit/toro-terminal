"use client";

import { Bed, Bath, Maximize, Building2, ShieldCheck, TrendingUp } from "lucide-react";
import type { Listing } from "../data/listings";

interface PropertyCardProps {
  listing: Listing;
  onHover: (id: string | null) => void;
  highlighted: boolean;
}

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const m = price / 1_000_000;
    return `₪${m % 1 === 0 ? m.toFixed(0) : m.toFixed(1)}M`;
  }
  return `₪${price.toLocaleString("he-IL")}`;
}

export function PropertyCard({ listing, onHover, highlighted }: PropertyCardProps) {
  const l = listing;

  return (
    <div
      className={`portal-card cursor-pointer ${highlighted ? "ring-2 ring-(--color-brand-light) shadow-md" : ""}`}
      onMouseEnter={() => onHover(l.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image — compact */}
      <div className="relative h-[140px] bg-slate-100 overflow-hidden">
        <img
          src={l.imageUrl}
          alt={l.address}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {/* Badges overlaid top-right */}
        <div className="absolute top-2 right-2 flex flex-col items-end gap-1">
          {l.metaSafe && (
            <span className="badge-safe">
              <ShieldCheck className="h-2.5 w-2.5" />
              Meta-Safe
            </span>
          )}
          {l.underpriced && (
            <span className="badge-opportunity">
              <TrendingUp className="h-2.5 w-2.5" />
              Opportunity
            </span>
          )}
        </div>
        {/* Type badge bottom-left */}
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
          {l.type === "garden" ? "Garden" : l.type === "penthouse" ? "Penthouse" : l.type === "studio" ? "Studio" : "Apt"}
        </span>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Price — dominant */}
        <p className="text-xl font-extrabold text-(--color-text) leading-none mb-1">
          {formatPrice(l.price)}
        </p>
        <p className="text-[10px] text-(--color-text-muted) mb-2">
          ₪{l.pricePerSqm.toLocaleString("he-IL")}/m²
        </p>

        {/* Address */}
        <p className="text-sm font-semibold text-(--color-text) truncate mb-0.5" dir="rtl">
          {l.address}
        </p>
        <p className="text-xs text-(--color-text-muted) mb-2.5">
          {l.neighborhood}, {l.city}
        </p>

        {/* Specs row — icons */}
        <div className="flex items-center gap-3 text-xs text-(--color-text-secondary)">
          <span className="flex items-center gap-1">
            <Bed className="h-3.5 w-3.5 text-(--color-text-muted)" />
            {l.rooms}
          </span>
          <span className="flex items-center gap-1">
            <Bath className="h-3.5 w-3.5 text-(--color-text-muted)" />
            {l.bathrooms}
          </span>
          <span className="flex items-center gap-1">
            <Maximize className="h-3.5 w-3.5 text-(--color-text-muted)" />
            {l.sqm}m²
          </span>
          <span className="flex items-center gap-1">
            <Building2 className="h-3.5 w-3.5 text-(--color-text-muted)" />
            {l.floor}
          </span>
        </div>
      </div>
    </div>
  );
}

// ── List view variant ──────────────────────────────────────

export function PropertyCardList({ listing, onHover, highlighted }: PropertyCardProps) {
  const l = listing;

  return (
    <div
      className={`portal-card flex cursor-pointer ${highlighted ? "ring-2 ring-(--color-brand-light) shadow-md" : ""}`}
      onMouseEnter={() => onHover(l.id)}
      onMouseLeave={() => onHover(null)}
    >
      {/* Image */}
      <div className="relative w-[200px] flex-shrink-0 bg-slate-100 overflow-hidden">
        <img
          src={l.imageUrl}
          alt={l.address}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-semibold text-white uppercase">
          {l.type === "garden" ? "Garden" : l.type === "penthouse" ? "Penthouse" : l.type === "studio" ? "Studio" : "Apt"}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1">
            <p className="text-xl font-extrabold text-(--color-text) leading-none">
              {formatPrice(l.price)}
            </p>
            <div className="flex items-center gap-1.5">
              {l.metaSafe && (
                <span className="badge-safe">
                  <ShieldCheck className="h-2.5 w-2.5" />
                  Meta-Safe
                </span>
              )}
              {l.underpriced && (
                <span className="badge-opportunity">
                  <TrendingUp className="h-2.5 w-2.5" />
                  Opportunity
                </span>
              )}
            </div>
          </div>
          <p className="text-sm font-semibold text-(--color-text) truncate" dir="rtl">
            {l.address}, {l.neighborhood}, {l.city}
          </p>
          <p className="text-xs text-(--color-text-muted) mt-1 line-clamp-1" dir="rtl">
            {l.hook}
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs text-(--color-text-secondary) mt-2">
          <span className="flex items-center gap-1"><Bed className="h-3.5 w-3.5 text-(--color-text-muted)" />{l.rooms} rooms</span>
          <span className="flex items-center gap-1"><Bath className="h-3.5 w-3.5 text-(--color-text-muted)" />{l.bathrooms} bath</span>
          <span className="flex items-center gap-1"><Maximize className="h-3.5 w-3.5 text-(--color-text-muted)" />{l.sqm}m²</span>
          <span className="flex items-center gap-1"><Building2 className="h-3.5 w-3.5 text-(--color-text-muted)" />{l.floor}</span>
          <span className="text-(--color-text-muted)">₪{l.pricePerSqm.toLocaleString("he-IL")}/m²</span>
        </div>
      </div>
    </div>
  );
}
