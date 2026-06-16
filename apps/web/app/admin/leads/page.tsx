"use client";

import { useState } from "react";
import { Building2, Sparkles, LayoutDashboard, Users, PlusCircle, Search, Phone, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { LISTINGS } from "../../data/listings";

// ── Mock Buyers ─────────────────────────────────────────────
const buyers = [
  { id: 1, name: "משפחת כהן", phone: "052-8881234", budget: 4_500_000, desiredCity: "נתניה", minRooms: 4, notes: "מחפשים נוף לים, חשובה מרפסת גדולה" },
  { id: 2, name: "רונן (משקיע)", phone: "054-3211234", budget: 2_500_000, desiredCity: "באר שבע", minRooms: 3, notes: "מחפש תשואה גבוהה, מעדיף חדש מקבלן" },
  { id: 3, name: "זוג צעיר — ליאור ומיכל", phone: "050-5551234", budget: 5_000_000, desiredCity: "תל אביב", minRooms: 3, notes: "חשוב קרבה לים, סגנון מודרני" },
  { id: 4, name: "משפחת לוי", phone: "058-9991234", budget: 9_000_000, desiredCity: "ירושלים", minRooms: 5, notes: "מחפשים שכונה יוקרתית, חנייה כפולה חובה" },
  { id: 5, name: "דוד — פנסיונר", phone: "053-6662345", budget: 3_000_000, desiredCity: "חיפה", minRooms: 3, notes: "שקט, נוף, קרוב לטיילת, מעלית חובה" },
  { id: 6, name: "ענבר (משקיעה)", phone: "052-4441122", budget: 4_500_000, desiredCity: "אילת", minRooms: 3, notes: "להשקעה לנופש, פטור ממע\"מ, קרוב לים" },
];

const NAV_ITEMS = [
  { label: "לוח בקרה", href: "/dashboard", icon: LayoutDashboard },
  { label: "הוסף נכס + AI", href: "/admin/add-property", icon: PlusCircle },
  { label: "לידים CRM", href: "/admin/leads", icon: Users, active: true },
];

export default function LeadsCrmPage() {
  const [expandedBuyer, setExpandedBuyer] = useState<number | null>(null);

  function getMatches(buyer: typeof buyers[0]) {
    return LISTINGS.filter((l) => {
      if (l.price > buyer.budget) return false;
      if (l.rooms < buyer.minRooms) return false;
      if (!l.city.includes(buyer.desiredCity) && !buyer.desiredCity.includes(l.city)) return false;
      return true;
    });
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-600 to-indigo-800 flex items-center justify-center shadow-lg shadow-indigo-200">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-blue-900">Toro Broker</p>
              <p className="text-[10px] text-gray-400">לוח ניהול משרד</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
                  item.active
                    ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                    : "text-gray-500 hover:bg-gray-50 hover:text-gray-700"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-[10px] text-gray-300">
            <Sparkles className="h-3 w-3" />
            <span>Powered by Toro AI</span>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-200">
              <Users className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-black text-blue-900">התאמה חכמה · Buyer Matching CRM</h1>
              <p className="text-sm text-gray-400">{buyers.length} לידים פעילים · {LISTINGS.length} נכסים במערכת</p>
            </div>
          </div>

          {/* Buyer cards */}
          <div className="space-y-4">
            {buyers.map((buyer) => {
              const isExpanded = expandedBuyer === buyer.id;
              const matches = isExpanded ? getMatches(buyer) : [];

              return (
                <div key={buyer.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                  {/* Buyer info */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-base font-black text-blue-900">{buyer.name}</h3>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{buyer.phone}</span>
                          <span className="flex items-center gap-1"><MapPin className="h-3 w-3" />{buyer.desiredCity}</span>
                        </div>
                      </div>
                      <div className="text-left">
                        <p className="text-lg font-black text-blue-900">₪{(buyer.budget / 1_000_000).toFixed(1)}M</p>
                        <p className="text-[10px] text-gray-400">תקציב מקסימלי</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <span className="bg-indigo-50 text-indigo-700 px-3 py-1 rounded-lg text-[10px] font-bold border border-indigo-100">
                          {buyer.minRooms}+ חדרים
                        </span>
                        <span className="bg-gray-50 text-gray-600 px-3 py-1 rounded-lg text-[10px] font-bold border border-gray-100">
                          {buyer.notes}
                        </span>
                      </div>
                      <button
                        onClick={() => setExpandedBuyer(isExpanded ? null : buyer.id)}
                        className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition cursor-pointer ${
                          isExpanded
                            ? "bg-gray-100 text-gray-600"
                            : "bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg shadow-emerald-200 hover:from-emerald-400 hover:to-teal-400"
                        }`}
                      >
                        <Search className="h-3.5 w-3.5" />
                        {isExpanded ? "סגור" : "מצא נכסים מתאימים"}
                      </button>
                    </div>
                  </div>

                  {/* Matches */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-gray-50 p-5">
                      {matches.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-4">
                          לא נמצאו נכסים מתאימים לקריטריונים — נסה להרחיב את התקציב
                        </p>
                      ) : (
                        <>
                          <p className="text-xs font-bold text-emerald-600 mb-3">
                            נמצאו {matches.length} נכסים מתאימים ✓
                          </p>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {matches.map((l) => (
                              <div key={l.id} className="flex bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-md transition">
                                <div className="w-24 flex-shrink-0 bg-gray-200 relative">
                                  <Image
                                    src={l.imageUrl || "https://images.unsplash.com/photo-1564013467402-9fef26628c91?q=80&w=200"}
                                    alt={l.title || l.address}
                                    fill
                                    sizes="96px"
                                    className="object-cover"
                                  />
                                </div>
                                <div className="flex-1 p-3 min-w-0">
                                  <p className="text-sm font-black text-blue-900 truncate">{l.title || l.address}</p>
                                  <p className="text-xs text-gray-400 truncate">{l.address}, {l.city}</p>
                                  <div className="flex items-center gap-2 mt-1.5">
                                    <span className="text-sm font-black text-indigo-600">₪{(l.price / 1_000_000).toFixed(1)}M</span>
                                    <span className="text-[10px] text-gray-400">{l.rooms} חד׳ · {l.sqm} מ״ר</span>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
