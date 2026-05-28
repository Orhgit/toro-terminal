import "./globals.css";
import "mapbox-gl/dist/mapbox-gl.css";
import type { Metadata } from "next";
import { Providers } from "./providers";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toro.co.il";

// ── Comprehensive root metadata ─────────────────────────────
export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "Toro — פלטפורמת הנדל״ן המתקדמת בישראל",
    template: "%s | Toro",
  },
  description: "מצאו דירות, פנטהאוזים, קוטג'ים ווילות למכירה בכל ישראל. חיפוש חכם עם מפה, סינון מתקדם, ומידע מלא על כל נכס. Powered by Toro AI.",
  keywords: [
    "דירות למכירה", "נדל״ן ישראל", "פנטהאוז", "קוטג'", "וילה",
    "דירות בתל אביב", "דירות בירושלים", "דירות בנתניה", "דירות בחיפה",
    "מרכז הנכסים", "תיווך נדל״ן", "Toro", "נכסים למכירה",
  ],
  openGraph: {
    type: "website",
    locale: "he_IL",
    siteName: "Toro",
    title: "Toro — פלטפורמת הנדל״ן המתקדמת בישראל",
    description: "מצאו את הנכס המושלם שלכם. חיפוש חכם, מפה אינטראקטיבית, ומאות נכסים ברחבי ישראל.",
    url: BASE_URL,
  },
  twitter: {
    card: "summary_large_image",
    title: "Toro",
    description: "פלטפורמת הנדל״ן המתקדמת בישראל — חיפוש חכם עם AI",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: "/",
    languages: { "he-IL": "/" },
  },
  manifest: "/manifest.json",
  other: {
    "geo.region": "IL",
    "geo.placename": "Israel",
    "content-language": "he",
    "apple-mobile-web-app-capable": "yes",
    "mobile-web-app-capable": "yes",
    "theme-color": "#4338ca",
  },
};

// ── Organization JSON-LD ────────────────────────────────────
const organizationLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Toro",
  alternateName: "Toro — Merkaz HaNechasim",
  url: BASE_URL,
  logo: `${BASE_URL}/icon-512.png`,
  description: "פלטפורמת נדל״ן מתקדמת לחיפוש, פרסום וניהול נכסים בישראל",
  areaServed: { "@type": "Country", name: "Israel" },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    availableLanguage: ["Hebrew", "English"],
  },
};

const websiteLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Toro",
  url: BASE_URL,
  potentialAction: {
    "@type": "SearchAction",
    target: `${BASE_URL}/?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
      </head>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
