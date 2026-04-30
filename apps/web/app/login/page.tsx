"use client";

/**
 * /login — Premium login & signup page.
 * Split screen: animated hero + polished form with social login.
 */

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Building2, Eye, EyeOff, Loader2, Mail, Lock, User,
  Briefcase, ArrowLeft, CheckCircle2, Sparkles, Shield,
  BarChart3, Zap, Phone,
} from "lucide-react";

const HERO_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200",
];

const FEATURES = [
  { icon: Sparkles, text: "AI שמייצר מודעות ותיאורים אוטומטית" },
  { icon: BarChart3, text: "דוחות ביצועים ואנליטיקס בזמן אמת" },
  { icon: Shield, text: "חתימה דיגיטלית על הסכמי בלעדיות" },
  { icon: Zap, text: "צייד נכסים — התראות על התאמות חדשות" },
];

export default function LoginPage() {
  const router = useRouter();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [agencyName, setAgencyName] = useState("");
  const [phone, setPhone] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [heroIndex, setHeroIndex] = useState(0);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Rotate hero images
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((i) => (i + 1) % HERO_IMAGES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    // Validation
    if (!email.trim()) { setError("יש להזין כתובת אימייל"); return; }
    if (!password || password.length < 8) { setError("סיסמה חייבת להכיל לפחות 8 תווים"); return; }
    if (isSignUp && !fullName.trim()) { setError("יש להזין שם מלא"); return; }
    if (isSignUp && !agreedToTerms) { setError("יש לאשר את תנאי השימוש"); return; }

    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "שגיאה בהתחברות"); setIsLoading(false); return; }

      const searchParams = new URLSearchParams(window.location.search);
      const redirect = searchParams.get("redirect");
      const safeRedirect = redirect && redirect.startsWith("/") && !redirect.startsWith("//") ? redirect : null;
      router.push(safeRedirect || data.redirectTo || "/manage");
    } catch {
      setError("שגיאת תקשורת — נסה שוב");
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row" dir="rtl">
      {/* ── Left: Animated Hero ──────────────────────────────── */}
      <div className="relative hidden lg:flex lg:w-[55%] overflow-hidden bg-indigo-950">
        {/* Background images with crossfade */}
        {HERO_IMAGES.map((src, i) => (
          <img
            key={src}
            src={src}
            alt=""
            className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ${i === heroIndex ? "opacity-100" : "opacity-0"}`}
          />
        ))}
        <div className="absolute inset-0 bg-gradient-to-l from-indigo-950/90 via-indigo-950/60 to-indigo-950/30" />

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />

        {/* Hero content */}
        <div className="relative z-10 flex flex-col justify-between h-full p-12">
          {/* Top — Logo */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-white font-black text-lg">Toro</p>
              <p className="text-white/40 text-[10px]">Real Estate AI Platform</p>
            </div>
          </div>

          {/* Middle — Main headline */}
          <div className="max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 mb-6 border border-white/10">
              <Sparkles className="h-3.5 w-3.5 text-yellow-400" />
              <span className="text-white/80 text-xs font-bold">הפלטפורמה #1 לנדל"ן בישראל</span>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.15] mb-4">
              נהל את הנכסים שלך
              <br />
              <span className="bg-gradient-to-l from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                עם כוח של AI
              </span>
            </h1>
            <p className="text-white/50 text-sm leading-relaxed max-w-md">
              מייצר מודעות, מתאים קונים, מנהל לידים, ויוצר הסכמי בלעדיות — הכל ממקום אחד.
            </p>
          </div>

          {/* Bottom — Features + Stats */}
          <div>
            {/* Feature list */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              {FEATURES.map((f) => (
                <div key={f.text} className="flex items-center gap-2.5 bg-white/5 backdrop-blur-sm rounded-xl px-3 py-2.5 border border-white/5">
                  <f.icon className="h-4 w-4 text-indigo-400 flex-shrink-0" />
                  <span className="text-white/70 text-[11px] font-medium">{f.text}</span>
                </div>
              ))}
            </div>

            {/* Stats bar */}
            <div className="flex items-center gap-8 bg-white/5 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/10">
              <div className="text-center">
                <p className="text-2xl font-black text-white">61+</p>
                <p className="text-[10px] text-white/40">נכסים פעילים</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-white">30+</p>
                <p className="text-[10px] text-white/40">ערים</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-white">98%</p>
                <p className="text-[10px] text-white/40">שביעות רצון</p>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div className="text-center">
                <p className="text-2xl font-black text-white">24/7</p>
                <p className="text-[10px] text-white/40">AI פעיל</p>
              </div>
            </div>

            {/* Image dots */}
            <div className="flex gap-2 mt-4 justify-center">
              {HERO_IMAGES.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setHeroIndex(i)}
                  className={`h-1.5 rounded-full transition-all cursor-pointer ${i === heroIndex ? "w-6 bg-white" : "w-1.5 bg-white/30"}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right: Form ──────────────────────────────────────── */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 bg-white min-h-screen lg:min-h-0">
        <div className="w-full max-w-[420px]">
          {/* Mobile hero */}
          <div className="lg:hidden mb-6">
            <div className="relative rounded-3xl overflow-hidden h-40 mb-6">
              <img src={HERO_IMAGES[0]} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/80 to-transparent" />
              <div className="absolute bottom-4 right-4 left-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-lg bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Building2 className="h-4 w-4 text-white" />
                  </div>
                  <div>
                    <p className="text-white font-black text-sm">Toro</p>
                    <p className="text-white/60 text-[9px]">Real Estate AI</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop brand (hidden on mobile — shown in hero) */}
          <div className="hidden lg:flex items-center gap-3 mb-8">
            <Link href="/" className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition">
              <ArrowLeft className="h-3 w-3" /> חזרה לאתר
            </Link>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-black text-slate-800 mb-1">
            {isSignUp ? "צור חשבון חדש" : "ברוך הבא בחזרה"}
          </h1>
          <p className="text-sm text-slate-400 mb-7">
            {isSignUp
              ? "הצטרף למאות סוכנים שכבר משתמשים ב-Toro"
              : "הנכסים, הלידים והדוחות שלך מחכים לך"
            }
          </p>

          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-4 py-3 mb-5 animate-scaleIn">
              <p className="text-xs font-bold text-red-600">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full name — signup */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">שם מלא</label>
                <div className="relative">
                  <User className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="ישראל ישראלי"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                  />
                </div>
              </div>
            )}

            {/* Agency name — signup */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">שם המשרד</label>
                <div className="relative">
                  <Briefcase className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="text"
                    value={agencyName}
                    onChange={(e) => setAgencyName(e.target.value)}
                    placeholder="מרכז הנכסים נתניה"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                  />
                </div>
              </div>
            )}

            {/* Phone — signup */}
            {isSignUp && (
              <div>
                <label className="block text-[11px] font-bold text-slate-500 mb-1.5">טלפון</label>
                <div className="relative">
                  <Phone className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="050-0000000"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                    dir="ltr"
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">אימייל</label>
              <div className="relative">
                <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); setError(""); }}
                  placeholder="agent@agency.co.il"
                  autoComplete="email"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-4 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                  dir="ltr"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-500 mb-1.5">סיסמה</label>
              <div className="relative">
                <Lock className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(""); }}
                  placeholder="לפחות 6 תווים"
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pr-10 pl-12 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer p-1"
                  aria-label={showPassword ? "הסתר סיסמה" : "הצג סיסמה"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Password strength indicator — signup only */}
              {isSignUp && password.length > 0 && (
                <div className="mt-2 space-y-1.5">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => {
                      const strength = (password.length >= 6 ? 1 : 0) + (password.length >= 8 ? 1 : 0) + (/[A-Z]/.test(password) ? 1 : 0) + (/\d/.test(password) ? 1 : 0);
                      const colors = ["bg-red-400", "bg-amber-400", "bg-yellow-400", "bg-green-500"];
                      return <div key={level} className={`h-1 flex-1 rounded-full transition-colors ${level <= strength ? colors[strength - 1] : "bg-slate-100"}`} />;
                    })}
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1">
                    <span className={`text-[10px] flex items-center gap-1 ${password.length >= 6 ? "text-green-600" : "text-slate-400"}`}>
                      <CheckCircle2 className="h-3 w-3" /> 6+ תווים
                    </span>
                    <span className={`text-[10px] flex items-center gap-1 ${/[A-Z]/.test(password) ? "text-green-600" : "text-slate-400"}`}>
                      <CheckCircle2 className="h-3 w-3" /> אות גדולה
                    </span>
                    <span className={`text-[10px] flex items-center gap-1 ${/\d/.test(password) ? "text-green-600" : "text-slate-400"}`}>
                      <CheckCircle2 className="h-3 w-3" /> מספר
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Forgot password — login only */}
            {!isSignUp && (
              <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" className="h-3.5 w-3.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                  <span className="text-[11px] text-slate-500">זכור אותי</span>
                </label>
                <button type="button" className="text-[11px] text-indigo-600 font-bold hover:underline cursor-pointer">
                  שכחת סיסמה?
                </button>
              </div>
            )}

            {/* Terms checkbox — signup only */}
            {isSignUp && (
              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="h-4 w-4 mt-0.5 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-[11px] text-slate-500 leading-relaxed">
                  אני מסכים/ה ל<Link href="/terms" className="text-indigo-600 font-bold hover:underline">תנאי השימוש</Link> ול<Link href="/privacy" className="text-indigo-600 font-bold hover:underline">מדיניות הפרטיות</Link>
                </span>
              </label>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-l from-indigo-600 to-indigo-700 text-white py-4 rounded-2xl font-black text-sm
                hover:from-indigo-500 hover:to-indigo-600 transition-all shadow-lg shadow-indigo-200/50
                disabled:opacity-60 disabled:cursor-default cursor-pointer active:scale-[0.99]"
            >
              {isLoading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> {isSignUp ? "יוצר חשבון..." : "מתחבר..."}</>
              ) : isSignUp ? (
                <><Sparkles className="h-4 w-4" /> צור חשבון והתחל</>
              ) : (
                <><ArrowLeft className="h-4 w-4" /> כניסה למערכת</>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-slate-100" />
            <span className="text-[10px] text-slate-300 font-medium">או התחבר עם</span>
            <div className="flex-1 h-px bg-slate-100" />
          </div>

          {/* Social login buttons */}
          <div className="flex gap-3">
            <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              <svg className="h-4 w-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
              Google
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 bg-white border border-slate-200 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
              Facebook
            </button>
          </div>

          {/* Toggle */}
          <p className="text-center text-sm text-slate-500 mt-6">
            {isSignUp ? "כבר יש לך חשבון?" : "אין לך חשבון?"}{" "}
            <button
              onClick={() => { setIsSignUp(!isSignUp); setError(""); }}
              className="text-indigo-600 font-bold hover:underline cursor-pointer"
            >
              {isSignUp ? "התחבר" : "הרשם בחינם"}
            </button>
          </p>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t border-slate-50 text-center">
            <p className="text-[10px] text-slate-300">
              Toro AI Platform &copy; {new Date().getFullYear()} · <Link href="/terms" className="hover:text-slate-500">תנאי שימוש</Link> · <Link href="/privacy" className="hover:text-slate-500">פרטיות</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
