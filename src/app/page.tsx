import fs from "fs";
import path from "path";
import Link from "next/link";
import { Header } from "@/components/header";
import { Icons } from "@/components/icons";
import { Footer } from "@/components/footer";
import { FadeIn, Stagger, CardItem } from "@/components/animated";
import { miniSearch } from "@/lib/search";
import { buildOfficialUrl, buildFaoLegacyUrl } from "@/lib/codex-connector";

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

const TYPE_LABEL: Record<string, string> = { "5": "Standards", "1": "Guidelines", "4": "Codes of Practice", "3": "MRLs", "2": "Misc", null: "Autre" };
const TYPE_SHORT: Record<string, string> = { "5": "CXS", "1": "CXG", "4": "CXC", "3": "CXM", "2": "CXA" };
const TYPE_COLOR: Record<string, string> = {
  "5": "bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] border-transparent",
  "1": "bg-[#1E40AF] text-white border-transparent",
  "4": "bg-[#7C3AED] text-white border-transparent",
  "3": "bg-emerald-600 text-white border-transparent",
  "2": "bg-[#F97316] text-white border-transparent",
};

function pdfUrl(doc: RawDoc, lang: "en" | "fr"): string | null {
  const f = doc.Description?.[lang];
  if (!f) return null;
  return `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(f)}?lang=${lang}&id=${doc.SharePointId}`;
}

