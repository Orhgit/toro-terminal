"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Terminal, Check, Loader2, AlertTriangle } from "lucide-react";

interface HuntTerminalProps {
  open: boolean;
  onClose: () => void;
}

interface LogEntry {
  agent: string;
  message: string;
  status: "running" | "done" | "warn";
  timestamp: string;
}

// Simulated swarm pipeline — mirrors the real bin/hunt.ts flow
const HUNT_STEPS: { agent: string; message: string; delay: number; status: "done" | "warn" }[] = [
  { agent: "Scout", message: "Scraping yad2 listing...", delay: 1200, status: "done" },
  { agent: "Scout", message: "Page scraped — רחוב סוקולוב 42, רמת גן", delay: 400, status: "done" },
  { agent: "Extractor", message: "Parsing property data from raw text...", delay: 800, status: "done" },
  { agent: "Extractor", message: "Extracted: 4 rooms, 95m², ₪2,750,000", delay: 300, status: "done" },
  { agent: "DataArchitect", message: "Validating extraction...", delay: 600, status: "done" },
  { agent: "DataArchitect", message: "Approved — phone format valid, price sane, status ok", delay: 300, status: "done" },
  { agent: "Vision", message: "Analyzing 2 property images with GPT-4o...", delay: 1400, status: "done" },
  { agent: "Vision", message: "Visual DNA: Modern Renovated · Quality 7/10 · Family cozy", delay: 300, status: "done" },
  { agent: "Copywriter", message: "Generating Hebrew marketing copy...", delay: 900, status: "done" },
  { agent: "CreativeEditor", message: "Hook too generic — requesting revision ↻", delay: 600, status: "warn" },
  { agent: "Copywriter", message: "Revising with editor feedback...", delay: 700, status: "done" },
  { agent: "CreativeEditor", message: 'Approved — "דירת 4 חדרים משופצת בלב רמת גן — צעד מהבורסה"', delay: 300, status: "done" },
  { agent: "Director", message: "Generating 15s Reel script (3 scenes)...", delay: 800, status: "done" },
  { agent: "Director", message: "Script ready: Hook → Showcase → CTA", delay: 200, status: "done" },
  { agent: "Guardian", message: "Running Meta compliance checks...", delay: 600, status: "done" },
  { agent: "Guardian", message: "SAFE — Score 96/100 · No violations detected", delay: 300, status: "done" },
  { agent: "VisualQA", message: "Checking overlay readability (WCAG AA)...", delay: 500, status: "done" },
  { agent: "VisualQA", message: "PASS — Contrast 5.2:1 · Text coverage 14%", delay: 200, status: "done" },
  { agent: "Matchmaker", message: "Scanning 6 leads in CRM...", delay: 900, status: "done" },
  { agent: "Matchmaker", message: "3 matches found (92, 78, 65) — WhatsApp hooks generated", delay: 300, status: "done" },
  { agent: "Dispatcher", message: "Evaluating quality report... score: 95/100", delay: 500, status: "done" },
  { agent: "Dispatcher", message: "AUTO_PUBLISH — briefings sent to graphic designer + social manager", delay: 300, status: "done" },
  { agent: "Linear", message: "Creating marketing task TORO-48...", delay: 400, status: "done" },
  { agent: "System", message: "Hunt complete — property added to pipeline", delay: 200, status: "done" },
];

const AGENT_COLORS: Record<string, string> = {
  Scout: "text-sky-400",
  Extractor: "text-indigo-400",
  DataArchitect: "text-violet-400",
  Vision: "text-pink-400",
  Copywriter: "text-amber-400",
  CreativeEditor: "text-orange-400",
  Director: "text-rose-400",
  Guardian: "text-emerald-400",
  VisualQA: "text-teal-400",
  Matchmaker: "text-cyan-400",
  Dispatcher: "text-purple-400",
  Linear: "text-blue-400",
  System: "text-emerald-300",
};

