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
    const scored = standards
      .map((s) => {
        const ref = s.Reference.toLowerCase();
        const title = s.Title.toLowerCase();
        const com = s.Committee.toLowerCase();
        let score = 0;
        if (ref === q) score = 100;
        else if (ref.includes(q)) score = 80;
        else if (title.includes(q)) score = 60;
        else if (com.includes(q)) score = 40;
        else score = 0;
        // token overlap
        const tokens = q.split(/\s+/).filter(Boolean);
        for (const t of tokens) if (title.includes(t)) score += 5;
        const match = ref.includes(q) || title.includes(q) || com.includes(q);
        return { doc: s, score, match };
      })
      .filter((x) => x.match)
      .sort((a, b) => b.score - a.score)
      .map((x) => x.doc);
    standards = scored;
  }
  return NextResponse.json({ count: standards.length, results: standards.slice(0, 100), ranked: !!q });
}
