import fs from "fs";
import path from "path";

const CODEX_CATALOG_URL = "https://codex.fao.org/codex-texts/find-a-codex-text";
const CODEX_LOADFILTER_URL = `${CODEX_CATALOG_URL}/LoadFilter/`;

export async function fetchCatalog() {
  await fetch(CODEX_CATALOG_URL, { headers: { "User-Agent": "CodexWatch/1.0" } });
  const res = await fetch(CODEX_LOADFILTER_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Referer: CODEX_CATALOG_URL,
      Origin: "https://codex.fao.org",
      "X-Requested-With": "XMLHttpRequest",
      Accept: "application/json",
      "User-Agent": "CodexWatch/1.0",
    },
    body: JSON.stringify({ searchModel: { ItemsPerPage: 0, Popularity: null, Region: "", CategoryIds: [] } }),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`LoadFilter ${res.status}`);
  return (await res.json()) as { TotalCount: number; Standards: unknown[] };
}

async function main() {
  const data = await fetchCatalog();
  const out = path.join(process.cwd(), "data", "catalog-snapshot.json");
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, JSON.stringify({ fetchedAt: new Date().toISOString(), ...data }, null, 2), "utf-8");
  console.log(`Snapshot: ${data.TotalCount} docs → ${out}`);
}

if (import.meta.url === `file://${process.argv[1]}`) main();
