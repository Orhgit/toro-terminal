"use client";

/**
 * TabHunter — Property Hunter: saved searches with matching properties.
 */

import { useState, useMemo } from "react";
import Image from "next/image";
import { LISTINGS, CITIES, PROPERTY_TYPES } from "../../data/listings";
import { type SavedSearch, EMPTY_CRITERIA, type SearchCriteria } from "../../data/search-types";
import { matchListings } from "../../lib/matching-engine";
import { PriceInput } from "../../components/ui/price-input";
import {
  Search, Plus, Trash2, ChevronDown, ChevronUp,
  Bell, BellOff, Target, Building2, X,
} from "lucide-react";

export function TabHunter() {
  const [searches, setSearches] = useState<SavedSearch[]>([
    {
      id: "s1", name: "דירות בנתניה עד 5M", isActive: true, matchCount: 0,
      createdAt: new Date().toISOString(),
      criteria: { ...EMPTY_CRITERIA, cities: ["נתניה"], maxPrice: 5_000_000, minRooms: 3 },
    },
    {
      id: "s2", name: "וילות בירושלים", isActive: true, matchCount: 0,
      createdAt: new Date().toISOString(),
      criteria: { ...EMPTY_CRITERIA, cities: ["ירושלים"], types: ["garden"] },
    },
  ]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState("");
  const [formCriteria, setFormCriteria] = useState<SearchCriteria>(EMPTY_CRITERIA);

  // Calculate matches for each search
  const searchesWithMatches = useMemo(() =>
    searches.map((s) => ({
      ...s,
      matchCount: matchListings(s.criteria, LISTINGS).length,
    })),
  [searches]);

  function addSearch() {
    if (!formName.trim()) return;
    const newSearch: SavedSearch = {
      id: `s-${Date.now()}`,
      name: formName,
      criteria: formCriteria,
      createdAt: new Date().toISOString(),
      isActive: true,
      matchCount: 0,
    };
    setSearches((prev) => [newSearch, ...prev]);
    setFormName("");
    setFormCriteria(EMPTY_CRITERIA);
    setShowForm(false);
  }

  function deleteSearch(id: string) {
    setSearches((prev) => prev.filter((s) => s.id !== id));
  }

  function toggleActive(id: string) {
    setSearches((prev) =>
      prev.map((s) => (s.id === id ? { ...s, isActive: !s.isActive } : s))
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-indigo-600" />
          <h2 className="text-sm font-black text-slate-800">צייד הנכסים</h2>
          <span className="text-[11px] text-slate-400">({searchesWithMatches.length} חיפושים שמורים)</span>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 bg-indigo-600 text-white px-4 py-2 rounded-xl text-xs font-bold hover:bg-indigo-700 transition cursor-pointer"
        >
          {showForm ? <X className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
          {showForm ? "ביטול" : "חיפוש חדש"}
        </button>
      </div>

      {/* New Search Form */}
      {showForm && (
        <div className="bg-white rounded-2xl border border-indigo-100 p-5 space-y-4">
          <input
            type="text"
            placeholder='שם החיפוש (לדוגמה: "דירות 4 חד׳ בתל אביב")'
            value={formName}
            onChange={(e) => setFormName(e.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
          />

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1">ערים</p>
              <div className="flex flex-wrap gap-1">
                {CITIES.slice(0, 8).map((city) => (
                  <button
                    key={city}
                    onClick={() => setFormCriteria((c) => ({
                      ...c,
                      cities: c.cities.includes(city) ? c.cities.filter((x) => x !== city) : [...c.cities, city],
                    }))}
                    className={`text-[10px] px-2 py-1 rounded-lg border transition cursor-pointer
                      ${formCriteria.cities.includes(city) ? "bg-indigo-100 border-indigo-300 text-indigo-700 font-bold" : "border-slate-200 text-slate-500"}`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1">חדרים (מינ׳)</p>
              <input type="number" min={1} max={10} placeholder="מ-"
                value={formCriteria.minRooms ?? ""}
                onChange={(e) => setFormCriteria((c) => ({ ...c, minRooms: e.target.value ? +e.target.value : null }))}
                className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-xs focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <p className="text-[11px] font-semibold text-slate-500 mb-1">מחיר מקסימלי</p>
              <PriceInput value={formCriteria.maxPrice} onChange={(v) => setFormCriteria((c) => ({ ...c, maxPrice: v }))} />
            </div>
          </div>

          <button
            onClick={addSearch}
            disabled={!formName.trim()}
            className="bg-green-600 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-green-700 transition cursor-pointer disabled:bg-slate-200 disabled:text-slate-400"
          >
            שמור חיפוש
          </button>
        </div>
      )}

      {/* Saved Searches List */}
      <div className="space-y-3">
        {searchesWithMatches.map((s) => {
          const isExpanded = expandedId === s.id;
          const matches = matchListings(s.criteria, LISTINGS);

          return (
            <div key={s.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
              {/* Header row */}
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-slate-50/50 transition"
                onClick={() => setExpandedId(isExpanded ? null : s.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${s.isActive ? "bg-green-50 text-green-600" : "bg-slate-50 text-slate-400"}`}>
                    <Search className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.name}</p>
                    <p className="text-[10px] text-slate-400">
                      {s.criteria.cities.length > 0 ? s.criteria.cities.join(", ") : "כל הערים"} ·
                      {s.matchCount} התאמות
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-black px-2.5 py-1 rounded-full ${s.matchCount > 0 ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
                    {s.matchCount}
                  </span>
                  <button onClick={(e) => { e.stopPropagation(); toggleActive(s.id); }} className="p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer" title={s.isActive ? "השתק" : "הפעל"}>
                    {s.isActive ? <Bell className="h-4 w-4 text-green-500" /> : <BellOff className="h-4 w-4 text-slate-400" />}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); deleteSearch(s.id); }} className="p-1.5 hover:bg-red-50 rounded-lg cursor-pointer">
                    <Trash2 className="h-4 w-4 text-red-400" />
                  </button>
                  {isExpanded ? <ChevronUp className="h-4 w-4 text-slate-400" /> : <ChevronDown className="h-4 w-4 text-slate-400" />}
                </div>
              </div>

              {/* Expanded matches */}
              {isExpanded && (
                <div className="border-t border-slate-50 p-4 bg-slate-50/30">
                  {matches.length === 0 ? (
                    <p className="text-xs text-slate-400 text-center py-4">אין נכסים תואמים כרגע</p>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {matches.slice(0, 6).map((l) => (
                        <div key={l.id} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-slate-100">
                          {l.imageUrl && <Image src={l.imageUrl} alt="" width={56} height={48} className="w-14 h-12 rounded-lg object-cover flex-shrink-0" />}
                          <div className="min-w-0">
                            <p className="text-xs font-bold text-slate-800 truncate">{l.address}</p>
                            <p className="text-[10px] text-slate-400">{l.city} · {l.rooms} חד׳ · ₪{(l.price/1e6).toFixed(1)}M</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                  {matches.length > 6 && (
                    <p className="text-[10px] text-indigo-600 font-bold text-center mt-3">
                      +{matches.length - 6} נכסים נוספים
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
