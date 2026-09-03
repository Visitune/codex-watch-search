import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";

type RawDoc = { Reference: string; Title: string; Committee: string; LastModified: number | null; Type: number | null; Description: Record<string,string> };

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const type = searchParams.get("type");
  const committee = searchParams.get("committee");

  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return NextResponse.json({ error: "No snapshot" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  let standards: RawDoc[] = raw.standards ?? raw.Standards ?? [];

  if (type) standards = standards.filter((s) => String(s.Type) === type);
  if (committee) standards = standards.filter((s) => s.Committee === committee);
  if (q) {
    standards = standards.filter(
      (s) => s.Reference.toLowerCase().includes(q) || s.Title.toLowerCase().includes(q) || s.Committee.toLowerCase().includes(q)
    );
  }
  return NextResponse.json({ count: standards.length, results: standards.slice(0, 100) });
}
