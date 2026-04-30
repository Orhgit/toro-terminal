"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuth } from "../../../lib/use-auth";
import {
  Building2,
  Shield,
  Users,
  Home,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronUp,
  Power,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Sparkles,
  Search,
  Filter,
} from "lucide-react";

// ── Mock Data (shared with super dashboard) ──────────────────
const MOCK_ORGS = [
  { id: "org-1", name: "מרכז הנכסים נתניה", slug: "merkaz-netanya", plan: "pro", maxListings: 100, usedListings: 47, agents: 5, leads: 128, isActive: true, createdAt: "2026-01-15", email: "office@merkaz-netanya.co.il", phone: "09-8123456" },
  { id: "org-2", name: "נדל״ן פלוס תל אביב", slug: "nadlan-plus-tlv", plan: "starter", maxListings: 20, usedListings: 18, agents: 2, leads: 45, isActive: true, createdAt: "2026-02-01", email: "info@nadlan-plus.co.il", phone: "03-5551234" },
  { id: "org-3", name: "בית ברמה ירושלים", slug: "bait-barama-jlm", plan: "enterprise", maxListings: -1, usedListings: 230, agents: 15, leads: 512, isActive: true, createdAt: "2025-11-20", email: "admin@bait-barama.co.il", phone: "02-6234567" },
  { id: "org-4", name: "שמש נדל״ן חיפה", slug: "shemesh-haifa", plan: "free", maxListings: 5, usedListings: 5, agents: 1, leads: 8, isActive: true, createdAt: "2026-03-10", email: "hello@shemesh-haifa.co.il", phone: "04-8112233" },
  { id: "org-5", name: "גולן נכסים", slug: "golan-properties", plan: "starter", maxListings: 20, usedListings: 12, agents: 3, leads: 32, isActive: false, createdAt: "2026-02-15", email: "team@golan-props.co.il", phone: "04-6987654" },
  { id: "org-6", name: "אלפא נדל״ן באר שבע", slug: "alpha-beer-sheva", plan: "pro", maxListings: 100, usedListings: 63, agents: 7, leads: 195, isActive: true, createdAt: "2026-01-05", email: "contact@alpha-bs.co.il", phone: "08-6271234" },
];

type PlanColor = { bg: string; text: string; label: string; border: string };

const PLAN_COLOR_DEFAULT: PlanColor = { bg: "bg-gray-100", text: "text-gray-600", label: "חינמי", border: "border-gray-200" };

const PLAN_COLORS: Record<string, PlanColor> = {
  free: PLAN_COLOR_DEFAULT,
  starter: { bg: "bg-blue-50", text: "text-blue-700", label: "סטארטר", border: "border-blue-200" },
  pro: { bg: "bg-purple-50", text: "text-purple-700", label: "PRO", border: "border-purple-200" },
  enterprise: { bg: "bg-yellow-50", text: "text-yellow-700", label: "אנטרפרייז", border: "border-yellow-200" },
};

const PLAN_OPTIONS = [
  { value: "free", label: "חינמי (5 מודעות)" },
  { value: "starter", label: "סטארטר (20 מודעות · ₪199/חודש)" },
  { value: "pro", label: "PRO (100 מודעות · ₪499/חודש)" },
  { value: "enterprise", label: "אנטרפרייז (ללא הגבלה)" },
];

const NAV_ITEMS = [
  { label: "סקירה כללית", href: "/admin/super", icon: BarChart3 },
  { label: "ארגונים", href: "/admin/super/orgs", icon: Building2, active: true },
  { label: "משתמשים", href: "/admin/super/users", icon: Users },
  { label: "כל הנכסים", href: "/admin/super/properties", icon: Home },
  { label: "הגדרות מערכת", href: "/admin/super/settings", icon: Settings },
];

