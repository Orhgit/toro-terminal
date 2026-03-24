"use client";

import { useState, useRef } from "react";
import {
  Search,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Users,
  Sparkles,
  X,
  ExternalLink,
} from "lucide-react";
import type { DashboardProperty, LeadMatchDisplay } from "../data/mock";
import { MOCK_LEADS } from "../data/mock-leads";

// ============================================================
// Types
// ============================================================

type IngestPhase =
  | "idle"
  | "scouting"
  | "extracting"
  | "matching"
  | "done"
  | "error";

const PHASE_LABELS: Record<IngestPhase, string> = {
  idle: "",
  scouting: "Scouting URL...",
  extracting: "AI Swarm processing...",
  matching: "Matching leads...",
  done: "Property ingested!",
  error: "Scout failed",
};

// ============================================================
// Mock scout simulation
// ============================================================

function detectSource(url: string): string {
  if (url.includes("yad2")) return "yad2";
  if (url.includes("facebook") || url.includes("fb.com")) return "facebook";
  if (url.includes("madlan")) return "madlan";
  return "yad2";
}

const MOCK_SCOUT_RESULTS: Record<string, DashboardProperty> = {
  yad2: {
    property: {
      id: "scout-0000-0000-0000-000000000001",
      owner_phone: "052-8887766",
      price_asked: 2_750_000,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    address: "רחוב סוקולוב 42, מרכז העיר",
    city: "רמת גן",
    shortHook: "דירת 4 חדרים משופצת בלב רמת גן — צעד מהבורסה",
    fullDescription:
      "דירת 4 חדרים מרווחת ומוארת ברחוב סוקולוב, מרכז רמת גן. שיפוץ מלא, מטבח חדש, 2 חדרי רחצה, ממ״ד, מרפסת שמש גדולה. קרוב לבורסה ולרכבת.",
    visionTags: ["renovated kitchen", "bright rooms", "sun balcony", "mamad"],
    qualityScore: 7,
    visualDna: {
      style: "Modern Renovated",
      strengths: ["Full renovation", "Central location", "Natural light"],
      vibe: "Family urban",
    },
    reelScript: [
      {
        visual_cue: "Aerial shot of Ramat Gan skyline — zoom into Sokolov street. Building entrance reveal.",
        text_overlay: "רמת גן. בורסה. בית.",
        audio_vibe: "Upbeat Pop",
      },
      {
        visual_cue: "Gimbal walk: renovated kitchen → bright living room → sun-drenched balcony → mamad.",
        text_overlay: "4 חד׳ • שיפוץ מלא • מרפסת שמש",
        audio_vibe: "Upbeat Pop",
      },
      {
        visual_cue: "Family breakfast scene on the balcony. Kids playing. Train passing in the background.",
        text_overlay: "הבית הבא שלכם — דברו איתנו",
        audio_vibe: "Upbeat Pop — warm fade",
      },
    ],
    matches: [],
    imageUrls: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    generatedAssets: null,
    cardPreview: null,
    visualStyle: null,
  },
  facebook: {
    property: {
      id: "scout-0000-0000-0000-000000000002",
      owner_phone: "054-3211234",
      price_asked: 1_680_000,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    address: "רחוב הפלמ״ח 18",
    city: "כפר סבא",
    shortHook: "דירת בוטיק ירוקה בכפר סבא — מחיר שלא חוזר",
    fullDescription:
      "דירת 3 חדרים בכפר סבא הירוקה. קומה נמוכה, שקט, חניה, מחסן. 5 דק׳ הליכה מפארק העירוני. מושלמת לזוג צעיר או להשקעה.",
    visionTags: ["quiet street", "green surroundings", "covered parking"],
    qualityScore: 6,
    visualDna: {
      style: "Classic Israeli",
      strengths: ["Green neighborhood", "Low floor", "Investment value"],
      vibe: "Young couple starter",
    },
    reelScript: [
      {
        visual_cue: "Morning light through tree-lined street. Camera follows a jogger past the building.",
        text_overlay: "כפר סבא הירוקה מחכה לכם",
        audio_vibe: "Chill Acoustic",
      },
      {
        visual_cue: "Interior: clean 3-room apartment, natural light, simple but tasteful.",
        text_overlay: "3 חד׳ • חניה • מחסן • שקט",
        audio_vibe: "Chill Acoustic",
      },
      {
        visual_cue: "Park shot — families, dogs, sunset. Overlay with price tag and Toro logo.",
        text_overlay: "1.68M ₪ — ההזדמנות של השנה",
        audio_vibe: "Chill Acoustic — fade",
      },
    ],
    matches: [],
    imageUrls: [
      "https://images.unsplash.com/photo-1574362848149-11496d93a7c7?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    generatedAssets: null,
    cardPreview: null,
    visualStyle: null,
  },
  madlan: {
    property: {
      id: "scout-0000-0000-0000-000000000003",
      owner_phone: "050-9998877",
      price_asked: 4_200_000,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    address: "שדרות הנשיא 88, פרויקט חדש",
    city: "חולון",
    shortHook: "פנטהאוז בפרויקט חדש בחולון — מסירה מיידית",
    fullDescription:
      "פנטהאוז 5 חדרים בפרויקט חדש בחולון. מרפסת 30 מ״ר עם נוף פתוח, 3 חדרי רחצה, מטבח שף, חניה כפולה. מסירה מיידית.",
    visionTags: ["new building", "open view", "chef kitchen", "large terrace"],
    qualityScore: 8,
    visualDna: {
      style: "Contemporary New Build",
      strengths: ["Brand new", "Open view", "Large terrace"],
      vibe: "Growing family",
    },
    reelScript: [
      {
        visual_cue: "Drone ascending from street level along the new building facade. Terrace reveal at the top.",
        text_overlay: "חדש. גבוה. שלכם.",
        audio_vibe: "Epic Cinematic",
      },
      {
        visual_cue: "Walk-through: lobby → elevator → door opens to panoramic view → kitchen → master suite.",
        text_overlay: "5 חד׳ • מרפסת 30 מ״ר • מטבח שף",
        audio_vibe: "Epic Cinematic — building",
      },
      {
        visual_cue: "Family on the terrace, city lights below. Toro logo animation.",
        text_overlay: "מפתח ביד — מחר אתם כאן",
        audio_vibe: "Epic Cinematic — peak",
      },
    ],
    matches: [],
    imageUrls: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      "https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80",
    ],
    marketingStatus: "awaiting_graphics",
    generatedAssets: null,
    cardPreview: null,
    visualStyle: null,
  },
};

// Simple mock matching
function mockMatch(property: DashboardProperty): LeadMatchDisplay[] {
  return MOCK_LEADS.filter(
    (l) => property.property.price_asked <= l.budget_max * 1.15
  )
    .slice(0, 3)
    .map((lead) => ({
      leadName: lead.name,
      leadPhone: lead.phone,
      budgetMax: lead.budget_max,
      cityPreferred: lead.city_preferred,
      specificNeeds: lead.specific_needs ?? "",
      score: Math.floor(65 + Math.random() * 30),
      reasoning: `Budget compatible, ${lead.city_preferred === property.city ? "same city" : "open to area"}`,
      whatsappHook: `היי ${lead.name}, טורו מצאה נכס חדש ב${property.city} שיכול להתאים לך — ${property.shortHook}`,
    }))
    .sort((a, b) => b.score - a.score);
}

// ============================================================
// Component
// ============================================================

export function QuickIngest({
  onPropertyScouted,
}: {
  onPropertyScouted: (property: DashboardProperty) => void;
}) {
  const [url, setUrl] = useState("");
  const [phase, setPhase] = useState<IngestPhase>("idle");
  const [result, setResult] = useState<DashboardProperty | null>(null);
  const [matchCount, setMatchCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleIngest() {
    if (!url.trim()) return;

    setPhase("scouting");
    setResult(null);

    // Phase 1: Scout
    await new Promise((r) => setTimeout(r, 1200));
    setPhase("extracting");

    // Phase 2: AI Swarm
    await new Promise((r) => setTimeout(r, 1800));
    const source = detectSource(url);
    const scouted = MOCK_SCOUT_RESULTS[source] ?? MOCK_SCOUT_RESULTS.yad2!;

    setPhase("matching");

    // Phase 3: Matchmaker
    await new Promise((r) => setTimeout(r, 800));
    const matches = mockMatch(scouted);
    const enriched: DashboardProperty = { ...scouted, matches };

    setMatchCount(matches.length);
    setResult(enriched);
    setPhase("done");

    onPropertyScouted(enriched);
  }

  function handleDismiss() {
    setPhase("idle");
    setUrl("");
    setResult(null);
  }

  const isProcessing = phase === "scouting" || phase === "extracting" || phase === "matching";

  return (
    <div className="mb-6">
      {/* Input Bar */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            ref={inputRef}
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleIngest()}
            placeholder="Paste a Yad2, Facebook, or Madlan URL to scout..."
            disabled={isProcessing}
            className="w-full rounded-xl border border-(--color-border) bg-(--color-surface) py-3 pr-10 pl-4 text-sm text-slate-700 placeholder:text-slate-400 shadow-sm focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
            dir="ltr"
          />
        </div>
        <button
          onClick={handleIngest}
          disabled={!url.trim() || isProcessing}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isProcessing ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Scouting...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Scout Property
            </>
          )}
        </button>
      </div>

      {/* Progress / Result Banner */}
      {phase !== "idle" && (
        <div
          className={`mt-3 flex items-center justify-between rounded-xl border px-5 py-3 transition-all ${
            phase === "done"
              ? "border-emerald-200 bg-emerald-50"
              : phase === "error"
                ? "border-red-200 bg-red-50"
                : "border-indigo-200 bg-indigo-50"
          }`}
        >
          <div className="flex items-center gap-3">
            {isProcessing && (
              <div className="flex items-center gap-2">
                {/* Bull animation — three dots with stagger */}
                <div className="flex gap-0.5">
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="h-2 w-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm font-medium text-indigo-700">
                  {PHASE_LABELS[phase]}
                </span>
              </div>
            )}
            {phase === "done" && result && (
              <div className="flex items-center gap-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800">
                    {result.address}, {result.city}
                  </p>
                  <p className="text-xs text-emerald-600">
                    ₪{result.property.price_asked.toLocaleString("he-IL")}
                    {matchCount > 0 && (
                      <span className="mr-2 inline-flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {matchCount} leads matched
                      </span>
                    )}
                  </p>
                </div>
              </div>
            )}
            {phase === "error" && (
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-500" />
                <span className="text-sm text-red-700">Failed to scout URL</span>
              </div>
            )}
          </div>
          {(phase === "done" || phase === "error") && (
            <button
              onClick={handleDismiss}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
