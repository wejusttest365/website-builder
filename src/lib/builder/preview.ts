import type { PageSection, Project } from "./store";

// Rewrite `images/<filename>` refs to inline data URLs from the assets map.
export function resolveAssetPaths(html: string, assets?: Record<string, string>) {
  if (!assets) return html;
  let out = html;
  for (const [name, data] of Object.entries(assets)) {
    const path = `images/${name}`;
    const esc = path.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    out = out.replace(new RegExp(esc, "g"), data);
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

[data-wto-nav-btn] { display: none; }
@media (max-width: 767px) {
  [data-wto-nav-btn] { display: inline-flex; align-items:center; justify-content:center; width:40px;height:40px;border-radius:8px;background:transparent;border:1px solid rgba(0,0,0,.15);cursor:pointer; }
  [data-wto-nav] [data-wto-nav-menu] {
    display: none !important; position: absolute; left: 0; right: 0; top: 100%;
    background: inherit; padding: 16px; flex-direction: column; gap: 12px;
    box-shadow: 0 12px 24px rgba(0,0,0,.08);
  }
  [data-wto-nav] [data-wto-nav-menu].wto-nav-open { display: flex !important; animation: wto-slide-down .25s ease; }
  [data-wto-nav] { position: relative; }
}
@media (min-width: 768px) { [data-wto-nav-btn] { display: none; } }

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
  indexAll();

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

  // Inline section toolbar
  const tb = document.createElement('div');
  tb.id = '__wto_tb';
  tb.style.cssText = 'position:fixed;z-index:2147483000;display:none;gap:2px;background:#0f172a;color:#fff;border-radius:8px;padding:4px;box-shadow:0 8px 24px rgba(0,0,0,.3);font:14px system-ui;';
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
  addEventListener('scroll', () => positionToolbar(currentSection), true);
  addEventListener('resize', () => positionToolbar(currentSection));

  // Drag reorder
  document.querySelectorAll('[data-wto-section]').forEach(sec => sec.setAttribute('draggable','true'));
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
      if (e.target.closest('#__wto_tb')) return;
      const section = e.target.closest('[data-wto-section]');
      if (!section) return;
      const img = e.target.closest('img');
      if (img) {
        e.preventDefault(); e.stopPropagation();
        send('image-click', { sectionId: section.dataset.wtoSection, idx: img.getAttribute('data-wto-idx'), path: pathFrom(img, section), src: img.getAttribute('src') || '', kind: 'img' });
        return;
      }
      const box = e.target.closest('[data-wto-idx]');
      if (box && isBoxLike(box) && !e.target.closest('a,button,h1,h2,h3,h4,h5,h6,p,li,input,textarea')) {
        e.preventDefault(); e.stopPropagation();
        send('image-click', { sectionId: section.dataset.wtoSection, idx: box.getAttribute('data-wto-idx'), path: pathFrom(box, section), src: '', kind: 'box' });
        return;
      }
      if (e.target.closest('a')) e.preventDefault();
      currentSection = section;
      positionToolbar(section);
      send('select', { sectionId: section.dataset.wtoSection });
    } catch (err) {
      try { send('console', { level: 'error', args: [String(err && err.stack ? err.stack : err)] }); } catch(_){}
      console.error('wto-runtime onClick error', err);
    }
  }

  function startTextEdit(e) {
    const el = e.target.closest('h1,h2,h3,h4,h5,h6,p,summary,span,a,button,li');
    const section = e.target.closest('[data-wto-section]');
    if (!el || !section) return;
    e.preventDefault(); e.stopPropagation();
    el.setAttribute('contenteditable', 'true');
    el.setAttribute('spellcheck', 'false');
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
    btn.addEventListener('click', () => menu.classList.toggle('wto-nav-open'));
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => menu.classList.remove('wto-nav-open')));
  });

  // Brand upload overlay: add a small upload button near the brand anchor in nav
  document.querySelectorAll('nav, [data-wto-nav]').forEach(nav => {
    try {
      const anchors = Array.from(nav.querySelectorAll('a'));
      const brand = anchors.find(a => !a.closest('ul') && !a.closest('li'));
      if (!brand) return;
      brand.style.position = brand.style.position || 'relative';
      const up = document.createElement('button');
      up.setAttribute('aria-label', 'Upload logo');
      up.style.cssText = 'position:absolute;right:-8px;top:50%;transform:translateY(-50%);background:rgba(15,23,42,0.95);color:#fff;border-radius:6px;padding:6px;z-index:2147483001;border:0;cursor:pointer;';
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
  document.querySelectorAll('[data-wto-nav]').forEach(function(nav){
    var btn=nav.querySelector('[data-wto-nav-btn]');
    var menu=nav.querySelector('[data-wto-nav-menu]');
    if(!btn||!menu)return;
    btn.addEventListener('click',function(){menu.classList.toggle('wto-nav-open');});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(){menu.classList.remove('wto-nav-open');});});
  });
})();
`;

function sectionAttrs(s: PageSection) {
  const parts: string[] = [];
  const styleParts: string[] = [];
  if (s.animation?.type) {
    parts.push(`data-anim="${s.animation.type}"`);
    const dur = s.animation.duration ?? 700;
    const del = s.animation.delay ?? 0;
    styleParts.push(`--wto-dur:${dur}ms`, `--wto-delay:${del}ms`);
    if (s.animation.repeat) parts.push('data-anim-repeat="1"');
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
  assets?: Record<string, string>;
  pages?: { id: string; slug: string }[];
}) {
  const { sections, globalCss, globalJs, editable, selectedId, assets, pages } = opts;

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
    .wto-section[data-wto-hidden="1"] { opacity: .35; }
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
  ${RUNTIME_CSS}
  ${editableStyles}
  ${globalCss || ""}
</style>
</head>
<body>
${sectionHTML || (editable ? '<div style="padding:80px;text-align:center;color:#94a3b8;font-family:system-ui">Drag sections from the left to start building →</div>' : "")}
<script>${editable ? RUNTIME_SCRIPT : EXPORT_RUNTIME}</script>
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
  inlineAssets?: boolean;
  pages?: { id: string; slug: string }[];
}) {
  const { sections, globalCss, globalJs, title = "My Website", assets, inlineAssets, pages } = opts;
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
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="./css/styles.css" />
</head>
<body>
${body}
<script src="./js/main.js"></script>
</body>
</html>`;

  const complete = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>${RUNTIME_CSS}\n${globalCss}</style>
