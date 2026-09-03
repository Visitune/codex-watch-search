import fs from "fs";
import path from "path";

type RawDoc = { Reference: string; Title: string; Committee: string; LastModified: number | null; Type: number | null };

export type WatchBulletin = {
  generatedAt: string;
  snapshotAt: string;
  total: number;
  byType: Record<string, number>;
  recents: RawDoc[]; // LastModified >= current year or 2025
  newTranslations?: unknown;
};

export function loadCatalog(): { standards: RawDoc[]; totalCount: number; fetchedAt: string } {
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return { standards: [], totalCount: 0, fetchedAt: "" };
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  return { standards: raw.standards ?? raw.Standards ?? [], totalCount: raw.totalCount ?? raw.TotalCount ?? 0, fetchedAt: raw.fetchedAt ?? "" };
}

export function buildBulletin(): WatchBulletin {
  const { standards, fetchedAt } = loadCatalog();
  const byType: Record<string, number> = {};
  for (const s of standards) {
    const k = String(s.Type);
    byType[k] = (byType[k] || 0) + 1;
  }
  const recents = standards.filter((s) => (s.LastModified ?? 0) >= 2025).sort((a, b) => (b.LastModified ?? 0) - (a.LastModified ?? 0)).slice(0, 20);
  return { generatedAt: new Date().toISOString(), snapshotAt: fetchedAt, total: standards.length, byType, recents };
}
