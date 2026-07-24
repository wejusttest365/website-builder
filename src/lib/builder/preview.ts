import type { PageSection, Project, PageSeo, ProjectSeo } from "./store";
import { getImageBlob, type BuilderAssetEntry } from "./image-storage";
import appCssUrl from "@/styles.css?url";
import appCssRaw from "@/styles.css?raw";

export const APP_CSS_HREF = appCssUrl;
export const APP_CSS_TEXT = appCssRaw;

function extractCssFromViteRaw(raw: string) {
  const wrapperMatch = raw.match(/const\s+__vite__css\s*=\s*(?:JSON\.parse\()?(?:(['"`]))([\s\S]*?)\1\)?;/);
  if (!wrapperMatch) return null;

  try {
    return JSON.parse(`${wrapperMatch[1]}${wrapperMatch[2]}${wrapperMatch[1]}`);
  } catch {
    return null;
  }
}

function isLikelyCompiledCss(css: string) {
  const trimmed = css.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (/\@theme\s+inline\b/.test(lower)) return false;
  if (/\@source\b/.test(lower)) return false;
  if (/\@import\s+["']tailwindcss["']/.test(lower)) return false;
  if (/import\.meta\.hot|__vite__css|\/@vite\/client|createHotContext/.test(lower)) return false;
  return /\{/.test(trimmed) && /\}/.test(trimmed);
}

function sanitizeCss(raw: string) {
  const trimmed = raw.trim();
  if (!trimmed) return "";

  const extracted = extractCssFromViteRaw(trimmed);
  if (extracted) return extracted.trim();

  const cleaned = trimmed
    .replace(/^[ \t]*\/\/.*$/gm, "")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^[ \t]*@import\s+.*$/gm, "")
    .replace(/^[ \t]*@source\b.*$/gm, "")
    .replace(/^[ \t]*@theme\s+inline\b[\s\S]*?\{[\s\S]*?\}/gm, "")
    .replace(/^[ \t]*import\s+.*$/gm, "")
    .replace(/^[ \t]*export\s+.*$/gm, "")
    .replace(/^[ \t]*const\s+__vite__.*$/gm, "")
    .replace(/^[ \t]*__vite__.*$/gm, "")
    .replace(/^[ \t]*import\.meta\..*$/gm, "")
    .replace(/^[ \t]*\/\@vite\/.*$/gm, "")
    .replace(/^[ \t]*.*createHotContext.*$/gm, "")
    .replace(/^[ \t]*.*updateStyle.*$/gm, "")
    .replace(/^[ \t]*.*removeStyle.*$/gm, "")
    .replace(/^[ \t]*.*__vite__updateStyle.*$/gm, "")
    .replace(/^[ \t]*.*__vite__id.*$/gm, "")
    .trim();

  return cleaned
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => {
      if (!line) return false;
      if (/^(import|export|const|let|var|function|return|if|else|for|while|try|catch|throw|new\s+Function|await|\}|\{|__vite__|import\.meta\.|\/\@vite\/|createHotContext|updateStyle|removeStyle)/.test(line)) {
        return false;
      }
      return true;
    })
    .join("\n")
    .trim();
}

function isViteInjectedStyleSheet(sheet: CSSStyleSheet) {
  const owner = sheet.ownerNode as HTMLElement | null;
  if (!owner) return false;
  if (owner.nodeName !== "STYLE") return false;
  const style = owner as HTMLStyleElement;
  if (style.dataset?.viteDevId || style.dataset?.viteHot) return true;
  const content = style.textContent ?? "";
  return /import\.meta\.hot|__vite__css|\/\@vite\/client/.test(content);
}

export async function getLoadedAppCssFromDocument() {
  if (typeof document === "undefined") return "";

  const appHref = new URL(APP_CSS_HREF, window.location.href).href;
  const stylesheets = Array.from(document.styleSheets) as CSSStyleSheet[];
  const cssChunks: string[] = [];

  for (const sheet of stylesheets) {
    if (isViteInjectedStyleSheet(sheet)) continue;

    const href = sheet.href ? sheet.href : null;
    if (href && href !== appHref && !href.startsWith(window.location.origin)) {
      continue;
    }

    const owner = sheet.ownerNode as HTMLElement | null;
    if (owner?.nodeName === "STYLE") {
      const style = owner as HTMLStyleElement;
      const text = style.textContent?.trim();
      if (text) {
        const sanitized = sanitizeCss(text);
        if (sanitized && isLikelyCompiledCss(sanitized)) {
          cssChunks.push(sanitized);
          continue;
        }
      }
    }

    if (href) {
      try {
        const response = await fetch(href);
        if (response.ok) {
          const text = await response.text();
          const compiled = getCompiledCssFromSource(text);
          if (compiled) {
            cssChunks.push(compiled);
            continue;
          }
        }
      } catch {
        // Ignore fetch errors.
      }
    }

    try {
      const rules = sheet.cssRules;
      if (!rules) continue;
      const cssText = Array.from(rules).map((rule) => rule.cssText).join("\n");
      if (cssText && isLikelyCompiledCss(cssText)) {
        cssChunks.push(cssText);
      }
    } catch {
      // Ignore cross-origin or inaccessible style sheets.
    }
  }

  const merged = sanitizeCss(cssChunks.join("\n")).trim();
  return isLikelyCompiledCss(merged) ? merged : "";
}

function isSourceTailwindCss(rawText: string) {
  const lower = rawText.toLowerCase();
  return /@import\s+["']tailwindcss["']/.test(lower)
    || /@source\b/.test(lower)
    || /@theme\s+inline\b/.test(lower)
    || /@import\s+["']tw-animate-css["']/.test(lower);
}

function getCompiledCssFromSource(rawText: string) {
  if (isSourceTailwindCss(rawText)) return "";
  const sanitized = sanitizeCss(rawText);
  if (sanitized && isLikelyCompiledCss(sanitized)) return sanitized;
  return "";
}

export async function fetchAppCss() {
  try {
    const response = await fetch(APP_CSS_HREF);
    if (!response.ok) {
      throw new Error(`Failed to load app styles from ${APP_CSS_HREF}`);
    }

    const rawText = await response.text();
    const compiled = getCompiledCssFromSource(rawText);
    if (compiled) return compiled;

    const loaded = await getLoadedAppCssFromDocument();
    if (loaded) return loaded;

    return "";
  } catch {
    const loaded = await getLoadedAppCssFromDocument();
    return loaded;
  }
}

const SITE_TRACKING_SNIPPET = `
<script async src="https://www.googletagmanager.com/gtag/js?id=G-W14JC88EV7"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  gtag('js', new Date());
  gtag('config', 'G-W14JC88EV7');
</script>`;

function normalizeAssetRef(ref: string) {
  return ref.replace(/^\.\//, "").replace(/^\//, "");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function escapeInlineScript(js: string) {
  return JSON.stringify(js)
    .replace(/<\/script>/gi, "<\\/script>")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

function resolveAssetValue(value: BuilderAssetEntry | string | undefined) {
  if (typeof value === "string") return value;
  if (!value) return undefined;
  if (typeof value.previewSrc === "string" && /^(data:|https?:|blob:)/i.test(value.previewSrc)) return value.previewSrc;
  if (typeof value.src === "string" && /^(data:|https?:|blob:)/i.test(value.src)) return value.src;
  if (value.filename) return `images/${value.filename}`;
  return value.src;
}

// Rewrite `images/<filename>` refs with the resolved asset value from the asset map.
export function resolveAssetPaths(html: string, assets?: Record<string, BuilderAssetEntry | string>) {
  if (!assets) return html;
  let out = html;
  for (const [name, value] of Object.entries(assets)) {
    const data = resolveAssetValue(value);
    if (!data) continue;
    const safeName = normalizeAssetRef(name);
    const variants = [
      `images/${safeName}`,
      `/${safeName}`,
      `./images/${safeName}`,
      `/images/${safeName}`,
      safeName,
    ];
    for (const variant of variants) {
      const esc = escapeRegExp(variant);
      const pattern = new RegExp(`(^|[\\s"'=(])${esc}(?=$|[\\s"')>])`, "g");
      out = out.replace(pattern, `$1${data}`);
    }
  }
  return out;
}

// Rewrite `page:<id>` link targets to `<slug>.html`.
export function resolvePageLinks(html: string, pages: { id: string; slug: string }[]) {
  let out = html;
  for (const p of pages) {
    const re = new RegExp(`href=(['"])page:${p.id}\\1`, "g");
    out = out.replace(re, (_m, q) => `href=${q}${p.slug}.html${q}`);
  }
  return out.replace(/href=(['"])page:[^'"\s]+\1/g, 'href="#"');
}

export const RUNTIME_CSS = `
details > summary { list-style: none; }
details > summary::-webkit-details-marker { display: none; }
details > summary .wto-chevron { transition: transform .25s ease; display: inline-block; }
details[open] > summary .wto-chevron { transform: rotate(180deg); }

[data-wto-sticky="1"] { position: sticky; top: 0; z-index: 40; }

/* Limit nav wrapper stacking so it doesn't block other interactive elements */
div:has(nav) { position: relative; z-index: 9999; }

[data-wto-nav-btn] { display: none; }
@media (max-width: 767px) {
  [data-wto-nav-btn] { display: inline-flex; align-items:center; justify-content:center; width:40px;height:40px;border-radius:8px;background:transparent;border:1px solid rgba(0,0,0,.15);cursor:pointer; }
  [data-wto-nav] { position: sticky; top: 0; z-index: 99999999; background: white; overflow: visible !important; transform: none !important; animation: none !important; }
  [data-wto-nav] [data-wto-nav-menu] {
    display: none !important; position: absolute; left: 0; right: 0; top: 100%;
    background: white; z-index: 999999999 !important;
    padding: 16px; flex-direction: column; gap: 12px;
    max-height: calc(100vh - 64px); overflow-y: auto;
    box-shadow: 0 12px 24px rgba(0,0,0,.08);
    border-top: 1px solid rgba(229,231,235,.9);
  }
  [data-wto-nav] [data-wto-nav-menu] a {
    display: block; padding: 10px 12px; border-radius: 12px; transition: background .2s ease, color .2s ease;
  }
  [data-wto-nav] [data-wto-nav-menu] a:hover {
    background: rgba(99,102,241,.08);
    color: #4338ca;
  }
  [data-wto-nav] a {
    position: relative;
    transition: color .2s ease;
  }
  [data-wto-nav] a::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -2px;
    width: 0;
    height: 2px;
    border-radius: 9999px;
    background: currentColor;
    transition: width .2s ease, left .2s ease;
  }
  [data-wto-nav] a:hover::after,
  [data-wto-nav] a:focus-visible::after {
    width: 100%;
    left: 0;
  }
  [data-wto-nav] [data-wto-nav-menu].wto-nav-open { display: flex !important; animation: wto-slide-down .25s ease; }
}
@media (min-width: 768px) {
  [data-wto-nav-btn] { display: none; }
  [data-wto-nav] [data-wto-nav-menu] a {
    position: relative;
    display: inline-flex;
    align-items: center;
    padding: 0 8px;
    color: inherit;
    text-decoration: none;
    transition: color .2s ease;
  }
  [data-wto-nav] [data-wto-nav-menu] a::after {
    content: '';
    position: absolute;
    left: 50%;
    bottom: -4px;
    width: 0;
    height: 2px;
    border-radius: 9999px;
    background: currentColor;
    transition: width .25s ease, left .25s ease;
  }
  [data-wto-nav] [data-wto-nav-menu] a:hover::after,
  [data-wto-nav] [data-wto-nav-menu] a:focus-visible::after {
    left: 0;
    width: 100%;
  }
}

[data-wto-nav] [data-wto-nav-menu] a {
  position: relative;
  display: inline-block;
  color: inherit;
  text-decoration: none;
}
[data-wto-nav] [data-wto-nav-menu] a::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 0;
  height: 2px;
  border-radius: 9999px;
  background: currentColor;
  transition: width .25s ease, left .25s ease;
}
[data-wto-nav] [data-wto-nav-menu] a:hover::after,
[data-wto-nav] [data-wto-nav-menu] a:focus-visible::after {
  left: 0;
  width: 100%;
}

[data-anim]{ opacity: 0; }
[data-anim].wto-in { opacity: 1; animation-fill-mode: both; animation-duration: var(--wto-dur,700ms); animation-delay: var(--wto-delay,0ms); }
[data-anim="fade-in"].wto-in { animation-name: wto-fade; }
[data-anim="fade-up"].wto-in { animation-name: wto-fade-up; }
[data-anim="fade-down"].wto-in { animation-name: wto-fade-down; }
[data-anim="slide-left"].wto-in { animation-name: wto-slide-left; }
[data-anim="slide-right"].wto-in { animation-name: wto-slide-right; }
[data-anim="zoom-in"].wto-in { animation-name: wto-zoom-in; }
[data-anim="zoom-out"].wto-in { animation-name: wto-zoom-out; }
[data-anim="flip"].wto-in { animation-name: wto-flip; }
[data-anim="bounce"].wto-in { animation-name: wto-bounce; }
@keyframes wto-fade { from{opacity:0} to{opacity:1} }
@keyframes wto-fade-up { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
@keyframes wto-fade-down { from{opacity:0;transform:translateY(-24px)} to{opacity:1;transform:none} }
@keyframes wto-slide-left { from{opacity:0;transform:translateX(-32px)} to{opacity:1;transform:none} }
@keyframes wto-slide-right { from{opacity:0;transform:translateX(32px)} to{opacity:1;transform:none} }
@keyframes wto-zoom-in { from{opacity:0;transform:scale(.9)} to{opacity:1;transform:none} }
@keyframes wto-zoom-out { from{opacity:0;transform:scale(1.1)} to{opacity:1;transform:none} }
@keyframes wto-flip { from{opacity:0;transform:rotateY(90deg)} to{opacity:1;transform:none} }
@keyframes wto-bounce { 0%{opacity:0;transform:translateY(20px)} 60%{opacity:1;transform:translateY(-8px)} 100%{transform:none} }
@keyframes wto-slide-down { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:none} }

/* Visibility helpers for responsive hide toggles */
[data-wto-hidden-mobile="1"] { display: none !important; }
@media (min-width: 640px) { [data-wto-hidden-mobile="1"] { display: block !important; } }
[data-wto-hidden-tablet="1"] { display: none !important; }
@media (min-width: 820px) { [data-wto-hidden-tablet="1"] { display: block !important; } }
[data-wto-hidden-desktop="1"] { display: none !important; }
@media (min-width: 1180px) { [data-wto-hidden-desktop="1"] { display: block !important; } }
`;

export const RUNTIME_SCRIPT = `
(function(){
  const send = (type, payload) => parent.postMessage({ __wto: true, type, payload }, '*');

  // Placeholder insertion to reserve space when dragging a new widget/section
  function removeDropPlaceholder() {
    const existing = document.getElementById('__wto_drop_placeholder');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    try { parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex: null } }, '*'); } catch (_) {}
  }

  function insertDropPlaceholderBefore(target) {
    removeDropPlaceholder();
    const ph = document.createElement('div');
    ph.id = '__wto_drop_placeholder';
    ph.style.cssText = 'height:72px;margin:12px 0;border-radius:12px;background:linear-gradient(180deg,rgba(99,102,241,0.06),rgba(99,102,241,0.02));border:2px dashed rgba(99,102,241,0.35);box-sizing:border-box;';
    if (!target || !target.parentNode) {
      document.body.appendChild(ph);
      // compute index 0
      try {
        parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex: 0 } }, '*');
      } catch (_) {}
      return ph;
    }
    target.parentNode.insertBefore(ph, target);
    // compute index before target
    try {
      const secs = Array.from(document.querySelectorAll('[data-wto-section]'));
      const idx = secs.findIndex((s) => s === target);
      const insertIndex = idx >= 0 ? idx : 0;
      parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex } }, '*');
    } catch (_) {}
    return ph;
  }

  function insertDropPlaceholderAfter(target) {
    removeDropPlaceholder();
    const ph = document.createElement('div');
    ph.id = '__wto_drop_placeholder';
    ph.style.cssText = 'height:72px;margin:12px 0;border-radius:12px;background:linear-gradient(180deg,rgba(99,102,241,0.06),rgba(99,102,241,0.02));border:2px dashed rgba(99,102,241,0.35);box-sizing:border-box;';
    if (!target || !target.parentNode) {
      document.body.appendChild(ph);
      try { parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex: (document.querySelectorAll('[data-wto-section]').length || 0) } }, '*'); } catch (_) {}
      return ph;
    }
    if (target.nextSibling) target.parentNode.insertBefore(ph, target.nextSibling);
    else target.parentNode.appendChild(ph);
    try {
      const secs = Array.from(document.querySelectorAll('[data-wto-section]'));
      const idx = secs.findIndex((s) => s === target);
      const insertIndex = idx >= 0 ? idx + 1 : secs.length;
      parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex } }, '*');
    } catch (_) {}
    return ph;
  }

  function showDropTarget(y) {
    try {
      removeDropPlaceholder();
      const el = document.elementFromPoint(10, Number(y) || 0);
      const sec = el && el.closest && el.closest('[data-wto-section]');
      if (!sec) {
        // no obvious section; append placeholder at end
        const secs = document.querySelectorAll('[data-wto-section]');
        if (secs.length) {
          const last = secs[secs.length - 1];
          insertDropPlaceholderAfter(last);
        } else {
          // insert at top of body
          const first = document.body.firstElementChild;
          if (first) insertDropPlaceholderBefore(first);
          else document.body.appendChild(document.createElement('div'));
        }
        return;
      }
      const r = sec.getBoundingClientRect();
      const before = (Number(y) || 0) < r.top + r.height / 2;
      if (before) insertDropPlaceholderBefore(sec);
      else insertDropPlaceholderAfter(sec);
    } catch (err) {
      try { parent.postMessage({ __wto: true, type: 'console', payload: { level: 'error', args: [String(err && err.stack ? err.stack : err)] } }, '*'); } catch (_) {}
    }
  }

  function hideDropTarget() {
    removeDropPlaceholder();
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.__wto || typeof data.type !== 'string') return;
    if (data.type === 'show-drop-target') {
      showDropTarget(Number(data.payload?.y ?? 0));
    } else if (data.type === 'hide-drop-target') {
      hideDropTarget();
    } else if (data.type === 'show-upload-target') {
      try {
        const sid = String(data.payload?.sectionId || '');
        const idx = data.payload?.index;
        const kind = data.payload?.elementKind || 'img';
        const sec = document.querySelector('[data-wto-section="' + sid + '"]');
        if (!sec) return;
        let target = null;
        if (idx != null && idx !== '') {
          target = sec.querySelector('[data-wto-idx="' + idx + '"]');
          if (!target && kind === 'image') target = sec.querySelectorAll('img')[Number(idx)] || null;
        }
        if (!target) {
          // fallback: pick first image in section
          target = sec.querySelector('img') || sec.querySelector('[data-wto-idx]');
        }
        if (target) showUploadIcon(getImageElement(target) || target, kind);
      } catch (err) {
        try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      }
    } else if (data.type === 'hide-upload-target') {
      hideUploadIcon();
    }
  });

  function indexAll() {
    document.querySelectorAll('[data-wto-section]').forEach(sec => {
      let i = 0;
      sec.querySelectorAll('*').forEach(el => { el.setAttribute('data-wto-idx', String(i++)); });
    });
  }
  function pathFrom(el, root) {
    const parts = [];
    let cur = el;
    while (cur && cur !== root) {
      const p = Array.prototype.indexOf.call(cur.parentElement?.children || [], cur);
      if (p < 0) break;
      parts.unshift(p);
      cur = cur.parentElement;
    }
    return parts.join(',');
  }

  function getEventTarget(e) {
    return e.target instanceof Element ? e.target : (e.target && e.target.parentElement) || null;
  }

  function isEditableTextNode(el) {
    if (!el || !el.textContent || !el.textContent.trim()) return false;
    if (el.closest && (el.closest('[data-wto-toolbar]') || el.closest('[data-wto-ignore-edit]') || el.closest('[data-wto-nav-btn]'))) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (['script', 'style', 'svg', 'img', 'video', 'audio', 'canvas', 'iframe', 'input', 'textarea', 'select'].includes(tag)) return false;
    const hasInteractiveChild = !!(el.querySelector && el.querySelector('a,button,input,select,textarea'));
    if (['a', 'button', 'summary', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'span', 'strong', 'em', 'b', 'i', 'small', 'blockquote', 'cite', 'label'].includes(tag)) return true;
    if (tag === 'div' && !hasInteractiveChild) return true;
    return false;
  }

  function findEditableTextTarget(target) {
    let current = target;
    while (current && current !== document.body) {
      if (isEditableTextNode(current)) {
        const hasEditableChild = !!Array.from(current.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,span,strong,em,b,i,small,blockquote,cite,label,div')).find((child) => child !== current && isEditableTextNode(child));
        if (!hasEditableChild) return current;
      }
      current = current.parentElement;
    }
    return null;
  }

  function indexElementKinds(section) {
    if (!section) return;
    let textIndex = -1;
    let imageIndex = -1;
    let linkIndex = -1;
    Array.from(section.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,span,strong,em,b,i,small,blockquote,cite,label,div'))
      .filter((el) => isEditableTextNode(el) && !Array.from(el.querySelectorAll('h1,h2,h3,h4,h5,h6,p,li,span,strong,em,b,i,small,blockquote,cite,label,div')).some((child) => child !== el && isEditableTextNode(child)))
      .forEach((el) => {
        textIndex += 1;
        el.setAttribute('data-wto-text-index', String(textIndex));
      });
    section.querySelectorAll('img').forEach(img => {
      if (img.closest('[data-wto-toolbar]') || img.closest('[data-wto-ignore-edit]') || img.closest('[data-wto-nav-btn]')) return;
      imageIndex += 1;
      img.setAttribute('data-wto-image-index', String(imageIndex));
    });
    section.querySelectorAll('a,button').forEach(el => {
      if (el.closest('[data-wto-toolbar]') || el.closest('[data-wto-ignore-edit]') || el.closest('[data-wto-nav-btn]')) return;
      linkIndex += 1;
      el.setAttribute('data-wto-link-index', String(linkIndex));
    });
  }

  function resolveElementSelection(target) {
    if (!target) return { elementKind: 'section', index: null, tag: null };
    const section = target.closest && target.closest('[data-wto-section]');
    const tag = target.tagName ? target.tagName.toLowerCase() : null;
    const img = target.closest && target.closest('img');
    if (img) {
      const idx = img.getAttribute('data-wto-image-index');
      return { sectionId: section ? section.dataset.wtoSection : null, elementKind: 'image', index: idx != null ? Number(idx) : null, tag: 'img' };
    }
    const link = target.closest && target.closest('a,button');
    if (link) {
      const idx = link.getAttribute('data-wto-link-index');
      return { sectionId: section ? section.dataset.wtoSection : null, elementKind: 'link', index: idx != null ? Number(idx) : null, tag: link.tagName ? link.tagName.toLowerCase() : null };
    }
    const textEl = findEditableTextTarget(target);
    if (textEl) {
      const idx = textEl.getAttribute('data-wto-text-index');
      return { sectionId: section ? section.dataset.wtoSection : null, elementKind: 'text', index: idx != null ? Number(idx) : null, tag: textEl.tagName ? textEl.tagName.toLowerCase() : null };
    }
    const containerEl = target.closest && target.closest('div,section,article,aside,main,header,footer,ul,ol,li,form,figure,figcaption,table,tr,td,th');
    if (containerEl && containerEl !== section && containerEl !== document.body && containerEl !== document.documentElement) {
      const idx = containerEl.getAttribute('data-wto-idx');
      return { sectionId: section ? section.dataset.wtoSection : null, elementKind: 'container', index: idx != null ? Number(idx) : null, tag: containerEl.tagName ? containerEl.tagName.toLowerCase() : tag };
    }
    return { sectionId: section ? section.dataset.wtoSection : null, elementKind: 'section', index: null, tag };
  }

  function getSelectionTargetElement(target) {
    if (!target) return null;
    const img = target.closest && target.closest('img');
    if (img) return img;
    const link = target.closest && target.closest('a,button');
    if (link) return link;
    const textEl = findEditableTextTarget(target);
    if (textEl) return textEl;
    const section = target.closest && target.closest('[data-wto-section]');
    const containerEl = target.closest && target.closest('div,section,article,aside,main,header,footer,ul,ol,li,form,figure,figcaption,table,tr,td,th');
    if (containerEl && containerEl !== section && containerEl !== document.body && containerEl !== document.documentElement) return containerEl;
    return section;
  }

  function getTypographyStyle(el) {
    if (!el) return null;
    const computed = window.getComputedStyle(el);
    const decorationParts = [computed.textDecorationLine || '', computed.textDecorationStyle || '', computed.textDecorationColor || ''].filter(Boolean);
    return {
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      color: computed.color,
      lineHeight: computed.lineHeight,
      letterSpacing: computed.letterSpacing,
      textAlign: computed.textAlign,
      textTransform: computed.textTransform,
      textDecoration: computed.textDecoration || decorationParts.join(' '),
      fontStyle: computed.fontStyle,
      opacity: computed.opacity,
    };
  }

  function clearElementSelectionHighlight() {
    document.querySelectorAll('.wto-element-selected').forEach(el => el.classList.remove('wto-element-selected'));
  }

  function applyElementSelectionHighlight(target) {
    clearElementSelectionHighlight();
    if (!target || !(target instanceof Element)) return null;
    const highlightEl = target.closest && target.closest('img, a, button, h1, h2, h3, h4, h5, h6, p, li, span, strong, em, b, i, small, blockquote, cite, label, div, section, article, aside, main, header, footer, ul, ol, form, figure, figcaption, table, tr, td, th');
    if (highlightEl) highlightEl.classList.add('wto-element-selected');
    return highlightEl;
  }

  function scrollToHash(href, e) {
    if (!href || !href.startsWith('#')) return false;
    const hash = href.slice(1);
    const target = document.getElementById(hash);
    if (!target) return false;
    if (e) e.preventDefault();
    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (window.history && window.history.replaceState) {
      const nextUrl = window.location.pathname + window.location.search + '#' + hash;
      window.history.replaceState(null, '', nextUrl);
    }
    return true;
  }

  indexAll();
  document.querySelectorAll('[data-wto-section]').forEach(section => indexElementKinds(section));

  function isCarouselArea(el) {
    if (!el || typeof el.closest !== 'function') return false;
    return !!el.closest('[data-carousel], [data-carousel-prev], [data-carousel-next], [data-carousel-dot], [data-carousel-items-prev], [data-carousel-items-next], [data-carousel-indicator], [data-carousel-track], .embla, .carousel');
  }

  function isBoxLike(el) {
    if (!el || el.tagName === 'IMG') return false;
    const cls = el.className && el.className.baseVal !== undefined ? el.className.baseVal : (el.className || '');
    if (/\\bbg-gradient/.test(cls)) return true;
    if (/\bbg-[^\s]+/.test(cls) && !el.querySelector('img')) return true;
    if (/\baspect-\[?[\w/.-]+\]?/.test(cls) && !el.querySelector('img')) return true;
    const style = el.getAttribute('style') || '';
    if (/background-image\s*:/i.test(style) || /background-color\s*:/i.test(style)) return true;
    return false;
  }

  const scrollTopBtn = document.createElement('button');
  scrollTopBtn.type = 'button';
  scrollTopBtn.setAttribute('aria-label', 'Scroll to top');
  scrollTopBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  scrollTopBtn.style.cssText = 'position:fixed;right:20px;bottom:20px;z-index:10005;display:none;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:9999px;background:#0f172a;color:#fff;box-shadow:0 10px 24px rgba(15,23,42,.25);cursor:pointer;';
  scrollTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  document.body.appendChild(scrollTopBtn);
  const toggleScrollTopBtn = () => {
    const shouldShow = window.scrollY > 240;
    scrollTopBtn.style.display = shouldShow ? 'flex' : 'none';
  };
  toggleScrollTopBtn();
  window.addEventListener('scroll', toggleScrollTopBtn, { passive: true });

  // Inline section toolbar
  const tb = document.createElement('div');
  tb.id = '__wto_tb';
  tb.style.cssText = 'position:fixed;z-index:10003;display:none;gap:2px;background:#0f172a;color:#fff;border-radius:8px;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.3);font:14px system-ui;';
  const btns = [
    ['up','↑','Move up'], ['down','↓','Move down'],
    ['top','⤒','Move to top'], ['bottom','⤓','Move to bottom'],
    ['dup','⧉','Duplicate'], ['del','🗑','Delete'],
  ];
  tb.innerHTML = btns.map(b => '<button data-act="'+b[0]+'" title="'+b[2]+'" style="all:unset;padding:4px 8px;border-radius:4px;cursor:pointer;color:#fff;">'+b[1]+'</button>').join('');
  document.body.appendChild(tb);
  let currentSection = null;
  function positionToolbar(sec) {
    if (!sec) { tb.style.display = 'none'; return; }
    const r = sec.getBoundingClientRect();
    tb.style.display = 'flex';
    const tbw = tb.offsetWidth || 220;
    const tbh = tb.offsetHeight || 40;
    const vw = window.innerWidth;
    const pad = 8;
    const left = r.left + (r.width - tbw) / 2;
    tb.style.left = Math.max(pad, Math.min(vw - tbw - pad, left)) + 'px';
    let top = r.top - tbh - pad;
    if (top < pad) top = Math.min(window.innerHeight - tbh - pad, r.bottom + pad);
    tb.style.top = top + 'px';
  }
  tb.addEventListener('mousedown', e => e.stopPropagation());
  tb.addEventListener('click', e => {
    const btn = e.target.closest('button');
    if (!btn || !currentSection) return;
    e.preventDefault(); e.stopPropagation();
    send('section-action', { sectionId: currentSection.dataset.wtoSection, action: btn.dataset.act });
  });

  const uploadIcon = document.createElement('button');
  uploadIcon.id = '__wto_image_upload';
  uploadIcon.type = 'button';
  uploadIcon.setAttribute('aria-label','Upload image');
  uploadIcon.title = 'Upload image';
  uploadIcon.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M4 7H6L7 5H17L18 7H20C21.1 7 22 7.9 22 9V19C22 20.1 21.1 21 20 21H4C2.9 21 2 20.1 2 19V9C2 7.9 2.9 7 4 7Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/><path d="M12 11.5C13.3807 11.5 14.5 12.6193 14.5 14C14.5 15.3807 13.3807 16.5 12 16.5C10.6193 16.5 9.5 15.3807 9.5 14C9.5 12.6193 10.6193 11.5 12 11.5Z" stroke="currentColor" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  uploadIcon.style.cssText = 'position:absolute;display:none;z-index:10004;width:36px;height:36px;border-radius:9999px;border:1px solid rgba(0,0,0,0.06);background:#fff;color:#111827;align-items:center;justify-content:center;display:flex;font:16px system-ui;cursor:pointer;pointer-events:auto;box-shadow:0 6px 18px rgba(15,23,42,0.08);padding:6px;';
  uploadIcon.addEventListener('mousedown', (e) => e.stopPropagation());
  document.body.appendChild(uploadIcon);

  let uploadTarget = null;
  let uploadTargetKind = 'img';

  function showUploadIcon(target, kind) {
    const rect = target.getBoundingClientRect();
    uploadTarget = target;
    uploadTargetKind = kind;
    const iconW = uploadIcon.offsetWidth || 36;
    const iconH = uploadIcon.offsetHeight || 36;
    // center icon over the target element
    let left = rect.left + (rect.width - iconW) / 2;
    let top = rect.top + (rect.height - iconH) / 2;
    const pad = 8;
    left = Math.max(pad, Math.min(window.innerWidth - iconW - pad, left));
    top = Math.max(pad, Math.min(window.innerHeight - iconH - pad, top));
    uploadIcon.style.left = left + 'px';
    uploadIcon.style.top = top + 'px';
    uploadIcon.style.display = 'flex';
  }

  function hideUploadIcon() {
    uploadTarget = null;
    uploadIcon.style.display = 'none';
  }

  function getImageElement(el) {
    if (!el || el.tagName === 'BODY' || el.tagName === 'HTML') return null;
    if (el.tagName === 'IMG') return el;
    return el.querySelector('img');
  }

  function isUploadCandidate(el) {
    if (!el || el.tagName === 'BODY' || el.tagName === 'HTML') return null;
    if (isCarouselArea(el)) return null;
    const img = getImageElement(el);
    if (img) return { el: img, kind: 'img' };
    if (isBoxLike(el)) return { el, kind: 'box' };
    return null;
  }

  uploadIcon.addEventListener('click', e => {
    if (!uploadTarget) return;
    const section = uploadTarget.closest('[data-wto-section]');
    if (!section) return;
    e.preventDefault(); e.stopPropagation();
    // Determine image element and index robustly (some images may not have data-wto-idx directly)
    const imgEl = getImageElement(uploadTarget) || uploadTarget;
    let idxAttr = uploadTarget.getAttribute && uploadTarget.getAttribute('data-wto-idx');
    if ((!idxAttr || idxAttr === '') && imgEl && imgEl.tagName === 'IMG') {
      const imgs = Array.from(section.querySelectorAll('img'));
      const found = imgs.indexOf(imgEl);
      if (found >= 0) idxAttr = String(found);
    }
    send('image-click', {
      sectionId: section.dataset.wtoSection,
      idx: idxAttr,
      path: pathFrom(uploadTarget, section),
      src: imgEl && imgEl.tagName === 'IMG' ? (imgEl.getAttribute('src') || '') : (uploadTarget.tagName === 'IMG' ? (uploadTarget.getAttribute('src') || '') : ''),
      kind: uploadTargetKind,
    });
    // Keep the upload icon visible for the selected element so users can re-open uploader quickly
    // do not hideUploadIcon() here; it will be hidden on pointermove away
  });

  document.addEventListener('pointermove', e => {
    const target = getEventTarget(e);
    if (!target || target.closest('#__wto_image_upload')) return;
    let candidate = target.closest('[data-wto-idx]');
    if (!candidate) {
      const wrapper = target.closest('[data-wto-idx]');
      candidate = wrapper;
    }
    if (!candidate) {
      hideUploadIcon();
      return;
    }
    const upload = isUploadCandidate(candidate);
    if (!upload) {
      hideUploadIcon();
      return;
    }
    if (uploadTarget === upload.el) return;
    showUploadIcon(upload.el, upload.kind);
  }, true);

  document.addEventListener('pointerdown', e => {
    const target = getEventTarget(e);
    if (!target || !target.closest('#__wto_image_upload')) hideUploadIcon();
  });

  addEventListener('scroll', () => positionToolbar(currentSection), true);
  addEventListener('resize', () => positionToolbar(currentSection));

  // Drag reorder
  document.querySelectorAll('[data-wto-section]').forEach(sec => sec.setAttribute('draggable','true'));
  document.querySelectorAll('[data-wto-section] a').forEach(a => a.setAttribute('draggable','false'));
  let dragId = null;
  document.addEventListener('dragstart', e => {
    try {
      const sec = e.target.closest && e.target.closest('[data-wto-section]');
      if (!sec) return;
      dragId = sec.dataset.wtoSection;
      try { e.dataTransfer.setData('text/plain', dragId); } catch(_){ }
      e.dataTransfer.effectAllowed = 'move';
      sec.style.opacity = '0.4';
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      console.error('wto-runtime dragstart error', err);
    }
  });
  document.addEventListener('dragend', e => {
    try {
      const sec = e.target.closest && e.target.closest('[data-wto-section]');
      if (sec) sec.style.opacity = '';
      e.preventDefault();
      const l = document.getElementById('__wto_line'); if (l) l.remove();
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      console.error('wto-runtime dragend error', err);
    }
  });
  document.addEventListener('dragover', e => {
    try {
      const sec = e.target.closest && e.target.closest('[data-wto-section]');
      if (!sec || !dragId) return;
      e.preventDefault();
      const r = sec.getBoundingClientRect();
      const before = e.clientY < r.top + r.height/2;
      let line = document.getElementById('__wto_line');
      if (!line) { line = document.createElement('div'); line.id='__wto_line'; line.style.cssText='position:absolute;left:0;right:0;height:3px;background:#6366f1;z-index:9999;pointer-events:none;'; document.body.appendChild(line); }
      const top = before ? sec.offsetTop : sec.offsetTop + sec.offsetHeight;
      line.style.top = top + 'px';
      sec.dataset.wtoDropBefore = before ? '1' : '0';
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      console.error('wto-runtime dragover error', err);
    }
  });
  document.addEventListener('drop', e => {
    try {
      const sec = e.target.closest && e.target.closest('[data-wto-section]');
      if (!sec || !dragId) return;
      e.preventDefault();
      const before = sec.dataset.wtoDropBefore === '1';
      send('section-move', { fromId: dragId, toId: sec.dataset.wtoSection, before });
      const l = document.getElementById('__wto_line'); if (l) l.remove();
      dragId = null;
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      console.error('wto-runtime drop error', err);
    }
  });

  function onClick(e) {
    try {
      const target = getEventTarget(e);
      if (!target) return;
      if (target.closest('#__wto_tb')) return;
      const nav = target.closest('[data-wto-nav]');
if (nav) {
  const anchor = target.closest('a');

  if (anchor) {
    const href = anchor.getAttribute('href') || "";
    const normalized = href
      .replace(/^[./]+/, "")
      .replace(/\.html(?:[?#].*)?$/, "");

    if (!href || href === "#") {
      e.preventDefault();
      return;
    }

    if (scrollToHash(href, e)) {
      return;
    }

    if (/^(?!https?:|mailto:).+\.html(?:[?#].*)?$/.test(href)) {
      e.preventDefault();
      send("navigate-page", { slug: normalized });
      return;
    }
  }
}
      if (target.closest('[data-carousel-prev], [data-carousel-next], [data-carousel-dot], [data-carousel-items-prev], [data-carousel-items-next], [data-carousel-indicator]')) return;
      const section = target.closest('[data-wto-section]');
      if (!section) return;
      const anchor = target.closest('a');
      
      currentSection = section;
      positionToolbar(section);
      const selection = resolveElementSelection(target);
      if (selection.elementKind === 'section') clearElementSelectionHighlight();
      else applyElementSelectionHighlight(target);
      const selectedEl = getSelectionTargetElement(target);
      const style = (selection.elementKind !== 'section' && selectedEl) ? getTypographyStyle(selectedEl) : null;
      send('select', { sectionId: selection.sectionId || section.dataset.wtoSection, elementKind: selection.elementKind, index: selection.index, tag: selection.tag, style });
      try {
        const candidate = target.closest && target.closest('[data-wto-idx]') || target;
        const upload = isUploadCandidate(candidate);
        if (upload) showUploadIcon(upload.el, upload.kind);
      } catch (_) {}
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      console.error('wto-runtime onClick error', err);
    }
  }

  function isEditableTextNode(el) {
    if (!el || !el.textContent || !el.textContent.trim()) return false;
    if (el.closest && (el.closest('[data-wto-toolbar]') || el.closest('[data-wto-ignore-edit]') || el.closest('[data-wto-nav-btn]'))) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (['script', 'style', 'svg', 'img', 'video', 'audio', 'canvas', 'iframe', 'input', 'textarea', 'select'].includes(tag)) return false;
    const hasInteractiveChild = !!(el.querySelector && el.querySelector('a,button,input,select,textarea'));
    if (['a', 'button', 'summary', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li', 'span', 'strong', 'em', 'b', 'i', 'small', 'blockquote', 'cite', 'label'].includes(tag)) return true;
    if (tag === 'div' && !hasInteractiveChild) return true;
    return false;
  }

  function findEditableTarget(target) {
    return findEditableTextTarget(target);
  }

  function startTextEdit(e) {
    const target = e.target;
    const el = findEditableTarget(target);
    const section = target.closest('[data-wto-section]');
    if (!el || !section) return;
    e.preventDefault(); e.stopPropagation();
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('data-wto-editable', 'true');
    el.focus();
    try { const range = document.createRange(); range.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(range); } catch(_) {}
    const onKey = (ev) => { if ((ev.key==='Enter' && !ev.shiftKey) || ev.key==='Escape') { ev.preventDefault(); el.blur(); } };
    const onBlur = () => {
      el.removeAttribute('contenteditable'); el.removeAttribute('spellcheck');
      el.removeEventListener('keydown', onKey); el.removeEventListener('blur', onBlur);
      if (el.tagName === 'SUMMARY') {
        const chevron = el.querySelector('.wto-chevron');
        if (!chevron) {
          const span = document.createElement('span');
          span.className = 'wto-chevron';
          span.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
          el.appendChild(span);
        }
      }
      send('section-html', { sectionId: section.dataset.wtoSection, html: section.innerHTML });
    };
    el.addEventListener('keydown', onKey);
    el.addEventListener('blur', onBlur);
  }
  document.addEventListener('pointerdown', e => { if (e.detail >= 2) startTextEdit(e); }, true);
  document.addEventListener('click', onClick, true);
  document.addEventListener('dblclick', startTextEdit, true);

  // Animations
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) en.target.classList.add('wto-in');
    else if (en.target.getAttribute('data-anim-repeat')==='1') en.target.classList.remove('wto-in');
  }), { threshold: 0.15 });
  document.querySelectorAll('[data-anim]').forEach(el => io.observe(el));

  // Responsive nav
  document.querySelectorAll('[data-wto-nav]').forEach(nav => {
    const btn = nav.querySelector('[data-wto-nav-btn]');
    const menu = nav.querySelector('[data-wto-nav-menu]');
    if (!btn || !menu) return;
    
    const setActiveLink = (slug) => {
      menu.querySelectorAll('a').forEach(a => {
        const href = a.getAttribute('href');
        const linkSlug = href?.replace(/\.html$/, '');
        if (linkSlug === slug) {
          a.classList.add('active');
        } else {
          a.classList.remove('active');
        }
      });
    };
    
    const toggleMenu = () => {
      const open = menu.classList.toggle('wto-nav-open');
      menu.classList.toggle('hidden', !open);
      menu.style.display = open ? 'flex' : 'none';
    };
    const closeMenu = () => {
      if (!window.matchMedia('(max-width: 767px)').matches) return;
      menu.classList.remove('wto-nav-open');
      menu.classList.add('hidden');
      menu.style.display = 'none';
    };
    btn.addEventListener('click', event => {
      event.stopPropagation();
      toggleMenu();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => {
  
      e.stopPropagation();
      const href = a.getAttribute('href') || '';
      if (scrollToHash(href, e)) {
        closeMenu();
        return;
      }
      // If link points to a page file (e.g., "about-us.html"), navigate to that page
      if (href && href.endsWith('.html') && !href.startsWith('http')) {
        e.preventDefault();
        const slug = href.replace(/\.html$/, '');
        setActiveLink(slug);
       console.log("SEND NAVIGATE", href, slug);
send('navigate-page', { slug });
      }
      closeMenu();
    }));
    // Close menu when clicking outside nav
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && menu.classList.contains('wto-nav-open')) {
        closeMenu();
      }
    });
  });

  // Brand upload overlay: add a small upload button near the brand anchor in nav
  document.querySelectorAll('nav, [data-wto-nav]').forEach(nav => {
    try {
      const header = nav.closest('header');
      const candidateAnchors = [];
      if (header) candidateAnchors.push(...Array.from(header.querySelectorAll('a')));
      candidateAnchors.push(...Array.from(nav.querySelectorAll('a')));
      const brand = candidateAnchors.find(a => {
        if (a.closest('ul') || a.closest('li') || a.closest('[data-wto-nav-menu]')) return false;
        const href = (a.getAttribute('href') || '').trim();
        return href === '#top' || (header && a.closest('header') && !a.closest('nav'));
      }) || candidateAnchors.find(a => !a.closest('ul') && !a.closest('li') && !a.closest('[data-wto-nav-menu]'));
      if (!brand) return;
      brand.style.position = brand.style.position || 'relative';
      const up = document.createElement('button');
      up.setAttribute('aria-label', 'Upload logo');
      up.style.cssText = 'position:absolute;left:-8px;top:50%;transform:translate(-100%, -50%);background:rgba(15,23,42,0.95);color:#fff;border-radius:6px;padding:6px;z-index:10005;border:0;cursor:pointer;';
      up.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 5 17 10"/><line x1="12" y1="5" x2="12" y2="17"/></svg>';
      up.addEventListener('click', (e) => {
        e.preventDefault(); e.stopPropagation();
        const sec = brand.closest('[data-wto-section]');
        const sid = sec ? sec.getAttribute('data-wto-section') : null;
        send('brand-upload', { sectionId: sid });
      });
      brand.appendChild(up);
    } catch (_) {}
  });

  ['log','warn','error','info'].forEach(k => {
    const orig = console[k];
    console[k] = function() {
      try { send('console', { level: k, args: Array.from(arguments).map(a => { try { return typeof a==='string'?a:JSON.stringify(a); } catch(_) { return String(a); } }) }); } catch(_) {}
      orig.apply(console, arguments);
    };
  });
  addEventListener('error', (e) => send('console', { level:'error', args:[String(e.message)] }));

  window.__wtoSelect = function(id){
    const sec = document.querySelector('[data-wto-section="'+id+'"]');
    document.querySelectorAll('[data-wto-section]').forEach(s => s.classList.toggle('wto-selected', s === sec));
    currentSection = sec;
    positionToolbar(sec);
  };
})();
`;

export const EXPORT_RUNTIME = `
(function(){
  var io = new IntersectionObserver(function(es){es.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('wto-in'); }
    else if(e.target.getAttribute('data-anim-repeat')==='1'){ e.target.classList.remove('wto-in'); }
  });},{threshold:.15});
  document.querySelectorAll('[data-anim]').forEach(function(el){io.observe(el);});
  
  var getPageSlug=function(){
    var path=window.location.pathname;
    var match=path.match(/([^\\/]+)\\.html?$/);
    return match?match[1]:'index';
  };
  var currentSlug=getPageSlug();
  var scrollTopBtn=document.createElement('button');
  scrollTopBtn.type='button';
  scrollTopBtn.setAttribute('aria-label','Scroll to top');
  scrollTopBtn.innerHTML='<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5"/><path d="m5 12 7-7 7 7"/></svg>';
  scrollTopBtn.style.cssText='position:fixed;right:20px;bottom:20px;z-index:10005;display:none;align-items:center;justify-content:center;width:44px;height:44px;border:0;border-radius:9999px;background:#0f172a;color:#fff;box-shadow:0 10px 24px rgba(15,23,42,.25);cursor:pointer;';
  scrollTopBtn.addEventListener('click',function(){window.scrollTo({top:0,behavior:'smooth'});});
  document.body.appendChild(scrollTopBtn);
  var toggleScrollTopBtn=function(){var shouldShow=window.scrollY>240;scrollTopBtn.style.display=shouldShow?'flex':'none';};
  toggleScrollTopBtn();
  window.addEventListener('scroll',toggleScrollTopBtn,{passive:true});
  var scrollToHash=function(href,e){
    if(!href||!href.startsWith('#')) return false;
    var hash=href.slice(1);
    var target=document.getElementById(hash);
    if(!target) return false;
    if(e) e.preventDefault();
    target.scrollIntoView({behavior:'smooth',block:'start'});
    return true;
  };
  
  document.querySelectorAll('[data-wto-nav]').forEach(function(nav){
    var btn=nav.querySelector('[data-wto-nav-btn]');
    var menu=nav.querySelector('[data-wto-nav-menu]');
    if(!btn||!menu)return;
    
    var setActiveLink=function(slug){
      menu.querySelectorAll('a').forEach(function(a){
        var href=a.getAttribute('href');
        var linkSlug=href?href.replace(/\\.html$/,''):'index';
        if(linkSlug===slug){a.classList.add('active');}
        else{a.classList.remove('active');}
      });
    };
    setActiveLink(currentSlug);
    
    var toggleMenu=function(){
      var open=menu.classList.toggle('wto-nav-open');
      menu.classList.toggle('hidden', !open);
      menu.style.display=open?'flex':'none';
    };
    var closeMenu=function(){
      if(!window.matchMedia('(max-width: 767px)').matches) return;
      menu.classList.remove('wto-nav-open');
      menu.classList.add('hidden');
      menu.style.display='none';
    };
    btn.addEventListener('click',function(e){e.stopPropagation();toggleMenu();});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(e){e.stopPropagation();var href=a.getAttribute('href')||'';if(scrollToHash(href,e)){closeMenu();return;}closeMenu();});});
    document.addEventListener('click',function(e){if(!nav.contains(e.target)&&menu.classList.contains('wto-nav-open')){closeMenu();}});
  });
  document.addEventListener('click',function(e){
    try {
      var target = e.target;
      while (target && target.nodeName !== 'A') { target = target.parentElement; }
      if (!target || target.nodeName !== 'A') return;
      var href = target.getAttribute('href') || '';
      if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:')) return;
      if (href.startsWith('#')) {
        scrollToHash(href,e);
      }
    } catch (_) {}
  });
})();
`;

function renderSeoTags(opts: { title?: string; description?: string; keywords?: string; seo?: PageSeo; projectSeo?: ProjectSeo }) {
  const title = opts.seo?.title || opts.title || "";
  const description = opts.seo?.description ?? opts.description;
  const keywords = opts.seo?.keywords ?? opts.keywords;
  const canonicalUrl = opts.seo?.canonicalUrl;
  const robots = opts.seo?.robots;
  const author = opts.seo?.author;
  const themeColor = opts.projectSeo?.themeColor;
  const ogTitle = opts.seo?.openGraphTitle || title;
  const ogDescription = opts.seo?.openGraphDescription ?? description;
  const ogImage = opts.seo?.openGraphImage;
  const ogUrl = opts.seo?.openGraphUrl;
  const twitterCard = opts.seo?.twitterCard;
  const twitterTitle = opts.seo?.twitterTitle || ogTitle;
  const twitterDescription = opts.seo?.twitterDescription ?? ogDescription;
  const twitterImage = opts.seo?.twitterImage || ogImage;
  const lines: string[] = [];

  if (description) lines.push(`<meta name="description" content="${escapeHtml(description)}" />`);
  if (keywords) lines.push(`<meta name="keywords" content="${escapeHtml(keywords)}" />`);
  if (robots) lines.push(`<meta name="robots" content="${escapeHtml(robots)}" />`);
  if (author) lines.push(`<meta name="author" content="${escapeHtml(author)}" />`);
  if (themeColor) lines.push(`<meta name="theme-color" content="${escapeHtml(themeColor)}" />`);
  if (canonicalUrl) lines.push(`<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`);

  if (ogTitle) lines.push(`<meta property="og:title" content="${escapeHtml(ogTitle)}" />`);
  if (ogDescription) lines.push(`<meta property="og:description" content="${escapeHtml(ogDescription)}" />`);
  if (ogUrl) lines.push(`<meta property="og:url" content="${escapeHtml(ogUrl)}" />`);
  if (ogImage) lines.push(`<meta property="og:image" content="${escapeHtml(ogImage)}" />`);
  if (ogTitle || ogDescription || ogUrl || ogImage) lines.push(`<meta property="og:type" content="website" />`);

  if (twitterCard) lines.push(`<meta name="twitter:card" content="${escapeHtml(twitterCard)}" />`);
  if (twitterTitle) lines.push(`<meta name="twitter:title" content="${escapeHtml(twitterTitle)}" />`);
  if (twitterDescription) lines.push(`<meta name="twitter:description" content="${escapeHtml(twitterDescription)}" />`);
  if (twitterImage) lines.push(`<meta name="twitter:image" content="${escapeHtml(twitterImage)}" />`);

  if (opts.seo?.structuredData) lines.push(`<script type="application/ld+json">${opts.seo.structuredData}</script>`);
  if (opts.projectSeo?.googleSearchConsoleVerification) lines.push(`<meta name="google-site-verification" content="${escapeHtml(opts.projectSeo.googleSearchConsoleVerification)}" />`);
  if (opts.projectSeo?.googleSiteVerification) lines.push(`<meta name="google-site-verification" content="${escapeHtml(opts.projectSeo.googleSiteVerification)}" />`);
  if (opts.projectSeo?.bingVerification) lines.push(`<meta name="msvalidate.01" content="${escapeHtml(opts.projectSeo.bingVerification)}" />`);

  return lines.join("\n");
}

function gtagSnippet(id: string) {
  return `
<script async src="https://www.googletagmanager.com/gtag/js?id=${escapeHtml(id)}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);} 
  gtag('js', new Date());
  gtag('config', '${escapeHtml(id)}');
</script>`;
}

function gtmSnippet(id: string) {
  return `
<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${escapeHtml(id)}');</script>
<!-- End Google Tag Manager -->`;
}

function pixelSnippet(id: string) {
  return `
<!-- Meta / Facebook Pixel -->
<script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '${escapeHtml(id)}');
  fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=${escapeHtml(id)}&ev=PageView&noscript=1"
/></noscript>`;
}

function withExportTracking(customHead?: string, projectSeo?: ProjectSeo) {
  const baseHead = (customHead ?? "").trim();
  const pieces: string[] = [];
  if (baseHead) pieces.push(baseHead);
  if (!baseHead.includes("cdn.tailwindcss.com")) {
    pieces.push(`<script src="https://cdn.tailwindcss.com"></script>`);
  }
  if (projectSeo?.googleTagManagerId && !baseHead.includes("googletagmanager.com/gtm.js")) {
    pieces.push(gtmSnippet(projectSeo.googleTagManagerId));
  }
  if (projectSeo?.googleAnalyticsId && !baseHead.includes("googletagmanager.com/gtag/js")) {
    pieces.push(gtagSnippet(projectSeo.googleAnalyticsId));
  }
  const pixelId = projectSeo?.facebookPixelId ?? projectSeo?.metaPixelId;
  if (pixelId && !baseHead.includes("fbq(") && !baseHead.includes("connect.facebook.net/en_US/fbevents.js")) {
    pieces.push(pixelSnippet(pixelId));
  }
  if (!baseHead && !projectSeo?.googleAnalyticsId && !projectSeo?.googleTagManagerId && !pixelId) {
    return [SITE_TRACKING_SNIPPET.trim(), `<script src="https://cdn.tailwindcss.com"></script>`].join("\n");
  }
  return pieces.join("\n").trim();
}

function sectionAttrs(s: PageSection) {
  const parts: string[] = [];
  const styleParts: string[] = [];
  const isNavSection = /data-wto-nav/.test(s.html);
  const animType = isNavSection ? undefined : s.animation?.type || "fade-up";
  const dur = s.animation?.duration ?? 700;
  const del = s.animation?.delay ?? 0;
  if (animType) {
    parts.push(`data-anim="${animType}"`);
    styleParts.push(`--wto-dur:${dur}ms`, `--wto-delay:${del}ms`);
    if (s.animation?.repeat) parts.push('data-anim-repeat="1"');
  }
  if (s.sticky) parts.push('data-wto-sticky="1"');
  if ((s as any).hiddenMobile) parts.push('data-wto-hidden-mobile="1"');
  if ((s as any).hiddenTablet) parts.push('data-wto-hidden-tablet="1"');
  if ((s as any).hiddenDesktop) parts.push('data-wto-hidden-desktop="1"');
  if (styleParts.length) parts.push(`style="${styleParts.join(";")}"`);
  return parts.join(" ");
}

export function buildPreviewHTML(opts: {
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
  editable: boolean;
  selectedId?: string | null;
  assets?: Record<string, BuilderAssetEntry | string>;
  pages?: { id: string; slug: string }[];
  currentPageSlug?: string;
  title?: string;
  description?: string;
  keywords?: string;
  seo?: PageSeo;
  projectSeo?: ProjectSeo;
  customHead?: string;
  previewCss?: string;
  previewCssHref?: string;
}) {
  const {
    sections,
    globalCss,
    globalJs,
    editable,
    selectedId,
    assets,
    pages,
    currentPageSlug,
    title,
    description,
    keywords,
    seo,
    projectSeo,
    customHead,
    previewCss,
    previewCssHref,
  } = opts;

  const htmlLang = seo?.language ?? projectSeo?.language ?? "en";
  const pageTitle = seo?.title || title || "Preview";
  const metaTags = renderSeoTags({ title: pageTitle, description, keywords, seo, projectSeo });

  const sectionHTML = sections
    .filter((s) => editable || !s.hidden)
    .map((s) => {
      if (s.collapsed) return "";
      const styleStr = styleToString(s.style);
      const outline = editable && selectedId === s.id ? "outline:2px solid #6366f1;outline-offset:-2px;" : "";
      const visibleHtml = applyRootAttributes(s.html, {
        className: s.className,
        domId: s.domId,
        style: styleStr,
      });
      const linked = pages ? resolvePageLinks(visibleHtml, pages) : visibleHtml;
      const extra = sectionAttrs(s);
      const hiddenAttr = s.hidden && editable ? ' data-wto-hidden="1"' : "";
      return `<div data-wto-section="${s.id}" class="wto-section" style="${outline}" ${extra}${hiddenAttr}>${resolveAssetPaths(linked, assets)}</div>`;
    })
    .join("\n");

  const editableStyles = editable
    ? `
    .wto-section { position: relative; }
    .wto-section:hover { outline: 1px dashed #94a3b8; outline-offset: -1px; cursor: pointer; }
    .wto-section.wto-selected { outline: 2px solid #6366f1 !important; outline-offset: -2px; }
    .wto-element-selected { outline: 2px solid #2563eb !important; outline-offset: 2px !important; box-shadow: 0 0 0 1px rgba(37, 99, 235, 0.16), 0 10px 30px rgba(37, 99, 235, 0.12) !important; }
    .wto-section[data-wto-hidden="1"] { opacity: .35; }
    [contenteditable="true"] { outline: 2px solid #f59e0b !important; }
    `
    : "";

  const previewStyles = previewCss
    ? `<style>${previewCss}</style>`
    : `<link rel="stylesheet" href="${previewCssHref ?? APP_CSS_HREF}" />`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(htmlLang)}">
<head>
<meta charset="${escapeHtml(projectSeo?.charset ?? "utf-8")}" />
<meta name="viewport" content="${escapeHtml(projectSeo?.viewport ?? "width=device-width, initial-scale=1")}" />
<title>${escapeHtml(pageTitle)}</title>
${metaTags}
${previewStyles}
<style>
  html, body { margin: 0; min-height: 100%; overflow-x: hidden; }
  body { font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; }
  ${RUNTIME_CSS}
  ${editableStyles}
  ${globalCss || ""}
</style>
${customHead || ""}
</head>
<body>
${sectionHTML || (editable ? '<div style="padding:80px;text-align:center;color:#94a3b8;font-family:system-ui">Drag sections from the left to start building →</div>' : "")}
<script>window.__wtoCurrentPageSlug = ${JSON.stringify(currentPageSlug ?? "index")};</script>
<script>${editable ? RUNTIME_SCRIPT : EXPORT_RUNTIME}</script>
<script>try{new Function(${escapeInlineScript(globalJs || "")})();}catch(e){console.error(e)}</script>
</body>
</html>`;
}

export function buildExportBundle(opts: {
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
  title?: string;
  description?: string;
  keywords?: string;
  seo?: PageSeo;
  projectSeo?: ProjectSeo;
  customHead?: string;
  assets?: Record<string, BuilderAssetEntry | string>;
  inlineAssets?: boolean;
  pages?: { id: string; slug: string }[];
}) {
  const {
    sections,
    globalCss,
    globalJs,
    title = "My Website",
    description,
    keywords,
    seo,
    projectSeo,
    customHead,
    assets,
    inlineAssets,
    pages,
  } = opts;
  const pageTitle = seo?.title || title;
  const metaTags = renderSeoTags({ title: pageTitle, description, keywords, seo, projectSeo });
  const exportHead = withExportTracking(customHead, projectSeo);
  const body = sections
    .filter((s) => !s.hidden)
    .map((s) => {
      const styleStr = styleToString(s.style);
      const raw = applyRootAttributes(s.html, {
        className: s.className,
        domId: s.domId,
        style: styleStr,
        fallbackTag: "section",
      });
      const withLinks = pages ? resolvePageLinks(raw, pages) : raw;
      const wrap = sectionAttrs(s);
      const wrapped = wrap ? `<div ${wrap}>${withLinks}</div>` : withLinks;
      return inlineAssets ? resolveAssetPaths(wrapped, assets) : wrapped;
    })
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(projectSeo?.language ?? seo?.language ?? "en")}">
<head>
<meta charset="${escapeHtml(projectSeo?.charset ?? "utf-8")}" />
<meta name="viewport" content="${escapeHtml(projectSeo?.viewport ?? "width=device-width, initial-scale=1")}" />
${metaTags}
<title>${escapeHtml(pageTitle)}</title>
<link rel="stylesheet" href="./css/styles.css" />
${exportHead}
</head>
<body>
${body}
<script src="./js/main.js"></script>
</body>
</html>`;

  const cssContent = `${RUNTIME_CSS}
${globalCss}`;

  const complete = `<!DOCTYPE html>
<html lang="${escapeHtml(projectSeo?.language ?? seo?.language ?? "en")}">
<head>
<meta charset="${escapeHtml(projectSeo?.charset ?? "utf-8")}" />
<meta name="viewport" content="${escapeHtml(projectSeo?.viewport ?? "width=device-width, initial-scale=1")}" />
${metaTags}
<title>${escapeHtml(pageTitle)}</title>
<style>${cssContent}</style>
${exportHead}
</head>
<body>
${inlineAssets ? body : resolveAssetPaths(body, assets)}
<script>try{new Function(${escapeInlineScript(globalJs || "")})();}catch(e){console.error(e)}</script>
</body>
</html>`;

  return { html, css: cssContent, js: globalJs, complete, body };
}

export async function buildSiteExport(project: Project) {
  const pageMeta = project.pages.map((p) => ({ id: p.id, slug: p.slug }));
  const files: { path: string; content: string; base64?: string }[] = [];
  const cssContent = `${RUNTIME_CSS}\n${project.globalCss || ""}`;
  files.push({ path: "css/styles.css", content: cssContent });
  files.push({ path: "js/main.js", content: `${project.globalJs || ""}\n${EXPORT_RUNTIME}` });
  for (const page of project.pages) {
    const bundle = buildExportBundle({
      sections: page.sections,
      globalCss: "",
      globalJs: "",
      title: `${project.name} — ${page.name}`,
      description: page.description,
      keywords: page.keywords,
      seo: page.seo,
      projectSeo: project.seo,
      customHead: project.customHead,
      assets: project.assets,
      pages: pageMeta,
    });
    files.push({ path: `${page.slug}.html`, content: bundle.html });
  }
  for (const [name, asset] of Object.entries(project.assets ?? {})) {
    const entry = typeof asset === "string" ? undefined : asset;
    const filename = entry?.filename || name;
    const blob = entry?.imageId ? await getImageBlob(entry.imageId) : null;
    if (blob) {
      const buffer = await blob.arrayBuffer();
      const bytes = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("");
      files.push({ path: `images/${filename}`, content: "", base64: btoa(bytes) });
    } else {
      files.push({ path: `images/${filename}`, content: "" });
    }
  }
  return { files };
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
  if (opts.className?.trim()) nextAttrs = mergeAttr(nextAttrs, "class", opts.className.trim(), " ");
  if (opts.domId?.trim()) nextAttrs = setAttr(nextAttrs, "id", opts.domId.trim());
  if (opts.style?.trim()) nextAttrs = mergeAttr(nextAttrs, "style", opts.style.trim(), ";");
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
