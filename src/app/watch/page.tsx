import { buildBulletin } from "@/lib/watch";
import Link from "next/link";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Icons } from "@/components/icons";
import { FadeIn, Stagger, CardItem } from "@/components/animated";

const LABEL: Record<string, string> = { "5": "Standards (CXS)", "1": "Guidelines (CXG)", "4": "Codes (CXC)", "3": "MRLs (CXM)", "2": "Misc (CXA)", null: "Autre" };

export default function WatchPage() {
  const b = buildBulletin();
  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120]">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FadeIn>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#F97316]">
                <span className="h-[2px] w-8 bg-[#F97316]" /> CODEX WATCH • BULLETIN HEBDO
              </div>
              <h1 className="mt-2 text-[28px] md:text-[40px] font-extrabold tracking-tight text-[#0B1120] dark:text-white">Ce qui a bougé.</h1>
              <p className="text-sm text-[#6B7280] dark:text-white/60">Snapshot {b.snapshotAt ? new Date(b.snapshotAt).toLocaleString("fr-FR") : "—"} • Généré {new Date(b.generatedAt).toLocaleString("fr-FR")} • Cron Vercel <code className="px-1 py-0.5 rounded bg-white dark:bg-white/[0.06] border">0 6 * * *</code></p>
            </div>
            <Link href="/" className="h-10 inline-flex items-center gap-2 px-4 rounded-full bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/10 text-sm font-bold hover:bg-[#F8F9FC] dark:hover:bg-white/[0.06]">
              <Icons.arrowRight className="h-4 w-4 rotate-180" /> Catalogue
            </Link>
          </div>
        </FadeIn>

        <Stagger className="mt-6 grid lg:grid-cols-[1.2fr_0.8fr] gap-4">
          <CardItem className="rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
            <h2 className="font-bold text-[#0B1120] dark:text-white flex items-center gap-2">
              <span className="h-7 w-7 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]"><Icons.chart className="h-4 w-4" /></span> Vue d’ensemble
            </h2>
            <div className="mt-3 text-3xl font-mono font-extrabold text-[#0B1120] dark:text-white">{b.total} <span className="text-sm font-sans font-medium text-[#6B7280] dark:text-white/60">textes officiels</span></div>
            <div className="mt-3 flex flex-wrap gap-2">
              {Object.entries(b.byType).map(([k, v]) => (
                <span key={k} className="px-3 py-1.5 rounded-full bg-[#F8F9FC] dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 text-xs font-mono">{LABEL[k] ?? k}: <strong>{v}</strong></span>
              ))}
            </div>
            <p className="mt-4 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">Distinction PRD §21: <strong>NEW</strong> / <strong>REVISED</strong> / <strong>NEW_TRANSLATION</strong> / <strong>REMOVED</strong>. MVP affiche les récents (LastModified ≥2025).</p>
          </CardItem>
          <CardItem className="rounded-2xl bg-[#0B1120] dark:bg-[#131B2C] border border-white/10 p-5 text-white relative overflow-hidden">
            <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#F97316]/20 blur-[30px]" />
            <h3 className="font-bold flex items-center gap-2"><Icons.shield className="h-4 w-4 text-[#F97316]" /> Hybride GitHub</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">Recherche <strong className="text-white">MiniSearch + SQLite</strong> (<code>public/search-index.json</code> 277KB + <code>codex.db</code> 100KB) — 0 Postgres.</p>
            <div className="mt-3 flex gap-2">
              <a href="/api/search?q=HACCP" target="_blank" className="text-xs px-3 py-1.5 rounded-full bg-white text-[#0B1120] font-bold">API /search</a>
              <a href="/api/watch/latest" target="_blank" className="text-xs px-3 py-1.5 rounded-full bg-white/10 border border-white/20 font-mono">/watch/latest</a>
            </div>
          </CardItem>
        </Stagger>

        <FadeIn delay={0.15} className="mt-6 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
          <h2 className="font-bold text-[#0B1120] dark:text-white">Textes récents (≥2025) — {b.recents.length}</h2>
          <p className="text-xs text-[#6B7280] dark:text-white/60">Tri par LastModified décroissant • Source catalogue FAO</p>
          <Stagger className="mt-4 grid gap-2">
            {b.recents.map((d) => (
              <CardItem key={d.Reference} className="rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-[#F8F9FC] dark:bg-[#0B1120] p-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="text-sm font-bold text-[#0B1120] dark:text-white">{d.Reference} — {d.Title}</div>
                  <div className="text-xs font-mono text-[#6B7280] dark:text-white/60">{d.Committee} • Modifié {d.LastModified} • {LABEL[String(d.Type)]}</div>
                </div>
                <Link href={`/documents/${encodeURIComponent(d.Reference)}`} className="shrink-0 h-8 inline-flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-white text-[#0B1120] border text-xs font-bold hover:bg-[#F8F9FC]">Détails <Icons.arrowRight className="h-3.5 w-3.5" /></Link>
              </CardItem>
            ))}
            {b.recents.length === 0 && <div className="text-sm text-[#9CA3AF]">Aucun changement récent.</div>}
          </Stagger>
        </FadeIn>
      </div>
      <Footer />
    </div>
  );
}
