"use client";

import { useState } from "react";
import {
  Brain,
  Database,
  MessageSquare,
  GitBranch,
  Eye,
  EyeOff,
  Power,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Save,
  Shield,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

interface ServiceStatus {
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  status: "live" | "mock" | "pending" | "disconnected";
  description: string;
}

interface EnvVar {
  key: string;
  label: string;
  placeholder: string;
  required: boolean;
}

const STATUS_STYLES = {
  live: {
    dot: "bg-emerald-400",
    badge: "bg-emerald-50 text-emerald-700 border-emerald-200",
    label: "Live",
  },
  mock: {
    dot: "bg-amber-400 status-pulse",
    badge: "bg-amber-50 text-amber-700 border-amber-200",
    label: "Mock",
  },
  pending: {
    dot: "bg-blue-400 status-pulse",
    badge: "bg-blue-50 text-blue-700 border-blue-200",
    label: "Pending",
  },
  disconnected: {
    dot: "bg-red-400",
    badge: "bg-red-50 text-red-700 border-red-200",
    label: "Disconnected",
  },
};

// ============================================================
// Data
// ============================================================

const ENV_VARS: EnvVar[] = [
  { key: "OPENAI_API_KEY", label: "OpenAI API Key", placeholder: "sk-...", required: true },
  { key: "SUPABASE_URL", label: "Supabase URL", placeholder: "https://xxxx.supabase.co", required: true },
  { key: "SUPABASE_ANON_KEY", label: "Supabase Anon Key", placeholder: "eyJ...", required: true },
  { key: "SUPABASE_SERVICE_ROLE_KEY", label: "Supabase Service Role Key", placeholder: "eyJ...", required: false },
  { key: "LINEAR_API_KEY", label: "Linear API Key", placeholder: "lin_api_...", required: false },
  { key: "LINEAR_TEAM_ID", label: "Linear Team ID", placeholder: "UUID", required: false },
  { key: "WHATSAPP_VERIFY_TOKEN", label: "WhatsApp Verify Token", placeholder: "your-verify-token", required: false },
];

// ============================================================
// Component
// ============================================================

export default function SettingsPage() {
  const [mockMode, setMockMode] = useState(true);
  const [envValues, setEnvValues] = useState<Record<string, string>>({});
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const services: ServiceStatus[] = [
    {
      name: "OpenAI GPT-4o",
      icon: Brain,
      status: mockMode ? "mock" : envValues.OPENAI_API_KEY ? "live" : "disconnected",
      description: mockMode
        ? "AI Swarm running in simulation mode"
        : envValues.OPENAI_API_KEY
          ? "Connected — Extractor, Vision, Copywriter, Director, Matchmaker active"
          : "Missing OPENAI_API_KEY — add it below",
    },
    {
      name: "Supabase Database",
      icon: Database,
      status: envValues.SUPABASE_URL ? "live" : "mock",
      description: envValues.SUPABASE_URL
        ? `Connected to ${envValues.SUPABASE_URL.slice(0, 30)}...`
        : "Using local mock data",
    },
    {
      name: "WhatsApp Webhook",
      icon: MessageSquare,
      status: envValues.WHATSAPP_VERIFY_TOKEN ? "pending" : "disconnected",
      description: envValues.WHATSAPP_VERIFY_TOKEN
        ? "Token set — awaiting Meta verification callback"
        : "Configure verify token to activate",
    },
    {
      name: "Linear Sync",
      icon: GitBranch,
      status: envValues.LINEAR_API_KEY ? "live" : "mock",
      description: envValues.LINEAR_API_KEY
        ? "Connected — marketing tasks auto-dispatch enabled"
        : "Mock mode — tasks logged locally",
    },
  ];

  function toggleKeyVisibility(key: string) {
    setVisibleKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function handleEnvChange(key: string, value: string) {
    setEnvValues((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  }

  async function handleSave() {
    setSaving(true);
    // Simulate save to config.json — in production this would hit a secure backend
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
  }

  const liveCount = services.filter((s) => s.status === "live").length;

  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">System Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Configure API connections and control the AI swarm
        </p>
      </div>

      {/* Master Toggle */}
      <div className="mb-8 rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
              mockMode
                ? "bg-amber-100"
                : "bg-gradient-to-br from-emerald-500 to-emerald-600"
            }`}>
              <Power className={`h-6 w-6 ${mockMode ? "text-amber-600" : "text-white"}`} />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">
                {mockMode ? "Mock Mode Active" : "Live Mode Active"}
              </h2>
              <p className="text-sm text-slate-500">
                {mockMode
                  ? "AI agents return simulated data — no API calls made"
                  : "All agents hitting real APIs — costs apply"}
              </p>
            </div>
          </div>
          <button
            onClick={() => setMockMode(!mockMode)}
            className={`relative h-8 w-14 rounded-full transition-colors duration-200 ${
              mockMode ? "bg-slate-300" : "bg-emerald-500"
            }`}
          >
            <span
              className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-all duration-200 ${
                mockMode ? "right-7" : "right-1"
              }`}
            />
          </button>
        </div>
      </div>

      {/* API Connectivity Dashboard */}
      <div className="mb-8">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-400">
          API Connectivity — {liveCount}/{services.length} Live
        </h2>
        <div className="grid grid-cols-2 gap-4">
          {services.map((service) => {
            const style = STATUS_STYLES[service.status];
            const Icon = service.icon;
            return (
              <div
                key={service.name}
                className="rounded-xl border border-(--color-border) bg-(--color-surface) p-5 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-slate-400" />
                    <span className="text-sm font-semibold text-gray-900">{service.name}</span>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${style.badge}`}>
                    <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
                    {style.label}
                  </span>
                </div>
                <p className="mt-2 text-xs text-slate-500 leading-relaxed">{service.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Environment Variable Manager */}
      <div className="rounded-xl border border-(--color-border) bg-(--color-surface) p-6 shadow-sm">
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400">
              Environment Variables
            </h2>
          </div>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-lg bg-(--color-brand) px-4 py-2 text-xs font-medium text-white transition-all hover:bg-(--color-brand-hover) disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : saved ? (
              <CheckCircle2 className="h-3.5 w-3.5" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            {saving ? "Saving..." : saved ? "Saved" : "Save Config"}
          </button>
        </div>

        <div className="space-y-3">
          {ENV_VARS.map((envVar) => {
            const isVisible = visibleKeys.has(envVar.key);
            const value = envValues[envVar.key] ?? "";
            return (
              <div key={envVar.key} className="flex items-center gap-3">
                <div className="w-56 flex-shrink-0">
                  <label className="text-xs font-medium text-slate-700">
                    {envVar.label}
                    {envVar.required && (
                      <span className="mr-1 text-red-400">*</span>
                    )}
                  </label>
                </div>
                <div className="relative flex-1">
                  <input
                    type={isVisible ? "text" : "password"}
                    value={value}
                    onChange={(e) => handleEnvChange(envVar.key, e.target.value)}
                    placeholder={envVar.placeholder}
                    className="w-full rounded-lg border border-(--color-border) bg-(--color-surface-alt) px-3 py-2 font-mono text-xs text-slate-700 placeholder:text-slate-300 focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                  />
                </div>
                <button
                  onClick={() => toggleKeyVisibility(envVar.key)}
                  className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-(--color-surface-alt) hover:text-slate-600"
                >
                  {isVisible ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
                <div className="w-5 flex-shrink-0">
                  {value ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                  ) : envVar.required ? (
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-[11px] text-slate-400">
          Values are stored locally for development. In production, use Vercel / Railway environment variables.
        </p>
      </div>
    </div>
  );
}
