"use client";

import { ShieldCheck, ShieldAlert, ShieldX } from "lucide-react";
import type { GuardianResult, ComplianceVerdict } from "../data/properties";
import { useState } from "react";

const VERDICT_CONFIG: Record<
  ComplianceVerdict,
  { Icon: typeof ShieldCheck; color: string; bg: string; label: string }
> = {
  safe: {
    Icon: ShieldCheck,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10",
    label: "Guardian Approved",
  },
  needs_revision: {
    Icon: ShieldAlert,
    color: "text-amber-400",
    bg: "bg-amber-400/10",
    label: "Needs Revision",
  },
  blocked: {
    Icon: ShieldX,
    color: "text-rose-400",
    bg: "bg-rose-400/10",
    label: "Blocked",
  },
};

export function ComplianceBadge({ guardian }: { guardian: GuardianResult | null }) {
  const [showDetails, setShowDetails] = useState(false);

  if (!guardian) {
    return (
      <span className="badge bg-zinc-800 text-(--color-text-muted)">
        Pending Review
      </span>
    );
  }

  const config = VERDICT_CONFIG[guardian.verdict];
  const { Icon } = config;

  return (
    <div className="relative">
      <button
        onClick={() => setShowDetails(!showDetails)}
        className={`badge ${config.bg} ${config.color} cursor-pointer hover:opacity-80 transition-opacity`}
      >
        <Icon className="h-3 w-3" />
        {config.label}
        <span className="mr-1 font-mono text-[10px] opacity-70">
          {guardian.score}
        </span>
      </button>

      {showDetails && (
        <div className="absolute top-full right-0 mt-2 w-72 rounded-xl bg-(--color-bg-elevated) border border-(--color-border) p-3 shadow-2xl z-50 animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-(--color-text-primary)">
              Meta Compliance
            </span>
            <span className={`text-lg font-bold ${config.color}`}>
              {guardian.score}/100
            </span>
          </div>
          <div className="space-y-2">
            {guardian.checks.map((check) => (
              <div key={check.name} className="flex items-start gap-2">
                <span
                  className={`mt-0.5 h-1.5 w-1.5 rounded-full flex-shrink-0 ${
                    check.passed ? "bg-emerald-400" : "bg-rose-400"
                  }`}
                />
                <div>
                  <p className="text-[11px] font-medium text-(--color-text-secondary)">
                    {check.name}
                  </p>
                  <p className="text-[10px] text-(--color-text-muted)">
                    {check.detail}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
