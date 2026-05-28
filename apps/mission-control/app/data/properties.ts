import type { Property } from "@repo/database/schema";

// ============================================================
// Dashboard-specific types
// ============================================================

export type MarketingStatus =
  | "ai_processing"
  | "awaiting_graphics"
  | "in_review"
  | "published";

export type ComplianceVerdict = "safe" | "needs_revision" | "blocked";

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

export interface GuardianResult {
  score: number;
  verdict: ComplianceVerdict;
  checks: { name: string; passed: boolean; detail: string }[];
}

export type QaVerdict = "pass" | "warn" | "fail";

export interface VisualQaResult {
  verdict: QaVerdict;
  contrastOk: boolean;
  fontSizeOk: boolean;
  textCoveragePercent: number;
  scrimApplied: boolean;
}

export interface PointOfInterest {
  name: string;
  type: "school" | "park" | "shopping" | "transit" | "restaurant" | "gym" | "medical";
  distance: string;
  walkMinutes: number;
}

export interface NeighborhoodData {
  vibe: string;
  walkScore: number;
  avgPricePerSqm: number;
  pois: PointOfInterest[];
  lat: number;
  lng: number;
}

export interface PropertySpecs {
  bedrooms: number;
  bathrooms: number;
  floor: string;
  parking: string | null;
  elevator: boolean;
  balconySqm: number | null;
  storage: boolean;
  renovation: string | null;
  yearBuilt: number | null;
}

export interface SmartInsight {
  icon: "sparkle" | "trending" | "ruler" | "sun" | "shield";
  text: string;
}

export interface DashboardProperty {
  property: Property;
  address: string;
  city: string;
  rooms: number;
  sqm: number;
  floor: string;
  shortHook: string;
  fullDescription: string;
  visionTags: string[];
  qualityScore: number | null;
  visualDna: VisualDna | null;
  reelScript: ReelScene[] | null;
  matches: LeadMatchDisplay[];
  imageUrls: string[];
  marketingStatus: MarketingStatus;
  guardian: GuardianResult | null;
  visualQa: VisualQaResult | null;
  huntSource: string | null;
  huntedAt: string | null;
  linearIssueId: string | null;
  linearIssueUrl: string | null;
  specs: PropertySpecs;
  neighborhood: NeighborhoodData | null;
  smartInsights: SmartInsight[];
}

// ============================================================
// Status config
// ============================================================

export const STATUS_CONFIG: Record<
  MarketingStatus,
  { label: string; color: string; bg: string; pulse: boolean }
> = {
  ai_processing: {
    label: "AI Processing",
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    pulse: true,
  },
  awaiting_graphics: {
    label: "Awaiting Graphics",
    color: "text-sky-400",
    bg: "bg-sky-400/10",
    pulse: false,
  },
  in_review: {
    label: "In Review",
    color: "text-violet-400",
    bg: "bg-violet-400/10",
    pulse: false,
  },
  published: {
    label: "Published",
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    pulse: false,
  },
};

// ============================================================
// Mock data — production-quality Israeli properties
// ============================================================

