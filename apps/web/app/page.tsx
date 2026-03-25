"use client";

import { useState, useMemo } from "react";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Building2,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { LISTINGS, CITIES, type Listing } from "./data/listings";
import { PropertyCard, PropertyCardList } from "./components/property-card";
import { FilterSidebar, DEFAULT_FILTERS, type Filters } from "./components/filter-sidebar";
import { MapPanel } from "./components/map-panel";

type SortKey = "newest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest" },
  { value: "price_asc", label: "Price: Low → High" },
  { value: "price_desc", label: "Price: High → Low" },
];

export default function PortalPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let results = LISTINGS.filter((l) => {
      // Search
      if (query) {
        const q = query.toLowerCase();
        const match =
          l.city.includes(q) ||
          l.neighborhood.includes(q) ||
          l.address.includes(q) ||
          l.city.toLowerCase().includes(q) ||
          l.neighborhood.toLowerCase().includes(q);
        if (!match) return false;
      }
      // Price
      if (l.price < filters.priceMin || l.price > filters.priceMax) return false;
      // Rooms
      if (filters.rooms !== null) {
        if (filters.rooms === 5 ? l.rooms < 5 : l.rooms !== filters.rooms) return false;
      }
      // Type
      if (filters.type && l.type !== filters.type) return false;
      // Sqm
      if (l.sqm < filters.sqmMin || l.sqm > filters.sqmMax) return false;
      // Amenities
      if (filters.parking && !l.parking) return false;
      if (filters.elevator && !l.elevator) return false;
      if (filters.balcony && !l.balcony) return false;

      return true;
    });

    // Sort
    results.sort((a, b) => {
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return results;
  }, [query, filters, sort]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Header ──────────────────────────────────────────── */}
      <header className="flex-shrink-0 border-b border-(--color-border) bg-white">
        {/* Top bar — brand */}
        <div className="flex items-center justify-between px-5 h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-(--color-text) leading-none">
                מרכז הנכסים
              </p>
              <p className="text-[10px] text-(--color-text-muted)">
                Merkaz HaNechasim
              </p>
            </div>
          </div>

          {/* Center: Global Search */}
          <div className="flex-1 max-w-xl mx-8">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-text-muted)" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search city, neighborhood, or address..."
                className="w-full rounded-lg border border-(--color-border) bg-(--color-bg-secondary) px-4 pr-10 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-brand-light) focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Right: Toro AI badge */}
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-(--color-text-muted)">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              Powered by Toro AI
            </span>
          </div>
        </div>

        {/* Toolbar row — sort + view */}
        <div className="flex items-center justify-between px-5 py-2 bg-(--color-bg-secondary) border-t border-(--color-border)">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-(--color-text)">
              {filtered.length} properties
            </p>
            <span className="text-xs text-(--color-text-muted)">·</span>
            <div className="flex items-center gap-1.5">
              {CITIES.map((city) => (
                <button
                  key={city}
                  onClick={() => setQuery(query === city ? "" : city)}
                  className={`filter-btn text-[11px] py-1 px-2.5 ${query === city ? "active" : ""}`}
                >
                  {city}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="appearance-none rounded-lg border border-(--color-border) bg-white pl-7 pr-3 py-1.5 text-xs text-(--color-text-secondary) focus:outline-none focus:border-(--color-brand-light) cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-(--color-text-muted) pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="flex items-center border border-(--color-border) rounded-lg overflow-hidden">
              <button
                onClick={() => setView("grid")}
                className={`p-1.5 transition-colors ${
                  view === "grid"
                    ? "bg-(--color-brand-bg) text-(--color-brand)"
                    : "bg-white text-(--color-text-muted) hover:bg-(--color-bg-secondary)"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setView("list")}
                className={`p-1.5 transition-colors ${
                  view === "list"
                    ? "bg-(--color-brand-bg) text-(--color-brand)"
                    : "bg-white text-(--color-text-muted) hover:bg-(--color-bg-secondary)"
                }`}
              >
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ── 3-Column Body ───────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden">
        {/* Column 1: Filters */}
        <FilterSidebar
          filters={filters}
          onChange={setFilters}
          resultCount={filtered.length}
        />

        {/* Column 2: Property Grid */}
        <div className="flex-1 overflow-y-auto p-4 bg-(--color-bg-secondary)">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <Search className="h-10 w-10 text-(--color-text-muted) mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-(--color-text-secondary)">
                  No properties match your criteria
                </p>
                <p className="text-xs text-(--color-text-muted) mt-1">
                  Try adjusting your filters or search terms
                </p>
              </div>
            </div>
          ) : view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map((l) => (
                <PropertyCard
                  key={l.id}
                  listing={l}
                  onHover={setHoveredId}
                  highlighted={hoveredId === l.id}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((l) => (
                <PropertyCardList
                  key={l.id}
                  listing={l}
                  onHover={setHoveredId}
                  highlighted={hoveredId === l.id}
                />
              ))}
            </div>
          )}
        </div>

        {/* Column 3: Map */}
        <div className="w-[380px] flex-shrink-0 p-2 bg-white">
          <MapPanel
            listings={filtered}
            hoveredId={hoveredId}
            onPinHover={setHoveredId}
          />
        </div>
      </div>
    </div>
  );
}
