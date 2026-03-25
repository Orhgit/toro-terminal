"use client";

import { Building2, Car, ArrowUpDown, Sun } from "lucide-react";
import { CITIES, PROPERTY_TYPES } from "../data/listings";

export interface Filters {
  priceMin: number;
  priceMax: number;
  rooms: number | null;
  type: string | null;
  sqmMin: number;
  sqmMax: number;
  parking: boolean;
  elevator: boolean;
  balcony: boolean;
}

export const DEFAULT_FILTERS: Filters = {
  priceMin: 0,
  priceMax: 15_000_000,
  rooms: null,
  type: null,
  sqmMin: 0,
  sqmMax: 500,
  parking: false,
  elevator: false,
  balcony: false,
};

interface FilterSidebarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}

export function FilterSidebar({ filters, onChange, resultCount }: FilterSidebarProps) {
  function set<K extends keyof Filters>(key: K, value: Filters[K]) {
    onChange({ ...filters, [key]: value });
  }

  function resetFilters() {
    onChange(DEFAULT_FILTERS);
  }

  const isFiltered = JSON.stringify(filters) !== JSON.stringify(DEFAULT_FILTERS);

  return (
    <aside className="w-[260px] flex-shrink-0 border-l border-(--color-border) bg-(--color-bg) overflow-y-auto p-4 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-(--color-text)">Filters</h2>
        {isFiltered && (
          <button
            onClick={resetFilters}
            className="text-xs text-(--color-brand) hover:underline cursor-pointer"
          >
            Reset
          </button>
        )}
      </div>

      <p className="text-xs text-(--color-text-muted)">
        {resultCount} properties found
      </p>

      {/* ── Price Range ─────────────────────────────────────── */}
      <FilterSection title="Price Range (₪)">
        <div className="flex items-center gap-2">
          <NumInput
            value={filters.priceMin}
            onChange={(v) => set("priceMin", v)}
            placeholder="Min"
          />
          <span className="text-xs text-(--color-text-muted)">—</span>
          <NumInput
            value={filters.priceMax}
            onChange={(v) => set("priceMax", v)}
            placeholder="Max"
          />
        </div>
        {/* Slider */}
        <input
          type="range"
          min={0}
          max={15_000_000}
          step={100_000}
          value={filters.priceMax}
          onChange={(e) => set("priceMax", Number(e.target.value))}
          className="w-full mt-2 accent-[var(--color-brand)]"
        />
        <div className="flex justify-between text-[10px] text-(--color-text-muted)">
          <span>₪0</span>
          <span>₪15M</span>
        </div>
      </FilterSection>

      {/* ── Rooms ───────────────────────────────────────────── */}
      <FilterSection title="Rooms">
        <div className="flex gap-1.5">
          {[null, 1, 2, 3, 4, 5].map((r) => (
            <button
              key={r ?? "all"}
              onClick={() => set("rooms", r)}
              className={`filter-btn text-xs px-3 py-1.5 ${filters.rooms === r ? "active" : ""}`}
            >
              {r === null ? "All" : r === 5 ? "5+" : r}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Property Type ───────────────────────────────────── */}
      <FilterSection title="Property Type">
        <div className="flex flex-wrap gap-1.5">
          <button
            onClick={() => set("type", null)}
            className={`filter-btn text-xs ${filters.type === null ? "active" : ""}`}
          >
            All
          </button>
          {PROPERTY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => set("type", t.value)}
              className={`filter-btn text-xs ${filters.type === t.value ? "active" : ""}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* ── Sqm Range ───────────────────────────────────────── */}
      <FilterSection title="Area (m²)">
        <div className="flex items-center gap-2">
          <NumInput
            value={filters.sqmMin}
            onChange={(v) => set("sqmMin", v)}
            placeholder="Min"
          />
          <span className="text-xs text-(--color-text-muted)">—</span>
          <NumInput
            value={filters.sqmMax}
            onChange={(v) => set("sqmMax", v)}
            placeholder="Max"
          />
        </div>
      </FilterSection>

      {/* ── Amenities ───────────────────────────────────────── */}
      <FilterSection title="Amenities">
        <div className="space-y-2">
          <AmenityToggle
            icon={<Car className="h-3.5 w-3.5" />}
            label="Parking"
            active={filters.parking}
            onToggle={() => set("parking", !filters.parking)}
          />
          <AmenityToggle
            icon={<ArrowUpDown className="h-3.5 w-3.5" />}
            label="Elevator"
            active={filters.elevator}
            onToggle={() => set("elevator", !filters.elevator)}
          />
          <AmenityToggle
            icon={<Sun className="h-3.5 w-3.5" />}
            label="Balcony"
            active={filters.balcony}
            onToggle={() => set("balcony", !filters.balcony)}
          />
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold text-(--color-text) mb-2">{title}</p>
      {children}
    </div>
  );
}

function NumInput({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder: string;
}) {
  return (
    <input
      type="number"
      value={value || ""}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      placeholder={placeholder}
      className="w-full rounded-lg border border-(--color-border) bg-(--color-bg-input) px-2.5 py-1.5 text-xs text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-brand-light) transition-colors"
    />
  );
}

function AmenityToggle({
  icon,
  label,
  active,
  onToggle,
}: {
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={`w-full flex items-center gap-2.5 rounded-lg px-3 py-2 text-xs transition-all cursor-pointer border ${
        active
          ? "bg-(--color-brand-bg) border-(--color-brand-light) text-(--color-brand) font-semibold"
          : "bg-(--color-bg) border-(--color-border) text-(--color-text-secondary) hover:bg-(--color-bg-secondary)"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
