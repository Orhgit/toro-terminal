"use client";

import {
  Settings,
  Key,
  Database,
  MessageCircle,
  Workflow,
  CheckCircle2,
  XCircle,
} from "lucide-react";

const SERVICES = [
  {
    name: "OpenAI",
    description: "Powers AI Swarm agents (Scout, Vision, Copywriter, Matchmaker)",
    envVar: "OPENAI_API_KEY",
    icon: Key,
    configured: false,
  },
  {
    name: "Supabase",
    description: "Database and file storage for properties, leads, and assets",
    envVar: "SUPABASE_URL",
    icon: Database,
    configured: false,
  },
  {
    name: "WhatsApp Business",
    description: "Meta-compliant messaging for lead outreach",
    envVar: "WHATSAPP_ACCESS_TOKEN",
    icon: MessageCircle,
    configured: false,
  },
  {
    name: "Linear",
    description: "Task management and issue tracking for marketing pipeline",
    envVar: "LINEAR_API_KEY",
    icon: Workflow,
    configured: false,
  },
];

export default function SettingsPage() {
  return (
    <div className="min-h-screen p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-(--color-text-primary) mb-1 flex items-center gap-3">
          <Settings className="h-6 w-6 text-(--color-text-muted)" />
          Settings
        </h1>
        <p className="text-sm text-(--color-text-muted)">
          Configure integrations and API keys
        </p>
      </div>

      <div className="space-y-3">
        {SERVICES.map((service) => {
          const Icon = service.icon;
          return (
            <div key={service.name} className="card p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-(--color-bg-hover) flex items-center justify-center flex-shrink-0">
                <Icon className="h-5 w-5 text-(--color-text-muted)" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-(--color-text-primary)">
                  {service.name}
                </p>
                <p className="text-xs text-(--color-text-muted)">
                  {service.description}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <code className="text-[10px] text-(--color-text-muted) bg-(--color-bg-hover) px-2 py-1 rounded">
                  {service.envVar}
                </code>
                {service.configured ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-(--color-text-muted)" />
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 rounded-xl bg-amber-400/5 border border-amber-400/20 p-4">
        <p className="text-sm font-medium text-amber-400 mb-1">
          Running in Mock Mode
        </p>
        <p className="text-xs text-(--color-text-muted)">
          All AI agents return simulated data. Set OPENAI_API_KEY in .env to enable live AI processing.
          The full pipeline will work end-to-end once API keys are configured.
        </p>
      </div>
    </div>
  );
}
