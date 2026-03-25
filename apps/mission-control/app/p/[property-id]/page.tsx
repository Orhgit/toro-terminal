import { notFound } from "next/navigation";
import {
  MapPin,
  Bed,
  Maximize,
  Building2,
  Phone,
  MessageCircle,
  ChevronLeft,
  ShieldCheck,
  Star,
  Sparkles,
  ArrowLeft,
} from "lucide-react";
import { PROPERTIES } from "../../data/properties";
import type { Metadata } from "next";

interface PageProps {
  params: Promise<{ "property-id": string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { "property-id": id } = await params;
  const property = PROPERTIES.find((p) => p.property.id === id);
  if (!property) return { title: "Property Not Found" };

  return {
    title: `${property.shortHook || property.address} | Toro`,
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

  return (
    <div className="min-h-screen bg-(--color-bg)">
      {/* ── Hero Section ────────────────────────────────────── */}
      <section className="relative h-[70vh] min-h-[500px] overflow-hidden">
        {heroImage ? (
          <img
            src={heroImage}
            alt={data.address}
            className="absolute inset-0 w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-900 to-zinc-800" />
        )}

        {/* Dark overlay gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--color-bg)] via-black/40 to-black/20" />

        {/* Back link */}
        <a
          href="/"
          className="absolute top-6 right-6 flex items-center gap-2 text-sm text-white/70 hover:text-white transition-colors z-10"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Pipeline
        </a>

        {/* Hero content */}
        <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 max-w-5xl mx-auto">
          {data.visualDna && (
            <span className="badge bg-white/10 text-white/80 backdrop-blur-sm mb-4 text-xs">
              <Sparkles className="h-3 w-3" />
              {data.visualDna.style}
            </span>
          )}

          {data.shortHook && (
            <h1
              className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4"
              dir="rtl"
            >
              {data.shortHook}
            </h1>
          )}

          <div className="flex items-center gap-4 text-white/80 text-sm mb-6">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {data.address}, {data.city}
            </span>
          </div>

          {/* Specs strip */}
          <div className="flex items-center gap-6">
            <div className="glass rounded-xl px-6 py-3 flex items-center gap-6">
              <Stat icon={<Bed className="h-4 w-4" />} value={`${data.rooms}`} label="Rooms" />
              <div className="h-8 w-px bg-white/10" />
              <Stat icon={<Maximize className="h-4 w-4" />} value={`${data.sqm}m²`} label="Area" />
              <div className="h-8 w-px bg-white/10" />
              <Stat icon={<Building2 className="h-4 w-4" />} value={data.floor} label="Floor" />
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-bold text-white">₪{price}</p>
                <p className="text-[10px] text-white/50 uppercase tracking-wider">Price</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Content ─────────────────────────────────────────── */}
      <div className="max-w-5xl mx-auto px-8 md:px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {data.fullDescription && (
              <section>
                <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">
                  About This Property
                </h2>
                <p
                  className="text-sm leading-relaxed text-(--color-text-secondary)"
                  dir="rtl"
                >
                  {data.fullDescription}
                </p>
              </section>
            )}

            {/* Gallery */}
            {data.imageUrls.length > 1 && (
              <section>
                <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">
                  Gallery
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {data.imageUrls.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-[4/3] rounded-xl overflow-hidden bg-zinc-900"
                    >
                      <img
                        src={url}
                        alt={`${data.address} - ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Features */}
            {data.visionTags.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">
                  Features
                </h2>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {data.visionTags.map((tag) => (
                    <div
                      key={tag}
                      className="flex items-center gap-2.5 rounded-xl bg-(--color-bg-elevated) border border-(--color-border) p-3"
                    >
                      <Star className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                      <span className="text-sm text-(--color-text-secondary) capitalize">
                        {tag}
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Visual DNA */}
            {data.visualDna && (
              <section>
                <h2 className="text-lg font-semibold text-(--color-text-primary) mb-4">
                  Visual DNA
                </h2>
                <div className="card p-5">
                  <div className="grid grid-cols-3 gap-6">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) mb-1">
                        Style
                      </p>
                      <p className="text-sm font-medium text-(--color-text-primary)">
                        {data.visualDna.style}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) mb-1">
                        Vibe
                      </p>
                      <p className="text-sm font-medium text-(--color-text-primary)">
                        {data.visualDna.vibe}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-wider text-(--color-text-muted) mb-1">
                        Strengths
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {data.visualDna.strengths.map((s) => (
                          <span
                            key={s}
                            className="badge bg-indigo-500/10 text-indigo-400"
                          >
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

          {/* ── Sidebar (CTA) ──────────────────────────────── */}
          <div className="space-y-4">
            {/* Contact card */}
            <div className="card p-5 sticky top-6">
              <div className="text-center mb-5">
                <p className="text-3xl font-bold text-(--color-text-primary) mb-1">
                  ₪{price}
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {data.rooms} rooms · {data.sqm}m² · Floor {data.floor}
                </p>
              </div>

              <a
                href={`https://wa.me/972${data.property.owner_phone.replace(/\D/g, "").replace(/^0/, "")}?text=${encodeURIComponent(data.shortHook || "Hi, I'm interested in this property")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full mb-3 py-3"
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp Now
              </a>

              <a
                href={`tel:${data.property.owner_phone}`}
                className="btn-ghost w-full py-3"
              >
                <Phone className="h-4 w-4" />
                Call Agent
              </a>

              {/* Guardian badge */}
              {data.guardian && data.guardian.verdict === "safe" && (
                <div className="mt-4 pt-4 border-t border-(--color-border) flex items-center gap-2 justify-center">
                  <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs text-(--color-text-muted)">
                    Guardian Verified · Score {data.guardian.score}/100
                  </span>
                </div>
              )}
            </div>

            {/* Reel script preview */}
            {data.reelScript && (
              <div className="card p-5">
                <p className="text-xs font-semibold text-(--color-text-primary) mb-3">
                  Property Reel Preview
                </p>
                <div className="space-y-2">
                  {data.reelScript.map((scene, i) => (
                    <div
                      key={i}
                      className="rounded-lg bg-(--color-bg-hover) p-2.5"
                    >
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

      {/* ── Footer ──────────────────────────────────────────── */}
      <footer className="border-t border-(--color-border) py-8 text-center">
        <p className="text-xs text-(--color-text-muted)">
          Powered by Toro AI · Property listing generated automatically
        </p>
      </footer>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
}) {
  return (
    <div className="text-center">
      <div className="flex items-center justify-center gap-1.5 text-white mb-0.5">
        {icon}
        <span className="text-lg font-bold">{value}</span>
      </div>
      <p className="text-[10px] text-white/50 uppercase tracking-wider">{label}</p>
    </div>
  );
}