export default function OrgsManagementPage() {
  const { isLoading: authLoading } = useAuth("super_admin");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterPlan, setFilterPlan] = useState<string>("all");
  const [expandedOrg, setExpandedOrg] = useState<string | null>(null);
  const [planChanges, setPlanChanges] = useState<Record<string, string>>({});
  const [savingPlan, setSavingPlan] = useState<string | null>(null);
  const [savedPlan, setSavedPlan] = useState<string | null>(null);

  const filteredOrgs = MOCK_ORGS.filter((o) => {
    const matchesSearch = o.name.includes(searchQuery) || o.slug.includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === "all" || o.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  function handlePlanChange(orgId: string, newPlan: string) {
    setPlanChanges((prev) => ({ ...prev, [orgId]: newPlan }));
  }

  function handleSavePlan(orgId: string) {
    setSavingPlan(orgId);
    setTimeout(() => {
      setSavingPlan(null);
      setSavedPlan(orgId);
      setTimeout(() => setSavedPlan(null), 2000);
    }, 800);
  }

  function toggleExpand(orgId: string) {
    setExpandedOrg((prev) => (prev === orgId ? null : orgId));
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="h-8 w-8 border-4 border-red-200 border-t-red-600 rounded-full animate-spin" />
      </div>
    );
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
          <div className="mb-8">
            <h1 className="text-3xl font-black text-blue-900">ניהול ארגונים</h1>
            <p className="text-sm text-gray-400 mt-1">צפה, ערוך ונהל את כל הארגונים הרשומים בפלטפורמה</p>
          </div>

          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-6">
            <div className="relative flex-1 w-full sm:max-w-sm">
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
              <input
                type="text"
                placeholder="חפש ארגון לפי שם או slug..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-gray-200 bg-white text-sm focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-400" />
              <select
                value={filterPlan}
                onChange={(e) => setFilterPlan(e.target.value)}
                className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-100 transition appearance-none"
              >
                <option value="all">כל התוכניות</option>
                <option value="free">חינמי</option>
                <option value="starter">סטארטר</option>
                <option value="pro">PRO</option>
                <option value="enterprise">אנטרפרייז</option>
              </select>
            </div>
            <div className="text-sm text-gray-400 font-bold">
              {filteredOrgs.length} ארגונים
            </div>
          </div>

          {/* Organization Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {filteredOrgs.map((org) => {
              const plan = PLAN_COLORS[org.plan] ?? PLAN_COLOR_DEFAULT;
              const usagePercent = org.maxListings === -1 ? 0 : Math.round((org.usedListings / org.maxListings) * 100);
              const isNearLimit = usagePercent >= 80 && org.maxListings !== -1;
              const isExpanded = expandedOrg === org.id;
              const currentPlanValue = planChanges[org.id] || org.plan;

              return (
                <div
                  key={org.id}
                  className={`bg-white rounded-3xl border transition-all duration-300 ${
                    isExpanded ? "border-red-200 shadow-lg shadow-red-50" : "border-gray-100 shadow-sm hover:shadow-md"
                  }`}
                >
                  {/* Card Header */}
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`h-11 w-11 rounded-2xl ${plan.bg} flex items-center justify-center`}>
                          <Building2 className={`h-5 w-5 ${plan.text}`} />
                        </div>
                        <div>
                          <h3 className="font-black text-gray-800 text-base">{org.name}</h3>
                          <p className="text-[10px] text-gray-400">{org.slug}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`${plan.bg} ${plan.text} px-3 py-1 rounded-lg text-[10px] font-black`}>
                          {plan.label}
                        </span>
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${org.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                          <Power className="h-3 w-3" />
                          {org.isActive ? "פעיל" : "מושבת"}
                        </span>
                      </div>
                    </div>

                    {/* Stats Row */}
                    <div className="grid grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">סוכנים</p>
                        <p className="text-lg font-black text-gray-700">{org.agents}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">לידים</p>
                        <p className="text-lg font-black text-blue-600">{org.leads}</p>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-3 text-center">
                        <p className="text-[10px] text-gray-400 font-bold mb-0.5">נרשם</p>
                        <p className="text-xs font-bold text-gray-500 mt-1">{new Date(org.createdAt).toLocaleDateString("he-IL")}</p>
                      </div>
                    </div>

                    {/* Quota Usage Bar */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <p className="text-[10px] text-gray-500 font-bold">ניצול מכסת מודעות</p>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-gray-700">{org.usedListings}</span>
                          <span className="text-gray-300 text-xs">/</span>
                          <span className="text-xs text-gray-400">{org.maxListings === -1 ? "\u221E" : org.maxListings}</span>
                          {isNearLimit && <AlertTriangle className="h-3 w-3 text-amber-500" />}
                        </div>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            org.maxListings === -1
                              ? "bg-gradient-to-r from-yellow-400 to-yellow-500 w-[15%]"
                              : usagePercent >= 90
                              ? "bg-gradient-to-r from-red-400 to-red-500"
                              : usagePercent >= 70
                              ? "bg-gradient-to-r from-amber-400 to-amber-500"
                              : "bg-gradient-to-r from-emerald-400 to-emerald-500"
                          }`}
                          style={{ width: org.maxListings === -1 ? "15%" : `${Math.min(usagePercent, 100)}%` }}
                        />
                      </div>
                      {org.maxListings !== -1 && (
                        <p className={`text-[10px] mt-1 font-bold ${usagePercent >= 90 ? "text-red-500" : usagePercent >= 70 ? "text-amber-500" : "text-gray-400"}`}>
                          {usagePercent}% מנוצל
                        </p>
                      )}
                      {org.maxListings === -1 && (
                        <p className="text-[10px] mt-1 font-bold text-yellow-600">ללא הגבלה</p>
                      )}
                    </div>

                    {/* Expand Button */}
                    <button
                      onClick={() => toggleExpand(org.id)}
                      className="w-full flex items-center justify-center gap-1.5 text-xs font-bold text-gray-400 hover:text-gray-600 py-2 rounded-xl hover:bg-gray-50 transition"
                    >
                      {isExpanded ? (
                        <>
                          <ChevronUp className="h-3.5 w-3.5" />
                          הסתר פרטים
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3.5 w-3.5" />
                          הצג פרטים נוספים
                        </>
                      )}
                    </button>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 p-6 bg-gray-50/50 rounded-b-3xl space-y-4">
                      {/* Contact Info */}
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold mb-1">אימייל</p>
                          <p className="text-sm text-gray-700 font-bold">{org.email}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-gray-400 font-bold mb-1">טלפון</p>
                          <p className="text-sm text-gray-700 font-bold" dir="ltr">{org.phone}</p>
                        </div>
                      </div>

                      {/* Change Plan */}
                      <div>
                        <p className="text-[10px] text-gray-400 font-bold mb-2">שנה תוכנית</p>
                        <div className="flex items-center gap-3">
                          <select
                            value={currentPlanValue}
                            onChange={(e) => handlePlanChange(org.id, e.target.value)}
                            className="flex-1 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-800 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition appearance-none"
                          >
                            {PLAN_OPTIONS.map((p) => (
                              <option key={p.value} value={p.value}>{p.label}</option>
                            ))}
                          </select>
                          <button
                            onClick={() => handleSavePlan(org.id)}
                            disabled={savingPlan === org.id || currentPlanValue === org.plan}
                            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-orange-600 text-white font-black text-xs hover:from-red-500 hover:to-orange-500 transition shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            {savingPlan === org.id ? "שומר..." : savedPlan === org.id ? "נשמר!" : "שמור"}
                          </button>
                        </div>
                      </div>

                      {/* Quick Actions */}
                      <div className="flex items-center gap-2 pt-2">
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-white hover:border-gray-300 transition">
                          <Users className="h-3.5 w-3.5" />
                          נהל סוכנים
                        </button>
                        <button className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-xs font-bold hover:bg-white hover:border-gray-300 transition">
                          <TrendingUp className="h-3.5 w-3.5" />
                          צפה בדוחות
                        </button>
                        <button className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border text-xs font-bold transition ${
                          org.isActive
                            ? "border-red-200 text-red-600 hover:bg-red-50"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}>
                          <Power className="h-3.5 w-3.5" />
                          {org.isActive ? "השבת ארגון" : "הפעל ארגון"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Empty State */}
          {filteredOrgs.length === 0 && (
            <div className="bg-white rounded-3xl border border-gray-100 p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-200 mx-auto mb-4" />
              <p className="text-lg font-black text-gray-400">לא נמצאו ארגונים</p>
              <p className="text-sm text-gray-300 mt-1">נסה לשנות את מסנני החיפוש</p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
