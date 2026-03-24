"use client";

import { useState, useCallback } from "react";
import { MousePointerClick, Sparkles } from "lucide-react";
import {
  MOCK_DASHBOARD_PROPERTIES,
  type DashboardProperty,
} from "./data/mock";
import { PropertiesTable } from "./components/properties-table";
import { PropertyDetail } from "./components/property-detail";
import { QuickIngest } from "./components/quick-ingest";

export default function DashboardPage() {
  const [properties, setProperties] = useState<DashboardProperty[]>(
    MOCK_DASHBOARD_PROPERTIES
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notification, setNotification] = useState<string | null>(null);

  const selectedProperty = properties.find(
    (p) => p.property.id === selectedId
  );

  const stats = {
    total: properties.length,
    processing: properties.filter((p) => p.marketingStatus === "ai_processing")
      .length,
    published: properties.filter((p) => p.marketingStatus === "published")
      .length,
  };

  const handlePropertyScouted = useCallback(
    (newProp: DashboardProperty) => {
      setProperties((prev) => [newProp, ...prev]);
      setSelectedId(newProp.property.id);

      const matchCount = newProp.matches.length;
      if (matchCount > 0) {
        setNotification(
          `Scout found a new property! ${matchCount} matching leads identified.`
        );
        setTimeout(() => setNotification(null), 5000);
      }
    },
    []
  );

  return (
    <div className="p-8">
      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 left-1/2 z-50 -translate-x-1/2 rounded-xl border border-emerald-200 bg-emerald-50 px-6 py-3 shadow-lg animate-bounce-once">
          <p className="flex items-center gap-2 text-sm font-medium text-emerald-800">
            <Sparkles className="h-4 w-4 text-emerald-500" />
            {notification}
          </p>
        </div>
      )}

      {/* Header */}
      <div className="mb-6 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Properties</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage your AI-powered property pipeline
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-left">
            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-xs text-slate-400">Total</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-amber-500">
              {stats.processing}
            </p>
            <p className="text-xs text-slate-400">Processing</p>
          </div>
          <div className="text-left">
            <p className="text-2xl font-bold text-emerald-500">
              {stats.published}
            </p>
            <p className="text-xs text-slate-400">Published</p>
          </div>
        </div>
      </div>

      {/* Quick Ingest Bar */}
      <QuickIngest onPropertyScouted={handlePropertyScouted} />

      {/* Content: Table + Detail Panel */}
      <div className="flex gap-6">
        {/* Table */}
        <div className={selectedProperty ? "flex-1 min-w-0" : "w-full"}>
          <PropertiesTable
            data={properties}
            selectedId={selectedId}
            onSelect={(id) =>
              setSelectedId(id === selectedId ? null : id)
            }
          />
        </div>

        {/* Detail Panel or Empty State */}
        <div className="w-[420px] flex-shrink-0">
          {selectedProperty ? (
            <div className="sticky top-8">
              <PropertyDetail data={selectedProperty} />
            </div>
          ) : (
            <div className="sticky top-8 flex flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-8 py-16 text-center">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Sparkles className="h-7 w-7 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">
                AI Insights Panel
              </h3>
              <p className="mt-2 max-w-[220px] text-xs leading-relaxed text-slate-400">
                Select a property from the table to view AI-generated marketing
                copy, vision analysis, and image assets.
              </p>
              <div className="mt-4 flex items-center gap-1.5 text-xs text-indigo-400">
                <MousePointerClick className="h-3.5 w-3.5" />
                Click a row to begin
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
