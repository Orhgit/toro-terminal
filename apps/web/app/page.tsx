/**
 * Home — Server Component.
 * SSR-renders SEO content (h1, JSON-LD ItemList, top cities) so Googlebot
 * crawls real content before client hydration. Interactive UI lives in <HomeClient />.
 */

import Link from "next/link";
import { LISTINGS } from "./data/listings";
import { getAllCityStats } from "./lib/city-data";
import { HomeClient } from "./components/home-client";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toro.co.il";

export default function HomePage() {
  // Top 24 listings — promoted first, then newest. Server-computed so the
  // initial HTML payload contains real listing data for crawlers.
  const featured = [...LISTINGS]
    .sort((a, b) => {
      const promo = (b.promotionLevel ?? 0) - (a.promotionLevel ?? 0);
      if (promo !== 0) return promo;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    })
    .slice(0, 24);

  const topCities = getAllCityStats().slice(0, 12);

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "נכסים מובילים — Toro",
    numberOfItems: featured.length,
    itemListElement: featured.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/property/${l.id}`,
      name: `${l.title || l.address} — ₪${(l.price / 1_000_000).toFixed(1)}M`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />

      {/* Visually-hidden SEO content — present in HTML for crawlers, invisible to users. */}
      <div className="sr-only">
        <h1>Toro — פלטפורמת הנדל״ן המתקדמת בישראל</h1>
        <p>
          מצאו דירות, פנטהאוזים, קוטג׳ים ווילות למכירה בכל ישראל. חיפוש חכם עם
          מפה אינטראקטיבית, סינון מתקדם לפי מחיר, חדרים, שכונה וסוג נכס. מאות
          נכסים בערים המובילות: תל אביב, ירושלים, חיפה, נתניה, הרצליה, רמת גן,
          ראשון לציון, פתח תקווה ועוד.
        </p>
        <h2>נכסים מובילים</h2>
        <ul>
          {featured.map((l) => (
            <li key={l.id}>
              <Link href={`/property/${l.id}`}>
                {l.title || l.address} — {l.city}, {l.neighborhood} — ₪
                {(l.price / 1_000_000).toFixed(1)}M — {l.rooms} חדרים, {l.sqm}{" "}
                מ״ר
              </Link>
            </li>
          ))}
        </ul>
        <h2>נכסים לפי עיר</h2>
        <ul>
          {topCities.map((c) => (
            <li key={c.city}>
              <Link href={`/properties/${encodeURIComponent(c.city)}`}>
                דירות למכירה ב{c.city} — {c.count} נכסים
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <HomeClient />
    </>
  );
}
