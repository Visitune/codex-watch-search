#!/usr/bin/env node
import fs from "fs";
import path from "path";
import MiniSearch from "minisearch";

const src = path.join(process.cwd(), "data", "catalog-snapshot.json");
const out = path.join(process.cwd(), "public", "search-index.json");
const outMeta = path.join(process.cwd(), "data", "search-index.json");

if (!fs.existsSync(src)) {
  console.error("Missing", src, "run npm run collector:discovery first");
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(src, "utf-8"));
const samplesDir = path.join(process.cwd(), "data", "samples");
const corpusDir = path.join(process.cwd(), "data", "corpus");
const docs = (raw.standards ?? raw.Standards ?? []).map((d, id) => {
  let Text = "";
  // Concatène EN + FR si disponibles (bilingue FR/EN)
  const base = d.Reference.replace(/[^A-Za-z0-9]/g, "_");
  const candidates = [
    path.join(corpusDir, `${base}.txt`),
    path.join(corpusDir, `${base}_fr.txt`),
    path.join(corpusDir, `${base}_en.txt`),
    path.join(samplesDir, `${base}_en.txt`),
    path.join(samplesDir, `${base}.txt`),
  ];
  const parts = [];
  for (const p of candidates) if (fs.existsSync(p)) parts.push(fs.readFileSync(p, "utf-8").slice(0, 8000));
  // aussi cherche en FR dans samples/corpus avec suffixe
  if (parts.length) Text = parts.join(" \n ").slice(0, 15000);
  // fallback ancien nom
  if (!Text) {
    const key = `${base}_en.txt`;
    for (const dir of [corpusDir, samplesDir]) {
      const p = path.join(dir, key);
      if (fs.existsSync(p)) { Text = fs.readFileSync(p, "utf-8").slice(0, 15000); break; }
    }
  }
  return {
    id,
    Reference: d.Reference,
    Title: d.Title,
    Committee: d.Committee,
    Type: d.Type,
    LastModified: d.LastModified,
    Description: d.Description,
    SharePointId: d.SharePointId,
    Text,
  };
});

// Normalisation accents + casse pour FR/EN
const normalize = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const processTerm = (term) => normalize(term);

// MiniSearch: tokenise fr+en, field weights — Text boosté mais moins que Reference
const mini = new MiniSearch({
  fields: ["Reference", "Title", "Committee", "Text"],
  storeFields: ["Reference", "Title", "Committee", "Type", "LastModified", "Description", "SharePointId"],
  searchOptions: {
    boost: { Reference: 5, Title: 3, Committee: 1.5, Text: 1 },
    prefix: true,
    fuzzy: 0.2,
  },
  processTerm,
});
mini.addAll(docs);

const serialized = JSON.stringify(mini);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, serialized, "utf-8");
fs.mkdirSync(path.dirname(outMeta), { recursive: true });
fs.writeFileSync(outMeta, serialized, "utf-8");

// Also write a tiny meta for UI
const withText = docs.filter((d) => d.Text).length;
const meta = { count: docs.length, withText, fields: ["Reference","Title","Committee","Text"], generatedAt: new Date().toISOString() };
fs.writeFileSync(path.join(process.cwd(), "public", "search-meta.json"), JSON.stringify(meta, null, 2), "utf-8");

console.log(`MiniSearch index: ${docs.length} docs → ${out} (${(serialized.length/1024).toFixed(1)} KB)`);
console.log(`Also → ${outMeta}`);
