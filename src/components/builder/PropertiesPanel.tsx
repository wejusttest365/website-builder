import { useBuilder, pageOf } from "@/lib/builder/store";
import { nanoid } from "nanoid";
import { Plus, Trash2, Copy, Eye, EyeOff } from "lucide-react";
import type { ReactNode } from "react";

export function PropertiesPanel() {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const updateSection = useBuilder((s) => s.updateSection);
  const pushHistory = useBuilder((s) => s.pushHistory);
  const addAsset = useBuilder((s) => s.addAsset);

  const section = (pageOf(project)?.sections ?? []).find((s: any) => s.id === selectedId) ?? null;

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
  const isAccordion = !!repeater && isAccordionSection(section.html);
  const footerCols = isFooter ? getFooterColumns(section.html) : [];
  const assets = project?.assets;
  const backgroundImage = (style["background-image"] ?? "")
    .replace(/^url\(|\)$/g, "")
    .replace(/^['"]|['"]$/g, "");

  function normalizeAssetPath(path?: string) {
    return String(path || "")
      .replace(/^url\((['"]?)/, "")
      .replace(/['"]?\)$/, "")
      .replace(/^['"]|['"]$/g, "");
  }

  function resolveAssetSrc(path?: string) {
    const normalizedPath = normalizeAssetPath(path);
    if (/^images\//.test(normalizedPath)) {
      const filename = normalizedPath.replace(/^images\//, "");
      return project?.assets?.[filename] ?? normalizedPath;
    }
    return normalizedPath;
  }

  function downloadAssetByPath(path?: string) {
    if (!path || !project?.assets) return;
    const normalizedPath = normalizeAssetPath(path);
    const m = /images\/([^"'\/\s]+)$/.exec(normalizedPath);
    if (!m) return;
    const filename = m[1];
    const dataUrl = project.assets?.[filename];
    if (!dataUrl) return;
    try {
      const parts = dataUrl.split(',');
      const meta = parts[0];
      const b64 = parts[1];
      const mime = meta.match(/data:([^;]+);/)?.[1] || 'application/octet-stream';
      const byteChars = atob(b64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const u8 = new Uint8Array(byteNumbers);
      const blob = new Blob([u8], { type: mime });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
    }
  }

  const set = (k: string, v: string) => {
    const next = { ...style };
    if (v) next[k] = v;
    else delete next[k];
    updateSection(section.id, { style: next });
    // If changing header background, auto-apply a contrasting link color if forcing enabled
    if (k === "background-color" && (section as any).shared === "header") {
      const force = getNavForceFlag(section.html);
      if (force) {
        const color = v ? contrastColorForHex(v) : "";
        const nextHtml = setNavForeground(section.html, color);
        updateHtml(nextHtml);
      }
    }
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
        {/* Brand / Logo controls moved into scrollable area so it scrolls with the panel */}
        {(() => {
          const brand = findBrandAnchor(section.html);
          if (!brand) return null;
          const brandMode = brand.mode || (brand.src ? "logo" : brand.text ? "text" : "hidden");
          return (
            <div className="mt-0">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Brand / Logo</div>
              <div className="mt-2 space-y-3">
                <Field label="Display">
                  <select
                    className={inputCls}
                    value={brandMode}
                    onChange={(e) => {
                      const mode = e.target.value as "logo" | "text" | "hidden";
                      if (mode === "text") {
                        updateHtml(setBrandMode(section.html, "text", brand.text || "Brand"));
                      } else if (mode === "logo") {
                        updateHtml(setBrandMode(section.html, "logo", brand.text || "Brand"));
                      } else {
                        updateHtml(setBrandMode(section.html, "hidden", brand.text || "Brand"));
                      }
                      pushHistory();
                    }}
                    onBlur={pushHistory}
                  >
                    <option value="logo">Logo</option>
                    <option value="text">Text</option>
                    <option value="hidden">Hidden</option>
                  </select>
                </Field>

                <Field label="Brand text">
                  <input
                    className={inputCls}
                    value={brand.text}
                    placeholder="Brand name"
                    onChange={(e) => updateHtml(setBrandText(section.html, e.target.value))}
                    onBlur={pushHistory}
                  />
                </Field>

                {brandMode === "logo" ? (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="h-12 w-32 overflow-hidden rounded-md border border-input bg-background flex items-center justify-center">
                        {brand.src ? (
                          <img src={resolveAssetSrc(brand.src)} alt="logo" className="max-h-full max-w-full object-contain" />
                        ) : (
                          <span className="text-xs text-muted-foreground">No logo</span>
                        )}
                      </div>
                      {brand.src && /^images\//.test(normalizeAssetPath(brand.src)) && (
                        <button className="px-2 py-1 rounded-md border border-input text-xs" onClick={() => downloadAssetByPath(brand.src)}>
                          Download
                        </button>
                      )}
                    </div>
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
                          updateHtml(setBrandImage(section.html, path));
                          pushHistory();
                        };
                        r.readAsDataURL(f);
                      }}
                    />
                  </div>
                ) : null}

                <div className="grid grid-cols-2 gap-2">
                  <input
                    className={inputCls}
                    placeholder="Width (e.g. 120px)"
                    defaultValue={brand.width}
                    onBlur={(e) => { updateHtml(setBrandSize(section.html, e.target.value, brand.height)); pushHistory(); }}
                  />
                  <input
                    className={inputCls}
                    placeholder="Height (e.g. 40px)"
                    defaultValue={brand.height}
                    onBlur={(e) => { updateHtml(setBrandSize(section.html, brand.width, e.target.value)); pushHistory(); }}
                  />
                </div>
                {(() => {
                  const ctas = findHeaderCTAs(section.html);
                  const cta = ctas[0] ?? null;
                  if (!cta) return null;
                  return (
                    <div className="mt-2 space-y-2">
                      <Field label="CTA text">
                        <input
                          className={inputCls}
                          value={cta.text}
                          onChange={(e) => updateHtml(setHeaderCTAHref(section.html, cta.href || "#", e.target.value))}
                          onBlur={pushHistory}
                        />
                      </Field>
                      <Field label="CTA link">
                        <input
                          className={inputCls}
                          value={cta.href}
                          placeholder="#"
                          onChange={(e) => updateHtml(setHeaderCTAHref(section.html, e.target.value, cta.text))}
                          onBlur={pushHistory}
                        />
                      </Field>
                    </div>
                  );
                })()}
              </div>
            </div>
          );
        })()}

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
                  {!isAccordion && (
                    <>
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
                      {it.image && /^images\//.test(it.image) && (
                        <div className="text-right">
                          <button className="mt-1 px-3 py-1 rounded-md border border-input text-xs" onClick={() => downloadAssetByPath(it.image)}>
                            Download
                          </button>
                        </div>
                      )}
                    </>
                  )}
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
                  {it.hasLink && !isAccordion && (
                    <input
                      className={inputCls}
                      placeholder="Link URL"
                      value={it.href}
                      onChange={(e) => updateHtml(setRepeaterItemField(section.html, i, "href", e.target.value))}
                      onBlur={pushHistory}
                    />
                  )}
                  {it.hasLink && !isAccordion && (
                    <div className="flex items-center gap-2">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          checked={it.href?.length > 0 && hasRepeaterTarget(section.html, i)}
                          onChange={(e) => updateHtml(setRepeaterItemTarget(section.html, i, e.target.checked))}
                        />
                        <span className="text-xs">Open in new tab</span>
                      </label>
                    </div>
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
                <div key={index} className="grid grid-cols-[1fr_1fr_auto_auto] items-center gap-1.5">
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
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent"
                    title={item.hidden ? "Show element" : "Hide element"}
                    onClick={() => {
                      updateHtml(toggleLinkVisibility(section.html, index));
                      pushHistory();
                    }}
                  >
                    {item.hidden ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-input bg-background text-muted-foreground hover:bg-accent"
                    title="Delete link"
                    onClick={() => {
                      updateHtml(removeLinkItem(section.html, index));
                      pushHistory();
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
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
          {backgroundImage && /^images\//.test(backgroundImage) && (
            <Field label="Download">
              <button
                type="button"
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-xs"
                onClick={() => downloadAssetByPath(backgroundImage)}
              >
                Download
              </button>
            </Field>
          )}
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
        <Group title="Animation">
          <Field label="Type">
            <select
              className={inputCls}
              value={section.animation?.type ?? ""}
              onChange={(e) => updateSection(section.id, { animation: { ...(section.animation ?? {}), type: e.target.value } })}
              onBlur={pushHistory}
            >
              <option value="">None</option>
              <option value="fade-in">Fade in</option>
              <option value="fade-up">Fade up</option>
              <option value="fade-down">Fade down</option>
              <option value="slide-left">Slide left</option>
              <option value="slide-right">Slide right</option>
              <option value="zoom-in">Zoom in</option>
              <option value="zoom-out">Zoom out</option>
              <option value="flip">Flip</option>
              <option value="bounce">Bounce</option>
            </select>
          </Field>
          <Field label="Duration">
            <input className={inputCls} value={String(section.animation?.duration ?? "")} onChange={(e) => updateSection(section.id, { animation: { ...(section.animation ?? {}), duration: Number(e.target.value) || undefined } })} onBlur={pushHistory} placeholder="ms" />
          </Field>
          <Field label="Delay">
            <input className={inputCls} value={String(section.animation?.delay ?? "")} onChange={(e) => updateSection(section.id, { animation: { ...(section.animation ?? {}), delay: Number(e.target.value) || undefined } })} onBlur={pushHistory} placeholder="ms" />
          </Field>
          <Field label="Repeat">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!section.animation?.repeat} onChange={(e) => updateSection(section.id, { animation: { ...(section.animation ?? {}), repeat: e.target.checked } })} onBlur={pushHistory} />
              <span className="text-xs">Repeat animation</span>
            </label>
          </Field>
        </Group>

        <Group title="Visibility">
          <Field label="Hide on mobile">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!(section as any).hiddenMobile} onChange={(e) => updateSection(section.id, { ...(section as any), hiddenMobile: e.target.checked })} onBlur={pushHistory} />
              <span className="text-xs">Hide on mobile</span>
            </label>
          </Field>
          <Field label="Hide on tablet">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!(section as any).hiddenTablet} onChange={(e) => updateSection(section.id, { ...(section as any), hiddenTablet: e.target.checked })} onBlur={pushHistory} />
              <span className="text-xs">Hide on tablet</span>
            </label>
          </Field>
          <Field label="Hide on desktop">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!(section as any).hiddenDesktop} onChange={(e) => updateSection(section.id, { ...(section as any), hiddenDesktop: e.target.checked })} onBlur={pushHistory} />
              <span className="text-xs">Hide on desktop</span>
            </label>
          </Field>
          <Field label="Sticky">
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={!!section.sticky} onChange={(e) => updateSection(section.id, { sticky: e.target.checked })} onBlur={pushHistory} />
              <span className="text-xs">Sticky navigation</span>
            </label>
          </Field>
        </Group>

        {isFooter && (
          <Group title="Footer Copyright">
            <Field label="Text">
              <input className={inputCls} value={getFooterCopyright(section.html)} onChange={(e) => updateHtml(setFooterCopyright(section.html, e.target.value))} onBlur={pushHistory} />
            </Field>
            <Field label="Color">
              <ColorInput value={getFooterCopyrightColor(section.html)} onChange={(v) => updateHtml(setFooterCopyrightColor(section.html, v))} onBlur={pushHistory} />
            </Field>
            <Field label="Font size">
              <input className={inputCls} value={getFooterCopyrightFontSize(section.html)} onChange={(e) => updateHtml(setFooterCopyrightFontSize(section.html, e.target.value))} onBlur={pushHistory} placeholder="e.g. 12px" />
            </Field>
          </Group>
        )}

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

// --- Helpers and DOM manipulation functions ---

const textSelector = "h1,h2,h3,h4,h5,h6,p,a,button,summary";
const menuSelector = "nav ul li a, ul li a";

function parseHtml(html: string) {
  if (typeof DOMParser === "undefined") return null;
  return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
}

function serialize(doc: Document) {
  return doc.body.innerHTML;
}

function ensureSummaryChevron(el: HTMLElement) {
  if (el.tagName !== 'SUMMARY') return;
  if (el.querySelector('.wto-chevron')) return;
  const span = document.createElement('span');
  span.className = 'wto-chevron';
  span.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg>';
  el.appendChild(span);
}

function isAccordionSection(html: string) {
  const doc = parseHtml(html);
  if (!doc) return false;
  return !!doc.body.querySelector('details');
}

function contrastColorForHex(hex: string) {
  const h = String(hex || "").trim().replace(/^#/, "");
  let r = 0,
    g = 0,
    b = 0;
  if (h.length === 3) {
    r = parseInt(h[0] + h[0], 16);
    g = parseInt(h[1] + h[1], 16);
    b = parseInt(h[2] + h[2], 16);
  } else if (h.length >= 6) {
    r = parseInt(h.slice(0, 2), 16);
    g = parseInt(h.slice(2, 4), 16);
    b = parseInt(h.slice(4, 6), 16);
  }
  const srgb = [r, g, b].map((c) => c / 255).map((c) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)));
  const lum = 0.2126 * srgb[0] + 0.7152 * srgb[1] + 0.0722 * srgb[2];
  return lum > 0.5 ? "#000000" : "#ffffff";
}

function setStyleColor(styleStr: string | null, color: string) {
  const s = styleStr || "";
  if (!color) {
    return s.replace(/(^|;)\s*color\s*:\s*[^;]+;?/i, "").trim();
  }
  const important = `${color} !important`;
  if (/color\s*:/i.test(s)) {
    return s.replace(/color\s*:\s*[^;]+;?/i, `color:${important};`);
  }
  return (s && !s.trim().endsWith(";") ? s + ";" : s) + `color:${important};`;
}

function setNavForeground(html: string, color: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  if (!nav) return html;
  const navStyle = nav.getAttribute("style") ?? "";
  // keep nav-level color inline (non-important) for non-anchor text
  nav.setAttribute("style", setStyleColor(navStyle, color));

  if (!nav.hasAttribute('data-wto-nav')) {
    nav.setAttribute('data-wto-nav', 'true');
  }

  // Inject or update a scoped <style data-wto-nav-style> inside the nav
  const existing = nav.querySelector('style[data-wto-nav-style]');
  const css = color ? `[data-wto-nav] a, [data-wto-nav] button { color: ${color} !important; }` : "";
  if (existing) {
    if (css) existing.textContent = css;
    else existing.remove();
  } else if (css) {
    const styleEl = doc.createElement('style');
    styleEl.setAttribute('data-wto-nav-style', 'true');
    styleEl.textContent = css;
    nav.insertBefore(styleEl, nav.firstChild);
  }

  return serialize(doc);
}

function getNavForceFlag(html: string) {
  const doc = parseHtml(html);
  if (!doc) return true;
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  if (!nav) return true;
  return nav.getAttribute('data-wto-force-menu') !== '0';
}

function setNavForce(html: string, enabled: boolean, color?: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  if (!nav) return html;
  if (!nav.hasAttribute('data-wto-nav')) {
    nav.setAttribute('data-wto-nav', 'true');
  }
  if (enabled) nav.setAttribute('data-wto-force-menu', '1');
  else nav.removeAttribute('data-wto-force-menu');
  // Apply or remove injected style depending on enabled
  const existing = nav.querySelector('style[data-wto-nav-style]');
  const css = enabled && color ? `[data-wto-nav] a, [data-wto-nav] button { color: ${color} !important; }` : enabled && !color ? existing?.textContent || '' : '';
  if (!enabled) {
    if (existing) existing.remove();
  } else if (color) {
    if (existing) existing.textContent = css;
    else {
      const styleEl = doc.createElement('style');
      styleEl.setAttribute('data-wto-nav-style', 'true');
      styleEl.textContent = css;
      nav.insertBefore(styleEl, nav.firstChild);
    }
  }
  return serialize(doc);
}

// ------------------------ Brand helpers ------------------------

function findBrandAnchor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return null;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return null;
  const anchors = Array.from(nav.querySelectorAll('a'));
  // brand anchor is an anchor that's not inside a list
  const brand = anchors.find((a) => !a.closest('ul') && !a.closest('li')) ?? null;
  if (!brand) return null;
  const img = brand.querySelector('img');
  const text = (brand.textContent ?? '').trim();
  const width = img?.getAttribute('width') ?? img?.style.width ?? '';
  const height = img?.getAttribute('height') ?? img?.style.height ?? '';
  return { src: img?.getAttribute('src') ?? '', text, width, height, mode: img ? 'logo' : text ? 'text' : 'hidden' };
}

function setBrandMode(html: string, mode: 'logo' | 'text' | 'hidden', text?: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return html;
  const anchors = Array.from(nav.querySelectorAll('a'));
  const brand = anchors.find((a) => !a.closest('ul') && !a.closest('li')) ?? null;
  if (!brand) return html;
  if (mode === 'hidden') {
    brand.setAttribute('style', (brand.getAttribute('style') || '') + ';display:none');
    brand.textContent = '';
    const img = brand.querySelector('img'); if (img) img.remove();
  } else if (mode === 'text') {
    brand.removeAttribute('style');
    const img = brand.querySelector('img'); if (img) img.remove();
    brand.textContent = text || 'Brand';
  } else {
    brand.removeAttribute('style');
    brand.textContent = '';
    let img = brand.querySelector('img');
    if (!img) {
      img = doc.createElement('img');
      img.setAttribute('alt', text || 'logo');
      img.setAttribute('style', 'height:40px;width:auto;object-fit:contain;');
      brand.appendChild(img);
    }
  }
  return serialize(doc);
}

function setBrandText(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return html;
  const anchors = Array.from(nav.querySelectorAll('a'));
  const brand = anchors.find((a) => !a.closest('ul') && !a.closest('li')) ?? null;
  if (!brand) return html;
  const img = brand.querySelector('img');
  if (img) {
    img.setAttribute('alt', text);
  } else {
    brand.textContent = text;
  }
  return serialize(doc);
}

function setBrandImage(html: string, path: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return html;
  const anchors = Array.from(nav.querySelectorAll('a'));
  const brand = anchors.find((a) => !a.closest('ul') && !a.closest('li')) ?? null;
  if (!brand) return html;
  brand.textContent = '';
  let img = brand.querySelector('img');
  if (!img) {
    img = doc.createElement('img');
    img.setAttribute('alt', 'logo');
    img.setAttribute('style', 'height:40px;width:auto;object-fit:contain;');
    brand.appendChild(img);
  }
  img.setAttribute('src', path);
  return serialize(doc);
}

function setBrandSize(html: string, width?: string, height?: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return html;
  const anchors = Array.from(nav.querySelectorAll('a'));
  const brand = anchors.find((a) => !a.closest('ul') && !a.closest('li')) ?? null;
  if (!brand) return html;
  const img = brand.querySelector('img');
  if (!img) return html;
  if (width) img.setAttribute('width', width);
  else img.removeAttribute('width');
  if (height) img.setAttribute('height', height);
  else img.removeAttribute('height');
  // prefer inline style for non-numeric sizes
  const style = img.getAttribute('style') || '';
  const newStyle = style.replace(/(width|height)\s*:\s*[^;]+;?/g, '').trim();
  img.setAttribute('style', `${newStyle}${width ? `;width:${width}` : ''}${height ? `;height:${height}` : ''}`);
  return serialize(doc);
}

function findHeaderCTAs(html: string) {
  const doc = parseHtml(html);
  if (!doc) return [];
  const nav = doc.body.querySelector('nav') ?? doc.body.querySelector('[data-wto-nav]');
  if (!nav) return [];
  const anchors = Array.from(nav.querySelectorAll('a')).filter((a) => !a.closest('ul') && !a.closest('li'));
  // exclude brand anchor if present
  const brand = anchors[0];
  const ctas = anchors.slice(1).map((a) => ({ text: (a.textContent ?? '').trim(), href: a.getAttribute('href') ?? '#' }));
  return ctas;
}

function getEditableTextItems(html: string) {
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
  if (!el) return serialize(doc);

  const textNodes = Array.from(el.childNodes).filter((node) => node.nodeType === Node.TEXT_NODE) as Text[];
  if (textNodes.length > 0) {
    textNodes[0].textContent = text;
    for (let i = 1; i < textNodes.length; i++) {
      textNodes[i].remove();
    }
  } else {
    const textNode = doc.createTextNode(text);
    const firstNonText = Array.from(el.childNodes).find((node) => node.nodeType !== Node.TEXT_NODE);
    if (firstNonText) el.insertBefore(textNode, firstNonText);
    else el.appendChild(textNode);
  }

  ensureSummaryChevron(el);
  return serialize(doc);
}

function getMenuItems(html: string): { text: string; href: string }[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLAnchorElement>(menuSelector)).map((el) => ({
    text: (el.textContent ?? "").trim(),
    href: el.getAttribute("href") ?? "#",
  }));
}

function updateMenuItem(html: string, index: number, patch: Partial<{ text: string; href: string }>) {
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

function isContentLinkOrButton(el: HTMLElement) {
  return true;
}

function getLinkItems(html: string): { text: string; href: string; hidden: boolean }[] {
  const doc = parseHtml(html);
  if (!doc) return [];
  return Array.from(doc.body.querySelectorAll<HTMLElement>("a, button"))
    .map((el) => {
      const style = el.getAttribute("style") ?? "";
      const hidden = el.getAttribute("data-wto-hidden") === "1" || /display\s*:\s*none/i.test(style);
      return {
        text: (el.textContent ?? "").replace(/\s+/g, " ").trim(),
        href:
          el.tagName === "A"
            ? el.getAttribute("href") ?? "#"
            : el.getAttribute("data-href") ?? "",
        hidden,
      };
    });
}

function updateLinkItem(html: string, index: number, patch: Partial<{ text: string; href: string }>) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  if (patch.text !== undefined) el.textContent = patch.text;
  if (patch.href !== undefined) {
    if (el.tagName === "A") el.setAttribute("href", patch.href || "#");
    else el.setAttribute("data-href", patch.href);
  }
  return serialize(doc);
}

function removeLinkItem(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  el.remove();
  return serialize(doc);
}

function toggleLinkVisibility(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const items = Array.from(doc.body.querySelectorAll<HTMLElement>("a, button")).filter(isContentLinkOrButton);
  const el = items[index];
  if (!el) return html;
  const current = el.getAttribute("data-wto-hidden") === "1";
  if (current) {
    el.removeAttribute("data-wto-hidden");
    el.style.display = "";
  } else {
    el.setAttribute("data-wto-hidden", "1");
    el.style.display = "none";
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

function findRepeater(doc: Document): { container: Element; path: number[] } | null {
  const all = Array.from(doc.body.querySelectorAll("*"));
  let best: { el: Element; count: number; score: number } | null = null;
  for (const el of all) {
    const kids = Array.from(el.children);
    if (kids.length < 2) continue;
    const firstTag = kids[0].tagName;
    const same = kids.every((k) => k.tagName === firstTag);
    if (!same) continue;
    if (el.tagName === "UL" || el.tagName === "OL") continue;
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
          !/^to-/.test(c) &&
          !/^bg-\[/.test(c),
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
      if (el) {
        el.textContent = value;
        ensureSummaryChevron(el as HTMLElement);
      }
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

// Footer helpers omitted for brevity — keep the ones we used earlier

function hasRepeaterTarget(html: string, index: number) {
  const doc = parseHtml(html);
  if (!doc) return false;
  const info = findRepeater(doc);
  if (!info) return false;
  const container = nodeAtPath(doc.body, info.path);
  if (!container) return false;
  const item = container.children[index];
  if (!item) return false;
  const a = item.querySelector('a');
  return !!(a && a.getAttribute('target') === '_blank');
}

function setRepeaterItemTarget(html: string, index: number, openInNewTab: boolean) {
  return withRepeater(html, (doc, container) => {
    const item = container.children[index];
    if (!item) return;
    const a = item.querySelector('a');
    if (!a) return;
    if (openInNewTab) a.setAttribute('target', '_blank');
    else a.removeAttribute('target');
  });
}

function getFooterCopyright(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => /©/.test(n.textContent || '')) as HTMLElement | undefined;
  return el ? (el.textContent || '').trim() : '';
}

function setFooterCopyright(html: string, text: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => /©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('class', 'border-t border-gray-800 py-6 text-center text-xs');
    footer.appendChild(el);
  }
  el.textContent = text;
  return serialize(doc);
}

function getFooterCopyrightColor(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '#000000';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => /©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) return '#000000';
  const color = el.getAttribute('style')?.match(/color:\s*([^;]+)/)?.[1];
  return color || '#000000';
}

function setFooterCopyrightColor(html: string, color: string) {
  const doc = parseHtml(html);
  if (!doc) return html;
  const footer = doc.body.querySelector('footer');
  if (!footer) return html;
  let el = Array.from(footer.querySelectorAll('*')).find((n) => /©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) {
    el = doc.createElement('div');
    el.setAttribute('class', 'border-t border-gray-800 py-6 text-center text-xs');
    footer.appendChild(el);
  }
  const style = el.getAttribute('style') || '';
  el.setAttribute('style', `${style};color:${color}`);
  return serialize(doc);
}

function getFooterCopyrightFontSize(html: string) {
  const doc = parseHtml(html);
  if (!doc) return '';
  const el = Array.from(doc.body.querySelectorAll('footer *')).find((n) => /©/.test(n.textContent || '')) as HTMLElement | undefined;
  if (!el) return '';
  const size = el.getAttribute('style')?.match(/font-size:\s*([^;]+)/)?.[1];
  return size || '';
}

export default PropertiesPanel;
