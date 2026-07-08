import type { PageSection } from "./store";

// Rewrite `images/<filename>` references (src, href, url(...)) to data URLs
// from the project assets map, so the preview iframe and self-contained
// export can render locally-uploaded images.
export function resolveAssetPaths(html: string, assets?: Record<string, string>) {
  if (!assets) return html;
  let out = html;
  for (const [name, data] of Object.entries(assets)) {
    const path = `images/${name}`;
    // Escape regex specials in filename.
    const esc = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(esc, "g"), data);
  }
  return out;
}

// Runtime script injected into preview iframe.
// - Wraps each section as [data-wto-section="id"]
// - Handles click to select, dblclick to edit text, image click for image modal
// - Sends messages to parent via postMessage
export const RUNTIME_SCRIPT = `
(function(){
  const send = (type, payload) => parent.postMessage({ __wto: true, type, payload }, '*');

  // Assign a stable index to every element inside each section so the parent
  // can address any element (including decorative gradient boxes) by index.
  function indexAll() {
    document.querySelectorAll('[data-wto-section]').forEach(sec => {
      let i = 0;
      sec.querySelectorAll('*').forEach(el => {
        el.setAttribute('data-wto-idx', String(i++));
      });
    });
  }
  indexAll();

  function isBoxLike(el) {
    if (!el || el.tagName === 'IMG') return false;
    const cls = el.className && el.className.baseVal !== undefined ? el.className.baseVal : (el.className || '');
    // Treat elements whose primary purpose looks like a decorative image slot
    // (gradient, background-image, or empty aspect/rounded box) as image targets.
    if (/\\bbg-gradient/.test(cls)) return true;
    if (/\\baspect-\\[?[\\w/.-]+\\]?/.test(cls) && !el.querySelector('img')) return true;
    const style = el.getAttribute('style') || '';
    if (/background-image\\s*:/.test(style)) return true;
    return false;
  }

  function onClick(e) {
    const section = e.target.closest('[data-wto-section]');
    if (!section) return;
    const img = e.target.closest('img');
    if (img) {
      e.preventDefault(); e.stopPropagation();
      send('image-click', {
        sectionId: section.dataset.wtoSection,
        idx: img.getAttribute('data-wto-idx'),
        src: img.getAttribute('src') || '',
        kind: 'img',
      });
      return;
    }
    const box = e.target.closest('[data-wto-idx]');
    if (box && isBoxLike(box) && !e.target.closest('a,button,h1,h2,h3,h4,h5,h6,p,li,input,textarea')) {
      e.preventDefault(); e.stopPropagation();
      send('image-click', {
        sectionId: section.dataset.wtoSection,
        idx: box.getAttribute('data-wto-idx'),
        src: '',
        kind: 'box',
      });
      return;
    }
    if (e.target.closest('a')) e.preventDefault();
    send('select', { sectionId: section.dataset.wtoSection });
  }

  function startTextEdit(e) {
    const el = e.target.closest('h1,h2,h3,h4,h5,h6,p,span,a,button,li');
    const section = e.target.closest('[data-wto-section]');
    if (!el || !section) return;
    e.preventDefault();
    e.stopPropagation();
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.focus();
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
    } catch(_) {}
    const onKey = (event) => {
      if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); el.blur(); }
      if (event.key === 'Escape') { event.preventDefault(); el.blur(); }
    };
    const onBlur = () => {
      el.removeAttribute('contenteditable');
      el.removeAttribute('spellcheck');
      el.removeEventListener('keydown', onKey);
      el.removeEventListener('blur', onBlur);
      send('section-html', { sectionId: section.dataset.wtoSection, html: section.innerHTML });
    };
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
  }

  function onDblClick(e) { startTextEdit(e); }
  function onPointerDown(e) {
    if (e.detail >= 2) startTextEdit(e);
  }

  document.addEventListener('pointerdown', onPointerDown, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('dblclick', onDblClick, true);

  // Console bridge
  ['log','warn','error','info'].forEach(k => {
    const orig = console[k];
    console[k] = function() {
      try { send('console', { level: k, args: Array.from(arguments).map(a => {
        try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(_) { return String(a); }
      }) }); } catch(_) {}
      orig.apply(console, arguments);
    };
  });
  window.addEventListener('error', (e) => send('console', { level:'error', args:[String(e.message)] }));
})();
`;

