import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { verifyHead } from "@/lib/downloader";

export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const ref = decodeURIComponent(reference);
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return NextResponse.json({ error: "No snapshot" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const doc = (raw.standards ?? raw.Standards ?? []).find((d: { Reference: string }) => d.Reference === ref);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const en = await verifyHead(doc, "en");
  const fr = await verifyHead(doc, "fr");
  return NextResponse.json({ reference: ref, en, fr });
}
