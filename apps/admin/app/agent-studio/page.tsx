"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  MessageSquare,
  TrendingUp,
  FileText,
  Play,
  CheckCircle2,
  Loader2,
  Shield,
  RotateCcw,
  ChevronLeft,
  Bot,
  Sparkles,
  Clock,
  Users,
  Send,
  Palette,
  Megaphone,
  ArrowLeft,
} from "lucide-react";

// ============================================================
// Types
// ============================================================

type StageStatus = "idle" | "working" | "done" | "error";
type ApprovalStatus = "pending" | "approved" | "dispatching" | "dispatched" | "revision";

interface Stage {
  id: string;
  name: string;
  hebrewName: string;
  icon: React.ComponentType<{ className?: string }>;
  status: StageStatus;
  substeps: SubStep[];
}

interface SubStep {
  label: string;
  done: boolean;
}

interface TelemetryEntry {
  id: number;
  timestamp: string;
  agent: string;
  message: string;
  level: "info" | "success" | "warning" | "thinking";
}

interface Briefing {
  role: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  deliverables: string[];
  priority: string;
  deadline: string;
}

// ============================================================
// Mock telemetry script — simulates SSE stream
// ============================================================

const TELEMETRY_SCRIPT: Omit<TelemetryEntry, "id" | "timestamp">[] = [
  // Stage 1: Lead Genius (0–6)
  { agent: "Lead Genius", message: "WhatsApp webhook received — new message from 052-XXXXXXX", level: "info" },
  { agent: "Lead Genius", message: "Identifying language: Hebrew (mixed English)", level: "thinking" },
  { agent: "Lead Genius", message: "Extracting property type: Penthouse", level: "thinking" },
  { agent: "Lead Genius", message: "Parsing price: \"3.2 מיליון\" → ₪3,200,000", level: "thinking" },
  { agent: "Lead Genius", message: "Phone normalized: 052-4567890", level: "info" },
  { agent: "DataArchitect", message: "Validating extraction — phone format OK, price in range", level: "info" },
  { agent: "DataArchitect", message: "✓ Extraction approved on first pass", level: "success" },
  // Stage 2: Deal Hunter (7–15)
  { agent: "Deal Hunter", message: "Running ROI analysis on property in תל אביב", level: "info" },
  { agent: "Deal Hunter", message: "Checking comparable sales in area (last 6 months)...", level: "thinking" },
  { agent: "Deal Hunter", message: "Area avg: ₪42,000/sqm — this property: ₪38,000/sqm → Below market", level: "thinking" },
  { agent: "Deal Hunter", message: "Estimated rental yield: 3.8% — above city average", level: "info" },
  { agent: "Deal Hunter", message: "Checking Tabu records... property clear, no liens", level: "thinking" },
  { agent: "Vision Agent", message: "Analyzing 3 property images with GPT-4o vision", level: "info" },
  { agent: "Vision Agent", message: "Visual DNA: Modern Mediterranean, quality 8/10", level: "success" },
  { agent: "Deal Hunter", message: "✓ ROI analysis complete — deal is profitable", level: "success" },
  // Stage 3: Notary (15–22)
  { agent: "Copywriter", message: "Generating marketing hook in Hebrew...", level: "info" },
  { agent: "CreativeEditor", message: "Reviewing copy — hook too generic, requesting revision", level: "warning" },
  { agent: "Copywriter", message: "Revising hook with editor feedback...", level: "thinking" },
  { agent: "CreativeEditor", message: "✓ Revised copy approved — stronger emotional hook", level: "success" },
  { agent: "Director", message: "Generating 15s Reel script — 3 scenes", level: "info" },
  { agent: "Director", message: "✓ Script ready: Hook → Showcase → CTA", level: "success" },
  { agent: "Notary", message: "Compiling deal package: property data + marketing suite", level: "info" },
  { agent: "Notary", message: "✓ Deal package assembled", level: "success" },
  // Stage 3 cont: Matchmaker (23–26)
  { agent: "Matchmaker", message: "Scanning 6 leads in database against property profile...", level: "info" },
  { agent: "Matchmaker", message: "Scoring: budget fit (35%), city match (25%), style (25%), rooms (15%)", level: "thinking" },
  { agent: "Matchmaker", message: "3 potential matches found — scores: 92, 78, 65", level: "success" },
  { agent: "Matchmaker", message: "✓ WhatsApp hooks generated for top 3 leads", level: "success" },
];

