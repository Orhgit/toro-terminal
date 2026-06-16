"use client";

/**
 * TabListings — manage all user's properties with status, filters, actions.
 */

import { useState } from "react";
import Image from "next/image";
import { useListingStore } from "../../lib/listing-context";
import type { UserListing, ListingStatus } from "../../data/listing-types";
import { LISTINGS } from "../../data/listings";
import {
  Search, MoreVertical, Archive, Trash2, Pencil,
  Eye, Star, Filter, Building2, Crown,
} from "lucide-react";
import { PromotionModal } from "./promotion-modal";
import { ConfirmDialog } from "../../components/ui/confirm-dialog";
import type { ManageTab } from "./manage-sidebar";

interface TabListingsProps {
  onNavigate: (tab: ManageTab) => void;
  onEditListing?: (id: string) => void;
}

type StatusFilter = "all" | ListingStatus;

export function TabListings({ onNavigate, onEditListing }: TabListingsProps) {
  const { userListings, archiveListing, deleteListing, updateListing, promoteListing } = useListingStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [promotingListing, setPromotingListing] = useState<{ id: string; address: string; level: number } | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Combine user listings + sample from static data
  const allListings: UserListing[] = [
    ...userListings,
    ...LISTINGS.slice(0, 5).map((l) => ({
      ...l,
      status: "published" as ListingStatus,
      contactName: "ניר אבלס",
      contactPhone: "054-2498166",
      views: Math.floor(Math.random() * 5000),
    })),
  ];

  const filtered = allListings.filter((l) => {
    if (statusFilter !== "all" && l.status !== statusFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return l.address.includes(q) || l.city.includes(q) || l.neighborhood.includes(q);
    }
    return true;
  });

  const statusCounts = {
    all: allListings.length,
    published: allListings.filter((l) => l.status === "published").length,
    draft: allListings.filter((l) => l.status === "draft").length,
    archived: allListings.filter((l) => l.status === "archived").length,
  };

  const STATUS_BADGE: Record<string, { text: string; cls: string }> = {
    published: { text: "פעיל", cls: "bg-green-100 text-green-700" },
    draft: { text: "טיוטה", cls: "bg-slate-100 text-slate-500" },
    archived: { text: "ארכיון", cls: "bg-yellow-100 text-yellow-700" },
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2">
          {(["all", "published", "draft", "archived"] as StatusFilter[]).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`text-[11px] font-bold px-3 py-1.5 rounded-lg transition-all cursor-pointer
                ${statusFilter === s
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
                }`}
            >
              {s === "all" ? "הכל" : STATUS_BADGE[s]?.text ?? s} ({statusCounts[s]})
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-56">
          <Search className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="חפש נכס..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white pr-8 pl-3 py-1.5 text-xs
              focus:outline-none focus:border-indigo-300 transition-all"
          />
        </div>
      </div>

      {/* Listings Grid */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
          <Building2 className="h-10 w-10 text-slate-200 mx-auto mb-3" />
          <p className="text-sm text-slate-400 font-medium">לא נמצאו נכסים</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((listing) => {
            const badge = STATUS_BADGE[listing.status] ?? { text: "—", cls: "bg-slate-100 text-slate-400" };

            return (
              <div
                key={listing.id}
                className="bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-md transition-shadow group"
              >
                {/* Image */}
                <div className="h-36 bg-slate-100 relative overflow-hidden">
                  {listing.imageUrl && (
                    <Image
                      src={listing.imageUrl}
                      alt=""
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className={`absolute top-2 right-2 ${badge.cls} px-2 py-0.5 rounded-full text-[10px] font-bold`}>
                    {badge.text}
                  </span>
                  {listing.promotionLevel === 2 && (
                    <span className="absolute top-2 left-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-black">
                      👑 VIP
                    </span>
                  )}
                  {listing.promotionLevel === 1 && (
                    <span className="absolute top-2 left-2 bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-black">
                      Silver
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-slate-800 truncate">{listing.address}</p>
                      <p className="text-[11px] text-slate-400">{listing.city} · {listing.neighborhood}</p>
                    </div>
                    <p className="text-sm font-black text-blue-900 flex-shrink-0">
                      ₪{(listing.price / 1_000_000).toFixed(1)}M
                    </p>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{listing.rooms} חד׳ · {listing.sqm} מ״ר</span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {listing.views?.toLocaleString("he-IL") ?? 0}
                    </span>
                  </div>
                  {/* Listing age */}
                  {(() => {
                    const days = Math.floor((Date.now() - new Date(listing.createdAt).getTime()) / 86400000);
                    return days > 30 ? (
                      <p className={`text-[10px] font-bold ${days > 60 ? "text-red-500" : "text-amber-500"}`}>
                        {days > 60 ? "⚠️" : "⏰"} פורסם לפני {days} יום {days > 60 ? "— מומלץ לחדש" : ""}
                      </p>
                    ) : null;
                  })()}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2 border-t border-slate-50">
                    <button
                      onClick={() => onEditListing?.(listing.id)}
                      className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Pencil className="h-3 w-3" /> ערוך
                    </button>
                    <button
                      onClick={() => archiveListing(listing.id)}
                      className="flex-1 bg-slate-50 text-slate-600 py-2 rounded-lg text-[11px] font-bold hover:bg-slate-100 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Archive className="h-3 w-3" /> ארכיון
                    </button>
                    <button
                      onClick={() => setPromotingListing({ id: listing.id, address: listing.address, level: listing.promotionLevel ?? 0 })}
                      className="flex-1 bg-yellow-50 text-yellow-700 py-2 rounded-lg text-[11px] font-bold hover:bg-yellow-100 transition cursor-pointer flex items-center justify-center gap-1"
                    >
                      <Crown className="h-3 w-3" /> קדם
                    </button>
                    <button
                      onClick={() => setDeletingId(listing.id)}
                      className="bg-slate-50 text-red-400 py-2 px-3 rounded-lg text-[11px] hover:bg-red-50 transition cursor-pointer"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <ConfirmDialog
          title="מחיקת נכס"
          message="האם אתה בטוח שברצונך למחוק את הנכס? פעולה זו לא ניתנת לביטול."
          confirmLabel="מחק"
          cancelLabel="ביטול"
          variant="danger"
          onConfirm={() => { deleteListing(deletingId); setDeletingId(null); }}
          onCancel={() => setDeletingId(null)}
        />
      )}

      {/* Promotion Modal */}
      {promotingListing && (
        <PromotionModal
          listingAddress={promotingListing.address}
          currentLevel={promotingListing.level}
          onSelect={(level) => promoteListing(promotingListing.id, level)}
          onClose={() => setPromotingListing(null)}
        />
      )}
    </div>
  );
}
