import type { PageSection, Project, PageSeo, ProjectSeo } from "./store";
import { getImageBlob, getAssetValue, type BuilderAssetEntry } from "./image-storage";
import { getWidgetBootstrapExport, getWidgetExportContribution } from "@/components/builder/widgets/widgetRegistry";
import { getWidgetSelectionLabel } from "@/components/builder/widgets/widgetSelectionLabels";
import { WTO_CAROUSEL_RUNTIME } from "@/components/builder/widgets/Carousel/CarouselRuntime";
import { WTO_FAQ_RUNTIME } from "@/components/builder/widgets/FAQ/FAQRuntime";
import {
  BOOTSTRAP_BUNDLE_JS_CDN,
  BOOTSTRAP_CSS_CDN,
  FONT_AWESOME_CDN,
  WIDGET_TYPE_EXPORT_JS,
  dedupeCssBlocks,
  dedupeJsBlocks,
  extractStyleTags,
} from "./exportContributions";
import { composePageSections, sectionLabelForCanvas } from "./sharedChrome";
import appCssUrl from "@/styles.css?url";
import appCssRaw from "@/styles.css?raw";

export const APP_CSS_HREF = appCssUrl;
export const APP_CSS_TEXT = appCssRaw;
const BOOTSTRAP_CSS_HREF = BOOTSTRAP_CSS_CDN;
const BOOTSTRAP_JS_HREF = BOOTSTRAP_BUNDLE_JS_CDN;
const FONT_AWESOME_HREF = FONT_AWESOME_CDN;

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

function getGridColumnCount(widgetInstance: { layout?: { columns?: unknown }; content?: { columns?: unknown[] } } | undefined) {
  const count = Number((widgetInstance as any)?.layout?.columns ?? (widgetInstance as any)?.content?.columns?.length ?? 1);
  return Math.max(1, Math.min(6, Number.isFinite(count) ? count : 1));
}

