/**
 * Dynamic sitemap.ts — auto-generated from LISTINGS / AGENTS data.
 * Google discovers all property pages, city pages, and agent pages.
 *
 * `lastModified` is derived from the most recent `createdAt` of underlying
 * listings (per-page when applicable). A static `now` would be ignored by
 * Google, so we surface real timestamps to keep the freshness signal honest.
 */

import type { MetadataRoute } from "next";
import { LISTINGS, CITIES } from "./data/listings";
import { AGENTS } from "./data/agent-types";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toro.co.il";

function maxCreatedAt(items: { createdAt: string }[]): string {
  return items.reduce(
    (max, l) => (l.createdAt > max ? l.createdAt : max),
    items[0]?.createdAt ?? new Date().toISOString(),
  );
}

export default function sitemap(): MetadataRoute.Sitemap {
  const latestOverall = maxCreatedAt(LISTINGS);

  // Home + login. Home freshness tracks the newest listing in the catalog.
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: latestOverall, changeFrequency: "daily", priority: 1.0 },
  ];

  // Per-listing pages. Priority bumped for promoted listings.
  const propertyPages: MetadataRoute.Sitemap = LISTINGS.map((l) => ({
    url: `${BASE_URL}/property/${l.id}`,
    lastModified: l.createdAt,
    changeFrequency: "weekly" as const,
    priority: l.promotionLevel === 2 ? 0.9 : 0.8,
  }));

  // City pages — lastModified = newest listing in that city.
  const cityPages: MetadataRoute.Sitemap = CITIES.map((city) => {
    const cityListings = LISTINGS.filter((l) => l.city === city);
    return {
      url: `${BASE_URL}/properties/${encodeURIComponent(city)}`,
      lastModified: maxCreatedAt(cityListings),
      changeFrequency: "daily" as const,
      priority: 0.9,
    };
  });

  // Agent mini-sites. No updatedAt field on AgentProfile yet — fall back to
  // the newest listing date as a proxy for "page content changed".
  const agentPages: MetadataRoute.Sitemap = AGENTS.map((a) => ({
    url: `${BASE_URL}/agent/${a.slug}`,
    lastModified: latestOverall,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  return [...staticPages, ...propertyPages, ...cityPages, ...agentPages];
}
