import "./lib/error-capture";

import { consumeLastCapturedError } from "./lib/error-capture";
import { renderErrorPage } from "./lib/error-page";

type ServerEntry = {
  fetch: (request: Request, env: unknown, ctx: unknown) => Promise<Response> | Response;
};

let serverEntryPromise: Promise<ServerEntry> | undefined;

async function getServerEntry(): Promise<ServerEntry> {
  if (!serverEntryPromise) {
    serverEntryPromise = import("@tanstack/react-start/server-entry").then(
      (m) => (m.default ?? m) as ServerEntry,
    );
  }
  return serverEntryPromise;
}

// h3 swallows in-handler throws into a normal 500 Response with body
// {"unhandled":true,"message":"HTTPError"} — try/catch alone never fires for those.
async function normalizeCatastrophicSsrResponse(response: Response): Promise<Response> {
  if (response.status < 500) return response;
  const contentType = response.headers.get("content-type") ?? "";
  if (!contentType.includes("application/json")) return response;

  const body = await response.clone().text();
  if (!isH3SwallowedErrorBody(body)) return response;

  console.error(consumeLastCapturedError() ?? new Error(`h3 swallowed SSR error: ${body}`));
  return new Response(renderErrorPage(), {
    status: 500,
    headers: { "content-type": "text/html; charset=utf-8" },
  });
}

function isH3SwallowedErrorBody(body: string): boolean {
  try {
    const payload = JSON.parse(body) as { unhandled?: unknown; message?: unknown };
    return payload.unhandled === true && payload.message === "HTTPError";
  } catch {
    return false;
  }
}

const previewStore = ((globalThis as any).__wtoPreviewStore ??
  ((globalThis as any).__wtoPreviewStore = new Map<string, {
    files: Array<{ path: string; content: string; base64?: string }>;
    createdAt: number;
  }>())
) as Map<string, {
  files: Array<{ path: string; content: string; base64?: string }>;
  createdAt: number;
}>;

function isNodeRuntime(): boolean {
  return typeof process !== 'undefined' && process?.release?.name === 'node';
}

function getContentType(filePath: string): string {
  const ext = filePath.slice(filePath.lastIndexOf('.')).toLowerCase();
  if (ext === '.html') return 'text/html';
  if (ext === '.css') return 'text/css';
  if (ext === '.js') return 'application/javascript';
  if (ext === '.json') return 'application/json';
  if (ext === '.svg') return 'image/svg+xml';
  if (ext === '.png') return 'image/png';
  if (ext === '.jpg' || ext === '.jpeg') return 'image/jpeg';
  if (ext === '.gif') return 'image/gif';
  return 'application/octet-stream';
}

