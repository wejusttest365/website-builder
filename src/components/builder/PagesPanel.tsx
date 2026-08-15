"use client";

import { Plus, Settings, Search, X } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useBuilder } from "@/lib/builder/store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Page } from "@/lib/builder/store";
import { PageActionsMenu } from "./PageActionsMenu";
import { useState } from "react";

interface PagesPanelProps {
  pages: Page[];
  currentPageId: string | null;
  addPage: () => void;
  selectPage: (id: string) => void;
  renamePage: (id: string, name: string) => void;
  setPageSlug: (id: string, slug: string) => void;
  duplicatePage: (id: string) => void;
  deletePage: (id: string) => void;
  setSeoModalPageId: (id: string) => void;
  onClose?: () => void;
}

export function PagesPanel({
  pages,
  currentPageId,
  addPage,
  selectPage,
  renamePage,
  setPageSlug,
  duplicatePage,
  deletePage,
  setSeoModalPageId,
  onClose,
}: PagesPanelProps) {
  const navigate = useNavigate();
  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);
  const [search, setSearch] = useState("");

  const filteredPages = pages.filter((page) => page.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <TooltipProvider delayDuration={300}>
      <section className="w-full space-y-2">
        <div className="rounded-lg border border-[#363636] bg-[#1F1F1F] p-2 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-[#969696]">Pages</div>
              <div className="text-xs font-semibold text-[#F5F5F5]">{pages.length} Page{pages.length !== 1 ? "s" : ""}</div>
            </div>
            <div className="flex items-center gap-1">
              {onClose && (
                <button
                  onClick={onClose}
                  className="inline-flex h-7 w-7 items-center justify-center rounded-md text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
              <button
                onClick={addPage}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#363636] hover:bg-[#242424]"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#969696]" />
            <input
              type="text"
              placeholder="Search pages..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-8 w-full rounded-lg border border-[#363636] bg-[#171717] pl-8 pr-3 text-xs text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/20"
            />
          </div>

          <div className="space-y-1">
            {filteredPages.map((page) => (
              <div
                key={page.id}
                onClick={() => {
                  if (currentProjectId) {
                    setShowProjectDashboard(false);
                    setLeftPanelView("pages");
                    navigate({ to: `/editor/${currentProjectId}?pageId=${page.id}` as never } as any);
                  } else {
                    selectPage(page.id);
                    setLeftPanelView("pages");
                  }
                }}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition ${
                  page.id === currentPageId ? "bg-[#242424] text-[#FACC15]" : "hover:bg-[#242424] text-[#D0D0D0]"
                }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">{page.name}</div>
                  <div className="truncate text-[10px] opacity-70 text-[#969696]">{page.slug === "index" ? "/" : `/${page.slug}`}</div>
                </div>

                <PageActionsMenu
                  page={page}
                  pageCount={pages.length}
                  onRename={renamePage}
                  onSetSlug={setPageSlug}
                  onDuplicate={duplicatePage}
                  onDelete={deletePage}
                  onSeo={setSeoModalPageId}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    </TooltipProvider>
  );
}
