import { useEffect } from "react";
import { useBuilder } from "@/lib/builder/store";
import { Toolbar } from "./Toolbar";
import { LibraryPanel } from "./LibraryPanel";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { CodePanel } from "./CodePanel";

export function BuilderShell() {
  const hydrate = useBuilder((s) => s.hydrate);
  const hydrated = useBuilder((s) => s.hydrated);
  const dark = useBuilder((s) => s.dark);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persist = useBuilder((s) => s.persist);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Autosave
  useEffect(() => {
    if (!hydrated) return;
    const id = setTimeout(persist, 400);
    return () => clearTimeout(id);
  }, [project, persist, hydrated]);

  // Keyboard shortcuts
  useEffect(() => {
    if (typeof window === "undefined") return;
    function onKey(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      } else if (
        ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") ||
        ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === "z")
      ) {
        e.preventDefault();
        redo();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [undo, redo]);

  if (!hydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading builder…
      </div>
    );
  }

  return (
    <div className="h-screen w-screen flex flex-col bg-background text-foreground overflow-hidden">
      <Toolbar />
      <div className="flex-1 min-h-0 grid grid-cols-[260px_1fr_320px]">
        <div className="border-r border-border min-h-0 overflow-hidden">
          <LibraryPanel />
        </div>
        <div className="min-h-0 grid grid-rows-[1fr_280px]">
          <div className="min-h-0 overflow-hidden">
            <Canvas />
          </div>
          <div className="min-h-0 overflow-hidden border-t border-border">
            <CodePanel />
          </div>
        </div>
        <div className="border-l border-border min-h-0 overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
