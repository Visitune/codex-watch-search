import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

export async function GET() {
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return NextResponse.json({ error: "No snapshot" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const standards = raw.standards ?? raw.Standards ?? [];
  return NextResponse.json({ totalCount: raw.totalCount ?? raw.TotalCount, fetchedAt: raw.fetchedAt, standards });
}
