import fs from "fs";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Header } from "@/components/header";
import { Icons } from "@/components/icons";
import { DiffCard } from "@/components/diff-card";
import { buildOfficialUrl, buildFaoLegacyUrl } from "@/lib/codex-connector";

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

export default async function DocPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const ref = decodeURIComponent(reference);
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
          <p className="mt-2 text-sm text-[#6B7280] dark:text-white/60">Texte officiel Codex Alimentarius • Comité {doc.Committee} • Adopté {doc.AdoptedYear ?? "—"} • Dernière révision {doc.LastModified ?? "—"}</p>
        </div>

        <div className="mt-4 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-6">
          <h2 className="font-bold text-[#0B1120] dark:text-white flex items-center gap-2"><Icons.file className="h-4 w-4 text-[#F97316]" /> PDFs officiels</h2>
          <div className="mt-4 grid sm:grid-cols-2 gap-3">
            {langs.map((lang) => {
              const url = pdfUrl(doc, lang);
              const has = !!doc.Description?.[lang];
              const label = { en: "Anglais", fr: "Français", es: "Espagnol", zh: "Chinois", ru: "Russe", ar: "Arabe" }[lang] ?? lang;
              return (
                <div key={lang} className="rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-[#F8F9FC] dark:bg-[#0B1120] p-4 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-bold text-[#0B1120] dark:text-white">{label} <span className="ml-1 px-1.5 py-0.5 rounded bg-white dark:bg-white/[0.06] border text-xs font-mono uppercase">{lang}</span></div>
                    <div className="text-xs text-[#6B7280] dark:text-white/60">{has ? "Disponible" : "Non disponible"}</div>
                  </div>
                  {has && url ? <a href={url} target="_blank" rel="noopener noreferrer" className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#F97316] text-white text-xs font-bold hover:bg-[#EA6A0A]">Ouvrir <Icons.external className="h-3.5 w-3.5" /></a> : <span className="text-xs px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border text-[#9CA3AF]">Non dispo</span>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <a href={buildOfficialUrl(doc.Reference)} target="_blank" rel="noopener noreferrer" className="h-10 inline-flex items-center gap-2 px-4 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-sm font-bold hover:opacity-90">
            Voir sur codex.fao.org (officiel) <Icons.external className="h-4 w-4" />
          </a>
          <a href={buildFaoLegacyUrl(doc.Reference)} target="_blank" rel="noopener noreferrer" className="h-10 inline-flex items-center gap-2 px-4 rounded-full bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/10 text-sm font-bold">
            Fiche FAO legacy <Icons.external className="h-4 w-4" />
          </a>
        </div>

        <DiffCard reference={doc.Reference} />

        <div className="mt-4 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
          <h3 className="text-sm font-bold text-[#0B1120] dark:text-white">Informations</h3>
          <p className="mt-2 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">Texte officiel du Codex Alimentarius. Pour toute question d’interprétation, référez-vous au document PDF officiel ci-dessus ou à la fiche officielle sur codex.fao.org. Ce portail est un service indépendant de veille et de recherche.</p>
        </div>
      </div>
    </div>
  );
}
