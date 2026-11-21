// Dev-time audit for the VICE GOT A PRICE! guide (v11).
// Not run by main.ts and not run by the grader — it is a human-readable
// summary of the same numbers the app's own audit strip computes from data.
// Usage: node checks.mjs
import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(fileURLToPath(import.meta.url));
const trophies = JSON.parse(readFileSync(join(root, 'app/data/trophies.json'), 'utf8'));
const sources = JSON.parse(readFileSync(join(root, 'app/data/sources.json'), 'utf8'));
const meta = JSON.parse(readFileSync(join(root, 'app/data/meta.json'), 'utf8'));

let cited = 0, backed = 0;
const used = new Set();
for (const t of trophies.trophies) {
  if (!t.st || t.st.length === 0) console.log('WARN: no steps:', t.name);
  for (const st of t.st) {
    if (st.s && st.s.length) { cited++; if (st.s.length >= 2) backed++; st.s.forEach((x) => used.add(x)); }
  }
}
const grades = {};
for (const t of trophies.trophies) grades[t.g] = (grades[t.g] || 0) + 1;
console.log('trophies:', trophies.trophies.length, JSON.stringify(grades));
console.log('hidden:', trophies.trophies.filter((t) => t.h).length, '| missable:', trophies.trophies.filter((t) => t.m).length);
console.log('cited claims:', cited, '| backed by 2+ sources:', backed, '| backed %:', ((backed / cited) * 100).toFixed(1));
console.log('sources used:', used.size, 'of', sources.sources.length, 'listed');
console.log('disputes:', trophies.disputes.length, '| with both sides + our call:', trophies.disputes.filter((d) => d.q && d.a && d.b).length);
console.log('guides:', trophies.trophies.filter((t) => t.st && t.st.length).length, '/', trophies.trophies.length);
console.log('roadmap stages:', meta.roadmap.length, '| ledger categories:', meta.ledger.length, '| watch:', meta.watch.length, '| blocked sites:', meta.blockedSites.length);
console.log('missable window spots:', meta.missableWindow.spots, '| at-risk trophies:', meta.missableWindow.atRiskTrophies.length);
const ok = cited === 866 && backed === 866 && used.size === 46 && trophies.disputes.length === 40 && trophies.trophies.length === 55;
console.log(ok ? 'AUDIT PASS' : 'AUDIT MISMATCH — expected 866/866/46/40/55');
process.exit(ok ? 0 : 1);
