import "dotenv/config";

const G = "\x1b[32m";
const Y = "\x1b[33m";
const C = "\x1b[36m";
const D = "\x1b[2m";
const B = "\x1b[1m";
const R = "\x1b[0m";

interface LinearIssue {
  identifier: string;
  title: string;
  state: { name: string };
  priority: number;
  createdAt: string;
  url: string;
}

const ISSUES_QUERY = `
  query {
    issues(first: 5, orderBy: createdAt) {
      nodes {
        identifier
        title
        state { name }
        priority
        createdAt
        url
      }
    }
  }
`;

const PRIORITY_LABELS: Record<number, string> = {
  0: `${D}None${R}`,
  1: `${Y}${B}Urgent${R}`,
  2: `${Y}High${R}`,
  3: `${C}Medium${R}`,
  4: `${D}Low${R}`,
};

function pad(str: string, len: number): string {
  // Strip ANSI for length calculation
  const stripped = str.replace(/\x1b\[[0-9;]*m/g, "");
  const diff = len - stripped.length;
  return diff > 0 ? str + " ".repeat(diff) : str;
}

async function main() {
  if (!process.env.LINEAR_API_KEY) {
    // Show mock data when no API key
    console.log(`  ${D}LINEAR_API_KEY not set — showing mock status${R}`);
    console.log("");

    const mockIssues = [
      { id: "TOR-12", title: "[Sync] Toro deployed — cafa992", state: "Done", priority: "High", date: "2026-03-24" },
      { id: "TOR-11", title: "דירת גן בלב המשתלה — בית פרטי בתוך העיר", state: "In Progress", priority: "Urgent", date: "2026-03-24" },
      { id: "TOR-10", title: "פנטהאוז עם נוף לים — הבית שתמיד חלמתם עליו", state: "In Review", priority: "High", date: "2026-03-23" },
      { id: "TOR-9", title: "דירת בוטיק מודרנית — עיצוב, ים, ותשואה", state: "Done", priority: "Medium", date: "2026-03-22" },
      { id: "TOR-8", title: "דירת 4 חדרים על רוטשילד — מיקום, מיקום, מיקום", state: "Backlog", priority: "Medium", date: "2026-03-21" },
    ];

    // Header
    console.log(`  ${B}${pad("ID", 10)} ${pad("Status", 14)} ${pad("Priority", 10)} ${pad("Date", 12)} Title${R}`);
    console.log(`  ${D}${"─".repeat(80)}${R}`);

    for (const issue of mockIssues) {
      const stateColor = issue.state === "Done" ? G
        : issue.state === "In Progress" ? Y
        : issue.state === "In Review" ? C
        : D;

      const priColor = issue.priority === "Urgent" ? `${Y}${B}`
        : issue.priority === "High" ? Y
        : C;

      console.log(`  ${C}${pad(issue.id, 10)}${R} ${stateColor}${pad(issue.state, 14)}${R} ${priColor}${pad(issue.priority, 10)}${R} ${D}${pad(issue.date, 12)}${R} ${issue.title}`);
    }

    console.log("");
    console.log(`  ${D}Total: ${mockIssues.length} issues${R}`);
    console.log("");
    return;
  }

  // Live mode
  const response = await fetch("https://api.linear.app/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: process.env.LINEAR_API_KEY,
    },
    body: JSON.stringify({ query: ISSUES_QUERY }),
  });

  if (!response.ok) {
    console.error(`Linear API error: ${response.status}`);
    process.exit(1);
  }

  const result = (await response.json()) as {
    data?: { issues: { nodes: LinearIssue[] } };
    errors?: Array<{ message: string }>;
  };

  if (result.errors?.length) {
    console.error("Linear errors:", result.errors.map((e) => e.message).join(", "));
    process.exit(1);
  }

  const issues = result.data?.issues.nodes ?? [];

  if (issues.length === 0) {
    console.log(`  ${D}No issues found in Linear${R}`);
    return;
  }

  console.log(`  ${B}${pad("ID", 10)} ${pad("Status", 14)} ${pad("Priority", 10)} ${pad("Date", 12)} Title${R}`);
  console.log(`  ${D}${"─".repeat(80)}${R}`);

  for (const issue of issues) {
    const date = new Date(issue.createdAt).toISOString().split("T")[0];
    const stateColor = issue.state.name.includes("Done") ? G
      : issue.state.name.includes("Progress") ? Y
      : issue.state.name.includes("Review") ? C
      : D;
    const priLabel = PRIORITY_LABELS[issue.priority] ?? `${D}—${R}`;
    const titleTrunc = issue.title.length > 50 ? issue.title.slice(0, 47) + "..." : issue.title;

    console.log(`  ${C}${pad(issue.identifier, 10)}${R} ${stateColor}${pad(issue.state.name, 14)}${R} ${pad(priLabel, 10)} ${D}${pad(date ?? "", 12)}${R} ${titleTrunc}`);
  }

  console.log("");
  console.log(`  ${D}Total: ${issues.length} issues${R}`);
  console.log("");
}

main().catch((err) => {
  console.error("Status failed:", err);
  process.exit(1);
});
