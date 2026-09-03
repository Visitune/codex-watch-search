import fs from "fs";
import path from "path";
import MiniSearch from "minisearch";

let cached: MiniSearch | null = null;
let cachedMtime = 0;

function loadMini(): MiniSearch | null {
  const candidates = [
    path.join(process.cwd(), "public", "search-index.json"),
    path.join(process.cwd(), "data", "search-index.json"),
  ];
  let p: string | null = null;
  for (const c of candidates) if (fs.existsSync(c)) { p = c; break; }
  if (!p) return null;
  const mtime = fs.statSync(p).mtimeMs;
  if (cached && cachedMtime === mtime) return cached;
  const raw = fs.readFileSync(p, "utf-8");
  cached = MiniSearch.loadJSON(raw, {
    fields: ["Reference", "Title", "Committee", "Text"],
    storeFields: ["Reference", "Title", "Committee", "Type", "LastModified", "Description", "SharePointId"],
    searchOptions: { boost: { Reference: 5, Title: 3, Committee: 1.5, Text: 1 }, prefix: true, fuzzy: 0.2 },
  });
  cachedMtime = mtime;
  return cached;
}

export type SearchDoc = {
  Reference: string;
  Title: string;
  Committee: string;
  Type: number | null;
  LastModified: number | null;
  Description: Record<string, string>;
  SharePointId: number;
};

function normalize(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function miniSearch(q: string, allDocs: SearchDoc[]): SearchDoc[] | null {
  const mini = loadMini();
  if (!mini) return null;
  if (!q) return null;
  const nq = normalize(q);
  let results = mini.search(nq);
  if (results.length === 0 && nq !== q.toLowerCase()) results = mini.search(q.toLowerCase());
  const byRef = new Map(allDocs.map((d) => [d.Reference, d]));
  return results.map((r) => byRef.get(r.Reference as string) ?? (r as unknown as SearchDoc)).filter(Boolean) as SearchDoc[];
}

// SQLite helper — SQL light dans le projet (data/codex.db via sql.js)
let sqliteCache: { db: unknown; mtime: number } | null = null;

export async function sqliteQuery(sql: string, params: unknown[] = []): Promise<Record<string, unknown>[]> {
  const candidates = [path.join(process.cwd(), "public", "codex.db"), path.join(process.cwd(), "data", "codex.db")];
  let p: string | null = null;
  for (const c of candidates) if (fs.existsSync(c)) { p = c; break; }
  if (!p) throw new Error("No codex.db");
  const mtime = fs.statSync(p).mtimeMs;
  // lazy init sql.js
  // @ts-ignore
  const initSqlJs = (await import("sql.js")).default;
  const SQL = await initSqlJs({ locateFile: (file: string) => path.join(process.cwd(), "node_modules", "sql.js", "dist", file) });
  const buf = fs.readFileSync(p);
  const db = new SQL.Database(buf);
  const stmt = db.prepare(sql);
  if (params.length) stmt.bind(params);
  const rows: Record<string, unknown>[] = [];
  while (stmt.step()) {
    rows.push(stmt.getAsObject());
  }
  stmt.free();
  db.close();
  return rows;
}
