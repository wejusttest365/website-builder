import { useEffect, useRef } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { toast } from "sonner";
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
  const autosaveTimerRef = useRef<number | null>(null);
  const hasInitialProjectRef = useRef(false);
  const mounted = useMounted();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  // Autosave with compact feedback
  useEffect(() => {
    if (!hydrated || !project) return;

    if (!hasInitialProjectRef.current) {
      hasInitialProjectRef.current = true;
      return;
    }

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      const ok = persist();
      if (ok) {
        toast.success("Saved", {
          id: "autosave",
          duration: 1000,
          position: "top-center",
          className: "text-sm",
        });
      } else {
        toast.error("Save failed", {
          id: "autosave",
          duration: 2200,
          position: "top-center",
        });
      }
    }, 400);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
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

  if (!mounted || !hydrated) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-sm text-muted-foreground">
        Loading builder…
      </div>
    );
  }

  return (
    <div className="h-full w-full flex flex-col bg-background text-foreground overflow-hidden">
      <Toolbar />
      <div
        className="flex-1 min-h-0 min-w-0 grid"
        style={{ gridTemplateColumns: `${leftPanelOpen ? 260 : 44}px 1fr 320px`, gridAutoRows: "1fr", transition: "grid-template-columns 220ms ease" }}
      >
        <div className={`border-r border-border min-h-0 min-w-0 overflow-hidden ${leftPanelOpen ? '' : 'flex items-center justify-center'}`}>
          <LibraryPanel />
        </div>
        <div className="min-h-0 min-w-0 overflow-hidden">
          <Canvas />
        </div>
        <div className="border-l border-border min-h-0 min-w-0 overflow-hidden">
          <PropertiesPanel />
        </div>
      </div>
    </div>
  );
}
