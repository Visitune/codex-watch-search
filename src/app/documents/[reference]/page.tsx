import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

type RawDoc = {
  Reference: string;
  Title: string;
  Committee: string;
  LastModified: number | null;
  Type: number | null;
  SharePointId: number;
  AdoptedYear: number | null;
  Description: Record<string, string>;
  SharePointIdDocument: Record<string, number | null>;
};

function loadOne(ref: string): RawDoc | null {
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return null;
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const standards: RawDoc[] = raw.standards ?? raw.Standards ?? [];
  return standards.find((s) => s.Reference === ref) ?? null;
}

function pdfUrl(doc: RawDoc, lang: string): string | null {
  const f = doc.Description?.[lang];
  if (!f) return null;
  return `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(f)}?lang=${lang}&id=${doc.SharePointId}`;
}

export default function DocPage({ params }: { params: { reference: string } }) {
  const ref = decodeURIComponent(params.reference);
  const doc = loadOne(ref);
  if (!doc) notFound();
  const langs = ["en", "fr", "es", "zh", "ru", "ar"] as const;
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-3xl mx-auto px-6 py-4">
          <Link href="/" className="text-sm text-zinc-500 hover:underline">← Retour catalogue</Link>
          <h1 className="mt-2 text-xl font-semibold">{doc.Reference}</h1>
          <p className="text-sm text-zinc-600">{doc.Title}</p>
          <div className="mt-2 flex gap-2 text-xs">
            <span className="px-2 py-0.5 rounded-full border">{doc.Committee}</span>
            <span className="px-2 py-0.5 rounded-full border">Adopté {doc.AdoptedYear ?? "—"} • Modifié {doc.LastModified ?? "—"}</span>
            <span className="px-2 py-0.5 rounded-full border">Type {doc.Type ?? "—"}</span>
          </div>
        </div>
      </header>
      <main className="max-w-3xl mx-auto px-6 py-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-4">
          <h2 className="text-sm font-semibold mb-3">PDF officiels (source Codex)</h2>
          <div className="grid grid-cols-2 gap-2">
            {langs.map((lang) => {
              const url = pdfUrl(doc, lang);
              const has = !!doc.Description?.[lang];
              return (
                <div key={lang} className="border rounded-lg p-3 flex justify-between items-center">
                  <span className="text-sm font-medium uppercase">{lang}</span>
                  {has && url ? (
                    <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs px-3 py-1 rounded-full bg-zinc-900 text-white hover:bg-black">Ouvrir PDF</a>
                  ) : (
                    <span className="text-xs text-zinc-400">Non disponible</span>
                  )}
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-zinc-500">URLs: <code>/restapi/searchstandard/{"{file}"}?lang={"{lang}"}&id={doc.SharePointId}</code> — source officielle FAO/Codex. Hash & historique à venir (PRD §10.2).</p>
        </div>
        <div className="mt-6 bg-white dark:bg-zinc-900 rounded-xl border p-4">
          <h2 className="text-sm font-semibold">Détails bruts</h2>
          <pre className="mt-2 text-xs bg-zinc-50 dark:bg-zinc-950 p-3 rounded-lg overflow-auto">{JSON.stringify(doc, null, 2)}</pre>
        </div>
      </main>
    </div>
  );
}
