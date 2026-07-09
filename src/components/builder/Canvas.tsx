import { useBuilder, pageOf } from "@/lib/builder/store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTION_LIBRARY } from "@/lib/builder/sections";
import { PreviewFrame } from "./PreviewFrame";
import { useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  ArrowDown,
  Copy,
  Trash2,
  ChevronDown,
  ChevronUp,
  MousePointerClick,
  Plus,
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
  const iframeRef = useRef<HTMLIFrameElement | null>(null);

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
    const tplId = e.dataTransfer.getData("application/x-wto-section") || e.dataTransfer.getData("text/plain");
    if (!tplId) return;
    const tpl = SECTION_LIBRARY.find((s) => s.id === tplId);
    if (!tpl || !project) return;

    const page = pageOf(project);
    const sectionCount = page?.sections.length ?? 0;
    let insertIndex = sectionCount;

    const frame = iframeRef.current;
    const frameRect = frame?.getBoundingClientRect();
    if (frameRect) {
      const dropY = Math.max(frameRect.top, Math.min(e.clientY, frameRect.bottom));
      const ratio = (dropY - frameRect.top) / frameRect.height;
      insertIndex = Math.floor(ratio * (sectionCount + 1));
    }

    addSection(tpl, insertIndex);
  };

  const handleSectionDrop = (targetIndex: number) => (e: React.DragEvent) => {
    const sourceId = e.dataTransfer.getData("application/x-wto-existing-section") || draggingSectionId;
    if (!sourceId || !project) return;
    e.preventDefault();
    const fromIndex = (pageOf(project)?.sections ?? []).findIndex((s: any) => s.id === sourceId);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    move(fromIndex, targetIndex);
    setDraggingSectionId(null);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="border-b border-border bg-card flex items-center px-3">
        <div className="w-full">
          <Tabs defaultValue={pageOf(project)?.id ?? ""} onValueChange={(v) => useBuilder.getState().selectPage(v)}>
            <TabsList>
              {(project?.pages ?? []).map((pg) => (
                <TabsTrigger key={pg.id} value={pg.id} className="mr-2">{pg.name}</TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
        <div className="flex items-center gap-2">
          <button className="h-8 w-8 rounded-md flex items-center justify-center hover:bg-accent" title="New page" onClick={() => useBuilder.getState().addPage()}><Plus className="w-4 h-4"/></button>
        </div>
      </div>
      <div
        className="relative flex-1 overflow-hidden"
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
        }}
        onDrop={handleDrop}
      >
        <PreviewFrame editable disablePointerEvents={draggingLibrarySection} iframeRef={iframeRef} />
        {draggingLibrarySection && (
          <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/10 text-sm font-semibold text-primary">
            Drop section here
          </div>
        )}
      </div>
    </div>
  );
}

