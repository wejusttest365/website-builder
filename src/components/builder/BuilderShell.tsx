import { useEffect } from "react";
import { useBuilder } from "@/lib/builder/store";
import { Toolbar } from "./Toolbar";
import { LibraryPanel } from "./LibraryPanel";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";

export function BuilderShell() {
  const hydrate = useBuilder((s) => s.hydrate);
  const hydrated = useBuilder((s) => s.hydrated);
  const dark = useBuilder((s) => s.dark);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persist = useBuilder((s) => s.persist);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const leftPanelOpen = useBuilder((s) => s.leftPanelOpen);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Autosave
  useEffect(() => {
    if (!hydrated || !project) return;
    persist();
  }, [project, persist, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBeforeUnload = () => {
      persist();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hydrated, persist]);

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
      <div
        className="flex-1 min-h-0 grid"
        style={{ gridTemplateColumns: `${leftPanelOpen ? 260 : 44}px 1fr 320px`, transition: "grid-template-columns 220ms ease" }}
      >
        <div className={`border-r border-border min-h-0 overflow-hidden ${leftPanelOpen ? '' : 'flex items-center justify-center'}`}>
          <LibraryPanel />
        </div>
        <div className="min-h-0 overflow-hidden">
          <Canvas />
        </div>
        <div className="border-l border-border min-h-0 overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
