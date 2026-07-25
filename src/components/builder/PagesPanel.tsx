import { Plus, Settings } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { useBuilder } from "@/lib/builder/store";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { Page } from "@/lib/builder/store";
import { PageActionsMenu } from "./PageActionsMenu";
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
}: PagesPanelProps) {
  const navigate = useNavigate();
  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);
  return (
    <TooltipProvider delayDuration={300}>
      <section className="w-full space-y-2">
        <div className="rounded-lg border border-border/70 bg-background/90 p-2 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
                Pages
              </div>

              <div className="text-xs font-semibold">
                {pages.length} Page{pages.length !== 1 ? "s" : ""}
              </div>
            </div>

            <button
              onClick={addPage}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border hover:bg-accent"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-1">
            {pages.map((page) => (
              <div
                key={page.id}
                onClick={() => {
  if (currentProjectId) {
    setShowProjectDashboard(false);
    setLeftPanelView("pages");

    navigate({
      to: `/editor/${currentProjectId}?pageId=${page.id}` as never,
    } as any);
  } else {
    selectPage(page.id);
    setLeftPanelView("pages");
  }
}}
                className={`flex cursor-pointer items-center justify-between rounded-lg px-2 py-2 transition
                  ${
                    page.id === currentPageId
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted"
                  }`}
              >
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium">
                    {page.name}
                  </div>

                  <div className="truncate text-[10px] opacity-70">
                    {page.slug === "index" ? "/" : `/${page.slug}`}
                  </div>
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