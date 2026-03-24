import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "./components/sidebar";

export const metadata: Metadata = {
  title: "Toro Admin — Command Center",
  description: "Agency command center for Toro — Israel's fastest AI-driven real estate platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="he" dir="rtl">
      <body className="flex h-screen overflow-hidden bg-(--color-surface-alt) font-sans text-gray-900 antialiased">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </body>
    </html>
  );
}
