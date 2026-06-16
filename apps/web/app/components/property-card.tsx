"use client";
import React, { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Heart } from 'lucide-react';
import type { Listing } from "../data/listings";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013467402-9fef26628c91?q=80&w=600";

function imageAlt(l: Listing): string {
  const typeLabel = l.type === "apartment" ? "דירה" : l.type === "penthouse" ? "פנטהאוז" : l.type === "garden" ? "קוטג'" : "סטודיו";
  return `${typeLabel} ${l.rooms} חדרים ב${l.address}, ${l.city}`;
}

interface CardProps {
  listing: Listing;
  onHover?: (id: string | null) => void;
  highlighted?: boolean;
}

export const PropertyCard = ({ listing, onHover, highlighted }: CardProps) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(listing.imageUrl || FALLBACK_IMAGE);
  if (!listing) return null;
  const isGold = listing.promotionLevel === 2;
  const isSilver = listing.promotionLevel === 1;

  return (
    <article
      onClick={() => router.push(`/property/${listing.id}`)}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group relative bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border
        ${isGold ? "border-yellow-400 shadow-xl" : "border-gray-100 shadow-sm hover:shadow-md"}
        ${highlighted ? "ring-2 ring-indigo-400" : ""}`}
    >
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorite((v) => !v); }}
        className="absolute top-3 left-3 z-50 h-9 w-9 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition cursor-pointer"
        aria-label={isFavorite ? "הסר ממועדפים" : "שמור למועדפים"}
      >
        <Heart className={`h-4.5 w-4.5 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
      </button>

      <div className="absolute top-3 right-3 z-10">
        {isGold && <span className="bg-yellow-400 text-black text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm italic uppercase">👑 VIP Gold</span>}
        {isSilver && <span className="bg-blue-100 text-blue-700 text-[10px] px-2.5 py-1 rounded-full font-black shadow-sm">Silver</span>}
      </div>

      <div className="relative h-48 overflow-hidden bg-gray-100">
        <Image
          src={imgSrc}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          alt={imageAlt(listing)}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
      </div>

      <div className="p-5 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-2xl font-black text-blue-900 leading-none">₪{(listing.price / 1_000_000).toFixed(1)}M</p>
          <span className="text-[10px] text-gray-400 font-bold tracking-widest">
            {listing.category === "private" ? "פרטי" : listing.category === "agency" ? "תיווך" : "מסחרי"}
          </span>
        </div>

        <p className="text-sm font-bold text-gray-700 truncate leading-tight">{listing.address}</p>

        <div className="flex justify-between items-center py-3 border-t border-gray-50 text-gray-500">
          <div className="flex gap-4 text-xs font-bold">
            <span className="flex items-center gap-1">🛏️ {listing.rooms} חד׳</span>
            <span className="flex items-center gap-1">📏 {listing.sqm} מ״ר</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button onClick={(e) => { e.stopPropagation(); router.push(`/property/${listing.id}`); }} className="bg-gray-50 text-gray-600 py-2.5 rounded-xl text-xs font-black hover:bg-gray-100 transition cursor-pointer">פרטים</button>
          <a
            href={`https://wa.me/9720542498166?text=${encodeURIComponent("היי, אני מעוניין בנכס ב-" + listing.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-green-500 text-white py-2.5 rounded-xl text-xs font-black text-center hover:bg-green-600 transition shadow-sm"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </article>
  );
};

// List view variant
export const PropertyCardList = ({ listing, onHover, highlighted }: CardProps) => {
  const router = useRouter();
  const [isFavorite, setIsFavorite] = useState(false);
  const [imgSrc, setImgSrc] = useState(listing.imageUrl || FALLBACK_IMAGE);
  if (!listing) return null;
  const isGold = listing.promotionLevel === 2;

  return (
    <div
      onClick={() => router.push(`/property/${listing.id}`)}
      onMouseEnter={() => onHover?.(listing.id)}
      onMouseLeave={() => onHover?.(null)}
      className={`group flex bg-white rounded-3xl overflow-hidden cursor-pointer transition-all duration-300 border
        ${isGold ? "border-yellow-400 shadow-xl" : "border-gray-100 shadow-sm hover:shadow-md"}
        ${highlighted ? "ring-2 ring-indigo-400" : ""}`}
    >
      <div className="w-[120px] sm:w-[180px] flex-shrink-0 bg-gray-100 overflow-hidden relative">
        <Image
          src={imgSrc}
          onError={() => setImgSrc(FALLBACK_IMAGE)}
          alt={imageAlt(listing)}
          fill
          sizes="180px"
          className="object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <button
          onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsFavorite((v) => !v); }}
          className="absolute top-2 left-2 z-50 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-white transition cursor-pointer"
          aria-label={isFavorite ? "הסר ממועדפים" : "שמור למועדפים"}
        >
          <Heart className={`h-4 w-4 transition-colors ${isFavorite ? "fill-red-500 text-red-500" : "text-gray-400"}`} />
        </button>
        {isGold && <span className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] px-2 py-1 rounded-full font-black shadow-sm">👑 VIP</span>}
      </div>
      <div className="flex-1 p-4 flex flex-col justify-between min-w-0">
        <div>
          <div className="flex items-center justify-between mb-1">
            <p className="text-xl font-black text-blue-900">₪{(listing.price / 1_000_000).toFixed(1)}M</p>
            <span className="text-[10px] text-gray-400 font-bold">{listing.category === "private" ? "פרטי" : listing.category === "agency" ? "תיווך" : "מסחרי"}</span>
          </div>
          <p className="text-xs font-bold text-gray-700 truncate">{listing.address}, {listing.neighborhood}, {listing.city}</p>
        </div>
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-50">
          <div className="flex gap-3 text-xs text-gray-400 font-bold">
            <span>🛏️ {listing.rooms} חד׳</span>
            <span>📏 {listing.sqm} מ״ר</span>
          </div>
          <a
            href={`https://wa.me/9720542498166?text=${encodeURIComponent("היי, אני מעוניין בנכס ב-" + listing.address)}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="bg-green-500 text-white px-3 py-1.5 rounded-xl text-[10px] font-black hover:bg-green-600 transition"
          >
            WhatsApp
          </a>
        </div>
      </div>
    </div>
  );
};