export default {
  async fetch(request: Request, env: unknown, ctx: unknown) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const method = request.method;
    const supportsFs = isNodeRuntime();
    let path: typeof import('path') | null = null;
    let fsp: typeof import('fs').promises | null = null;

    if (supportsFs) {
      path = await import('path');
      fsp = (await import('fs')).promises;
    }

    try {
      if (pathname === '/__wto/preview') {
        if (method !== 'POST') {
          return new Response(JSON.stringify({ ok: false, error: 'method-not-allowed' }), {
            status: 405,
            headers: { 'content-type': 'application/json' },
          });
        }

        let bodyText: string;
        try {
          bodyText = await request.text();
        } catch (err) {
          console.error('[Preview] failed to read request body', err);
          return new Response(JSON.stringify({ ok: false, error: 'failed-to-read-request-body' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        let payload: any = {};
        try {
          payload = bodyText ? JSON.parse(bodyText) : {};
        } catch (err) {
          console.error('[Preview] invalid JSON payload', { bodyText, err });
          return new Response(JSON.stringify({ ok: false, error: 'invalid-json' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        const slug = String(payload.slug || '').replace(/[^a-z0-9-]/gi, '-');
        const files = Array.isArray(payload.files) ? payload.files : [];
        console.info('[Preview] production preview request received', { slug, fileCount: files.length, supportsFs });

        if (!slug) {
          return new Response(JSON.stringify({ ok: false, error: 'missing-slug' }), {
            status: 400,
            headers: { 'content-type': 'application/json' },
          });
        }

        try {
          if (supportsFs && path && fsp) {
            const outDir = path.join(process.cwd(), 'public', 'preview', slug);
            await fsp.mkdir(outDir, { recursive: true });
            console.info('[Preview] created preview directory', { outDir });

            for (const file of files) {
              const target = path.join(outDir, String(file.path).replace(/^\/+/, ''));
              await fsp.mkdir(path.dirname(target), { recursive: true });
              if (file.base64) {
                const buf = Buffer.from(file.base64, 'base64');
                await fsp.writeFile(target, buf);
              } else {
                await fsp.writeFile(target, String(file.content || ''));
              }
              console.info('[Preview] wrote preview file', { target, base64: Boolean(file.base64) });
            }

            const indexFile = path.join(outDir, 'index.html');
            if (!(await fsp.stat(indexFile).catch(() => false))) {
              const firstPage = files.find((f) => /\.html?$/.test(String(f.path)));
              if (firstPage) {
                await fsp.writeFile(indexFile, String(firstPage.content || ''));
                console.info('[Preview] created fallback index.html', { indexFile });
              }
            }

            const notFoundPath = path.join(outDir, '404.html');
            const redirectHtml = '<!doctype html><meta charset="utf-8"><meta http-equiv="refresh" content="0;url=./index.html"><title>Redirect</title>';
            await fsp.writeFile(notFoundPath, redirectHtml);
            console.info('[Preview] wrote 404 redirect page', { notFoundPath });
          } else {
            previewStore.set(slug, { files, createdAt: Date.now() });
            console.info('[Preview] stored preview in memory store', { slug, fileCount: files.length });
          }

          return new Response(JSON.stringify({ ok: true, url: '/preview/' + slug + '/index.html' }), {
            headers: { 'content-type': 'application/json' },
          });
        } catch (err) {
          console.error('[Preview] failed to generate preview files', err);
          return new Response(JSON.stringify({ ok: false, error: String(err && err.stack ? err.stack : err) }), {
            status: 500,
            headers: { 'content-type': 'application/json' },
          });
        }
      }

      if (pathname.startsWith('/preview/')) {
        const requestPath = pathname.replace(/^\/preview\//, '');
        const [slug, ...pathSegments] = requestPath.split('/');
        const requestedFile = pathSegments.join('/') || 'index.html';

        if (supportsFs && path && fsp) {
          try {
            const filePath = requestPath === '' || requestPath.endsWith('/')
              ? path.join(process.cwd(), 'public', 'preview', requestPath, 'index.html')
              : path.join(process.cwd(), 'public', 'preview', requestPath);
            const stat = await fsp.stat(filePath);
            if (stat.isFile()) {
              const contents = await fsp.readFile(filePath);
              return new Response(contents, {
                status: 200,
                headers: {
                  'content-type': getContentType(filePath),
                  'cache-control': 'no-store',
                },
              });
            }
          } catch (err) {
            console.info('[Preview] file not found on disk', { path: requestPath, err: String(err) });
          }
        }

        const storeEntry = previewStore.get(slug);
        if (storeEntry) {
          const file = storeEntry.files.find((f) => f.path === requestedFile);
          if (file) {
            return new Response(file.content, {
              status: 200,
              headers: {
                'content-type': getContentType(requestedFile),
                'cache-control': 'no-store',
              },
            });
          }
          console.info('[Preview] preview slug found but file missing', { slug, requestedFile });
        }
      }

      const handler = await getServerEntry();
      const response = await handler.fetch(request, env, ctx);
      return await normalizeCatastrophicSsrResponse(response);
    } catch (error) {
      console.error(error);
      return new Response(renderErrorPage(), {
        status: 500,
        headers: { 'content-type': 'text/html; charset=utf-8' },
      });
    }
  },
};
