"use client";
import Image from "next/image";

export default function PropertyModal({ property, onClose, onShowMap }: { property: any; onClose: () => void; onShowMap: (p: any) => void }) {
  if (!property) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 p-4" onClick={onClose}>
      <div className="relative bg-white w-full max-w-4xl rounded-2xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-4 right-4 bg-black/50 text-white w-10 h-10 rounded-full z-10">✕</button>
        <div className="grid grid-cols-1 md:grid-cols-2 h-[80vh]">
          <div className="relative bg-gray-200">
            <Image
              src={property.image || "https://images.unsplash.com/photo-1564013467402-9fef26628c91?q=80&w=800"}
              alt={property.title || property.address || "נכס"}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="p-8 overflow-y-auto" dir="rtl">
            <h2 className="text-3xl font-bold mb-4">{property.title || "נכס ב-Toro"}</h2>
            <p className="text-2xl text-blue-600 font-bold mb-6">{property.price || "₪3,200,000"}</p>
            <div className="space-y-4 text-gray-600 mb-8">
              <p>📍 {property.address || "רחוב הירקון 12, תל אביב"}</p>
              <p>🛏️ {property.rooms || "4"} חדרים | 📏 {property.sqm || "120"} מ"ר</p>
              <div className="flex gap-2 mt-4 flex-wrap">
                <div className="bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-xl text-xs font-black border border-emerald-100 flex items-center gap-1">🔊 מדד שקט: {property.lifestyle?.quiet || 8}/10</div>
                <div className="bg-indigo-50 text-indigo-700 px-3 py-1.5 rounded-xl text-xs font-black border border-indigo-100 flex items-center gap-1">🎓 חינוך: {property.lifestyle?.education || 7}/10</div>
                <div className="bg-amber-50 text-amber-700 px-3 py-1.5 rounded-xl text-xs font-black border border-amber-100 flex items-center gap-1">🚆 נגישות: {property.lifestyle?.transport || 9}/10</div>
              </div>
              <p className="text-sm">תיאור הנכס: התיאור השיווקי שה-AI ייצר עבור המתווך...</p>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => onShowMap(property)} className="bg-blue-900 text-white p-4 rounded-xl font-bold hover:bg-blue-800 transition">📍 הצג על המפה</button>
              <a href="tel:0500000000" className="bg-green-600 text-white p-4 rounded-xl font-bold text-center hover:bg-green-700 transition">📞 חיוג מהיר</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
