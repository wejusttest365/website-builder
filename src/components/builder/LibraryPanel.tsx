import { useMemo, useState } from "react";
import { SECTION_LIBRARY, CATEGORIES, type SectionTemplate } from "@/lib/builder/sections";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { Search, Plus, Copy, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { TEMPLATE_CATEGORIES, TEMPLATE_LIBRARY, type TemplateDefinition } from "@/lib/builder/templates";

export function LibraryPanel() {
  const [q, setQ] = useState("");
  const [activeTab, setActiveTab] = useState<"sections" | "templates">("sections");
  const mounted = useMounted();
  const [templateCategory, setTemplateCategory] = useState<string>("All");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() => ({
    Hero: true,
    Navigation: true,
    Features: true,
    Carousel: true,
  }));
  const addSection = useBuilder((s) => s.addSection);
  const applyTemplate = useBuilder((s) => s.applyTemplate);
  const leftPanelOpen = useBuilder((s) => s.leftPanelOpen);
  const toggleLeftPanel = useBuilder((s) => s.toggleLeftPanel);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SECTION_LIBRARY;
    return SECTION_LIBRARY.filter(
      (s) => s.name.toLowerCase().includes(t) || s.category.toLowerCase().includes(t),
    );
  }, [q]);

  const grouped = useMemo(() => {
    const map = new Map<string, SectionTemplate[]>();
    for (const s of filtered) {
      if (!map.has(s.category)) map.set(s.category, []);
      map.get(s.category)!.push(s);
    }
    return CATEGORIES.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [filtered]);

  const filteredTemplates = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TEMPLATE_LIBRARY.filter((tpl) => {
      const matchesCategory = templateCategory === "All" || tpl.category === templateCategory;
      const matchesSearch = !t || [tpl.name, tpl.description, tpl.category].join(" ").toLowerCase().includes(t);
      return matchesCategory && matchesSearch;
    });
  }, [q, templateCategory]);

  if (!mounted) {
    return (
      <div className="flex h-full flex-col bg-card">
        <div className="p-3 border-b border-border">
          <div className="h-9 rounded-lg bg-muted" />
        </div>
        <div className="flex gap-2 border-b border-border px-2 py-2">
          <div className="h-9 flex-1 rounded-lg bg-muted" />
          <div className="h-9 flex-1 rounded-lg bg-muted" />
        </div>
        <div className="flex-1 space-y-2 p-2">
          <div className="h-16 rounded-xl bg-muted" />
          <div className="h-16 rounded-xl bg-muted" />
        </div>
      </div>
    );
  }

  if (!leftPanelOpen) {
    return (
      <div className="h-full bg-card flex items-center justify-center">
        <button className="p-2 rounded hover:bg-accent" title="Open library" onClick={() => toggleLeftPanel()}>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card group">
      <div className="p-3 border-b border-border relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={activeTab === "templates" ? "Search templates…" : "Search sections…"}
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button
          className="absolute right-2 top-2.5 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-slate-500 shadow-sm opacity-0 transition duration-200 hover:bg-accent hover:text-white group-hover:opacity-100"
          title="Collapse"
          onClick={() => toggleLeftPanel()}
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
      <div className="flex items-center gap-2 border-b border-border px-2 py-2">
        <button
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "sections" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setActiveTab("sections")}
        >
          Sections
        </button>
        <button
          className={`flex-1 rounded-lg px-3 py-2 text-sm font-medium ${activeTab === "templates" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}
          onClick={() => setActiveTab("templates")}
        >
          Templates
        </button>
      </div>
      {activeTab === "sections" ? (
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {grouped.length === 0 && (
            <div className="p-6 text-center text-sm text-muted-foreground">No sections match.</div>
          )}
          {grouped.map(([cat, items]) => {
            const open = q.trim() ? true : openCats[cat] ?? false;
            return (
              <div key={cat} className="rounded-lg">
                <button
                  onClick={() => setOpenCats((s) => ({ ...s, [cat]: !open }))}
                  className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground"
                >
                  {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                  <span>{cat}</span>
                  <span className="ml-auto text-[10px] font-normal opacity-60">{items.length}</span>
                </button>
                {open && (
                  <div className="mt-1 space-y-2 pb-2">
                    {items.map((tpl) => (
                      <SectionCard key={tpl.id} tpl={tpl} onAdd={() => addSection(tpl)} />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto p-3 space-y-3">
          <div className="flex flex-wrap gap-2">
            <button className={`rounded-full px-3 py-1.5 text-xs font-medium ${templateCategory === "All" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} onClick={() => setTemplateCategory("All")}>All</button>
            {TEMPLATE_CATEGORIES.map((cat) => (
              <button key={cat} className={`rounded-full px-3 py-1.5 text-xs font-medium ${templateCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`} onClick={() => setTemplateCategory(cat)}>{cat}</button>
            ))}
          </div>
          {filteredTemplates.map((tpl) => (
            <TemplateCard key={tpl.id} tpl={tpl} onUse={() => applyTemplate(tpl)} />
          ))}
          {filteredTemplates.length === 0 && <div className="rounded-xl border border-dashed border-border p-6 text-center text-sm text-muted-foreground">No templates match your search.</div>}
        </div>
      )}
    </div>
  );
}

