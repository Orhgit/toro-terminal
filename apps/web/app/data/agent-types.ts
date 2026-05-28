/**
 * Agent profile types for the mini-site feature.
 */

export interface AgentProfile {
  slug: string;
  name: string;
  photo: string;
  agency: string;
  phone: string;
  whatsapp: string;
  email: string;
  bio: string;
  city: string;
  coverImage: string;
  theme: "light" | "dark" | "brand";
}

export const DEFAULT_AGENT_PROFILE: AgentProfile = {
  slug: "merkaz-nechasim",
  name: "מרכז הנכסים",
  photo: "",
  agency: "מרכז הנכסים — רשת נדל״ן",
  phone: "054-0000000",
  whatsapp: "054-0000000",
  email: "info@example.com",
  bio: "משרד תיווך מוביל עם ניסיון של למעלה מ-15 שנה בשוק הנדל״ן הישראלי. מתמחים במכירה, השכרה וליווי עסקאות.",
  city: "נתניה",
  coverImage: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?q=80&w=1200",
  theme: "brand",
};

export const AGENTS: AgentProfile[] = [DEFAULT_AGENT_PROFILE];

export function getAgentBySlug(slug: string): AgentProfile | null {
  return AGENTS.find((a) => a.slug === slug) ?? null;
}
