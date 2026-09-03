import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { buildDiff, readableDiff } from "@/lib/diff";

export async function GET(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const ref = decodeURIComponent(reference);
  const url = new URL(req.url);
  const readable = url.searchParams.get("readable") !== "false";

  const base = ref.replace(/[^A-Za-z0-9]/g, "_");
  const curPath = path.join(process.cwd(), "data", "corpus", `${base}.txt`);
  const prevPath = path.join(process.cwd(), "data", "corpus", `${base}_prev.txt`);

  if (!fs.existsSync(curPath)) return NextResponse.json({ error: "No corpus for " + ref, hint: "Extrait EN non indexé" }, { status: 404 });

  const curText = fs.readFileSync(curPath, "utf-8");
  let prevText: string;
  let mode: string;

  if (fs.existsSync(prevPath)) {
    prevText = fs.readFileSync(prevPath, "utf-8");
    mode = "stored_prev";
  } else if (url.searchParams.get("from") && fs.existsSync(path.join(process.cwd(), "data", "corpus", `${url.searchParams.get("from")}.txt`))) {
    prevText = fs.readFileSync(path.join(process.cwd(), "data", "corpus", `${url.searchParams.get("from")}.txt`), "utf-8");
    mode = "from_param";
  } else {
    prevText = curText.slice(0, Math.floor(curText.length * 0.97));
    mode = "simulated_demo";
  }

  const result = buildDiff(prevText, curText, ref);
  result.mode = mode;

  if (readable) {
    return NextResponse.json({ ...result, readable: readableDiff(result) });
  }
  return NextResponse.json(result);
}
