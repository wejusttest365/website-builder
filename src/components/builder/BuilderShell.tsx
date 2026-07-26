import { useEffect, useRef } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { CenteredLoader } from "@/components/ui/CenteredLoader";
import { Canvas } from "./Canvas";
import { PropertiesPanel } from "./PropertiesPanel";
import { TemplateGalleryOverlay } from "./TemplateGalleryOverlay";

export function BuilderShell() {
  const hydrate = useBuilder((s) => s.hydrate);
  const hydrated = useBuilder((s) => s.hydrated);
  const dark = useBuilder((s) => s.dark);
  const undo = useBuilder((s) => s.undo);
  const redo = useBuilder((s) => s.redo);
  const persistWithStatus = useBuilder((s) => s.persistWithStatus);
  const saveStatus = useBuilder((s) => s.saveStatus);
  const setSaveStatus = useBuilder((s) => s.setSaveStatus);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const leftPanelOpen = useBuilder((s) => s.leftPanelOpen);
  const leftPanelView = useBuilder((s) => s.leftPanelView);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const autosaveTimerRef = useRef<number | null>(null);
  const saveStatusResetTimerRef = useRef<number | null>(null);
  const hasInitialProjectRef = useRef(false);
  const mounted = useMounted();

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  const initialProjectSeenRef = useRef(false);

  useEffect(() => {
    if (!project) return;
    if (!initialProjectSeenRef.current) {
      initialProjectSeenRef.current = true;
      if (!leftPanelOpen) {
        setLeftPanelOpen(true);
      }
    }
  }, [project, leftPanelOpen, setLeftPanelOpen]);

  // Autosave with compact feedback
  useEffect(() => {
    if (!hydrated || !project) return;

    if (!hasInitialProjectRef.current) {
      hasInitialProjectRef.current = true;
      return;
    }

    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current);
      autosaveTimerRef.current = null;
    }

    autosaveTimerRef.current = window.setTimeout(() => {
      const ok = persistWithStatus();
      if (!ok) {
        console.error("Autosave failed");
      }
    }, 2500);

    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current);
        autosaveTimerRef.current = null;
      }
    };
  }, [project, persistWithStatus, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBeforeUnload = () => {
      persistWithStatus();
    };
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hydrated, persistWithStatus]);

  useEffect(() => {
    if (saveStatusResetTimerRef.current) {
      window.clearTimeout(saveStatusResetTimerRef.current);
      saveStatusResetTimerRef.current = null;
    }

    if (saveStatus !== "saved") return;

    saveStatusResetTimerRef.current = window.setTimeout(() => {
      setSaveStatus("idle");
      saveStatusResetTimerRef.current = null;
    }, 2200);

    return () => {
      if (saveStatusResetTimerRef.current) {
        window.clearTimeout(saveStatusResetTimerRef.current);
        saveStatusResetTimerRef.current = null;
      }
    };
  }, [saveStatus, setSaveStatus]);

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
    return <CenteredLoader details="Initializing editor…" className="bg-background/50" />;
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.09),_transparent_32%),linear-gradient(135deg,_rgba(248,250,252,0.98),_rgba(241,245,249,0.95))] text-foreground">
      <div className="p-2 h-full min-h-0 flex flex-col">
        <div className="flex flex-1 min-h-0 flex-col overflow-hidden rounded border border-border/70 bg-background/70 shadow-[0_25px_80px_-35px_rgba(15,23,42,0.35)] backdrop-blur">
          <div className="flex h-full min-h-0 min-w-0 overflow-hidden">
            <div className="min-h-0 min-w-0 flex-1 overflow-hidden bg-[linear-gradient(180deg,_rgba(248,250,252,0.65),_rgba(255,255,255,0.98))]">
              <Canvas />
            </div>
            <div className="border-l border-border/70 flex-shrink-0 w-[250px] min-h-0 flex-col overflow-hidden bg-card/35">
              <PropertiesPanel />
            </div>
          </div>
        </div>
      </div>
      {leftPanelOpen && leftPanelView === "templates" ? <TemplateGalleryOverlay /> : null}
    </div>
  );
}