// Post-approval dispatch telemetry
const DISPATCH_TELEMETRY: Omit<TelemetryEntry, "id" | "timestamp">[] = [
  { agent: "Dispatcher", message: "Evaluating quality report... score: 95/100", level: "info" },
  { agent: "Dispatcher", message: "Decision: AUTO_PUBLISH — all agents approved, score > 90", level: "success" },
  { agent: "Dispatcher", message: "Generating briefing for Graphic Designer...", level: "thinking" },
  { agent: "Dispatcher", message: "Generating briefing for Social Media Manager...", level: "thinking" },
  { agent: "Dispatcher", message: "✓ 2 employee briefings dispatched — urgent priority", level: "success" },
  { agent: "Dispatcher", message: "Property moved to Social Queue — campaign launch in 24h", level: "success" },
];

// Mock briefings
const MOCK_BRIEFINGS: Briefing[] = [
  {
    role: "Graphic Designer",
    icon: Palette,
    title: "Property Card — תל אביב Modern Mediterranean",
    description: "Design visual assets for a Modern Mediterranean property in תל אביב (₪3,200,000). Visual DNA is \"Family cozy\" with strengths: Natural light, Indoor-outdoor flow, Premium finishes. Apply Toro brand watermark on all assets.",
    deliverables: [
      "3x Instagram feed cards (1080x1080) with property overlays",
      "1x Instagram Story template (1080x1920) with swipe-up CTA",
      "1x TikTok/Reel thumbnail matching Scene 1 visual",
      "1x Facebook cover variant (1200x630)",
    ],
    priority: "Urgent",
    deadline: "24 hours",
  },
  {
    role: "Social Media Manager",
    icon: Megaphone,
    title: "Campaign — \"תארו לעצמכם גינה פרטית בלב תל אביב\"",
    description: "Launch the social campaign. The viral hook is ready, 15-second reel script has 3 scenes. Target: Israeli professionals 28-45 in the תל אביב metro area. 3 matched leads are ready for WhatsApp outreach.",
    deliverables: [
      "Schedule Instagram Reel (Sunday 10:00 IST — peak engagement)",
      "Schedule TikTok cross-post (Sunday 12:00 IST)",
      "Create Facebook Marketplace listing with full description",
      "Send WhatsApp broadcast to 3 matched leads",
      "Monitor engagement for 48h and report metrics",
    ],
    priority: "Urgent",
    deadline: "48 hours",
  },
];

// ============================================================
// Sub-components
// ============================================================

