/**
 * Minimal static file server for local testing (no dependencies).
 *
 * Serves the repository root so that example pages can load
 * the locally built bundle at /packages/minjs/magflip.min.js.
 *
 * Usage: npm run serve            (default port 8090)
 *        PORT=3000 npm run serve
 */
import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT_DIR = resolve(fileURLToPath(import.meta.url), '../..');
const PORT = Number(process.env.PORT) || 8090;
const LOCAL_BUNDLE = join(ROOT_DIR, 'packages/minjs/magflip.min.js');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.map': 'application/json; charset=utf-8',
  '.jpg': 'image/jpeg',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

/** Maps a URL pathname to a file path inside ROOT_DIR, or null if it escapes the root. */
function toFilePath(pathname) {
  const filePath = normalize(join(ROOT_DIR, pathname));
  if (!filePath.startsWith(ROOT_DIR)) { return null; }
  if (existsSync(filePath) && statSync(filePath).isDirectory()) { return join(filePath, 'index.html'); }
  return filePath;
}

/** Directories must end with '/', otherwise relative paths in their index.html break. */
function isDirectoryWithoutSlash(pathname) {
  const filePath = normalize(join(ROOT_DIR, pathname));
  return !pathname.endsWith('/') && existsSync(filePath) && statSync(filePath).isDirectory();
}

const server = createServer((req, res) => {
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);

  if (isDirectoryWithoutSlash(pathname)) {
    res.writeHead(301, { Location: `${pathname}/` });
    res.end();
    return;
  }

  const filePath = toFilePath(pathname);

  if (!filePath || !existsSync(filePath)) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 Not Found');
    return;
  }

  res.writeHead(200, {
    'Content-Type': MIME_TYPES[extname(filePath)] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log('-------------------------------------------');
  console.log(` Local demo : http://localhost:${PORT}/docs/examples/local/`);
  console.log(` CDN demo   : http://localhost:${PORT}/docs/examples/prebuild/magflip.html`);
  if (!existsSync(LOCAL_BUNDLE)) {
    console.log(' [Warning] magflip.min.js not found. Run `npm run build:local` first.');
  }
  console.log('-------------------------------------------');
});
