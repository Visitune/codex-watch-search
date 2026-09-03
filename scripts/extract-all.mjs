#!/usr/bin/env node
import fs from "fs";
import path from "path";
import crypto from "crypto";

const catalogPath = "data/catalog-snapshot.json";
const outDir = "data/corpus";
const metaPath = "data/corpus/meta.json";
const CONCURRENCY = 6;
const LIMIT = parseInt(process.env.LIMIT ?? "40", 10); // 40 par défaut, 401 pour full

if (!fs.existsSync(catalogPath)) { console.error("catalog missing"); process.exit(1); }
const raw = JSON.parse(fs.readFileSync(catalogPath, "utf-8"));
const docs = (raw.standards ?? raw.Standards ?? []).filter((d) => d.Description?.en).slice(0, LIMIT);

fs.mkdirSync(outDir, { recursive: true });
let meta = {};
if (fs.existsSync(metaPath)) try { meta = JSON.parse(fs.readFileSync(metaPath, "utf-8")); } catch {}

let done = 0, skipped = 0, failed = 0;
const queue = [...docs];

async function worker() {
  while (queue.length) {
    const doc = queue.shift();
    const ref = doc.Reference;
    const key = ref.replace(/[^A-Za-z0-9]/g, "_");
    const txtPath = path.join(outDir, `${key}.txt`);
    const shaPath = path.join(outDir, `${key}.sha`);
    // skip if already exists and sha matches (cache)
    if (fs.existsSync(txtPath) && fs.existsSync(shaPath)) { skipped++; continue; }
    const file = doc.Description.en;
    const url = `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(file)}?lang=en&id=${doc.SharePointId}`;
    try {
      const res = await fetch(url, { headers: { "User-Agent": "CodexWatch/1.0" } });
      if (!res.ok) { failed++; console.log(`✗ ${ref} HTTP ${res.status}`); continue; }
      const buf = Buffer.from(await res.arrayBuffer());
      const sha = crypto.createHash("sha256").update(buf).digest("hex");
      const { PDFParse } = await import("pdf-parse");
      const parser = new PDFParse({ data: buf });
      const result = await parser.getText();
      await parser.destroy();
      const text = (result.text || "").replace(/\s+/g, " ").trim().slice(0, 15000);
      fs.writeFileSync(txtPath, text, "utf-8");
      fs.writeFileSync(shaPath, sha, "utf-8");
      meta[ref] = { sha: sha.slice(0, 12), size: buf.length, chars: text.length, lastIndexed: new Date().toISOString() };
      done++;
      if (done % 10 === 0) console.log(`… ${done}/${docs.length} ${ref} ${text.length} chars`);
    } catch (e) {
      failed++;
      console.log(`✗ ${ref} ${e.message?.slice(0, 120)}`);
    }
  }
}

console.log(`Extract ALL: ${docs.length} docs (LIMIT=${LIMIT}) conc=${CONCURRENCY}`);
await Promise.all(Array.from({ length: CONCURRENCY }, () => worker()));
fs.writeFileSync(metaPath, JSON.stringify(meta, null, 2), "utf-8");
console.log(`Done: ${done} new, ${skipped} cached, ${failed} failed → ${outDir} (${Object.keys(meta).length} total)`);
