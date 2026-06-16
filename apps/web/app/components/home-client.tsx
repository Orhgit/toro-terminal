"use client";

import { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import {
  Search,
  LayoutGrid,
  List,
  ChevronDown,
  Building2,
  Zap,
} from "lucide-react";
import { LISTINGS, type Listing } from "../data/listings";
import { PropertyCard, PropertyCardList } from "./property-card";
import { FilterSidebar, DEFAULT_FILTERS, type Filters } from "./filter-sidebar";
import { useListingStore } from "../lib/listing-context";
import Link from "next/link";

// Mapbox GL ships a ~600 KB client bundle. Splitting it out via dynamic()
// keeps the initial JS for the home page small and avoids loading the SDK
// on devices that never reach the map view (RIN-388).
const MapPanel = dynamic(
  () => import("./map-panel").then((m) => m.MapPanel),
  {
    ssr: false,
    loading: () => (
      <div
        style={{ position: "absolute", inset: 0, borderRadius: 16 }}
        className="bg-slate-100 animate-pulse"
        aria-label="טוען מפה"
        role="status"
      />
    ),
  },
);

type SortKey = "newest" | "price_asc" | "price_desc";

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "הכי חדש" },
  { value: "price_asc", label: "מחיר: נמוך → גבוה" },
  { value: "price_desc", label: "מחיר: גבוה → נמוך" },
];

