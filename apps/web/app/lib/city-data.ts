/**
 * City/neighborhood data extraction from LISTINGS for programmatic SEO.
 */

import { LISTINGS, type Listing } from "../data/listings";

export interface CityStats {
  city: string;
  slug: string;
  count: number;
  minPrice: number;
  maxPrice: number;
  avgPricePerSqm: number;
  neighborhoods: string[];
  listings: Listing[];
}

/**
 * Get stats for all cities with at least 1 listing.
 */
export function getAllCityStats(): CityStats[] {
  const cityMap = new Map<string, Listing[]>();

  for (const l of LISTINGS) {
    const list = cityMap.get(l.city) || [];
    list.push(l);
    cityMap.set(l.city, list);
  }

  return Array.from(cityMap.entries())
    .map(([city, listings]) => ({
      city,
      slug: city, // Hebrew slug — Google supports it
      count: listings.length,
      minPrice: Math.min(...listings.map((l) => l.price)),
      maxPrice: Math.max(...listings.map((l) => l.price)),
      avgPricePerSqm: Math.round(
        listings.reduce((s, l) => s + l.pricePerSqm, 0) / listings.length
      ),
      neighborhoods: [...new Set(listings.map((l) => l.neighborhood))],
      listings,
    }))
    .sort((a, b) => b.count - a.count);
}

/**
 * Get stats for a specific city.
 */
export function getCityStats(city: string): CityStats | null {
  const all = getAllCityStats();
  return all.find((c) => c.city === city || c.slug === city) || null;
}

/**
 * Get all unique city names for static generation.
 */
export function getAllCities(): string[] {
  return [...new Set(LISTINGS.map((l) => l.city))];
}

export interface FAQ {
  question: string;
  answer: string;
}

const TYPE_LABEL: Record<Listing["type"], string> = {
  apartment: "דירות",
  penthouse: "פנטהאוזים",
  garden: "קוטג׳ים ווילות",
  studio: "סטודיו",
};

function formatM(price: number): string {
  return `₪${(price / 1_000_000).toFixed(1)}M`;
}

/**
 * Derive 8 city-specific FAQs from real listing data. Used both for visible
 * FAQ accordion and for FAQPage JSON-LD on /properties/[city] pages.
 */
export function getCityFAQs(stats: CityStats): FAQ[] {
  const { city, count, minPrice, maxPrice, avgPricePerSqm, neighborhoods, listings } = stats;

  const types = [...new Set(listings.map((l) => l.type))]
    .map((t) => TYPE_LABEL[t])
    .join(", ");

  const avgRooms = (
    listings.reduce((s, l) => s + l.rooms, 0) / listings.length
  ).toFixed(1);

  const cheapest = listings.reduce((a, b) => (a.price < b.price ? a : b));
  const priciest = listings.reduce((a, b) => (a.price > b.price ? a : b));

  const withParking = listings.filter((l) => l.parking).length;
  const parkingPct = Math.round((withParking / count) * 100);

  return [
    {
      question: `כמה עולה דירה ב${city}?`,
      answer: `מחירי דירות ב${city} נעים בין ${formatM(minPrice)} ל-${formatM(maxPrice)}. ממוצע מחיר למ״ר עומד על ₪${avgPricePerSqm.toLocaleString("he-IL")}.`,
    },
    {
      question: `מה ממוצע מחיר למ״ר ב${city}?`,
      answer: `ממוצע מחיר למ״ר ב${city} עומד על ₪${avgPricePerSqm.toLocaleString("he-IL")} (לפי ${count} נכסים זמינים בפלטפורמה).`,
    },
    {
      question: `מהן השכונות הפופולריות ב${city}?`,
      answer: `השכונות שבהן מתפרסמים נכסים ב${city}: ${neighborhoods.join(", ")}.`,
    },
    {
      question: `כמה נכסים זמינים ב${city}?`,
      answer: `כרגע יש ${count} נכסים פעילים ב${city} בפלטפורמת Toro, מתפרסים על פני ${neighborhoods.length} שכונות שונות.`,
    },
    {
      question: `אילו סוגי נכסים אפשר למצוא ב${city}?`,
      answer: `ב${city} ניתן למצוא ${types}. החיפוש החכם של Toro מאפשר סינון מתקדם לפי סוג נכס, מספר חדרים, מחיר ושכונה.`,
    },
    {
      question: `מהו הנכס הזול ביותר הזמין ב${city}?`,
      answer: `הנכס הזול ביותר ב${city} הוא ב${cheapest.address} (${cheapest.neighborhood}) — ${cheapest.rooms} חדרים, ${cheapest.sqm} מ״ר, במחיר ${formatM(cheapest.price)}.`,
    },
    {
      question: `מהו הנכס היקר ביותר הזמין ב${city}?`,
      answer: `הנכס היקר ביותר ב${city} הוא ב${priciest.address} (${priciest.neighborhood}) — ${priciest.rooms} חדרים, ${priciest.sqm} מ״ר, במחיר ${formatM(priciest.price)}.`,
    },
    {
      question: `כמה חדרים יש בדרך כלל בדירות ב${city}?`,
      answer: `ממוצע מספר החדרים בדירות שמפורסמות ב${city} הוא ${avgRooms} חדרים. ${parkingPct}% מהנכסים כוללים חניה צמודה.`,
    },
  ];
}
