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

data-wto-sticky="1"] { position: sticky; top: 0; z-index: 40; }

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
  uploadIcon.textContent = '📷';
  uploadIcon.style.cssText = 'position:absolute;display:none;z-index:10004;width:32px;height:32px;border-radius:9999px;border:1px solid rgba(255,255,255,.9);background:rgba(15,23,42,.95);color:white;align-items:center;justify-content:center;font:16px system-ui;cursor:pointer;pointer-events:auto;';
  uploadIcon.addEventListener('mousedown', e => e.stopPropagation());
  document.body.appendChild(uploadIcon);

  let uploadTarget = null;
  let uploadTargetKind = 'img';

  function showUploadIcon(target, kind) {
    const rect = target.getBoundingClientRect();
    uploadTarget = target;
    uploadTargetKind = kind;
    uploadIcon.style.left = Math.min(window.innerWidth - 40, Math.max(8, rect.right - 40)) + 'px';
    uploadIcon.style.top = Math.max(8, rect.top + 8) + 'px';
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
    send('image-click', {
      sectionId: section.dataset.wtoSection,
      idx: uploadTarget.getAttribute('data-wto-idx'),
      path: pathFrom(uploadTarget, section),
      src: uploadTarget.tagName === 'IMG' ? uploadTarget.getAttribute('src') || '' : '',
      kind: uploadTargetKind,
    });
    hideUploadIcon();
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
      if (target.closest('[data-wto-nav-btn]') || target.closest('[data-wto-nav-menu]')) return;
      if (target.closest('[data-carousel-prev], [data-carousel-next], [data-carousel-dot], [data-carousel-items-prev], [data-carousel-items-next], [data-carousel-indicator]')) return;
      const section = target.closest('[data-wto-section]');
      if (!section) return;
      const anchor = target.closest('a');
      if (anchor) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') {
          e.preventDefault();
        }
      }
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
    btn.addEventListener('click', event => {
      event.stopPropagation();
      toggleMenu();
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', (e) => {
      e.stopPropagation();
      const href = a.getAttribute('href');
      // If link points to a page file (e.g., "about-us.html"), navigate to that page
      if (href && href.endsWith('.html') && !href.startsWith('http')) {
        e.preventDefault();
        const slug = href.replace(/\.html$/, '');
        setActiveLink(slug);
        send('navigate-page', { slug });
      }
      menu.classList.remove('wto-nav-open');
      menu.classList.add('hidden');
      menu.style.display = 'none';
    }));
    // Close menu when clicking outside nav
    document.addEventListener('click', e => {
      if (!nav.contains(e.target) && menu.classList.contains('wto-nav-open')) {
        menu.classList.remove('wto-nav-open');
        menu.classList.add('hidden');
        menu.style.display = 'none';
      }
    });
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
      up.style.cssText = 'position:absolute;right:-8px;top:50%;transform:translateY(-50%);background:rgba(15,23,42,0.95);color:#fff;border-radius:6px;padding:6px;z-index:10005;border:0;cursor:pointer;';
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
    btn.addEventListener('click',function(e){e.stopPropagation();toggleMenu();});
    menu.querySelectorAll('a').forEach(function(a){a.addEventListener('click',function(e){e.stopPropagation();var href=a.getAttribute('href');if(href&&href.match(/\\.html$/)){var slug=href.replace(/\\.html$/,'');setActiveLink(slug);}menu.classList.remove('wto-nav-open');menu.classList.add('hidden');menu.style.display='none';});});
    document.addEventListener('click',function(e){if(!nav.contains(e.target)&&menu.classList.contains('wto-nav-open')){menu.classList.remove('wto-nav-open');menu.classList.add('hidden');menu.style.display='none';}});
  });
})();
`;

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
  assets?: Record<string, string>;
  pages?: { id: string; slug: string }[];
  description?: string;
  keywords?: string;
  customHead?: string;
}) {
  const { sections, globalCss, globalJs, editable, selectedId, assets, pages, description, keywords, customHead } = opts;

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

  const metaTags = [
    description ? `<meta name="description" content="${escapeHtml(description)}" />` : "",
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n");

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${metaTags}
<title>Preview</title>
<script src="https://cdn.tailwindcss.com"></script>
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
  description?: string;
  keywords?: string;
  customHead?: string;
  assets?: Record<string, string>;
  inlineAssets?: boolean;
  pages?: { id: string; slug: string }[];
}) {
  const { sections, globalCss, globalJs, title = "My Website", description, keywords, customHead, assets, inlineAssets, pages } = opts;
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

  const metaTags = [
    description ? `<meta name="description" content="${escapeHtml(description)}" />` : "",
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${metaTags}
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<link rel="stylesheet" href="./css/styles.css" />
${customHead || ""}
</head>
<body>
${body}
<script src="./js/main.js"></script>
</body>
</html>`;

  const completeMetaTags = [
    description ? `<meta name="description" content="${escapeHtml(description)}" />` : "",
    keywords ? `<meta name="keywords" content="${escapeHtml(keywords)}" />` : "",
  ]
    .filter(Boolean)
    .join("\n");

  const complete = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
${completeMetaTags}
<title>${escapeHtml(title)}</title>
<script src="https://cdn.tailwindcss.com"></script>
<style>${RUNTIME_CSS}\n${globalCss}</style>
${customHead || ""}
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
      description: page.description,
      keywords: page.keywords,
      customHead: project.customHead,
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
