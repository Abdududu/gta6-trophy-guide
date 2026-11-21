// VICE GOT A PRICE! — a GTA 6 trophy guide entry (Node 22, standard library only).
// The guide is this directory's app/ folder: plain static files a browser opens at
// app/index.html (HTML, CSS, JS, JSON data, no build step), offline: it loads nothing
// over the network. The program hands it in: it copies app/ and screenshots/ from
// beside this file to /output and writes /output/dossier.json, the summary the judge
// reads (screenshots, the first load's files and bytes, and the source), with the
// vendored make.fun library. Leave vendor/makefun-frontend.ts as it is: the scorer
// requires dossier.json to be byte for byte what its own copy writes.
//
// The output directory is never removed: in the grader it is /output, a mount point
// the program cannot delete, and the program runs as an unprivileged user. So the
// program only creates the directory if it is missing and copies into it. Removing
// the output directory would fail with EPERM and reject the entry, so no delete
// call appears anywhere in this file. The program exits 0 whenever the files exist.
//
// Serve it locally with `node serve.ts`, then open http://localhost:8080.
// Outside the grader's container, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

const here = fileURLToPath(new URL('.', import.meta.url));
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const TEXT_CAP = 163840;

// Count files under a directory (for the handover log only; never a gate).
const countFiles = (dir) => {
  let n = 0;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) n += countFiles(p);
    else if (statSync(p).isFile()) n++;
  }
  return n;
};

// Hand the entry in: create the output directory if it is missing, then copy
// into it. The directory itself is never removed, and nothing in this file ever
// deletes it: the grader's /output is a root-owned mount the program
// cannot delete, and deleting it would throw EPERM and reject the entry.
mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps: only text_max_bytes shapes the bytes; the others refuse
// an entry the scorer would refuse (more than 4 screenshots or one over 256 KiB;
// more than 993 files and directories in app/ or 48 MiB of app files).
const caps = { text_max_bytes: TEXT_CAP, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 };
const dossier = buildDossier(out, caps);
writeFileSync(join(out, 'dossier.json'), dossier);
console.log(`dossier written: ${dossier.byteLength} bytes`);
console.log(`handed in ${countFiles(join(here, 'app'))} app files and ${countFiles(join(out, 'screenshots'))} screenshots`);
console.log('VICE GOT A PRICE! handed in: app/ + screenshots/ + dossier.json in ' + out);
