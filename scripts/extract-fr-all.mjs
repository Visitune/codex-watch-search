#!/usr/bin/env node
import fs from "fs";
import path from "path";
const catalog = JSON.parse(fs.readFileSync("data/catalog-snapshot.json","utf-8"));
const docs = (catalog.standards ?? catalog.Standards ?? []).filter(d=>d.Description?.fr);
console.log(`FR docs to check: ${docs.length}`);
let done=0, skip=0, fail=0;
for (const doc of docs) {
  const base = doc.Reference.replace(/[^A-Za-z0-9]/g,"_");
  const out = path.join("data/corpus", `${base}_fr.txt`);
  if (fs.existsSync(out)) { skip++; continue; }
  const file = doc.Description.fr;
  const url = `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(file)}?lang=fr&id=${doc.SharePointId}`;
  try {
    const res = await fetch(url, {headers:{"User-Agent":"CodexWatch/1.0"}});
    if (!res.ok) { fail++; console.log(`✗ ${doc.Reference} HTTP ${res.status}`); continue; }
    const buf = Buffer.from(await res.arrayBuffer());
    const { PDFParse } = await import("pdf-parse");
    const parser = new PDFParse({data: buf});
    const r = await parser.getText();
    await parser.destroy();
    const text = (r.text||"").replace(/\s+/g," ").trim().slice(0,15000);
    fs.writeFileSync(out, text, "utf-8");
    fs.writeFileSync(out.replace(".txt",".sha"), "fr", "utf-8");
    done++;
    if (done%20===0) console.log(`… ${done} FR ${doc.Reference}`);
  } catch(e){ fail++; console.log(`✗ ${doc.Reference} ${e.message?.slice(0,80)}`); }
  // throttle léger
  await new Promise(r=>setTimeout(r, 80));
}
console.log(`FR done: ${done} new, ${skip} cached, ${fail} fail`);
