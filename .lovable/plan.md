# Builder deep-edit overhaul

Nine related issues all come down to three underlying gaps in the current
builder:

- The iframe fully reloads on every text edit (scroll jumps to top, #5).
- Only real `<img>` tags open the image editor, so decorative gradient boxes
  in Gallery/Portfolio/Blog/Team/Services can't get images (#2, #6, #7, #8).
- The Properties panel exposes text but has no add/remove for repeating items
  (FAQ, blog posts, team members, portfolio items, services, #4, #6, #7, #8, #9)
  and no `href` control for buttons/links (#1). The Button Showcase is one
  section, so buttons can't be selected individually (#1).

## What I'll change

1. **Stop the scroll jump (#5)** — `PreviewFrame`
   - Compute `srcDoc` only when structural things change (sections added /
     removed / reordered / collapsed, style / class / id / global CSS/JS, or
     an HTML change that did NOT come from the iframe itself).
   - Track the last html we sent up from the iframe in a ref; when
     `setSectionHtml` fires from inside, skip re-generating `srcDoc` so the
     iframe keeps its scroll position and DOM.

2. **Color-box images (#2, #6, #7, #8, #9)** — `preview.ts` runtime + `PreviewFrame`
   - In the iframe runtime, also treat clicks on "decorative" boxes
     (elements whose classes include `bg-gradient`, `bg-` color, or fixed
     aspect / rounded box shapes with no children) as image-target clicks:
     send `image-click` with the element's outer selector so the parent can
     replace it with an `<img>`.
   - Image editor: when applying, if there was no `src` (decorative box),
     convert that element into `<img src="…" class="… object-cover">` while
     preserving sizing/rounding classes. Remove clears back to a gradient.

3. **Per-item editing + add/remove (#4, #6, #7, #8, #9)** — `PropertiesPanel`
   - Add a generic "Items" repeater that detects repeating children of the
     section (grid/columns/`space-y` container's direct children, `<details>`
     for FAQ, `<article>` for Blog, testimonial/team/service/portfolio cards).
   - For each item show: image URL (with upload), heading, subtext, link href
     (if it contains an `<a>`), Duplicate, Delete. Plus an "Add item" button
     that clones the last one.

4. **Buttons — individual editing + href (#1)**
   - Split "Button Showcase" into 5 separate single-button sections under
     Buttons (Primary, Secondary, Gradient, Dark, Outline) so each is its
     own selectable section.
   - In Properties, add a "Links & Buttons" group listing every `<a>` /
     `<button>` in the section with a label + `href` input (buttons get a
     `data-href` that the runtime turns into navigation).

5. **Everything editable (#3)** — small polish
   - Runtime already makes text contenteditable on dblclick; extend to allow
     single-click selection of decorative boxes so they show up in Properties
     and can be swapped to an image via the modal (covered by #2 above).

## Technical notes

- Files touched: `src/lib/builder/preview.ts`,
  `src/components/builder/PreviewFrame.tsx`,
  `src/components/builder/PropertiesPanel.tsx`,
  `src/lib/builder/sections.ts` (button split only).
- No store schema changes — repeater edits just rewrite `section.html` via
  the existing `updateSection`/`setSectionHtml` path.
- No backend / data changes.

Approve and I'll implement all five in one pass.
