import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { PropertyStatus, type PropertyDraft } from "@repo/database/schema";
import { isMockMode } from "./mock.js";

// ============================================================
// Schema
// ============================================================

export const ScoutResult = z.object({
  property: z.object({
    owner_phone: z.string(),
    price_asked: z.number(),
    status: PropertyStatus,
  }),
  address: z.string().describe("Full street address"),
  city: z.string().describe("City name in Hebrew"),
  rooms: z.number().int().describe("Number of rooms"),
  sqm: z.number().describe("Square meters"),
  floor: z.string().describe("Floor description in Hebrew"),
  description: z.string().describe("Original listing description"),
  imageUrls: z.array(z.string()).describe("Image URLs from the listing"),
  source: z.string().describe("Source platform: yad2, facebook, madlan, other"),
});

export type ScoutResult = z.infer<typeof ScoutResult>;

// ============================================================
// System prompt
// ============================================================

const SYSTEM_PROMPT = `You are the lead AI engine for Toro — Israel's fastest AI-driven real estate platform.
Your role: Field Scout — you parse raw scraped HTML/text from Israeli real estate listing pages.

You receive raw text content scraped from sites like Yad2, Facebook Marketplace, or Madlan.
Extract every piece of structured property data you can find.

Rules:
- owner_phone: Extract any phone number. Normalize to local format (052-XXXXXXX).
- price_asked: Extract the price in ILS. Handle "₪", "ש״ח", commas, etc.
- address: Full street address as written.
- city: City name in Hebrew.
- rooms: Number of rooms (חדרים).
- sqm: Square meters (מ״ר).
- floor: Floor info in Hebrew (e.g., "קומה 3 מתוך 7").
- description: The original listing description text, cleaned up.
- imageUrls: Any image URLs found in the scraped content.
- source: The platform name.
- status: Default to "active" for scraped listings.

If a field cannot be found, use reasonable defaults (0 for numbers, "לא צוין" for text).`;

// ============================================================
// Scraper stub — would use Playwright/Puppeteer in production
// ============================================================

async function scrapeUrl(url: string): Promise<string> {
  // In production: Playwright/Puppeteer or a scraping API (ScrapingBee, Apify, etc.)
  // For now, return the URL as context — the AI will work with whatever text we provide
  return `[Scraped content from: ${url}]\n\nThis is a stub. In production, Playwright extracts the full page text and image URLs.`;
}

// ============================================================
// Mock data by source
// ============================================================

const MOCK_RESULTS: Record<string, ScoutResult> = {
  yad2: {
    property: { owner_phone: "052-8887766", price_asked: 2_750_000, status: "active" },
    address: "רחוב סוקולוב 42",
    city: "רמת גן",
    rooms: 4,
    sqm: 95,
    floor: "קומה 5 מתוך 8",
    description: "דירת 4 חדרים מרווחת ומוארת ברחוב סוקולוב, מרכז רמת גן. שיפוץ מלא, מטבח חדש, 2 חדרי רחצה, ממ״ד, מרפסת שמש גדולה. קרוב לבורסה ולרכבת. מתאימה למשפחות.",
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    source: "yad2",
  },
  facebook: {
    property: { owner_phone: "054-3211234", price_asked: 1_680_000, status: "active" },
    address: "רחוב הפלמ״ח 18",
    city: "כפר סבא",
    rooms: 3,
    sqm: 75,
    floor: "קומה 2 מתוך 5",
    description: "דירת 3 חדרים בכפר סבא הירוקה. קומה נמוכה, שקט, חניה, מחסן. 5 דק׳ הליכה מפארק העירוני. מושלמת לזוג צעיר או להשקעה. פינוי גמיש.",
    imageUrls: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
    ],
    source: "facebook",
  },
  madlan: {
    property: { owner_phone: "050-9998877", price_asked: 4_200_000, status: "active" },
    address: "שדרות הנשיא 88",
    city: "חולון",
    rooms: 5,
    sqm: 130,
    floor: "קומה 10 מתוך 12",
    description: "פנטהאוז 5 חדרים בפרויקט חדש בחולון. מרפסת 30 מ״ר עם נוף פתוח, 3 חדרי רחצה, מטבח שף, חניה כפולה. מסירה מיידית. מתאים למשפחה גדולה.",
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    ],
    source: "madlan",
  },
};

function detectSource(url: string): string {
  if (url.includes("yad2")) return "yad2";
  if (url.includes("facebook") || url.includes("fb.com")) return "facebook";
  if (url.includes("madlan")) return "madlan";
  return "yad2"; // default mock
}

// ============================================================
// Public API
// ============================================================

/**
 * Scout a property listing from an external URL.
 * Scrapes the page, passes raw text to AI, returns structured data.
 */
export async function scoutProperty(url: string): Promise<ScoutResult> {
  if (isMockMode()) {
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1500));
    const source = detectSource(url);
    return MOCK_RESULTS[source] ?? MOCK_RESULTS.yad2!;
  }

  const rawText = await scrapeUrl(url);
  const openai = new OpenAI();

  const response = await openai.beta.chat.completions.parse({
    model: "gpt-4o-mini",
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "user",
        content: `Parse this scraped real estate listing from ${url}:\n\n${rawText}`,
      },
    ],
    response_format: zodResponseFormat(ScoutResult, "scout_result"),
  });

  const parsed = response.choices[0]?.message.parsed;

  if (!parsed) {
    const refusal = response.choices[0]?.message.refusal;
    throw new Error(
      refusal
        ? `Scout model refused: ${refusal}`
        : "Failed to scout property — no structured output returned"
    );
  }

  return parsed;
}
