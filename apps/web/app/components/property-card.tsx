import type { Property } from "@repo/database/schema";

// ============================================================
// Types
// ============================================================

export interface PropertyCardData {
  property: Property;
  city: string;
  neighborhood: string;
  rooms: number;
  sqm: number;
  floor: string;
  marketing_hook: string;
  features: string[];
  image_url: string;
}

// ============================================================
// Helpers
// ============================================================

function formatPrice(price: number): string {
  if (price >= 1_000_000) {
    const millions = price / 1_000_000;
    const formatted = millions % 1 === 0 ? millions.toFixed(0) : millions.toFixed(1);
    return `${formatted}M`;
  }
  return new Intl.NumberFormat("he-IL", {
    maximumFractionDigits: 0,
  }).format(price);
}

function whatsappLink(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  const international = digits.startsWith("0")
    ? `972${digits.slice(1)}`
    : digits;
  return `https://wa.me/${international}`;
}

// ============================================================
// Component
// ============================================================

export function PropertyCard({ data }: { data: PropertyCardData }) {
  const { property, city, neighborhood, rooms, sqm, floor, marketing_hook, features, image_url } = data;

  return (
    <section className="relative h-screen w-full flex-shrink-0 overflow-hidden">
      {/* Background image */}
      <img
        src={image_url}
        alt={`${neighborhood}, ${city}`}
        className="absolute inset-0 h-full w-full object-cover scale-105"
      />

      {/* Subtle vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-black/30" />

      {/* Top bar — Toro branding + location */}
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-5">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-white/15 backdrop-blur-sm text-[10px] font-bold text-white">
            T
          </div>
          <span className="text-xs font-medium text-white/70 tracking-wider uppercase">Toro</span>
        </div>
        <div className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs text-white/80">
          {city}
        </div>
      </div>

      {/* Glass overlay */}
      <div className="glass absolute inset-x-0 bottom-0 px-6 pt-8 pb-28">
        <div className="stagger">
          {/* Price */}
          <div className="animate-float-up">
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold tracking-tight text-white">
                {formatPrice(property.price_asked)}
              </span>
              <span className="text-lg font-medium text-white/50">&#8362;</span>
            </div>
          </div>

          {/* Details pills */}
          <div className="mt-3 flex items-center gap-2 animate-float-up">
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              {rooms} חד׳
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              {sqm} מ״ר
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              {floor}
            </span>
            <span className="rounded-full bg-white/10 px-3 py-1 text-sm text-white/90">
              {neighborhood}
            </span>
          </div>

          {/* AI marketing hook */}
          <p className="mt-4 text-[15px] leading-relaxed text-white/85 font-medium animate-float-up">
            {marketing_hook}
          </p>

          {/* AI Feature tags with pulse dots */}
          <div className="mt-3 flex flex-wrap gap-2 animate-float-up">
            {features.map((feature) => (
              <span
                key={feature}
                className="flex items-center gap-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/20 px-2.5 py-1 text-xs text-indigo-200"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-indigo-400 animate-pulse-glow" />
                {feature}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* WhatsApp CTA */}
      <a
        href={whatsappLink(property.owner_phone)}
        target="_blank"
        rel="noopener noreferrer"
        className="group absolute bottom-7 left-1/2 -translate-x-1/2 flex items-center gap-2.5 rounded-full bg-gradient-to-r from-[#25D366] to-[#128C7E] px-7 py-3.5 text-sm font-bold text-white shadow-[0_8px_32px_rgba(37,211,102,0.35)] transition-all duration-200 hover:shadow-[0_8px_40px_rgba(37,211,102,0.5)] hover:scale-105 active:scale-95"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
        <span>דברו איתנו בוואטסאפ</span>
        <span className="opacity-0 max-w-0 overflow-hidden group-hover:opacity-100 group-hover:max-w-[60px] transition-all duration-300 text-xs text-white/80">
          Click &rarr;
        </span>
      </a>

      {/* Scroll hint on first card */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 opacity-40">
        <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={1.5} className="h-4 w-4 animate-bounce">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}
