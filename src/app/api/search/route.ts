import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { miniSearch, sqliteQuery } from "@/lib/search";

type RawDoc = { Reference: string; Title: string; Committee: string; LastModified: number | null; Type: number | null; Description: Record<string,string>; SharePointId: number };

function fileSearch(q: string, type: string | null, committee: string | null, standards: RawDoc[]) {
  let filtered = standards;
  if (type) filtered = filtered.filter((s) => String(s.Type) === type);
  if (committee) filtered = filtered.filter((s) => s.Committee === committee);
  if (!q) return { count: filtered.length, results: filtered.slice(0, 100), ranked: false as const, source: "file_fallback" as const };
  // try MiniSearch first (hybride Text)
  const mini = miniSearch(q, filtered);
  if (mini && mini.length > 0) {
    let results = mini;
    if (type) results = results.filter((s) => String(s.Type) === type);
    if (committee) results = results.filter((s) => s.Committee === committee);
    if (results.length > 0) return { count: results.length, results: results.slice(0, 100), ranked: true as const, source: "minisearch" as const };
  }
  // fallback includes scoring
  const scored = filtered
    .map((s) => {
      const ref = s.Reference.toLowerCase();
      const title = s.Title.toLowerCase();
      const com = s.Committee.toLowerCase();
      let score = 0;
      if (ref === q) score = 100;
      else if (ref.includes(q)) score = 80;
      else if (title.includes(q)) score = 60;
      else if (com.includes(q)) score = 40;
      const tokens = q.split(/\s+/).filter(Boolean);
      for (const t of tokens) if (title.includes(t)) score += 5;
      const match = ref.includes(q) || title.includes(q) || com.includes(q);
      return { doc: s, score, match };
    })
    .filter((x) => x.match)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.doc);
  return { count: scored.length, results: scored.slice(0, 100), ranked: true as const, source: "file_fallback" as const };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase().trim();
  const type = searchParams.get("type");
  const committee = searchParams.get("committee");
  const useSql = searchParams.get("sql") === "1";

  // Option hybride: si ?sql=1 → démo SQL light (data/codex.db)
  if (useSql) {
    try {
      const where: string[] = [];
      const params: unknown[] = [];
      if (type) {
        const map: Record<string,string> = { "5":"CXS","1":"CXG","4":"CXC","3":"CXM","2":"CXA" };
        const docType = map[type];
        if (docType) where.push(`document_type = '${docType.replace(/'/g,"''")}'`);
      }
      if (committee) where.push(`committee = '${committee.replace(/'/g,"''")}'`);
      if (q) where.push(`(lower(reference) LIKE '%${q.replace(/'/g,"''")}%' OR lower(title) LIKE '%${q.replace(/'/g,"''")}%')`);
      const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
      const rows = await sqliteQuery(`SELECT reference as Reference, title as Title, committee as Committee, last_modified as LastModified, document_type as docType, sharepoint_id as SharePointId FROM codex_document ${whereSql} LIMIT 100`);
      const typeRev: Record<string,number> = { CXS:5, CXG:1, CXC:4, CXM:3, CXA:2 };
      const results = rows.map((r) => ({
        Reference: r.Reference as string,
        Title: r.Title as string,
        Committee: r.Committee as string,
        LastModified: r.LastModified as number | null,
        Type: typeRev[r.docType as string] ?? null,
        Description: {} as Record<string,string>,
        SharePointId: r.SharePointId as number,
      }));
      return NextResponse.json({ count: results.length, results, source: "sqlite", q });
    } catch (e) {
      return NextResponse.json({ error: String(e), fallback: "minisearch" }, { status: 500 });
    }
  }

  // Postgres legacy désactivé par défaut (hybride GitHub). Activer seulement si USE_POSTGRES=1
  if (process.env.DATABASE_URL && process.env.USE_POSTGRES === "1") {
    try {
      const postgres = (await import("postgres")).default;
      const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
      let where = "WHERE 1=1";
      if (type) {
        const map: Record<string,string> = { "5":"CXS","1":"CXG","4":"CXC","3":"CXM","2":"CXA" };
        const docType = map[type];
        if (docType) where += ` AND document_type = '${docType}'`;
      }
      if (committee) where += ` AND committee = '${committee.replace(/'/g,"''")}'`;
      let select = `SELECT reference as "Reference", title_original as "Title", committee as "Committee", current_modified_date as "LastModified", document_type as "_type" FROM codex_document`;
      let orderBy = "ORDER BY reference ASC";
      if (q) {
        const esc = q.replace(/'/g,"''");
        select = `SELECT reference as "Reference", title_original as "Title", committee as "Committee", current_modified_date as "LastModified", document_type as "_type", ts_rank(to_tsvector('french', coalesce(title_original,'')), plainto_tsquery('french', '${esc}')) + CASE WHEN lower(reference) LIKE lower('%${esc}%') THEN 2 ELSE 0 END as rank FROM codex_document`;
        where += ` AND ( to_tsvector('french', coalesce(title_original,'')) @@ plainto_tsquery('french', '${esc}') OR lower(reference) LIKE lower('%${esc}%'))`;
        orderBy = "ORDER BY rank DESC, reference ASC";
      }
      const rows = await sql.unsafe(`${select} ${where} ${orderBy} LIMIT 100`);
      await sql.end();
      const typeRev: Record<string,number> = { CXS:5, CXG:1, CXC:4, CXM:3, CXA:2 };
      const results = (rows as Record<string,unknown>[]).map((r) => ({
        Reference: r.Reference as string,
        Title: r.Title as string,
        Committee: r.Committee as string,
        LastModified: r.LastModified as number | null,
        Type: typeRev[r._type as string] ?? null,
        Description: {} as Record<string,string>,
      }));
      return NextResponse.json({ count: results.length, results, source: "postgres_fts", q });
    } catch (e) {
      console.error("DB search failed, fallback hybrid", e);
    }
  }

  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return NextResponse.json({ error: "No snapshot" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const standards: RawDoc[] = raw.standards ?? raw.Standards ?? [];
  const r = fileSearch(q, type, committee, standards);
  return NextResponse.json({ ...r, q });
}