function StageCard({ stage, isLast }: { stage: Stage; isLast: boolean }) {
  const Icon = stage.icon;
  const statusConfig = {
    idle: { color: "border-slate-200 bg-(--color-surface)", iconColor: "text-slate-300", glow: "" },
    working: { color: "border-indigo-300 bg-indigo-50/50", iconColor: "text-indigo-500", glow: "stage-active" },
    done: { color: "border-emerald-300 bg-emerald-50/50", iconColor: "text-emerald-500", glow: "" },
    error: { color: "border-red-300 bg-red-50/50", iconColor: "text-red-500", glow: "" },
  };
  const config = statusConfig[stage.status];

  return (
    <div className="flex items-center flex-1">
      <div className={`flex-1 rounded-xl border-2 p-5 transition-all duration-500 ${config.color} ${config.glow}`}>
        <div className="flex items-center gap-3 mb-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
            stage.status === "working" ? "bg-indigo-100"
            : stage.status === "done" ? "bg-emerald-100"
            : "bg-slate-100"
          }`}>
            {stage.status === "working" ? (
              <Loader2 className="h-5 w-5 text-indigo-500 animate-spin" />
            ) : stage.status === "done" ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            ) : (
              <Icon className={`h-5 w-5 ${config.iconColor}`} />
            )}
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900">{stage.name}</p>
            <p className="text-[11px] text-slate-500">{stage.hebrewName}</p>
          </div>
        </div>
        <div className="space-y-1.5">
          {stage.substeps.map((step) => (
            <div key={step.label} className="flex items-center gap-2">
              {step.done ? (
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 flex-shrink-0" />
              ) : stage.status === "working" ? (
                <Loader2 className="h-3.5 w-3.5 text-indigo-400 animate-spin flex-shrink-0" />
              ) : (
                <div className="h-3.5 w-3.5 rounded-full border border-slate-200 flex-shrink-0" />
              )}
              <span className={`text-xs ${step.done ? "text-slate-700" : "text-slate-400"}`}>{step.label}</span>
            </div>
          ))}
        </div>
      </div>
      {!isLast && (
        <div className="mx-3 flex flex-col items-center">
          <div className={`h-0.5 w-8 rounded-full ${stage.status === "done" ? "bg-emerald-300" : "bg-slate-200"} ${stage.status === "working" ? "pipeline-flow" : ""}`} />
          <ChevronLeft className={`h-4 w-4 ${stage.status === "done" ? "text-emerald-400" : "text-slate-300"}`} />
        </div>
      )}
    </div>
  );
}

function TelemetryLog({ entries }: { entries: TelemetryEntry[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [entries.length]);

  const levelConfig = {
    info: { dot: "bg-blue-400", text: "text-slate-400" },
    success: { dot: "bg-emerald-400", text: "text-emerald-400" },
    warning: { dot: "bg-amber-400", text: "text-amber-400" },
    thinking: { dot: "bg-violet-400 status-pulse", text: "text-violet-400 italic" },
  };

  return (
    <div ref={scrollRef} className="h-72 overflow-y-auto rounded-xl border border-(--color-border) bg-slate-900 p-4 font-mono text-xs">
      {entries.length === 0 ? (
        <div className="flex h-full items-center justify-center text-slate-600">
          <Bot className="ml-2 h-4 w-4" />
          Waiting for agent activity...
        </div>
      ) : (
        <div className="space-y-1">
          {entries.map((entry) => {
            const cfg = levelConfig[entry.level];
            return (
              <div key={entry.id} className="flex gap-2 telemetry-enter">
                <span className="text-slate-600 flex-shrink-0">{entry.timestamp}</span>
                <span className={`h-1.5 w-1.5 mt-1.5 rounded-full flex-shrink-0 ${cfg.dot}`} />
                <span className="text-indigo-400 flex-shrink-0">[{entry.agent}]</span>
                <span className={cfg.text}>{entry.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BriefingCard({ briefing }: { briefing: Briefing }) {
  const Icon = briefing.icon;
  return (
    <div className="rounded-lg border border-(--color-border) bg-(--color-surface) p-4 space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-100">
            <Icon className="h-3.5 w-3.5 text-indigo-600" />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-900">{briefing.role}</p>
            <p className="text-[10px] text-slate-400">{briefing.deadline} &middot; {briefing.priority}</p>
          </div>
        </div>
        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
          briefing.priority === "Urgent" ? "bg-red-50 text-red-600 border border-red-200" : "bg-slate-100 text-slate-600"
        }`}>
          {briefing.priority}
        </span>
      </div>
      <p className="text-[11px] font-medium text-slate-700">{briefing.title}</p>
      <p className="text-[11px] text-slate-500 leading-relaxed">{briefing.description}</p>
      <div className="space-y-1">
        {briefing.deliverables.map((d) => (
          <div key={d} className="flex items-start gap-1.5 text-[11px] text-slate-600">
            <ArrowLeft className="h-3 w-3 mt-0.5 flex-shrink-0 text-indigo-400" />
            <span>{d}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionCenter({
  status,
  briefings,
  onApprove,
  onRevision,
}: {
  status: ApprovalStatus;
  briefings: Briefing[];
  onApprove: () => void;
  onRevision: () => void;
}) {
  return (
    <div className={`rounded-xl border-2 p-5 transition-all ${
      status === "dispatched" ? "border-emerald-300 bg-emerald-50/50"
      : status === "dispatching" ? "border-violet-300 bg-violet-50/30 stage-active"
      : status === "approved" ? "border-emerald-300 bg-emerald-50/50"
      : status === "revision" ? "border-amber-300 bg-amber-50/50"
      : "border-indigo-300 bg-indigo-50/30 stage-active"
    }`}>
      <div className="flex items-center gap-3 mb-4">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${
          status === "dispatched" ? "bg-emerald-100"
          : status === "dispatching" ? "bg-violet-100"
          : status === "approved" ? "bg-emerald-100"
          : status === "revision" ? "bg-amber-100"
          : "bg-indigo-100"
        }`}>
          {status === "dispatched" ? <Send className="h-5 w-5 text-emerald-500" />
          : status === "dispatching" ? <Loader2 className="h-5 w-5 text-violet-500 animate-spin" />
          : status === "approved" ? <CheckCircle2 className="h-5 w-5 text-emerald-500" />
          : status === "revision" ? <RotateCcw className="h-5 w-5 text-amber-500" />
          : <Shield className="h-5 w-5 text-indigo-500" />}
        </div>
        <div>
          <p className="text-sm font-bold text-gray-900">
            {status === "dispatched" ? "Dispatched" : status === "dispatching" ? "Dispatching..." : "Review & Approve"}
          </p>
          <p className="text-[11px] text-slate-500">
            {status === "dispatched" ? "Briefings sent — team notified"
            : status === "dispatching" ? "Generating employee briefings..."
            : status === "approved" ? "Approved — dispatching to team"
            : status === "revision" ? "Sent back — agents re-processing"
            : "Agent work complete — awaiting your approval"}
          </p>
        </div>
      </div>

      {status === "pending" && (
        <div className="space-y-3">
          <div className="rounded-lg bg-(--color-surface) border border-(--color-border) p-3 space-y-2">
            <div className="flex items-center gap-2 text-xs">
              <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
              <span className="font-semibold text-slate-700">Quality Report</span>
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[11px]">
              {["DataArchitect", "CreativeEditor (rev.2)", "Vision Agent", "Director", "Matchmaker"].map((a) => (
                <div key={a} className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                  <span className="text-slate-600">{a}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <Users className="h-3 w-3 text-indigo-400" />
              <span className="text-[11px] font-medium text-indigo-600">3 leads matched (92, 78, 65)</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onApprove} className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-gradient-to-l from-emerald-600 to-emerald-500 py-2.5 text-sm font-semibold text-white shadow-md shadow-emerald-500/20 transition-all hover:shadow-lg hover:brightness-110">
              <CheckCircle2 className="h-4 w-4" />
              Approve & Dispatch
            </button>
            <button onClick={onRevision} className="flex items-center justify-center gap-2 rounded-lg border border-amber-300 bg-amber-50 px-5 py-2.5 text-sm font-medium text-amber-700 transition-all hover:bg-amber-100">
              <RotateCcw className="h-4 w-4" />
              Revise
            </button>
          </div>
        </div>
      )}

      {status === "dispatching" && (
        <div className="flex items-center gap-2 text-sm text-violet-700">
          <div className="flex gap-0.5">
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "0ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "150ms" }} />
            <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-bounce" style={{ animationDelay: "300ms" }} />
          </div>
          Generating employee briefings & scheduling social queue...
        </div>
      )}

      {status === "dispatched" && briefings.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Employee Briefings</p>
          {briefings.map((b) => <BriefingCard key={b.role} briefing={b} />)}
        </div>
      )}

      {status === "revision" && (
        <div className="flex items-center gap-2 text-sm text-amber-700">
          <Loader2 className="h-4 w-4 animate-spin" />
          Agents re-processing with your feedback...
        </div>
      )}
    </div>
  );
}

// ============================================================
// Page
// ============================================================

export default function AgentStudioPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [telemetry, setTelemetry] = useState<TelemetryEntry[]>([]);
  const [stages, setStages] = useState<Stage[]>(buildInitialStages());
  const [approval, setApproval] = useState<ApprovalStatus>("pending");
  const [pipelineComplete, setPipelineComplete] = useState(false);
  const [briefings, setBriefings] = useState<Briefing[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const stepRef = useRef(0);

  function buildInitialStages(): Stage[] {
    return [
      {
        id: "lead-genius", name: "Lead Genius", hebrewName: "ניתוח הודעת WhatsApp", icon: MessageSquare, status: "idle",
        substeps: [
          { label: "Parse incoming message", done: false },
          { label: "Extract property data", done: false },
          { label: "DataArchitect validation", done: false },
        ],
      },
      {
        id: "deal-hunter", name: "Deal Hunter", hebrewName: "ניתוח כדאיות עסקה", icon: TrendingUp, status: "idle",
        substeps: [
          { label: "ROI analysis", done: false },
          { label: "Tabu record check", done: false },
          { label: "Vision analysis", done: false },
          { label: "Deal verdict", done: false },
        ],
      },
      {
        id: "notary", name: "Notary", hebrewName: "הכנת חבילת שיווק", icon: FileText, status: "idle",
        substeps: [
          { label: "Marketing copy + editor loop", done: false },
          { label: "Reel script generation", done: false },
          { label: "Deal package assembly", done: false },
          { label: "Lead matching", done: false },
        ],
      },
    ];
  }

  const STEP_ACTIONS: Record<number, () => void> = {
    0: () => updateStage(0, "working"),
    1: () => updateSubstep(0, 0, true),
    3: () => updateSubstep(0, 1, true),
    6: () => { updateSubstep(0, 2, true); updateStage(0, "done"); },
    7: () => updateStage(1, "working"),
    8: () => updateSubstep(1, 0, true),
    11: () => updateSubstep(1, 1, true),
    13: () => updateSubstep(1, 2, true),
    14: () => { updateSubstep(1, 3, true); updateStage(1, "done"); },
    15: () => updateStage(2, "working"),
    18: () => updateSubstep(2, 0, true),
    20: () => updateSubstep(2, 1, true),
    22: () => updateSubstep(2, 2, true),
    25: () => { updateSubstep(2, 3, true); updateStage(2, "done"); },
  };

  function updateStage(idx: number, status: StageStatus) {
    setStages((prev) => prev.map((s, i) => (i === idx ? { ...s, status } : s)));
  }
  function updateSubstep(stageIdx: number, subIdx: number, done: boolean) {
    setStages((prev) =>
      prev.map((s, i) =>
        i === stageIdx ? { ...s, substeps: s.substeps.map((sub, j) => (j === subIdx ? { ...sub, done } : sub)) } : s
      )
    );
  }

  function addTelemetryEntry(entry: Omit<TelemetryEntry, "id" | "timestamp">, id: number) {
    const now = new Date();
    const ts = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
    setTelemetry((prev) => [...prev, { ...entry, id, timestamp: ts }]);
  }

  const runPipeline = useCallback(() => {
    setIsRunning(true);
    setPipelineComplete(false);
    setApproval("pending");
    setTelemetry([]);
    setBriefings([]);
    setStages(buildInitialStages());
    stepRef.current = 0;

    intervalRef.current = setInterval(() => {
      const step = stepRef.current;
      if (step >= TELEMETRY_SCRIPT.length) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        setIsRunning(false);
        setPipelineComplete(true);
        return;
      }
      addTelemetryEntry(TELEMETRY_SCRIPT[step]!, step);
      STEP_ACTIONS[step]?.();
      stepRef.current++;
    }, 550);
    // STEP_ACTIONS is defined inside the component but is stable across renders;
    // including it in deps would re-create the interval each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  function handleApprove() {
    setApproval("dispatching");

    // Run dispatch telemetry
    let dispatchStep = 0;
    const baseId = TELEMETRY_SCRIPT.length;
    const dispatchInterval = setInterval(() => {
      if (dispatchStep >= DISPATCH_TELEMETRY.length) {
        clearInterval(dispatchInterval);
        setBriefings(MOCK_BRIEFINGS);
        setApproval("dispatched");
        return;
      }
      addTelemetryEntry(DISPATCH_TELEMETRY[dispatchStep]!, baseId + dispatchStep);
      dispatchStep++;
    }, 600);
  }

  function handleRevision() {
    setApproval("revision");
    setTimeout(() => setApproval("pending"), 3000);
  }

  const completedStages = stages.filter((s) => s.status === "done").length;

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agent Studio</h1>
          <p className="mt-1 text-sm text-slate-500">Swarm Process Map — watch your AI team handle the deal</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-6">
            <div className="text-left">
              <p className="text-2xl font-bold text-gray-900">{completedStages}/3</p>
              <p className="text-xs text-slate-400">Stages</p>
            </div>
            <div className="text-left">
              <p className="text-2xl font-bold text-indigo-500">{telemetry.length}</p>
              <p className="text-xs text-slate-400">Events</p>
            </div>
          </div>
          <button onClick={runPipeline} disabled={isRunning}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-l from-indigo-600 to-violet-600 px-6 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:shadow-lg hover:brightness-110 disabled:opacity-50">
            {isRunning ? <><Loader2 className="h-4 w-4 animate-spin" />Running...</> : <><Play className="h-4 w-4" />Run Demo Pipeline</>}
          </button>
        </div>
      </div>

      {/* Process Map */}
      <div className="mb-6">
        <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Process Map</h2>
        <div className="flex items-stretch gap-0">
          {stages.map((stage, i) => <StageCard key={stage.id} stage={stage} isLast={i === stages.length - 1} />)}
        </div>
      </div>

      {/* Bottom: Telemetry + Action Center */}
      <div className="grid grid-cols-5 gap-6">
        <div className="col-span-3">
          <div className="flex items-center justify-between mb-3">
            <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Clock className="h-3.5 w-3.5" />Live Telemetry
            </h2>
            {(isRunning || approval === "dispatching") && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-red-50 border border-red-200 px-2.5 py-0.5 text-[10px] font-semibold text-red-600">
                <span className="h-1.5 w-1.5 rounded-full bg-red-500 status-pulse" />LIVE
              </span>
            )}
          </div>
          <TelemetryLog entries={telemetry} />
        </div>
        <div className="col-span-2">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Action Center</h2>
          {pipelineComplete ? (
            <ActionCenter status={approval} briefings={briefings} onApprove={handleApprove} onRevision={handleRevision} />
          ) : (
            <div className="flex h-72 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50/50 text-center">
              <Bot className="mb-3 h-10 w-10 text-slate-300" />
              <p className="text-sm font-semibold text-slate-500">{isRunning ? "Agents working..." : "Run the pipeline"}</p>
              <p className="mt-1 max-w-[200px] text-xs text-slate-400">
                {isRunning ? "Review will be available once all stages complete" : "Click 'Run Demo Pipeline' to see the AI swarm in action"}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
