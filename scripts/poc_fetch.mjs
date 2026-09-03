#!/usr/bin/env node
// POC discovery — fetch full catalog via NewCodexWebConnector pattern
// Usage: node --loader tsx scripts/poc_fetch.mjs  OR  npm run collector:discovery

const CODEX_CATALOG_URL = "https://codex.fao.org/codex-texts/find-a-codex-text";
const CODEX_LOADFILTER_URL = `${CODEX_CATALOG_URL}/LoadFilter/`;

async function fetchCatalog() {
  await fetch(CODEX_CATALOG_URL, { headers: { "User-Agent": "CodexWatch/1.0" } });
  const res = await fetch(CODEX_LOADFILTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Referer": CODEX_CATALOG_URL,
      "Origin": "https://codex.fao.org",
      "X-Requested-With": "XMLHttpRequest",
      "Accept": "application/json",
      "User-Agent": "CodexWatch/1.0",
    },
    body: JSON.stringify({ searchModel: { ItemsPerPage: 0, Popularity: null, Region: "", CategoryIds: [] } }),
  });
  if (!res.ok) throw new Error(`LoadFilter ${res.status} ${await res.text()}`);
  return res.json();
}

function buildPdfUrl(doc, lang) {
  const file = doc.Description[lang];
  if (!file) return null;
  return `https://codex.fao.org/restapi/searchstandard/${encodeURIComponent(file)}?lang=${lang}&id=${doc.SharePointId}`;
}

const data = await fetchCatalog();
console.log(`TotalCount: ${data.TotalCount}`);
console.log(`Standards: ${data.Standards.length}`);
const byType = data.Standards.reduce((acc, s) => { acc[s.Type ?? "null"] = (acc[s.Type ?? "null"] || 0) + 1; return acc; }, {});
console.log("By Type:", byType);

// Languages availability (EN/FR prio)
for (const lang of ["en", "fr", "es", "zh", "ru", "ar"]) {
  const avail = data.Standards.filter((s) => s.Description[lang]).length;
  console.log(`Lang ${lang}: ${avail}/${data.Standards.length}`);
}

// Save snapshot
import { writeFileSync } from "fs";
const snap = { fetchedAt: new Date().toISOString(), totalCount: data.TotalCount, byType, standards: data.Standards };
writeFileSync("data/catalog-snapshot.json", JSON.stringify(snap, null, 2), "utf-8");
console.log("Saved data/catalog-snapshot.json");

// Demo PDF HEAD for CXC 1-1969
const cxc1 = data.Standards.find((s) => s.Reference === "CXC 1-1969");
if (cxc1) {
  for (const lang of ["en", "fr"]) {
    const url = buildPdfUrl(cxc1, lang);
    console.log(`CXC 1-1969 ${lang}: ${url}`);
    const h = await fetch(url, { method: "HEAD" });
    console.log(`  HEAD ${h.status} ${h.headers.get("content-type")} ${h.headers.get("content-length")}`);
  }
}

console.log("\nDone. Next: npm run collector:snapshot or check docs/connector-spec.md");
