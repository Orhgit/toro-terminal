"use client";

/**
 * Step 3 — Media: image upload (drag & drop + URL) + main image selection + video.
 */

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useWizard } from "../../../lib/wizard-context";
import { FormField, TextInput } from "../../../components/ui/form-field";
import { ImagePlus, Star, Trash2, Video, Upload, Link as LinkIcon } from "lucide-react";

export function StepMedia() {
  const { formData, updateField, errors } = useWizard();
  const [newUrl, setNewUrl] = useState("");
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  function addImageUrl(url: string) {
    if (!url.trim()) return;
    updateField("imageUrls", [...formData.imageUrls, url.trim()]);
  }

  function addImageFromUrl() {
    addImageUrl(newUrl);
    setNewUrl("");
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const url = URL.createObjectURL(file);
      addImageUrl(url);
    });
  }

  function removeImage(index: number) {
    const next = formData.imageUrls.filter((_, i) => i !== index);
    updateField("imageUrls", next);
    if (formData.mainImageIndex >= next.length) {
      updateField("mainImageIndex", Math.max(0, next.length - 1));
    }
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [formData.imageUrls]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-1">תמונות וסרטון</h2>
        <p className="text-xs text-slate-400">הוסף תמונות של הנכס (לפחות תמונה אחת) <span className="text-red-500">*</span></p>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode("upload")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer
            ${mode === "upload" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}
        >
          <Upload className="h-3.5 w-3.5" /> העלאת קבצים
        </button>
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer
            ${mode === "url" ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}
        >
          <LinkIcon className="h-3.5 w-3.5" /> הדבקת קישור
        </button>
      </div>

      {/* Upload mode — drag & drop */}
      {mode === "upload" && (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all
            ${dragging
              ? "border-indigo-400 bg-indigo-50"
              : errors.images && formData.imageUrls.length === 0
                ? "border-red-300 bg-red-50"
                : "border-slate-200 bg-slate-50 hover:border-indigo-300 hover:bg-indigo-50/50"
            }`}
        >
          <Upload className={`h-8 w-8 mx-auto mb-3 ${dragging ? "text-indigo-500" : "text-slate-300"}`} />
          <p className="text-sm font-bold text-slate-600">
            {dragging ? "שחרר כאן..." : "גרור תמונות לכאן"}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">או לחץ לבחירת קבצים · JPG, PNG, WebP</p>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>
      )}

      {/* URL mode */}
      {mode === "url" && (
        <FormField label="הוסף תמונה (URL)" error={errors.images}>
          <div className="flex gap-2">
            <TextInput
              placeholder="https://images.unsplash.com/..."
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addImageFromUrl(); } }}
              error={!!errors.images && formData.imageUrls.length === 0}
            />
            <button
              type="button"
              onClick={addImageFromUrl}
              disabled={!newUrl.trim()}
              className="flex-shrink-0 bg-indigo-600 text-white px-4 py-2.5 rounded-xl text-sm font-bold
                hover:bg-indigo-700 transition-all disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer disabled:cursor-default"
            >
              <ImagePlus className="h-4 w-4" />
            </button>
          </div>
        </FormField>
      )}

      {/* Error message */}
      {errors.images && formData.imageUrls.length === 0 && (
        <p className="text-[11px] text-red-500 font-medium">{errors.images}</p>
      )}

      {/* Image Gallery */}
      {formData.imageUrls.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 animate-fadeIn">
          {formData.imageUrls.map((url, i) => {
            const isMain = i === formData.mainImageIndex;
            return (
              <div
                key={`${url}-${i}`}
                className={`relative group rounded-2xl overflow-hidden border-2 transition-all aspect-[4/3]
                  ${isMain ? "border-yellow-400 ring-2 ring-yellow-200" : "border-slate-200 hover:border-slate-300"}`}
              >
                <Image
                  src={url}
                  alt={`תמונה ${i + 1}`}
                  fill
                  sizes="(max-width: 768px) 50vw, 25vw"
                  className="object-cover"
                />

                {isMain && (
                  <span className="absolute top-2 right-2 bg-yellow-400 text-black text-[10px] px-2 py-0.5 rounded-full font-black flex items-center gap-1">
                    <Star className="h-3 w-3" /> ראשית
                  </span>
                )}

                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  {!isMain && (
                    <button
                      type="button"
                      onClick={() => updateField("mainImageIndex", i)}
                      className="bg-yellow-400 text-black p-2 rounded-full text-[10px] font-bold cursor-pointer"
                      title="הגדר כתמונה ראשית"
                    >
                      <Star className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="bg-red-500 text-white p-2 rounded-full cursor-pointer"
                    title="הסר תמונה"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <p className="text-[11px] text-slate-400">
        {formData.imageUrls.length} תמונות · לחץ על ⭐ להגדרת תמונה ראשית
      </p>

      {/* Video URL */}
      <FormField label="סרטון (אופציונלי)">
        <div className="relative">
          <Video className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <TextInput
            placeholder="קישור ל-YouTube או סרטון..."
            value={formData.videoUrl}
            onChange={(e) => updateField("videoUrl", e.target.value)}
            className="pr-10"
          />
        </div>
      </FormField>
    </div>
  );
}
