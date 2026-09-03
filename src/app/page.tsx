import fs from "fs";
import path from "path";
import Link from "next/link";

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
  // raw may be { Standards } or { standards }
  const standards: RawDoc[] = raw.standards ?? raw.Standards ?? [];
  return { standards, totalCount: raw.totalCount ?? raw.TotalCount ?? standards.length, fetchedAt: raw.fetchedAt ?? "" };
}

const TYPE_LABEL: Record<string, string> = {
  "5": "Standards (CXS)",
  "1": "Guidelines (CXG)",
  "4": "Codes of Practice (CXC)",
  "3": "MRLs (CXM)",
  "2": "Miscellaneous (CXA)",
  "null": "Autre",
};

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
  if (type) filtered = filtered.filter((s) => String(s.Type) === type || (type === "null" && s.Type === null));
  if (committee) filtered = filtered.filter((s) => s.Committee === committee);
  if (q) {
    filtered = filtered.filter(
      (s) =>
        s.Reference.toLowerCase().includes(q) ||
        s.Title.toLowerCase().includes(q) ||
        s.Committee.toLowerCase().includes(q)
    );
  }

  const committees = [...new Set(standards.map((s) => s.Committee).filter(Boolean))].sort();
  const countsByType = standards.reduce<Record<string, number>>((acc, s) => {
    const k = String(s.Type);
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Codex Watch & Search</h1>
            <p className="text-sm text-zinc-500">Textes officiels Codex Alimentarius — veille & recherche plein texte (EN/FR prio)</p>
            <div className="mt-2 flex gap-2">
              <Link href="/watch" className="text-xs px-3 py-1 rounded-full bg-amber-500 text-white hover:bg-amber-600">Bulletin Watch →</Link>
              <a href="/api/catalog" target="_blank" className="text-xs px-3 py-1 rounded-full border">API catalog</a>
            </div>
          </div>
          <div className="text-xs text-zinc-500 text-right">
            <div>Snapshot: {totalCount} docs • {fetchedAt ? new Date(fetchedAt).toLocaleDateString("fr-FR") : "—"}</div>
            <div className="flex gap-2 justify-end mt-1">
              {Object.entries(countsByType).map(([k, v]) => (
                <span key={k} className="px-2 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded-full">{TYPE_LABEL[k] ?? k}: {v}</span>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <form className="bg-white dark:bg-zinc-900 rounded-xl border p-4 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[220px]">
            <label className="text-xs font-medium">Recherche (référence, titre, comité)</label>
            <input name="q" defaultValue={searchParams?.q ?? ""} placeholder="ex: CXC 1-1969, allergen, HACCP, Listeria" className="w-full mt-1 px-3 py-2 rounded-lg border bg-white dark:bg-zinc-950 text-sm" />
          </div>
          <div>
            <label className="text-xs font-medium">Type</label>
            <select name="type" defaultValue={type} className="ml-2 px-3 py-2 rounded-lg border bg-white dark:bg-zinc-950 text-sm">
              <option value="">Tous</option>
              <option value="5">Standards (CXS)</option>
              <option value="1">Guidelines (CXG)</option>
              <option value="4">Codes (CXC)</option>
              <option value="3">MRLs</option>
              <option value="2">Misc</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium">Comité</label>
            <select name="committee" defaultValue={committee} className="ml-2 px-3 py-2 rounded-lg border bg-white dark:bg-zinc-950 text-sm">
              <option value="">Tous</option>
              {committees.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <button type="submit" className="px-4 py-2 rounded-lg bg-zinc-900 text-white text-sm hover:bg-black">Rechercher</button>
          <Link href="/" className="px-4 py-2 rounded-lg border text-sm">Reset</Link>
        </form>

        <div className="mt-4 text-sm text-zinc-500">{filtered.length} résultat(s) {q && <>pour <em>{q}</em></>}</div>

        <div className="mt-4 grid gap-3">
          {filtered.slice(0, 100).map((doc) => {
            const en = pdfUrl(doc, "en");
            const fr = pdfUrl(doc, "fr");
            return (
              <div key={doc.Reference} className="bg-white dark:bg-zinc-900 rounded-xl border p-4 flex flex-col gap-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="px-2 py-0.5 text-xs rounded-full bg-zinc-900 text-white">{doc.Reference}</span>
                  <span className="px-2 py-0.5 text-xs rounded-full border">{TYPE_LABEL[String(doc.Type)] ?? doc.Type}</span>
                  <span className="px-2 py-0.5 text-xs rounded-full border">{doc.Committee}</span>
                  <span className="text-xs text-zinc-500">Adopté {doc.LastModified ?? "—"}</span>
                </div>
                <div className="font-medium text-sm">{doc.Title}</div>
                <div className="flex gap-2">
                  {en && <a href={en} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700">PDF EN</a>}
                  {fr && <a href={fr} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-white border hover:bg-zinc-50">PDF FR</a>}
                  {!en && !fr && <span className="text-xs text-zinc-400">PDF non disponible EN/FR</span>}
                  <Link href={`/documents/${encodeURIComponent(doc.Reference)}`} className="text-xs px-3 py-1 rounded-full border hover:bg-zinc-50">Détails</Link>
                </div>
              </div>
            );
          })}
        </div>
        {filtered.length > 100 && <div className="mt-4 text-xs text-zinc-400">Affichage limité à 100 / {filtered.length}. Affine la recherche.</div>}

        <div className="mt-10 border-t pt-4 text-xs text-zinc-500">
          Source officielle: <a className="underline" href="https://codex.fao.org/codex-texts/find-a-codex-text" target="_blank">codex.fao.org — Find a Codex text</a> • Données snapshot <code>data/catalog-snapshot.json</code> (POST LoadFilter/). PDFs via <code>/restapi/searchstandard/</code>. • Prochaine étape: download + hash + FTS + veille (PRD §14-16).
        </div>
      </main>
    </div>
  );
}
