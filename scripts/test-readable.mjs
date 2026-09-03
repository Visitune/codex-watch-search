import { buildDiff, readableDiff } from "../src/lib/diff.ts";
const txt = "This is the first paragraph. It has some content.";
const txt2 = "This is the first paragraph. It has MODIFIED content. And a new sentence.";
const result = buildDiff(txt, txt2, "CXC_1_1969");
console.log("readable:");
console.log(readableDiff(result));
console.log("--- full JSON ---");
console.log(JSON.stringify(result, null, 2));
