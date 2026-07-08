import { useBuilder } from "@/lib/builder/store";
import { SECTION_LIBRARY } from "@/lib/builder/sections";
import { PreviewFrame } from "./PreviewFrame";
import { useEffect, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
} from "lucide-react";

export function Canvas() {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const select = useBuilder((s) => s.selectSection);
  const remove = useBuilder((s) => s.removeSection);
  const dup = useBuilder((s) => s.duplicateSection);
  const move = useBuilder((s) => s.moveSection);
  const toggleCollapsed = useBuilder((s) => s.toggleCollapsed);
  const addSection = useBuilder((s) => s.addSection);
  const [draggingLibrarySection, setDraggingLibrarySection] = useState(false);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);

  useEffect(() => {
    const onStart = () => setDraggingLibrarySection(true);
    const onEnd = () => setDraggingLibrarySection(false);
    window.addEventListener("wto-library-drag-start", onStart);
    window.addEventListener("wto-library-drag-end", onEnd);
    return () => {
      window.removeEventListener("wto-library-drag-start", onStart);
      window.removeEventListener("wto-library-drag-end", onEnd);
    };
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingLibrarySection(false);
    const tplId = e.dataTransfer.getData("application/x-wto-section");
    if (!tplId) return;
    const tpl = SECTION_LIBRARY.find((s) => s.id === tplId);
    if (tpl) addSection(tpl);
  };

  const handleSectionDrop = (targetIndex: number) => (e: React.DragEvent) => {
    const sourceId = e.dataTransfer.getData("application/x-wto-existing-section") || draggingSectionId;
    if (!sourceId || !project) return;
    e.preventDefault();
    const fromIndex = project.sections.findIndex((s) => s.id === sourceId);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    move(fromIndex, targetIndex);
    setDraggingSectionId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card flex items-stretch">
        <div className="flex-1 overflow-x-auto flex items-center gap-1 px-2 py-2">
          {project?.sections.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 flex items-center gap-2">
              <MousePointerClick className="w-3.5 h-3.5" />
              Drag sections here or double-click a card in the library.
            </div>
          )}
          {project?.sections.map((s, idx) => {
            const active = s.id === selectedId;
            return (
              <div
                key={s.id}
                draggable
                onDragStart={(e) => {
                  setDraggingSectionId(s.id);
                  e.dataTransfer.setData("application/x-wto-existing-section", s.id);
                  e.dataTransfer.effectAllowed = "move";
                }}
                onDragEnd={() => setDraggingSectionId(null)}
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleSectionDrop(idx)}
                className={`flex items-center gap-1 rounded-lg px-2 py-1 text-xs border ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent"}`}
              >
                <button className="font-medium truncate max-w-[120px]" onClick={() => select(s.id)}>
                  {s.name}
                </button>
                <button
                  title="Move up"
                  disabled={idx === 0}
                  className="p-0.5 disabled:opacity-30 hover:bg-accent rounded"
                  onClick={() => move(idx, idx - 1)}
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  title="Move down"
                  disabled={idx === (project?.sections.length ?? 0) - 1}
                  className="p-0.5 disabled:opacity-30 hover:bg-accent rounded"
                  onClick={() => move(idx, idx + 1)}
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
                <button
                  title={s.collapsed ? "Expand" : "Collapse"}
                  className="p-0.5 hover:bg-accent rounded"
                  onClick={() => toggleCollapsed(s.id)}
                >
                  {s.collapsed ? (
                    <ChevronDown className="w-3 h-3" />
                  ) : (
                    <ChevronUp className="w-3 h-3" />
                  )}
                </button>
                <button
                  title="Duplicate"
                  className="p-0.5 hover:bg-accent rounded"
                  onClick={() => dup(s.id)}
                >
                  <Copy className="w-3 h-3" />
                </button>
                <button
                  title="Delete"
                  className="p-0.5 hover:bg-destructive/20 text-destructive rounded"
                  onClick={() => remove(s.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            );
          })}
        </div>
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
      >
        <PreviewFrame editable disablePointerEvents={draggingLibrarySection} />
        {draggingLibrarySection && (
          <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/10 text-sm font-semibold text-primary">
            Drop section here
          </div>
        )}
      </div>
    </div>
  );
}

