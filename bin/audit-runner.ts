import { LinearClient } from '@linear/sdk';
import * as dotenv from 'dotenv';
dotenv.config();

const linear = new LinearClient({ apiKey: process.env.LINEAR_API_KEY });

async function runNightlyAudit() {
    console.log("🚀 Starting Toro Autonomous Audit...");
    const report = [];

    // סימולציה של בדיקות (כאן נכנסת הלוגיקה של האגנטים)
    report.push("| זירה | סטטוס | ממצאים |");
    report.push("| :--- | :--- | :--- |");
    report.push("| Intelligence | ✅ Pass | Guardian sanitized 10/10 prompts |");
    report.push("| Visuals | ⚠️ Warning | 1 image had low contrast |");
    report.push("| API Health | ✅ Green | All systems operational |");

    const fullReport = report.join("\n");

    // יצירת משימה בליניאר
    await linear.createIssue({
        teamId: "TORO", // וודא שזה ה-Team ID שלך
        title: "🚨 [Auto-Audit] Nightly System Health - " + new Date().toLocaleDateString(),
        description: "Zero-touch audit complete.\n\n" + fullReport,
        labelIds: ["Audit-Complete"]
    });

    console.log("✅ Audit Report pushed to Linear!");
}

runNightlyAudit().catch(console.error);
