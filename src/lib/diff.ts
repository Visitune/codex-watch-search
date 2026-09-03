export type ChunkChange = {
  chunkIndex: number;
  changeType: "ADDED" | "REMOVED" | "MODIFIED" | "UNCHANGED";
  oldText: string;
  newText: string;
};

export type DiffResult = {
  reference: string;
  oldHash: string;
  newHash: string;
  changed: boolean;
  totalChunks: number;
  added: number;
  removed: number;
  modified: number;
  humanSummary: string;
  chunks: ChunkChange[];
  mode?: string;
};

function hash(s: string): string {
  let h = 5381;
  for (let i = 0; i < s.length; i++) h = ((h << 5) + h) ^ s.charCodeAt(i);
  return (h >>> 0).toString(16);
}

// Découpe en paragraphes / blocs de ~400 caractères non vide
function chunkify(text: string): string[] {
  const normalized = text.replace(/\r/g, "").replace(/\n{2,}/g, "\n");
  const raw = normalized.split(/\n+/).map((s) => s.trim()).filter((s) => s.length > 0);
  if (raw.length === 0) return [text];
  // grouper en blocs de ~400 chars
  const chunks: string[] = [];
  let cur = "";
  for (const part of raw) {
    if (cur.length + part.length > 400 && cur.length > 0) {
      chunks.push(cur.trim());
      cur = part;
    } else {
      cur += (cur ? " " : "") + part;
    }
  }
  if (cur.trim()) chunks.push(cur.trim());
  return chunks;
}

export function buildDiff(oldText: string, newText: string, reference: string): DiffResult {
  const oldChunks = chunkify(oldText);
  const newChunks = chunkify(newText);
  const chunks: ChunkChange[] = [];
  const max = Math.max(oldChunks.length, newChunks.length);
  let added = 0;
  let removed = 0;
  let modified = 0;

  for (let i = 0; i < max; i++) {
    const oldTextC = oldChunks[i] || "";
    const newTextC = newChunks[i] || "";
    if (!oldTextC && newTextC) {
      chunks.push({ chunkIndex: i, changeType: "ADDED", oldText: "", newText: newTextC });
      added++;
    } else if (oldTextC && !newTextC) {
      chunks.push({ chunkIndex: i, changeType: "REMOVED", oldText: oldTextC, newText: "" });
      removed++;
    } else if (oldTextC !== newTextC) {
      chunks.push({ chunkIndex: i, changeType: "MODIFIED", oldText: oldTextC, newText: newTextC });
      modified++;
    } else {
      chunks.push({ chunkIndex: i, changeType: "UNCHANGED", oldText: oldTextC, newText: newTextC });
    }
  }

  const humanSummary = buildSummary(added, removed, modified, max);
  return {
    reference,
    oldHash: hash(oldText),
    newHash: hash(newText),
    changed: added + removed + modified > 0,
    totalChunks: max,
    added,
    removed,
    modified,
    humanSummary,
    chunks,
  };
}

function buildSummary(added: number, removed: number, modified: number, total: number): string {
  const parts: string[] = [];
  if (added > 0) parts.push(`${added} paragraphe${added > 1 ? "s" : ""} ajouté${added > 1 ? "s" : ""}`);
  if (removed > 0) parts.push(`${removed} paragraphe${removed > 1 ? "s" : ""} retiré${removed > 1 ? "s" : ""}`);
  if (modified > 0) parts.push(`${modified} paragraphe${modified > 1 ? "s" : ""} modifié${modified > 1 ? "s" : ""}`);
  if (parts.length === 0) return "Aucun changement de contenu détecté.";
  return `Mise à jour du document : ${parts.join(", ")}. ${total - added - removed - modified} paragraphe(s) inchangé(s).`;
}

export function readableDiff(result: DiffResult): string {
  if (!result.changed) return result.humanSummary;
  const lines: string[] = [result.humanSummary, ""];
  for (const c of result.chunks) {
    if (c.changeType === "UNCHANGED") continue;
    const tag = c.changeType === "ADDED" ? "✓ AJOUTÉ" : c.changeType === "REMOVED" ? "✗ RETIRÉ" : "≠ MODIFIÉ";
    lines.push(`─── ${tag} (paragraphe ${c.chunkIndex + 1}) ───`);
    if (c.oldText) lines.push(`Avant : ${c.oldText.slice(0, 200)}`);
    if (c.newText) lines.push(`Après : ${c.newText.slice(0, 200)}`);
    lines.push("");
  }
  return lines.join("\n").trim();
}
