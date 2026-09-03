"use client";
import { useState } from "react";
import Link from "next/link";
import { Header } from "@/components/header";
import { Icons } from "@/components/icons";

type Answer = { query: string; results: Array<{ Reference: string; Title: string; Committee: string; score: number }> };

export default function AskPage() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [ans, setAns] = useState<Answer | null>(null);

  const ask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!q.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();
      const results = (data.results ?? []).slice(0, 8).map((r: { Reference: string; Title: string; Committee: string }, i: number) => ({ ...r, score: 95 - i * 7 }));
      setAns({ query: q, results });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC] dark:bg-[#0B1120]">
      <Header />
      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-[#F97316]"><span className="h-[2px] w-8 bg-[#F97316]" /> INTERROGATION DU CORPUS</div>
        <h1 className="mt-2 text-[28px] md:text-[40px] font-extrabold tracking-tight text-[#0B1120] dark:text-white">Posez une question au corpus.</h1>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-white/60">Interrogez les 401 textes officiels en langage naturel. Chaque réponse renvoie vers les documents sources officiels.</p>

        <form onSubmit={ask} className="mt-6 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-4 flex gap-3">
          <div className="flex-1 relative">
            <Icons.search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#9CA3AF]" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Ex: Que dit le Codex sur la réutilisation de l'eau ? / allergènes / validation HACCP" className="w-full h-11 pl-10 pr-3 rounded-xl bg-[#F8F9FC] dark:bg-[#0B1120] border border-[#E5E7EB] dark:border-white/10 text-sm" />
          </div>
          <button type="submit" disabled={loading} className="h-11 px-6 rounded-xl bg-[#F97316] text-white font-bold text-sm disabled:opacity-50 shadow-md shadow-[#F97316]/20">
            {loading ? "Recherche…" : "Demander"}
          </button>
        </form>

        <div className="mt-2 flex gap-2 text-xs">
          {["réutilisation eau", "allergènes", "HACCP", "Listeria", "étiquetage"].map((s) => (
            <button key={s} onClick={() => setQ(s)} className="px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border border-[#E5E7EB] dark:border-white/10 hover:border-[#F97316]/40 text-xs">{s}</button>
          ))}
        </div>

        {ans && (
          <div className="mt-6 rounded-2xl bg-white dark:bg-[#131B2C] border border-[#E5E7EB] dark:border-white/[0.06] p-5">
            <div className="flex items-center gap-2 text-xs font-mono tracking-wide text-[#6B7280] dark:text-white/60"><Icons.shield className="h-4 w-4 text-[#F97316]" /> {ans.results.length} RÉSULTAT(S) • SOURCES OFFICIELLES</div>
            <p className="mt-2 text-sm leading-relaxed text-[#0B1120] dark:text-white">Pour <em className="px-1.5 py-0.5 rounded bg-[#F97316]/10 text-[#F97316] font-mono">“{ans.query}”</em>, {ans.results.length} texte(s) pertinent(s) ont été identifiés. Chaque résultat renvoie vers le document officiel.</p>
            <div className="mt-4 grid gap-3">
              {ans.results.map((r) => (
                <div key={r.Reference} className="rounded-xl border border-[#E5E7EB] dark:border-white/[0.06] bg-[#F8F9FC] dark:bg-[#0B1120] p-4">
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="px-2.5 py-1 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-xs font-mono font-bold">{r.Reference}</span>
                    <span className="text-xs font-mono text-[#6B7280] dark:text-white/60">{r.Committee}</span>
                    <Link href={`/documents/${encodeURIComponent(r.Reference)}`} className="ml-auto text-xs px-2.5 py-1 rounded-full bg-white dark:bg-white/[0.06] border font-bold">Consulter →</Link>
                  </div>
                  <div className="mt-1 text-sm font-semibold text-[#0B1120] dark:text-white">{r.Title}</div>
                </div>
              ))}
            </div>
            <div className="mt-4 rounded-xl bg-[#F8F9FC] dark:bg-white/[0.04] border border-[#E5E7EB] dark:border-white/10 p-3 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">
              Réponses générées à partir du corpus officiel uniquement. En l’absence de source pertinente, le système l’indiquera explicitement.
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-2">
          <Link href="/" className="h-9 inline-flex items-center gap-1.5 px-4 rounded-full bg-white dark:bg-[#131B2C] border text-sm font-bold">← Catalogue</Link>
          <Link href="/watch" className="h-9 inline-flex items-center gap-1.5 px-4 rounded-full bg-[#0B1120] dark:bg-white text-white dark:text-[#0B1120] text-sm font-bold">Watch <Icons.clock className="h-4 w-4" /></Link>
        </div>
      </div>
    </div>
  );
}
