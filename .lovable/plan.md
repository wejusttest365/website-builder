
This is a very large product (roughly a small Webflow/Elementor clone). To ship something solid rather than a shallow demo of everything, I'll build it in focused phases. Phase 1 will already be a usable builder; later phases layer polish.

## Phase 1 — Core builder (this build)

Layout
- Full-viewport 4-pane shell: left sidebar, center canvas, right properties panel, bottom code editor. Resizable dividers, light/dark mode.
- Top toolbar: logo, project name, New, Save, Undo, Redo, Desktop/Tablet/Mobile toggle, Preview, Export menu, Settings.

Left Sidebar — Section Library
- ~20 categories (Navigation, Hero, About, Features, Services, Portfolio, Gallery, Pricing, Testimonials, FAQ, Team, Contact, Footer, Cards, Forms, Buttons, CTA, Blog, Login, Signup).
- Seeded with 2–3 ready-made HTML sections per category (Tailwind-based markup) so the builder is usable immediately. Each item: thumbnail, title, drag handle, copy, preview.
- Search bar filters across categories.

Center Canvas
- Iframe-based preview so section CSS/JS is sandboxed.
- Drag from library, drop between sections, reorder (dnd-kit), duplicate, delete, collapse/expand, select.
- Device frame switch (Desktop 100%, Tablet 768, Mobile 390).

Inline editing
- Click headings, paragraphs, buttons, links inside the iframe to edit text in place (contentEditable bridge, writes back to section HTML).

Image editing
- Click an image → modal with Upload (file → data URL), Paste URL, Replace, Resize (width/height), Remove.

Right Properties Panel
- Per-selected-section: background color, background image, padding, margin, border radius, shadow, width, height, text align, font family, font size, line height, section ID, custom class. Applied as inline styles / classes on the section wrapper.

Bottom Code Editor
- Monaco with tabs: HTML (current page composed markup, read-only reflection + editable override), CSS (global), JS (global), Console (captures iframe console.*).
- Live update on change (debounced), no refresh.

Export
- Copy HTML / CSS / JS / Complete Website; Download HTML; Download ZIP (jszip) with index.html + style.css + script.js.

Projects
- LocalStorage-backed. Create, rename, duplicate, delete, save, load, autosave (debounced).

Undo/Redo
- History stack of page state; Ctrl+Z / Ctrl+Y.

Preview mode
- "Preview" opens `/preview/:projectId` in a new tab rendering only the composed site.

Live share
- `/demo/:projectId` route reads from LocalStorage and renders the site clean.

Design
- Clean modern UI: rounded cards, soft shadows, light gray canvas bg, white panels, Lucide icons (Bootstrap Icons not in stack — swap to Lucide for consistency), Tailwind v4 tokens, dark mode.

## Phase 2 (not in this build, follow-ups)
- Crop image tool, richer typography controls, per-element (not just per-section) property editing, publishing beyond localStorage, AI section generation, cloud sync, templates, user accounts.

## Technical notes
- Stack: existing TanStack Start + React + TS + Tailwind v4. dnd-kit, Monaco (`@monaco-editor/react`), jszip, nanoid.
- Preview iframe uses `srcdoc` rebuilt from `{sections[], globalCss, globalJs}`; a small runtime script inside handles selection, inline text edits, image clicks via `postMessage` to the parent.
- All builder state in a Zustand store with history middleware.
- Routes: `/` (redirect to `/builder`), `/builder`, `/preview/$projectId`, `/demo/$projectId`.
- Since LocalStorage is per-browser, "Live Share" links only work in the same browser — I'll note this in the UI. True shareable links require Lovable Cloud (can add later).

## What I need from you
1. Confirm Phase 1 scope above (or tell me what to drop / add first).
2. Bootstrap Icons isn't in the stack — OK to use Lucide icons throughout for a consistent modern look?
3. OK that Live Share is local-browser only for now, with a follow-up to add Cloud-backed sharing?
