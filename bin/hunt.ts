import "dotenv/config";

const url = process.argv[2];
if (!url) {
  console.error("No URL provided");
  process.exit(1);
}

// ── Colors ────────────────────────────────────────────────
const G = "\x1b[32m";
const C = "\x1b[36m";
const Y = "\x1b[33m";
const M = "\x1b[35m";
const D = "\x1b[2m";
const B = "\x1b[1m";
const R = "\x1b[0m";

function log(agent: string, msg: string) {
  const ts = new Date().toLocaleTimeString("en-IL", { hour12: false });
  console.log(`  ${D}${ts}${R}  ${C}[${agent}]${R}  ${msg}`);
}

// ── Detect source ─────────────────────────────────────────
function detectSource(u: string): string {
  if (u.includes("yad2")) return "yad2";
  if (u.includes("facebook") || u.includes("fb.com")) return "facebook";
  if (u.includes("madlan")) return "madlan";
  return "yad2";
}

// ── Mock pipeline ─────────────────────────────────────────
const MOCK_DATA: Record<string, { city: string; address: string; price: number; hook: string; rooms: number; sqm: number }> = {
  yad2: { city: "רמת גן", address: "רחוב סוקולוב 42", price: 2_750_000, hook: "דירת 4 חדרים משופצת בלב רמת גן — צעד מהבורסה", rooms: 4, sqm: 95 },
  facebook: { city: "כפר סבא", address: "רחוב הפלמ״ח 18", price: 1_680_000, hook: "דירת בוטיק ירוקה בכפר סבא — מחיר שלא חוזר", rooms: 3, sqm: 75 },
  madlan: { city: "חולון", address: "שדרות הנשיא 88", price: 4_200_000, hook: "פנטהאוז בפרויקט חדש בחולון — מסירה מיידית", rooms: 5, sqm: 130 },
};

async function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

async function main() {
  const source = detectSource(url);
  const data = MOCK_DATA[source] ?? MOCK_DATA.yad2!;

  // Phase 1: Scout
  log("Scout", `Scraping ${source} listing...`);
  await sleep(800);
  log("Scout", `${G}✓${R} Page scraped — ${data.address}, ${data.city}`);
  await sleep(300);

  // Phase 2: Extractor
  log("Extractor", "Parsing property data from raw text...");
  await sleep(600);
  log("Extractor", `${G}✓${R} Extracted: ${data.rooms} rooms, ${data.sqm}m², ₪${data.price.toLocaleString("he-IL")}`);
  await sleep(200);

  // Phase 3: DataArchitect
  log("DataArchitect", "Validating extraction...");
  await sleep(400);
  log("DataArchitect", `${G}✓${R} Approved — data is clean`);
  await sleep(200);

  // Phase 4: Vision
  log("Vision", "Analyzing property images...");
  await sleep(700);
  log("Vision", `${G}✓${R} Visual DNA: Modern Renovated, Quality 7/10`);
  await sleep(200);

  // Phase 5: Copywriter
  log("Copywriter", "Generating Hebrew marketing copy...");
  await sleep(600);
  log("CreativeEditor", `${Y}↻${R} Hook too generic — requesting revision`);
  await sleep(500);
  log("Copywriter", "Revising with editor feedback...");
  await sleep(400);
  log("CreativeEditor", `${G}✓${R} Approved — "${data.hook}"`);
  await sleep(200);

  // Phase 6: Director
  log("Director", "Generating 15s Reel script (3 scenes)...");
  await sleep(500);
  log("Director", `${G}✓${R} Script ready: Hook → Showcase → CTA`);
  await sleep(200);

  // Phase 7: Matchmaker
  log("Matchmaker", "Scanning leads database...");
  await sleep(600);
  log("Matchmaker", `${G}✓${R} 3 matches found (92, 78, 65)`);
  await sleep(200);

  // Phase 8: Dispatcher
  log("Dispatcher", "Evaluating quality report... score: 95/100");
  await sleep(400);
  log("Dispatcher", `${G}✓${R} AUTO_PUBLISH — briefings generated`);
  await sleep(200);

  // Phase 9: Linear
  if (process.env.LINEAR_API_KEY) {
    log("Linear", "Creating marketing task in Linear...");
    try {
      // Dynamic import to avoid crash when LINEAR_API_KEY is missing
      const { createSyncIssue } = await import("../apps/webhook-gateway/src/services/linear.js");
      const hash = "mock-hunt-" + Date.now().toString(36);
      const result = await createSyncIssue(hash);
      log("Linear", `${G}✓${R} Issue created: ${result.identifier} — ${result.url}`);
    } catch (err) {
      log("Linear", `${Y}⚠${R} Linear sync skipped: ${err instanceof Error ? err.message : String(err)}`);
    }
  } else {
    log("Linear", `${D}Skipped — LINEAR_API_KEY not set${R}`);
  }

  // Summary
  console.log("");
  console.log(`  ${B}${M}━━━ Hunt Complete ━━━${R}`);
  console.log(`  ${B}Property:${R}  ${data.address}, ${data.city}`);
  console.log(`  ${B}Price:${R}     ₪${data.price.toLocaleString("he-IL")}`);
  console.log(`  ${B}Hook:${R}      ${data.hook}`);
  console.log(`  ${B}Matches:${R}   3 leads identified`);
  console.log(`  ${B}Status:${R}    ${G}Published to Social Queue${R}`);
  console.log("");
}

main().catch((err) => {
  console.error("Hunt failed:", err);
  process.exit(1);
});
