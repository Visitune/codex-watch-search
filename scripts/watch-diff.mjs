#!/usr/bin/env node
import fs from "fs";
import path from "path";

const catalog = JSON.parse(fs.readFileSync("data/catalog-snapshot.json","utf-8"));
const docs = catalog.standards ?? catalog.Standards ?? [];
const metaPath = "data/corpus/meta.json";
let meta = {};
if (fs.existsSync(metaPath)) meta = JSON.parse(fs.readFileSync(metaPath,"utf-8"));

// Diff vs previous snapshot if exists
const prevPath = "data/catalog-prev.json";
let prevDocs = [];
if (fs.existsSync(prevPath)) {
  const prev = JSON.parse(fs.readFileSync(prevPath,"utf-8"));
  prevDocs = prev.standards ?? prev.Standards ?? [];
}
const prevByRef = new Map(prevDocs.map(d => [d.Reference, d]));
const currByRef = new Map(docs.map(d => [d.Reference, d]));

const added = docs.filter(d => !prevByRef.has(d.Reference));
const removed = prevDocs.filter(d => !currByRef.has(d.Reference));
const modified = docs.filter(d => {
  const p = prevByRef.get(d.Reference);
  return p && p.LastModified !== d.LastModified;
});

const recents = docs.filter(d => (d.LastModified ?? 0) >= 2025).sort((a,b)=>(b.LastModified??0)-(a.LastModified??0)).slice(0,12);

// SHA changes for corpus indexed
const shaChanged = Object.entries(meta).filter(([ref]) => {
  const p = prevByRef.get(ref);
  // if doc exists but SHA not in prev meta, consider new
  return false;
});

const bulletin = {
  generatedAt: new Date().toISOString(),
  snapshotAt: catalog.fetchedAt ?? new Date().toISOString(),
  total: docs.length,
  byType: docs.reduce((a,d)=>{const k=String(d.Type);a[k]=(a[k]||0)+1;return a;},{}),
  added: added.map(d=>({Reference:d.Reference,Title:d.Title,Committee:d.Committee,LastModified:d.LastModified})),
  removed: removed.map(d=>({Reference:d.Reference})),
  modified: modified.map(d=>({Reference:d.Reference,Title:d.Title, prev: prevByRef.get(d.Reference)?.LastModified, curr:d.LastModified})),
  recents: recents.map(d=>({Reference:d.Reference,Title:d.Title,Committee:d.Committee,LastModified:d.LastModified,Type:d.Type})),
  indexed: Object.keys(meta).length,
  indexedRefs: Object.keys(meta).slice(0,20),
};

fs.mkdirSync("data", {recursive:true});
fs.writeFileSync("data/watch-bulletin.json", JSON.stringify(bulletin,null,2),"utf-8");
fs.mkdirSync("public",{recursive:true});
fs.writeFileSync("public/watch-bulletin.json", JSON.stringify(bulletin,null,2),"utf-8");
console.log(`Watch bulletin: +${added.length} -${removed.length} ~${modified.length} recents:${recents.length} indexed:${Object.keys(meta).length}`);
console.log(`→ data/watch-bulletin.json + public/watch-bulletin.json`);
if (added.length) console.log("Added:", added.slice(0,3).map(d=>d.Reference).join(", "));
