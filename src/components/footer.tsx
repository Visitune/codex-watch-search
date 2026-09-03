import Link from "next/link";
import { Icons } from "./icons";

export function Footer() {
  return (
    <footer className="border-t border-[#E5E7EB] dark:border-white/[0.06] bg-white dark:bg-[#0D1420]">
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <a href="https://visipilot.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 group">
              <div className="h-8 w-8 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform"><Icons.shield className="h-4 w-4" /></div>
              <span className="font-extrabold tracking-tight text-sm group-hover:text-[#F97316] transition-colors">CODEX <span className="text-[#F97316]">WATCH</span></span>
            </a>
            <p className="mt-2 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">Portail de veille et de recherche sur les textes officiels du Codex Alimentarius. Adaptation par <a href="https://visipilot.com" target="_blank" rel="noopener noreferrer" className="underline decoration-[#F97316]/30 underline-offset-2 hover:text-[#F97316]">visipilot.com</a> pour faciliter la recherche et la navigation.</p>
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-[#9CA3AF]">PRODUIT</div>
            <ul className="mt-2 space-y-1 text-sm text-[#374151] dark:text-white/70">
              <li><Link href="/" className="hover:text-[#F97316]">Catalogue</Link></li>
              <li><Link href="/watch" className="hover:text-[#F97316]">Watch</Link></li>
              <li><Link href="/ask" className="hover:text-[#F97316]">Ask</Link></li>
              <li><Link href="/dashboard" className="hover:text-[#F97316]">Dashboard</Link></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-[#9CA3AF]">SOURCE OFFICIELLE</div>
            <ul className="mt-2 space-y-1 text-sm text-[#374151] dark:text-white/70">
              <li><a href="https://codex.fao.org/codex-texts/find-a-codex-text" target="_blank" className="hover:text-[#F97316] inline-flex items-center gap-1">Find a Codex text <Icons.external className="h-3 w-3" /></a></li>
              <li><a href="https://www.fao.org/fao-who-codexalimentarius/codex-texts/en/" target="_blank" className="hover:text-[#F97316]">FAO Texts</a></li>
              <li><a href="https://codex.fao.org/" target="_blank" className="hover:text-[#F97316]">codex.fao.org</a></li>
            </ul>
          </div>
          <div>
            <div className="text-xs font-mono tracking-widest text-[#9CA3AF]">INFORMATIONS</div>
            <ul className="mt-2 space-y-1 text-xs leading-relaxed text-[#6B7280] dark:text-white/60">
              <li>Textes officiels uniquement</li>
              <li>Veille quotidienne • 6 langues</li>
              <li>Mise à jour automatique</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-[#E5E7EB] dark:border-white/[0.06] flex flex-col gap-3 text-xs leading-relaxed">
          <p className="font-mono text-[#9CA3AF]">© 2026 Codex Watch — Service indépendant • Contenu Codex Alimentarius © FAO/WHO • Ce site n’est pas un site officiel du Codex. Adaptation réalisée par <a href="https://visipilot.com" target="_blank" rel="noopener noreferrer" className="underline decoration-[#F97316]/30 underline-offset-2 hover:text-[#F97316] font-bold">visipilot.com</a> — ce portail est mis à disposition pour faciliter la recherche et la navigation. Pour les informations officielles, consultez <a href="https://codex.fao.org/" target="_blank" rel="noopener noreferrer" className="underline decoration-[#F97316]/30 underline-offset-2 hover:text-[#F97316]">codex.fao.org</a>.</p>
          <div className="flex flex-col sm:flex-row gap-2 justify-between font-mono text-[#9CA3AF] pt-3 border-t border-[#E5E7EB] dark:border-white/[0.04]">
            <span>401 textes • EN/FR prioritaires • Veille quotidienne</span>
            <a href="https://visipilot.com" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 hover:text-[#F97316]">par visipilot.com <Icons.external className="h-3 w-3" /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
