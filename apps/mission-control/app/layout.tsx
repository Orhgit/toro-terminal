import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/sidebar";

export const metadata: Metadata = {
  title: "Toro Mission Control",
  description: "AI-powered real estate command center — Toro Platform",
  // Internal SaaS dashboard — never index.
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="flex h-screen overflow-hidden font-sans antialiased">
        <Sidebar />
        <main className="flex-1 overflow-y-auto bg-(--color-bg)">
          {children}
        </main>
      </body>
    </html>
  );
}
