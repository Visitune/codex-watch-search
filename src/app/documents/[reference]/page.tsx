import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Icons } from "@/components/icons";

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
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120]">
      <Header />
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Link href="/" className="inline-flex items-center gap-1.5 text-sm font-mono text-[#6B7280] dark:text-white/60 hover:text-[#F97316]"><Icons.arrowRight className="h-4 w-4 rotate-180" /> Retour catalogue</Link>
        <div className="mt-4 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-6">
          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-xs font-mono font-bold">{doc.Reference}</span>
            <span className="px-3 py-1 rounded-full bg-[#F8F9FC] dark:bg-white/[0.06] border text-xs font-mono">{doc.Committee} • Adopté {doc.AdoptedYear ?? "—"} • Modifié {doc.LastModified ?? "—"}</span>
          </div>
          <h1 className="mt-3 text-[22px] md:text-[26px] font-extrabold leading-tight text-[#0B1120] dark:text-white">{doc.Title}</h1>
          <p className="mt-2 text-sm text-[#6B7280] dark:text-white/60">Source officielle FAO/Codex • ID SharePoint {doc.SharePointId} • URLs signées <code className="px-1 py-0.5 rounded bg-[#F8F9FC] dark:bg-white/[0.06] border">/restapi/searchstandard/</code></p>
        </div>

        <div className="mt-4 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-6">
          <h2 className="font-bold text-[#0B1120] dark:text-white flex items-center gap-2"><Icons.file className="h-4 w-4 text-[#F97316]" /> PDFs officiels</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {langs.map((lang) => {
              const url = pdfUrl(doc, lang);
              const has = !!doc.Description?.[lang];
              return (
                <div key={lang} className="rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-[#F8F9FC] dark:bg-[#0B1120] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-mono font-bold uppercase">{lang} <span className="font-sans font-normal text-xs text-[#6B7280] dark:text-white/50">{doc.Description?.[lang] || "indisponible"}</span></div>
                    <div className="text-xs font-mono text-[#9CA3AF]">lang={lang} & id={doc.SharePointId}</div>
                  </div>
                  {has && url ? <a href={url} target="_blank" rel="noopener noreferrer" className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA6A0A]">Ouvrir <Icons.external className="h-3.5 w-3.5" /></a> : <span className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border text-[#9CA3AF]">Non dispo</span>}
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex gap-2">
            <a href={pdfUrl(doc, "en") ?? "#"} target="_blank" className={`h-9 px-4 rounded-full text-xs font-bold inline-flex items-center gap-1.5 ${pdfUrl(doc, "en") ? "bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120]" : "bg-[#F8F9FC] border text-[#9CA3AF] pointer-events-none"}`}>Extraire EN <Icons.search className="h-4 w-4" /></a>
            <a href={pdfUrl(doc, "fr") ?? "#"} target="_blank" className="h-9 px-4 rounded-full bg-white dark:bg-white/[0.06] border text-xs font-bold inline-flex items-center gap-1.5">API /extract <Icons.file className="h-4 w-4" /></a>
          </div>
          <p className="mt-3 text-xs font-mono text-[#9CA3AF]">Test extraction: <code>/api/documents/{encodeURIComponent(doc.Reference)}/extract?lang=en</code> → SHA-256 + preview 2000c (pdf-parse)</p>
        </div>

        <div className="mt-4 rounded-2xl bg-[#0B1120] dark:bg-[#131B2C] border border-white/10 p-5 text-white">
          <h3 className="font-mono text-xs tracking-widest text-white/60">JSON BRUT (catalogue)</h3>
          <pre className="mt-2 text-xs leading-relaxed overflow-auto max-h-[420px] p-3 rounded-xl bg-white/[0.06] border border-white/10">{JSON.stringify(doc, null, 2)}</pre>
        </div>
      </div>
    </div>
  );
}
