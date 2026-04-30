import type { Property } from "@repo/database/schema";

// ============================================================
// Dashboard-specific types
// ============================================================

export type MarketingStatus =
  | "ai_processing"
  | "awaiting_graphics"
  | "in_review"
  | "published";

export interface ReelScene {
  visual_cue: string;
  text_overlay: string;
  audio_vibe: string;
}

export interface VisualDna {
  style: string;
  strengths: string[];
  vibe: string;
}

export interface LeadMatchDisplay {
  leadName: string;
  leadPhone: string;
  budgetMax: number;
  cityPreferred: string;
  specificNeeds: string;
  score: number;
  reasoning: string;
  whatsappHook: string;
}

export interface GeneratedAsset {
  renderedUrl: string;
  overlayApplied: boolean;
}

export interface CardPreview {
  headline: string;
  subline: string;
  accentColor: string;
  badgeText: string;
}

export interface VisualStylePreview {
  primaryColor: string;
  secondaryColor: string;
  headingFont: string;
  borderRadius: number;
}

export interface DashboardProperty {
  property: Property;
  address: string;
  city: string;
  shortHook: string;
  fullDescription: string;
  visionTags: string[];
  qualityScore: number | null;
  visualDna: VisualDna | null;
  reelScript: ReelScene[] | null;
  matches: LeadMatchDisplay[];
  imageUrls: string[];
  marketingStatus: MarketingStatus;
  generatedAssets: GeneratedAsset[] | null;
  cardPreview: CardPreview | null;
  visualStyle: VisualStylePreview | null;
}

// ============================================================
// Status config
// ============================================================

export const STATUS_CONFIG: Record<
  MarketingStatus,
  { label: string; dotColor: string; bgColor: string; textColor: string; pulse: boolean }
> = {
  ai_processing: {
    label: "AI Processing",
    dotColor: "bg-amber-400",
    bgColor: "bg-amber-50",
    textColor: "text-amber-700",
    pulse: true,
  },
  awaiting_graphics: {
    label: "Awaiting Graphics",
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    pulse: false,
  },
  in_review: {
    label: "In Review",
    dotColor: "bg-violet-500",
    bgColor: "bg-violet-50",
    textColor: "text-violet-700",
    pulse: false,
  },
  published: {
    label: "Published",
    dotColor: "bg-emerald-500",
    bgColor: "bg-emerald-50",
    textColor: "text-emerald-700",
    pulse: false,
  },
};

// ============================================================
// Mock data — real Israeli properties with full creative suite
// ============================================================

