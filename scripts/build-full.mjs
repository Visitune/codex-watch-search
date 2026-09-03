#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { execSync } from "child_process";

console.log("▶ Fetch catalog");
execSync("node scripts/poc_fetch.mjs", { stdio: "inherit" });
console.log("▶ Build MiniSearch (with corpus Text)");
execSync("node scripts/build-index.mjs", { stdio: "inherit" });
console.log("▶ Build SQLite");
execSync("node scripts/build-db.mjs", { stdio: "inherit" });
console.log("✓ Full build done");
const c = JSON.parse(fs.readFileSync("data/catalog-snapshot.json","utf-8"));
const m = JSON.parse(fs.readFileSync("public/search-meta.json","utf-8"));
console.log(`Catalog: ${c.totalCount ?? c.TotalCount} docs • withText: ${m.withText}`);
