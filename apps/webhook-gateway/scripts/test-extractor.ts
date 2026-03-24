import "dotenv/config";
import { extractPropertyDetails } from "@repo/ai-core/extractor";

const TEST_MESSAGE = `שומע אחי יש לי דירת גן למכירה ברעננה ברחוב אחוזה 4 חדרים יפיפיה משופצת מהיסוד, חניה ומחסן בטאבו. רוצה עליה 3.2 מיליון גמיש קצת לרציניים. תעלה את זה למערכת מיד. תתקשר אליי 0524567890`;

async function main(): Promise<void> {
  console.log("─── Input Message ───");
  console.log(TEST_MESSAGE);
  console.log();

  const result = await extractPropertyDetails(TEST_MESSAGE);

  console.log("─── Extracted Property ───");
  console.log(JSON.stringify(result, null, 2));
}

main().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
