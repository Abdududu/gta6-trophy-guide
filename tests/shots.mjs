// Screenshot capture for the VICE GOT A PRICE! guide app (v11).
// Serves app/ over a tiny static server, loads it in Chromium, and captures
// 4 screenshots (1280x800) under screenshots/: tracker, grid, roadmap, disputes.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync, mkdirSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/goals/make-fun-gta-6-bounty-participation/build/tools/node_modules/playwright-core');
const APP = fileURLToPath(new URL('../app', import.meta.url));
const OUT = fileURLToPath(new URL('../screenshots', import.meta.url));
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

mkdirSync(OUT, { recursive: true });
const server = createServer(async (req, res) => {
  const path = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  const file = join(APP, decodeURIComponent(path));
  if (!file.startsWith(APP) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
});
await new Promise((r) => server.listen(0, '127.0.0.1', r));
const port = server.address().port;
const browser = await chromium.launch({ executablePath: '/home/hatch/.cache/ms-playwright/chromium-1148/chrome-linux/chrome', args: ['--no-sandbox'] });
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('.row', { timeout: 10000 });

const shots = [
  ['01-cover.jpg', 'tracker'],
  ['02-grid.jpg', 'grid'],
  ['03-roadmap.jpg', 'roadmap'],
  ['04-disputes.jpg', 'disputes'],
];
for (const [file, tab] of shots) {
  await page.evaluate((t) => {
    document.querySelectorAll('#tabs button').forEach((b) => b.click());
    const btn = [...document.querySelectorAll('#tabs button')].find((b) => b.dataset.tab === t);
    if (btn) btn.click();
  }, tab);
  await page.waitForTimeout(400);
  await page.screenshot({ path: join(OUT, file), type: 'jpeg', quality: 80 });
  console.log('saved', file);
}
await browser.close();
server.close();
console.log('4 screenshots captured');
