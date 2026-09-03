"use client";

import { useState } from "react";
import { Icons } from "@/components/icons";
import { buildOfficialUrl } from "@/lib/codex-connector";

export function DiffCard({ reference }: { reference: string }) {
  const [state, setState] = useState<{
    loading: boolean;
    open: boolean;
    data: { humanSummary: string; changed: boolean; added: number; removed: number; modified: number } | null;
    error: string | null;
  }>({ loading: false, open: false, data: null, error: null });

  const fetchDiff = async () => {
    setState({ loading: true, open: false, data: null, error: null });
    try {
      const res = await fetch(`/api/documents/${encodeURIComponent(reference)}/diff?readable=true`);
      if (!res.ok) throw new Error("Erreur réseau");
      const d = await res.json();
      setState({ loading: false, open: true, data: { humanSummary: d.readable || d.summary, changed: d.changed, added: d.added, removed: d.removed, modified: d.modified }, error: null });
    } catch {
      setState({ loading: false, open: true, data: null, error: "Impossible de charger le diff." });
    }
  };

  return (
    <div className="mt-4 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
      <h3 className="text-sm font-bold text-[#0B1120] dark:text-white flex items-center gap-2"><Icons.file className="h-4 w-4 text-[#F97316]" /> Évolution du texte <span className="px-1.5 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] text-[10px] font-bold">PRD §15</span></h3>
      <p className="mt-2 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">Compare la version actuelle du texte avec la précédente, paragraphe par paragraphe — lisible par tous.</p>
      <div className="mt-3 flex gap-2">
        <button onClick={fetchDiff} disabled={state.loading} className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-xs font-bold hover:opacity-90 disabled:opacity-50">
          {state.loading ? "Chargement..." : "Voir l'évolution"} <Icons.external className="h-3.5 w-3.5" />
        </button>
        <a href={buildOfficialUrl(reference)} target="_blank" rel="noopener noreferrer" className="h-8 inline-flex items-center gap-1.5 px-3 rounded-full border text-xs font-bold">Officiel FAO</a>
      </div>
      {state.open && state.data && (
        <div className="mt-4 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/[0.06] p-4">
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            {state.data.changed ? (
              <>
                {state.data.added > 0 && <span className="px-2 py-0.5 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs font-bold">+{state.data.added} ajouté{state.data.added > 1 ? "s" : ""}</span>}
                {state.data.removed > 0 && <span className="px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-bold">−{state.data.removed} retiré{state.data.removed > 1 ? "s" : ""}</span>}
                {state.data.modified > 0 && <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">≠{state.data.modified} modifié{state.data.modified > 1 ? "s" : ""}</span>}
              </>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-bold">✓ Aucun changement détecté</span>
            )}
          </div>
          <pre className="max-h-64 overflow-auto text-xs leading-relaxed text-[#0B1120] dark:text-white/80 whitespace-pre-wrap rounded bg-white dark:bg-[#131B2C] p-3 border border-[#E5E7EB] dark:border-white/[0.06]">{state.data.humanSummary}</pre>
        </div>
      )}
      {state.open && state.error && (
        <div className="mt-4 rounded-xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 p-4 text-xs text-red-700 dark:text-red-300">{state.error}</div>
      )}
      {!state.open && !state.loading && (
        <p className="mt-2 text-xs text-[#9CA3AF] dark:text-white/40">Cliquez sur « Voir l'évolution » pour comparer.</p>
      )}
    </div>
  );
}
