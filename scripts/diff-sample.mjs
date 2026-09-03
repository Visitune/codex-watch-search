import fs from "fs";
import { extractSections, diffSections, summarizeChanges } from "../src/lib/diff.ts";

// Demo diff sur CXC 1-1969 EN (v1 vs v2 simulée: on coupe 1 section)
const txt = fs.readFileSync("data/corpus/CXC_1_1969.txt", "utf-8");
const secs = extractSections(txt);
console.log(`CXC 1-1969: ${secs.length} sections`);
console.log(secs.slice(0,4).map(s=>`${s.number} — ${s.title} (${s.text.length} chars)`).join("\n"));

// Simule une révision: modifie §4.2 + ajoute §5.3
const v1 = secs;
const v2 = secs.map(s=> ({...s}));
const s42 = v2.find(s=>s.number==="4.2" || s.number==="4");
if (s42) s42.text += "\n\n[MODIFICATION SIMULEE] Ajout d'une exigence de validation des mesures de maîtrise.";
v2.push({ number: "5.3", title: "Nouvelle sous-section (simulée)", text: "Contenu relatif à la réutilisation de l'eau." });

const changes = diffSections(v1, v2);
console.log("\nDiff simulé:");
for (const c of changes) console.log(` - ${c.changeType} ${c.sectionNumber} — ${c.summary}`);
console.log(summarizeChanges(changes));
