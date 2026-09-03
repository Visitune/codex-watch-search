import fs from "fs";
import path from "path";
import Link from "next/link";
import { Header } from "@/components/header";
import { Icons } from "@/components/icons";

type RawDoc = {
  Reference: string;
  Title: string;
  Committee: string;
  LastModified: number | null;
  Type: number | null;
  SharePointId: number;
  Description: Record<string, string>;
};

function loadCatalog(): { standards: RawDoc[]; totalCount: number; fetchedAt: string } {
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return { standards: [], totalCount: 0, fetchedAt: "" };
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const standards: RawDoc[] = raw.standards ?? raw.Standards ?? [];
  return { standards, totalCount: raw.totalCount ?? raw.TotalCount ?? standards.length, fetchedAt: raw.fetchedAt ?? "" };
}

const TYPE_LABEL: Record<string, string> = {
  "5": "Standards",
  "1": "Guidelines",
  "4": "Codes",
  "3": "MRLs",
  "2": "Misc",
  null: "Autre",
};
const TYPE_SHORT: Record<string, string> = { "5": "CXS", "1": "CXG", "4": "CXC", "3": "CXM", "2": "CXA" };

function pdfUrl(doc: RawDoc, lang: "en" | "fr"): string | null {
  const f = doc.Description?.[lang];
  if (!f) return null;
  return `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(f)}?lang=${lang}&id=${doc.SharePointId}`;
}

