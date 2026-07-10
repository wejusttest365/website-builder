import { useMemo, useState } from "react";
import { SECTION_LIBRARY, CATEGORIES, type SectionTemplate } from "@/lib/builder/sections";
import { useBuilder } from "@/lib/builder/store";
import { Search, Plus, Copy, Eye, ChevronDown, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";

export function LibraryPanel() {
  const [q, setQ] = useState("");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() => ({
    Hero: true,
    Navigation: true,
    Features: true,
    Carousel: true,
  }));
  const addSection = useBuilder((s) => s.addSection);
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
    // preserve category order
    return CATEGORIES.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [filtered]);

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
    <div className="flex flex-col h-full bg-card">
      <div className="p-3 border-b border-border relative">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search sections…"
            className="w-full pl-8 pr-3 py-2 text-sm rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
        <button className="absolute right-2 top-2 p-1 rounded hover:bg-accent" title="Collapse" onClick={() => toggleLeftPanel()}>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>
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
    </div>
  );
}

function SectionCard({ tpl, onAdd }: { tpl: SectionTemplate; onAdd: () => void }) {
  const [previewOpen, setPreviewOpen] = useState(false);
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
            <iframe
              className="flex-1"
              title={tpl.name}
              srcDoc={`<!DOCTYPE html><html><head><script src="https://cdn.tailwindcss.com"></script></head><body>${tpl.html}</body></html>`}
            />
          </div>
        </div>
      )}
    </>
  );
}
