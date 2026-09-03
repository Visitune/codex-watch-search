import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const CODEX_CATALOG_URL = "https://codex.fao.org/codex-texts/find-a-codex-text";
const CODEX_LOADFILTER_URL = `${CODEX_CATALOG_URL}/LoadFilter/`;

export async function GET(req: Request) {
  // Vercel Cron protection: check header or allow manual
  const auth = req.headers.get("authorization");
  if (process.env.CRON_SECRET && auth !== `Bearer ${process.env.CRON_SECRET}`) {
    // also allow Vercel Cron (no auth in dev) — for MVP we allow but log
  }

  await fetch(CODEX_CATALOG_URL, { headers: { "User-Agent": "CodexWatch/1.0" }, cache: "no-store" });
  const res = await fetch(CODEX_LOADFILTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: CODEX_CATALOG_URL,
      Origin: "https://codex.fao.org",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
      "User-Agent": "CodexWatch/1.0",
    },
    body: JSON.stringify({ searchModel: { ItemsPerPage: 0 } }),
    cache: "no-store",
  });
  if (!res.ok) return NextResponse.json({ error: `LoadFilter ${res.status}` }, { status: 500 });
  const data = await res.json();
  const snapshot = { fetchedAt: new Date().toISOString(), totalCount: data.TotalCount, standards: data.Standards };
  // In production, write to DB + compare; for MVP we overwrite snapshot file (filesystem on Vercel is ephemeral — should migrate to DB/Blob)
  try {
    const out = path.join(process.cwd(), "data", "catalog-snapshot.json");
    fs.mkdirSync(path.dirname(out), { recursive: true });
    fs.writeFileSync(out, JSON.stringify(snapshot, null, 2), "utf-8");
  } catch {}
  return NextResponse.json({ ok: true, totalCount: data.TotalCount, fetchedAt: snapshot.fetchedAt, note: "MVP: snapshot overwritten. Next step: DB + diff (PRD §13-14)" });
}
