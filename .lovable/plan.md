# Website Builder Overhaul Plan

This is a large scope. I'll implement it in one pass across the affected files. Below is what changes and where.

## 1. Data model — multi-page projects
`src/lib/builder/store.ts`
- Extend `Project` with `pages: Page[]` and `currentPageId`.
  - `Page = { id, name, slug, sections, hidden? }` (slug drives filename: `index.html`, `about-us.html`, etc.)
- Migration: on hydrate, if a project has top-level `sections`, wrap it as a single `Home` page (slug `index`).
- New actions: `addPage`, `renamePage`, `setPageSlug`, `duplicatePage`, `deletePage`, `selectPage`, `reorderPages`.
- Section actions operate on the current page.
- Add `pageAnimation` (global page-load animation preset) at project level.

## 2. Section model — animation + visibility
- Extend `PageSection` with `animation?: { type; duration; delay; repeat }`, `hidden?: boolean`.
- Runtime applies `data-anim` attributes; IntersectionObserver triggers CSS animation classes.

## 3. FAQ icon
`src/lib/builder/sections.ts` + `preview.ts`
- FAQ items get a chevron `<svg>` inside `<summary>`; CSS rotates on `[open]`.

## 4. Responsive navigation
`sections.ts` (nav templates) + runtime CSS in `preview.ts`
- Add hamburger button, mobile drawer, sticky option toggle, auto-close on link click.
- Sticky is togglable via a Properties control ("Sticky header").

## 5. Portfolio / Blog / Team / Services / Gallery
`PropertiesPanel.tsx`
- Item repeater already exists; extend items to include `href` + `target` (open in new tab) and wrap the card in `<a>` when href set.

## 6. Footer
- Copyright line becomes an explicit editable text row with typography controls (font size, weight, color, alignment, padding) alongside existing column editor.

## 7. Buttons split
`sections.ts`
- Split each button preset into "Link Button" (renders `<a>`) and "Form Button" (renders `<button type="submit">`).
- Properties for Link Button: URL, new tab, download, icon, hover effect, animation.
- Internal-page URL selector auto-lists available pages (`about-us.html`, ...).

## 8. Remove code inspector
`BuilderShell.tsx`
- Drop the bottom `CodePanel`. Canvas uses full height. Delete `CodePanel.tsx` import.
- Console/HTML/CSS/JS editing removed from UI (globalCss/JS still exist in export via Toolbar advanced or removed entirely).

## 9. Inline section controls
`PreviewFrame.tsx` runtime
- On hover/select, render a floating toolbar over the section with: Move Up/Down/Top/Bottom, Duplicate, Hide, Delete, Settings.
- Communicates via `postMessage` events to parent store.

## 10. Drag-and-drop reorder
`PreviewFrame.tsx`
- Native HTML5 drag on section wrapper. Insertion indicator = 2px primary line between sections. On drop calls `moveSection`.

## 11. Animations
`preview.ts`
- Inject keyframes for fade-in/up/down, slide-left/right, zoom-in/out, flip, bounce.
- Per section: `data-anim="fade-up" data-anim-duration="600" data-anim-delay="0"`.
- Global `pageAnimation` maps semantic groups (hero, buttons, images, cards) to defaults via CSS selectors.

## 12. Right panel additions
`PropertiesPanel.tsx`
- Add collapsible groups: Background, Spacing (padding/margin), Container Width, Typography, Colors, Buttons/Links, Animation, Visibility (hide on mobile/tablet/desktop), Responsive.

## 13. Toolbar — Pages
`Toolbar.tsx`
- Replace "Add Project" with **Pages** dropdown: list pages, add/rename/duplicate/delete, "Add Page".
- Keep separate "Projects" menu (rename "Website" internally) so a user can still have multiple websites.

## 14. Export
`preview.ts` `buildExportBundle` + Toolbar download
- Emit one HTML file per page named by slug (`index.html`, `about-us.html`, ...).
- Shared `css/styles.css`, `js/main.js`, `images/*`.
- ZIP structure:
  ```text
  index.html
  about-us.html
  services.html
  ...
  css/styles.css
  js/main.js
  images/*
  ```
- Rewrite internal links from `page:<id>` markers to `<slug>.html`.

## 15. Drag from library into a section
`PreviewFrame.tsx`
- Library items already dropped into canvas add a section. Add second drop mode: dropping a "Button" or "Text Block" library item onto an existing section appends the element inside that section (data-drop-target on hovered section).

---

## Technical notes
- All new runtime logic lives in `preview.ts` `runtimeScript` and injected `<style>`.
- Section HTML stays as strings; new attributes are set via runtime after render, keyed off `data-wto-idx`.
- LocalStorage schema bumped to `wto-builder-v2` with migration from v1.
- No backend changes — pure client build.

## Files touched
- `src/lib/builder/store.ts` (pages, animation, visibility, migration)
- `src/lib/builder/sections.ts` (FAQ icon, buttons split, responsive nav, footer copyright block)
- `src/lib/builder/preview.ts` (runtime: inline controls, drag reorder, animations, link rewriting, per-page export, FAQ chevron CSS, mobile nav CSS)
- `src/components/builder/BuilderShell.tsx` (remove CodePanel, full-height canvas)
- `src/components/builder/Toolbar.tsx` (Pages menu, page-aware export)
- `src/components/builder/Canvas.tsx` (page tabs, hide top strip since inline controls replace it)
- `src/components/builder/PropertiesPanel.tsx` (new groups, per-item href/target, footer copyright editor, animation controls, visibility)
- `src/components/builder/PreviewFrame.tsx` (message handlers for new inline actions and drag-drop-into-section)
- Delete: `src/components/builder/CodePanel.tsx`

## Out of scope for this pass
- CMS/back-end.
- SEO metadata per page beyond `<title>`.
- Real Framer-style timeline; animations use CSS presets only.