export const MOCK_DASHBOARD_PROPERTIES: DashboardProperty[] = [
  {
    property: {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      owner_phone: "052-4567890",
      price_asked: 3_200_000,
      status: "active",
      created_at: "2026-03-20T10:00:00.000Z",
      updated_at: "2026-03-20T10:00:00.000Z",
      organization_id: "00000000-0000-0000-0000-000000000001",
      created_by: null,
    } satisfies Property,
    address: "רחוב בורוכוב 23, שכונת המשתלה",
    city: "תל אביב",
    shortHook: "דירת גן בלב המשתלה — בית פרטי בתוך העיר",
    fullDescription:
      "דירת גן מרהיבה בלב שכונת המשתלה, אחת השכונות המבוקשות בתל אביב. 4 חדרים מרווחים עם גינה פרטית ירוקה של 80 מ״ר, חניה כפולה ומחסן בטאבו. המטבח עוצב עם משטחי קוורץ ואי מרכזי. מיקום פרימיום — 5 דקות הליכה מפארק הירקון. לרציניים בלבד.",
    visionTags: ["renovated kitchen", "private garden", "marble flooring", "spacious living room", "modern bathroom"],
    qualityScore: 8,
    visualDna: {
      style: "Modern Mediterranean",
      strengths: ["Natural light", "Indoor-outdoor flow", "Premium finishes"],
      vibe: "Family cozy",
    },
    reelScript: [
      {
        visual_cue: "Drone shot descending into the private garden through morning light. Slow reveal of the green space.",
        text_overlay: "הגינה הפרטית שתמיד חלמתם עליה",
        audio_vibe: "Warm Acoustic Guitar",
      },
      {
        visual_cue: "Steady dolly through the renovated kitchen — focus on quartz countertops, island, then pan to the open living room.",
        text_overlay: "מטבח שף • סלון ענק • 4 חדרים",
        audio_vibe: "Warm Acoustic Guitar",
      },
      {
        visual_cue: "Golden hour shot from the garden looking back at the house. Family silhouettes. Fade to Toro logo.",
        text_overlay: "הבית שלכם מחכה — דברו איתנו",
        audio_vibe: "Warm Acoustic Guitar — soft fade",
      },
    ],
    matches: [
      {
        leadName: "יוסי כהן",
        leadPhone: "052-8881234",
        budgetMax: 3_500_000,
        cityPreferred: "תל אביב",
        specificNeeds: "חייב מרפסת גדולה וחניה, מעדיף שכונה שקטה עם גינה לילדים",
        score: 92,
        reasoning: "Budget fits (₪3.5M), same city (תל אביב), garden apartment matches family needs perfectly",
        whatsappHook: "היי יוסי, מצאתי לך בטורו דירת גן מהממת בשכונת המשתלה עם גינה פרטית ענקית — בול מה שחיפשת לילדים! חניה כפולה ומחסן בטאבו. רוצה לשמוע עוד?",
      },
      {
        leadName: "דני גולדשטיין",
        leadPhone: "053-6662345",
        budgetMax: 5_000_000,
        cityPreferred: "תל אביב",
        specificNeeds: "דירת יוקרה מעוצבת, סגנון מודרני, קרוב לרוטשילד",
        score: 78,
        reasoning: "Budget fits, same city, modern style matches — but looking for Rothschild area, not Hamshtela",
        whatsappHook: "היי דני, יש לנו דירה מעוצבת ברמה גבוהה בשכונת המשתלה ת״א — סגנון מודרני בדיוק כמו שאתה אוהב. רוצה לראות?",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    generatedAssets: null,
    cardPreview: null,
    visualStyle: null,
  },
  {
    property: {
      id: "6ba7b810-9dad-41d4-80b5-e00d4aecf8a0",
      owner_phone: "054-9876543",
      price_asked: 8_500_000,
      status: "active",
      created_at: "2026-03-18T14:30:00.000Z",
      updated_at: "2026-03-19T09:00:00.000Z",
      organization_id: "00000000-0000-0000-0000-000000000001",
      created_by: null,
    } satisfies Property,
    address: "שדרות ניצה 45, מרכז העיר",
    city: "נתניה",
    shortHook: "פנטהאוז עם נוף לים — הבית שתמיד חלמתם עליו",
    fullDescription:
      "פנטהאוז יוקרתי על שדרות ניצה עם נוף פנורמי לים התיכון. 5 חדרים, מרפסת שמש של 60 מ\"ר, מעלית פרטית ישירות לדירה. גימור ברמה הגבוהה ביותר — רצפת אבן טבעית, חלונות מסך מרצפה עד תקרה, מטבח שף מאובזר. חניה כפולה בחניון תת-קרקעי.",
    visionTags: ["sea view", "rooftop terrace", "floor-to-ceiling windows", "chef kitchen", "private elevator", "master suite"],
    qualityScore: 9,
    visualDna: {
      style: "Contemporary Luxury",
      strengths: ["Panoramic sea view", "High ceilings", "Designer lighting"],
      vibe: "Executive suite",
    },
    reelScript: [
      {
        visual_cue: "Wide establishing shot from the rooftop terrace — Mediterranean sea fills the frame. Camera tilts down to reveal the penthouse.",
        text_overlay: "הנוף הזה? שלכם. כל יום.",
        audio_vibe: "Elegant Piano & Strings",
      },
      {
        visual_cue: "Gimbal walk-through: private elevator opens → floor-to-ceiling windows → pan across the chef kitchen → reveal the master suite.",
        text_overlay: "180 מ״ר • מעלית פרטית • מטבח שף",
        audio_vibe: "Elegant Piano & Strings — building",
      },
      {
        visual_cue: "Sunset timelapse from the 60sqm terrace. Wine glass in foreground, sea in background. Toro logo fade in.",
        text_overlay: "פנטהאוז שאי אפשר לסרב לו",
        audio_vibe: "Elegant Piano & Strings — crescendo",
      },
    ],
    matches: [
      {
        leadName: "מיכל לוי",
        leadPhone: "054-7773456",
        budgetMax: 9_000_000,
        cityPreferred: "נתניה",
        specificNeeds: "פנטהאוז עם נוף לים, רמת גימור גבוהה, מעלית פרטית",
        score: 97,
        reasoning: "Perfect match — penthouse with sea view, private elevator, high-end finishes, exact city, well within budget",
        whatsappHook: "היי מיכל, מצאתי לך בטורו את הפנטהאוז שחלמת עליו — נוף פנורמי לים בנתניה, מעלית פרטית, 180 מ״ר, גימור יוקרתי. זה בול מה שביקשת!",
      },
      {
        leadName: "דני גולדשטיין",
        leadPhone: "053-6662345",
        budgetMax: 5_000_000,
        cityPreferred: "תל אביב",
        specificNeeds: "דירת יוקרה מעוצבת, סגנון מודרני, קרוב לרוטשילד",
        score: 55,
        reasoning: "Luxury style matches but over budget (₪8.5M vs ₪5M max), different city",
        whatsappHook: "היי דני, יש פנטהאוז יוקרתי בנתניה עם נוף לים — אם פתוח למיקום חדש, שווה לך להציץ.",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    marketingStatus: "in_review",
    generatedAssets: [
      { renderedUrl: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80&overlay=toro", overlayApplied: true },
      { renderedUrl: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80&overlay=toro", overlayApplied: true },
      { renderedUrl: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80&overlay=toro", overlayApplied: true },
    ],
    cardPreview: {
      headline: "פנטהאוז עם נוף לים — הבית שתמיד חלמתם עליו",
      subline: "₪8,500,000",
      accentColor: "#c9a84c",
      badgeText: "Contemporary Luxury",
    },
    visualStyle: {
      primaryColor: "#1a1a2e",
      secondaryColor: "#c9a84c",
      headingFont: "Playfair Display",
      borderRadius: 4,
    },
  },
  {
    property: {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      owner_phone: "050-1112233",
      price_asked: 2_100_000,
      status: "active",
      created_at: "2026-03-22T08:15:00.000Z",
      updated_at: "2026-03-22T08:15:00.000Z",
      organization_id: "00000000-0000-0000-0000-000000000001",
      created_by: null,
    } satisfies Property,
    address: "רחוב שד״ל 15, הרצליה פיתוח",
    city: "הרצליה",
    shortHook: "דירת בוטיק מודרנית — עיצוב, ים, ותשואה",
    fullDescription:
      "דירת בוטיק מודרנית בהרצליה פיתוח. 3 חדרים, עיצוב אדריכלי ייחודי עם חומרים טבעיים. מרפסת שמש עם נוף חלקי לים, חניה מקורה ומחסן. 7 דקות הליכה מהחוף ומפארק הרצליה. מתאימה למשפחות צעירות ולמשקיעים — תשואה של 4.2% מיידית.",
    visionTags: ["modern design", "partial sea view", "sunlit balcony", "covered parking", "open plan kitchen"],
    qualityScore: 7,
    visualDna: {
      style: "Minimalist",
      strengths: ["Clean lines", "Natural materials", "Sunlit spaces"],
      vibe: "Young professional",
    },
    reelScript: [
      {
        visual_cue: "Fast tracking shot along the modern building facade. Sun flares between clean architectural lines.",
        text_overlay: "עיצוב שמדבר בשקט",
        audio_vibe: "Upbeat Tech House",
      },
      {
        visual_cue: "Interior: low-angle through the minimalist living space — natural materials, sunlit balcony pull-focus, open kitchen.",
        text_overlay: "בוטיק • 3 חד׳ • דקות מהים",
        audio_vibe: "Upbeat Tech House",
      },
      {
        visual_cue: "Beach sunset walk — cut to the balcony view. Phone notification animation: 'Your Toro match is ready'.",
        text_overlay: "ההשקעה החכמה הבאה שלכם",
        audio_vibe: "Upbeat Tech House — drop",
      },
    ],
    matches: [
      {
        leadName: "אורן ברק",
        leadPhone: "050-5554567",
        budgetMax: 2_500_000,
        cityPreferred: "הרצליה",
        specificNeeds: "דירה מודרנית להשקעה, קרובה לים, תשואה גבוהה",
        score: 95,
        reasoning: "Perfect investor match — modern boutique in Herzliya Pituach, near sea, within budget, 4.2% yield",
        whatsappHook: "היי אורן, מצאתי לך בטורו דירת בוטיק מודרנית בהרצליה פיתוח — 7 דק׳ מהים, תשואה 4.2%, בדיוק ההשקעה שחיפשת!",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
    ],
    marketingStatus: "published",
    generatedAssets: [
      { renderedUrl: "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80&overlay=toro", overlayApplied: true },
    ],
    cardPreview: {
      headline: "דירת בוטיק מודרנית — עיצוב, ים, ותשואה",
      subline: "₪2,100,000",
      accentColor: "#18181b",
      badgeText: "Minimalist",
    },
    visualStyle: {
      primaryColor: "#18181b",
      secondaryColor: "#71717a",
      headingFont: "DM Sans",
      borderRadius: 8,
    },
  },
  {
    property: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      owner_phone: "053-7778899",
      price_asked: 4_700_000,
      status: "draft",
      created_at: "2026-03-23T16:45:00.000Z",
      updated_at: "2026-03-23T16:45:00.000Z",
      organization_id: "00000000-0000-0000-0000-000000000001",
      created_by: null,
    } satisfies Property,
    address: "דרך העצמאות 88, הכרמל",
    city: "חיפה",
    shortHook: "",
    fullDescription: "",
    visionTags: [],
    qualityScore: null,
    visualDna: null,
    reelScript: null,
    matches: [
      {
        leadName: "נועה שמיר",
        leadPhone: "052-4441122",
        budgetMax: 4_800_000,
        cityPreferred: "חיפה",
        specificNeeds: "דירה עם נוף לים בכרמל, חניה, מרפסת, מתאים לזוג צעיר",
        score: 88,
        reasoning: "Same city (חיפה), Carmel location, within budget — pending AI analysis for full match",
        whatsappHook: "היי נועה, נכנסה עכשיו לטורו דירה חדשה בכרמל חיפה שנראית מתאימה מאוד — ברגע שנסיים את ניתוח ה-AI נעדכן אותך!",
      },
    ],
    imageUrls: [],
    marketingStatus: "ai_processing",
    generatedAssets: null,
    cardPreview: null,
    visualStyle: null,
  },
  {
    property: {
      id: "c56a4180-65aa-42ec-a945-5fd21dec0538",
      owner_phone: "058-3334455",
      price_asked: 1_950_000,
      status: "active",
      created_at: "2026-03-21T11:30:00.000Z",
      updated_at: "2026-03-21T11:30:00.000Z",
      organization_id: "00000000-0000-0000-0000-000000000001",
      created_by: null,
    } satisfies Property,
    address: "רחוב רוטשילד 12, מרכז העיר",
    city: "ראשון לציון",
    shortHook: "דירת 4 חדרים על רוטשילד — מיקום, מיקום, מיקום",
    fullDescription:
      "דירת 4 חדרים ברחוב רוטשילד בלב ראשון לציון. קומה 5 עם מעלית, מרפסת שמש גדולה, ממ\"ד מרווח ושני חדרי רחצה. שיפוץ מלא לפני 3 שנים. 2 דקות מהרכבת הקלה, קרוב לפארק ולמרכז המסחרי. הזדמנות מצוינת למשפחות.",
    visionTags: ["renovated bathroom", "open balcony", "bright rooms"],
    qualityScore: 7,
    visualDna: {
      style: "Classic Renovated",
      strengths: ["Open balcony", "Central location", "Bright interiors"],
      vibe: "Family starter",
    },
    reelScript: [
      {
        visual_cue: "Aerial shot of Rothschild Boulevard — camera descends to the building entrance. Door opens.",
        text_overlay: "רוטשילד. השם אומר הכל.",
        audio_vibe: "Lofi Beats",
      },
      {
        visual_cue: "Interior tour: bright living room with sun streaming in, renovated bathroom close-up, wide balcony shot.",
        text_overlay: "4 חדרים • מרפסת • שיפוץ מלא",
        audio_vibe: "Lofi Beats",
      },
      {
        visual_cue: "View from the balcony at sunset. Light rail passes below. Text card with contact info.",
        text_overlay: "ראשל״צ של היום — ות״א של מחר",
        audio_vibe: "Lofi Beats — fade out",
      },
    ],
    matches: [
      {
        leadName: "שירה אביטל",
        leadPhone: "058-9991234",
        budgetMax: 2_000_000,
        cityPreferred: "ראשון לציון",
        specificNeeds: "דירה משפחתית עם ממ״ד, קרובה לתחבורה ציבורית ולגנים",
        score: 91,
        reasoning: "Perfect family match — 4 rooms, Rishon center, near light rail, within budget, has mamad",
        whatsappHook: "היי שירה, מצאתי לך בטורו דירת 4 חדרים ברוטשילד ראשל״צ — ממ״ד מרווח, 2 דק׳ מהרכבת הקלה, בול מה שחיפשת למשפחה!",
      },
      {
        leadName: "יוסי כהן",
        leadPhone: "052-8881234",
        budgetMax: 3_500_000,
        cityPreferred: "תל אביב",
        specificNeeds: "חייב מרפסת גדולה וחניה, מעדיף שכונה שקטה עם גינה לילדים",
        score: 62,
        reasoning: "Has balcony and parking, within budget — but different city (ראשון לציון vs תל אביב)",
        whatsappHook: "היי יוסי, יש דירת 4 חדרים מרווחת בראשון לציון עם מרפסת גדולה — לא ת״א אבל מחיר ומיקום מעולים. מעניין?",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    generatedAssets: null,
    cardPreview: null,
    visualStyle: null,
  },
];
