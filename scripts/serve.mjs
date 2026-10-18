import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, extname, sep } from 'node:path';
const root = resolve(fileURLToPath(new URL('../public/', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const types = { '.html':'text/html', '.js':'text/javascript', '.css':'text/css', '.json':'application/json', '.webmanifest':'application/manifest+json', '.svg':'image/svg+xml', '.png':'image/png', '.ttf':'font/ttf', '.ics':'text/calendar', '.md':'text/plain' };
const server = createServer(async (req, res) => {
  try {
    if (!['GET','HEAD'].includes(req.method)) { res.writeHead(405); res.end(); return; }
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    let path = resolve(root, '.' + pathname);
    if (path !== root && !path.startsWith(root + sep)) { res.writeHead(403); res.end(); return; }
    if ((await stat(path)).isDirectory()) path = resolve(path, 'index.html');
    const bytes = await readFile(path);
    res.writeHead(200, {'Content-Type':(types[extname(path)] || 'application/octet-stream') + (['.html','.js','.css','.json','.ics','.md'].includes(extname(path)) ? '; charset=utf-8' : ''), 'Cache-Control':'no-store'});
    res.end(req.method === 'HEAD' ? undefined : bytes);
  } catch { res.writeHead(404, {'Content-Type':'text/plain; charset=utf-8'}); res.end('Not found'); }
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE' ? `Port ${port} is busy. Stop the other server or set PORT to another number.` : error.message);
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () => console.log(`\nMyanmar Calendar: http://localhost:${port}\nStop: Ctrl+C\n`));
