import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type RawDoc = { Reference: string; Title: string; Committee: string; LastModified: number | null; Type: number | null; Description: Record<string,string> };

function fileSearch(q: string, type: string | null, committee: string | null, standards: RawDoc[]) {
  let filtered = standards;
  if (type) filtered = filtered.filter((s) => String(s.Type) === type);
  if (committee) filtered = filtered.filter((s) => s.Committee === committee);
  if (!q) return { count: filtered.length, results: filtered.slice(0, 100), ranked: false as const };
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
  return { count: scored.length, results: scored.slice(0, 100), ranked: true as const };
}

async function dbSearch(q: string, type: string | null, committee: string | null) {
  const postgres = (await import("postgres")).default;
  const sql = postgres(process.env.DATABASE_URL!, { ssl: "require", max: 1 });
  // FTS: on utilise 'french' par défaut + fallback english, + trigram pour référence exacte
  const params: unknown[] = [];
  let where = "WHERE 1=1";
  if (type) {
    const map: Record<string,string> = { "5":"CXS","1":"CXG","4":"CXC","3":"CXM","2":"CXA" };
    const docType = map[type];
    if (docType) { where += ` AND document_type = '${docType}'`; }
  }
  if (committee) where += ` AND committee = '${committee.replace(/'/g,"''")}'`;
  let orderBy = "ORDER BY reference ASC";
  let select = "SELECT reference as \"Reference\", title_original as \"Title\", committee as \"Committee\", current_modified_date as \"LastModified\", document_type as \"_type\" FROM codex_document";
  if (q) {
    const esc = q.replace(/'/g,"''");
    // ranking: ts_rank pour title + bonus si référence contient q
    select = `SELECT reference as "Reference", title_original as "Title", committee as "Committee", current_modified_date as "LastModified",
      ts_rank(to_tsvector('french', coalesce(title_original,'')), plainto_tsquery('french', '${esc}')) +
      ts_rank(to_tsvector('english', coalesce(title_original,'')), plainto_tsquery('english', '${esc}')) +
      CASE WHEN lower(reference) LIKE lower('%${esc}%') THEN 2 ELSE 0 END as rank
      FROM codex_document`;
    where += ` AND ( to_tsvector('french', coalesce(title_original,'')) @@ plainto_tsquery('french', '${esc}')
      OR to_tsvector('english', coalesce(title_original,'')) @@ plainto_tsquery('english', '${esc}')
      OR lower(reference) LIKE lower('%${esc}%') OR lower(committee) LIKE lower('%${esc}%') )`;
    orderBy = "ORDER BY rank DESC, reference ASC";
  }
  const query = `${select} ${where} ${orderBy} LIMIT 100`;
  const rows = await sql.unsafe(query);
  await sql.end();
  // map _type to PRD Type number
  const typeRev: Record<string,number> = { CXS:5, CXG:1, CXC:4, CXM:3, CXA:2 };
  const results = rows.map((r: Record<string, unknown>) => ({
    Reference: r.Reference as string,
    Title: r.Title as string,
    Committee: r.Committee as string,
    LastModified: r.LastModified as number | null,
    Type: typeRev[r._type as string] ?? null,
    Description: {} as Record<string,string>,
  }));
  return { count: results.length, results, ranked: !!q, source: "postgres_fts" as const };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const type = searchParams.get("type");
  const committee = searchParams.get("committee");

  // Si DATABASE_URL présent → FTS Postgres, sinon fallback fichier
  if (process.env.DATABASE_URL) {
    try {
      const r = await dbSearch(q, type, committee);
      return NextResponse.json({ ...r, q });
    } catch (e) {
      console.error("DB search failed, fallback file", e);
    }
  }

  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return NextResponse.json({ error: "No snapshot" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const standards: RawDoc[] = raw.standards ?? raw.Standards ?? [];
  const r = fileSearch(q, type, committee, standards);
  return NextResponse.json({ ...r, source: "file_fallback", q });
}
