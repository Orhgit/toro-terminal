/**
 * /property/[id] — Server Component with full SEO.
 * generateMetadata for unique title/description/OG per property.
 * generateStaticParams for SSG of all listings.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { LISTINGS } from "../../data/listings";
import { PropertyView } from "./property-view";

interface Props {
  params: Promise<{ id: string }>;
}

// ISR — see (seo)/properties/[city]/page.tsx for rationale.
export const revalidate = 3600;

// ── Static generation for all listings ──────────────────────
export async function generateStaticParams() {
  return LISTINGS.map((l) => ({ id: l.id }));
}

// ── Dynamic metadata per listing ────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const listing = LISTINGS.find((l) => l.id === id);

  if (!listing) {
    return { title: "נכס לא נמצא | Toro" };
  }

  const typeLabel = listing.type === "apartment" ? "דירה" : listing.type === "penthouse" ? "פנטהאוז" : listing.type === "garden" ? "קוטג'" : "סטודיו";
  const priceFormatted = `₪${(listing.price / 1_000_000).toFixed(1)}M`;
  const title = `${typeLabel} ${listing.rooms} חדרים ב${listing.address}, ${listing.city} | ${priceFormatted}`;
  const description = `${listing.hook || listing.title}. ${listing.rooms} חדרים, ${listing.sqm} מ"ר, קומה ${listing.floor}. ${listing.parking ? "חניה, " : ""}${listing.elevator ? "מעלית, " : ""}${listing.balcony ? "מרפסת. " : ""}מחיר: ${priceFormatted}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      locale: "he_IL",
      images: listing.images?.[0] ? [{ url: listing.images[0], width: 1200, height: 630, alt: title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/property/${listing.id}`,
    },
  };
}

// ── Page (Server Component) ─────────────────────────────────
export default async function PropertyPage({ params }: Props) {
  const { id } = await params;
  const listing = LISTINGS.find((l) => l.id === id);

  if (!listing) {
    notFound();
  }

  // JSON-LD structured data for Google Rich Results
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing",
    name: listing.title || `${listing.type} ב${listing.address}`,
    description: listing.hook,
    url: `/property/${listing.id}`,
    datePosted: listing.createdAt,
    image: listing.images?.[0] || listing.imageUrl,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: "ILS",
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: listing.address,
      addressLocality: listing.city,
      addressRegion: listing.neighborhood,
      addressCountry: "IL",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: listing.lat,
      longitude: listing.lng,
    },
    floorSize: {
      "@type": "QuantitativeValue",
      value: listing.sqm,
      unitCode: "MTK",
    },
    numberOfRooms: listing.rooms,
    numberOfBathroomsTotal: listing.bathrooms,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: "/" },
      { "@type": "ListItem", position: 2, name: listing.city, item: `/properties/${encodeURIComponent(listing.city)}` },
      { "@type": "ListItem", position: 3, name: listing.address, item: `/property/${listing.id}` },
    ],
  };

  // VideoObject — surfaces the property in Google video search when a tour exists.
  const videoLd = listing.videoUrl
    ? {
        "@context": "https://schema.org",
        "@type": "VideoObject",
        name: `סיור וידאו — ${listing.title || listing.address}, ${listing.city}`,
        description: listing.hook || `סיור וידאו בנכס ב${listing.address}, ${listing.city}.`,
        thumbnailUrl: listing.images?.[0] || listing.imageUrl,
        contentUrl: listing.videoUrl,
        uploadDate: listing.createdAt,
      }
    : null;

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
      {videoLd && (
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoLd) }} />
      )}
      <PropertyView listing={listing} />
    </>
  );
}
