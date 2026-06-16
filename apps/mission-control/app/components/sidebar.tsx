"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  Settings,
  Zap,
  Activity,
  ExternalLink,
  Crosshair,
} from "lucide-react";
import { HuntTerminal } from "./hunt-terminal";

const NAV_ITEMS = [
  { label: "Pipeline", href: "/", icon: LayoutDashboard },
  { label: "Settings", href: "/settings", icon: Settings },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const [huntOpen, setHuntOpen] = useState(false);

  return (
    <>
      <aside className="flex w-[260px] flex-col border-l border-(--color-border) bg-(--color-bg-elevated)">
        {/* Brand */}
        <div className="flex h-16 items-center gap-3 px-5 border-b border-(--color-border)">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20">
            <Zap className="h-4.5 w-4.5 text-white fill-white" />
          </div>
          <div>
            <p className="text-sm font-bold tracking-wide text-(--color-text-primary)">
              Toro
            </p>
            <p className="text-[10px] font-medium text-indigo-400/70 uppercase tracking-widest">
              Mission Control
            </p>
          </div>
        </div>

        {/* START NEW HUNT */}
        <div className="px-3 pt-4 pb-2">
          <button
            onClick={() => setHuntOpen(true)}
            className="w-full flex items-center justify-center gap-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 hover:from-indigo-500 hover:to-violet-500 transition-all duration-200 cursor-pointer group"
          >
            <Crosshair className="h-4.5 w-4.5 group-hover:animate-spin" style={{ animationDuration: "2s" }} />
            START NEW HUNT
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 px-3 py-2">
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
                    ? "bg-(--color-brand-muted) text-indigo-300 font-medium border border-indigo-500/20"
                    : "text-(--color-text-muted) hover:bg-(--color-bg-hover) hover:text-(--color-text-primary) border border-transparent"
                }`}
              >
                <Icon className="h-[18px] w-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Swarm Health */}
        <div className="mx-3 mb-3 rounded-xl bg-white/[0.03] border border-(--color-border) p-3">
          <div className="flex items-center gap-2 mb-2.5">
            <Activity className="h-3.5 w-3.5 text-(--color-text-muted)" />
            <span className="text-[11px] font-semibold uppercase tracking-wider text-(--color-text-muted)">
              AI Swarm
            </span>
          </div>
          <div className="space-y-1.5">
            {(["Scout", "Vision", "Copywriter", "Guardian", "Matchmaker"] as const).map((agent) => (
              <div key={agent} className="flex items-center justify-between">
                <span className="text-[11px] text-(--color-text-muted)">{agent}</span>
                <span className="badge bg-amber-400/10 text-amber-400">
                  <span className="h-1 w-1 rounded-full bg-amber-400 animate-pulse-soft" />
                  Mock
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin link */}
        <div className="border-t border-(--color-border) px-5 py-3">
          <a
            href="http://localhost:4001"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-[11px] text-(--color-text-muted) hover:text-(--color-text-secondary) transition-colors"
          >
            <ExternalLink className="h-3 w-3" />
            Open Admin Dashboard
          </a>
          <div className="flex items-center gap-2 mt-2">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse-soft" />
            <p className="text-[11px] text-(--color-text-muted)">v0.1.0 — Mock Mode</p>
          </div>
        </div>
      </aside>

      {/* Hunt Terminal Modal */}
      <HuntTerminal open={huntOpen} onClose={() => setHuntOpen(false)} />
    </>
  );
}
