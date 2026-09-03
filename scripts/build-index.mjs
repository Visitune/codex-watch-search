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
const docs = (raw.standards ?? raw.Standards ?? []).map((d, id) => ({
  id,
  Reference: d.Reference,
  Title: d.Title,
  Committee: d.Committee,
  Type: d.Type,
  LastModified: d.LastModified,
  Description: d.Description,
  SharePointId: d.SharePointId,
}));

// MiniSearch: tokenise fr+en, field weights
const mini = new MiniSearch({
  fields: ["Reference", "Title", "Committee"],
  storeFields: ["Reference", "Title", "Committee", "Type", "LastModified", "Description", "SharePointId"],
  searchOptions: {
    boost: { Reference: 3, Title: 2, Committee: 1 },
    prefix: true,
    fuzzy: 0.2,
  },
});
mini.addAll(docs);

const serialized = JSON.stringify(mini);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, serialized, "utf-8");
fs.mkdirSync(path.dirname(outMeta), { recursive: true });
fs.writeFileSync(outMeta, serialized, "utf-8");

// Also write a tiny meta for UI
const meta = { count: docs.length, fields: ["Reference","Title","Committee"], generatedAt: new Date().toISOString() };
fs.writeFileSync(path.join(process.cwd(), "public", "search-meta.json"), JSON.stringify(meta, null, 2), "utf-8");

console.log(`MiniSearch index: ${docs.length} docs → ${out} (${(serialized.length/1024).toFixed(1)} KB)`);
console.log(`Also → ${outMeta}`);
