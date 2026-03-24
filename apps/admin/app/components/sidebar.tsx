"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Home, ClipboardList, Settings, Zap, Activity, Workflow, LayoutDashboard } from "lucide-react";

const NAV_ITEMS = [
  { label: "Properties", href: "/", icon: Home },
  { label: "Mission Control", href: "/mission-control", icon: LayoutDashboard },
  { label: "Marketing Tasks", href: "/marketing-tasks", icon: ClipboardList },
  { label: "Agent Studio", href: "/agent-studio", icon: Workflow },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex w-64 flex-col bg-(--color-sidebar) text-white">
      {/* Brand */}
      <div className="flex h-16 items-center gap-3 px-6 border-b border-white/10">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/25">
          <Zap className="h-4.5 w-4.5 text-white fill-white" />
        </div>
        <div>
          <p className="text-sm font-bold tracking-wide">Toro</p>
          <p className="text-[10px] font-medium text-indigo-300/70 uppercase tracking-widest">
            Command Center
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-150 ${
                isActive
                  ? "bg-indigo-500/15 text-indigo-200 font-medium border border-indigo-500/20"
                  : "text-slate-400 hover:bg-(--color-sidebar-hover) hover:text-white"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* System Health */}
      <div className="mx-3 mb-3 rounded-lg bg-white/5 p-3">
        <div className="flex items-center gap-2 mb-2">
          <Activity className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            AI Swarm
          </span>
        </div>
        <div className="space-y-1.5">
          <HealthRow label="Extractor" status="mock" />
          <HealthRow label="Vision" status="mock" />
          <HealthRow label="Copywriter" status="mock" />
          <HealthRow label="Director" status="mock" />
          <HealthRow label="Matchmaker" status="mock" />
        </div>
        <Link
          href="/settings"
          className="mt-2.5 block text-center text-[10px] font-medium text-indigo-400 hover:text-indigo-300 transition-colors"
        >
          Configure APIs &rarr;
        </Link>
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-6 py-3">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber-400 status-pulse" />
          <p className="text-[11px] text-slate-500">Toro v0.1.0 — Mock Mode</p>
        </div>
      </div>
    </aside>
  );
}

function HealthRow({ label, status }: { label: string; status: "live" | "mock" }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px] text-slate-500">{label}</span>
      <span
        className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[9px] font-medium ${
          status === "live"
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-amber-500/15 text-amber-400"
        }`}
      >
        <span
          className={`h-1 w-1 rounded-full ${
            status === "live" ? "bg-emerald-400" : "bg-amber-400 status-pulse"
          }`}
        />
        {status === "live" ? "Ready" : "Mock"}
      </span>
    </div>
  );
}
