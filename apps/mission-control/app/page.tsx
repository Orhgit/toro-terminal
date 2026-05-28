"use client";

import { useState, useMemo } from "react";
import {
  Search,
  SlidersHorizontal,
  LayoutGrid,
  List,
  TrendingUp,
  Users,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { PROPERTIES, STATUS_CONFIG, type MarketingStatus } from "./data/properties";
import { PropertyCard } from "./components/property-card";

export default function PipelinePage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<MarketingStatus | "all">("all");
  const [view, setView] = useState<"grid" | "list">("grid");

  const filtered = useMemo(() => {
    return PROPERTIES.filter((p) => {
      if (statusFilter !== "all" && p.marketingStatus !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          p.address.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q) ||
          p.shortHook.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [search, statusFilter]);

  // Stats
  const totalLeads = PROPERTIES.reduce((sum, p) => sum + p.matches.length, 0);
  const avgScore = Math.round(
    PROPERTIES.filter((p) => p.guardian).reduce((sum, p) => sum + (p.guardian?.score ?? 0), 0) /
      PROPERTIES.filter((p) => p.guardian).length
  );
  const published = PROPERTIES.filter((p) => p.marketingStatus === "published").length;

  function handleOpenLanding(id: string) {
    window.open(`/p/${id}`, "_blank");
  }

  return (
    <div className="min-h-screen p-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--color-text-primary) mb-1">
          Property Pipeline
        </h1>
        <p className="text-sm text-(--color-text-muted)">
          AI-powered property marketing from scout to publish
        </p>
      </div>

      {/* ── KPI Strip ──────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <KpiCard
          icon={<Zap className="h-4 w-4 text-indigo-400" />}
          label="Active Properties"
          value={String(PROPERTIES.length)}
          accent="indigo"
        />
        <KpiCard
          icon={<Users className="h-4 w-4 text-sky-400" />}
          label="Matched Leads"
          value={String(totalLeads)}
          accent="sky"
        />
        <KpiCard
          icon={<ShieldCheck className="h-4 w-4 text-emerald-400" />}
          label="Avg. Compliance"
          value={`${avgScore}%`}
          accent="emerald"
        />
        <KpiCard
          icon={<TrendingUp className="h-4 w-4 text-violet-400" />}
          label="Published"
          value={String(published)}
          accent="violet"
        />
      </div>

      {/* ── Toolbar ────────────────────────────────────────── */}
      <div className="flex items-center gap-3 mb-6">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-(--color-text-muted)" />
          <input
            type="text"
            placeholder="Search properties..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg bg-(--color-bg-input) border border-(--color-border) px-4 pr-10 py-2.5 text-sm text-(--color-text-primary) placeholder:text-(--color-text-muted) focus:outline-none focus:border-indigo-500/50 focus:ring-2 focus:ring-(--color-ring) transition-all"
          />
        </div>

        {/* Status filter */}
        <div className="flex items-center gap-1 rounded-lg bg-(--color-bg-input) border border-(--color-border) p-1">
          <FilterBtn
            active={statusFilter === "all"}
            onClick={() => setStatusFilter("all")}
          >
            All
          </FilterBtn>
          {(Object.keys(STATUS_CONFIG) as MarketingStatus[]).map((s) => (
            <FilterBtn
              key={s}
              active={statusFilter === s}
              onClick={() => setStatusFilter(s)}
            >
              <span
                className={`h-1.5 w-1.5 rounded-full ${STATUS_CONFIG[s].color.replace("text-", "bg-")}`}
              />
              {STATUS_CONFIG[s].label}
            </FilterBtn>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 rounded-lg bg-(--color-bg-input) border border-(--color-border) p-1">
          <button
            onClick={() => setView("grid")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "grid"
                ? "bg-(--color-bg-hover) text-(--color-text-primary)"
                : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
            }`}
          >
            <LayoutGrid className="h-4 w-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-1.5 rounded-md transition-colors ${
              view === "list"
                ? "bg-(--color-bg-hover) text-(--color-text-primary)"
                : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
            }`}
          >
            <List className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ── Property Grid ──────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <SlidersHorizontal className="h-8 w-8 text-(--color-text-muted) mx-auto mb-3" />
            <p className="text-sm text-(--color-text-muted)">
              No properties match your filters
            </p>
          </div>
        </div>
      ) : (
        <div
          className={`stagger ${
            view === "grid"
              ? "grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-3 gap-5"
              : "flex flex-col gap-4"
          }`}
        >
          {filtered.map((p) => (
            <PropertyCard
              key={p.property.id}
              data={p}
              onOpenLanding={handleOpenLanding}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────

function KpiCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="card p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`h-8 w-8 rounded-lg bg-${accent}-400/10 flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <p className="text-2xl font-bold text-(--color-text-primary)">{value}</p>
      <p className="text-xs text-(--color-text-muted) mt-0.5">{label}</p>
    </div>
  );
}

function FilterBtn({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium transition-all ${
        active
          ? "bg-(--color-bg-hover) text-(--color-text-primary)"
          : "text-(--color-text-muted) hover:text-(--color-text-secondary)"
      }`}
    >
      {children}
    </button>
  );
}
