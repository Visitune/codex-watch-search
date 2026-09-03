#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";

// Extrait 3 PDFs EN pour démo indexation contenu
const samples = ["CXC 1-1969", "CXS 1-1985", "CXG 2-1985"];
const catalog = JSON.parse(fs.readFileSync("data/catalog-snapshot.json", "utf-8"));
const docs = catalog.standards ?? catalog.Standards ?? [];

for (const ref of samples) {
  const doc = docs.find((d) => d.Reference === ref);
  if (!doc) { console.log("not found", ref); continue; }
  const file = doc.Description?.en;
  if (!file) { console.log("no EN", ref); continue; }
  const url = `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(file)}?lang=en&id=${doc.SharePointId}`;
  console.log(`→ ${ref} ${url}`);
  const res = await fetch(url, { headers: { "User-Agent": "CodexWatch/1.0" } });
  if (!res.ok) { console.log("HTTP", res.status); continue; }
  const buf = Buffer.from(await res.arrayBuffer());
  const sha = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 8);
  // try pdf-parse
  try {
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({ data: buf });
    const result = await parser.getText();
    await parser.destroy();
    const text = (result.text || "").replace(/\s+/g, " ").trim();
    console.log(`  ${ref} → ${buf.length} bytes sha:${sha} → ${text.length} chars, ${text.slice(0, 160)}...`);
    // save sample
    const outDir = path.join(process.cwd(), "data", "samples");
    fs.mkdirSync(outDir, { recursive: true });
    fs.writeFileSync(path.join(outDir, `${ref.replace(/[^A-Za-z0-9]/g, "_")}_en.txt`), text.slice(0, 8000), "utf-8");
    fs.writeFileSync(path.join(outDir, `${ref.replace(/[^A-Za-z0-9]/g, "_")}_en.sha`), sha, "utf-8");
  } catch (e) {
    console.log("  parse failed", e.message);
  }
}
console.log("done samples");
