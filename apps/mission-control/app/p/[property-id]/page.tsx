import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  MapPin,
  Bed,
  Bath,
  Building2,
  Car,
  ArrowUpDown,
  Maximize,
  Heart,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Ruler,
  Sun,
  Shield,
  GraduationCap,
  Trees,
  ShoppingBag,
  Train,
  UtensilsCrossed,
  Dumbbell,
  Cross,
  Star,
  CalendarDays,
  Download,
  Phone,
  Clock,
  Warehouse,
  Hammer,
  Calendar,
  ChevronLeft,
} from "lucide-react";
import { PROPERTIES, type PointOfInterest, type SmartInsight } from "../../data/properties";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ "property-id": string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { "property-id": id } = await params;
  const property = PROPERTIES.find((p) => p.property.id === id);
  if (!property) return { title: "Property Not Found" };

  return {
    title: `${property.shortHook || property.address} | מרכז הנכסים`,
    description: property.fullDescription || `${property.address}, ${property.city}`,
    openGraph: {
      title: property.shortHook || property.address,
      description: property.fullDescription,
      images: property.imageUrls[0] ? [{ url: property.imageUrls[0] }] : [],
    },
  };
}

export default async function PropertyLandingPage({ params }: PageProps) {
  const { "property-id": id } = await params;
  const data = PROPERTIES.find((p) => p.property.id === id);
  if (!data) notFound();

  const price = data.property.price_asked.toLocaleString("he-IL");
  const heroImage = data.imageUrls[0];
  const pricePerSqm = Math.round(data.property.price_asked / data.sqm).toLocaleString("he-IL");

  return (
    <div className="min-h-screen bg-(--color-bg)">
      {/* ── Hero ───────────────────────────────────────────────── */}
      <section className="relative h-[75vh] min-h-[550px] overflow-hidden">
        {heroImage ? (
          <Image
            src={heroImage}
            alt={data.address}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
        )}
        <div className="absolute inset-0 landing-header" />

        {/* Top bar */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 md:px-10 py-5">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-white/60 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </Link>
          <div className="flex items-center gap-3">
            {data.guardian?.verdict === "safe" && (
              <span className="badge bg-emerald-500/15 text-emerald-400 backdrop-blur-sm">
                <ShieldCheck className="h-3 w-3" />
                Guardian Verified
              </span>
            )}
            {data.visualDna && (
              <span className="badge bg-white/10 text-white/70 backdrop-blur-sm">
                {data.visualDna.style}
              </span>
            )}
          </div>
        </div>

        {/* ── Property Identity — Hero bottom ──────────────────── */}
        <div className="absolute bottom-0 inset-x-0 px-6 md:px-10 pb-10 pt-32 max-w-6xl mx-auto">
          {/* Hook headline */}
          {data.shortHook && (
            <h1
              className="text-3xl md:text-[2.75rem] lg:text-5xl font-bold text-white leading-[1.15] mb-5 max-w-3xl"
              dir="rtl"
            >
              {data.shortHook}
            </h1>
          )}

          {/* Address + favorite */}
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-2 text-white/70 text-sm">
              <MapPin className="h-4 w-4 text-indigo-400" />
              <span>{data.address}, {data.city}</span>
            </div>
            <button className="flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm text-white/80 hover:bg-white/20 hover:text-white transition-all border border-white/10">
              <Heart className="h-4 w-4" />
              <span className="hidden sm:inline">Save</span>
            </button>
          </div>

          {/* Price + quick stats */}
          <div className="flex items-end gap-6 flex-wrap">
            <div className="glass-price rounded-2xl px-7 py-4">
              <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold mb-1">
                Price
              </p>
              <p className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                ₪{price}
              </p>
              <p className="text-xs text-white/40 mt-0.5">
                ₪{pricePerSqm}/m²
              </p>
            </div>
            <div className="glass rounded-xl px-5 py-3 flex items-center gap-5">
              <QuickStat icon={<Bed className="h-4 w-4" />} value={`${data.specs.bedrooms}`} label="Bedrooms" />
              <div className="h-8 w-px bg-white/10" />
              <QuickStat icon={<Maximize className="h-4 w-4" />} value={`${data.sqm}m²`} label="Area" />
              <div className="h-8 w-px bg-white/10" />
              <QuickStat icon={<Building2 className="h-4 w-4" />} value={data.specs.floor} label="Floor" />
              {data.specs.balconySqm && (
                <>
                  <div className="h-8 w-px bg-white/10" />
                  <QuickStat icon={<Sun className="h-4 w-4" />} value={`${data.specs.balconySqm}m²`} label="Balcony" />
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────────── */}
      <div className="max-w-6xl mx-auto px-6 md:px-10 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* ── Main Column ────────────────────────────────────── */}
          <div className="lg:col-span-2 space-y-10">

            {/* Description */}
            {data.fullDescription && (
              <section>
                <h2 className="text-lg font-bold text-(--color-text-primary) mb-4">
                  About This Property
                </h2>
                <p className="text-[15px] leading-[1.8] text-(--color-text-secondary)" dir="rtl">
                  {data.fullDescription}
                </p>
              </section>
            )}

            {/* ── Interactive Specs Grid ────────────────────────── */}
            <section>
              <h2 className="text-lg font-bold text-(--color-text-primary) mb-4">
                Property Details
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                <SpecTile icon={<Bed className="h-5 w-5" />} value={`${data.specs.bedrooms}`} label="Bedrooms" />
                <SpecTile icon={<Bath className="h-5 w-5" />} value={`${data.specs.bathrooms}`} label="Bathrooms" />
                <SpecTile icon={<Maximize className="h-5 w-5" />} value={`${data.sqm}m²`} label="Area" />
                <SpecTile icon={<Building2 className="h-5 w-5" />} value={data.specs.floor} label="Floor" />
                {data.specs.parking && (
                  <SpecTile icon={<Car className="h-5 w-5" />} value={data.specs.parking} label="Parking" />
                )}
                <SpecTile icon={<ArrowUpDown className="h-5 w-5" />} value={data.specs.elevator ? "Yes" : "No"} label="Elevator" />
                {data.specs.balconySqm && (
                  <SpecTile icon={<Sun className="h-5 w-5" />} value={`${data.specs.balconySqm}m²`} label="Balcony" />
                )}
                {data.specs.storage && (
                  <SpecTile icon={<Warehouse className="h-5 w-5" />} value="Yes" label="Storage" />
                )}
                {data.specs.renovation && (
                  <SpecTile icon={<Hammer className="h-5 w-5" />} value={data.specs.renovation} label="Renovation" />
                )}
                {data.specs.yearBuilt && (
                  <SpecTile icon={<Calendar className="h-5 w-5" />} value={`${data.specs.yearBuilt}`} label="Year Built" />
                )}
              </div>
            </section>

            {/* ── Smart Insights ────────────────────────────────── */}
            {data.smartInsights.length > 0 && (
              <section>
                <h2 className="text-lg font-bold text-(--color-text-primary) mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-indigo-400" />
                  Smart Insights
                </h2>
                <div className="space-y-3">
                  {data.smartInsights.map((insight, i) => (
                    <InsightRow key={i} insight={insight} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Gallery ──────────────────────────────────────── */}
            {data.imageUrls.length > 1 && (
              <section>
                <h2 className="text-lg font-bold text-(--color-text-primary) mb-4">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {data.imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className={`rounded-2xl overflow-hidden bg-zinc-900 ${
                        i === 0 && data.imageUrls.length > 2 ? "col-span-2 aspect-[21/9]" : "aspect-[4/3]"
                      }`}
                    >
                      <Image
                        src={url}
                        alt={`${data.address} - ${i + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 50vw"
                        className="object-cover hover:scale-105 transition-transform duration-700"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ── Neighborhood Hero ─────────────────────────────── */}
            {data.neighborhood && (
              <section>
                <h2 className="text-lg font-bold text-(--color-text-primary) mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-indigo-400" />
                  The Neighborhood
                </h2>

                {/* Map placeholder with POIs */}
                <div className="map-container h-[280px] mb-5 flex items-center justify-center">
                  <div className="relative z-10 text-center px-6">
                    {/* Decorative pin */}
                    <div className="mx-auto mb-4 h-12 w-12 rounded-full merkaz-gradient flex items-center justify-center shadow-lg shadow-indigo-500/20 float-subtle">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                    <p className="text-sm font-semibold text-(--color-text-primary) mb-1">
                      {data.address}
                    </p>
                    <p className="text-xs text-(--color-text-muted) mb-3">
                      {data.neighborhood.lat.toFixed(4)}°N, {data.neighborhood.lng.toFixed(4)}°E
                    </p>
                    {/* Walk Score */}
                    <div className="inline-flex items-center gap-2 rounded-full bg-(--color-bg-hover) border border-(--color-border) px-4 py-2">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        data.neighborhood.walkScore >= 80 ? "bg-emerald-400/15 text-emerald-400" :
                        data.neighborhood.walkScore >= 60 ? "bg-amber-400/15 text-amber-400" :
                        "bg-rose-400/15 text-rose-400"
                      }`}>
                        {data.neighborhood.walkScore}
                      </div>
                      <span className="text-xs text-(--color-text-secondary)">Walk Score</span>
                    </div>
                  </div>

                  {/* Decorative POI dots positioned around the map */}
                  {data.neighborhood.pois.slice(0, 5).map((poi, i) => {
                    const positions = [
                      "top-8 right-12", "top-16 left-10", "bottom-12 right-20",
                      "bottom-8 left-16", "top-1/2 right-8",
                    ];
                    return (
                      <div
                        key={poi.name}
                        className={`absolute ${positions[i]} flex items-center gap-2 z-10`}
                      >
                        <div className={`poi-dot ${POI_COLORS[poi.type]}`} />
                        <span className="text-[10px] text-(--color-text-muted) hidden md:block">
                          {poi.name}
                        </span>
                      </div>
                    );
                  })}
                </div>

                {/* Neighborhood Vibe paragraph */}
                <div className="rounded-2xl bg-(--color-bg-elevated) border border-(--color-border) p-5 mb-5">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">
                    Neighborhood Vibe
                  </p>
                  <p className="text-sm leading-[1.8] text-(--color-text-secondary)" dir="rtl">
                    {data.neighborhood.vibe}
                  </p>
                  <div className="flex items-center gap-4 mt-4 pt-4 border-t border-(--color-border)">
                    <div>
                      <p className="text-xs text-(--color-text-muted)">Avg. Price/m²</p>
                      <p className="text-sm font-bold text-(--color-text-primary)">
                        ₪{data.neighborhood.avgPricePerSqm.toLocaleString("he-IL")}
                      </p>
                    </div>
                    <div className="h-8 w-px bg-(--color-border)" />
                    <div>
                      <p className="text-xs text-(--color-text-muted)">Walk Score</p>
                      <p className="text-sm font-bold text-(--color-text-primary)">
                        {data.neighborhood.walkScore}/100
                      </p>
                    </div>
                    <div className="h-8 w-px bg-(--color-border)" />
                    <div>
                      <p className="text-xs text-(--color-text-muted)">This Property</p>
                      <p className="text-sm font-bold text-(--color-text-primary)">
                        ₪{pricePerSqm}/m²
                      </p>
                    </div>
                  </div>
                </div>

                {/* POI List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {data.neighborhood.pois.map((poi) => (
                    <PoiRow key={poi.name} poi={poi} />
                  ))}
                </div>
              </section>
            )}

            {/* ── Visual DNA ───────────────────────────────────── */}
            {data.visualDna && (
              <section>
                <h2 className="text-lg font-bold text-(--color-text-primary) mb-4">
                  Visual DNA
                </h2>
                <div className="card p-6">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-muted) mb-1.5">
                        Style
                      </p>
                      <p className="text-base font-semibold text-(--color-text-primary)">
                        {data.visualDna.style}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-muted) mb-1.5">
                        Vibe
                      </p>
                      <p className="text-base font-semibold text-(--color-text-primary)">
                        {data.visualDna.vibe}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-(--color-text-muted) mb-1.5">
                        Strengths
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {data.visualDna.strengths.map((s) => (
                          <span key={s} className="badge bg-indigo-500/10 text-indigo-400">
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            )}
          </div>

          {/* ── Sidebar — Next Step Module ──────────────────────── */}
          <div className="space-y-5">
            {/* Schedule a Tour Widget */}
            <div className="schedule-widget p-6 sticky top-6">
              {/* Brand header */}
              <div className="flex items-center gap-3 mb-5 pb-4 border-b border-(--color-border)">
                <div className="h-10 w-10 rounded-xl merkaz-gradient flex items-center justify-center shadow-lg shadow-indigo-500/15">
                  <Building2 className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-bold text-(--color-text-primary)">
                    Merkaz HaNechasim
                  </p>
                  <p className="text-[10px] text-(--color-text-muted) font-medium">
                    מרכז הנכסים
                  </p>
                </div>
              </div>

              {/* Price recap */}
              <div className="text-center mb-5">
                <p className="text-3xl font-bold text-(--color-text-primary) mb-0.5">
                  ₪{price}
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {data.specs.bedrooms} bed · {data.specs.bathrooms} bath · {data.sqm}m² · Floor {data.specs.floor}
                </p>
              </div>

              {/* Schedule a Tour — primary CTA */}
              <div className="space-y-2.5 mb-5">
                <button className="w-full flex items-center justify-center gap-2.5 rounded-xl merkaz-gradient px-4 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all cursor-pointer">
                  <CalendarDays className="h-4.5 w-4.5" />
                  Schedule a Tour
                </button>

                {/* Time slots preview */}
                <div className="grid grid-cols-3 gap-2">
                  {["Tomorrow 10:00", "Thu 14:00", "Fri 11:00"].map((slot) => (
                    <button
                      key={slot}
                      className="rounded-lg bg-(--color-bg-hover) border border-(--color-border) px-2 py-2 text-center hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all cursor-pointer"
                    >
                      <Clock className="h-3 w-3 text-(--color-text-muted) mx-auto mb-1" />
                      <p className="text-[10px] font-medium text-(--color-text-secondary) leading-tight">
                        {slot}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Download Portfolio */}
              <button className="btn-ghost w-full py-3 mb-3">
                <Download className="h-4 w-4" />
                Download Full Portfolio
              </button>

              {/* Call agent */}
              <a
                href={`tel:${data.property.owner_phone}`}
                className="btn-ghost w-full py-3"
              >
                <Phone className="h-4 w-4" />
                Call Agent · {data.property.owner_phone}
              </a>

              {/* Guardian verified */}
              {data.guardian?.verdict === "safe" && (
                <div className="mt-5 pt-4 border-t border-(--color-border) flex items-center gap-2 justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-(--color-text-muted)">
                    Guardian Verified · {data.guardian.score}/100
                  </span>
                </div>
              )}
            </div>

            {/* Reel preview */}
            {data.reelScript && (
              <div className="card p-5">
                <p className="text-xs font-bold text-(--color-text-primary) mb-3">
                  Property Reel Preview
                </p>
                <div className="space-y-2">
                  {data.reelScript.map((scene, i) => (
                    <div key={i} className="rounded-lg bg-(--color-bg-hover) p-2.5">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 mb-1">
                        Scene {i + 1}
                      </p>
                      <p className="text-xs text-(--color-text-secondary)" dir="rtl">
                        {scene.text_overlay}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Footer ──────────────────────────────────────────────── */}
      <footer className="border-t border-(--color-border) py-8">
        <div className="max-w-6xl mx-auto px-6 md:px-10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg merkaz-gradient flex items-center justify-center">
              <Building2 className="h-4 w-4 text-white" />
            </div>
            <div>
              <p className="text-xs font-semibold text-(--color-text-secondary)">Merkaz HaNechasim</p>
              <p className="text-[10px] text-(--color-text-muted)">מרכז הנכסים · Powered by Toro AI</p>
            </div>
          </div>
          <p className="text-[10px] text-(--color-text-muted)">
            Listing generated automatically
          </p>
        </div>
      </footer>
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────

function QuickStat({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 text-white mb-0.5">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-[10px] text-white/40 uppercase tracking-wider">{label}</p>
    </div>
  );
}

function SpecTile({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (
    <div className="spec-tile">
      <div className="text-indigo-400 mb-2 flex justify-center">{icon}</div>
      <p className="text-sm font-bold text-(--color-text-primary) mb-0.5" dir="rtl">{value}</p>
      <p className="text-[10px] text-(--color-text-muted) uppercase tracking-wider">{label}</p>
    </div>
  );
}

const POI_ICONS: Record<string, typeof GraduationCap> = {
  school: GraduationCap,
  park: Trees,
  shopping: ShoppingBag,
  transit: Train,
  restaurant: UtensilsCrossed,
  gym: Dumbbell,
  medical: Cross,
};

const POI_COLORS: Record<string, string> = {
  school: "bg-amber-400",
  park: "bg-emerald-400",
  shopping: "bg-pink-400",
  transit: "bg-sky-400",
  restaurant: "bg-orange-400",
  gym: "bg-violet-400",
  medical: "bg-rose-400",
};

function PoiRow({ poi }: { poi: PointOfInterest }) {
  const Icon = POI_ICONS[poi.type] ?? Star;
  const dotColor = POI_COLORS[poi.type] ?? "bg-zinc-400";

  return (
    <div className="flex items-center gap-3 rounded-xl bg-(--color-bg-elevated) border border-(--color-border) p-3 hover:border-(--color-border-hover) transition-colors">
      <div className={`h-8 w-8 rounded-lg ${dotColor}/10 flex items-center justify-center flex-shrink-0`}>
        <Icon className={`h-4 w-4 ${dotColor.replace("bg-", "text-")}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-(--color-text-primary) truncate" dir="rtl">
          {poi.name}
        </p>
        <p className="text-[10px] text-(--color-text-muted) capitalize">
          {poi.type}
        </p>
      </div>
      <div className="text-left flex-shrink-0">
        <p className="text-xs font-semibold text-(--color-text-secondary)">
          {poi.distance}
        </p>
        <p className="text-[10px] text-(--color-text-muted)">
          {poi.walkMinutes} min walk
        </p>
      </div>
    </div>
  );
}

const INSIGHT_ICONS: Record<SmartInsight["icon"], typeof Sparkles> = {
  sparkle: Sparkles,
  trending: TrendingUp,
  ruler: Ruler,
  sun: Sun,
  shield: Shield,
};

function InsightRow({ insight }: { insight: SmartInsight }) {
  const Icon = INSIGHT_ICONS[insight.icon];

  return (
    <div className="insight-card flex items-start gap-3">
      <div className="h-9 w-9 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon className="h-4.5 w-4.5 text-indigo-400" />
      </div>
      <p className="text-sm text-(--color-text-secondary) leading-relaxed pt-1.5" dir="rtl">
        {insight.text}
      </p>
    </div>
  );
}
