"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useBuilder } from "@/lib/builder/store";
import { shallow } from "zustand/shallow";
import { LibraryPanel } from "@/components/builder/LibraryPanel";

export function AppSidebar({ children }: { children: ReactNode }) {
  const { user } = useAuth();

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex overflow-hidden bg-slate-50 text-slate-950">
      <aside className="flex-shrink-0 w-[250px] sticky top-0 h-screen overflow-hidden bg-white">
        <LibraryPanel />
      </aside>
      <div className="flex-1 min-h-screen overflow-auto bg-slate-50">
        {children}
      </div>
    </div>
  );
}
