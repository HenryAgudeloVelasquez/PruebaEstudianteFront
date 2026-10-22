import { createReadStream, promises as fs } from 'node:fs';
import { createServer } from 'node:http';
import { extname, resolve, sep } from 'node:path';

const webRoot = resolve('dist/prueba-estudiante-front/browser');
const indexPath = resolve(webRoot, 'index.html');
const port = Number(process.env.PORT || 8080);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' }).end();
    return;
  }

  let pathname;
  try {
    pathname = decodeURIComponent(new URL(request.url || '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('Bad Request');
    return;
  }

  const requestedFile = resolve(webRoot, `.${pathname}`);
  if (requestedFile !== webRoot && !requestedFile.startsWith(`${webRoot}${sep}`)) {
    response.writeHead(403).end('Forbidden');
    return;
  }

  let filePath = requestedFile;
  try {
    const stats = await fs.stat(filePath);
    if (stats.isDirectory()) filePath = resolve(filePath, 'index.html');
    else if (!stats.isFile()) throw new Error('Not a file');
  } catch {
    if (extname(pathname)) {
      response.writeHead(404).end('Not Found');
      return;
    }
    filePath = indexPath;
  }

  try {
    const stats = await fs.stat(filePath);
    response.writeHead(200, {
      'Content-Length': stats.size,
      'Content-Type': contentTypes[extname(filePath).toLowerCase()] || 'application/octet-stream',
    });
    if (request.method === 'HEAD') {
      response.end();
      return;
    }

    createReadStream(filePath)
      .on('error', () => response.destroy())
      .pipe(response);
  } catch {
    response.writeHead(500).end('Build output not found. Run npm run build first.');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`Serving ${webRoot} on port ${port}`);
});