function TemplateCard({ tpl, onUse }: { tpl: TemplateDefinition; onUse: () => void }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const mounted = useMounted();
  return (
    <>
      <div className="group overflow-hidden rounded-2xl border border-border bg-background shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
        <div className="relative h-36 overflow-hidden">
          <img src={tpl.thumbnail} alt={tpl.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
          <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
            {tpl.category}
          </div>
        </div>
        <div className="p-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <div className="text-sm font-semibold text-foreground">{tpl.name}</div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{tpl.description}</p>
            </div>
          </div>
          <div className="mt-4 flex gap-2">
            <button className="flex-1 rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-accent" onClick={() => setPreviewOpen(true)}>
              Preview
            </button>
            <button className="flex-1 rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90" onClick={() => { onUse(); toast.success(`${tpl.name} loaded into the canvas`); }}>
              Use Template
            </button>
          </div>
        </div>
      </div>
      {previewOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4" onClick={() => setPreviewOpen(false)}>
          <div className="flex h-[85vh] w-full max-w-5xl flex-col overflow-hidden rounded-3xl bg-white" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3 text-slate-900">
              <div>
                <div className="text-sm font-semibold">{tpl.name}</div>
                <div className="text-xs text-slate-500">{tpl.description}</div>
              </div>
              <div className="flex gap-2">
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold" onClick={() => { onUse(); setPreviewOpen(false); toast.success(`${tpl.name} loaded into the canvas`); }}>Use Template</button>
                <button className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold" onClick={() => setPreviewOpen(false)}>Close</button>
              </div>
            </div>
            {mounted ? (
              <iframe title={tpl.name} className="flex-1" srcDoc={`<!DOCTYPE html><html><head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /><script src="https://cdn.tailwindcss.com"></script></head><body>${tpl.sections.map((s) => s.html).join('')}</body></html>`} />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}

function SectionCard({ tpl, onAdd }: { tpl: SectionTemplate; onAdd: () => void }) {
  const [previewOpen, setPreviewOpen] = useState(false);
  const mounted = useMounted();
  return (
    <>
      <div
        className="group rounded-xl border border-border bg-background hover:border-primary/50 hover:shadow-md transition overflow-hidden cursor-grab"
        draggable
        onDragStart={(e) => {
          e.dataTransfer.setData("application/x-wto-section", tpl.id);
          e.dataTransfer.setData("text/plain", tpl.id);
          e.dataTransfer.effectAllowed = "copy";
          window.dispatchEvent(new CustomEvent("wto-library-drag-start", { detail: tpl.id }));
        }}
        onDragEnd={() => window.dispatchEvent(new CustomEvent("wto-library-drag-end"))}
        onDoubleClick={onAdd}
      >
        <div
          className="h-16 flex items-center justify-center text-white text-[10px] font-bold tracking-wider"
          style={{ background: tpl.thumbBg }}
        >
          {tpl.category.toUpperCase()}
        </div>
        <div className="px-2.5 py-2 flex items-center gap-1">
          <div className="text-xs font-medium truncate flex-1">{tpl.name}</div>
          <button
            className="p-1 rounded hover:bg-accent"
            title="Add to canvas"
            onClick={onAdd}
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded hover:bg-accent"
            title="Copy HTML"
            onClick={async () => {
              await navigator.clipboard.writeText(tpl.html);
              toast.success("HTML copied");
            }}
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            className="p-1 rounded hover:bg-accent"
            title="Preview"
            onClick={() => setPreviewOpen(true)}
          >
            <Eye className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
      {previewOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-8"
          onClick={() => setPreviewOpen(false)}
        >
          <div
            className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b flex items-center justify-between text-black">
              <div className="font-semibold text-sm">{tpl.name}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-1.5 text-xs rounded-lg bg-primary text-primary-foreground"
                  onClick={() => {
                    onAdd();
                    setPreviewOpen(false);
                  }}
                >
                  Add to canvas
                </button>
                <button
                  className="px-3 py-1.5 text-xs rounded-lg border"
                  onClick={() => setPreviewOpen(false)}
                >
                  Close
                </button>
              </div>
            </div>
            {mounted ? (
              <iframe
                className="flex-1"
                title={tpl.name}
                srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${tpl.html}</body></html>`}
              />
            ) : null}
          </div>
        </div>
      )}
    </>
  );
}
