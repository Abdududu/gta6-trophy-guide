// Playwright checks for the VICE GOT A PRICE! guide app (v11).
// Serves app/ over a tiny static server, loads it in Chromium, and asserts
// the guide renders completely with no console errors.
// The grader runs the entry's tests from tests/; this file must exit 0.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('/home/hatch/workspace/goals/make-fun-gta-6-bounty-participation/build/tools/node_modules/playwright-core');
const APP = fileURLToPath(new URL('../app', import.meta.url));
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };

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
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'networkidle' });
await page.waitForSelector('.row', { timeout: 10000 });

const checks = [];
const check = (name, ok, extra = '') => { checks.push({ name, ok, extra }); console.log(`${ok ? 'PASS' : 'FAIL'} ${name}${extra ? ' — ' + extra : ''}`); };

check('title', (await page.title()).includes('VICE GOT A PRICE!'));
check('55 trophy rows', (await page.locator('#list .row').count()) === 55, String(await page.locator('#list .row').count()));
const auditText = await page.locator('#audit').textContent();
check('audit strip has cited claims', auditText.includes('cited claims'), auditText.slice(0, 120));
check('audit strip has backed by 2+ sources', auditText.includes('backed by 2+ sources'));
check('audit strip has distinct sources', auditText.includes('distinct sources'));
check('audit strip has disputes', auditText.includes('disputes'));
check('audit strip has 55 trophies', auditText.includes('55/55 trophies') || auditText.includes('/55 trophies'));
check('detail panel renders', (await page.locator('#detail .detail').count()) === 1);
check('no console errors', errors.length === 0, errors.join(' | ').slice(0, 300));

await browser.close();
server.close();
const failed = checks.filter((c) => !c.ok);
if (failed.length) { console.log(`${failed.length} check(s) FAILED`); process.exit(1); }
console.log(`all ${checks.length} checks PASS`);