export const PROPERTIES: DashboardProperty[] = [
  {
    property: {
      id: "f47ac10b-58cc-4372-a567-0e02b2c3d479",
      owner_phone: "052-4567890",
      price_asked: 3_200_000,
      status: "active",
      created_at: "2026-03-20T10:00:00.000Z",
      updated_at: "2026-03-20T10:00:00.000Z",
    } satisfies Property,
    address: "רחוב בורוכוב 23, שכונת המשתלה",
    city: "תל אביב",
    rooms: 4,
    sqm: 110,
    floor: "קרקע",
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
        reasoning: "Budget fits (3.5M), same city (תל אביב), garden apartment matches family needs perfectly",
        whatsappHook: "היי יוסי, מצאתי לך דירת גן מהממת בשכונת המשתלה עם גינה פרטית ענקית — בול מה שחיפשת לילדים! חניה כפולה ומחסן בטאבו. רוצה לשמוע עוד?",
      },
      {
        leadName: "דני גולדשטיין",
        leadPhone: "053-6662345",
        budgetMax: 5_000_000,
        cityPreferred: "תל אביב",
        specificNeeds: "דירת יוקרה מעוצבת, סגנון מודרני, קרוב לרוטשילד",
        score: 78,
        reasoning: "Budget fits, same city, modern style matches — but looking for Rothschild area, not Hamshtela",
        whatsappHook: "היי דני, יש דירה מעוצבת ברמה גבוהה בשכונת המשתלה ת״א — סגנון מודרני בדיוק כמו שאתה אוהב. רוצה לראות?",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    guardian: {
      score: 94,
      verdict: "safe",
      checks: [
        { name: "Aggressive Sales Language", passed: true, detail: "No aggressive terms detected" },
        { name: "Housing Discrimination", passed: true, detail: "No discriminatory language" },
        { name: "Misleading Claims", passed: true, detail: "No misleading financial claims" },
        { name: "WhatsApp Message Length", passed: true, detail: "Within 1024 char limit" },
        { name: "Text-to-Image Ratio", passed: false, detail: "Overlay text at 22% — slightly over Meta 20% limit" },
      ],
    },
    visualQa: {
      verdict: "warn",
      contrastOk: true,
      fontSizeOk: true,
      textCoveragePercent: 22,
      scrimApplied: true,
    },
    huntSource: "yad2",
    huntedAt: "2026-03-20T09:42:00.000Z",
    linearIssueId: "TORO-42",
    linearIssueUrl: "https://linear.app/toro/issue/TORO-42",
    specs: {
      bedrooms: 4,
      bathrooms: 2,
      floor: "קרקע",
      parking: "חניה כפולה",
      elevator: false,
      balconySqm: null,
      storage: true,
      renovation: "שיפוץ מלא 2024",
      yearBuilt: 1998,
    },
    neighborhood: {
      vibe: "שכונת המשתלה היא אחת הפנינים של צפון תל אביב — רחובות שקטים עם עצי פיקוס ותיקים, קרבה מושלמת לפארק הירקון, ואווירה משפחתית-בוהמיינית ייחודית. בתי קפה בוטיק, גני ילדים מצוינים, ותחושה של קהילה שלא מוצאים בשכונות חדשות.",
      walkScore: 92,
      avgPricePerSqm: 32_000,
      pois: [
        { name: "בית ספר ויצמן", type: "school", distance: "350m", walkMinutes: 4 },
        { name: "פארק הירקון", type: "park", distance: "500m", walkMinutes: 6 },
        { name: "רמת אביב מול", type: "shopping", distance: "1.2km", walkMinutes: 15 },
        { name: 'תחנת רכבת ת"א אוניברסיטה', type: "transit", distance: "800m", walkMinutes: 10 },
        { name: "מכבי שירותי בריאות", type: "medical", distance: "400m", walkMinutes: 5 },
      ],
      lat: 32.1007,
      lng: 34.7896,
    },
    smartInsights: [
      { icon: "ruler", text: "גינה פרטית של 80 מ״ר — גדולה ב-60% מהממוצע באזור" },
      { icon: "trending", text: "מחירי שכונת המשתלה עלו ב-12% ב-12 החודשים האחרונים" },
      { icon: "sun", text: "כיוון דרום-מערב — שמש אחר הצהריים לתוך הגינה" },
    ],
  },
  {
    property: {
      id: "6ba7b810-9dad-41d4-80b5-e00d4aecf8a0",
      owner_phone: "054-9876543",
      price_asked: 8_500_000,
      status: "active",
      created_at: "2026-03-18T14:30:00.000Z",
      updated_at: "2026-03-19T09:00:00.000Z",
    } satisfies Property,
    address: "שדרות ניצה 45, מרכז העיר",
    city: "נתניה",
    rooms: 5,
    sqm: 180,
    floor: "16/18",
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
        whatsappHook: "היי מיכל, מצאתי לך את הפנטהאוז שחלמת עליו — נוף פנורמי לים בנתניה, מעלית פרטית, 180 מ״ר, גימור יוקרתי. זה בול מה שביקשת!",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80",
    ],
    marketingStatus: "in_review",
    guardian: {
      score: 100,
      verdict: "safe",
      checks: [
        { name: "Aggressive Sales Language", passed: true, detail: "No aggressive terms detected" },
        { name: "Housing Discrimination", passed: true, detail: "No discriminatory language" },
        { name: "Misleading Claims", passed: true, detail: "No misleading financial claims" },
        { name: "WhatsApp Message Length", passed: true, detail: "Within 1024 char limit" },
        { name: "Text-to-Image Ratio", passed: true, detail: "Overlay text at 15% — within limit" },
      ],
    },
    visualQa: {
      verdict: "pass",
      contrastOk: true,
      fontSizeOk: true,
      textCoveragePercent: 15,
      scrimApplied: false,
    },
    huntSource: "madlan",
    huntedAt: "2026-03-18T13:15:00.000Z",
    linearIssueId: "TORO-38",
    linearIssueUrl: "https://linear.app/toro/issue/TORO-38",
    specs: {
      bedrooms: 5,
      bathrooms: 3,
      floor: "16/18",
      parking: "חניה כפולה תת-קרקעית",
      elevator: true,
      balconySqm: 60,
      storage: true,
      renovation: "חדש מקבלן",
      yearBuilt: 2025,
    },
    neighborhood: {
      vibe: "שדרות ניצה הן הכתובת היוקרתית של נתניה — טיילת ים שמשופצת, מגדלי יוקרה חדשים, ומסעדות שף. האווירה היא של ריביירה ישראלית — רגוע אבל מלוטש. קו חוף מהיפים בארץ, קרבה לכבישי הגישה למרכז, ומחירים שעדיין נמוכים מתל אביב ב-35%.",
      walkScore: 78,
      avgPricePerSqm: 42_000,
      pois: [
        { name: "בית ספר ליאו בק", type: "school", distance: "600m", walkMinutes: 8 },
        { name: "טיילת ניצה", type: "park", distance: "100m", walkMinutes: 2 },
        { name: "פולג מרכז מסחרי", type: "shopping", distance: "2.5km", walkMinutes: 8 },
        { name: "תחנת רכבת נתניה", type: "transit", distance: "3km", walkMinutes: 10 },
        { name: "מסעדת הלנה", type: "restaurant", distance: "200m", walkMinutes: 3 },
      ],
      lat: 32.3215,
      lng: 34.8512,
    },
    smartInsights: [
      { icon: "sparkle", text: "מעלית פרטית ישירות לדירה — פרימיום נדיר בנתניה" },
      { icon: "ruler", text: "מרפסת 60 מ״ר — כמעט כמו דירה נוספת" },
      { icon: "trending", text: "שדרות ניצה: עליית מחירים של 18% ב-2025" },
    ],
  },
  {
    property: {
      id: "7c9e6679-7425-40de-944b-e07fc1f90ae7",
      owner_phone: "050-1112233",
      price_asked: 2_100_000,
      status: "active",
      created_at: "2026-03-22T08:15:00.000Z",
      updated_at: "2026-03-22T08:15:00.000Z",
    } satisfies Property,
    address: "רחוב שד״ל 15, הרצליה פיתוח",
    city: "הרצליה",
    rooms: 3,
    sqm: 85,
    floor: "3/7",
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
        whatsappHook: "היי אורן, מצאתי לך דירת בוטיק מודרנית בהרצליה פיתוח — 7 דק׳ מהים, תשואה 4.2%, בדיוק ההשקעה שחיפשת!",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
    ],
    marketingStatus: "published",
    guardian: {
      score: 98,
      verdict: "safe",
      checks: [
        { name: "Aggressive Sales Language", passed: true, detail: "No aggressive terms" },
        { name: "Housing Discrimination", passed: true, detail: "Clean" },
        { name: "Misleading Claims", passed: true, detail: "Yield claim backed by data" },
        { name: "WhatsApp Message Length", passed: true, detail: "Within limit" },
        { name: "Text-to-Image Ratio", passed: true, detail: "Within limit" },
      ],
    },
    visualQa: {
      verdict: "pass",
      contrastOk: true,
      fontSizeOk: true,
      textCoveragePercent: 12,
      scrimApplied: false,
    },
    huntSource: "facebook",
    huntedAt: "2026-03-22T07:30:00.000Z",
    linearIssueId: "TORO-45",
    linearIssueUrl: "https://linear.app/toro/issue/TORO-45",
    specs: {
      bedrooms: 3,
      bathrooms: 1,
      floor: "3/7",
      parking: "חניה מקורה",
      elevator: true,
      balconySqm: 12,
      storage: true,
      renovation: "עיצוב אדריכלי 2023",
      yearBuilt: 2019,
    },
    neighborhood: {
      vibe: "הרצליה פיתוח היא המרכז העסקי-טכנולוגי של ישראל — חברות הייטק, שגרירויות, והחוף הכי יפה של השרון. אווירה קוסמופוליטית עם מסעדות מעולות, פארק הרצליה הענק, וגישה ישירה לכביש 2 ול-RTL. דירה כאן היא גם בית וגם השקעה.",
      walkScore: 71,
      avgPricePerSqm: 28_000,
      pois: [
        { name: "אריאנה בית ספר בינלאומי", type: "school", distance: "700m", walkMinutes: 9 },
        { name: "חוף אכדיה", type: "park", distance: "550m", walkMinutes: 7 },
        { name: "ארנה מול הרצליה", type: "shopping", distance: "1.5km", walkMinutes: 18 },
        { name: "הולמס פלייס הרצליה", type: "gym", distance: "400m", walkMinutes: 5 },
        { name: 'ביה"ח הרצליה מדיקל סנטר', type: "medical", distance: "1km", walkMinutes: 12 },
      ],
      lat: 32.1624,
      lng: 34.7975,
    },
    smartInsights: [
      { icon: "trending", text: "תשואה 4.2% — גבוהה ב-40% מהממוצע בהרצליה פיתוח" },
      { icon: "sun", text: "נוף חלקי לים מהמרפסת — קומה מוצלחת לזה" },
      { icon: "shield", text: "בניין חדש (2019) — ללא הפתעות תחזוקה" },
    ],
  },
  {
    property: {
      id: "550e8400-e29b-41d4-a716-446655440000",
      owner_phone: "053-7778899",
      price_asked: 4_700_000,
      status: "draft",
      created_at: "2026-03-23T16:45:00.000Z",
      updated_at: "2026-03-23T16:45:00.000Z",
    } satisfies Property,
    address: "דרך העצמאות 88, הכרמל",
    city: "חיפה",
    rooms: 4,
    sqm: 120,
    floor: "9/12",
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
        whatsappHook: "היי נועה, נכנסה עכשיו דירה חדשה בכרמל חיפה שנראית מתאימה מאוד — ברגע שנסיים את ניתוח ה-AI נעדכן אותך!",
      },
    ],
    imageUrls: [],
    marketingStatus: "ai_processing",
    guardian: null,
    visualQa: null,
    huntSource: "yad2",
    huntedAt: "2026-03-23T16:30:00.000Z",
    linearIssueId: null,
    linearIssueUrl: null,
    specs: {
      bedrooms: 4,
      bathrooms: 2,
      floor: "9/12",
      parking: "חניה אחת",
      elevator: true,
      balconySqm: 14,
      storage: false,
      renovation: null,
      yearBuilt: null,
    },
    neighborhood: null,
    smartInsights: [],
  },
  {
    property: {
      id: "c56a4180-65aa-42ec-a945-5fd21dec0538",
      owner_phone: "058-3334455",
      price_asked: 1_950_000,
      status: "active",
      created_at: "2026-03-21T11:30:00.000Z",
      updated_at: "2026-03-21T11:30:00.000Z",
    } satisfies Property,
    address: "רחוב רוטשילד 12, מרכז העיר",
    city: "ראשון לציון",
    rooms: 4,
    sqm: 98,
    floor: "5/9",
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
        whatsappHook: "היי שירה, מצאתי לך דירת 4 חדרים ברוטשילד ראשל״צ — ממ״ד מרווח, 2 דק׳ מהרכבת הקלה, בול מה שחיפשת למשפחה!",
      },
      {
        leadName: "יוסי כהן",
        leadPhone: "052-8881234",
        budgetMax: 3_500_000,
        cityPreferred: "תל אביב",
        specificNeeds: "חייב מרפסת גדולה וחניה, מעדיף שכונה שקטה עם גינה לילדים",
        score: 62,
        reasoning: "Has balcony and parking, within budget — but different city",
        whatsappHook: "היי יוסי, יש דירת 4 חדרים מרווחת בראשון לציון עם מרפסת גדולה — לא ת״א אבל מחיר ומיקום מעולים. מעניין?",
      },
    ],
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    guardian: {
      score: 82,
      verdict: "needs_revision",
      checks: [
        { name: "Aggressive Sales Language", passed: false, detail: "'הזדמנות מצוינת' flagged as soft FOMO — suggest neutral alternative" },
        { name: "Housing Discrimination", passed: true, detail: "No discriminatory language" },
        { name: "Misleading Claims", passed: true, detail: "No misleading claims" },
        { name: "WhatsApp Message Length", passed: true, detail: "Within 1024 char limit" },
        { name: "Text-to-Image Ratio", passed: true, detail: "Within 20% limit" },
      ],
    },
    visualQa: {
      verdict: "pass",
      contrastOk: true,
      fontSizeOk: true,
      textCoveragePercent: 18,
      scrimApplied: true,
    },
    huntSource: "yad2",
    huntedAt: "2026-03-21T11:00:00.000Z",
    linearIssueId: "TORO-41",
    linearIssueUrl: "https://linear.app/toro/issue/TORO-41",
    specs: {
      bedrooms: 4,
      bathrooms: 2,
      floor: "5/9",
      parking: "חניה בחניון",
      elevator: true,
      balconySqm: 14,
      storage: true,
      renovation: "שיפוץ מלא 2023",
      yearBuilt: 2005,
    },
    neighborhood: {
      vibe: "רחוב רוטשילד בראשון לציון הוא ציר מרכזי שחווה התחדשות — מרכז העיר החדש עם הרכבת הקלה, מתחמי בילוי, ותוכניות פינוי-בינוי. אווירה אורבנית צעירה עם גישה מצוינת לתחבורה ציבורית. שכונה שמשתנה מהר — מה שעולה פה היום שווה יותר מחר.",
      walkScore: 88,
      avgPricePerSqm: 22_000,
      pois: [
        { name: "בית ספר אהוד מנור", type: "school", distance: "300m", walkMinutes: 4 },
        { name: "פארק ראשון לציון", type: "park", distance: "700m", walkMinutes: 9 },
        { name: "רוטשילד סנטר", type: "shopping", distance: "200m", walkMinutes: 3 },
        { name: "תחנת רכבת קלה רוטשילד", type: "transit", distance: "150m", walkMinutes: 2 },
        { name: "סופר-פארם", type: "medical", distance: "100m", walkMinutes: 1 },
      ],
      lat: 31.9641,
      lng: 34.8013,
    },
    smartInsights: [
      { icon: "trending", text: "מחיר למ״ר נמוך ב-15% מהממוצע ברוטשילד — הזדמנות תמחור" },
      { icon: "shield", text: "ממ״ד מרווח — דרישה חובה שמעלה את הערך" },
      { icon: "sparkle", text: "2 דקות מהרכבת הקלה — גורם מכפיל ערך בעתיד" },
    ],
  },
];