function resolveAssetValue(value: BuilderAssetEntry | string | undefined) {
  return getAssetValue(value);
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
      `builder://images/${safeName}`,
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
export function toExportHtmlFilename(slug: string | null | undefined) {
  const normalized = String(slug || "index")
    .trim()
    .replace(/\.html?$/i, "")
    .replace(/^\/+/, "");
  if (!normalized || normalized === "index" || normalized === "home") {
    return "index.html";
  }
  return `${normalized}.html`;
}

export function resolvePageLinks(html: string, pages: { id: string; slug: string }[]) {
  let out = html;
  for (const p of pages) {
    const file = toExportHtmlFilename(p.slug);
    const re = new RegExp(`href=(['"])page:${p.id}\\1`, "g");
    out = out.replace(re, (_m, q) => `href=${q}${file}${q}`);
  }
  return out.replace(/href=(['"])page:[^'"\s]+\1/g, 'href="#"');
}

export const RUNTIME_CSS = `
.builder-editor-only,
[data-builder-editor-only="1"] { display: none !important; }
body[data-builder-edit-mode="1"] .builder-editor-only,
body[data-builder-edit-mode="1"] [data-builder-editor-only="1"] { display: flex !important; }
body[data-builder-edit-mode="1"] .builder-editor-only.inline-flex,
body[data-builder-edit-mode="1"] [data-builder-editor-only="1"].inline-flex { display: inline-flex !important; }

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

.wto-container-drop-target {
  outline: 2px solid rgba(99, 102, 241, 0.35);
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.14), 0 14px 38px rgba(99, 102, 241, 0.12);
  border-radius: 16px;
  background: rgba(99, 102, 241, 0.05);
}

.wto-container-drop-indicator {
  height: 3px;
  border-radius: 9999px;
  margin: 10px 0;
  background: linear-gradient(90deg, rgba(99, 102, 241, 0.95), rgba(129, 140, 248, 0.68));
  box-shadow: 0 0 0 1px rgba(99, 102, 241, 0.2);
}
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
  const send = (type, payload) => {
    try {
      parent.postMessage({ __wto: true, type, payload }, '*');
    } catch (err) {
      // Parent may not be available (direct preview, closed window, or extension interference).
      // Swallow errors to avoid noisy console messages in embed/preview contexts.
    }
  };

  // Placeholder insertion to reserve space when dragging a new widget/section
  function clearContainerDropState() {
    document.querySelectorAll('[data-container-widget-id]').forEach((el) => el.classList.remove('wto-container-drop-target'));
    document.querySelectorAll('.wto-container-drop-indicator').forEach((el) => el.remove());
    try { parent.postMessage({ __wto: true, type: 'container-drop-target', payload: { containerId: null, insertIndex: null } }, '*'); } catch (_) {}
  }

  function createDropPlaceholder() {
    const ph = document.createElement('div');
    ph.id = '__wto_drop_placeholder';
    ph.setAttribute('data-wto-drop-placeholder', '1');
    ph.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;min-height:72px;margin:12px 0;padding:16px;border-radius:12px;box-sizing:border-box;border:2px dashed #60a5fa;background:rgba(191,219,254,0.55);color:#1d4ed8;font:600 14px/1.4 system-ui,-apple-system,Segoe UI,Roboto,sans-serif;letter-spacing:0.01em;pointer-events:none;';
    ph.textContent = 'Drop widget here';
    return ph;
  }

  function removeDropPlaceholder() {
    const existing = document.getElementById('__wto_drop_placeholder');
    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);
    try { parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex: null } }, '*'); } catch (_) {}
  }

  function insertDropPlaceholderBefore(target) {
    removeDropPlaceholder();
    const ph = createDropPlaceholder();
    if (!target || !target.parentNode) {
      document.body.appendChild(ph);
      try {
        parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex: 0 } }, '*');
      } catch (_) {}
      return ph;
    }
    target.parentNode.insertBefore(ph, target);
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
    const ph = createDropPlaceholder();
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

  function showDropTarget(y, widgetId, x) {
    try {
      removeDropPlaceholder();
      clearContainerDropState();

      const supportedChildTypes = new Set(['heading', 'text', 'button', 'image']);
      const isSupportedChildWidget = !!widgetId && supportedChildTypes.has(String(widgetId).replace(/-v\d+$/, ''));
      const pointX = Number.isFinite(Number(x)) ? Number(x) : Math.max(24, Math.floor(window.innerWidth / 2));
      const pointY = Number(y) || 0;
      const el = document.elementFromPoint(pointX, pointY);
      const containerEl = el && el.closest && el.closest('[data-container-widget-id]');
      if (isSupportedChildWidget && containerEl) {
        const containerId = containerEl.getAttribute('data-container-widget-id');
        const childWrappers = Array.from(containerEl.querySelectorAll('[data-container-child-wrapper="1"]'));
        let insertIndex = childWrappers.length;
        let targetWrapper = null;
        let position = 'after';

        if (childWrappers.length) {
          const rects = childWrappers.map((wrapper) => ({ wrapper, rect: wrapper.getBoundingClientRect() }));
          const target = rects.find((entry) => {
            const rect = entry.rect;
            return pointY >= rect.top && pointY <= rect.bottom;
          });

          if (target) {
            targetWrapper = target.wrapper;
            const rect = target.rect;
            const midpoint = rect.top + rect.height / 2;
            position = pointY < midpoint ? 'before' : 'after';
            insertIndex = Number(targetWrapper.getAttribute('data-container-child-index')) + (position === 'before' ? 0 : 1);
          } else {
            const nearest = rects.reduce((best, entry) => {
              const currentDistance = Math.abs((entry.rect.top + entry.rect.height / 2) - pointY);
              const bestDistance = best ? Math.abs((best.rect.top + best.rect.height / 2) - pointY) : Infinity;
              return currentDistance < bestDistance ? entry : best;
            }, null);
            if (nearest) {
              targetWrapper = nearest.wrapper;
              const rect = nearest.rect;
              const midpoint = rect.top + rect.height / 2;
              position = pointY < midpoint ? 'before' : 'after';
              insertIndex = Number(nearest.wrapper.getAttribute('data-container-child-index')) + (position === 'before' ? 0 : 1);
            }
          }
        }

        containerEl.classList.add('wto-container-drop-target');
        const indicator = document.createElement('div');
        indicator.className = 'wto-container-drop-indicator';
        if (targetWrapper && targetWrapper.parentNode) {
          if (position === 'before') {
            targetWrapper.parentNode.insertBefore(indicator, targetWrapper);
          } else {
            targetWrapper.parentNode.insertBefore(indicator, targetWrapper.nextSibling);
          }
        } else {
          containerEl.appendChild(indicator);
        }

        try { parent.postMessage({ __wto: true, type: 'container-drop-target', payload: { containerId, insertIndex } }, '*'); } catch (_) {}
        return;
      }

      const secs = Array.from(document.querySelectorAll('[data-wto-section]'));
      if (!secs.length) {
        const ph = createDropPlaceholder();
        document.body.appendChild(ph);
        try { parent.postMessage({ __wto: true, type: 'placeholder-update', payload: { insertIndex: 0 } }, '*'); } catch (_) {}
        return;
      }

      let targetSec = el && el.closest && el.closest('[data-wto-section]');
      if (!targetSec) {
        const nearest = secs.reduce((best, sec) => {
          const rect = sec.getBoundingClientRect();
          const mid = rect.top + rect.height / 2;
          const distance = Math.abs(mid - pointY);
          if (!best || distance < best.distance) return { sec, distance };
          return best;
        }, null);
        targetSec = nearest ? nearest.sec : null;
      }

      if (!targetSec) {
        insertDropPlaceholderAfter(secs[secs.length - 1]);
        return;
      }

      const r = targetSec.getBoundingClientRect();
      const before = pointY < r.top + r.height / 2;
      if (before) insertDropPlaceholderBefore(targetSec);
      else insertDropPlaceholderAfter(targetSec);
    } catch (err) {
      try { parent.postMessage({ __wto: true, type: 'console', payload: { level: 'error', args: [String(err && err.stack ? err.stack : err)] } }, '*'); } catch (_) {}
    }
  }

  function hideDropTarget() {
    removeDropPlaceholder();
    clearContainerDropState();
  }

  window.addEventListener('message', (event) => {
    const data = event.data;
    if (!data || !data.__wto || typeof data.type !== 'string') return;
    if (data.type === 'show-drop-target') {
      showDropTarget(Number(data.payload?.y ?? 0), data.payload?.widgetId ? String(data.payload.widgetId) : null, data.payload?.x != null ? Number(data.payload.x) : null);
    } else if (data.type === 'hide-drop-target') {
      hideDropTarget();
    } else if (data.type === 'set-selected-section') {
      try {
        const sid = String(data.payload?.sectionId ?? '');
        if (typeof window.__wtoSelect === 'function') {
          window.__wtoSelect(sid || '');
        }
      } catch (_) {}
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
    if (!target) return { elementKind: 'section', index: null, tag: null, sectionId: null, widgetId: null, widgetType: null, parentWidgetId: null, childId: null, elementKey: null, elementType: null };
    const section = target.closest && target.closest('[data-wto-section]');
    const widgetRoot = target.closest && target.closest('[data-wto-widget-root], [data-widget-id]');
    const sectionWidgetRoot = section ? section.querySelector('[data-wto-widget-root]') : null;
    const rootWidgetId = widgetRoot ? widgetRoot.getAttribute('data-widget-id') : null;
    const rootWidgetType = widgetRoot ? widgetRoot.getAttribute('data-widget') : null;

    const widgetElement = target.closest && target.closest('[data-wto-widget-element-key]');
    if (widgetElement) {
      const root = widgetElement.closest && widgetElement.closest('[data-widget-id], [data-wto-widget-root]');
      const containerChildWrapper = target.closest && target.closest('[data-container-parent-widget-id],[data-wto-parent-widget-id]');
      const columnWrapper = target.closest && target.closest('[data-grid-column-id]');
      const columnId = (columnWrapper && columnWrapper.getAttribute('data-grid-column-id')) || null;
      const parentWidgetId = containerChildWrapper
        ? containerChildWrapper.getAttribute('data-container-parent-widget-id') || containerChildWrapper.getAttribute('data-wto-parent-widget-id')
        : (root ? root.getAttribute('data-widget-id') : null);
      const childId = containerChildWrapper
        ? containerChildWrapper.getAttribute('data-container-child-id') || containerChildWrapper.getAttribute('data-wto-child-id')
        : null;
      return {
        sectionId: section ? section.dataset.wtoSection : null,
        elementKind: 'widget',
        index: null,
        tag: widgetElement.tagName ? widgetElement.tagName.toLowerCase() : null,
        widgetId: root ? root.getAttribute('data-widget-id') : null,
        widgetType: root ? root.getAttribute('data-widget') : null,
        parentWidgetId,
        childId,
        elementKey: childId || widgetElement.getAttribute('data-wto-widget-element-key'),
        elementType: widgetElement.getAttribute('data-wto-widget-element-type') || null,
        columnId,
      };
    }
    const childWrapper = target.closest && target.closest('[data-container-parent-widget-id],[data-wto-parent-widget-id]');
    if (childWrapper) {
      const widgetRootForChild = childWrapper.closest && childWrapper.closest('[data-widget-id], [data-wto-widget-root]');
      const wrapperChildId = childWrapper.getAttribute('data-container-child-id') || childWrapper.getAttribute('data-wto-child-id');
      const wrapperElementKey = childWrapper.getAttribute('data-wto-widget-element-key') || wrapperChildId;
      const parentWidgetIdFromAttr = childWrapper.getAttribute('data-container-parent-widget-id') || childWrapper.getAttribute('data-wto-parent-widget-id');
      const columnId = childWrapper.getAttribute('data-grid-column-id') || null;
      const result = {
        sectionId: section ? section.dataset.wtoSection : null,
        elementKind: 'widget',
        index: null,
        tag: childWrapper.tagName ? childWrapper.tagName.toLowerCase() : null,
        widgetId: parentWidgetIdFromAttr,
        widgetType: widgetRootForChild ? widgetRootForChild.getAttribute('data-widget') : null,
        parentWidgetId: parentWidgetIdFromAttr,
        childId: wrapperChildId,
        elementKey: wrapperElementKey,
        elementType: childWrapper.getAttribute('data-wto-widget-element-type') || null,
        columnId,
      };
      return result;
    }
    const sectionEl = target.closest && target.closest('[data-wto-section]');
    const tag = target.tagName ? target.tagName.toLowerCase() : null;
    const img = target.closest && target.closest('img');
    if (img) {
      const childWrapper = img.closest && img.closest('[data-container-parent-widget-id],[data-wto-parent-widget-id]');
      if (childWrapper) {
        const parentWidgetIdFromAttr = childWrapper.getAttribute('data-container-parent-widget-id') || childWrapper.getAttribute('data-wto-parent-widget-id');
        const wrapperChildId = childWrapper.getAttribute('data-container-child-id') || childWrapper.getAttribute('data-wto-child-id');
        const columnId = childWrapper.getAttribute('data-grid-column-id') || null;
        return {
          sectionId: section ? section.dataset.wtoSection : null,
          elementKind: 'widget',
          index: null,
          tag: childWrapper.tagName ? childWrapper.tagName.toLowerCase() : null,
          widgetId: parentWidgetIdFromAttr,
          widgetType: childWrapper.closest('[data-widget-id]')?.getAttribute('data-widget') || null,
          parentWidgetId: parentWidgetIdFromAttr,
          childId: wrapperChildId,
          elementKey: wrapperChildId,
          elementType: childWrapper.getAttribute('data-wto-widget-element-type') || 'image',
          columnId,
        };
      }
      const idx = img.getAttribute('data-wto-image-index');
      return {
        sectionId: sectionEl ? sectionEl.dataset.wtoSection : null,
        elementKind: 'image',
        index: idx != null ? Number(idx) : null,
        tag: 'img',
        widgetId: rootWidgetId,
        widgetType: rootWidgetType,
        parentWidgetId: null,
        childId: null,
        elementKey: null,
        elementType: null,
      };
    }
    const link = target.closest && target.closest('a,button');
    if (link) {
      // console.log('link detected', { link: link.outerHTML.substring(0, 100), target: target.outerHTML.substring(0, 100) });
      const childWrapper = link.closest && link.closest('[data-container-parent-widget-id],[data-wto-parent-widget-id]');
      // console.log('childWrapper search result', { found: !!childWrapper, wrapper: childWrapper?.outerHTML.substring(0, 100) });
      if (childWrapper) {
        const parentWidgetIdFromAttr = childWrapper.getAttribute('data-container-parent-widget-id') || childWrapper.getAttribute('data-wto-parent-widget-id');
        const wrapperChildId = childWrapper.getAttribute('data-container-child-id') || childWrapper.getAttribute('data-wto-child-id');
        const columnId = childWrapper.getAttribute('data-grid-column-id') || null;
        return {
          sectionId: section ? section.dataset.wtoSection : null,
          elementKind: 'widget',
          index: null,
          tag: childWrapper.tagName ? childWrapper.tagName.toLowerCase() : null,
          widgetId: parentWidgetIdFromAttr,
          widgetType: childWrapper.closest('[data-widget-id]')?.getAttribute('data-widget') || null,
          parentWidgetId: parentWidgetIdFromAttr,
          childId: wrapperChildId,
          elementKey: wrapperChildId,
          elementType: childWrapper.getAttribute('data-wto-widget-element-type') || 'button',
          columnId,
        };
      }
      const idx = link.getAttribute('data-wto-link-index');
      return {
        sectionId: sectionEl ? sectionEl.dataset.wtoSection : null,
        elementKind: 'link',
        index: idx != null ? Number(idx) : null,
        tag: link.tagName ? link.tagName.toLowerCase() : null,
        widgetId: rootWidgetId,
        widgetType: rootWidgetType,
        parentWidgetId: null,
        childId: null,
        elementKey: null,
        elementType: null,
      };
    }
    const textEl = findEditableTextTarget(target);
    if (textEl) {
      const childWrapper = textEl.closest && textEl.closest('[data-container-parent-widget-id],[data-wto-parent-widget-id]');
      if (childWrapper) {
        const parentWidgetIdFromAttr = childWrapper.getAttribute('data-container-parent-widget-id') || childWrapper.getAttribute('data-wto-parent-widget-id');
        const wrapperChildId = childWrapper.getAttribute('data-container-child-id') || childWrapper.getAttribute('data-wto-child-id');
        const columnId = childWrapper.getAttribute('data-grid-column-id') || null;
        return {
          sectionId: section ? section.dataset.wtoSection : null,
          elementKind: 'widget',
          index: null,
          tag: childWrapper.tagName ? childWrapper.tagName.toLowerCase() : null,
          widgetId: parentWidgetIdFromAttr,
          widgetType: childWrapper.closest('[data-widget-id]')?.getAttribute('data-widget') || null,
          parentWidgetId: parentWidgetIdFromAttr,
          childId: wrapperChildId,
          elementKey: wrapperChildId,
          elementType: childWrapper.getAttribute('data-wto-widget-element-type') || 'text',
          columnId,
        };
      }
      const idx = textEl.getAttribute('data-wto-text-index');
      return {
        sectionId: sectionEl ? sectionEl.dataset.wtoSection : null,
        elementKind: 'text',
        index: idx != null ? Number(idx) : null,
        tag: textEl.tagName ? textEl.tagName.toLowerCase() : null,
        widgetId: rootWidgetId,
        widgetType: rootWidgetType,
        parentWidgetId: null,
        childId: null,
        elementKey: null,
        elementType: null,
      };
    }
    const gridColumnEl = target.closest && target.closest('[data-grid-column-wrapper="1"]');
    if (gridColumnEl) {
      const gridRoot = gridColumnEl.closest && gridColumnEl.closest('[data-widget-id], [data-wto-widget-root]');
      const columnId = gridColumnEl.getAttribute('data-grid-column-id') || null;
      return {
        sectionId: section ? section.dataset.wtoSection : null,
        elementKind: 'widget',
        index: null,
        tag: 'div',
        widgetId: gridRoot ? gridRoot.getAttribute('data-widget-id') : rootWidgetId,
        widgetType: gridRoot ? gridRoot.getAttribute('data-widget') : rootWidgetType,
        parentWidgetId: gridRoot ? gridRoot.getAttribute('data-widget-id') : rootWidgetId,
        childId: null,
        elementKey: null,
        elementType: null,
        columnId,
      };
    }
    const containerEl = target.closest && target.closest('div,section,article,aside,main,header,footer,ul,ol,li,form,figure,figcaption,table,tr,td,th');
    if (containerEl && containerEl !== sectionEl && containerEl !== document.body && containerEl !== document.documentElement) {
      const idx = containerEl.getAttribute('data-wto-idx');
      return {
        sectionId: sectionEl ? sectionEl.dataset.wtoSection : null,
        elementKind: 'container',
        index: idx != null ? Number(idx) : null,
        tag: containerEl.tagName ? containerEl.tagName.toLowerCase() : tag,
        widgetId: rootWidgetId,
        widgetType: rootWidgetType,
        parentWidgetId: null,
        childId: null,
        elementKey: null,
        elementType: null,
      };
    }
    if (sectionWidgetRoot) {
      return {
        sectionId: section ? section.dataset.wtoSection : null,
        elementKind: 'widget',
        index: null,
        tag: sectionWidgetRoot.tagName ? sectionWidgetRoot.tagName.toLowerCase() : null,
        widgetId: sectionWidgetRoot.getAttribute('data-widget-id') || null,
        widgetType: sectionWidgetRoot.getAttribute('data-widget') || null,
        parentWidgetId: null,
        childId: null,
        elementKey: null,
        elementType: null,
      };
    }
    return { sectionId: sectionEl ? sectionEl.dataset.wtoSection : null, elementKind: 'section', index: null, tag, widgetId: null, widgetType: null, parentWidgetId: null, childId: null, elementKey: null, elementType: null };
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
    const isTransparentColor = (value) => {
      if (!value) return true;
      const normalized = String(value).trim();
      return /^transparent$/i.test(normalized) || /^rgba?\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\)$/i.test(normalized);
    };
    let color = computed.color;
    const fillColor = computed.webkitTextFillColor || '';
    if (isTransparentColor(color) || isTransparentColor(fillColor)) {
      const inlineColor = el.style && el.style.color ? String(el.style.color).trim() : '';
      if (inlineColor && !isTransparentColor(inlineColor)) {
        color = inlineColor;
      } else {
        const styleAttr = el.getAttribute && el.getAttribute('style') || '';
        const match = styleAttr.match(/(?:^|;)\\s*color\\s*:\\s*([^;]+)/i);
        if (match && match[1] && !isTransparentColor(match[1])) {
          color = match[1].trim();
        }
      }
    }
    return {
      fontFamily: computed.fontFamily,
      fontSize: computed.fontSize,
      fontWeight: computed.fontWeight,
      color,
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

  function clearSelectionIndicators() {
    document.querySelectorAll('.wto-sel-selected, .wto-sel-parent').forEach((el) => {
      el.classList.remove('wto-sel-selected', 'wto-sel-parent');
      if (el.getAttribute('data-wto-sel-pos-patched') === '1') {
        el.style.position = '';
        el.removeAttribute('data-wto-sel-pos-patched');
      }
    });
    document.querySelectorAll('.wto-sel-badge, .wto-sel-overlay').forEach((el) => el.remove());
    document.querySelectorAll('.wto-grid-parent-selected, .wto-grid-parent-active, .wto-grid-item-selected').forEach((el) => {
      el.classList.remove('wto-grid-parent-selected', 'wto-grid-parent-active', 'wto-grid-item-selected');
    });
    document.querySelectorAll('.wto-grid-outline-label').forEach((el) => el.remove());
  }

  function getWidgetSelectionLabel(type, fallback) {
    var map = {
      navbar: 'Header',
      header: 'Header',
      hero: 'Hero',
      grid: 'Grid',
      heading: 'Heading',
      text: 'Paragraph',
      paragraph: 'Paragraph',
      button: 'Button',
      image: 'Image',
      container: 'Container',
      footer: 'Footer'
    };
    if (!type) return fallback || 'Widget';
    var key = String(type).trim().toLowerCase();
    if (map[key]) return map[key];
    if (!key) return fallback || 'Widget';
    return key.charAt(0).toUpperCase() + key.slice(1);
  }

  function ensureSelectionPosition(target) {
    if (!target || !(target instanceof Element)) return;
    var style = window.getComputedStyle(target);
    if (style.position === 'static') {
      target.style.position = 'relative';
      target.setAttribute('data-wto-sel-pos-patched', '1');
    }
  }

  function addSelectionOverlay(target, tone) {
    if (!target || !(target instanceof Element)) return;
    ensureSelectionPosition(target);
    var overlay = document.createElement('div');
    overlay.className = 'wto-sel-overlay' + (tone === 'parent' ? ' wto-sel-overlay--parent' : '');
    overlay.setAttribute('data-builder-editor-only', '1');
    target.appendChild(overlay);
  }

  function addSelectionBadge(target, text, tone) {
    if (!target || !(target instanceof Element) || !text) return;
    ensureSelectionPosition(target);
    var badge = document.createElement('span');
    badge.className = 'wto-sel-badge' + (tone === 'parent' ? ' wto-sel-badge--parent' : '');
    badge.setAttribute('data-builder-editor-only', '1');
    badge.textContent = text;
    target.appendChild(badge);
  }

  function resolveWidgetSurface(widgetRoot) {
    if (!widgetRoot) return null;
    var root = widgetRoot;
    if (!(root.matches && (root.matches('[data-wto-widget-root]') || root.matches('[data-widget-id]')))) {
      root = widgetRoot.closest('[data-wto-widget-root], [data-widget-id]') || widgetRoot;
    }
    var child = root.firstElementChild;
    while (child && (child.tagName === 'STYLE' || child.tagName === 'SCRIPT' || child.classList.contains('wto-sel-badge') || child.classList.contains('wto-sel-overlay'))) {
      child = child.nextElementSibling;
    }
    return child || root;
  }

  function resolveChildSurface(selection, parentSurface) {
    var childId = selection && (selection.childId || selection.elementKey);
    if (!childId) return null;
    var scope = parentSurface || document;
    return scope.querySelector('[data-wto-child-id="' + childId + '"], [data-container-child-id="' + childId + '"], [data-wto-widget-element-key="' + childId + '"]');
  }

  function resolveSectionLabel(sectionEl, widgetType) {
    if (widgetType) return getWidgetSelectionLabel(widgetType);
    if (!sectionEl) return 'Widget';
    var labeled = sectionEl.querySelector('[data-wto-widget-label]');
    if (labeled && labeled.getAttribute('data-wto-widget-label')) {
      return labeled.getAttribute('data-wto-widget-label');
    }
    var root = sectionEl.querySelector('[data-widget]');
    if (root && root.getAttribute('data-widget')) {
      return getWidgetSelectionLabel(root.getAttribute('data-widget'));
    }
    if (sectionEl.querySelector('footer') || /<footer\\b/i.test(sectionEl.innerHTML || '')) return 'Footer';
    if (sectionEl.querySelector('header, nav, [data-wto-nav]')) return 'Header';
    return 'Section';
  }

  function applyWidgetSelectionIndicators(selection, sectionEl) {
    clearSelectionIndicators();
    var section = sectionEl || (selection && selection.sectionId ? document.querySelector('[data-wto-section="' + selection.sectionId + '"]') : null);
    var childId = selection && (selection.childId || selection.elementKey);
    var widgetId = selection && (selection.parentWidgetId || selection.widgetId);
    var widgetType = selection && selection.widgetType;
    var columnId = selection && selection.columnId;

    if (childId && widgetId) {
      var widgetRoot = document.querySelector('[data-widget-id="' + widgetId + '"]');
      var parentSurface = resolveWidgetSurface(widgetRoot);
      if (parentSurface) {
        parentSurface.classList.add('wto-sel-parent');
        addSelectionOverlay(parentSurface, 'parent');
        addSelectionBadge(parentSurface, resolveSectionLabel(section, widgetType || parentSurface.getAttribute('data-widget')), 'parent');
      }
      var childSurface = resolveChildSurface(selection, widgetRoot || parentSurface || document);
      if (childSurface) {
        childSurface.classList.add('wto-sel-selected');
        addSelectionOverlay(childSurface, 'selected');
        addSelectionBadge(childSurface, getWidgetSelectionLabel(selection.elementType || 'Widget'), 'selected');
      }
      return;
    }

    if (columnId && widgetId) {
      var gridRoot = document.querySelector('[data-widget-id="' + widgetId + '"]');
      var gridSurface = resolveWidgetSurface(gridRoot);
      if (gridSurface) {
        gridSurface.classList.add('wto-sel-parent');
        addSelectionOverlay(gridSurface, 'parent');
        addSelectionBadge(gridSurface, resolveSectionLabel(section, widgetType || gridSurface.getAttribute('data-widget') || 'grid'), 'parent');
      }
      var columnEl = (gridRoot || document).querySelector('[data-grid-column-id="' + columnId + '"][data-grid-column-wrapper="1"]')
        || (gridRoot || document).querySelector('[data-grid-column-id="' + columnId + '"]');
      if (columnEl) {
        columnEl.classList.add('wto-sel-selected');
        addSelectionOverlay(columnEl, 'selected');
        addSelectionBadge(columnEl, 'Column', 'selected');
      }
      return;
    }

    var targetRoot = null;
    if (widgetId) {
      targetRoot = resolveWidgetSurface(document.querySelector('[data-widget-id="' + widgetId + '"]'));
    }
    if (!targetRoot && section) {
      targetRoot = resolveWidgetSurface(section.querySelector('[data-wto-widget-root], [data-widget-id]')) || section;
    }
    if (!targetRoot) return;
    targetRoot.classList.add('wto-sel-selected');
    addSelectionOverlay(targetRoot, 'selected');
    var label = targetRoot.getAttribute('data-wto-widget-label') || resolveSectionLabel(section, widgetType || targetRoot.getAttribute('data-widget'));
    addSelectionBadge(targetRoot, label, 'selected');
  }

  function clearDuplicateControls() {
    document.querySelectorAll('.wto-duplicate-control').forEach(el => el.remove());
  }

  function applyDuplicateControl(target) {
    clearDuplicateControls();
    if (!target || !(target instanceof Element)) return null;
    if (target.closest && (target.closest('[data-wto-carousel="1"]') || target.closest('[data-wto-gallery="1"]') || target.closest('[data-wto-faq="1"]') || target.closest('[data-wto-services="1"]') || target.closest('[data-wto-about="1"]') || target.closest('[data-wto-cta="1"]'))) return null;
    const host = target.closest && target.closest('img, a, button, h1, h2, h3, h4, h5, h6, p, li, span, strong, em, b, i, small, blockquote, cite, label, div, section, article, aside, main, header, footer, ul, ol, form, figure, figcaption, table, tr, td, th');
    if (!host) return null;
    const rect = host.getBoundingClientRect();
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'wto-duplicate-control';
    btn.setAttribute('aria-label', 'Duplicate element');
    btn.innerHTML = '<i class="fa-solid fa-copy"></i>';
    btn.style.cssText = 'position:fixed;left:' + Math.max(8, Math.min(window.innerWidth - 36, rect.right + 8)) + 'px;top:' + Math.max(8, Math.min(window.innerHeight - 36, rect.top + 8)) + 'px;z-index:10005;width:28px;height:28px;border:0;border-radius:9999px;background:#fff;color:#111827;display:flex;align-items:center;justify-content:center;box-shadow:0 6px 16px rgba(15,23,42,0.14);cursor:pointer;pointer-events:auto;';
    btn.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      const section = host.closest('[data-wto-section]');
      const widgetElement = host.closest('[data-wto-widget-element-key]');
      const widgetRoot = widgetElement?.closest('[data-widget-id], [data-wto-widget-root]');
      send('element-duplicate', {
        sectionId: section?.dataset.wtoSection ?? null,
        widgetId: widgetRoot?.getAttribute('data-widget-id') ?? null,
        elementKey: widgetElement?.getAttribute('data-wto-widget-element-key') ?? null,
        elementType: widgetElement?.getAttribute('data-wto-widget-element-type') ?? null,
        kind: widgetElement ? 'widget' : 'text',
        index: host.getAttribute('data-wto-text-index') ?? host.getAttribute('data-wto-image-index') ?? host.getAttribute('data-wto-link-index') ?? null,
        tag: host.tagName ? host.tagName.toLowerCase() : null,
      });
    });
    document.body.appendChild(btn);
    return btn;
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

  // Prevent navigation in editor mode. Allow previewable links via data attributes.
  document.addEventListener('click', function(e) {
    try {
      const target = e.target instanceof Element ? e.target : (e.target && e.target.parentElement) || null;
      const a = target && target.closest ? target.closest('a') : null;
      if (!a) return;
      const href = a.getAttribute('href') || '';
      // allow in-page anchors to scroll
      if (href.startsWith('#')) {
        if (scrollToHash(href, e)) return;
        e.preventDefault();
        return;
      }
      // explicit previewable links marked by data attributes
      const allowPreview = a.getAttribute('data-allow-preview') === 'true' || a.getAttribute('data-wto-allow-preview') === 'true' || a.dataset?.allowPreview === 'true' || a.dataset?.wtoAllowPreview === 'true';
      if (allowPreview && href) {
        e.preventDefault();
        try { parent.postMessage({ __wto: true, type: 'open-preview-link', payload: { href } }, '*'); } catch(_) {}
        return;
      }
      // Block all other navigations inside editor
      e.preventDefault();
    } catch (err) {
      try { parent.postMessage({ __wto: true, type: 'console', payload: { level: 'error', args: [String(err && err.stack ? err.stack : err)] } }, '*'); } catch (_) {}
    }
  }, true);

  // Block form submissions in editor and forward for preview if explicitly allowed
  document.addEventListener('submit', function(e) {
    try {
      const form = e.target instanceof HTMLFormElement ? e.target : (e.target && e.target.closest && e.target.closest('form')) || null;
      if (!form) return;
      const allow = form.getAttribute('data-allow-preview') === 'true' || form.dataset?.allowPreview === 'true';
      e.preventDefault();
      if (allow) {
        try { parent.postMessage({ __wto: true, type: 'preview-form-submit', payload: { action: form.getAttribute('action') || '', method: form.method || 'get' } }, '*'); } catch(_) {}
      }
    } catch (err) {
      try { parent.postMessage({ __wto: true, type: 'console', payload: { level: 'error', args: [String(err && err.stack ? err.stack : err)] } }, '*'); } catch (_) {}
    }
  }, true);

  indexAll();
  document.querySelectorAll('[data-wto-section]').forEach(section => indexElementKinds(section));

  function isCarouselArea(el) {
    if (!el || typeof el.closest !== 'function') return false;
    return !!el.closest('[data-carousel], [data-carousel-prev], [data-carousel-next], [data-carousel-dot], [data-carousel-items-prev], [data-carousel-items-next], [data-carousel-indicator], [data-carousel-track], .embla, .carousel');
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
  tb.style.cssText = 'position:fixed;z-index:10003;display:none;gap:4px;background:rgba(15,23,42,0.96);color:#fff;border-radius:14px;padding:6px 8px;box-shadow:0 14px 40px rgba(15,23,42,0.28);font:0/0 a;pointer-events:auto;';
  const btns = [
    ['move-up','fa-solid fa-arrow-up','Move Up'],
    ['move-down','fa-solid fa-arrow-down','Move Down'],
    ['dup','fa-solid fa-clone','Duplicate'],
    ['add','fa-solid fa-plus','Add Element'],
    ['del','fa-solid fa-trash','Delete'],
  ];
  tb.innerHTML = btns.map(b => '<button data-act="'+b[0]+'" title="'+b[2]+'" style="all:unset;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;cursor:pointer;color:#e2e8f0;background:rgba(255,255,255,0.06);border:1px solid rgba(148,163,184,0.16);transition:background .15s ease;color:#f8fafc;"><i class="'+b[1]+'" style="font-size:14px;width:16px;text-align:center"></i></button>').join('');
  let toolbarMounted = false;
  function mountToolbar() {
    if (!toolbarMounted && !tb.parentNode) {
      document.body.appendChild(tb);
      toolbarMounted = true;
    }
  }
  function unmountToolbar() {
    if (toolbarMounted && tb.parentNode) {
      tb.parentNode.removeChild(tb);
      toolbarMounted = false;
    }
  }
  const styleControlWrapper = document.createElement('div');
  styleControlWrapper.style.cssText = 'display:none;align-items:center;gap:6px;padding:0 4px;';
  const toolbarButtonCss = 'all:unset;display:inline-flex;align-items:center;justify-content:center;width:34px;height:34px;border-radius:10px;cursor:pointer;color:#f8fafc;background:rgba(255,255,255,0.06);border:1px solid rgba(148,163,184,0.16);transition:background .15s ease, transform .15s ease;position:relative;';
  const gridColumnsButton = document.createElement('button');
  gridColumnsButton.type = 'button';
  gridColumnsButton.dataset.act = 'grid-columns';
  gridColumnsButton.setAttribute('aria-label', 'Grid columns');
  gridColumnsButton.style.cssText = toolbarButtonCss;
  gridColumnsButton.innerHTML = '<i class="fa-solid fa-table-columns" style="font-size:14px;width:16px;text-align:center"></i>';
  const fontFamilyButton = document.createElement('button');
  fontFamilyButton.type = 'button';
  fontFamilyButton.dataset.act = 'font-family';
  fontFamilyButton.setAttribute('aria-label', 'Font family');
  fontFamilyButton.style.cssText = toolbarButtonCss;
  fontFamilyButton.innerHTML = '<i class="fa-solid fa-font" style="font-size:14px;width:16px;text-align:center"></i>';
  const fontSizeButton = document.createElement('button');
  fontSizeButton.type = 'button';
  fontSizeButton.dataset.act = 'font-size';
  fontSizeButton.setAttribute('aria-label', 'Font size');
  fontSizeButton.style.cssText = toolbarButtonCss;
  fontSizeButton.innerHTML = '<i class="fa-solid fa-text-height" style="font-size:14px;width:16px;text-align:center"></i>';
  const fontColorButton = document.createElement('button');
  fontColorButton.type = 'button';
  fontColorButton.dataset.act = 'font-color';
  fontColorButton.setAttribute('aria-label', 'Text color');
  fontColorButton.style.cssText = toolbarButtonCss + 'padding-bottom:2px;';
  fontColorButton.innerHTML = '<i class="fa-solid fa-palette" style="font-size:14px;width:16px;text-align:center"></i>';
  const colorIndicator = document.createElement('span');
  colorIndicator.style.cssText = 'position:absolute;left:50%;bottom:5px;transform:translateX(-50%);width:12px;height:12px;border-radius:9999px;border:1px solid rgba(255,255,255,0.8);background:#111827;';
  fontColorButton.appendChild(colorIndicator);
  styleControlWrapper.appendChild(fontFamilyButton);
  styleControlWrapper.appendChild(fontSizeButton);
  styleControlWrapper.appendChild(fontColorButton);
  const deleteButton = tb.querySelector('[data-act="del"]');
  if (deleteButton) {
    tb.insertBefore(styleControlWrapper, deleteButton);
    tb.insertBefore(gridColumnsButton, deleteButton);
  } else {
    tb.appendChild(styleControlWrapper);
    tb.appendChild(gridColumnsButton);
  }

  const fontFamilyOptions = [
    { label: 'Inter', value: 'Inter, ui-sans-serif, system-ui, sans-serif' },
    { label: 'Arial', value: 'Arial, sans-serif' },
    { label: 'Helvetica', value: 'Helvetica, Arial, sans-serif' },
    { label: 'Georgia', value: 'Georgia, serif' },
    { label: 'Times New Roman', value: 'Times New Roman, serif' },
    { label: 'Poppins', value: 'Poppins, ui-sans-serif, system-ui, sans-serif' },
  ];
  const fontSizeOptions = ['12px','14px','16px','18px','20px','24px','28px','32px','40px','48px','56px','64px'];
  const colorPalette = ['#111827', '#374151', '#6b7280', '#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ffffff'];

  const popoverCommonCss = 'position:fixed;display:none;z-index:10006;min-width:180px;max-width:220px;border-radius:8px;border:1px solid rgba(15,23,42,0.12);background:#ffffff;color:#111827;box-shadow:0 18px 45px rgba(15,23,42,0.12);padding:12px;gap:8px;font:14px/1.4 system-ui;max-height:min(320px, calc(100vh - 24px));overflow-y:auto;overflow-x:hidden;';
  const fontFamilyPopover = document.createElement('div');
  fontFamilyPopover.className = '__wto-popup';
  fontFamilyPopover.style.cssText = popoverCommonCss;
  const fontSizePopover = document.createElement('div');
  fontSizePopover.className = '__wto-popup';
  fontSizePopover.style.cssText = popoverCommonCss;
  const fontColorPopover = document.createElement('div');
  fontColorPopover.className = '__wto-popup';
  fontColorPopover.style.cssText = popoverCommonCss;
  const gridColumnsPopover = document.createElement('div');
  gridColumnsPopover.className = '__wto-popup';
  gridColumnsPopover.style.cssText = popoverCommonCss;

  function createPopoverTitle(text) {
    const title = document.createElement('div');
    title.textContent = text;
    title.style.cssText = 'font-size:12px;font-weight:600;color:#111827;margin-bottom:8px;';
    return title;
  }

  function createOptionButton(label, styleText, isActive) {
    const button = document.createElement('button');
    button.type = 'button';
    button.style.cssText = 'all:unset;display:flex;align-items:center;width:100%;padding:8px 10px;border-radius:8px;text-align:left;color:#111827;cursor:pointer;background:' + (isActive ? 'rgba(59,130,246,0.12)' : 'transparent') + ';font:13px/1.3 system-ui;';
    button.onmouseover = () => button.style.background = isActive ? 'rgba(59,130,246,0.16)' : 'rgba(15,23,42,0.04)';
    button.onmouseout = () => button.style.background = isActive ? 'rgba(59,130,246,0.12)' : 'transparent';
    button.textContent = label;
    if (styleText) button.style.fontFamily = styleText;
    return button;
  }

  function createColorSwatch(color, isActive) {
    const swatch = document.createElement('button');
    swatch.type = 'button';
    swatch.style.cssText = 'all:unset;width:28px;height:28px;border-radius:9999px;margin:0 4px 4px 0;cursor:pointer;display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;border:' + (color === '#ffffff' ? '1px solid #d1d5db' : '1px solid transparent') + ';background:' + color + ';';
    const dot = document.createElement('span');
    dot.style.cssText = 'width:16px;height:16px;border-radius:9999px;background:' + color + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,0.08);';
    swatch.appendChild(dot);
    if (isActive) {
      swatch.style.boxShadow = '0 0 0 2px rgba(59,130,246,0.24)';
    }
    swatch.dataset.color = color;
    return swatch;
  }

  function hideAllPopovers() {
    fontFamilyPopover.style.display = 'none';
    fontSizePopover.style.display = 'none';
    fontColorPopover.style.display = 'none';
    gridColumnsPopover.style.display = 'none';
    fontFamilyButton.style.background = toolbarButtonCss;
    fontSizeButton.style.background = toolbarButtonCss;
    fontColorButton.style.background = toolbarButtonCss;
    gridColumnsButton.style.background = toolbarButtonCss;
  }

  function positionPopover(button, popover) {
    const rect = button.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const left = Math.min(viewportWidth - 240, Math.max(8, rect.left));
    const maxHeight = Math.max(180, Math.min(320, viewportHeight - 24));
    popover.style.left = left + 'px';
    popover.style.maxHeight = maxHeight + 'px';
    popover.style.overflowY = 'auto';
    popover.style.overflowX = 'hidden';
    popover.style.display = 'flex';
    popover.style.flexDirection = 'column';
    popover.style.visibility = 'hidden';
    const contentHeight = popover.scrollHeight || popover.offsetHeight || 220;
    const availableBelow = viewportHeight - rect.bottom - 8;
    const availableAbove = rect.top - 8;
    const shouldOpenAbove = availableBelow < contentHeight + 8 && availableAbove > availableBelow;
    const top = shouldOpenAbove
      ? Math.max(8, rect.top - Math.min(contentHeight, maxHeight) - 8)
      : Math.min(viewportHeight - Math.min(contentHeight, maxHeight) - 8, rect.bottom + 8);
    popover.style.top = top + 'px';
    popover.style.visibility = 'visible';
  }

  function applyFontFamily(family) {
    sendElementStyleUpdate({ fontFamily: family });
    hideAllPopovers();
  }

  function applyFontSize(size) {
    sendElementStyleUpdate({ fontSize: size });
    hideAllPopovers();
  }

  function applyFontColor(color) {
    sendElementStyleUpdate({ color });
    updateColorIndicator(color);
  }

  function updateColorIndicator(color) {
    colorIndicator.style.background = color || '#111827';
    colorIndicator.style.border = color === '#ffffff' ? '1px solid #9ca3af' : '1px solid rgba(255,255,255,0.8)';
  }

  function renderFontFamilyPopover(currentFamily) {
    fontFamilyPopover.innerHTML = '';
    fontFamilyPopover.appendChild(createPopoverTitle('Font family'));
    fontFamilyOptions.forEach((option) => {
      const isActive = option.value === currentFamily;
      const item = createOptionButton(option.label, option.value, isActive);
      item.addEventListener('click', () => applyFontFamily(option.value));
      fontFamilyPopover.appendChild(item);
    });
  }

  function renderFontSizePopover(currentSize) {
    fontSizePopover.innerHTML = '';
    fontSizePopover.appendChild(createPopoverTitle('Font size'));
    fontSizeOptions.forEach((value) => {
      const isActive = value === currentSize;
      const item = createOptionButton(value, '', isActive);
      item.addEventListener('click', () => applyFontSize(value));
      fontSizePopover.appendChild(item);
    });
  }

  function renderFontColorPopover(currentColor) {
    fontColorPopover.innerHTML = '';
    fontColorPopover.appendChild(createPopoverTitle('Text color'));
    const currentRow = document.createElement('div');
    currentRow.style.cssText = 'display:flex;align-items:center;gap:8px;margin-bottom:10px;';
    const currentLabel = document.createElement('div');
    currentLabel.textContent = 'Current';
    currentLabel.style.cssText = 'font-size:12px;color:#6b7280;';
    const currentSwatch = document.createElement('div');
    currentSwatch.style.cssText = 'width:28px;height:28px;border-radius:9999px;background:' + currentColor + ';border:' + (currentColor === '#ffffff' ? '1px solid #d1d5db' : '1px solid transparent') + ';box-shadow:inset 0 0 0 1px rgba(0,0,0,0.08);';
    currentRow.appendChild(currentLabel);
    currentRow.appendChild(currentSwatch);
    fontColorPopover.appendChild(currentRow);

    const paletteRow = document.createElement('div');
    paletteRow.style.cssText = 'display:flex;flex-wrap:wrap;gap:6px;margin-bottom:10px;';
    colorPalette.forEach((color) => {
      const swatch = createColorSwatch(color, color === currentColor);
      swatch.addEventListener('click', () => {
        applyFontColor(color);
        renderFontColorPopover(color);
      });
      paletteRow.appendChild(swatch);
    });
    fontColorPopover.appendChild(paletteRow);

    const inputRow = document.createElement('div');
    inputRow.style.cssText = 'display:flex;align-items:center;gap:8px;';
    const colorPicker = document.createElement('input');
    colorPicker.type = 'color';
    colorPicker.value = currentColor || '#111827';
    colorPicker.style.cssText = 'width:36px;height:36px;border:none;padding:0;background:transparent;cursor:pointer;';
    const hexInput = document.createElement('input');
    hexInput.type = 'text';
    hexInput.value = currentColor || '#111827';
    hexInput.style.cssText = 'flex:1;min-width:80px;height:36px;padding:0 10px;border:1px solid #d1d5db;border-radius:10px;background:#f9fafb;color:#111827;font:13px/1.4 system-ui;';
    hexInput.setAttribute('aria-label', 'Hex color');
    colorPicker.addEventListener('input', () => {
      const next = String(colorPicker.value || '#111827');
      hexInput.value = next;
      applyFontColor(next);
      renderFontColorPopover(next);
    });
    hexInput.addEventListener('change', () => {
      const next = String(hexInput.value || '#111827');
      colorPicker.value = next;
      applyFontColor(next);
      renderFontColorPopover(next);
    });
    inputRow.appendChild(colorPicker);
    inputRow.appendChild(hexInput);
    fontColorPopover.appendChild(inputRow);
  }

  function openPopover(button, popover, currentValue) {
    hideAllPopovers();
    button.style.background = 'rgba(255,255,255,0.16)';
    if (popover === fontFamilyPopover) renderFontFamilyPopover(currentValue || '');
    if (popover === fontSizePopover) renderFontSizePopover(currentValue || '');
    if (popover === fontColorPopover) renderFontColorPopover(currentValue || '#111827');
    if (popover === gridColumnsPopover) renderGridColumnsPopover(currentValue || 2);
    positionPopover(button, popover);
  }

  function normalizeColor(value) {
    if (!value) return '#111827';
    if (/^transparent$/i.test(value)) return '#111827';
    if (/^rgba?\\(\\s*0\\s*,\\s*0\\s*,\\s*0\\s*,\\s*0\\s*\\)$/i.test(value)) return '#111827';
    if (value.startsWith('#')) return value;
    const rgb = /^rgba?\\((\\d+)\\s*,\\s*(\\d+)\\s*,\\s*(\\d+)/i.exec(value);
    if (rgb) {
      const r = Number(rgb[1]).toString(16).padStart(2, '0');
      const g = Number(rgb[2]).toString(16).padStart(2, '0');
      const b = Number(rgb[3]).toString(16).padStart(2, '0');
      return '#' + r + g + b;
    }
    return '#111827';
  }

  function setStyleControlValues(style) {
    if (!style) return;
    const family = String(style.fontFamily || '');
    const rawSize = String(style.fontSize || '');
    const sizeMatch = rawSize.match(/^(-?\\d*\\.?\\d+)\\s*(px|rem|em)?$/i);
    let size = rawSize;
    if (sizeMatch) {
      const amount = Number(sizeMatch[1]);
      const unit = (sizeMatch[2] || 'px').toLowerCase();
      if (unit === 'px' || !sizeMatch[2]) size = Math.round(amount) + 'px';
      else if (unit === 'rem' || unit === 'em') size = Math.round(amount * 16) + 'px';
    }
    const color = normalizeColor(String(style.color || '#111827'));
    fontFamilyButton.dataset.currentValue = family;
    fontSizeButton.dataset.currentValue = size;
    fontColorButton.dataset.currentValue = color;
    updateColorIndicator(color);
  }

  function renderGridColumnsPopover(currentCount) {
    gridColumnsPopover.innerHTML = '';
    const title = createPopoverTitle('Columns');
    title.style.marginBottom = '6px';
    gridColumnsPopover.appendChild(title);
    const options = [
      { label: '1 Column', value: 1, preview: '▌' },
      { label: '2 Columns', value: 2, preview: '▌▌' },
      { label: '3 Columns', value: 3, preview: '▌▌▌' },
      { label: '4 Columns', value: 4, preview: '▌▌▌▌' },
      { label: '5 Columns', value: 5, preview: '▌▌▌▌▌' },
      { label: '6 Columns', value: 6, preview: '▌▌▌▌▌▌' },
    ];
    options.forEach((option) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.style.cssText = 'all:unset;display:flex;align-items:center;justify-content:space-between;width:100%;padding:8px 10px;border-radius:8px;text-align:left;color:#111827;cursor:pointer;background:' + (Number(currentCount) === option.value ? 'rgba(59,130,246,0.12)' : 'transparent') + ';font:13px/1.3 system-ui;';
      button.onmouseover = () => button.style.background = Number(currentCount) === option.value ? 'rgba(59,130,246,0.16)' : 'rgba(15,23,42,0.04)';
      button.onmouseout = () => button.style.background = Number(currentCount) === option.value ? 'rgba(59,130,246,0.12)' : 'transparent';
      const label = document.createElement('span');
      label.textContent = option.label;
      const preview = document.createElement('span');
      preview.textContent = option.preview;
      preview.style.cssText = 'font-size:12px;letter-spacing:1px;color:#64748b;';
      button.appendChild(label);
      button.appendChild(preview);
      button.addEventListener('click', () => {
        if (!currentSelection || !currentSelection.widgetId) return;
        send('grid-columns', {
          sectionId: currentSelection.sectionId,
          widgetId: currentSelection.widgetId,
          count: option.value,
        });
        hideAllPopovers();
      });
      gridColumnsPopover.appendChild(button);
    });
  }

  fontFamilyButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentFamily = fontFamilyButton.dataset.currentValue || '';
    openPopover(fontFamilyButton, fontFamilyPopover, currentFamily);
  });

  fontSizeButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentSize = fontSizeButton.dataset.currentValue || '';
    openPopover(fontSizeButton, fontSizePopover, currentSize);
  });

  fontColorButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const currentColor = fontColorButton.dataset.currentValue || '#111827';
    openPopover(fontColorButton, fontColorPopover, currentColor);
  });

  gridColumnsButton.addEventListener('click', (e) => {
    e.stopPropagation();
    const gridRoot = currentSelection?.widgetId ? document.querySelector('[data-widget-id="' + currentSelection.widgetId + '"]') : null;
    const currentCount = Number(gridRoot?.getAttribute('data-grid-columns-count') || gridRoot?.querySelectorAll('[data-grid-column-id]').length || 2);
    openPopover(gridColumnsButton, gridColumnsPopover, currentCount);
  });

  document.body.appendChild(fontFamilyPopover);
  document.body.appendChild(fontSizePopover);
  document.body.appendChild(fontColorPopover);
  document.body.appendChild(gridColumnsPopover);

  document.addEventListener('click', (event) => {
    const target = event.target;
    if (!target) return;
    if ((target instanceof Element) && (target.closest('.__wto-popup') || target.closest('[data-act="font-family"]') || target.closest('[data-act="font-size"]') || target.closest('[data-act="font-color"]') || target.closest('[data-act="grid-columns"]') || target.closest('[data-act="add"]'))) {
      return;
    }
    hideAllPopovers();
    hideAddElementMenu();
  });

  function sendElementStyleUpdate(patch) {
    // Ensure we have a widget selection; try to derive from the current DOM wrapper if missing.
    let sel = currentSelection;
    if (!sel || !sel.widgetId) {
      const wrapper = currentSelectedElementWrapper || null;
      if (wrapper && wrapper.getAttribute) {
        const root = (wrapper.closest && wrapper.closest('[data-widget-id], [data-wto-widget-root]')) || null;
        const derivedWidgetId = root ? root.getAttribute('data-widget-id') : null;
        const parentWidgetIdAttr = wrapper.getAttribute('data-container-parent-widget-id') || wrapper.getAttribute('data-wto-parent-widget-id') || null;
        const childIdAttr = wrapper.getAttribute('data-container-child-id') || wrapper.getAttribute('data-wto-child-id') || wrapper.getAttribute('data-wto-widget-element-key') || null;
        sel = sel || {};
        if (derivedWidgetId) sel.widgetId = derivedWidgetId;
        if (parentWidgetIdAttr) sel.parentWidgetId = parentWidgetIdAttr;
        if (childIdAttr) sel.childId = childIdAttr;
      }
    }
    if (!sel || !sel.widgetId) return;
    const selectedChildId = sel.childId || sel.elementKey || null;
    const stylePatch = { ...patch };
    if (typeof stylePatch.fontSize === 'string' && stylePatch.fontSize) {
      const sizeMatch = String(stylePatch.fontSize).trim().match(/^(-?\\d*\\.?\\d+)\\s*(px|rem|em)?$/i);
      if (sizeMatch) {
        const amount = Number(sizeMatch[1]);
        const unit = (sizeMatch[2] || 'px').toLowerCase();
        if (unit === 'px' || !sizeMatch[2]) stylePatch.fontSize = Math.round(amount) + 'px';
        else if (unit === 'rem' || unit === 'em') stylePatch.fontSize = Math.round(amount * 16) + 'px';
      }
    }
    if (typeof stylePatch.color === 'string') {
      if (sel.elementType === 'text') {
        stylePatch.textColor = stylePatch.color;
        // Collapse gradient fill so solid toolbar/panel colors remain visible.
        stylePatch.gradientStart = stylePatch.color;
        stylePatch.gradientEnd = stylePatch.color;
      }
      if (sel.elementType === 'button') {
        stylePatch.customColor = stylePatch.color;
      }
    }
    // Send debug console message to parent so the host can log if needed
    try { parent.postMessage({ __wto: true, type: 'console', payload: { level: 'debug', args: ['sendElementStyleUpdate', { sectionId: sel.sectionId, widgetId: sel.widgetId, childId: selectedChildId, elementKey: sel.elementKey, stylePatch }] } }, '*'); } catch (_) {}
    send('element-style', {
      sectionId: sel.sectionId,
      widgetId: sel.widgetId,
      parentWidgetId: sel.parentWidgetId || sel.widgetId,
      childId: selectedChildId,
      elementKey: sel.elementKey,
      elementType: sel.elementType,
      columnId: sel.columnId || null,
      stylePatch,
    });
  }

  let currentSelection = null;
  let currentSection = null;
  let currentSelectedElementWrapper = null;
  let currentDragSource = null;
  let currentDropTarget = null;
  const addElementMenu = document.createElement('div');
  addElementMenu.style.cssText = 'position:fixed;display:none;z-index:10005;flex-direction:column;gap:4px;padding:6px;border-radius:12px;background:rgba(15,23,42,0.97);box-shadow:0 14px 40px rgba(15,23,42,0.28);border:1px solid rgba(148,163,184,0.2);';
  addElementMenu.innerHTML = [
    ['heading','Heading'],
    ['text','Paragraph'],
    ['button','Button'],
    ['image','Image'],
  ].map(([type, label]) => '<button type="button" data-add-child-type="'+type+'" style="all:unset;display:flex;align-items:center;justify-content:flex-start;padding:8px 10px;border-radius:8px;color:#f8fafc;cursor:pointer;background:transparent;white-space:nowrap;">'+label+'</button>').join('');
  document.body.appendChild(addElementMenu);
  const childCapableWidgetTypes = new Set(['container', 'hero', 'grid']);
  function hideAddElementMenu() {
    addElementMenu.style.display = 'none';
  }
  function showAddElementMenu(buttonEl) {
    if (!buttonEl || !currentSelection || !currentSelection.widgetType || !childCapableWidgetTypes.has(currentSelection.widgetType)) {
      hideAddElementMenu();
      return;
    }
    const rect = buttonEl.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = addElementMenu.offsetWidth || 160;
    const menuHeight = addElementMenu.scrollHeight || 220;
    const availableBelow = viewportHeight - rect.bottom - 8;
    const availableAbove = rect.top - 8;
    const shouldOpenAbove = availableBelow < menuHeight + 8 && availableAbove > availableBelow;
    const left = Math.max(8, Math.min(viewportWidth - menuWidth - 8, rect.left));
    const top = shouldOpenAbove
      ? Math.max(8, rect.top - Math.min(menuHeight, viewportHeight - 24) - 8)
      : Math.min(viewportHeight - Math.min(menuHeight, viewportHeight - 24) - 8, rect.bottom + 6);
    addElementMenu.style.display = 'flex';
    addElementMenu.style.flexDirection = 'column';
    addElementMenu.style.left = left + 'px';
    addElementMenu.style.top = top + 'px';
    addElementMenu.style.maxHeight = Math.max(180, Math.min(320, viewportHeight - 24)) + 'px';
    addElementMenu.style.overflowY = 'auto';
    addElementMenu.style.overflowX = 'hidden';
  }
  function isGridWidgetRootSelection(selection) {
    return !!selection && selection.widgetType === 'grid' && !selection.childId && !selection.elementKey && !selection.columnId && ['widget', 'container'].includes(selection.elementKind || '');
  }

  function updateToolbarForSelection(selection) {
    currentSelection = selection;
    const isSharedSection = currentSection && !!currentSection.querySelector('[data-wto-shared]');
    if (isSharedSection) {
      hideAddElementMenu();
      hideAllPopovers();
      unmountToolbar();
      return;
    }
    mountToolbar();
    const addBtn = tb.querySelector('[data-act="add"]');
    if (addBtn) {
      const isVisible = !!selection && !!selection.widgetType && childCapableWidgetTypes.has(selection.widgetType);
      addBtn.style.display = isVisible ? 'inline-flex' : 'none';
    }
    const enabledStyleSelection = selection && selection.elementKind === 'widget' && selection.elementType && ['text','button'].includes(selection.elementType);
    if (enabledStyleSelection) {
      styleControlWrapper.style.display = 'inline-flex';
      setStyleControlValues(selection.style || {});
    } else {
      styleControlWrapper.style.display = 'none';
    }
    if (isGridWidgetRootSelection(selection)) {
      gridColumnsButton.style.display = 'inline-flex';
    } else {
      gridColumnsButton.style.display = 'none';
    }
    if (!selection || !selection.widgetType || !childCapableWidgetTypes.has(selection.widgetType)) {
      hideAddElementMenu();
    }
    ["move-up", "move-down", "dup", "del"].forEach((act) => {
      const btn = tb.querySelector('[data-act="' + act + '"]');
      if (btn) btn.style.display = "inline-flex";
    });
  }
  function positionToolbar(element) {
    if (!element) { unmountToolbar(); return; }
    const isSharedSection = currentSection && !!currentSection.querySelector('[data-wto-shared]');
    if (isSharedSection) {
      unmountToolbar();
      return;
    }
    if (!toolbarMounted) mountToolbar();
    if (!tb.parentNode) return;
    const r = element.getBoundingClientRect();
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
    const action = btn.dataset.act;
    if (!action) return;
    if (action === 'add') {
      showAddElementMenu(btn);
      return;
    }
    const isChildSelection = currentSelection && currentSelection.widgetId && (currentSelection.childId || currentSelection.elementKey);
   // console.log('toolbar click', { action, currentSelection, isChildSelection, widgetId: currentSelection?.widgetId, childId: currentSelection?.childId, elementKey: currentSelection?.elementKey });
    if (isChildSelection && ['move','move-up','move-down','dup','del'].includes(action)) {
      const selectedChildId = currentSelection.childId || currentSelection.elementKey || null;
      // console.log('sending element-action', { action: action === 'dup' ? 'duplicate' : action === 'del' ? 'delete' : action, childId: selectedChildId });
      send('element-action', {
        sectionId: currentSelection.sectionId || currentSection.dataset.wtoSection,
        widgetId: currentSelection.widgetId,
        parentWidgetId: currentSelection.parentWidgetId || currentSelection.widgetId,
        childId: selectedChildId,
        selectedChildId,
        elementKey: currentSelection.elementKey,
        elementType: currentSelection.elementType,
        childContainerId: currentSelection.columnId || null,
        columnId: currentSelection.columnId || null,
        action: action === 'dup' ? 'duplicate' : action === 'del' ? 'delete' : action,
      });
      return;
    }
     
    send('section-action', { sectionId: currentSection.dataset.wtoSection, action });
  });
  addElementMenu.addEventListener('click', e => {
    const item = e.target.closest('button[data-add-child-type]');
    if (!item || !currentSelection) return;
    e.preventDefault();
    e.stopPropagation();
    let columnId = currentSelection.columnId || null;
    if (!columnId && currentSelection.widgetType === 'grid' && currentSelection.widgetId) {
      const gridRoot = document.querySelector('[data-widget-id="' + currentSelection.widgetId + '"]');
      const firstColumn = gridRoot && gridRoot.querySelector('[data-grid-column-wrapper="1"][data-grid-column-id], [data-grid-column-id]');
      columnId = firstColumn ? firstColumn.getAttribute('data-grid-column-id') : null;
    }
    send('widget-add-child', {
      sectionId: currentSelection.sectionId,
      widgetId: currentSelection.widgetId,
      parentWidgetId: currentSelection.parentWidgetId || currentSelection.widgetId,
      widgetType: currentSelection.widgetType,
      childType: item.getAttribute('data-add-child-type'),
      columnId,
    });
    hideAddElementMenu();
  });
  document.addEventListener('click', (event) => {
    const target = getEventTarget(event);
    const columnAddButton = target && target.closest ? target.closest('[data-grid-add-child="1"]') : null;
    if (columnAddButton) {
      event.preventDefault();
      event.stopPropagation();
      const section = columnAddButton.closest('[data-wto-section]');
      const columnId = columnAddButton.getAttribute('data-grid-column-id');
      const widgetRoot = columnAddButton.closest('[data-widget-id], [data-wto-widget-root]');
      const widgetId = widgetRoot?.getAttribute('data-widget-id') || null;
      const widgetType = widgetRoot?.getAttribute('data-widget') || null;
      const selection = {
        sectionId: section ? section.dataset.wtoSection : null,
        elementKind: 'widget',
        index: null,
        tag: 'button',
        widgetId,
        widgetType,
        parentWidgetId: widgetId,
        childId: null,
        elementKey: null,
        elementType: null,
        columnId,
      };
      currentSelection = selection;
      hideAddElementMenu();
      send('select', {
        sectionId: selection.sectionId,
        elementKind: selection.elementKind,
        index: selection.index,
        tag: selection.tag,
        widgetId: selection.widgetId,
        widgetType: selection.widgetType,
        parentWidgetId: selection.parentWidgetId,
        childId: selection.childId,
        elementKey: selection.elementKey,
        elementType: selection.elementType,
        childContainerId: selection.columnId,
        columnId: selection.columnId,
      });
      showAddElementMenu(columnAddButton);
      return;
    }
    hideAddElementMenu();
  });

  function getElementWrapper(target) {
    if (!target) return null;
    const wrapper = target.closest('[data-container-child-wrapper], [data-wto-widget-element-key]');
    return wrapper;
  }

  function setElementDragState(element) {
    if (currentSelectedElementWrapper && currentSelectedElementWrapper !== element) {
      currentSelectedElementWrapper.removeAttribute('draggable');
    }
    currentSelectedElementWrapper = element;
    if (element) {
      element.setAttribute('draggable', 'true');
    }
  }


  addEventListener('scroll', () => positionToolbar(currentSelectedElementWrapper || currentSection), true);
  addEventListener('resize', () => positionToolbar(currentSelectedElementWrapper || currentSection));

  // Drag reorder
  document.querySelectorAll('[data-wto-section]').forEach(sec => sec.setAttribute('draggable','true'));
  document.querySelectorAll('[data-wto-section] a').forEach(a => a.setAttribute('draggable','false'));
  let dragId = null;
  document.addEventListener('dragstart', e => {
    try {
      const target = getEventTarget(e);
      const wrapper = target && target.closest ? target.closest('[data-container-child-wrapper], [data-wto-widget-element-key]') : null;
      if (wrapper && currentSelection && currentSelection.sectionId && currentSelection.widgetId && (currentSelection.childId || currentSelection.elementKey)) {
        currentDragSource = {
          sectionId: currentSelection.sectionId,
          widgetId: currentSelection.widgetId,
          parentWidgetId: currentSelection.parentWidgetId,
          childId: currentSelection.childId,
          elementKey: currentSelection.elementKey,
          elementType: currentSelection.elementType,
          wrapper,
        };
        try { e.dataTransfer.setData('text/plain', String(currentSelection.childId || currentSelection.elementKey || '')); } catch (_){ }
        e.dataTransfer.effectAllowed = 'move';
        wrapper.style.opacity = '0.6';
        return;
      }
      const sec = target && target.closest && target.closest('[data-wto-section]');
      if (!sec) return;
      dragId = sec.dataset.wtoSection;
      try { e.dataTransfer.setData('text/plain', dragId); } catch(_){ }
      e.dataTransfer.effectAllowed = 'move';
      sec.style.opacity = '0.4';
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){ }
      console.error('wto-runtime dragstart error', err);
    }
  });
  document.addEventListener('dragend', e => {
    try {
      if (currentDragSource?.wrapper) currentDragSource.wrapper.style.opacity = '';
      const sec = e.target.closest && e.target.closest('[data-wto-section]');
      if (sec) sec.style.opacity = '';
      e.preventDefault();
      const l = document.getElementById('__wto_line'); if (l) l.remove();
      currentDragSource = null;
      currentDropTarget = null;
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){ }
      console.error('wto-runtime dragend error', err);
    }
  });
  document.addEventListener('dragover', e => {
    try {
      const target = getEventTarget(e);
      const candidate = target && target.closest ? target.closest('[data-container-child-wrapper], [data-wto-widget-element-key]') : null;
      if (currentDragSource && candidate && currentDragSource.wrapper && candidate !== currentDragSource.wrapper && currentDragSource.wrapper.closest('[data-container-parent-widget-id], [data-wto-parent-widget-id]') && candidate.closest('[data-container-parent-widget-id], [data-wto-parent-widget-id]')) {
        const r = candidate.getBoundingClientRect();
        e.preventDefault();
        let line = document.getElementById('__wto_line');
        if (!line) { line = document.createElement('div'); line.id='__wto_line'; line.style.cssText='position:absolute;left:0;right:0;height:3px;background:#6366f1;z-index:9999;pointer-events:none;'; document.body.appendChild(line); }
        const before = e.clientY < r.top + r.height / 2;
        const top = before ? candidate.offsetTop : candidate.offsetTop + candidate.offsetHeight;
        line.style.top = top + 'px';
        currentDropTarget = { candidate, before };
        return;
      }
      const sec = target && target.closest && target.closest('[data-wto-section]');
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
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){ }
      console.error('wto-runtime dragover error', err);
    }
  });
  document.addEventListener('drop', e => {
    try {
      const target = getEventTarget(e);
      if (currentDragSource && currentDropTarget) {
        const candidate = currentDropTarget.candidate;
        const before = currentDropTarget.before;
        const parent = candidate.closest('[data-container-parent-widget-id], [data-wto-parent-widget-id]');
        const childId = candidate.getAttribute('data-container-child-id') || candidate.getAttribute('data-wto-child-id') || candidate.getAttribute('data-wto-widget-element-key');
        const parentWidgetId = parent ? parent.getAttribute('data-container-parent-widget-id') || parent.getAttribute('data-wto-parent-widget-id') : null;
        if (childId && currentDragSource.sectionId && currentDragSource.widgetId && parentWidgetId === currentDragSource.parentWidgetId) {
          send('element-action', {
            sectionId: currentDragSource.sectionId,
            widgetId: currentDragSource.widgetId,
            parentWidgetId: currentDragSource.parentWidgetId,
            childId: currentDragSource.childId,
            elementKey: currentDragSource.elementKey,
            elementType: currentDragSource.elementType,
            action: 'move',
            targetChildId: childId,
            before,
          });
          const l = document.getElementById('__wto_line'); if (l) l.remove();
          currentDragSource.wrapper.style.opacity = '';
          currentDragSource = null;
          currentDropTarget = null;
          return;
        }
      }
      const sec = target && target.closest && target.closest('[data-wto-section]');
      if (!sec || !dragId) return;
      e.preventDefault();
      const before = sec.dataset.wtoDropBefore === '1';
      send('section-move', { fromId: dragId, toId: sec.dataset.wtoSection, before });
      const l = document.getElementById('__wto_line'); if (l) l.remove();
      dragId = null;
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){ }
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
        const anchor = target.closest("a");
        if (anchor) {
          const href = anchor.getAttribute("href") || "";
          const normalized = href.replace(/^[.\/]+/, "").replace(/\\.html(?:[?#].*)?$/, "");
          if (!href || href === "#") {
            e.preventDefault();
          }
          if (href && href !== "#" && scrollToHash(href, e)) {
            return;
          }
          if (/^(?!https?:|mailto:).+\\.html(?:[?#].*)?$/.test(href)) {
            e.preventDefault();
            send("navigate-page", { slug: normalized });
            return;
          }
        }
      }
      if (target.closest("[data-carousel-prev], [data-carousel-next], [data-carousel-dot], [data-carousel-items-prev], [data-carousel-items-next], [data-carousel-indicator]")) return;
      if (target.closest('[data-grid-add-child="1"]')) return;
      const section = target.closest("[data-wto-section]");
      if (!section) return;
      currentSection = section;
      const selection = resolveElementSelection(target);
      clearDuplicateControls();
      const selectedEl = getSelectionTargetElement(target);
      const elementWrapper = getElementWrapper(target) || selectedEl;
      const selectionTarget = elementWrapper || selectedEl || section;
      const style = (selection.elementKind !== "section" && selectedEl) ? getTypographyStyle(selectedEl) : null;

      if (selection.elementKind === "widget" && selection.elementType === "container" && selectedEl) {
        const tag = (selectedEl.tagName || "").toLowerCase();
        if (tag === "a" || tag === "button") {
          selection.elementType = "button";
        } else if (/^h[1-6]$/.test(tag) || tag === "p" || tag === "span" || tag === "strong" || tag === "em" || tag === "b" || tag === "i" || tag === "small" || tag === "blockquote" || tag === "cite" || tag === "label" || tag === "div") {
          selection.elementType = "text";
        }
      }
      if (style) {
        selection.style = style;
      }

      if (selection.elementKind === "section") {
        clearElementSelectionHighlight();
        setElementDragState(null);
        applyWidgetSelectionIndicators({
          sectionId: section.dataset.wtoSection,
          widgetId: section.querySelector('[data-widget-id]')?.getAttribute('data-widget-id') || null,
          widgetType: section.querySelector('[data-widget]')?.getAttribute('data-widget') || null,
        }, section);
      } else {
        applyElementSelectionHighlight(selectionTarget);
        applyDuplicateControl(selectionTarget);
        setElementDragState(selectionTarget);
        applyWidgetSelectionIndicators(selection, section);
      }
      updateToolbarForSelection(selection);
      positionToolbar(selectionTarget);
      send("select", {
        sectionId: selection.sectionId || section.dataset.wtoSection,
        elementKind: selection.elementKind,
        index: selection.index,
        tag: selection.tag,
        style,
        widgetId: selection.widgetId,
        widgetType: selection.widgetType,
        parentWidgetId: selection.parentWidgetId,
        childId: selection.childId || selection.elementKey,
        elementKey: selection.elementKey,
        elementType: selection.elementType,
        columnId: selection.columnId || null,
      });
    } catch (err) {
      try { send("console", { level: "error", args: [String(err && err.stack ? err.stack : err)] }); } catch (_){ }
      console.error("wto-runtime onClick error", err);
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

  function getEditableTextValue(el) {
    if (!el) return "";
    return String(el.textContent ?? "").replace(/\s+/g, " ").trim();
  }

  function sendElementContentUpdate(sectionId, selection, value) {
    if (!sectionId || !selection || !selection.widgetId) return;
    const selectedChildId = selection.childId || selection.elementKey || null;
    send('element-content', {
      sectionId,
      widgetId: selection.widgetId,
      parentWidgetId: selection.parentWidgetId || selection.widgetId,
      childId: selectedChildId,
      elementKey: selection.elementKey,
      elementType: selection.elementType,
      columnId: selection.columnId || null,
      contentPatch: { text: value },
    });
  }

  function startTextEdit(e) {
    const target = e.target;
    const el = findEditableTarget(target);
    const section = target.closest('[data-wto-section]');
    if (!el || !section) return;
    e.preventDefault(); e.stopPropagation();
    const initialText = getEditableTextValue(el);
    const selection = resolveElementSelection(el);
    let cancelled = false;
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
    el.setAttribute('data-wto-editable', 'true');
    el.focus();
    try { const range = document.createRange(); range.selectNodeContents(el); const s = getSelection(); s.removeAllRanges(); s.addRange(range); } catch(_) {}
    const onKey = (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        cancelled = true;
        el.blur();
        return;
      }
      if (ev.key === 'Enter') {
        const isParagraphLike = ['p','div','span','blockquote','cite','label'].includes(el.tagName.toLowerCase());
        if (!isParagraphLike || ev.ctrlKey) {
          ev.preventDefault();
          el.blur();
        }
      }
    };
    const onBlur = () => {
      el.removeAttribute('contenteditable'); el.removeAttribute('spellcheck');
      el.removeEventListener('keydown', onKey); el.removeEventListener('blur', onBlur);
      if (cancelled) {
        el.textContent = initialText;
        return;
      }
      if (selection && selection.elementKind === 'widget' && selection.widgetId && (selection.childId || selection.elementKey)) {
        const nextText = getEditableTextValue(el);
        sendElementContentUpdate(section.dataset.wtoSection, selection, nextText);
        return;
      }
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
      if (href.startsWith('#')) {
        e.preventDefault();
        if (scrollToHash(href, e)) {
          closeMenu();
          return;
        }
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
    document.querySelectorAll('[data-wto-section]').forEach(s => {
      const isSelected = s === sec;
      s.classList.toggle('wto-selected', isSelected);
      if (!isSelected) {
        s.style.outline = '';
        s.style.outlineOffset = '';
      }
    });
    currentSection = sec;
    currentSelectedElementWrapper = null;
    clearElementSelectionHighlight();
    clearDuplicateControls();
    clearSelectionIndicators();
    hideAddElementMenu();
    if (!sec) {
      tb.style.display = 'none';
      return;
    }
    applyWidgetSelectionIndicators({
      sectionId: id,
      widgetId: sec.querySelector('[data-widget-id]')?.getAttribute('data-widget-id') || null,
      widgetType: sec.querySelector('[data-widget]')?.getAttribute('data-widget') || null,
    }, sec);
    positionToolbar(sec);
  };

    ${WTO_CAROUSEL_RUNTIME}
  ${WTO_FAQ_RUNTIME}
})();
`;

const EXPORT_RUNTIME_BASE = `
(function(){
  try {
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
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(e){
      e.stopPropagation();
      var href=a.getAttribute('href')||'';
      if (href.startsWith('#')) {
        e.preventDefault();
        if (scrollToHash(href,e)) {
          closeMenu();
          return;
        }
        closeMenu();
        return;
      }
      if (scrollToHash(href,e)) {
        closeMenu();
        return;
      }
      closeMenu();
    });});
    document.addEventListener('click',function(e){if(!nav.contains(e.target)&&menu.classList.contains('wto-nav-open')){closeMenu();}});
  });
  document.addEventListener('click',function(e){
    try {
      var target = e.target;
      while (target && target.nodeName !== 'A') { target = target.parentElement; }
      if (!target || target.nodeName !== 'A') return;
      var href = target.getAttribute('href') || '';
      if (!href || href === '#' || href.startsWith('http') || href.startsWith('mailto:')) {
        if (href === '#') e.preventDefault();
        return;
      }
      if (href.startsWith('#')) {
        scrollToHash(href,e);
      }
    } catch (_) {}
  });
  } catch (err) {
    console.error('Export site runtime failed', err);
  }
})();
`;

/** Shared site behavior for exported pages (nav, scroll, animations). */
export const EXPORT_SITE_RUNTIME = EXPORT_RUNTIME_BASE;

/** Full export JS: site runtime + interactive widget runtimes. */
export const EXPORT_RUNTIME = EXPORT_RUNTIME_BASE + WTO_CAROUSEL_RUNTIME + WTO_FAQ_RUNTIME;

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
  device?: "desktop" | "tablet" | "mobile";
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
    device = "desktop",
  } = opts;

  const htmlLang = seo?.language ?? projectSeo?.language ?? "en";
  const pageTitle = seo?.title || title || "Preview";
  const metaTags = renderSeoTags({ title: pageTitle, description, keywords, seo, projectSeo });
  const bodyAttributes = editable
    ? ` data-builder-edit-mode="1" data-builder-device="${device}"`
    : "";

  const sectionHTML = sections
    .filter((s) => editable || !s.hidden)
    .map((s) => {
      if (s.collapsed) return "";
      const styleStr = styleToString(s.style);
      const selectedClass = editable && selectedId === s.id ? " wto-selected" : "";
      const rawHtml = s.widgetInstance ? getWidgetBootstrapExport(s.widgetInstance.type, s.widgetInstance, { editorMode: !!editable }) || s.html : s.html;
      const gridColumnCount = s.widgetInstance?.type === "grid" ? getGridColumnCount(s.widgetInstance as any) : null;
      const canvasLabel = editable ? sectionLabelForCanvas(s) : null;
      const widgetLabel = canvasLabel || (s.widgetInstance ? getWidgetSelectionLabel(s.widgetInstance.type) : "");
      const widgetRootHtml = s.widgetInstance
        ? `<div data-wto-widget-root="1" data-widget-id="${escapeAttribute(s.widgetInstance.id)}" data-widget="${escapeAttribute(s.widgetInstance.type)}" data-wto-widget-label="${escapeAttribute(widgetLabel)}" data-widget-variant="${escapeAttribute(String(s.widgetInstance.variant ?? ""))}"${gridColumnCount != null ? ` data-grid-columns-count="${escapeAttribute(String(gridColumnCount))}"` : ""}${s.shared ? ` data-wto-shared="${escapeAttribute(s.shared)}"` : ""}>${rawHtml}</div>`
        : rawHtml;
      const visibleHtml = applyRootAttributes(widgetRootHtml, {
        className: s.className,
        domId: s.domId,
        style: styleStr,
      });
      const linked = pages ? resolvePageLinks(visibleHtml, pages) : visibleHtml;
      const extra = sectionAttrs(s);
      const hiddenAttr = s.hidden && editable ? ' data-wto-hidden="1"' : "";
      return `<div data-wto-section="${s.id}" class="wto-section${selectedClass}" ${extra}${hiddenAttr}>${resolveAssetPaths(linked, assets)}</div>`;
    })
    .join("\n");

  const editableStyles = editable
    ? `
    .wto-section { position: relative; transition: outline .15s ease; }
    .wto-section:hover:not(:has(.wto-sel-selected)):not(:has(.wto-sel-parent)) {
      outline: 1px dotted rgba(124, 58, 237, 0.4);
      outline-offset: -1px;
      cursor: pointer;
    }
    .wto-section.wto-selected {
      outline: none !important;
      box-shadow: none !important;
    }
    .wto-element-selected {
      outline: none !important;
      box-shadow: none !important;
    }
    .wto-duplicate-control { opacity: 0; transform: scale(0.95); transition: opacity .15s ease, transform .15s ease; }
    .wto-element-selected + .wto-duplicate-control,
    .wto-duplicate-control:hover,
    .wto-duplicate-control:focus-visible { opacity: 1; transform: scale(1); }
    .wto-section[data-wto-hidden="1"] { opacity: .35; }
    [contenteditable="true"] { outline: 2px solid #f59e0b !important; }

    body[data-builder-edit-mode="1"] [data-wto-widget-root],
    body[data-builder-edit-mode="1"] [data-widget-id],
    body[data-builder-edit-mode="1"] .wto-grid-item,
    body[data-builder-edit-mode="1"] .wto-grid-column,
    body[data-builder-edit-mode="1"] [data-wto-child-id],
    body[data-builder-edit-mode="1"] [data-container-child-id] {
      position: relative;
    }

    body[data-builder-edit-mode="1"] [data-wto-widget-root]:hover:not(:has(.wto-sel-selected)):not(:has(.wto-sel-parent)):not(:has(.wto-sel-overlay)),
    body[data-builder-edit-mode="1"] .wto-grid-item:hover:not(.wto-sel-selected):not(:has(.wto-sel-overlay)),
    body[data-builder-edit-mode="1"] [data-wto-child-id]:hover:not(.wto-sel-selected):not(:has(.wto-sel-overlay)),
    body[data-builder-edit-mode="1"] [data-container-child-id]:hover:not(.wto-sel-selected):not(:has(.wto-sel-overlay)) {
      outline: 1px dashed rgba(124, 58, 237, 0.35);
      outline-offset: -1px;
    }

    body[data-builder-edit-mode="1"] .wto-sel-selected,
    body[data-builder-edit-mode="1"] .wto-sel-parent {
      outline: none !important;
      box-shadow: none !important;
    }

    body[data-builder-edit-mode="1"] .wto-sel-overlay {
      position: absolute !important;
      inset: 0 !important;
      border: 1.5px dashed #7c3aed !important;
      border-radius: inherit;
      pointer-events: none !important;
      z-index: 20 !important;
      box-sizing: border-box !important;
      background: transparent !important;
    }

    body[data-builder-edit-mode="1"] .wto-sel-overlay--parent {
      border: 1px dashed rgba(148, 163, 184, 0.75) !important;
    }

    body[data-builder-edit-mode="1"] .wto-sel-badge,
    body[data-builder-edit-mode="1"] [data-builder-editor-only="1"].wto-sel-badge {
      position: absolute !important;
      top: 0 !important;
      left: 0 !important;
      z-index: 60 !important;
      display: inline-flex !important;
      align-items: center !important;
      pointer-events: none !important;
      transform: translateY(calc(-100% - 2px));
      margin: 0;
      padding: 3px 7px;
      border-radius: 5px;
      font: 600 11px/1.2 ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif;
      letter-spacing: 0.01em;
      white-space: nowrap;
      color: #ffffff !important;
      background: #0f172a !important;
      box-shadow: 0 1px 2px rgba(15, 23, 42, 0.2);
    }

    body[data-builder-edit-mode="1"] .wto-sel-badge--parent {
      background: #334155 !important;
    }
    `
    : "";

  const previewStyles = previewCss
    ? `<style>${previewCss}</style>`
    : `<link rel="stylesheet" href="${previewCssHref ?? APP_CSS_HREF}" />`;
  const fontAwesomeStyles = editable
    ? `<link rel="stylesheet" href="${FONT_AWESOME_HREF}" crossorigin="anonymous" referrerpolicy="no-referrer" />`
    : "";
  const bootstrapStyles = `<link rel="stylesheet" href="${BOOTSTRAP_CSS_HREF}" />`;
  const bootstrapScript = `<script src="${BOOTSTRAP_JS_HREF}"></script>`;

  return `<!DOCTYPE html>
<html lang="${escapeHtml(htmlLang)}">
<head>
<meta charset="${escapeHtml(projectSeo?.charset ?? "utf-8")}" />
<meta name="viewport" content="${escapeHtml(projectSeo?.viewport ?? "width=device-width, initial-scale=1")}" />
<title>${escapeHtml(pageTitle)}</title>
${metaTags}
${bootstrapStyles}
${previewStyles}
${fontAwesomeStyles}
<style>
  html, body { margin: 0; min-height: 100%; overflow-x: hidden; }
  body { margin: 0; min-height: 100%; font-family: ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, sans-serif; background: #fff; color: #111827; }
  body > .wto-page-shell { min-height: 100%; }
  ${RUNTIME_CSS}
  ${editableStyles}
  ${globalCss || ""}
</style>
${customHead || ""}
</head>
<body${bodyAttributes}>
<div class="wto-page-shell">
${sectionHTML || (editable ? '<div style="padding:80px;text-align:center;color:#94a3b8;font-family:system-ui">Drag sections from the left to start building â†’</div>' : "")}
</div>
<script>window.__wtoCurrentPageSlug = ${JSON.stringify(currentPageSlug ?? "index")};</script>
${bootstrapScript}
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
  standalone?: boolean;
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
    standalone = false,
  } = opts;
  const pageTitle = seo?.title || title;
  const metaTags = renderSeoTags({ title: pageTitle, description, keywords, seo, projectSeo });
  const exportHead = withExportTracking(customHead, projectSeo);
  const widgetCssBlocks: string[] = [];
  const widgetJsBlocks: string[] = [];
  const usedWidgetTypes = new Set<string>();

  const body = sections
    .filter((s) => !s.hidden)
    .map((s) => {
      const styleStr = styleToString(s.style);
      let rawHtml = s.html;
      if (s.widgetInstance) {
        const contribution = getWidgetExportContribution(s.widgetInstance.type, s.widgetInstance, {
          editorMode: false,
        });
        usedWidgetTypes.add(String(s.widgetInstance.type));
        if (contribution.css) widgetCssBlocks.push(contribution.css);
        if (contribution.js) widgetJsBlocks.push(contribution.js);
        rawHtml = contribution.html || s.html;
      }
      const extracted = extractStyleTags(rawHtml);
      if (extracted.css) widgetCssBlocks.push(extracted.css);
      const raw = applyRootAttributes(extracted.html, {
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

  const vendorCss = standalone
    ? `<link rel="stylesheet" href="${BOOTSTRAP_CSS_HREF}" />
<link rel="stylesheet" href="${FONT_AWESOME_HREF}" crossorigin="anonymous" referrerpolicy="no-referrer" />`
    : "";
  const vendorJs = standalone
    ? `<script src="${BOOTSTRAP_JS_HREF}"></script>`
    : "";

  const html = `<!DOCTYPE html>
<html lang="${escapeHtml(projectSeo?.language ?? seo?.language ?? "en")}">
<head>
<meta charset="${escapeHtml(projectSeo?.charset ?? "utf-8")}" />
<meta name="viewport" content="${escapeHtml(projectSeo?.viewport ?? "width=device-width, initial-scale=1")}" />
${metaTags}
<title>${escapeHtml(pageTitle)}</title>
${vendorCss}
<link rel="stylesheet" href="./css/styles.css" />
${exportHead}
</head>
<body>
${body}
${vendorJs}
<script src="./js/main.js" defer></script>
</body>
</html>`;

  const cssContent = dedupeCssBlocks([
    RUNTIME_CSS,
    ...widgetCssBlocks,
    globalCss || "",
  ]);

  const typedRuntimeJs = Array.from(usedWidgetTypes)
    .map((type) => WIDGET_TYPE_EXPORT_JS[type] || "")
    .filter(Boolean);
  // Always include interactive runtimes so pages remain safe if widgets appear later.
  const jsContent = dedupeJsBlocks([
    EXPORT_SITE_RUNTIME,
    WTO_CAROUSEL_RUNTIME,
    WTO_FAQ_RUNTIME,
    ...typedRuntimeJs,
    ...widgetJsBlocks,
    globalJs || "",
  ]);

  const complete = `<!DOCTYPE html>
<html lang="${escapeHtml(projectSeo?.language ?? seo?.language ?? "en")}">
<head>
<meta charset="${escapeHtml(projectSeo?.charset ?? "utf-8")}" />
<meta name="viewport" content="${escapeHtml(projectSeo?.viewport ?? "width=device-width, initial-scale=1")}" />
${metaTags}
<title>${escapeHtml(pageTitle)}</title>
${vendorCss}
<style>${cssContent}</style>
${exportHead}
</head>
<body>
${inlineAssets ? body : resolveAssetPaths(body, assets)}
${vendorJs}
<script>${jsContent}</script>
</body>
</html>`;

  return {
    html,
    css: cssContent,
    /** Widget `<style>` blocks only — for aggregating multi-page site CSS without duplicating RUNTIME_CSS. */
    widgetCss: dedupeCssBlocks(widgetCssBlocks),
    js: jsContent,
    complete,
    body,
    usedWidgetTypes: Array.from(usedWidgetTypes),
  };
}

function rewriteExportAssetPaths(html: string, assets?: Record<string, BuilderAssetEntry | string>) {
  if (!assets || !html) return html;
  let out = html;
  for (const [name, value] of Object.entries(assets)) {
    const entry = typeof value === "string" ? undefined : value;
    const safeName = normalizeAssetRef(name);
    const filename = normalizeAssetRef(entry?.filename || safeName);
    const relative = `./images/${filename}`;
    const dataUrl = getAssetValue(value);
    if (dataUrl && /^data:/i.test(dataUrl)) {
      out = out.split(dataUrl).join(relative);
    }
    const variants = [
      `builder://images/${safeName}`,
      `builder://images/${filename}`,
      `images/${safeName}`,
      `images/${filename}`,
      `./images/${safeName}`,
      `/images/${safeName}`,
      `/images/${filename}`,
      safeName,
      filename,
    ];
    for (const variant of variants) {
      if (!variant) continue;
      const esc = escapeRegExp(variant);
      const pattern = new RegExp(`(^|[\\s"'=(])${esc}(?=$|[\\s"')>])`, "g");
      out = out.replace(pattern, `$1${relative}`);
    }
  }
  return out;
}

