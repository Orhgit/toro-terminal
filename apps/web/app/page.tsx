import type { Property } from "@repo/database/schema";
import { PropertyCard, type PropertyCardData } from "./components/property-card";

// ============================================================
// Mock data — real Israeli properties with Unsplash imagery
// ============================================================

const MOCK_PROPERTIES: PropertyCardData[] = [
  {
    property: {
      id: "a1b2c3d4-0000-4000-8000-000000000001",
      owner_phone: "052-4567890",
      price_asked: 3_200_000,
      status: "active",
      created_at: "2026-03-20T10:00:00.000Z",
      updated_at: "2026-03-20T10:00:00.000Z",
    } satisfies Property,
    city: "תל אביב",
    neighborhood: "שכונת המשתלה",
    rooms: 4,
    sqm: 110,
    floor: "קומה 3",
    marketing_hook:
      "דירת גן מעוצבת בלב המשתלה — רחוב שקט, גינה פרטית ענקית, ותחושה של בית פרטי בלב תל אביב.",
    features: ["גינה פרטית", "מטבח שף", "חניה כפולה", "ממ״ד"],
    image_url:
      "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1080&q=80",
  },
  {
    property: {
      id: "a1b2c3d4-0000-4000-8000-000000000002",
      owner_phone: "054-9876543",
      price_asked: 8_500_000,
      status: "active",
      created_at: "2026-03-18T14:30:00.000Z",
      updated_at: "2026-03-19T09:00:00.000Z",
    } satisfies Property,
    city: "נתניה",
    neighborhood: "מרכז העיר",
    rooms: 5,
    sqm: 180,
    floor: "קומה 18",
    marketing_hook:
      "פנטהאוז 5 חדרים עם נוף פנורמי לים. מרפסת 60 מ״ר, מעלית פרטית, וגימור ברמה שלא תמצאו בשום מקום אחר.",
    features: ["נוף לים", "מרפסת ענקית", "מעלית פרטית", "חלונות מרצפה לתקרה", "ג׳קוזי"],
    image_url:
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1080&q=80",
  },
  {
    property: {
      id: "a1b2c3d4-0000-4000-8000-000000000003",
      owner_phone: "050-1112233",
      price_asked: 2_100_000,
      status: "active",
      created_at: "2026-03-22T08:15:00.000Z",
      updated_at: "2026-03-22T08:15:00.000Z",
    } satisfies Property,
    city: "הרצליה",
    neighborhood: "הרצליה פיתוח",
    rooms: 3,
    sqm: 85,
    floor: "קומה 7",
    marketing_hook:
      "דירת בוטיק מודרנית בהרצליה פיתוח. עיצוב אדריכלי, קרבה לים ולפארק, ותשואה מיידית למשקיעים חכמים.",
    features: ["עיצוב אדריכלי", "קרוב לים", "חניה מקורה", "מרפסת שמש"],
    image_url:
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1080&q=80",
  },
];

// ============================================================
// Page
// ============================================================

export default function FeedPage() {
  return (
    <main className="h-screen overflow-y-scroll snap-feed">
      {MOCK_PROPERTIES.map((data) => (
        <PropertyCard key={data.property.id} data={data} />
      ))}
    </main>
  );
}
