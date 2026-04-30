/**
 * /agent/[slug] — Server Component agent landing page.
 * SSG via generateStaticParams + dynamic generateMetadata + RealEstateAgent JSON-LD.
 */

import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  MessageSquare,
  Mail,
  MapPin,
  Building2,
  Star,
  ArrowRight,
} from "lucide-react";
import { AGENTS, getAgentBySlug } from "../../data/agent-types";
import { LISTINGS } from "../../data/listings";
import { PropertyCard } from "../../components/property-card";
import { AgentContactForm } from "./agent-contact-form";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://toro.co.il";

interface Props {
  params: Promise<{ slug: string }>;
}

// ISR — see (seo)/properties/[city]/page.tsx for rationale.
export const revalidate = 3600;

// ── Static generation for all agents ────────────────────────
export async function generateStaticParams() {
  return AGENTS.map((a) => ({ slug: a.slug }));
}

// ── Dynamic metadata per agent ──────────────────────────────
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) {
    return { title: "סוכן לא נמצא | Toro" };
  }

  const title = `${agent.name} — ${agent.agency} | סוכן נדל״ן ב${agent.city}`;
  const description = `${agent.bio.slice(0, 155)}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "profile",
      locale: "he_IL",
      images: agent.coverImage
        ? [{ url: agent.coverImage, width: 1200, height: 630, alt: agent.name }]
        : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
    alternates: {
      canonical: `/agent/${agent.slug}`,
    },
  };
}

// ── Page (Server Component) ─────────────────────────────────
export default async function AgentPage({ params }: Props) {
  const { slug } = await params;
  const agent = getAgentBySlug(slug);

  if (!agent) notFound();

  const listings = LISTINGS.slice(0, 9);
  const phoneIntl = `+972${agent.phone.replace(/-/g, "").replace(/^0/, "")}`;
  const whatsappLink = `https://wa.me/972${agent.whatsapp.replace(/-/g, "").replace(/^0/, "")}`;

  // RealEstateAgent JSON-LD — Google rich results for agent profiles.
  const agentLd = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    name: agent.name,
    url: `${BASE_URL}/agent/${agent.slug}`,
    image: agent.coverImage,
    description: agent.bio,
    telephone: phoneIntl,
    email: agent.email,
    areaServed: { "@type": "City", name: agent.city, addressCountry: "IL" },
    parentOrganization: { "@type": "Organization", name: agent.agency },
    address: {
      "@type": "PostalAddress",
      addressLocality: agent.city,
      addressCountry: "IL",
    },
  };

  const itemListLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `נכסים של ${agent.name}`,
    numberOfItems: listings.length,
    itemListElement: listings.map((l, i) => ({
      "@type": "ListItem",
      position: i + 1,
      url: `${BASE_URL}/property/${l.id}`,
      name: `${l.title || l.address} — ₪${(l.price / 1_000_000).toFixed(1)}M`,
    })),
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "ראשי", item: BASE_URL },
      { "@type": "ListItem", position: 2, name: "סוכנים", item: `${BASE_URL}/agent/${agent.slug}` },
      { "@type": "ListItem", position: 3, name: agent.name, item: `${BASE_URL}/agent/${agent.slug}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(agentLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="min-h-screen bg-white" dir="rtl">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <Image
            src={agent.coverImage}
            alt={`${agent.name} — ${agent.agency}`}
            fill
            sizes="100vw"
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />

          <Link
            href="/"
            className="absolute top-4 right-4 flex items-center gap-1 bg-white/20 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold hover:bg-white/30 transition"
          >
            חזרה לאתר <ArrowRight className="h-3 w-3" />
          </Link>

          <div className="absolute bottom-0 inset-x-0 p-6 sm:p-8">
            <div className="max-w-4xl mx-auto flex items-end gap-4">
              <div className="h-20 w-20 sm:h-24 sm:w-24 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-xl border-4 border-white flex-shrink-0">
                <Building2 className="h-10 w-10 text-white" />
              </div>
              <div className="text-white mb-1">
                <h1 className="text-2xl sm:text-3xl font-black">{agent.name}</h1>
                <p className="text-sm text-white/80">{agent.agency}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/70">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {agent.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <Star className="h-3 w-3 text-yellow-400" /> {listings.length} נכסים
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-8 py-8 space-y-10">
          {/* Contact Buttons */}
          <div className="flex flex-wrap gap-3">
            <a
              href={`tel:${agent.phone.replace(/-/g, "")}`}
              className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
            >
              <Phone className="h-4 w-4" /> {agent.phone}
            </a>
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-green-600 transition shadow-sm"
            >
              <MessageSquare className="h-4 w-4" /> WhatsApp
            </a>
            <a
              href={`mailto:${agent.email}`}
              className="flex items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-50 transition"
            >
              <Mail className="h-4 w-4" /> אימייל
            </a>
          </div>

          {/* Bio */}
          <section className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
            <h2 className="text-sm font-black text-slate-800 mb-2">אודות</h2>
            <p className="text-sm text-slate-600 leading-relaxed">{agent.bio}</p>
          </section>

          {/* Properties */}
          <section>
            <h2 className="text-sm font-black text-slate-800 mb-4">
              הנכסים שלנו ({listings.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {listings.map((l) => (
                <PropertyCard key={l.id} listing={l} />
              ))}
            </div>
          </section>

          {/* Contact Form */}
          <section className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-3xl p-6 sm:p-8 border border-indigo-100">
            <h2 className="text-lg font-black text-indigo-900 mb-1">יצירת קשר</h2>
            <p className="text-xs text-indigo-600/70 mb-5">השאירו פרטים ונחזור אליכם בהקדם</p>
            <AgentContactForm />
          </section>
        </div>

        <footer className="border-t border-slate-100 py-6 text-center">
          <p className="text-[11px] text-slate-400">
            {agent.name} · {agent.city} · Powered by Toro
          </p>
        </footer>
      </div>
    </>
  );
}
