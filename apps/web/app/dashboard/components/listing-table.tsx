"use client";

/**
 * ListingTable — table of user's listings with status, actions, and image preview.
 */

import type { UserListing } from "../../data/listing-types";
import { Pencil, Archive, Trash2, MoreVertical } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ListingTableProps {
  listings: UserListing[];
  onArchive: (id: string) => void;
  onDelete: (id: string) => void;
}

const STATUS_LABELS: Record<string, { text: string; className: string }> = {
  published: { text: "פעיל", className: "bg-green-100 text-green-700" },
  draft: { text: "טיוטה", className: "bg-slate-100 text-slate-500" },
  archived: { text: "בארכיון", className: "bg-yellow-100 text-yellow-700" },
};

export function ListingTable({ listings, onArchive, onDelete }: ListingTableProps) {
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  if (listings.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-100 p-12 text-center">
        <p className="text-slate-400 text-sm font-medium mb-2">עדיין לא פרסמת נכסים</p>
        <a
          href="/listing/new"
          className="inline-block bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold
            hover:bg-indigo-700 transition-all shadow-sm"
        >
          + העלה נכס ראשון
        </a>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-right">
          <thead>
            <tr className="text-[11px] text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-50">
              <th className="p-4">נכס</th>
              <th className="p-4">מחיר</th>
              <th className="p-4">סטטוס</th>
              <th className="p-4">צפיות</th>
              <th className="p-4">תאריך</th>
              <th className="p-4 w-12"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50 text-sm">
            {listings.map((listing) => {
              const status = STATUS_LABELS[listing.status] ?? { text: "טיוטה", className: "bg-slate-100 text-slate-500" };
              const date = new Date(listing.createdAt).toLocaleDateString("he-IL");

              return (
                <tr key={listing.id} className="hover:bg-slate-50/50 transition-colors">
                  {/* Property info */}
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      {listing.imageUrl && (
                        <Image
                          src={listing.imageUrl}
                          alt=""
                          width={48}
                          height={40}
                          className="w-12 h-10 rounded-lg object-cover flex-shrink-0"
                        />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-800 truncate">{listing.address}</p>
                        <p className="text-[11px] text-slate-400">{listing.city} · {listing.rooms} חד׳ · {listing.sqm} מ״ר</p>
                      </div>
                    </div>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <span className="font-black text-blue-900">
                      ₪{(listing.price / 1_000_000).toFixed(1)}M
                    </span>
                  </td>

                  {/* Status badge */}
                  <td className="p-4">
                    <span className={`${status.className} px-2.5 py-1 rounded-full text-[10px] font-bold`}>
                      {status.text}
                    </span>
                  </td>

                  {/* Views */}
                  <td className="p-4 text-slate-500 font-semibold">
                    {listing.views.toLocaleString("he-IL")}
                  </td>

                  {/* Date */}
                  <td className="p-4 text-slate-400 text-xs">
                    {date}
                  </td>

                  {/* Actions */}
                  <td className="p-4 relative">
                    <button
                      type="button"
                      onClick={() => setOpenMenu(openMenu === listing.id ? null : listing.id)}
                      className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                    >
                      <MoreVertical className="h-4 w-4 text-slate-400" />
                    </button>

                    {openMenu === listing.id && (
                      <div className="absolute left-0 top-full mt-1 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-20 min-w-[120px]">
                        <button
                          onClick={() => { onArchive(listing.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer"
                        >
                          <Archive className="h-3.5 w-3.5" /> העבר לארכיון
                        </button>
                        <button
                          onClick={() => { onDelete(listing.id); setOpenMenu(null); }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-500 hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" /> מחק
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
