"use client";

import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";
import { LibraryPanel } from "@/components/builder/LibraryPanel";

export function AppSidebar({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const leftPanelOpen = useBuilder((s) => s.leftPanelOpen);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50 text-slate-950">
      <aside className={`flex-shrink-0 sticky top-0 h-screen overflow-hidden bg-white transition-all duration-200 ${leftPanelOpen ? "w-[250px]" : "w-16"}`}>
        {leftPanelOpen ? (
          <LibraryPanel />
        ) : (
          <div className="flex h-full w-full items-start justify-center p-2">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/70 bg-background text-foreground shadow-sm"
              onClick={() => setLeftPanelOpen(true)}
              aria-label="Expand sidebar"
            >
              ▶
            </button>
          </div>
        )}
      </aside>
      <div className="flex-1 min-h-screen overflow-auto bg-slate-50">
        {children}
      </div>
    </div>
  );
}
