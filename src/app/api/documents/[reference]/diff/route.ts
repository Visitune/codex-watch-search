import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { extractSections, diffSections, summarizeChanges } from "@/lib/diff";

export async function GET(req: Request, { params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const ref = decodeURIComponent(reference);
  const url = new URL(req.url);
  const from = url.searchParams.get("from"); // sha or "prev"
  const to = url.searchParams.get("to");

  // Charge les 2 versions: par défaut, on compare le corpus actuel vs une version simulée (demo)
  // En prod, oncomparerait 2 SHA stockés dans data/corpus/meta.json
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
  } else if (from && fs.existsSync(path.join(process.cwd(), "data", "corpus", `${from}.txt`))) {
    prevText = fs.readFileSync(path.join(process.cwd(), "data", "corpus", `${from}.txt`), "utf-8");
    mode = "from_param";
  } else {
    // Demo: on simule une ancienne version en tronquant 5% + modifiant un titre
    prevText = curText.slice(0, Math.floor(curText.length * 0.97));
    mode = "simulated_demo";
  }

  const oldSecs = extractSections(prevText);
  const newSecs = extractSections(curText);
  const changes = diffSections(oldSecs, newSecs);

  return NextResponse.json({
    reference: ref,
    mode,
    oldSections: oldSecs.length,
    newSections: newSecs.length,
    changes,
    summary: summarizeChanges(changes),
    // Pour debug, on renvoie les titres
    oldTitles: oldSecs.slice(0, 5).map((s) => `${s.number} ${s.title}`),
    newTitles: newSecs.slice(0, 5).map((s) => `${s.number} ${s.title}`),
  });
}
