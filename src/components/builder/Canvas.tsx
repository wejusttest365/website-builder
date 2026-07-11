import { useBuilder, pageOf } from "@/lib/builder/store";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SECTION_LIBRARY } from "@/lib/builder/sections";
import { PreviewFrame } from "./PreviewFrame";
import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
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
  const mounted = useMounted();

  useEffect(() => {
    if (!mounted) return;
    const onStart = () => setDraggingLibrarySection(true);
    const onEnd = () => setDraggingLibrarySection(false);
    window.addEventListener("wto-library-drag-start", onStart);
    window.addEventListener("wto-library-drag-end", onEnd);
    // element-level drags (components like button)
    window.addEventListener("wto-library-drag-element-start", onStart);
    window.addEventListener("wto-library-drag-element-end", onEnd);
    return () => {
      window.removeEventListener("wto-library-drag-start", onStart);
      window.removeEventListener("wto-library-drag-end", onEnd);
      window.removeEventListener("wto-library-drag-element-start", onStart);
      window.removeEventListener("wto-library-drag-element-end", onEnd);
    };
  }, [mounted]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingLibrarySection(false);
    // If dragging an element (component) into an existing section
    const elementHtml = e.dataTransfer.getData("application/x-wto-element");
    if (elementHtml && project) {
      const page = pageOf(project);
      const sectionCount = page?.sections.length ?? 0;
      if (!page || sectionCount === 0) return;
      const frame = iframeRef.current;
      const frameRect = frame?.getBoundingClientRect();
      // Try to map drop coordinates into the iframe to find exact target element
      try {
        if (frame && frame.contentDocument && frameRect) {
          const relX = e.clientX - frameRect.left;
          const relY = e.clientY - frameRect.top;
          const doc = frame.contentDocument;
          const el = doc.elementFromPoint(relX, relY) as Element | null;
          const secEl = el?.closest && el.closest('[data-wto-section]');
          const sectionId = secEl?.getAttribute('data-wto-section');
          if (sectionId) {
            const target = (page.sections ?? []).find((s: any) => s.id === sectionId);
            if (target) {
              // If we hit a specific inner element, insert before it; otherwise append
              const idxEl = el?.closest && el.closest('[data-wto-idx]');
              if (idxEl) {
                const outer = (idxEl as HTMLElement).outerHTML;
                // sanitize and replace first occurrence of outerHTML in target.html
                const html = target.html;
                const i = html.indexOf(outer);
                let nextHtml = html;
                if (i >= 0) {
                  nextHtml = html.slice(0, i) + elementHtml + html.slice(i);
                } else {
                  // fallback: append
                  nextHtml = html + elementHtml;
                }
                useBuilder.getState().updateSection(target.id, { html: nextHtml });
                useBuilder.getState().selectSection(target.id);
                return;
              }
              // no specific element hit; append
              useBuilder.getState().updateSection(target.id, { html: target.html + elementHtml });
              useBuilder.getState().selectSection(target.id);
              return;
            }
          }
        }
      } catch (err) {
        // ignore and fallback to append behavior
        console.error('element drop insert error', err);
      }
      // fallback: decide section by Y position and append
      let insertIndex = 0;
      if (frameRect) {
        const dropY = Math.max(frameRect.top, Math.min(e.clientY, frameRect.bottom));
        const ratio = (dropY - frameRect.top) / frameRect.height;
        insertIndex = Math.floor(ratio * sectionCount);
        if (insertIndex < 0) insertIndex = 0;
        if (insertIndex >= sectionCount) insertIndex = sectionCount - 1;
      }
      const target = page.sections[insertIndex];
      if (!target) return;
      useBuilder.getState().updateSection(target.id, { html: target.html + elementHtml });
      useBuilder.getState().selectSection(target.id);
      return;
    }

    // Otherwise treat as full-section drop (existing behavior)
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
    <div className="flex flex-col h-full min-h-0">
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
        {mounted ? (
          <PreviewFrame editable disablePointerEvents={draggingLibrarySection} iframeRef={iframeRef} />
        ) : null}
        {draggingLibrarySection && (
          <div className="pointer-events-none absolute inset-4 z-20 flex items-center justify-center rounded-xl border-2 border-dashed border-primary bg-primary/10 text-sm font-semibold text-primary">
            Drop section here
          </div>
        )}
      </div>
    </div>
  );
}