export default async function Home({ searchParams }: { searchParams: Promise<{ q?: string; type?: string; committee?: string }> }) {
  const sp = await searchParams;
  const { standards, totalCount, fetchedAt } = loadCatalog();
  const q = (sp?.q ?? "").toLowerCase();
  const type = sp?.type ?? "";
  const committee = sp?.committee ?? "";

  let filtered = standards;
  if (type) filtered = filtered.filter((s) => String(s.Type) === type);
  if (committee) filtered = filtered.filter((s) => s.Committee === committee);
  if (q) {
    // Hybride MiniSearch (Text) + fallback includes (même logique que /api/search)
    const mini = miniSearch(q, filtered as unknown as Parameters<typeof miniSearch>[1]);
    if (mini && mini.length > 0) {
      filtered = mini as unknown as RawDoc[];
    } else {
      const nq = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      filtered = filtered.filter((s) => {
        const ref = s.Reference.toLowerCase();
        const title = s.Title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const com = s.Committee.toLowerCase();
        return ref.includes(nq) || ref.includes(q) || title.includes(nq) || title.includes(q) || com.includes(q);
      });
    }
  }

  const committees = [...new Set(standards.map((s) => s.Committee).filter(Boolean))].sort();
  const countsByType = standards.reduce<Record<string, number>>((acc, s) => { const k = String(s.Type); acc[k] = (acc[k] || 0) + 1; return acc; }, {});
  const recents = standards.filter((s) => (s.LastModified ?? 0) >= 2025).length;
  const featured = standards.filter((s) => ["CXC 1-1969", "CXS 1-1985", "CXG 2-1985"].includes(s.Reference));

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120]">
      <Header />

      {/* Trust bar */}
      <div className="border-b border-[#E5E7EB] dark:border-white/[0.04] bg-white/60 dark:bg-[#0D1420]/60 backdrop-blur">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 h-8 flex items-center justify-between text-[11px] font-mono tracking-wide text-[#6B7280] dark:text-white/50">
          <span className="hidden sm:inline">Source officielle • FAO/WHO Codex Alimentarius • Nouveau site 28/08/2026 • 6 langues</span>
          <span className="sm:hidden">FAO/WHO • Codex Alimentarius</span>
          <span className="flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Snapshot {fetchedAt ? new Date(fetchedAt).toLocaleDateString("fr-FR") : "—"} • {totalCount} docs</span>
        </div>
      </div>

      {/* Hero editorial 2-col */}
      <div className="relative overflow-hidden border-b border-[#E5E7EB] dark:border-white/[0.04]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)] dark:bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_60%,transparent_100%)]" />
          <div className="absolute -top-32 -right-32 h-[520px] w-[520px] rounded-full bg-[#1E40AF]/[0.06] dark:bg-[#1E3A8A]/20 blur-[90px]" />
          <div className="absolute -bottom-40 -left-32 h-[560px] w-[560px] rounded-full bg-[#F97316]/[0.07] dark:bg-[#F97316]/[0.12] blur-[90px]" />
        </div>

        <div className="relative max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-14 grid lg:grid-cols-[1.15fr_0.85fr] gap-8 items-center">
          <FadeIn>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 shadow-sm">
              <span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" /><span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" /></span>
              <span className="text-xs font-mono tracking-widest text-[#0B1120] dark:text-white/80">CORPUS OFFICIEL • 401 TEXTES • MISE À JOUR QUOTIDIENNE</span>
            </div>
            <h1 className="mt-5 text-[34px] sm:text-[48px] md:text-[56px] font-extrabold leading-[0.9] tracking-[-0.03em] text-[#0B1120] dark:text-white">
              Le Codex <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#F97316] via-[#F97316] to-[#8B5CF6]">enfin</span>
              <br />cherchable.
            </h1>
            <p className="mt-4 max-w-[640px] text-[16px] md:text-[18px] leading-relaxed text-[#374151] dark:text-white/70">
              Recherche plein texte dans les <strong className="text-[#0B1120] dark:text-white">standards, guidelines et codes of practice</strong> du Codex Alimentarius. Filtrez et ouvrez le PDF officiel EN/FR en 1 clic.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link href="#search" className="h-11 px-6 rounded-full bg-[#F97316] text-white font-bold text-sm shadow-lg shadow-[#F97316]/20 hover:shadow-[#F97316]/30 hover:-translate-y-[1px] transition-all inline-flex items-center gap-2">
                Commencer la recherche <Icons.arrowRight className="h-4 w-4" />
              </Link>
              <Link href="/watch" className="h-11 px-5 rounded-full bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/10 text-sm font-bold inline-flex items-center gap-2 hover:bg-[#F8F9FC] dark:hover:bg-white/[0.06] transition-colors">
                <Icons.clock className="h-4 w-4 text-[#F97316]" /> Nouveautés
              </Link>
            </div>
            {/* KPI */}
            <Stagger className="mt-8 grid grid-cols-3 gap-3 max-w-[560px]">
              {[
                { k: totalCount, l: "Textes" },
                { k: countsByType["5"] ?? 0, l: "Standards" },
                { k: recents, l: "Révisés ≥2025" },
              ].map((s) => (
                <CardItem key={s.l} className="rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-3 text-center shadow-sm">
                  <div className="text-xl font-mono font-extrabold text-[#0B1120] dark:text-white">{s.k}</div>
                  <div className="text-[11px] font-mono tracking-wide text-[#6B7280] dark:text-white/60">{s.l}</div>
                </CardItem>
              ))}
            </Stagger>
          </FadeIn>

          {/* Featured preview */}
          <FadeIn delay={0.15} className="relative">
            <div className="absolute -inset-3 bg-gradient-to-br from-[#F97316]/10 via-transparent to-[#8B5CF6]/10 rounded-[28px] blur-xl" />
            <div className="relative rounded-[20px] bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] shadow-xl dark:shadow-none p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono tracking-widest text-[#F97316]">★ À LA UNE</span>
                <span className="text-xs font-mono text-[#9CA3AF]">EN/FR officiels</span>
              </div>
              <Stagger className="mt-3 grid gap-3">
                {featured.map((doc) => (
                  <CardItem key={doc.Reference}>
                    <Link href={`/documents/${encodeURIComponent(doc.Reference)}`} className="group flex rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-[#F8F9FC] dark:bg-[#0B1120] p-3 gap-3 hover:border-[#F97316]/30 transition-colors">
                      <div className={`h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0 ${TYPE_COLOR[String(doc.Type)] ?? "bg-[#0B1120]"}`}>
                        <span className="text-xs font-mono font-bold">{TYPE_SHORT[String(doc.Type)]}</span>
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-mono font-bold text-[#0B1120] dark:text-white">{doc.Reference} • {doc.Committee}</div>
                        <div className="text-sm font-semibold leading-snug text-[#0B1120] dark:text-white line-clamp-2 group-hover:text-[#F97316] transition-colors">{doc.Title}</div>
                      </div>
                    </Link>
                  </CardItem>
                ))}
              </Stagger>
              <div className="mt-3 flex items-center justify-between text-xs font-mono text-[#6B7280] dark:text-white/50">
                <span>Accès direct au PDF officiel</span><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Search */}
      <FadeIn delay={0.1}>
        <div id="search" className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form className="rounded-[20px] bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] shadow-sm dark:shadow-none p-4 md:p-5">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
              <input name="q" defaultValue={sp?.q ?? ""} placeholder="Rechercher: CXC 1-1969, allergène, HACCP, Listeria, CCFH..." className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/10 text-sm placeholder:text-[#9CA3AF] focus:outline-none focus:border-[#F97316]/40 focus:ring-4 focus:ring-[#F97316]/10" />
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
            {["CXC 1-1969", "HACCP", "allergène", "CCFH", "étiquetage", "eau"].map((s) => (
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
            <span className="hidden sm:inline"> • Textes officiels FAO/WHO</span>
          </div>
          <span className="text-xs font-mono text-[#9CA3AF]">Affiche 100 / {filtered.length}</span>
        </div>

        {filtered.length === 0 ? (
          <FadeIn className="mt-6 rounded-2xl border border-dashed border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-[#131B2C] p-10 text-center">
            <div className="mx-auto h-12 w-12 rounded-2xl bg-[#F8F9FC] dark:bg-white/[0.06] flex items-center justify-center text-[#9CA3AF]"><Icons.search className="h-6 w-6" /></div>
            <div className="mt-3 font-bold text-[#0B1120] dark:text-white">Aucun résultat</div>
            <p className="text-sm text-[#6B7280] dark:text-white/60">Essayez un autre mot-clé, un comité ou un type différent.</p>
          </FadeIn>
        ) : (
          <Stagger className="mt-4 grid gap-3">
            {filtered.slice(0, 100).map((doc) => {
              const en = pdfUrl(doc, "en");
              const fr = pdfUrl(doc, "fr");
              const isRecent = (doc.LastModified ?? 0) >= 2025;
              return (
                <CardItem key={doc.Reference} className="group relative rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-4 md:p-5 overflow-hidden hover:border-[#F97316]/30 dark:hover:border-[#F97316]/30 hover:shadow-md hover:shadow-[#F97316]/[0.06] transition-all">
                  <div className={`absolute left-0 top-0 bottom-0 w-[3px] ${isRecent ? "bg-emerald-500" : "bg-[#E5E7EB] dark:bg-white/10"} group-hover:bg-[#F97316] transition-colors`} />
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold tracking-wide border ${TYPE_COLOR[String(doc.Type)] ?? "bg-[#0B1120] text-white"}`}>{doc.Reference}</span>
                    <span className="px-2.5 py-1 rounded-full bg-[#F8F9FC] dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 text-xs font-mono">
                      <span className="hidden sm:inline">{TYPE_LABEL[String(doc.Type)] ?? doc.Type} • </span>{TYPE_SHORT[String(doc.Type)] ?? "—"} • {doc.Committee}
                    </span>
                    {isRecent && <span className="px-2 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 text-xs font-mono font-bold">● Révisé {doc.LastModified}</span>}
                    {!isRecent && <span className="ml-auto text-xs font-mono text-[#6B7280] dark:text-white/50">Modifié {doc.LastModified ?? "—"}</span>}
                  </div>
                  <div className="mt-2 text-[15px] font-semibold leading-snug text-[#0B1120] dark:text-white line-clamp-2 group-hover:text-[#F97316] transition-colors">{doc.Title}</div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {en && <a href={en} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA6A0A] transition-colors">PDF EN <Icons.external className="h-3.5 w-3.5" /></a>}
                    {fr && <a href={fr} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 h-8 px-3 rounded-full bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 text-xs font-bold hover:bg-[#F8F9FC] dark:hover:bg-white/10 transition-colors">PDF FR <Icons.external className="h-3.5 w-3.5" /></a>}
                    {!en && !fr && <span className="h-8 inline-flex items-center px-3 rounded-full bg-[#F8F9FC] dark:bg-white/[0.04] border border-dashed text-xs text-[#9CA3AF]">PDF non disponible EN/FR</span>}
                    <Link href={`/documents/${encodeURIComponent(doc.Reference)}`} className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full border border-[#E5E7EB] dark:border-white/10 text-xs font-bold hover:bg-[#F8F9FC] dark:hover:bg-white/[0.06] transition-colors">
                      Détails <Icons.arrowRight className="h-3.5 w-3.5" />
                    </Link>
                    <a href={buildOfficialUrl(doc.Reference)} target="_blank" rel="noopener noreferrer" title="Voir sur codex.fao.org (officiel)" className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full bg-white dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/10 text-xs font-bold hover:bg-[#F8F9FC] dark:hover:bg-white/[0.06]">Officiel <Icons.external className="h-3.5 w-3.5" /></a>
                    <a href={buildFaoLegacyUrl(doc.Reference)} target="_blank" rel="noopener noreferrer" title="Fiche FAO legacy" className="hidden lg:inline-flex h-8 items-center gap-1 px-2 rounded-full text-xs font-mono text-[#9CA3AF] hover:text-[#F97316]">FAO</a>
                  </div>
                </CardItem>
              );
            })}
          </Stagger>
        )}
        </div>
      </FadeIn>
      <Footer />
    </div>
  );
}
