import type { MarketingCopy } from "../packages/ai-core/src/copywriter.js";
import type { ImageLayout } from "../packages/ai-core/src/studio/layout.js";
import { runGuardianReview } from "../packages/ai-core/src/swarm/guardian.js";
import { computeLayout } from "../packages/ai-core/src/studio/layout.js";
import { detectBrand } from "../packages/ai-core/src/studio/brand-guard.js";

// Colors
const R = "\x1b[0m";
const B = "\x1b[1m";
const D = "\x1b[2m";
const RED = "\x1b[31m";
const G = "\x1b[32m";
const Y = "\x1b[33m";
const C = "\x1b[36m";
const M = "\x1b[35m";

function divider(title: string) {
  console.log(`\n${D}${"─".repeat(60)}${R}`);
  console.log(`${B}${M}  ${title}${R}`);
  console.log(`${D}${"─".repeat(60)}${R}\n`);
}

// ============================================================
// Test cases — progressively aggressive
// ============================================================

interface TestCase {
  name: string;
  copy: MarketingCopy;
  withLayout: boolean;
}

const TEST_CASES: TestCase[] = [
  {
    name: "EXTREME — Guaranteed profit + discrimination",
    copy: {
      shortHook: "GUARANTEED PROFIT! הזדמנות אחרונה! רק היום! מהרו לפני שנגמר!",
      fullDescription:
        "דירה מטורפת במבצע חיסול! תשואה מובטחת של 15%! ליהודים בלבד, ללא ערבים. עלייה בטוחה במחיר, ללא סיכון. רק לזוגות צעירים בלי ילדים. חינם — מתנה! FOMO! Act now or lose forever!",
    },
    withLayout: false,
  },
  {
    name: "MODERATE — Aggressive but no discrimination",
    copy: {
      shortHook: "הזדמנות אחרונה! דירה מדהימה במחיר בזול!",
      fullDescription:
        "מהרו! דירת 4 חדרים במרכז תל אביב. מבצע חיסול — מחיר שלא חוזר! השקעה ללא סיכון עם תשואה מובטחת. limited time only!",
    },
    withLayout: false,
  },
  {
    name: "CLEAN — Professional Israeli RE copy",
    copy: {
      shortHook: "תארו לעצמכם גינה פרטית בלב תל אביב — זה אמיתי",
      fullDescription:
        "דירת גן מרהיבה בשכונת המשתלה, 4 חדרים מרווחים עם גינה פרטית ירוקה. המטבח עוצב עם משטחי קוורץ ואי מרכזי. חניה כפולה ומחסן בטאבו. מיקום פרימיום — 5 דקות הליכה מפארק הירקון.",
    },
    withLayout: true,
  },
];

// ============================================================
// Run audit
// ============================================================

async function main() {
  console.log(`\n${B}${M}  ⚡ TORO GUARDIAN AUDIT${R}`);
  console.log(`${D}  Deep compliance scan — Meta Housing Policy + WhatsApp Business${R}`);

  for (const testCase of TEST_CASES) {
    divider(`TEST: ${testCase.name}`);

    // Show BEFORE
    console.log(`  ${B}${RED}BEFORE (Raw Input):${R}`);
    console.log(`  ${B}Hook:${R} ${testCase.copy.shortHook}`);
    console.log(`  ${B}Desc:${R} ${testCase.copy.fullDescription.slice(0, 120)}...`);

    // Compute layout if needed
    let layout: ImageLayout | null = null;
    if (testCase.withLayout) {
      const brand = detectBrand("toro");
      layout = computeLayout(1080, 1080, brand, {
        price: "₪3,200,000",
        hookText: testCase.copy.shortHook,
        phone: "052-4567890",
      });
    }

    // Run Guardian
    const report = await runGuardianReview(testCase.copy, layout);

    // Show checks
    console.log(`\n  ${B}${C}GUARDIAN CHECKS:${R}`);
    for (const check of report.checks) {
      const icon = check.passed ? `${G}✓${R}` : check.severity === "critical" ? `${RED}✗${R}` : `${Y}⚠${R}`;
      const severity = check.severity === "critical" ? `${RED}${B}CRITICAL${R}` : check.severity === "warning" ? `${Y}WARNING${R}` : `${D}info${R}`;

      console.log(`  ${icon} [${severity}] ${check.category}`);
      console.log(`    ${D}${check.detail}${R}`);
      if (check.fix) {
        console.log(`    ${Y}Fix: ${check.fix}${R}`);
      }
    }

    // Show AFTER (if revision exists)
    if (report.revisedCopy) {
      console.log(`\n  ${B}${G}AFTER (Guardian Revised):${R}`);
      console.log(`  ${B}Hook:${R} ${report.revisedCopy.shortHook}`);
      console.log(`  ${B}Desc:${R} ${report.revisedCopy.fullDescription.slice(0, 120)}...`);
    }

    // Score
    const scoreColor = report.score >= 100 ? G : report.score >= 70 ? Y : RED;
    const verdictIcon = report.verdict === "safe" ? `${G}SAFE${R}` : report.verdict === "needs_revision" ? `${Y}NEEDS REVISION${R}` : `${RED}BLOCKED${R}`;

    console.log(`\n  ${B}COMPLIANCE SAFETY SCORE: ${scoreColor}${B}${report.score}/100${R}`);
    console.log(`  ${B}VERDICT: ${verdictIcon}`);

    if (report.verdict === "safe") {
      console.log(`  ${G}→ This copy can be dispatched to Meta & WhatsApp${R}`);
    } else if (report.verdict === "needs_revision") {
      console.log(`  ${Y}→ Guardian recommends revisions before dispatch${R}`);
    } else {
      console.log(`  ${RED}→ BLOCKED — Critical policy violations. Cannot dispatch.${R}`);
    }
  }

  // Summary
  divider("AUDIT SUMMARY");
  console.log(`  ${B}Test 1 (Extreme):${R}   Expected: ${RED}BLOCKED${R} — discrimination + aggression + misleading`);
  console.log(`  ${B}Test 2 (Moderate):${R}  Expected: ${Y}NEEDS REVISION${R} — aggressive terms + misleading`);
  console.log(`  ${B}Test 3 (Clean):${R}     Expected: ${G}SAFE${R} — professional Israeli RE copy`);
  console.log(`\n  ${B}Guardian Agent:${R} 5 check categories, deterministic + AI fallback`);
  console.log(`  ${B}Hebrew Quality:${R} Test 3 uses natural modern Israeli Hebrew — no robot-speak`);
  console.log(`  ${D}  "תארו לעצמכם" (imagine) — emotional, conversational opener${R}`);
  console.log(`  ${D}  "משטחי קוורץ ואי מרכזי" — specific features, agent-level Hebrew${R}`);
  console.log(`  ${D}  "מיקום פרימיום" — borrowed English, standard in Israeli RE market${R}`);
  console.log("");
}

main().catch((err) => {
  console.error("Audit failed:", err);
  process.exit(1);
});