export default function Home({ searchParams }: { searchParams: { q?: string; type?: string; committee?: string } }) {
  const { standards, totalCount, fetchedAt } = loadCatalog();
  const q = (searchParams?.q ?? "").toLowerCase();
  const type = searchParams?.type ?? "";
  const committee = searchParams?.committee ?? "";

  let filtered = standards;
  if (type) filtered = filtered.filter((s) => String(s.Type) === type);
  if (committee) filtered = filtered.filter((s) => s.Committee === committee);
  if (q) {
    filtered = filtered.filter(
      (s) => s.Reference.toLowerCase().includes(q) || s.Title.toLowerCase().includes(q) || s.Committee.toLowerCase().includes(q)
    );
  }

  const committees = [...new Set(standards.map((s) => s.Committee).filter(Boolean))].sort();
  const countsByType = standards.reduce<Record<string, number>>((acc, s) => {
    const k = String(s.Type);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
  const recents = standards.filter((s) => (s.LastModified ?? 0) >= 2025).length;

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120]">
      <Header />

      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#1E40AF]/[0.06] dark:bg-[#1E3A8A]/20 blur-[80px]" />
          <div className="absolute -bottom-40 -left-32 h-[560px] w-[560px] rounded-full bg-[#F97316]/[0.07] dark:bg-[#F97316]/[0.12] blur-[80px]" />
        </div>
        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-8 md:pt-14 md:pb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 backdrop-blur">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#F97316] opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F97316]" />
            </span>
            <span className="text-xs font-mono tracking-widest text-[#0B1120] dark:text-white/80">LIVE • 401 TEXTES OFFICIELS • FTS HYBRIDE</span>
          </div>
          <h1 className="mt-4 text-[32px] sm:text-[44px] md:text-[54px] font-extrabold leading-[0.95] tracking-tight text-[#0B1120] dark:text-white">
            Le Codex <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] to-[#8B5CF6]">enfin</span><br />
            cherchable & surveillé.
          </h1>
          <p className="mt-3 max-w-[720px] text-[15px] md:text-[17px] leading-relaxed text-[#374151] dark:text-white/70">
            Recherche plein texte <span className="font-semibold text-[#0B1120] dark:text-white">MiniSearch + SQLite</span> dans GitHub — 0 Postgres. Filtrez par référence, comité, type et ouvrez le PDF officiel EN/FR en 1 clic.
          </p>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Corpus", value: totalCount, sub: "textes officiels", icon: Icons.file },
              { label: "Standards", value: countsByType["5"] ?? 0, sub: "CXS", icon: Icons.shield },
              { label: "Révisés ≥2025", value: recents, sub: "à surveiller", icon: Icons.clock },
              { label: " snapshot", value: fetchedAt ? new Date(fetchedAt).toLocaleDateString("fr-FR") : "—", sub: "FAO Codex", icon: Icons.chart },
            ].map((k) => (
              <div key={k.label} className="rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-4 shadow-sm dark:shadow-none flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-[#F97316]/10 dark:bg-white/[0.06] flex items-center justify-center text-[#F97316] shrink-0">
                  <k.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-xl font-extrabold leading-none text-[#0B1120] dark:text-white font-mono">{k.value}</div>
                  <div className="text-xs font-mono tracking-wide text-[#6B7280] dark:text-white/60">{k.label} • {k.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <form className="rounded-[20px] bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] shadow-sm dark:shadow-none p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input name="q" defaultValue={searchParams?.q ?? ""} placeholder="Rechercher: CXC 1-1969, allergène, HACCP, Listeria, CCFH..." className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/10 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#F97316]/40 focus:ring-4 focus:ring-[#F97316]/10" />
            </div>
            <div className="flex gap-3">
              <div className="relative flex-1 lg:w-[200px]">
                <select name="type" defaultValue={type} className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/10 text-sm">
                  <option value="">Tous types</option>
                  <option value="5">Standards (CXS)</option>
                  <option value="1">Guidelines (CXG)</option>
                  <option value="4">Codes (CXC)</option>
                  <option value="3">MRLs</option>
                  <option value="2">Misc</option>
                </select>
                <Icons.filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              </div>
              <div className="relative flex-1 lg:w-[200px]">
                <select name="committee" defaultValue={committee} className="w-full h-11 pl-3 pr-8 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/10 text-sm">
                  <option value="">Tous comités</option>
                  {committees.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <Icons.filter className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              </div>
              <button type="submit" className="h-11 px-6 rounded-xl bg-[#F97316] text-white font-bold text-sm shadow-md shadow-[#F97316]/20 hover:shadow-[#F97316]/30 hover:-translate-y-[1px] transition-all inline-flex items-center gap-2">
                Rechercher <Icons.arrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-mono tracking-wide text-[#6B7280] dark:text-white/50">RACCOURCIS:</span>
            {["CXC 1-1969", "HACCP", "allergène", "CCFH", "étiquetage"].map((s) => (
              <Link key={s} href={`/?q=${encodeURIComponent(s)}`} className="px-2.5 py-1 rounded-full bg-[#F8F9FC] dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 hover:border-[#F97316]/40 hover:text-[#F97316] transition-colors">
                {s}
              </Link>
            ))}
            <Link href="/" className="ml-auto text-[#6B7280] dark:text-white/60 hover:underline">Reset</Link>
          </div>
        </form>

        <div className="mt-4 flex items-center justify-between">
          <div className="text-sm text-[#6B7280] dark:text-white/60">
            <span className="font-mono font-bold text-[#0B1120] dark:text-white">{filtered.length}</span> résultat(s) {q && <>pour <span className="px-1.5 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] font-mono text-xs">{q}</span></>}
            <span className="hidden sm:inline"> • SQLite + MiniSearch hybride • PDFs officiels FAO</span>
          </div>
          <span className="text-xs font-mono text-[#9CA3AF]">Affiche 100 / {filtered.length}</span>
        </div>

        <div className="mt-4 grid gap-3">
          {filtered.slice(0, 100).map((doc) => {
            const en = pdfUrl(doc, "en");
            const fr = pdfUrl(doc, "fr");
            return (
              <div key={doc.Reference} className="group rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-4 md:p-5 hover:border-[#F97316]/30 dark:hover:border-[#F97316]/30 hover:shadow-md hover:shadow-[#F97316]/[0.06] transition-all">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2.5 py-1 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-xs font-mono font-bold tracking-wide">{doc.Reference}</span>
                  <span className="px-2.5 py-1 rounded-full bg-[#F8F9FC] dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 text-xs font-mono">
                    <span className="hidden sm:inline">{TYPE_LABEL[String(doc.Type)] ?? doc.Type} • </span>{TYPE_SHORT[String(doc.Type)] ?? "—"} • {doc.Committee}
                  </span>
                  <span className="ml-auto text-xs font-mono text-[#6B7280] dark:text-white/50">Modifié {doc.LastModified ?? "—"}</span>
                </div>
                <div className="mt-2 text-[15px] font-semibold leading-snug text-[#0B1120] dark:text-white line-clamp-2">{doc.Title}</div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {en && <a href={en} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA6A0A] transition-colors">PDF EN <Icons.external className="h-3.5 w-3.5" /></a>}
                  {fr && <a href={fr} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 text-xs font-bold hover:bg-[#F8F9FC] dark:hover:bg-white/10 transition-colors">PDF FR <Icons.external className="h-3.5 w-3.5" /></a>}
                  {!en && !fr && <span className="h-8 inline-flex items-center px-3 rounded-full bg-[#F8F9FC] dark:bg-white/[0.04] border border-dashed text-xs text-[#9CA3AF]">PDF non disponible EN/FR</span>}
                  <Link href={`/documents/${encodeURIComponent(doc.Reference)}`} className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full border border-[#E5E7EB] dark:border-white/10 text-xs font-bold hover:bg-[#F8F9FC] dark:hover:bg-white/[0.06] transition-colors">
                    Détails <Icons.arrowRight className="h-3.5 w-3.5" />
                  </Link>
                  <span className="ml-auto hidden md:inline-flex items-center gap-1 text-xs font-mono text-[#9CA3AF]">ID {doc.SharePointId} • <span className="h-2 w-2 rounded-full bg-emerald-500 inline-block" /> officiel</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 rounded-2xl border border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#131B2C] p-4 flex flex-col md:flex-row gap-3 items-start md:items-center justify-between">
          <div className="text-xs leading-relaxed text-[#6B7280] dark:text-white/60">
            Source: <a className="underline decoration-[#F97316]/40 underline-offset-4 hover:text-[#F97316]" href="https://codex.fao.org/codex-texts/find-a-codex-text" target="_blank">codex.fao.org — Find a Codex text</a> • Données <code className="px-1 py-0.5 rounded bg-[#F8F9FC] dark:bg-white/[0.06] border">data/catalog-snapshot.json</code> + <code className="px-1 py-0.5 rounded bg-[#F8F9FC] dark:bg-white/[0.06] border">codex.db + search-index.json</code> (hybride GitHub). • PDFs via <code className="px-1 py-0.5 rounded bg-[#F8F9FC] dark:bg-white/[0.06] border">/restapi/searchstandard/</code>
          </div>
          <Link href="/watch" className="shrink-0 inline-flex items-center gap-2 h-9 px-4 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-xs font-bold hover:opacity-90 transition-opacity">
            Voir le Watch <Icons.clock className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
