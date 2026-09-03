import { buildBulletin } from "@/lib/watch";
import Link from "next/link";

const LABEL: Record<string, string> = { "5": "Standards", "1": "Guidelines", "4": "Codes", "3": "MRLs", "2": "Misc", "null": "Autre" };

export default function WatchPage() {
  const b = buildBulletin();
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b bg-white dark:bg-zinc-900">
        <div className="max-w-4xl mx-auto px-6 py-4 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-semibold">Codex Watch — Bulletin hebdo</h1>
            <p className="text-xs text-zinc-500">Snapshot {b.snapshotAt ? new Date(b.snapshotAt).toLocaleString("fr-FR") : "—"} • Généré {new Date(b.generatedAt).toLocaleString("fr-FR")}</p>
          </div>
          <Link href="/" className="text-sm border px-3 py-1 rounded-lg">← Catalogue</Link>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-6 py-6 space-y-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-4">
          <h2 className="font-semibold text-sm">Vue d’ensemble</h2>
          <div className="mt-2 text-sm">Total corpus: <strong>{b.total}</strong> textes officiels</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {Object.entries(b.byType).map(([k, v]) => <span key={k} className="px-2 py-0.5 text-xs rounded-full bg-zinc-100 dark:bg-zinc-800">{LABEL[k] ?? k}: {v}</span>)}
          </div>
          <p className="mt-3 text-xs text-zinc-500">Le bulletin distingue NEW / REVISED / NEW_TRANSLATION / REMOVED (PRD §21). MVP affiche les mises à jour récentes (LastModified ≥ 2025). La détection SHA-256 sera activée après branchement DB/Blob.</p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border p-4">
          <h2 className="font-semibold text-sm">Textes révisés ou récents (≥2025) — {b.recents.length}</h2>
          <div className="mt-3 grid gap-2">
            {b.recents.map((d) => (
              <div key={d.Reference} className="border rounded-lg p-3 flex justify-between items-center">
                <div>
                  <div className="text-sm font-medium">{d.Reference} — {d.Title}</div>
                  <div className="text-xs text-zinc-500">{d.Committee} • Modifié {d.LastModified} • {LABEL[String(d.Type)]}</div>
                </div>
                <Link href={`/documents/${encodeURIComponent(d.Reference)}`} className="text-xs border px-2 py-1 rounded-full">Détails</Link>
              </div>
            ))}
            {b.recents.length === 0 && <div className="text-sm text-zinc-400">Aucun changement récent détecté.</div>}
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-xl p-4 text-xs">
          <strong>Prochaine étape Watch:</strong> cron quotidien compare <code>LastModified</code> + <code>SHA-256</code> (PRD §14) → table <code>codex_change</code> + <code>codex_collection_run</code>. Sans DB, le snapshot <code>data/catalog-snapshot.json</code> fait foi.
        </div>
      </main>
    </div>
  );
}
