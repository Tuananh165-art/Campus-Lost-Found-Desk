import http from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { resolve, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspace = fileURLToPath(new URL('..', import.meta.url));
const root = resolve(workspace, '.verification', 'ui-web');
const entry = resolve(root, 'index.html');
if (!existsSync(entry)) throw new Error('Export first: npx expo export --platform web --output-dir .verification/ui-web');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.ttf': 'font/ttf', '.woff2': 'font/woff2' };
const server = http.createServer((request, response) => {
  if (!['GET', 'HEAD'].includes(request.method ?? '')) { response.writeHead(405); response.end(); return; }
  let path;
  try { path = decodeURIComponent(new URL(request.url ?? '/', 'http://localhost').pathname); }
  catch { response.writeHead(400); response.end(); return; }
  const candidate = resolve(root, '.' + path);
  if (!candidate.startsWith(root + sep) && candidate !== root) { response.writeHead(403); response.end(); return; }
  const file = existsSync(candidate) && statSync(candidate).isFile() ? candidate : entry;
  response.writeHead(200, { 'Content-Type': types[extname(file)] ?? 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (request.method === 'HEAD') { response.end(); return; }
  createReadStream(file).on('error', () => response.destroy()).pipe(response);
});
server.listen(8092, '127.0.0.1', () => console.log('Exported web preview: http://127.0.0.1:8092'));
process.on('SIGTERM', () => server.close());
process.on('SIGINT', () => server.close());
