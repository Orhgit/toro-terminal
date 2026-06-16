"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Film,
  Play,
  Camera,
  Type,
  Music,
  Loader2,
  Sparkles,
} from "lucide-react";
import type { ReelScene } from "../data/properties";

interface VideoPreviewProps {
  reelScript: ReelScene[] | null;
  propertyId: string;
  imageUrl?: string;
}

export function VideoPreview({ reelScript, propertyId: _propertyId, imageUrl }: VideoPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeScene, setActiveScene] = useState(0);

  function handleGenerateReel() {
    setIsGenerating(true);
    // Simulate generation — in production this calls the Director + video pipeline
    setTimeout(() => setIsGenerating(false), 3000);
  }

  // No script yet — show generate prompt
  if (!reelScript) {
    return (
      <div className="card p-6 flex flex-col items-center justify-center text-center min-h-[280px]">
        <div className="h-14 w-14 rounded-2xl bg-(--color-brand-muted) flex items-center justify-center mb-4">
          <Film className="h-7 w-7 text-indigo-400" />
        </div>
        <p className="text-sm font-medium text-(--color-text-primary) mb-1">
          No Reel Script Yet
        </p>
        <p className="text-xs text-(--color-text-muted) mb-4 max-w-[240px]">
          AI will generate a 15-second property reel with 3 scenes
        </p>
        <button
          onClick={handleGenerateReel}
          disabled={isGenerating}
          className="btn-primary"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Reel
            </>
          )}
        </button>
      </div>
    );
  }

  const scene = reelScript[activeScene];
  if (!scene) return null;

  const sceneLabels = ["Hook", "Showcase", "CTA"];
  const sceneTimes = ["0-5s", "5-10s", "10-15s"];

  return (
    <div className="card overflow-hidden">
      {/* Video viewport */}
      <div className="relative aspect-[9/16] max-h-[360px] bg-zinc-900 overflow-hidden">
        {/* Background image */}
        {imageUrl && (
          <Image
            src={imageUrl}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover opacity-40"
          />
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        {/* Text overlay preview */}
        <div className="absolute bottom-0 inset-x-0 p-5">
          <p className="text-white text-lg font-bold leading-snug mb-2" dir="rtl">
            {scene.text_overlay}
          </p>
          <div className="flex items-center gap-2">
            <span className="badge bg-white/10 text-white/80">
              <Music className="h-2.5 w-2.5" />
              {scene.audio_vibe}
            </span>
          </div>
        </div>

        {/* Play button */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 flex items-center justify-center cursor-pointer hover:bg-white/20 transition-colors">
            <Play className="h-6 w-6 text-white fill-white mr-[-2px]" />
          </div>
        </div>

        {/* Scene indicator */}
        <div className="absolute top-3 inset-x-3 flex gap-1">
          {reelScript.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i === activeScene
                  ? "bg-white"
                  : i < activeScene
                    ? "bg-white/50"
                    : "bg-white/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Scene timeline */}
      <div className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-(--color-text-primary)">
            Reel Script — 15s
          </span>
          <button
            onClick={handleGenerateReel}
            disabled={isGenerating}
            className="btn-ghost text-[11px] py-1 px-2.5"
          >
            {isGenerating ? (
              <Loader2 className="h-3 w-3 animate-spin" />
            ) : (
              <Sparkles className="h-3 w-3" />
            )}
            Regenerate
          </button>
        </div>

        {reelScript.map((s, i) => (
          <button
            key={i}
            onClick={() => setActiveScene(i)}
            className={`w-full text-right rounded-lg p-3 transition-all border ${
              i === activeScene
                ? "bg-(--color-brand-muted) border-indigo-500/20"
                : "bg-transparent border-transparent hover:bg-(--color-bg-hover)"
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider ${
                    i === activeScene ? "text-indigo-400" : "text-(--color-text-muted)"
                  }`}
                >
                  Scene {i + 1}: {sceneLabels[i]}
                </span>
                <span className="text-[10px] text-(--color-text-muted) font-mono">
                  {sceneTimes[i]}
                </span>
              </div>
            </div>
            <div className="flex items-start gap-2 text-[11px] text-(--color-text-secondary)">
              <Camera className="h-3 w-3 mt-0.5 flex-shrink-0 text-(--color-text-muted)" />
              <span className="line-clamp-2">{s.visual_cue}</span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[11px]">
              <Type className="h-3 w-3 flex-shrink-0 text-(--color-text-muted)" />
              <span className="text-(--color-text-muted)">{s.text_overlay}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
