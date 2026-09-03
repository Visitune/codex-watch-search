import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildPdfUrl } from "@/lib/codex-connector";
import { extractOne } from "@/lib/extractor";

export async function GET(_req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const ref = decodeURIComponent(reference);
  const p = path.join(process.cwd(), "data", "catalog-snapshot.json");
  if (!fs.existsSync(p)) return NextResponse.json({ error: "No snapshot" }, { status: 404 });
  const raw = JSON.parse(fs.readFileSync(p, "utf-8"));
  const doc = (raw.standards ?? raw.Standards ?? []).find((d: { Reference: string }) => d.Reference === ref);
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const lang = (_req as Request & { url: string }).url.includes("lang=fr") ? "fr" : "en";
  // support ?lang=fr
  const urlObj = new URL(_req.url);
  const qLang = (urlObj.searchParams.get("lang") as "en" | "fr") ?? "en";
  const sourceUrl = buildPdfUrl(doc, qLang);
  if (!sourceUrl) return NextResponse.json({ reference: ref, lang: qLang, status: "NOT_AVAILABLE" });
  const result = await extractOne(ref, sourceUrl, qLang);
  return NextResponse.json(result);
}