</head>
<body>
${inlineAssets ? body : resolveAssetPaths(body, assets)}
<script>${globalJs}</script>
<script>${EXPORT_RUNTIME}</script>
</body>
</html>`;

  return { html, css: globalCss, js: globalJs, complete, body };
}

export function buildSiteExport(project: Project) {
  const pageMeta = project.pages.map((p) => ({ id: p.id, slug: p.slug }));
  const files: { path: string; content: string; base64?: string }[] = [];
  files.push({ path: "css/styles.css", content: `${RUNTIME_CSS}\n${project.globalCss || ""}` });
  files.push({ path: "js/main.js", content: `${project.globalJs || ""}\n${EXPORT_RUNTIME}` });
  for (const page of project.pages) {
    const bundle = buildExportBundle({
      sections: page.sections,
      globalCss: "",
      globalJs: "",
      title: `${project.name} — ${page.name}`,
      assets: project.assets,
      pages: pageMeta,
    });
    files.push({ path: `${page.slug}.html`, content: bundle.html });
  }
  for (const [name, dataUrl] of Object.entries(project.assets ?? {})) {
    const m = /^data:[^;]+;base64,(.*)$/.exec(dataUrl);
    if (m) files.push({ path: `images/${name}`, content: "", base64: m[1] });
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
