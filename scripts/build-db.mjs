#!/usr/bin/env node
import fs from "fs";
import path from "path";
import initSqlJs from "sql.js";

const src = path.join(process.cwd(), "data", "catalog-snapshot.json");
const out = path.join(process.cwd(), "data", "codex.db");
const outPublic = path.join(process.cwd(), "public", "codex.db");

if (!fs.existsSync(src)) {
  console.error("Missing", src);
  process.exit(1);
}
const raw = JSON.parse(fs.readFileSync(src, "utf-8"));
const docs = raw.standards ?? raw.Standards ?? [];

const SQL = await initSqlJs();
const db = new SQL.Database();

// Table principale
db.run(`
  CREATE TABLE codex_document (
    id INTEGER PRIMARY KEY,
    reference TEXT UNIQUE NOT NULL,
    document_type TEXT,
    title TEXT NOT NULL,
    committee TEXT,
    last_modified INTEGER,
    adopted_year INTEGER,
    sharepoint_id INTEGER
  );
`);

const typeMap = { "5": "CXS", "1": "CXG", "4": "CXC", "3": "CXM", "2": "CXA" };
const stmt = db.prepare(`INSERT INTO codex_document (reference, document_type, title, committee, last_modified, adopted_year, sharepoint_id) VALUES (?,?,?,?,?,?,?)`);

let inserted = 0;
for (const d of docs) {
  const docType = typeMap[String(d.Type)] ?? (d.Reference.split(" ")[0] || "UNKNOWN");
  stmt.run([d.Reference, docType, d.Title, d.Committee || null, d.LastModified ?? null, d.AdoptedYear ?? null, d.SharePointId ?? null]);
  inserted++;
}
stmt.free();

// Index classiques (LIKE + filtre)
db.run(`CREATE INDEX idx_doc_reference ON codex_document(reference)`);
db.run(`CREATE INDEX idx_doc_type ON codex_document(document_type)`);
db.run(`CREATE INDEX idx_doc_committee ON codex_document(committee)`);
db.run(`CREATE INDEX idx_doc_last_modified ON codex_document(last_modified)`);

// Export
const data = db.export();
const buffer = Buffer.from(data);
fs.mkdirSync(path.dirname(out), { recursive: true });
fs.writeFileSync(out, buffer);
fs.mkdirSync(path.dirname(outPublic), { recursive: true });
fs.writeFileSync(outPublic, buffer);
console.log(`SQLite: ${inserted} docs → ${out} (${(buffer.length/1024).toFixed(1)} KB) + ${outPublic}`);
console.log(`Test: SELECT count(*) FROM codex_document WHERE document_type='CXS'`);
const res = db.exec(`SELECT count(*) FROM codex_document WHERE document_type='CXS'`);
console.log("CXS count", res[0]?.values[0]);
db.close();
