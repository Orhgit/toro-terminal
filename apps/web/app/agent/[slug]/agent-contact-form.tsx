"use client";

import { useState } from "react";
import { Send, Check } from "lucide-react";

export function AgentContactForm() {
  const [contactForm, setContactForm] = useState({ name: "", phone: "", message: "" });
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => setSent(false), 3000);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <input
        type="text"
        placeholder="שם מלא"
        aria-label="שם מלא"
        value={contactForm.name}
        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
        className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
        required
      />
      <input
        type="tel"
        placeholder="טלפון"
        aria-label="טלפון"
        value={contactForm.phone}
        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
        className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition"
        required
      />
      <textarea
        placeholder="הודעה (אופציונלי)"
        aria-label="הודעה"
        value={contactForm.message}
        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
        rows={3}
        className="w-full rounded-xl border border-indigo-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:border-indigo-400 transition resize-none"
      />
      <button
        type="submit"
        className={`w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-black transition-all shadow-sm cursor-pointer
          ${sent ? "bg-green-500 text-white" : "bg-indigo-600 text-white hover:bg-indigo-700"}`}
      >
        {sent ? (
          <>
            <Check className="h-4 w-4" /> נשלח בהצלחה!
          </>
        ) : (
          <>
            <Send className="h-4 w-4" /> שלח פנייה
          </>
        )}
      </button>
    </form>
  );
}
