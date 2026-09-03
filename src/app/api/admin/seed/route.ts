import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import postgres from "postgres";

export async function POST(req: Request) {
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) return NextResponse.json({ error: "DATABASE_URL not set" }, { status: 500 });

  const sql = postgres(process.env.DATABASE_URL, { ssl: "require", max: 1 });
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const standards: Array<{ Reference: string; Title: string; Committee: string; LastModified: number | null; Type: number | null; AdoptedYear: number | null }> = raw.standards ?? raw.Standards ?? [];

  await sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`;
  await sql`CREATE EXTENSION IF NOT EXISTS vector`;
  await sql`
    CREATE TABLE IF NOT EXISTS codex_document (
      id SERIAL PRIMARY KEY,
      reference VARCHAR(64) NOT NULL UNIQUE,
      document_type VARCHAR(8) NOT NULL,
      title_original TEXT NOT NULL,
      committee VARCHAR(32),
      first_adoption_year INTEGER,
      current_modified_date INTEGER,
      official_page_url TEXT,
      active BOOLEAN DEFAULT true,
      created_at TIMESTAMP DEFAULT NOW(),
      updated_at TIMESTAMP DEFAULT NOW()
    )
  `;
  const typeMap: Record<string, string> = { "5": "CXS", "1": "CXG", "4": "CXC", "3": "CXM", "2": "CXA" };
  let inserted = 0;
  for (const s of standards) {
    const docType = typeMap[String(s.Type)] ?? s.Reference.split(" ")[0] ?? "UNKNOWN";
    await sql`
      INSERT INTO codex_document (reference, document_type, title_original, committee, first_adoption_year, current_modified_date, official_page_url, active)
      VALUES (${s.Reference}, ${docType}, ${s.Title}, ${s.Committee}, ${s.AdoptedYear ?? null}, ${s.LastModified ?? null}, ${"https://codex.fao.org/codex-texts/find-a-codex-text"}, true)
      ON CONFLICT (reference) DO UPDATE SET
        title_original = EXCLUDED.title_original,
        committee = EXCLUDED.committee,
        current_modified_date = EXCLUDED.current_modified_date,
        updated_at = NOW()
    `;
    inserted++;
  }
  await sql`CREATE INDEX IF NOT EXISTS idx_doc_title_fr ON codex_document USING GIN (to_tsvector('french', coalesce(title_original,'')))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_doc_title_en ON codex_document USING GIN (to_tsvector('english', coalesce(title_original,'')))`;
  await sql`CREATE INDEX IF NOT EXISTS idx_doc_ref_trgm ON codex_document USING GIN (reference gin_trgm_ops)`;
  const [{ count }] = await sql`SELECT count(*)::int as count FROM codex_document`;
  await sql.end();
  return NextResponse.json({ ok: true, inserted, count, note: "FTS Postgres ready — /api/search bascule auto sur DB" });
}

export async function GET(req: Request) {
  return POST(req);
}
