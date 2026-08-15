"use client";

import { useEffect, useRef, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder } from "@/lib/builder/store";
import { useAuth } from "@/lib/auth";
import { CenteredLoader } from "@/components/ui/CenteredLoader";
import { Canvas } from "./Canvas";
import { AddPageDialog } from "./AddPageDialog";
import { SeoDialog } from "./SeoDialog";
import { RightContextPanel } from "./RightContextPanel";
import { CanvasToolbar } from "./CanvasToolbar";
import type { Page } from "@/lib/builder/store";
import { AppNav } from "@/components/layout/AppNav";

export function BuilderShell() {
  const hydrate = useBuilder((s) => s.hydrate);
  const hydrated = useBuilder((s) => s.hydrated);
  const dark = useBuilder((s) => s.dark);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const currentPageId = project?.currentPageId ?? null;
  const pages = project?.pages ?? null;
  const [localSeoModalPageId, setLocalSeoModalPageId] = useState<string | null>(null);
  const autosaveTimerRef = useRef<number | null>(null);
  const hasInitialProjectRef = useRef(false);
  const mounted = useMounted();
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

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
  }, [project, hydrated]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onBeforeUnload = () => {};
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [hydrated]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    document.documentElement.classList.toggle("dark", dark);
  }, [dark]);

  if (!mounted || !hydrated) {
    return <CenteredLoader details="Initializing editor…" className="bg-[#171717]/50" />;
  }

  const handleSelectPage = (pageId: string) => {
    useBuilder.getState().selectPage(pageId);
    if (currentProjectId) {
      window.history.replaceState(null, "", `/editor/${currentProjectId}?pageId=${pageId}`);
    }
  };

  const handleAddPage = (name: string, slug: string) => {
    const addPage = useBuilder.getState().addPage;
    const newId = addPage(name, slug);
    if (newId && currentProjectId) {
      window.history.replaceState(null, "", `/editor/${currentProjectId}?pageId=${newId}`);
    }
    return newId;
  };

  return (
    <div className="builder-shell flex h-screen w-full bg-[#171717] text-[#F5F5F5]">
      {/* LEFT SIDEBAR */}
      <AppNav fixed={false} />

      {/* CANVAS SECTION */}
      <div className="builder-canvas-section flex flex-1 min-w-0 flex-col">
        <CanvasToolbar
          project={project}
          pages={pages}
          currentPageId={currentPageId}
          onSelectPage={handleSelectPage}
        />
        <div className="canvas-workspace flex flex-1 min-h-0 overflow-auto">
          <div className="flex flex-1 min-h-0 items-center justify-center p-6">
            <div className="relative h-full w-full   overflow-hidden rounded-lg border border-[#2B2B2B] bg-white shadow-2xl">
              <Canvas />
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <RightContextPanel />

      {/* DIALOGS */}
      {pages && (
        <>
          <AddPageDialog
            open={addDialogOpen}
            onOpenChange={setAddDialogOpen}
            onAddPage={handleAddPage}
          />
          <SeoDialog
            page={pages.find((pg: Page) => pg.id === localSeoModalPageId) ?? null}
            project={project}
            open={Boolean(localSeoModalPageId)}
            onClose={() => setLocalSeoModalPageId(null)}
          />
        </>
      )}
    </div>
  );
}
