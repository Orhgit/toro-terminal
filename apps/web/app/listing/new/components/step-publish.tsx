"use client";

/**
 * Step 4 — Publish: title, AI description, contact info, preview, publish button.
 */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useWizard } from "../../../lib/wizard-context";
import { useListingStore } from "../../../lib/listing-context";
import { wizardToListing } from "../../../data/listing-types";
import { FormField, TextInput } from "../../../components/ui/form-field";
import { Sparkles, Phone, User, Send, Loader2 } from "lucide-react";
import { useToast } from "../../../components/ui/toast";

export function StepPublish() {
  const router = useRouter();
  const { formData, updateField, errors, resetWizard, editingId } = useWizard();
  const { addListing, updateListing } = useListingStore();
  const { showToast } = useToast();
  const [aiLoading, setAiLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // ── Generate AI description ───────────────────────────────
  async function generateDescription() {
    setAiLoading(true);
    try {
      const res = await fetch("/api/generate-copy", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: formData.address,
          city: formData.city,
          rooms: formData.rooms,
          sqm: formData.sqm,
          propertyType: formData.type,
          highlights: [
            formData.parking && "חניה",
            formData.elevator && "מעלית",
            formData.balcony && "מרפסת",
          ].filter(Boolean).join(", "),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const text = data.copy || data.description || data.text || "";
        if (text) {
          updateField("description", text);
          // Extract first sentence as hook
          const hook = text.split(/[.!—]/)[0]?.trim() || "";
          if (hook && !formData.hook) updateField("hook", hook);
        }
      }
    } catch {
      showToast("לא הצלחנו ליצור תיאור — נסה לכתוב ידנית", "error");
    } finally {
      setAiLoading(false);
    }
  }

  // ── Publish listing ───────────────────────────────────────
  function handlePublish() {
    setPublishing(true);

    // Auto-generate title if empty
    const finalForm = { ...formData };
    if (!finalForm.title) {
      const typeLabel = finalForm.type === "apartment" ? "דירה" : finalForm.type === "penthouse" ? "פנטהאוז" : finalForm.type === "garden" ? "קוטג'" : "סטודיו";
      finalForm.title = `${typeLabel} ${finalForm.rooms ? finalForm.rooms + " חדרים" : ""} ב${finalForm.address}`;
    }

    if (editingId) {
      // Update existing listing
      const listing = wizardToListing(finalForm);
      updateListing(editingId, { ...listing, id: editingId });
    } else {
      // Create new listing
      const listing = wizardToListing(finalForm);
      addListing(listing);
    }
    resetWizard();
    showToast(editingId ? "הנכס עודכן בהצלחה!" : "הנכס פורסם בהצלחה!");

    setTimeout(() => {
      router.push("/manage");
    }, 800);
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-black text-slate-800 mb-1">פרסום הנכס</h2>
        <p className="text-xs text-slate-400">הוסף תיאור ופרטי קשר לפני הפרסום</p>
      </div>

      {/* Title */}
      <FormField label="כותרת המודעה">
        <TextInput
          placeholder={`דירת ${formData.rooms || ""} חדרים ב${formData.address || "..."}`}
          value={formData.title}
          onChange={(e) => updateField("title", e.target.value)}
        />
        <p className="text-[10px] text-slate-400 mt-1">אם תשאיר ריק, ייווצר כותרת אוטומטית</p>
      </FormField>

      {/* Description + AI */}
      <FormField label="תיאור הנכס">
        <textarea
          value={formData.description}
          onChange={(e) => updateField("description", e.target.value)}
          placeholder="תאר את הנכס — מצב, נוף, שיפוצים, יתרונות..."
          rows={5}
          maxLength={500}
          className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm transition-colors
            focus:outline-none focus:ring-2 focus:ring-indigo-100 focus:border-indigo-400 resize-none"
        />
        <div className="flex justify-between items-center mt-1">
          <span className={`text-[10px] font-medium ${formData.description.length > 450 ? "text-amber-500" : "text-slate-400"}`}>
            {formData.description.length} / 500 תווים
          </span>
          <span className="text-[10px] text-green-500 font-medium">נשמר אוטומטית ✓</span>
        </div>
        <button
          type="button"
          onClick={generateDescription}
          disabled={aiLoading}
          className="mt-2 flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white
            px-4 py-2 rounded-xl text-xs font-bold hover:from-purple-700 hover:to-indigo-700
            transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          {aiLoading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Sparkles className="h-3.5 w-3.5" />
          )}
          {aiLoading ? "יוצר תיאור..." : "צור תיאור עם AI"}
        </button>
      </FormField>

      {/* Hook (one-liner) */}
      <FormField label="משפט שיווקי (שורה אחת)">
        <TextInput
          placeholder="למשל: פנטהאוז מפואר עם נוף לים — 180 מ״ר, גימור יוקרתי"
          value={formData.hook}
          onChange={(e) => updateField("hook", e.target.value)}
        />
      </FormField>

      {/* Contact Info */}
      <div className="border-t border-slate-100 pt-6">
        <h3 className="text-sm font-bold text-slate-700 mb-4">פרטי קשר</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField label="שם איש קשר">
            <div className="relative">
              <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <TextInput
                placeholder="שם מלא"
                value={formData.contactName}
                onChange={(e) => updateField("contactName", e.target.value)}
                className="pr-10"
              />
            </div>
          </FormField>

          <FormField label="טלפון" required error={errors.contactPhone}>
            <div className="relative">
              <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <TextInput
                type="tel"
                placeholder="050-0000000"
                value={formData.contactPhone}
                onChange={(e) => updateField("contactPhone", e.target.value)}
                error={!!errors.contactPhone}
                className="pr-10"
              />
            </div>
          </FormField>
        </div>
      </div>

      {/* Preview Summary */}
      <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
        <h3 className="text-xs font-bold text-slate-500 mb-3">תצוגה מקדימה</h3>
        <div className="flex gap-4">
          {formData.imageUrls[0] && (
            <Image
              src={formData.imageUrls[formData.mainImageIndex] || formData.imageUrls[0]}
              alt="תצוגה מקדימה"
              width={96}
              height={80}
              className="w-24 h-20 rounded-xl object-cover flex-shrink-0"
            />
          )}
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-800 truncate">
              {formData.title || `${formData.type || "נכס"} ב${formData.address || "..."}`}
            </p>
            <p className="text-lg font-black text-blue-900">
              {formData.price ? `₪${(formData.price / 1_000_000).toFixed(1)}M` : "—"}
            </p>
            <p className="text-xs text-slate-400 truncate">
              {formData.rooms} חד׳ · {formData.sqm} מ״ר · {formData.city}
            </p>
          </div>
        </div>
      </div>

      {/* Publish Button */}
      <button
        type="button"
        onClick={handlePublish}
        disabled={publishing || !formData.contactPhone.trim()}
        className="w-full flex items-center justify-center gap-2 bg-green-600 text-white py-3.5 rounded-2xl
          text-sm font-black hover:bg-green-700 transition-all shadow-lg cursor-pointer
          disabled:bg-slate-300 disabled:cursor-default"
      >
        {publishing ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        {publishing ? "מפרסם..." : "פרסם נכס"}
      </button>
    </div>
  );
}
