// Dev server for the VICE GOT A PRICE! guide app.
// Serves app/ on http://localhost:8080. Not used by the grader.
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const APP = fileURLToPath(new URL('./app', import.meta.url));
const MIME = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json' };
const server = createServer(async (req, res) => {
  const path = req.url.split('?')[0] === '/' ? '/index.html' : req.url.split('?')[0];
  const file = join(APP, decodeURIComponent(path));
  if (!file.startsWith(APP) || !existsSync(file)) { res.writeHead(404); res.end('not found'); return; }
  res.writeHead(200, { 'content-type': MIME[extname(file)] || 'application/octet-stream' });
  res.end(await readFile(file));
});
server.listen(8080, '127.0.0.1', () => console.log('VICE GOT A PRICE! at http://localhost:8080'));
