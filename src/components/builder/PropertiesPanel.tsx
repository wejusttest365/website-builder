import { useBuilder } from "@/lib/builder/store";
import { Plus, Trash2, Copy } from "lucide-react";
import type { ReactNode } from "react";

export function PropertiesPanel() {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const updateSection = useBuilder((s) => s.updateSection);
  const pushHistory = useBuilder((s) => s.pushHistory);
  const addAsset = useBuilder((s) => s.addAsset);

  const section = project?.sections.find((s) => s.id === selectedId) ?? null;

  if (!section) {
    return (
      <div className="h-full bg-card p-6 text-sm text-muted-foreground">
        <div className="font-semibold text-foreground text-base mb-2">Properties</div>
        Select a section on the canvas to edit its properties.
      </div>
    );
  }

  const style = section.style ?? {};
  const isFooter = /^\s*<footer\b/i.test(section.html);
  const textItems = getEditableTextItems(section.html);
  const menuItems = isFooter ? [] : getMenuItems(section.html);
  const linkItems = getLinkItems(section.html);
  const repeater = isFooter ? null : getRepeater(section.html);
  const footerCols = isFooter ? getFooterColumns(section.html) : [];
  const assets = project?.assets;

  const set = (k: string, v: string) => {
    const next = { ...style };
    if (v) next[k] = v;
    else delete next[k];
    updateSection(section.id, { style: next });
  };

  const updateHtml = (html: string) => updateSection(section.id, { html });

  return (
    <div className="h-full bg-card flex flex-col">
      <div className="p-4 border-b border-border">
        <div className="text-xs uppercase tracking-wider text-muted-foreground">Section</div>
        <input
          value={section.name}
          onChange={(e) => updateSection(section.id, { name: e.target.value })}
          onBlur={pushHistory}
          className="mt-1 w-full text-base font-semibold bg-transparent focus:outline-none"
        />
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-5 text-sm">
        {isFooter && (
          <Group title={`Footer Columns (${footerCols.length})`}>
            <div className="space-y-3">
              {footerCols.map((col, ci) => (
                <div key={ci} className="rounded-md border border-input p-2 space-y-1.5 bg-background">
                  <div className="flex items-center justify-between gap-2">
                    <input
                      className={inputCls}
                      value={col.heading}
                      placeholder="Column heading"
                      onChange={(e) => updateHtml(setFooterColumnHeading(section.html, ci, e.target.value))}
                      onBlur={pushHistory}
                    />
                    <button
                      type="button"
                      title="Delete column"
                      className="p-1.5 hover:bg-destructive/10 text-destructive rounded disabled:opacity-30"
                      disabled={footerCols.length <= 1}
                      onClick={() => {
                        updateHtml(removeFooterColumn(section.html, ci));
                        pushHistory();
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <div className="space-y-1">
                    {col.items.map((it, ii) => (
                      <div key={ii} className="grid grid-cols-[1fr_1fr_28px] gap-1.5">
                        <input
                          className={inputCls}
                          value={it.text}
                          placeholder="Label"
                          onChange={(e) =>
                            updateHtml(updateFooterColumnItem(section.html, ci, ii, { text: e.target.value }))
                          }
                          onBlur={pushHistory}
                        />
                        <input
                          className={inputCls}
                          value={it.href}
                          placeholder="#"
                          onChange={(e) =>
                            updateHtml(updateFooterColumnItem(section.html, ci, ii, { href: e.target.value }))
                          }
                          onBlur={pushHistory}
                        />
                        <button
                          type="button"
                          className="inline-flex h-8 items-center justify-center rounded-md border border-input text-destructive hover:bg-destructive/10"
                          title="Remove item"
                          onClick={() => {
                            updateHtml(removeFooterColumnItem(section.html, ci, ii));
                            pushHistory();
                          }}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="inline-flex h-7 w-full items-center justify-center gap-1.5 rounded-md border border-input bg-background text-[11px] font-medium hover:bg-accent"
                      onClick={() => {
                        updateHtml(addFooterColumnItem(section.html, ci));
                        pushHistory();
                      }}
                    >
                      <Plus className="h-3 w-3" /> Add menu item
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent"
                onClick={() => {
                  updateHtml(addFooterColumn(section.html));
                  pushHistory();
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Add column
              </button>
            </div>
          </Group>
        )}

        {menuItems.length > 0 && (
          <Group title="Menu Items">
            <div className="space-y-2">
              {menuItems.map((item, index) => (
                <div key={`${item.text}-${index}`} className="grid grid-cols-[1fr_74px_28px] gap-1.5">
                  <input
                    className={inputCls}
                    value={item.text}
                    aria-label={`Menu item ${index + 1} label`}
                    onChange={(e) => updateHtml(updateMenuItem(section.html, index, { text: e.target.value }))}
                    onBlur={pushHistory}
                  />
                  <input
                    className={inputCls}
                    value={item.href}
                    aria-label={`Menu item ${index + 1} link`}
                    onChange={(e) => updateHtml(updateMenuItem(section.html, index, { href: e.target.value }))}
                    onBlur={pushHistory}
                  />
                  <button
                    type="button"
                    className="inline-flex h-8 items-center justify-center rounded-md border border-input text-destructive hover:bg-destructive/10"
                    title="Remove menu item"
                    onClick={() => {
                      updateHtml(removeMenuItem(section.html, index));
                      pushHistory();
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent"
                onClick={() => {
                  updateHtml(addMenuItem(section.html));
                  pushHistory();
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Add menu item
              </button>
            </div>
          </Group>
        )}

        {repeater && repeater.items.length > 1 && (
          <Group title={`Items (${repeater.items.length})`}>
            <div className="space-y-3">
              {repeater.items.map((it, i) => (
                <div key={i} className="rounded-md border border-input p-2 space-y-1.5 bg-background">
                  <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground">
                    <span>Item {i + 1}</span>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        title="Duplicate"
                        className="p-1 hover:bg-accent rounded"
                        onClick={() => {
                          updateHtml(duplicateRepeaterItem(section.html, i));
                          pushHistory();
                        }}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        title="Delete"
                        disabled={repeater.items.length <= 1}
                        className="p-1 hover:bg-destructive/10 text-destructive rounded disabled:opacity-30"
                        onClick={() => {
                          updateHtml(removeRepeaterItem(section.html, i));
                          pushHistory();
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <input
                    className={inputCls}
                    placeholder="Image URL"
                    value={it.image}
                    onChange={(e) => updateHtml(setRepeaterItemImage(section.html, i, e.target.value))}
                    onBlur={pushHistory}
                  />
                  <input
                    type="file"
                    accept="image/*"
                    className="block w-full text-xs"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (!f) return;
                      const r = new FileReader();
                      r.onload = () => {
                        const path = addAsset(String(r.result), f.name.split(".").pop());
                        updateHtml(setRepeaterItemImage(section.html, i, path));
                        pushHistory();
                      };
                      r.readAsDataURL(f);
                    }}
                  />
                  {it.hasTitle && (
                    <input
                      className={inputCls}
                      placeholder="Title"
                      value={it.title}
                      onChange={(e) => updateHtml(setRepeaterItemField(section.html, i, "title", e.target.value))}
                      onBlur={pushHistory}
                    />
                  )}
                  {it.hasBody && (
                    <textarea
                      className={inputCls}
                      rows={2}
                      placeholder="Body"
                      value={it.body}
                      onChange={(e) => updateHtml(setRepeaterItemField(section.html, i, "body", e.target.value))}
                      onBlur={pushHistory}
                    />
                  )}
                  {it.hasLink && (
                    <input
                      className={inputCls}
                      placeholder="Link URL"
                      value={it.href}
                      onChange={(e) => updateHtml(setRepeaterItemField(section.html, i, "href", e.target.value))}
                      onBlur={pushHistory}
                    />
                  )}
                </div>
              ))}
              <button
                type="button"
                className="inline-flex h-8 w-full items-center justify-center gap-2 rounded-md border border-input bg-background text-xs font-medium hover:bg-accent"
                onClick={() => {
                  updateHtml(addRepeaterItem(section.html));
                  pushHistory();
                }}
              >
                <Plus className="h-3.5 w-3.5" /> Add item
              </button>
            </div>
          </Group>
        )}

        {linkItems.length > 0 && (
          <Group title="Links & Buttons">
            <div className="space-y-2">
              {linkItems.map((item, index) => (
                <div key={index} className="grid grid-cols-[1fr_1fr] gap-1.5">
                  <input
                    className={inputCls}
                    value={item.text}
                    aria-label={`Link ${index + 1} label`}
                    onChange={(e) => updateHtml(updateLinkItem(section.html, index, { text: e.target.value }))}
                    onBlur={pushHistory}
                  />
                  <input
                    className={inputCls}
                    value={item.href}
                    aria-label={`Link ${index + 1} URL`}
                    placeholder="https://…"
                    onChange={(e) => updateHtml(updateLinkItem(section.html, index, { href: e.target.value }))}
                    onBlur={pushHistory}
                  />
                </div>
              ))}
            </div>
          </Group>
        )}

        {textItems.length > 0 && (
          <Group title="Text Content">
            {textItems.slice(0, 10).map((item, index) => (
              <Field key={`${item.tag}-${index}`} label={item.label}>
                <input
                  className={inputCls}
                  value={item.text}
                  aria-label={`${item.label} text`}
                  onChange={(e) => updateHtml(updateTextItem(section.html, index, e.target.value))}
                  onBlur={pushHistory}
                />
              </Field>
            ))}
          </Group>
        )}

        <Group title="Background">
          <Field label="Color">
            <ColorInput
              value={style["background-color"] ?? ""}
              onChange={(v) => set("background-color", v)}
              onBlur={pushHistory}
            />
          </Field>
          <Field label="Image URL">
            <input
              className={inputCls}
              value={(style["background-image"] ?? "").replace(/^url\(|\)$/g, "").replace(/^["']|["']$/g, "")}
              onChange={(e) => set("background-image", e.target.value ? `url("${e.target.value}")` : "")}
              onBlur={pushHistory}
              placeholder="https://…"
            />
          </Field>
          <Field label="Upload">
            <input
              type="file"
              accept="image/*"
              className="block w-full text-xs"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => {
                  const path = addAsset(String(r.result), f.name.split(".").pop());
                  set("background-image", `url("${path}")`);
                  pushHistory();
                };
                r.readAsDataURL(f);
              }}
            />
          </Field>
        </Group>

        <Group title="Text">
          <Field label="Text color">
            <ColorInput
              value={style["color"] ?? ""}
              onChange={(v) => set("color", v)}
              onBlur={pushHistory}
            />
          </Field>
        </Group>

        <Group title="Spacing">
          <Field label="Padding">
            <input className={inputCls} value={style["padding"] ?? ""} onChange={(e) => set("padding", e.target.value)} onBlur={pushHistory} placeholder="e.g. 40px 20px" />
          </Field>
          <Field label="Margin">
            <input className={inputCls} value={style["margin"] ?? ""} onChange={(e) => set("margin", e.target.value)} onBlur={pushHistory} placeholder="e.g. 0" />
          </Field>
        </Group>

        <Group title="Layout">
          <Field label="Width">
            <input className={inputCls} value={style["width"] ?? ""} onChange={(e) => set("width", e.target.value)} onBlur={pushHistory} placeholder="e.g. 100%" />
          </Field>
          <Field label="Height">
            <input className={inputCls} value={style["height"] ?? ""} onChange={(e) => set("height", e.target.value)} onBlur={pushHistory} placeholder="auto" />
          </Field>
          <Field label="Border Radius">
            <input className={inputCls} value={style["border-radius"] ?? ""} onChange={(e) => set("border-radius", e.target.value)} onBlur={pushHistory} placeholder="e.g. 16px" />
          </Field>
          <Field label="Shadow">
            <select
              className={inputCls}
              value={style["box-shadow"] ?? ""}
              onChange={(e) => set("box-shadow", e.target.value)}
              onBlur={pushHistory}
            >
              <option value="">None</option>
              <option value="0 1px 2px rgba(0,0,0,.06)">Subtle</option>
              <option value="0 4px 10px rgba(0,0,0,.08)">Soft</option>
              <option value="0 10px 30px rgba(0,0,0,.15)">Medium</option>
              <option value="0 25px 50px -12px rgba(0,0,0,.25)">Large</option>
            </select>
          </Field>
        </Group>

        <Group title="Typography">
          <Field label="Text align">
            <select className={inputCls} value={style["text-align"] ?? ""} onChange={(e) => set("text-align", e.target.value)} onBlur={pushHistory}>
              <option value="">Default</option>
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </Field>
          <Field label="Font family">
            <select className={inputCls} value={style["font-family"] ?? ""} onChange={(e) => set("font-family", e.target.value)} onBlur={pushHistory}>
              <option value="">Default</option>
              <option value="ui-sans-serif, system-ui, sans-serif">Sans (system)</option>
              <option value="Georgia, serif">Serif</option>
              <option value="ui-monospace, monospace">Mono</option>
              <option value='"Inter", sans-serif'>Inter</option>
              <option value='"Poppins", sans-serif'>Poppins</option>
            </select>
          </Field>
          <Field label="Font size">
            <input className={inputCls} value={style["font-size"] ?? ""} onChange={(e) => set("font-size", e.target.value)} onBlur={pushHistory} placeholder="e.g. 16px" />
          </Field>
          <Field label="Line height">
            <input className={inputCls} value={style["line-height"] ?? ""} onChange={(e) => set("line-height", e.target.value)} onBlur={pushHistory} placeholder="e.g. 1.5" />
          </Field>
        </Group>

        <Group title="Advanced">
          <Field label="Section ID">
            <input className={inputCls} value={section.domId ?? ""} onChange={(e) => updateSection(section.id, { domId: e.target.value })} onBlur={pushHistory} placeholder="my-section" />
          </Field>
          <Field label="Custom class">
            <input className={inputCls} value={section.className ?? ""} onChange={(e) => updateSection(section.id, { className: e.target.value })} onBlur={pushHistory} placeholder="my-class" />
          </Field>
        </Group>
      </div>
    </div>
  );
}

const inputCls =
  "w-full px-2.5 py-1.5 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring";

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
        {title}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="grid grid-cols-[100px_1fr] items-center gap-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </label>
  );
}

function ColorInput({ value, onChange, onBlur }: { value: string; onChange: (v: string) => void; onBlur: () => void }) {
  return (
    <div className="flex gap-2">
      <input
        type="color"
        value={/^#/.test(value) ? value : "#ffffff"}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        className="w-9 h-8 rounded border border-input bg-background cursor-pointer"
      />
      <input
        className={inputCls}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="transparent"
      />
    </div>
  );
}

type MenuItem = { text: string; href: string };
type TextItem = { tag: string; label: string; text: string };

const textSelector = "h1,h2,h3,h4,h5,h6,p,a,button";
const menuSelector = "nav ul li a, ul li a";

function parseHtml(html: string) {
  if (typeof DOMParser === "undefined") return null;
  return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
}

function serialize(doc: Document) {
  return doc.body.innerHTML;
}

function getEditableTextItems(html: string): TextItem[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector))
    .map((el) => ({
      tag: el.tagName.toLowerCase(),
      label: labelForElement(el),
      text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
    }))
    .filter((item) => item.text.length > 0);
}

function updateTextItem(html: string, index: number, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>(textSelector)).filter((el) =>
    (el.textContent ?? "").trim(),
  );
  const el = items[index];
  if (el) el.textContent = text;
  return serialize(doc);
}

function getMenuItems(html: string): MenuItem[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector)).map((el) => ({
    text: (el.textContent ?? "").trim(),
    href: el.getAttribute("href") ?? "#",
  }));
}

function updateMenuItem(html: string, index: number, patch: Partial<MenuItem>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const links = Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector));
  const link = links[index];
  if (link) {
    if (patch.text !== undefined) link.textContent = patch.text;
    if (patch.href !== undefined) link.setAttribute("href", patch.href || "#");
  }
  return serialize(doc);
}

function addMenuItem(html: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const list = doc.body.querySelector("nav ul") ?? doc.body.querySelector("ul");
  const sample = list?.querySelector("li a");
  const linkClass = sample?.getAttribute("class") ?? "hover:text-indigo-600";
  const li = doc.createElement("li");
  const a = doc.createElement("a");
  a.href = "#";
  a.className = linkClass;
  a.textContent = "New Menu";
  li.appendChild(a);
  if (list) list.appendChild(li);
  else doc.body.appendChild(li);
  return serialize(doc);
}

function removeMenuItem(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const links = Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector));
  const link = links[index];
  const li = link?.closest("li");
  if (li) li.remove();
  return serialize(doc);
}

function labelForElement(el: HTMLElement) {
  const tag = el.tagName.toLowerCase();
  if (/h[1-6]/.test(tag)) return tag.toUpperCase();
  if (tag === "a") return "Link";
  if (tag === "button") return "Button";
  return "Text";
}

// ------------------------ Links & Buttons ------------------------

function getLinkItems(html: string): MenuItem[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).map((el) => ({
    text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
    href:
      el.tagName === "A"
        ? el.getAttribute("href") ?? "#"
        : el.getAttribute("data-href") ?? "",
  }));
}

function updateLinkItem(html: string, index: number, patch: Partial<MenuItem>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button"));
  const el = items[index];
  if (!el) return html;
  if (patch.text !== undefined) el.textContent = patch.text;
  if (patch.href !== undefined) {
    if (el.tagName === "A") el.setAttribute("href", patch.href || "#");
    else el.setAttribute("data-href", patch.href);
  }
  return serialize(doc);
}

// ------------------------ Repeater ------------------------

type RepeaterItem = {
  image: string;
  title: string;
  body: string;
  href: string;
  hasTitle: boolean;
  hasBody: boolean;
  hasLink: boolean;
};

// Path from doc.body → target element as array of child indexes.
function pathTo(el: Element, root: Element): number[] {
  const p: number[] = [];
  let cur: Element | null = el;
  while (cur && cur !== root) {
    const parentEl: Element | null = cur.parentElement;
    if (!parentEl) break;
    p.unshift(Array.from(parentEl.children).indexOf(cur));
    cur = parentEl;
  }
  return p;
}

function nodeAtPath(root: Element, path: number[]): Element | null {
  let cur: Element | null = root;
  for (const i of path) {
    if (!cur) return null;
    cur = cur.children[i] ?? null;
  }
  return cur;
}

// Find the "best" repeating container: element with the most direct children
// that share the same tag (>=2). Prefer non-<ul>/<ol> (those are menu items).
function findRepeater(doc: Document): { container: Element; path: number[] } | null {
  const all = Array.from(doc.body.querySelectorAll("*"));
  let best: { el: Element; count: number; score: number } | null = null;
  for (const el of all) {
    const kids = Array.from(el.children);
    if (kids.length < 2) continue;
    const firstTag = kids[0].tagName;
    const same = kids.every((k) => k.tagName === firstTag);
    if (!same) continue;
    // Skip navigation lists — those are handled by "Menu Items".
    if (el.tagName === "UL" || el.tagName === "OL") continue;
    // Prefer containers that look like grids/columns/space-y or where
    // children are non-inline blocks.
    const cls = el.getAttribute("class") ?? "";
    let score = kids.length;
    if (/grid|columns-|space-y|flex/.test(cls)) score += 10;
    if (firstTag === "DETAILS" || firstTag === "ARTICLE") score += 20;
    if (!best || score > best.score) best = { el, count: kids.length, score };
  }
  if (!best) return null;
  return { container: best.el, path: pathTo(best.el, doc.body) };
}

function describeItem(item: Element): RepeaterItem {
  const img = item.querySelector("img");
  const box = !img
    ? (Array.from(item.querySelectorAll<HTMLElement>("*")).find((e) =>
        /bg-gradient/.test(e.className),
      ) ?? null)
    : null;
  const heading = item.querySelector("h1,h2,h3,h4,h5,h6,summary,strong,.font-bold");
  const bodyEl = item.querySelector("p");
  const link = item.querySelector("a");
  return {
    image: img?.getAttribute("src") ?? "",
    title: (heading?.textContent ?? "").replace(/\s+/g, " ").trim(),
    body: (bodyEl?.textContent ?? "").replace(/\s+/g, " ").trim(),
    href: link?.getAttribute("href") ?? "",
    hasTitle: !!heading,
    hasBody: !!bodyEl,
    hasLink: !!link,
    // Track box for image swap logic (not returned in type but used indirectly).
    ...(box ? {} : {}),
  };
}

function getRepeater(html: string) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const info = findRepeater(doc);
  if (!info) return null;
  const items = Array.from(info.container.children).map((c) => describeItem(c));
  return { path: info.path, items };
}

function withRepeater(
  html: string,
  fn: (doc: Document, container: Element) => void,
): string {
  const doc = parseHtml(html);
  if (!doc) return html;
  const info = findRepeater(doc);
  if (!info) return html;
  const container = nodeAtPath(doc.body, info.path);
  if (!container) return html;
  fn(doc, container);
  return serialize(doc);
}

function setRepeaterItemImage(html: string, index: number, src: string) {
  return withRepeater(html, (doc, container) => {
    const item = container.children[index];
    if (!item) return;
    const existing = item.querySelector("img");
    if (existing) {
      if (src) existing.setAttribute("src", src);
      else existing.remove();
      return;
    }
    // Find first gradient/decorative box and convert it to an <img>.
    const box = Array.from(item.querySelectorAll<HTMLElement>("*")).find((e) =>
      /bg-gradient|aspect-/.test(e.className),
    );
    const target: Element = box ?? item;
    if (!src) return;
    const img = doc.createElement("img");
    const cls = (target.getAttribute("class") ?? "")
      .split(/\s+/)
      .filter(
        (c) =>
          !/^bg-gradient/.test(c) &&
          !/^from-/.test(c) &&
          !/^via-/.test(c) &&
          !/^to-/.test(c),
      )
      .join(" ");
    img.setAttribute("class", (cls + " object-cover w-full h-full").trim());
    img.setAttribute("src", src);
    img.setAttribute("alt", "");
    const wrapper = doc.createElement("div");
    wrapper.setAttribute("class", target.getAttribute("class") ?? "");
    wrapper.setAttribute("style", "overflow:hidden");
    wrapper.appendChild(img);
    target.replaceWith(wrapper);
  });
}

function setRepeaterItemField(
  html: string,
  index: number,
  field: "title" | "body" | "href",
  value: string,
) {
  return withRepeater(html, (_doc, container) => {
    const item = container.children[index];
    if (!item) return;
    if (field === "title") {
      const el = item.querySelector("h1,h2,h3,h4,h5,h6,summary,strong,.font-bold");
      if (el) el.textContent = value;
    } else if (field === "body") {
      const el = item.querySelector("p");
      if (el) el.textContent = value;
    } else if (field === "href") {
      const el = item.querySelector("a");
      if (el) el.setAttribute("href", value || "#");
    }
  });
}

function duplicateRepeaterItem(html: string, index: number) {
  return withRepeater(html, (_doc, container) => {
    const item = container.children[index];
    if (!item) return;
    const clone = item.cloneNode(true) as Element;
    if (item.nextSibling) container.insertBefore(clone, item.nextSibling);
    else container.appendChild(clone);
  });
}

function removeRepeaterItem(html: string, index: number) {
  return withRepeater(html, (_doc, container) => {
    if (container.children.length <= 1) return;
    const item = container.children[index];
    if (item) item.remove();
  });
}

function addRepeaterItem(html: string) {
  return withRepeater(html, (_doc, container) => {
    const last = container.children[container.children.length - 1];
    if (!last) return;
    const clone = last.cloneNode(true) as Element;
    container.appendChild(clone);
  });
}
