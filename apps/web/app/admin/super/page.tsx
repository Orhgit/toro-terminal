"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../lib/use-auth";
import {
  Building2,
  Shield,
  Users,
  Home,
  BarChart3,
  Settings,
  PlusCircle,
  Search,
  MoreHorizontal,
  TrendingUp,
  AlertTriangle,
  Power,
  Edit,
  Sparkles,
} from "lucide-react";

// ── Mock Data ────────────────────────────────────────────────
const MOCK_ORGS = [
  { id: "org-1", name: "מרכז הנכסים נתניה", slug: "merkaz-netanya", plan: "pro", maxListings: 100, usedListings: 47, agents: 5, leads: 128, isActive: true, createdAt: "2026-01-15" },
  { id: "org-2", name: "נדל״ן פלוס תל אביב", slug: "nadlan-plus-tlv", plan: "starter", maxListings: 20, usedListings: 18, agents: 2, leads: 45, isActive: true, createdAt: "2026-02-01" },
  { id: "org-3", name: "בית ברמה ירושלים", slug: "bait-barama-jlm", plan: "enterprise", maxListings: -1, usedListings: 230, agents: 15, leads: 512, isActive: true, createdAt: "2025-11-20" },
  { id: "org-4", name: "שמש נדל״ן חיפה", slug: "shemesh-haifa", plan: "free", maxListings: 5, usedListings: 5, agents: 1, leads: 8, isActive: true, createdAt: "2026-03-10" },
  { id: "org-5", name: "גולן נכסים", slug: "golan-properties", plan: "starter", maxListings: 20, usedListings: 12, agents: 3, leads: 32, isActive: false, createdAt: "2026-02-15" },
  { id: "org-6", name: "אלפא נדל״ן באר שבע", slug: "alpha-beer-sheva", plan: "pro", maxListings: 100, usedListings: 63, agents: 7, leads: 195, isActive: true, createdAt: "2026-01-05" },
];

const MOCK_RECENT_ACTIVITY = [
  { action: "נכס חדש פורסם", org: "מרכז הנכסים נתניה", user: "דני כהן", time: "לפני 12 דק׳" },
  { action: "שדרוג לתוכנית PRO", org: "שמש נדל״ן חיפה", user: "מערכת", time: "לפני שעה" },
  { action: "ליד חדש התקבל", org: "בית ברמה ירושלים", user: "מערכת", time: "לפני שעתיים" },
  { action: "סוכן חדש נוסף", org: "אלפא נדל״ן באר שבע", user: "שרה לוי", time: "לפני 3 שעות" },
  { action: "נכס הועבר לארכיון", org: "נדל״ן פלוס תל אביב", user: "יוסי אברהם", time: "אתמול" },
];

type PlanColor = { bg: string; text: string; label: string };

const PLAN_COLOR_DEFAULT: PlanColor = { bg: "bg-gray-100", text: "text-gray-600", label: "חינמי" };

const PLAN_COLORS: Record<string, PlanColor> = {
  free: PLAN_COLOR_DEFAULT,
  starter: { bg: "bg-blue-50", text: "text-blue-700", label: "סטארטר" },
  pro: { bg: "bg-purple-50", text: "text-purple-700", label: "PRO" },
  enterprise: { bg: "bg-yellow-50", text: "text-yellow-700", label: "אנטרפרייז" },
};

const NAV_ITEMS = [
  { label: "סקירה כללית", href: "/admin/super", icon: BarChart3, active: true },
  { label: "ארגונים", href: "/admin/super/orgs", icon: Building2 },
  { label: "משתמשים", href: "/admin/super/users", icon: Users },
  { label: "כל הנכסים", href: "/admin/super/properties", icon: Home },
  { label: "הגדרות מערכת", href: "/admin/super/settings", icon: Settings },
];

