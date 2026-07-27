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
          return new Response(JSON.stringify({ ok: true, message: 'Preview is now rendered in-memory and does not require server-side file generation.' }), {
            headers: { 'content-type': 'application/json' },
          });
      }

      if (pathname.startsWith('/preview/')) {
        return new Response('Not found', { status: 404 });
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
