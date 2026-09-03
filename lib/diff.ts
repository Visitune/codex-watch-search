export type Section = { number: string; title: string; text: string; page?: number };
export type SectionChange = {
  sectionNumber: string;
  sectionTitle: string;
  changeType: "ADDED" | "REMOVED" | "MODIFIED" | "MOVED" | "FORMAT_ONLY";
  summary: string;
};

// Extraction sections Codex — heuristique simple mais robuste PRD §15
// Détecte: "1. Scope", "1.1 Definition", "ANNEX I", "SECTION 2", "5.3.1"
const HEADING_RE = /^\s*((?:\d+(?:\.\d+)*)|(?:ANNEX(?:ES)?\s+[IVX0-9]+)|(?:SECTION\s+\d+))\s*[-–.]?\s*(.+)?$/i;

export function extractSections(fullText: string): Section[] {
  const lines = fullText.split(/\n/);
  const sections: Section[] = [];
  let current: Section | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (current) {
      current.text = buffer.join("\n").trim();
      // FORMAT_ONLY vs vrai contenu: si < 30 chars, on ignore
      if (current.text.length > 20 || current.title) sections.push(current);
    }
    buffer = [];
  };

  for (const raw of lines) {
    const line = raw.trim();
    if (!line) { buffer.push(""); continue; }
    const m = line.match(HEADING_RE);
    // Heuristique: titre court (<120 chars) + commence par chiffre/ANNEX/SECTION
    if (m && line.length < 140 && (m[1].match(/^\d/) || m[1].toUpperCase().startsWith("ANNEX") || m[1].toUpperCase().startsWith("SECTION"))) {
      flush();
      current = { number: m[1].toUpperCase().replace(/\s+/g, " ").trim(), title: (m[2] || "").trim(), text: "" };
      // ne pas mettre le titre dans le buffer, il est déjà dans title
    } else {
      buffer.push(raw);
    }
  }
  flush();
  // Si aucun heading détecté, on renvoie 1 section "FULL"
  if (sections.length === 0) return [{ number: "FULL", title: "Document", text: fullText.trim().slice(0, 20000) }];
  return sections;
}

function hash(s: string): string {
  // hash simple djb2 pour comparer sans crypto
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

export function diffSections(oldSecs: Section[], newSecs: Section[]): SectionChange[] {
  const changes: SectionChange[] = [];
  const oldMap = new Map(oldSecs.map((s) => [s.number, s]));
  const newMap = new Map(newSecs.map((s) => [s.number, s]));

  // ADDED / MODIFIED
  for (const [num, ns] of newMap) {
    const os = oldMap.get(num);
    if (!os) {
      changes.push({ sectionNumber: num, sectionTitle: ns.title, changeType: "ADDED", summary: `Nouvelle section ${num}${ns.title ? ` — ${ns.title}` : ""}` });
    } else {
      const oh = hash(os.text.trim());
      const nh = hash(ns.text.trim());
      if (oh !== nh) {
        // FORMAT_ONLY si seule la casse/espaces change
        const oNorm = os.text.replace(/\s+/g, " ").trim().toLowerCase();
        const nNorm = ns.text.replace(/\s+/g, " ").trim().toLowerCase();
        const type = oNorm === nNorm ? "FORMAT_ONLY" : "MODIFIED";
        const summary = type === "FORMAT_ONLY" ? `Mise en forme §${num}` : `Contenu modifié §${num}${ns.title ? ` — ${ns.title}` : ""} (${Math.abs(ns.text.length - os.text.length)} chars)`;
        changes.push({ sectionNumber: num, sectionTitle: ns.title, changeType: type, summary });
      }
    }
  }
  // REMOVED
  for (const [num, os] of oldMap) {
    if (!newMap.has(num)) changes.push({ sectionNumber: num, sectionTitle: os.title, changeType: "REMOVED", summary: `Section retirée ${num}${os.title ? ` — ${os.title}` : ""}` });
  }
  // MOVED: même texte mais numéro différent — détection simple par hash
  // (optionnel, on garde ADDED/REMOVED pour l'instant)
  return changes.sort((a, b) => a.sectionNumber.localeCompare(b.sectionNumber, undefined, { numeric: true }));
}

export function summarizeChanges(changes: SectionChange[]): string {
  if (changes.length === 0) return "Aucun changement de contenu détecté (hash identique).";
  const byType = changes.reduce<Record<string, number>>((a, c) => { a[c.changeType] = (a[c.changeType] || 0) + 1; return a; }, {});
  return `${changes.length} section(s): ${Object.entries(byType).map(([k, v]) => `${v} ${k}`).join(", ")}`;
}