export default function SuperAdminDashboard() {
  const { isLoading: authLoading } = useAuth("super_admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddOrg, setShowAddOrg] = useState(false);
  const [newOrgName, setNewOrgName] = useState("");
  const [newOrgEmail, setNewOrgEmail] = useState("");
  const [newOrgPlan, setNewOrgPlan] = useState("free");
  const [addingOrg, setAddingOrg] = useState(false);
  const [orgAdded, setOrgAdded] = useState(false);

  const totalListings = MOCK_ORGS.reduce((s, o) => s + o.usedListings, 0);
  const totalLeads = MOCK_ORGS.reduce((s, o) => s + o.leads, 0);
  const totalAgents = MOCK_ORGS.reduce((s, o) => s + o.agents, 0);
  const activeOrgs = MOCK_ORGS.filter((o) => o.isActive).length;

  const filteredOrgs = MOCK_ORGS.filter((o) =>
    o.name.includes(searchQuery) || o.slug.includes(searchQuery.toLowerCase())
  );

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
  }

  function handleAddOrg(e: React.FormEvent) {
    e.preventDefault();
    setAddingOrg(true);
    setTimeout(() => {
      setAddingOrg(false);
      setOrgAdded(true);
      setTimeout(() => { setOrgAdded(false); setShowAddOrg(false); setNewOrgName(""); setNewOrgEmail(""); }, 2000);
    }, 1000);
  }

  return (
    <div className="min-h-screen bg-gray-50 flex" dir="rtl">
      {/* ── Sidebar ──────────────────────────────────────────── */}
      <aside className="w-64 bg-white border-l border-gray-100 flex flex-col flex-shrink-0">
        <div className="p-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-red-600 to-orange-600 flex items-center justify-center shadow-lg shadow-red-200">
              <Shield className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-black text-blue-900">Toro Super Admin</p>
              <p className="text-[10px] text-gray-400">ניהול מערכת ראשי</p>
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
                    ? "bg-red-50 text-red-700 border border-red-100"
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
          <div className="flex items-center gap-3 mb-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center">
              <span className="text-white text-xs font-black">או</span>
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">אור הזן</p>
              <p className="text-[10px] text-gray-400">בעלים · Super Admin</p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-300">
            <Sparkles className="h-3 w-3" />
            <span>Powered by Toro AI Platform</span>
          </div>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────────── */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-black text-blue-900">מרכז שליטה ראשי</h1>
              <p className="text-sm text-gray-400 mt-1">ניהול כלל הארגונים, המשתמשים והנכסים בפלטפורמה</p>
            </div>
            <button
              onClick={() => setShowAddOrg(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white px-5 py-3 rounded-2xl font-black text-sm hover:from-red-500 hover:to-orange-500 transition shadow-lg shadow-red-200"
            >
              <PlusCircle className="h-4 w-4" />
              הוסף ארגון חדש
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Building2 className="h-5 w-5" />} label="ארגונים פעילים" value={String(activeOrgs)} sub={`מתוך ${MOCK_ORGS.length}`} color="text-blue-600" bg="bg-blue-50" />
            <StatCard icon={<Home className="h-5 w-5" />} label="סה״כ נכסים" value={totalListings.toLocaleString("he-IL")} sub="+12 השבוע" color="text-emerald-600" bg="bg-emerald-50" />
            <StatCard icon={<Users className="h-5 w-5" />} label="סוכנים פעילים" value={String(totalAgents)} sub={`ב-${activeOrgs} ארגונים`} color="text-purple-600" bg="bg-purple-50" />
            <StatCard icon={<TrendingUp className="h-5 w-5" />} label="לידים (חודשי)" value={totalLeads.toLocaleString("he-IL")} sub="+18% מחודש שעבר" color="text-amber-600" bg="bg-amber-50" />
          </div>

          {/* Organizations Table */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-8">
            <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <h2 className="text-lg font-black text-blue-900">ארגונים רשומים</h2>
              <div className="relative w-full sm:w-72">
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
                <input
                  type="text"
                  placeholder="חפש ארגון..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-right">
                <thead>
                  <tr className="text-gray-400 text-[10px] uppercase tracking-widest border-b border-gray-50">
                    <th className="p-4 pr-6">ארגון</th>
                    <th className="p-4">תוכנית</th>
                    <th className="p-4">מודעות</th>
                    <th className="p-4">סוכנים</th>
                    <th className="p-4">לידים</th>
                    <th className="p-4">סטטוס</th>
                    <th className="p-4 pl-6">פעולות</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 text-sm">
                  {filteredOrgs.map((org) => {
                    const plan = PLAN_COLORS[org.plan] ?? PLAN_COLOR_DEFAULT;
                    const usagePercent = org.maxListings === -1 ? 0 : Math.round((org.usedListings / org.maxListings) * 100);
                    const isNearLimit = usagePercent >= 80 && org.maxListings !== -1;
                    return (
                      <tr key={org.id} className="hover:bg-gray-50/50 transition">
                        <td className="p-4 pr-6">
                          <div>
                            <p className="font-bold text-gray-800">{org.name}</p>
                            <p className="text-[10px] text-gray-400">{org.slug}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className={`${plan.bg} ${plan.text} px-2.5 py-1 rounded-lg text-[10px] font-black`}>
                            {plan.label}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-800">{org.usedListings}</span>
                            <span className="text-gray-300">/</span>
                            <span className="text-gray-400 text-xs">{org.maxListings === -1 ? "\u221E" : org.maxListings}</span>
                            {isNearLimit && <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />}
                          </div>
                        </td>
                        <td className="p-4 font-bold text-gray-600">{org.agents}</td>
                        <td className="p-4 font-bold text-blue-600">{org.leads}</td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${org.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            <Power className="h-3 w-3" />
                            {org.isActive ? "פעיל" : "מושבת"}
                          </span>
                        </td>
                        <td className="p-4 pl-6">
                          <div className="flex items-center gap-2">
                            <button className="p-1.5 rounded-lg hover:bg-blue-50 text-gray-400 hover:text-blue-600 transition" title="ערוך"><Edit className="h-3.5 w-3.5" /></button>
                            <button className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition" title="עוד"><MoreHorizontal className="h-3.5 w-3.5" /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-lg font-black text-blue-900 mb-4">פעילות אחרונה</h2>
            <div className="space-y-3">
              {MOCK_RECENT_ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                    <div>
                      <p className="text-sm font-bold text-gray-700">{a.action}</p>
                      <p className="text-[10px] text-gray-400">{a.org} · {a.user}</p>
                    </div>
                  </div>
                  <span className="text-[10px] text-gray-400 font-bold">{a.time}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </main>

      {/* ── Add Organization Modal ────────────────────────────── */}
      {showAddOrg && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg p-8" dir="rtl">
            <h2 className="text-xl font-black text-blue-900 mb-1">הוספת ארגון חדש</h2>
            <p className="text-sm text-gray-400 mb-6">הוסף משרד תיווך או סוכן עצמאי לפלטפורמה</p>

            {orgAdded ? (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                <p className="text-lg font-bold text-emerald-700">הארגון נוסף בהצלחה!</p>
                <p className="text-sm text-emerald-600 mt-1">הזמנה נשלחה למייל הארגון</p>
              </div>
            ) : (
              <form onSubmit={handleAddOrg} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">שם הארגון / משרד</label>
                  <input type="text" required value={newOrgName} onChange={(e) => setNewOrgName(e.target.value)} placeholder="לדוגמה: מרכז הנכסים נתניה" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">אימייל ארגוני</label>
                  <input type="email" required value={newOrgEmail} onChange={(e) => setNewOrgEmail(e.target.value)} placeholder="office@agency.co.il" className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 placeholder:text-gray-300 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-600 mb-1.5">תוכנית מנוי</label>
                  <select value={newOrgPlan} onChange={(e) => setNewOrgPlan(e.target.value)} className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition appearance-none">
                    <option value="free">חינמי (5 מודעות)</option>
                    <option value="starter">סטארטר (20 מודעות · ₪199/חודש)</option>
                    <option value="pro">PRO (100 מודעות · ₪499/חודש)</option>
                    <option value="enterprise">אנטרפרייז (ללא הגבלה)</option>
                  </select>
                </div>

                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={addingOrg} className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 to-orange-600 text-white py-3.5 rounded-2xl font-black text-sm hover:from-red-500 hover:to-orange-500 transition shadow-lg disabled:opacity-60">
                    {addingOrg ? "מוסיף..." : "הוסף ארגון"}
                  </button>
                  <button type="button" onClick={() => setShowAddOrg(false)} className="px-6 py-3.5 rounded-2xl font-bold text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 transition">
                    ביטול
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────
function StatCard({ icon, label, value, sub, color, bg }: { icon: React.ReactNode; label: string; value: string; sub: string; color: string; bg: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-sm transition">
      <div className={`${bg} ${color} h-10 w-10 rounded-xl flex items-center justify-center mb-3`}>
        {icon}
      </div>
      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className={`text-2xl font-black ${color}`}>{value}</p>
      <p className="text-[10px] text-gray-400 mt-0.5">{sub}</p>
    </div>
  );
}
