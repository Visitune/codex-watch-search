import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./theme-provider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--font-jetbrains", display: "swap" });

export const metadata: Metadata = {
  title: "Codex Watch & Search — Textes officiels Codex Alimentarius",
  description: "Surveillance et recherche plein texte sur les standards (CXS), guidelines (CXG), codes of practice (CXC) et MRLs du Codex Alimentarius. 401 textes • EN/FR • FTS hybride.",
  openGraph: { title: "Codex Watch & Search", description: "401 textes officiels Codex • recherche FTS hybride", type: "website" },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning className={`${inter.variable} ${jetbrains.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-[#F8F9FC] dark:bg-[#0B1120] text-[#0B1120] dark:text-white">
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
