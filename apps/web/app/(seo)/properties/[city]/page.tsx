/**
 * /properties/[city] — Programmatic SEO city landing page.
 * Server Component with generateMetadata + generateStaticParams.
 * Targets queries like "דירות למכירה בתל אביב".
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getAllCities, getCityStats, getCityFAQs } from "../../../lib/city-data";
import { Building2, MapPin, TrendingUp, ArrowRight } from "lucide-react";

interface Props {
  params: Promise<{ city: string }>;
}

// ISR — regenerate at most once an hour so DB-driven listings (RIN-406)
// surface new properties without a full deploy. Safe-no-op while LISTINGS
// is hardcoded in the source tree.
export const revalidate = 3600;

// ── Static generation for all cities ────────────────────────
export async function generateStaticParams() {
  return getAllCities().map((city) => ({ city: encodeURIComponent(city) }));
}

// ── City-specific metadata ──────────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city: rawCity } = await params;
  const city = decodeURIComponent(rawCity);
  const stats = getCityStats(city);

  if (!stats) return { title: "עיר לא נמצאה | Toro" };

  const title = `דירות למכירה ב${city} | ${stats.count} נכסים | Toro`;
  const description = `${stats.count} נכסים למכירה ב${city}. מחירים החל מ-₪${(stats.minPrice / 1e6).toFixed(1)}M עד ₪${(stats.maxPrice / 1e6).toFixed(1)}M. שכונות: ${stats.neighborhoods.slice(0, 5).join(", ")}. חיפוש חכם עם מפה.`;

  return {
    title,
    description,
    openGraph: { title, description, type: "website", locale: "he_IL" },
    twitter: { card: "summary_large_image", title, description },
    alternates: { canonical: `/properties/${encodeURIComponent(city)}` },
  };
}

// ── Page (Server Component — fully crawlable) ───────────────
export default async function CityPage({ params }: Props) {
  const { city: rawCity } = await params;
  const city = decodeURIComponent(rawCity);
  const stats = getCityStats(city);

  if (!stats) notFound();

  const formatPrice = (p: number) => `₪${(p / 1e6).toFixed(1)}M`;

  // City centroid — average of listing coords. Gives Google a Place anchor.
  const lat = stats.listings.reduce((s, l) => s + l.lat, 0) / stats.count;
  const lng = stats.listings.reduce((s, l) => s + l.lng, 0) / stats.count;

  // CollectionPage wraps the listing ItemList — semantically more accurate
  // than bare ItemList, and lets us attach an `about` Place to the page.
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `נכסים למכירה ב${city}`,
    description: `${stats.count} נכסים למכירה ב${city}. מחירים החל מ-${formatPrice(stats.minPrice)} עד ${formatPrice(stats.maxPrice)}.`,
    inLanguage: "he-IL",
    about: {
      "@type": "Place",
      name: city,
      geo: { "@type": "GeoCoordinates", latitude: lat, longitude: lng },
      containedInPlace: { "@type": "Country", name: "Israel" },
    },
    mainEntity: {
      "@type": "ItemList",
      name: `נכסים למכירה ב${city}`,
      numberOfItems: stats.count,
      itemListElement: stats.listings.slice(0, 20).map((l, i) => ({
        "@type": "ListItem",
        position: i + 1,
        url: `/property/${l.id}`,
        name: `${l.title || l.address} — ${formatPrice(l.price)}`,
      })),
    },
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: "/" },
      { "@type": "ListItem", position: 2, name: `נכסים ב${city}`, item: `/properties/${encodeURIComponent(city)}` },
    ],
  };

  const faqs = getCityFAQs(stats);
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />

      <div className="min-h-screen bg-slate-50" dir="rtl">
        {/* Hero */}
        <div className="bg-gradient-to-br from-indigo-900 to-indigo-700 text-white">
          <div className="max-w-6xl mx-auto px-6 py-12 sm:py-16">
            <Link href="/" className="inline-flex items-center gap-1 text-indigo-200 text-xs font-bold mb-4 hover:text-white transition">
              <ArrowRight className="h-3 w-3" /> חזרה לכל הנכסים
            </Link>

            <div className="flex items-center gap-3 mb-3">
              <MapPin className="h-6 w-6 text-indigo-300" />
              <h1 className="text-3xl sm:text-4xl font-black">דירות למכירה ב{city}</h1>
            </div>
            <p className="text-indigo-200 text-sm max-w-2xl">
              {stats.count} נכסים זמינים ב{city}. מחירים החל מ-{formatPrice(stats.minPrice)} עד {formatPrice(stats.maxPrice)}.
              ממוצע מחיר למ״ר: ₪{stats.avgPricePerSqm.toLocaleString("he-IL")}.
            </p>

            {/* Stats bar */}
            <div className="flex flex-wrap gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-2xl font-black">{stats.count}</p>
                <p className="text-[10px] text-indigo-200">נכסים</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-2xl font-black">{formatPrice(stats.minPrice)}</p>
                <p className="text-[10px] text-indigo-200">החל מ-</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl px-5 py-3">
                <p className="text-2xl font-black">{stats.neighborhoods.length}</p>
                <p className="text-[10px] text-indigo-200">שכונות</p>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-8">
          {/* Neighborhoods */}
          <section className="mb-8">
            <h2 className="text-lg font-black text-slate-800 mb-3">שכונות ב{city}</h2>
            <div className="flex flex-wrap gap-2">
              {stats.neighborhoods.map((n) => (
                <span key={n} className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600">
                  {n}
                </span>
              ))}
            </div>
          </section>

          {/* Listings Grid — fully server-rendered HTML for SEO */}
          <section>
            <h2 className="text-lg font-black text-slate-800 mb-4">
              {stats.count} נכסים ב{city}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {stats.listings.map((l) => (
                <Link
                  key={l.id}
                  href={`/property/${l.id}`}
                  className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Image */}
                  <div className="relative h-44 bg-slate-100 overflow-hidden">
                    <Image
                      src={l.imageUrl}
                      alt={`${l.title || l.address} — ${formatPrice(l.price)}`}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-sm font-bold text-slate-800">{l.address}</h3>
                        <p className="text-[11px] text-slate-400">{l.neighborhood}</p>
                      </div>
                      <p className="text-sm font-black text-blue-900">{formatPrice(l.price)}</p>
                    </div>
                    <div className="flex gap-3 text-[11px] text-slate-500 font-medium">
                      <span>{l.rooms} חד׳</span>
                      <span>{l.sqm} מ״ר</span>
                      <span>קומה {l.floor}</span>
                    </div>
                    {l.hook && (
                      <p className="text-[11px] text-slate-400 line-clamp-2">{l.hook}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* SEO content block */}
          <section className="mt-12 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-800 mb-3">נדל״ן ב{city} — מדריך</h2>
            <div className="text-sm text-slate-600 leading-relaxed space-y-3">
              <p>
                {city} היא אחד מאזורי הנדל״ן המבוקשים בישראל עם {stats.count} נכסים זמינים כרגע.
                טווח המחירים נע בין {formatPrice(stats.minPrice)} ל-{formatPrice(stats.maxPrice)},
                כאשר המחיר הממוצע למ״ר עומד על ₪{stats.avgPricePerSqm.toLocaleString("he-IL")}.
              </p>
              <p>
                השכונות הפופולריות ב{city} כוללות: {stats.neighborhoods.join(", ")}.
                כל שכונה מציעה אופי ייחודי, קרבה לשירותים ציבוריים, ומגוון סוגי נכסים.
              </p>
              <p>
                ב-Toro תוכלו למצוא דירות, פנטהאוזים, קוטג׳ים ווילות ב{city}.
                השתמשו במפה האינטראקטיבית ובמסננים המתקדמים שלנו למציאת הנכס המושלם.
              </p>
            </div>
          </section>

          {/* FAQ — visible accordion. Required by Google for FAQPage rich results. */}
          <section className="mt-8 bg-white rounded-2xl border border-slate-100 p-6 sm:p-8">
            <h2 className="text-lg font-black text-slate-800 mb-4">שאלות נפוצות — נדל״ן ב{city}</h2>
            <div className="divide-y divide-slate-100">
              {faqs.map((f, i) => (
                <details key={i} className="group py-3" {...(i === 0 ? { open: true } : {})}>
                  <summary className="flex items-center justify-between cursor-pointer list-none text-sm font-bold text-slate-800 hover:text-indigo-700 transition">
                    <span>{f.question}</span>
                    <span className="text-indigo-500 text-lg group-open:rotate-45 transition-transform" aria-hidden="true">+</span>
                  </summary>
                  <p className="mt-2 text-sm text-slate-600 leading-relaxed">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Internal links to other cities */}
          <section className="mt-8">
            <h2 className="text-sm font-black text-slate-800 mb-3">נכסים בערים נוספות</h2>
            <div className="flex flex-wrap gap-2">
              {getAllCities().filter((c) => c !== city).slice(0, 12).map((c) => (
                <Link
                  key={c}
                  href={`/properties/${encodeURIComponent(c)}`}
                  className="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-600 hover:bg-indigo-50 transition"
                >
                  נכסים ב{c}
                </Link>
              ))}
            </div>
          </section>
        </div>

        <footer className="border-t border-slate-100 py-8 text-center mt-8">
          <p className="text-[11px] text-slate-400">Toro · נדל״ן ב{city}</p>
        </footer>
      </div>
    </>
  );
}