export function HomeClient() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortKey>("newest");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const { userListings } = useListingStore();

  const ALL_LISTINGS = useMemo(() => {
    const published = userListings.filter((l) => l.status === "published") as Listing[];
    return [...published, ...LISTINGS];
  }, [userListings]);

  const filtered = useMemo(() => {
    const results = ALL_LISTINGS.filter((l) => {
      if (query) {
        const q = query.toLowerCase();
        const match = l.city.includes(q) || l.neighborhood.includes(q) || l.address.includes(q);
        if (!match) return false;
      }
      if (l.price < filters.priceMin || l.price > filters.priceMax) return false;
      if (filters.rooms !== null) {
        if (filters.rooms === 5 ? l.rooms < 5 : l.rooms !== filters.rooms) return false;
      }
      if (filters.type && l.type !== filters.type) return false;
      if (filters.category && l.category !== filters.category) return false;
      if (l.sqm < filters.sqmMin || l.sqm > filters.sqmMax) return false;
      if (filters.parking && !l.parking) return false;
      if (filters.elevator && !l.elevator) return false;
      if (filters.balcony && !l.balcony) return false;
      return true;
    });

    results.sort((a, b) => {
      // Promoted first, then by user sort
      const promoA = a.promotionLevel ?? 0;
      const promoB = b.promotionLevel ?? 0;
      if (promoB !== promoA) return promoB - promoA;
      if (sort === "price_asc") return a.price - b.price;
      if (sort === "price_desc") return b.price - a.price;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return results;
  }, [ALL_LISTINGS, query, filters, sort]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-(--color-border) bg-white">
        <div className="flex items-center justify-between px-5 h-14">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-600 to-indigo-800">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-bold text-(--color-text) leading-none">Toro</p>
              <p className="text-[10px] text-(--color-text-muted)">Merkaz HaNechasim</p>
            </div>
          </div>

          {/* Search */}
          <div className="hidden sm:block flex-1 max-w-xl mx-4 md:mx-8">
            <div className="relative">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-text-muted)" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="חיפוש עיר, שכונה או כתובת..."
                aria-label="חיפוש נכסים"
                className="w-full rounded-lg border border-(--color-border) bg-(--color-bg-secondary) px-4 pr-10 py-2.5 text-sm text-(--color-text) placeholder:text-(--color-text-muted) focus:outline-none focus:border-(--color-brand-light) focus:ring-2 focus:ring-indigo-100 transition-all"
              />
            </div>
          </div>

          {/* Right */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="md:hidden bg-slate-100 text-slate-600 px-3 py-2 rounded-full text-xs font-bold transition-all"
            >
              {showFilters ? "סגור מסננים" : "מסננים"}
            </button>
            <Link href="/manage" className="bg-slate-100 text-slate-700 px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all hover:bg-slate-200">
              ניהול
            </Link>
            <Link href="/listing/new" className="bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-full text-xs font-bold transition-all shadow-lg">
              + פרסם נכס
            </Link>
            <span className="hidden lg:flex items-center gap-1.5 text-xs text-(--color-text-muted)">
              <Zap className="h-3.5 w-3.5 text-indigo-500" />
              Powered by Toro AI
            </span>
          </div>
        </div>

        {/* Toolbar — sticky on scroll */}
        <div className="flex items-center justify-between px-5 py-2 bg-(--color-bg-secondary) border-t border-(--color-border) sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <p className="text-xs font-semibold text-(--color-text)">{filtered.length} נכסים</p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                aria-label="מיון נכסים"
                className="appearance-none rounded-lg border border-(--color-border) bg-white pl-7 pr-3 py-1.5 text-xs text-(--color-text-secondary) focus:outline-none cursor-pointer"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute left-2 top-1/2 -translate-y-1/2 h-3 w-3 text-(--color-text-muted) pointer-events-none" />
            </div>

            <div className="flex items-center border border-(--color-border) rounded-lg overflow-hidden">
              <button onClick={() => setView("grid")} aria-label="תצוגת רשת" className={`p-1.5 transition-colors ${view === "grid" ? "bg-(--color-brand-bg) text-(--color-brand)" : "bg-white text-(--color-text-muted)"}`}>
                <LayoutGrid className="h-3.5 w-3.5" />
              </button>
              <button onClick={() => setView("list")} aria-label="תצוגת רשימה" className={`p-1.5 transition-colors ${view === "list" ? "bg-(--color-brand-bg) text-(--color-brand)" : "bg-white text-(--color-text-muted)"}`}>
                <List className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* 3-Column Body (RTL: DOM order = visual right→left) */}
      <div className="flex flex-col md:flex-row flex-1 overflow-hidden w-full bg-slate-50 border-t border-slate-100">
        {/* 1st in DOM → renders Right in RTL: Filters Bar */}
        <div className={`${showFilters ? "block" : "hidden"} md:block w-full md:w-[28%] lg:w-[20%] h-auto max-h-[50vh] md:max-h-none md:h-full overflow-y-auto p-3 lg:p-4 bg-white flex-shrink-0 order-1 md:order-none border-b md:border-b-0`}>
          <FilterSidebar filters={filters} onChange={(f) => { setFilters(f); if (window.innerWidth < 768) setShowFilters(false); }} resultCount={filtered.length} />
        </div>

        {/* 2nd in DOM → renders Middle in RTL: Property Cards */}
        <div className="w-full md:w-[42%] lg:w-[50%] h-full overflow-y-auto p-3 sm:p-4 lg:p-6 flex-grow order-2 md:order-none">
          {filtered.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center animate-fadeIn">
                <Search className="h-10 w-10 text-(--color-text-muted) mx-auto mb-3 opacity-30" />
                <p className="text-sm font-medium text-(--color-text-secondary)">לא נמצאו נכסים מתאימים</p>
                <p className="text-xs text-(--color-text-muted) mt-1 mb-4">נסה לשנות את המסננים או לחפש עיר אחרת</p>
                <button
                  onClick={() => { setFilters(DEFAULT_FILTERS); setQuery(""); }}
                  className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
                >
                  איפוס כל המסננים
                </button>
              </div>
            </div>
          ) : view === "grid" ? (
            <>
              <div className="w-full bg-gradient-to-r from-blue-900 to-blue-700 p-4 sm:p-6 rounded-2xl shadow-xl mb-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3" dir="rtl">
                <div>
                  <span className="bg-yellow-500 text-black text-[10px] font-black px-2 py-0.5 rounded-full mb-2 inline-block shadow-sm">👑 VIP</span>
                  <h3 className="text-xl font-bold">Toro — פלטפורמת הנדל״ן החכמה</h3>
                  <p className="text-blue-100 text-xs">חיפוש חכם, מפה אינטראקטיבית, AI מתקדם</p>
                </div>
                <button
                  onClick={() => document.getElementById('properties-grid')?.scrollIntoView({ behavior: 'smooth' })}
                  className="bg-white text-blue-900 px-5 py-2 rounded-full font-black hover:bg-yellow-400 transition-all transform hover:scale-105 shadow-md text-xs cursor-pointer"
                >
                  גלה נכסים
                </button>
              </div>
              <div id="properties-grid" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-fadeIn">
                {filtered.map((l) => (
                  <PropertyCard key={l.id} listing={l} onHover={setHoveredId} highlighted={hoveredId === l.id} />
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-2.5">
              {filtered.map((l) => (
                <PropertyCardList key={l.id} listing={l} onHover={setHoveredId} highlighted={hoveredId === l.id} />
              ))}
            </div>
          )}
        </div>

        {/* 3rd in DOM → renders Left in RTL: Map */}
        <div className="w-full h-[400px] lg:h-full lg:w-[28%] relative flex-shrink-0 order-3 md:order-none border-r border-slate-200">
          <MapPanel listings={filtered} hoveredId={hoveredId} onPinHover={setHoveredId} />
        </div>
      </div>
    </div>
  );
}
