// ============================================================
// Brand Guard — detects and enforces brand identity
// ============================================================

export interface BrandProfile {
  name: string;
  slug: string;
  logo: {
    path: string;
    width: number;
    height: number;
  };
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    textOnDark: string;
    textOnLight: string;
  };
  fonts: {
    heading: string;
    body: string;
    priceTag: string;
  };
  watermark: string;
}

// ============================================================
// Brand registry — add new agencies here
// ============================================================

const BRAND_REGISTRY: Record<string, BrandProfile> = {
  toro: {
    name: "Toro",
    slug: "toro",
    logo: { path: "/brands/toro/logo.svg", width: 120, height: 40 },
    colors: {
      primary: "#6366f1",
      secondary: "#8b5cf6",
      accent: "#c7d2fe",
      textOnDark: "#ffffff",
      textOnLight: "#1e293b",
    },
    fonts: {
      heading: "Inter",
      body: "Inter",
      priceTag: "Inter",
    },
    watermark: "TORO",
  },
  merkaz: {
    name: "מרכז הנכסים",
    slug: "merkaz",
    logo: { path: "/brands/merkaz/logo.svg", width: 140, height: 45 },
    colors: {
      primary: "#1a365d",
      secondary: "#2b6cb0",
      accent: "#bee3f8",
      textOnDark: "#ffffff",
      textOnLight: "#1a202c",
    },
    fonts: {
      heading: "Heebo",
      body: "Heebo",
      priceTag: "Heebo",
    },
    watermark: "מרכז הנכסים",
  },
  kidomedia: {
    name: "Kidomedia",
    slug: "kidomedia",
    logo: { path: "/brands/kidomedia/logo.svg", width: 130, height: 42 },
    colors: {
      primary: "#dc2626",
      secondary: "#f97316",
      accent: "#fef08a",
      textOnDark: "#ffffff",
      textOnLight: "#18181b",
    },
    fonts: {
      heading: "Rubik",
      body: "Rubik",
      priceTag: "Rubik",
    },
    watermark: "KIDOMEDIA",
  },
};

const DEFAULT_BRAND = BRAND_REGISTRY["toro"]!;

// ============================================================
// Public API
// ============================================================

/**
 * Detect which brand profile to use based on agency name or slug.
 * Falls back to Toro default if unrecognized.
 */
export function detectBrand(agencyHint?: string | null): BrandProfile {
  if (!agencyHint) return DEFAULT_BRAND;

  const normalized = agencyHint.toLowerCase().trim();

  for (const [key, profile] of Object.entries(BRAND_REGISTRY)) {
    if (
      normalized.includes(key) ||
      normalized.includes(profile.name.toLowerCase())
    ) {
      return profile;
    }
  }

  return DEFAULT_BRAND;
}

/**
 * Get a specific brand profile by slug.
 */
export function getBrand(slug: string): BrandProfile {
  return BRAND_REGISTRY[slug] ?? DEFAULT_BRAND;
}

/**
 * List all registered brands.
 */
export function listBrands(): BrandProfile[] {
  return Object.values(BRAND_REGISTRY);
}