export function HuntTerminal({ open, onClose }: HuntTerminalProps) {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [currentStep, setCurrentStep] = useState(-1);
  const [urlInput, setUrlInput] = useState("https://www.yad2.co.il/item/xk29m4");
  const [isRunning, setIsRunning] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getTimestamp = useCallback(() => {
    return new Date().toLocaleTimeString("en-IL", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Step through the pipeline
  useEffect(() => {
    if (!isRunning || currentStep < 0 || currentStep >= HUNT_STEPS.length) return;

    const step = HUNT_STEPS[currentStep]!;

    // Add "running" entry
    setLogs((prev) => [
      ...prev,
      { agent: step.agent, message: step.message, status: "running", timestamp: getTimestamp() },
    ]);

    // After delay, mark done and advance
    timeoutRef.current = setTimeout(() => {
      setLogs((prev) =>
        prev.map((log, i) =>
          i === prev.length - 1 ? { ...log, status: step.status } : log
        )
      );

      if (currentStep + 1 < HUNT_STEPS.length) {
        setCurrentStep(currentStep + 1);
      } else {
        setIsRunning(false);
        setIsDone(true);
      }
    }, step.delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [currentStep, isRunning, getTimestamp]);

  function startHunt() {
    if (!urlInput.trim()) return;
    setLogs([]);
    setIsDone(false);
    setIsRunning(true);
    setCurrentStep(0);
  }

  function resetTerminal() {
    setLogs([]);
    setCurrentStep(-1);
    setIsRunning(false);
    setIsDone(false);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 terminal-bg"
        onClick={onClose}
      />

      {/* Terminal window */}
      <div className="relative w-full max-w-3xl animate-fade-in">
        <div className="rounded-2xl bg-[#0c0c10] border border-(--color-border) shadow-2xl shadow-black/50 overflow-hidden">
          {/* Title bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-(--color-border) bg-[#111115]">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <button onClick={onClose} className="h-3 w-3 rounded-full bg-rose-500 hover:bg-rose-400 transition-colors" />
                <div className="h-3 w-3 rounded-full bg-amber-500" />
                <div className="h-3 w-3 rounded-full bg-emerald-500" />
              </div>
              <div className="flex items-center gap-2 text-xs text-(--color-text-muted)">
                <Terminal className="h-3.5 w-3.5" />
                toro hunt
              </div>
            </div>
            <button
              onClick={onClose}
              className="h-6 w-6 rounded-md flex items-center justify-center text-(--color-text-muted) hover:text-(--color-text-primary) hover:bg-(--color-bg-hover) transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* URL input row */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-(--color-border) bg-[#0e0e12]">
            <span className="text-emerald-400 text-sm font-mono font-bold">$</span>
            <span className="text-sm font-mono text-(--color-text-muted)">toro hunt</span>
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              disabled={isRunning}
              className="flex-1 bg-transparent text-sm font-mono text-sky-400 focus:outline-none placeholder:text-(--color-text-muted) disabled:opacity-50"
              placeholder="https://www.yad2.co.il/item/..."
            />
            {!isRunning && !isDone && (
              <button
                onClick={startHunt}
                className="btn-primary text-xs py-1.5 px-4"
              >
                Run
              </button>
            )}
            {isDone && (
              <button
                onClick={resetTerminal}
                className="btn-ghost text-xs py-1.5 px-4"
              >
                New Hunt
              </button>
            )}
          </div>

          {/* Log output */}
          <div
            ref={scrollRef}
            className="h-[420px] overflow-y-auto p-5 font-mono text-[12px] leading-[1.7] space-y-0.5"
          >
            {logs.length === 0 && !isRunning && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Terminal className="h-8 w-8 text-(--color-text-muted) mx-auto mb-3 opacity-30" />
                  <p className="text-sm text-(--color-text-muted)">
                    Paste a Yad2, Facebook, or Madlan URL and hit Run
                  </p>
                  <p className="text-xs text-(--color-text-muted) mt-1 opacity-60">
                    The AI Swarm will scout, analyze, write copy, match leads, and publish
                  </p>
                </div>
              </div>
            )}

            {logs.map((log, i) => (
              <div
                key={i}
                className="terminal-line flex items-start gap-2"
                style={{ animationDelay: `${i * 0.02}s` }}
              >
                {/* Status icon */}
                <span className="mt-[3px] flex-shrink-0">
                  {log.status === "running" ? (
                    <Loader2 className="h-3 w-3 text-(--color-text-muted) animate-spin" />
                  ) : log.status === "warn" ? (
                    <AlertTriangle className="h-3 w-3 text-amber-400" />
                  ) : (
                    <Check className="h-3 w-3 text-emerald-400" />
                  )}
                </span>

                {/* Timestamp */}
                <span className="text-(--color-text-muted) opacity-40 flex-shrink-0">
                  {log.timestamp}
                </span>

                {/* Agent name */}
                <span className={`font-semibold flex-shrink-0 ${AGENT_COLORS[log.agent] ?? "text-(--color-text-secondary)"}`}>
                  [{log.agent}]
                </span>

                {/* Message */}
                <span className={`${
                  log.status === "warn" ? "text-amber-400" : "text-(--color-text-secondary)"
                }`}>
                  {log.message}
                </span>
              </div>
            ))}

            {/* Blinking cursor */}
            {isRunning && (
              <div className="terminal-cursor text-(--color-text-muted)" />
            )}

            {/* Completion summary */}
            {isDone && (
              <div className="mt-4 pt-4 border-t border-(--color-border)">
                <div className="text-emerald-400 font-bold mb-1">
                  ━━━ Hunt Complete ━━━
                </div>
                <div className="text-(--color-text-secondary) space-y-0.5">
                  <p><span className="text-(--color-text-muted)">Property:</span> רחוב סוקולוב 42, רמת גן</p>
                  <p><span className="text-(--color-text-muted)">Price:</span> ₪2,750,000</p>
                  <p><span className="text-(--color-text-muted)">Hook:</span> דירת 4 חדרים משופצת בלב רמת גן — צעד מהבורסה</p>
                  <p><span className="text-(--color-text-muted)">Matches:</span> 3 leads identified</p>
                  <p><span className="text-(--color-text-muted)">Guardian:</span> <span className="text-emerald-400">SAFE 96/100</span></p>
                  <p><span className="text-(--color-text-muted)">Status:</span> <span className="text-emerald-400">Published to Social Queue</span></p>
                </div>
              </div>
            )}
          </div>

          {/* Status bar */}
          <div className="flex items-center justify-between px-5 py-2 border-t border-(--color-border) bg-[#0e0e12] text-[10px] text-(--color-text-muted)">
            <div className="flex items-center gap-4">
              <span>
                {isRunning
                  ? `Agent ${currentStep + 1}/${HUNT_STEPS.length}`
                  : isDone
                    ? `${HUNT_STEPS.length} steps completed`
                    : "Ready"}
              </span>
              {isRunning && (
                <div className="flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse-soft" />
                  <span>Swarm active</span>
                </div>
              )}
            </div>
            <span>Mock Mode · AI Swarm v0.1</span>
          </div>
        </div>
      </div>
    </div>
  );
}