export function buildPreviewHTML(opts: {
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
  editable: boolean;
  selectedId?: string | null;
  assets?: Record<string, string>;
}) {
  const { sections, globalCss, globalJs, editable, selectedId, assets } = opts;

  const sectionHTML = sections
    .map((s) => {
      if (s.collapsed) return "";
      const styleStr = styleToString(s.style);
      const outline =
        editable && selectedId === s.id
          ? "outline:2px solid #6366f1;outline-offset:-2px;"
          : "";
      const visibleHtml = applyRootAttributes(s.html, {
        className: s.className,
        domId: s.domId,
        style: styleStr,
      });
      return `<div data-wto-section="${s.id}" class="wto-section" style="${outline}">${resolveAssetPaths(visibleHtml, assets)}</div>`;
    })
    .join("\n");

  const editableStyles = editable
    ? `
    .wto-section { position: relative; }
    .wto-section:hover { outline: 1px dashed #94a3b8; outline-offset: -1px; cursor: pointer; }
    .wto-section.wto-selected { outline: 2px solid #6366f1 !important; outline-offset: -2px; }
    [contenteditable="true"] { outline: 2px solid #f59e0b !important; }
    `
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Preview</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>
  body { margin: 0; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  ${editableStyles}
  ${globalCss || ""}
</style>
</head>
<body>
${sectionHTML || (editable ? '<div style="padding:80px;text-align:center;color:#94a3b8;font-family:system-ui">Drag sections from the left to start building →</div>' : "")}
<script>${editable ? RUNTIME_SCRIPT : ""}</script>
<script>try{${globalJs || ""}}catch(e){console.error(e)}</script>
</body>
</html>`;
}

export function buildExportBundle(opts: {
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
  title?: string;
  assets?: Record<string, string>;
  // When true, `images/…` paths are inlined as data URLs so the resulting
  // single-file HTML is fully self-contained (used by preview/demo iframes).
  inlineAssets?: boolean;
}) {
  const { sections, globalCss, globalJs, title = "My Website", assets, inlineAssets } = opts;
  const body = sections
    .map((s) => {
      const styleStr = styleToString(s.style);
      const raw = applyRootAttributes(s.html, {
        className: s.className,
        domId: s.domId,
        style: styleStr,
        fallbackTag: "section",
      });
      return inlineAssets ? resolveAssetPaths(raw, assets) : raw;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="./style.css" />
</head>
<body>
${body}
<script src="./script.js"></script>
</body>
</html>`;

  const complete = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>${globalCss}</style>
</head>
<body>
${inlineAssets ? body : resolveAssetPaths(body, assets)}
<script>${globalJs}</script>
</body>
</html>`;

  return { html, css: globalCss, js: globalJs, complete, body };
}

function escapeHtml(s: string) {
  return s.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
}

function styleToString(style?: Record<string, string>) {
  if (!style) return "";
  return Object.entries(style)
    .filter(([, v]) => v.trim())
    .map(([k, v]) => `${k}:${v}`)
    .join(";");
}

function applyRootAttributes(
  html: string,
  opts: { className?: string; domId?: string; style?: string; fallbackTag?: "div" | "section" },
) {
  const openingTag = html.match(/^\s*<([a-zA-Z][\w:-]*)(\s[^>]*)?>/);
  if (!openingTag) {
    const tag = opts.fallbackTag ?? "div";
    return `<${tag}${attrsToString(opts)}>${html}</${tag}>`;
  }

  const full = openingTag[0];
  const attrText = openingTag[2] ?? "";
  let nextAttrs = attrText;

  if (opts.className?.trim()) {
    nextAttrs = mergeAttr(nextAttrs, "class", opts.className.trim(), " ");
  }
  if (opts.domId?.trim()) {
    nextAttrs = setAttr(nextAttrs, "id", opts.domId.trim());
  }
  if (opts.style?.trim()) {
    nextAttrs = mergeAttr(nextAttrs, "style", opts.style.trim(), ";");
  }

  const replacement = full.replace(attrText, nextAttrs);
  return html.replace(full, replacement);
}

function attrsToString(opts: { className?: string; domId?: string; style?: string }) {
  return [
    opts.className?.trim() ? ` class="${escapeAttribute(opts.className.trim())}"` : "",
    opts.domId?.trim() ? ` id="${escapeAttribute(opts.domId.trim())}"` : "",
    opts.style?.trim() ? ` style="${escapeAttribute(opts.style.trim())}"` : "",
  ].join("");
}

function mergeAttr(attrs: string, name: string, value: string, separator: string) {
  const pattern = new RegExp(`\\s${name}=(['\"])(.*?)\\1`, "i");
  if (!pattern.test(attrs)) return `${attrs} ${name}="${escapeAttribute(value)}"`;
  return attrs.replace(pattern, (_match, quote: string, current: string) => {
    const sep = current.trim().endsWith(separator) ? "" : separator === ";" ? ";" : separator;
    return ` ${name}=${quote}${current}${sep}${escapeAttribute(value)}${quote}`;
  });
}

function setAttr(attrs: string, name: string, value: string) {
  const pattern = new RegExp(`\\s${name}=(['\"])(.*?)\\1`, "i");
  if (!pattern.test(attrs)) return `${attrs} ${name}="${escapeAttribute(value)}"`;
  return attrs.replace(pattern, (_match, quote: string) => ` ${name}=${quote}${escapeAttribute(value)}${quote}`);
}

function escapeAttribute(s: string) {
  return s.replace(/&/g, "&amp;").replace(/"/g, "&quot;");
}
