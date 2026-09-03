"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "@/app/theme-provider";
import { Icons } from "./icons";

export function Header() {
  const { theme, toggle } = useTheme();
  const pathname = usePathname();
  const isActive = (p: string) => pathname === p || pathname.startsWith(p + "/");
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/80 dark:bg-[#0B1120]/80 border-b border-[#E5E7EB] dark:border-white/[0.06]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-[64px] flex items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="h-9 w-9 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-lg shadow-[#F97316]/20 group-hover:scale-105 transition-transform">
            <Icons.shield className="h-5 w-5" />
          </div>
          <div className="leading-none">
            <div className="font-extrabold tracking-tight text-[15px] text-[#0B1120] dark:text-white">CODEX <span className="text-[#F97316]">WATCH</span></div>
            <div className="text-[11px] font-mono tracking-widest text-[#6B7280] dark:text-white/60">ALIMENTARIUS • FTS HYBRIDE</div>
          </div>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {[
            { href: "/", label: "Catalogue" },
            { href: "/watch", label: "Watch" },
            { href: "/ask", label: "Ask" },
            { href: "/dashboard", label: "Dashboard" },
          ].map((l) => (
            <Link key={l.href} href={l.href} className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${isActive(l.href) ? "bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120]" : "text-[#374151] dark:text-white/70 hover:bg-black/[0.06] dark:hover:bg-white/[0.06]"}`}>
              {l.label}
            </Link>
          ))}
          <a href="https://codex.fao.org/codex-texts/find-a-codex-text" target="_blank" rel="noopener noreferrer" className="ml-1 inline-flex items-center gap-1.5 px-3 py-2 rounded-full text-xs font-mono tracking-wide border border-[#E5E7EB] dark:border-white/10 text-[#374151] dark:text-white/70 hover:bg-black/[0.04] dark:hover:bg-white/[0.06]">
            Source FAO <Icons.external className="h-3.5 w-3.5" />
          </a>
        </nav>
        <div className="flex items-center gap-2">
          <button onClick={toggle} aria-label="Toggle theme" className="h-9 w-9 rounded-full border border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.06] flex items-center justify-center hover:scale-105 transition-transform">
            {theme === "dark" ? <Icons.sun className="h-4 w-4" /> : <Icons.moon className="h-4 w-4" />}
          </button>
          <Link href="/watch" className="hidden sm:inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#F97316] text-white text-sm font-bold shadow-md shadow-[#F97316]/20 hover:shadow-[#F97316]/30 hover:translate-y-[-1px] transition-all">
            Bulletin <Icons.arrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </header>
  );
}
