import fs from "fs";
import path from "path";
import Link from "next/link";
import { Header } from "@/components/header";
import { Icons } from "@/components/icons";

function loadCatalog() {
  const raw = JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "catalog-snapshot.json"), "utf-8"));
  return { docs: raw.standards ?? raw.Standards ?? [], fetchedAt: raw.fetchedAt };
}
function loadMeta() {
  for (const p of [path.join(process.cwd(), "public", "search-meta.json"), path.join(process.cwd(), "data", "search-meta.json")]) {
    try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch {}
  }
  return { count: 0, withText: 0 };
}
function loadBulletin() {
  for (const p of [path.join(process.cwd(), "public", "watch-bulletin.json"), path.join(process.cwd(), "data", "watch-bulletin.json")]) {
    try { return JSON.parse(fs.readFileSync(p, "utf-8")); } catch {}
  }
  return null;
}
function loadCorpus() {
  try { return JSON.parse(fs.readFileSync(path.join(process.cwd(), "data", "corpus", "meta.json"), "utf-8")); } catch { return {}; }
}

export default function Dashboard() {
  const { docs, fetchedAt } = loadCatalog();
  const meta = loadMeta() as { withText: number; count: number };
  const bulletin = loadBulletin() as { recents: unknown[] } | null;
  const corpus = loadCorpus() as Record<string, unknown>;
  const docsTyped = docs as Array<{ Committee: string; Type: number | null }>;
  const byCommittee = docsTyped.reduce<Record<string, number>>((a, d) => { a[d.Committee] = (a[d.Committee] || 0) + 1; return a; }, {});
  const topCommittees = Object.entries(byCommittee).sort((a, b) => b[1] - a[1]).slice(0, 8) as Array<[string, number]>;
  const byType: Record<string, number> = docsTyped.reduce((a: Record<string, number>, d) => { const k = String(d.Type); a[k] = (a[k] || 0) + 1; return a; }, {});
  const coverage = meta.withText ? Math.round((meta.withText / docs.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120]">
      <Header />
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#F97316]"><span className="h-[2px] w-8 bg-[#F97316]" /> TABLEAU DE BORD</div>
        <h1 className="mt-2 text-[28px] md:text-[40px] font-extrabold tracking-tight text-[#0B1120] dark:text-white">Vue d’ensemble du corpus.</h1>
        <p className="mt-2 max-w-[820px] text-sm leading-relaxed text-[#6B7280] dark:text-white/60">
          Corpus officiel du Codex Alimentarius — <strong className="text-[#0B1120] dark:text-white">{docs.length} textes</strong> (normes, lignes directrices, codes d’usage et limites de résidus) tenus par la FAO/OMS. Mise à jour le{" "}
          {fetchedAt ? new Date(fetchedAt).toLocaleDateString("fr-FR") : "—"} depuis{" "}
          <a href="https://codex.fao.org/" target="_blank" className="underline decoration-[#F97316]/30 underline-offset-2 hover:text-[#F97316]">codex.fao.org</a>.
          Utile pour retrouver en 1 clic une référence, filtrer par comité ou type, et chercher en plein texte (<code className="px-1 py-0.5 rounded bg-white dark:bg-white/[0.06] border text-xs">EN/FR</code>) dans les titres et le contenu des PDF officiels.
        </p>

        <div className="mt-6 grid md:grid-cols-4 gap-3">
          {[
            { label: "Corpus", value: docs.length, sub: "textes officiels", icon: Icons.file },
            { label: "Couverture", value: `${coverage}%`, sub: "indexation plein texte", icon: Icons.search },
            { label: "Comités", value: Object.keys(byCommittee).length, sub: "actifs", icon: Icons.chart },
            { label: "Nouveautés", value: bulletin?.recents?.length ?? 0, sub: "révisés ≥2025", icon: Icons.clock },
          ].map((k) => (
            <div key={k.label} className="rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-[#F97316]/10 flex items-center justify-center text-[#F97316]"><k.icon className="h-5 w-5" /></div>
              <div><div className="text-lg font-mono font-extrabold text-[#0B1120] dark:text-white">{k.value}</div><div className="text-xs font-mono text-[#6B7280] dark:text-white/60">{k.label} • {k.sub}</div></div>
            </div>
          ))}
        </div>

        <div className="mt-6 grid lg:grid-cols-2 gap-4">
          <div className="rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
            <h2 className="font-bold text-[#0B1120] dark:text-white">Répartition par type</h2>
            <div className="mt-3 space-y-2">
              {Object.entries(byType).map(([k, v]) => {
                const pct = Math.round((v / docs.length) * 100);
                return (
                  <div key={k} className="flex items-center gap-3">
                    <span className="w-28 text-xs font-mono text-[#6B7280] dark:text-white/60">{({ "5": "CXS", "1": "CXG", "4": "CXC", "3": "CXM", "2": "CXA", null: "Autre" } as Record<string, string>)[k] ?? k}</span>
                    <div className="flex-1 h-2 rounded-full bg-[#F1F4F9] dark:bg-white/[0.06] overflow-hidden"><div className="h-full bg-[#F97316]" style={{ width: `${pct}%` }} /></div>
                    <span className="w-12 text-right text-xs font-mono font-bold">{v}</span>
                    <span className="w-8 text-right text-xs text-[#9CA3AF]">{pct}%</span>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
            <h2 className="font-bold text-[#0B1120] dark:text-white">Top comités</h2>
            <div className="mt-3 space-y-2">
              {topCommittees.map(([c, n]) => (
                <div key={c} className="flex items-center gap-3">
                  <span className="w-24 text-xs font-mono font-bold text-[#0B1120] dark:text-white">{c}</span>
                  <div className="flex-1 h-2 rounded-full bg-[#F1F4F9] dark:bg-white/[0.06] overflow-hidden"><div className="h-full bg-[#1E40AF] dark:bg-[#8B5CF6]" style={{ width: `${Math.round((n / 50) * 100)}%` }} /></div>
                  <span className="w-8 text-right text-xs font-mono">{n}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
          <h2 className="font-bold text-[#0B1120] dark:text-white">Couverture de la recherche plein texte</h2>
          <div className="mt-2 h-3 rounded-full bg-[#F1F4F9] dark:bg-white/[0.06] overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#F97316] to-[#8B5CF6]" style={{ width: `${coverage}%` }} />
          </div>
          <div className="mt-2 flex justify-between text-xs font-mono text-[#6B7280] dark:text-white/60">
            <span>{meta.withText ?? 0} / {docs.length} textes indexés</span><span>{coverage}%</span>
          </div>
          <p className="mt-2 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">La recherche s’enrichit au fur et à mesure de l’indexation du contenu des PDF. Les métadonnées (référence, titre, comité) sont déjà intégralement cherchables.</p>
        </div>

        <div className="mt-6 flex gap-2">
          <Link href="/" className="h-9 px-4 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-sm font-bold inline-flex items-center gap-2">Catalogue <Icons.search className="h-4 w-4" /></Link>
          <Link href="/ask" className="h-9 px-4 rounded-full bg-[#F97316] text-white text-sm font-bold inline-flex items-center gap-2">Ask Codex <Icons.shield className="h-4 w-4" /></Link>
          <Link href="/watch" className="h-9 px-4 rounded-full bg-white dark:bg-[#131B2C] border text-sm font-bold inline-flex items-center gap-2">Watch <Icons.clock className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
