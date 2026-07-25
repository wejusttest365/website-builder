// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  vite: {
    plugins: [
      // Dev-only preview writer endpoint: POST /__wto/preview
      {
        name: 'wto-preview-endpoint',
        configureServer(server) {
          const { fs } = server;
          server.middlewares.use(async (req, res, next) => {
            const url = req.url || '';
            const method = req.method || 'GET';
            const path = (await import('path')) as typeof import('path');
            const fsp = (await import('fs')).promises;

            if (method === 'GET' && url.startsWith('/preview/')) {
              const parsed = new URL(url, 'http://localhost');
              const requestPath = parsed.pathname.replace(/^\/preview\//, '');
              const filePath = requestPath === '' || requestPath.endsWith('/')
                ? path.join(process.cwd(), 'public', 'preview', requestPath, 'index.html')
                : path.join(process.cwd(), 'public', 'preview', requestPath);

              try {
                const stat = await fsp.stat(filePath);
                if (stat.isFile()) {
                  const ext = path.extname(filePath).toLowerCase();
                  const contentType =
                    ext === '.html'
                      ? 'text/html'
                      : ext === '.css'
                      ? 'text/css'
                      : ext === '.js'
                      ? 'application/javascript'
                      : ext === '.json'
                      ? 'application/json'
                      : ext === '.svg'
                      ? 'image/svg+xml'
                      : 'application/octet-stream';
                  res.statusCode = 200;
                  res.setHeader('content-type', contentType);
                  res.setHeader('cache-control', 'no-store');
                  const contents = await fsp.readFile(filePath);
                  res.end(contents);
                  return;
                }
              } catch {
                // continue to POST preview handler or next middleware
              }
            }

            try {
              if (!url.startsWith('/__wto/preview') || method !== 'POST') return next();
              let body = '';
              for await (const chunk of req) body += chunk;
              const payload = JSON.parse(body || '{}');
              const slug = String(payload.slug || '').replace(/[^a-z0-9-]/gi, '-');
              if (!slug) {
                res.statusCode = 400;
                res.end(JSON.stringify({ ok: false, error: 'missing-slug' }));
                return;
              }
              const outDir = path.join(process.cwd(), 'public', 'preview', slug);
              await fsp.mkdir(outDir, { recursive: true });
              const files = Array.isArray(payload.files) ? payload.files : [];
              for (const f of files) {
                const target = path.join(outDir, String(f.path).replace(/^\/+/, ''));
                await fsp.mkdir(path.dirname(target), { recursive: true });
                if (f.base64) {
                  const buf = Buffer.from(f.base64, 'base64');
                  await fsp.writeFile(target, buf);
                } else {
                  await fsp.writeFile(target, String(f.content || ''));
                }
              }
              const indexFile = path.join(outDir, 'index.html');
              if (!(await fsp.stat(indexFile).catch(() => false))) {
                const firstPage = files.find((f) => /\.html?$/.test(String(f.path)));
                if (firstPage) {
                  await fsp.writeFile(indexFile, String(firstPage.content || ''));
                }
              }
              const notFoundPath = path.join(outDir, '404.html');
              const redirectHtml = '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./index.html"><title>Redirect</title>';
              await fsp.writeFile(notFoundPath, redirectHtml);
              res.statusCode = 200;
              res.setHeader('content-type', 'application/json');
              res.end(JSON.stringify({ ok: true, url: '/preview/' + slug + '/index.html' }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ ok: false, error: String(err && err.stack ? err.stack : err) }));
            }
          });
        },
      } as any,
    ],
  },
});
