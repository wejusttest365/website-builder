import { useRef, useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useBuilder } from "@/lib/builder/store";
import { Button } from "@/components/ui/button";
import { AddPageDialog } from "./AddPageDialog";
import { PageActionsMenu } from "./PageActionsMenu";
import { SeoDialog } from "./SeoDialog";
import type { Page } from "@/lib/builder/store";

export function PageNavigationBar() {
  const navigate = useNavigate();
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const currentPageId = project?.currentPageId ?? null;
  const selectPage = useBuilder((s) => s.selectPage);
  const addPage = useBuilder((s) => s.addPage);
  const renamePage = useBuilder((s) => s.renamePage);
  const setPageSlug = useBuilder((s) => s.setPageSlug);
  const duplicatePage = useBuilder((s) => s.duplicatePage);
  const deletePage = useBuilder((s) => s.deletePage);
  const currentProjectId = useBuilder((s) => s.currentProjectId);

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLDivElement>(null);

  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [seoModalPageId, setSeoModalPageId] = useState<string | null>(null);

  const pages = project?.pages ?? [];
  const activePage = pages.find((p) => p.id === currentPageId) ?? pages[0] ?? null;
  const seoModalPage = pages.find((pg: Page) => pg.id === seoModalPageId) ?? null;

  useEffect(() => {
    if (!activeTabRef.current || !scrollContainerRef.current) return;
    const container = scrollContainerRef.current;
    const active = activeTabRef.current;
    const containerRect = container.getBoundingClientRect();
    const activeRect = active.getBoundingClientRect();
    const scrollLeft =
      activeRect.left -
      containerRect.left +
      container.scrollLeft -
      (containerRect.width - activeRect.width) / 2;
    container.scrollTo({ left: Math.max(0, scrollLeft), behavior: "smooth" });
  }, [currentPageId, pages.length]);

  const handleSelectPage = (pageId: string) => {
    selectPage(pageId);
    if (currentProjectId) {
      navigate({ to: `/editor/${currentProjectId}?pageId=${pageId}` as never } as any);
    }
  };

  const handleAddPage = (name: string, slug: string) => {
    const newId = addPage(name, slug);
    if (newId && currentProjectId) {
      navigate({ to: `/editor/${currentProjectId}?pageId=${newId}` as never } as any);
    }
    return newId;
  };

  if (!project || pages.length === 0) return null;

  return (
    <>
      <div className="flex h-10 min-h-10 w-full items-center gap-2 border-b border-[#363636] bg-[#1F1F1F]/90 px-3">
        <span className="mr-1 shrink-0 text-[11px] font-semibold uppercase tracking-wider text-[#969696]">
          Pages
        </span>
        <div
          ref={scrollContainerRef}
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden [scrollbar-width:thin]"
        >
          {pages.map((page) => {
            const isActive = page.id === currentPageId;
            return (
              <div
                key={page.id}
                ref={isActive ? activeTabRef : null}
                onClick={() => handleSelectPage(page.id)}
                className={[
                  "group flex shrink-0 cursor-pointer items-center gap-0.5 rounded-md py-0.5 pl-1.5 pr-0.5 text-xs font-medium transition-colors",
                  isActive
                    ? "bg-[#FACC15] text-[#111111] shadow-sm"
                    : "text-[#D0D0D0] hover:bg-[#242424] hover:text-[#F5F5F5]",
                ].join(" ")}
                title={page.name}
              >
                <span className="max-w-[140px] truncate">{page.name}</span>
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
            );
          })}
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-7 shrink-0 px-2 text-xs"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="h-3.5 w-3.5" />
          <span className="ml-1">Add Page</span>
        </Button>
      </div>
      <AddPageDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onAddPage={handleAddPage}
      />
      <SeoDialog
        page={seoModalPage}
        project={project}
        open={Boolean(seoModalPage)}
        onClose={() => setSeoModalPageId(null)}
      />
    </>
  );
}
