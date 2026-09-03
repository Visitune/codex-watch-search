// Dictionnaire bilingue minimal Codex — assure que FR ↔ EN se retrouvent
export const FR_EN_SYNONYMS: Record<string, string[]> = {
  etiquetage: ["labelling", "labeling", "étiquetage"],
  étiquetage: ["labelling", "labeling", "etiquetage"],
  allergene: ["allergen", "allergène"],
  allergène: ["allergen", "allergene"],
  eau: ["water"],
  haccp: ["haccp"],
  hygiene: ["hygiène", "hygiene"],
  hygiène: ["hygiene", "hygiène"],
  additif: ["additive"],
  additifs: ["additives"],
  contaminant: ["contaminant"],
  contaminants: ["contaminants"],
  pesticide: ["pesticide"],
  pesticides: ["pesticides"],
  residu: ["residue"],
  résidu: ["residue"],
  résidus: ["residues", "mrl"],
  mrl: ["lmr", "résidu"],
};

export function expandQuery(q: string): string[] {
  const nq = q.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const terms = nq.split(/\s+/).filter(Boolean);
  const expanded = new Set<string>([nq]);
  for (const t of terms) {
    const syns = FR_EN_SYNONYMS[t];
    if (syns) syns.forEach((s) => expanded.add(s));
  }
  // aussi ajouter la version sans accent de chaque terme
  return Array.from(expanded);
}