function stripEditorOnlyMarkup(html: string) {
  let out = html;
  // Remove editor-only nodes entirely (placeholders, badges, overlays).
  out = out.replace(/<[^>]*\b(?:builder-editor-only|data-builder-editor-only\s*=\s*["']1["']|wto-sel-badge|wto-sel-overlay|wto-grid-drop-placeholder|wto-duplicate-control)[^>]*>[\s\S]*?<\/[^>]+>/gi, "");
  out = out.replace(/<[^>]*\b(?:builder-editor-only|data-builder-editor-only\s*=\s*["']1["']|wto-sel-badge|wto-sel-overlay|wto-grid-drop-placeholder|wto-duplicate-control)[^>]*\/>/gi, "");
  out = out.replace(/\sdata-wto-widget-root(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-wto-widget-label(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-wto-shared(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-widget-selected(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-builder-edit-mode(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-builder-device(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-builder-editor-only(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-grid-column-wrapper(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sdata-wto-toolbar(?:\s*=\s*["'][^"']*["'])?/gi, "");
  out = out.replace(/\sclass="([^"]*)"/gi, (_match, classNames: string) => {
    const cleaned = classNames
      .split(/\s+/)
      .filter(
        (token) =>
          token &&
          !/^wto-sel-/.test(token) &&
          token !== "wto-selected" &&
          token !== "wto-element-selected" &&
          token !== "builder-editor-only" &&
          token !== "wto-grid-drop-placeholder" &&
          token !== "wto-duplicate-control",
      )
      .join(" ");
    return cleaned ? ` class="${cleaned}"` : "";
  });
  // Drop leftover empty Drop widgets here text nodes if any slipped through.
  out = out.replace(/>\s*Drop widgets here\s*</gi, "><");
  return out;
}

export async function buildSiteExport(project: Project) {
  const files: { path: string; content: string; base64?: string }[] = [];
  const pages = (project.pages ?? []).filter((page) => !page.hidden);
  const pageMeta = pages.map((page) => ({ id: page.id, slug: page.slug }));
  const written = new Set<string>();
  const cssBlocks: string[] = [RUNTIME_CSS, project.globalCss || ""];
  const jsBlocks: string[] = [EXPORT_SITE_RUNTIME, WTO_CAROUSEL_RUNTIME, WTO_FAQ_RUNTIME, project.globalJs || ""];

  const writePage = (page: (typeof pages)[number], filename: string) => {
    if (written.has(filename)) return;
    const bundle = buildExportBundle({
      sections: composePageSections(project, page),
      globalCss: project.globalCss || "",
      globalJs: project.globalJs || "",
      title: page.seo?.title || page.name || project.name,
      description: page.description ?? project.description,
      keywords: page.keywords ?? project.keywords,
      seo: page.seo,
      projectSeo: project.seo,
      customHead: project.customHead,
      assets: project.assets,
      inlineAssets: false,
      pages: pageMeta,
      standalone: true,
    });
    if (bundle.widgetCss) cssBlocks.push(bundle.widgetCss);
    let html = rewriteExportAssetPaths(bundle.html, project.assets);
    html = stripEditorOnlyMarkup(html);
    if (/Bootstrap Export Ready|Phase 1 bootstrap export foundation is active/i.test(html)) {
      throw new Error("Export refused to write placeholder Bootstrap Export Ready content");
    }
    files.push({ path: filename, content: html });
    written.add(filename);
  };

  for (const page of pages) {
    writePage(page, toExportHtmlFilename(page.slug));
  }

  if (!written.has("index.html") && pages.length > 0) {
    const fallback =
      pages.find((page) => page.id === project.currentPageId) ||
      pages[0];
    writePage(fallback, "index.html");
  }

  if (written.size === 0) {
    files.push({
      path: "index.html",
      content: `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><title>${escapeHtml(project.name || "Website")}</title><link rel="stylesheet" href="${BOOTSTRAP_CSS_HREF}" /><link rel="stylesheet" href="./css/styles.css" /></head><body><main style="padding:48px;font-family:system-ui,sans-serif"><h1>${escapeHtml(project.name || "Website")}</h1><p>This project has no visible pages yet.</p></main><script src="${BOOTSTRAP_JS_HREF}"></script><script src="./js/main.js" defer></script></body></html>`,
    });
  }

  files.push({
    path: "css/styles.css",
    content: dedupeCssBlocks(cssBlocks),
  });
  files.push({
    path: "js/main.js",
    content: dedupeJsBlocks(jsBlocks),
  });

  for (const [name, asset] of Object.entries(project.assets ?? {})) {
    const entry = typeof asset === "string" ? undefined : asset;
    const filename = normalizeAssetRef(entry?.filename || name);
    const blob = entry?.imageId ? await getImageBlob(entry.imageId) : null;
    if (blob) {
      const buffer = await blob.arrayBuffer();
      const bytes = Array.from(new Uint8Array(buffer), (byte) => String.fromCharCode(byte)).join("");
      files.push({ path: `images/${filename}`, content: "", base64: btoa(bytes) });
    } else if (typeof asset === "string" && /^data:/i.test(asset)) {
      const comma = asset.indexOf(",");
      const payload = comma >= 0 ? asset.slice(comma + 1) : "";
      const isBase64 = /;base64/i.test(asset.slice(0, Math.max(0, comma)));
      if (isBase64 && payload) {
        files.push({ path: `images/${filename}`, content: "", base64: payload });
      }
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


