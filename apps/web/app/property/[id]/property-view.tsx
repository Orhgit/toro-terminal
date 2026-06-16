"use client";

/**
 * PropertyView — client-side interactive property page.
 * Receives listing data from the Server Component parent.
 */

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { Listing } from "../../data/listings";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1564013467402-9fef26628c91?q=80&w=800";
import {
  ArrowRight, Bed, Bath, Maximize, Building2, ShieldCheck,
  TrendingUp, Phone, Car, ArrowUpDown, Sun, Play,
  ChevronLeft, ChevronRight, Send, Loader2, X,
} from "lucide-react";

export function PropertyView({ listing }: { listing: Listing }) {
  const router = useRouter();
  const l = listing;
  const [activeImg, setActiveImg] = useState(0);
  const [failedImages, setFailedImages] = useState<Set<number>>(new Set());
  const [showVideo, setShowVideo] = useState(false);
  const [leadName, setLeadName] = useState("");
  const [leadPhone, setLeadPhone] = useState("");
  const [leadSending, setLeadSending] = useState(false);
  const [leadSent, setLeadSent] = useState(false);

  const priceFormatted = `₪${(l.price / 1_000_000).toFixed(1)}M`;
  const pricePerSqm = `₪${Math.round(l.price / l.sqm).toLocaleString("he-IL")}`;
  const isGold = l.promotionLevel === 2;
  const images = l.images?.length > 0 ? l.images : [l.imageUrl];

  function nextImg() { setActiveImg((i) => (i + 1) % images.length); }
  function prevImg() { setActiveImg((i) => (i - 1 + images.length) % images.length); }

  return (
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Top Bar */}
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <button onClick={() => router.push("/")} className="flex items-center gap-2 text-sm font-bold text-gray-600 hover:text-blue-600 transition">
            <ArrowRight className="h-4 w-4" /> חזרה לכל הנכסים
          </button>
          <div className="flex items-center gap-3">
            {isGold && <span className="bg-yellow-400 text-black text-[10px] px-3 py-1 rounded-full font-black">👑 VIP Gold</span>}
            {l.metaSafe && <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-[10px] px-3 py-1 rounded-full font-bold border border-emerald-100"><ShieldCheck className="h-3 w-3" />עסקה בטוחה</span>}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Gallery */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-3 mb-8">
          <div className="lg:col-span-3 relative rounded-3xl overflow-hidden bg-gray-200 aspect-[16/9] group">
            <Image
              src={failedImages.has(activeImg) ? FALLBACK_IMAGE : (images[activeImg] || FALLBACK_IMAGE)}
              alt={`${l.title || l.address} — ${l.city}`}
              fill
              sizes="(max-width: 1024px) 100vw, 75vw"
              priority
              className="object-cover"
              onError={() => setFailedImages((s) => new Set(s).add(activeImg))}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            {images.length > 1 && (<>
              <button onClick={prevImg} aria-label="תמונה קודמת" className="absolute right-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition sm:opacity-0 sm:group-hover:opacity-100"><ChevronRight className="h-5 w-5 text-gray-700" /></button>
              <button onClick={nextImg} aria-label="תמונה הבאה" className="absolute left-4 top-1/2 -translate-y-1/2 h-11 w-11 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-lg hover:bg-white transition sm:opacity-0 sm:group-hover:opacity-100"><ChevronLeft className="h-5 w-5 text-gray-700" /></button>
            </>)}
            <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-full">{activeImg + 1} / {images.length}</div>
            {l.videoUrl && <button onClick={() => setShowVideo(!showVideo)} className="absolute bottom-4 right-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xs font-black px-5 py-2.5 rounded-full shadow-xl flex items-center gap-2 ring-2 ring-white/30"><Play className="h-3.5 w-3.5 fill-white" />{showVideo ? "תמונות" : "סרטון"}</button>}
          </div>
          <div className="hidden lg:flex flex-col gap-3">
            {images.slice(0, 3).map((img, i) => (
              <button key={i} onClick={() => { setActiveImg(i); setShowVideo(false); }} className={`flex-1 relative rounded-2xl overflow-hidden bg-gray-200 border-2 transition ${activeImg === i ? "border-blue-500" : "border-transparent hover:border-gray-300"}`}>
                <Image src={img} alt="" fill sizes="200px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>

        {showVideo && l.videoUrl && (
          <div className="mb-8 rounded-3xl overflow-hidden bg-black shadow-2xl relative">
            <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-5 py-3 bg-gradient-to-b from-black/70 to-transparent">
              <h3 className="text-white text-sm font-bold truncate">{l.title || l.address}</h3>
              <button onClick={() => setShowVideo(false)} className="h-8 w-8 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/40 transition"><X className="h-4 w-4 text-white" /></button>
            </div>
            <video autoPlay loop playsInline controls poster={images[0]} className="w-full aspect-[16/9] object-cover rounded-3xl" src={l.videoUrl} />
          </div>
        )}

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="flex items-center gap-2 text-sm text-gray-400 mb-2"><span>{l.neighborhood}</span><span>·</span><span>{l.city}</span></div>
              <h1 className="text-3xl font-black text-blue-900 mb-2">{l.title || l.address}</h1>
              <p className="text-sm text-gray-400 mb-1">{l.address}, {l.city}</p>
              <p className="text-gray-500 text-sm leading-relaxed">{l.hook}</p>
            </div>

            <div className="flex items-center gap-6 p-5 bg-white rounded-2xl border border-gray-100 shadow-sm">
              <div><p className="text-3xl font-black text-blue-900">{priceFormatted}</p><p className="text-xs text-gray-400 mt-0.5">{pricePerSqm}/מ״ר</p></div>
              {l.underpriced && (<div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-4 py-2 rounded-xl"><TrendingUp className="h-4 w-4 text-amber-600" /><div><p className="text-[10px] font-black text-amber-800">הזדמנות שוק</p><p className="text-[9px] text-amber-600">מתחת לממוצע באזור</p></div></div>)}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <MetricCard icon={<Bed className="h-5 w-5" />} value={`${l.rooms}`} label="חדרים" />
              <MetricCard icon={<Bath className="h-5 w-5" />} value={`${l.bathrooms}`} label="חדרי רחצה" />
              <MetricCard icon={<Maximize className="h-5 w-5" />} value={`${l.sqm} מ״ר`} label="שטח" />
              <MetricCard icon={<Building2 className="h-5 w-5" />} value={l.floor} label="קומה" />
            </div>

            <div>
              <h2 className="text-lg font-black text-blue-900 mb-3">מאפיינים</h2>
              <div className="flex flex-wrap gap-2">
                {l.parking && <Badge icon={<Car className="h-3.5 w-3.5" />} label="חניה" />}
                {l.elevator && <Badge icon={<ArrowUpDown className="h-3.5 w-3.5" />} label="מעלית" />}
                {l.balcony && <Badge icon={<Sun className="h-3.5 w-3.5" />} label="מרפסת" />}
              </div>
            </div>

            {l.lifestyle && (
              <div>
                <h2 className="text-lg font-black text-blue-900 mb-3">מדדי לייף-סטייל</h2>
                <div className="grid grid-cols-3 gap-3">
                  <ScoreBar emoji="🔊" label="שקט" score={l.lifestyle.quiet} color="bg-emerald-500" />
                  <ScoreBar emoji="🎓" label="חינוך" score={l.lifestyle.education} color="bg-blue-500" />
                  <ScoreBar emoji="🚆" label="נגישות" score={l.lifestyle.transport} color="bg-amber-500" />
                </div>
              </div>
            )}
          </div>

          {/* Sidebar CTA */}
          <div>
            <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-6 sticky top-20 space-y-5">
              {isGold && <div className="bg-yellow-400 text-black text-center py-2 rounded-2xl font-black text-xs shadow-sm">👑 נכס VIP — עדיפות בהצגה</div>}
              <div className="text-center"><p className="text-4xl font-black text-blue-900 mb-1">{priceFormatted}</p><p className="text-xs text-gray-400">{l.rooms} חד׳ · {l.sqm} מ״ר · קומה {l.floor}</p></div>
              <div className="border-t border-gray-100 pt-5">
                <h3 className="text-sm font-black text-blue-900 mb-3">צור קשר עם המתווך</h3>
                {leadSent ? (<div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 text-center"><p className="text-sm font-bold text-emerald-700">הפנייה נשלחה בהצלחה!</p></div>) : (
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    setLeadSending(true);
                    try {
                      await fetch("/api/leads", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ name: leadName, phone: leadPhone, propertyId: l.id, propertyAddress: l.address, source: "form" }),
                      });
                    } catch {}
                    setLeadSending(false);
                    setLeadSent(true);
                  }} className="space-y-3">
                    <input type="text" required placeholder="שם מלא" value={leadName} onChange={(e) => setLeadName(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                    <input type="tel" required placeholder="מספר טלפון" value={leadPhone} onChange={(e) => setLeadPhone(e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 transition" />
                    <button type="submit" disabled={leadSending} className="w-full bg-blue-600 text-white py-3.5 rounded-2xl font-black text-sm hover:bg-blue-700 transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-70">
                      {leadSending ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" />שלח פנייה</>}
                    </button>
                  </form>
                )}
              </div>
              <a href={`https://wa.me/9720542498166?text=${encodeURIComponent("היי, אני מעוניין בנכס ב-" + l.address + " שמפורסם ב-Toro")}`} target="_blank" rel="noopener noreferrer" className="block w-full bg-green-500 text-white text-center py-4 rounded-2xl font-black text-sm hover:bg-green-600 transition shadow-lg">WhatsApp לסוכן</a>
              <a href="tel:0500000000" className="flex items-center justify-center gap-2 w-full bg-gray-50 text-gray-700 py-3.5 rounded-2xl font-bold text-sm hover:bg-gray-100 transition border border-gray-100"><Phone className="h-4 w-4" />חיוג ישיר</a>
            </div>
          </div>
        </div>
      </div>

      <footer className="border-t border-gray-100 py-8 mt-16 text-center"><p className="text-xs text-gray-300">Toro AI Platform</p></footer>
    </div>
  );
}

function MetricCard({ icon, value, label }: { icon: React.ReactNode; value: string; label: string }) {
  return (<div className="bg-white rounded-2xl border border-gray-100 p-5 text-center hover:border-blue-200 hover:shadow-sm transition"><div className="text-blue-500 flex justify-center mb-2">{icon}</div><p className="text-lg font-black text-gray-800">{value}</p><p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mt-0.5">{label}</p></div>);
}

function Badge({ icon, label }: { icon?: React.ReactNode; label: string }) {
  return (<span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-2 rounded-xl text-xs font-bold border border-blue-100">{icon}{label}</span>);
}

function ScoreBar({ emoji, label, score, color }: { emoji: string; label: string; score: number; color: string }) {
  return (<div className="bg-white rounded-2xl border border-gray-100 p-4"><div className="flex items-center justify-between mb-2"><span className="text-xs font-bold text-gray-600">{emoji} {label}</span><span className="text-sm font-black text-gray-800">{score}/10</span></div><div className="h-2 bg-gray-100 rounded-full overflow-hidden"><div className={`h-full ${color} rounded-full`} style={{ width: `${score * 10}%` }} /></div></div>);
}
