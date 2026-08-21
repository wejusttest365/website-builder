"use client";

import { useState, useEffect, useMemo } from "react";
import { useBuilder } from "@/lib/builder/store";
import { PagesPanel } from "./PagesPanel";
import { LayersPanel } from "./LayersPanel";
import { InspectorPanel } from "./InspectorPanel";
import { PropertyPanel } from "./property-panel/PropertyPanel";
import { ChevronLeft, ChevronRight, Grid2x2, FileText, Settings } from "lucide-react";
import { useMounted } from "@/hooks/use-mounted";
import { getAllWidgetRegistrations, createWidgetInstance, type WidgetRegistration } from "./widgets/widgetRegistry";
import { useNavigate } from "@tanstack/react-router";
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/lib/auth";

const TABS = [
  { key: "widgets", label: "Widgets", Icon: Grid2x2 },
  { key: "pages", label: "Pages", Icon: FileText },
  { key: "properties", label: "Properties", Icon: Settings },
] as const;

type TabKey = (typeof TABS)[number]["key"];

export function RightContextPanel() {
  const mounted = useMounted();
  const [activeTab, setActiveTab] = useState<TabKey>("widgets");
  const [collapsed, setCollapsed] = useState(false);
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedElement = useBuilder((s) => s.selectedElement);
  const selectedSectionId = useBuilder((s) => s.selectedSectionId);
  const selectElement = useBuilder((s) => s.selectElement);
  const selectSection = useBuilder((s) => s.selectSection);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const currentPageId = project?.currentPageId ?? null;
  const pages = project?.pages ?? [];
  const addPage = useBuilder((s) => s.addPage);
  const renamePage = useBuilder((s) => s.renamePage);
  const setPageSlug = useBuilder((s) => s.setPageSlug);
  const duplicatePage = useBuilder((s) => s.duplicatePage);
  const deletePage = useBuilder((s) => s.deletePage);
  const [seoModalPageId, setSeoModalPageId] = useState<string | null>(null);

  useEffect(() => {
    if (selectedElement || selectedSectionId) {
      setActiveTab("properties");
      setCollapsed(false);
    }
  }, [selectedElement?.elementKey, selectedElement?.childId, selectedSectionId]);

  const widgetRegistryEntries = useMemo(() => getAllWidgetRegistrations(), []);
  const [q, setQ] = useState("");
  const [openWidgetId, setOpenWidgetId] = useState<string | null>(null);

  const visibleWidgets = useMemo(() => {
    const normalized = q.trim().toLowerCase();
    const hiddenElementTypes = new Set(["heading", "text", "button", "image"]);
    return widgetRegistryEntries.filter((widget) => {
      if (hiddenElementTypes.has(widget.type)) return false;
      if (!normalized) return true;
      const values = [
        widget.displayName,
        widget.type,
        widget.category,
        widget.description,
        widget.preview,
        widget.defaultVariant,
        ...(widget.supportedVariants ?? []),
      ]
        .filter(Boolean)
        .map((value) => String(value).toLowerCase());
      return values.some((value) => value.includes(normalized));
    });
  }, [q, widgetRegistryEntries]);

  const addWidgetVariant = (widget: WidgetRegistration, variant: string) => {
    const widgetInstance = createWidgetInstance(widget.id, { variant });
    const sectionTemplate = {
      id: `${widget.id}-${widgetInstance.id}`,
      name: widget.displayName,
      category: widget.category,
      html: "",
      widgetInstance,
      thumbBg: "linear-gradient(135deg, rgba(148,163,184,0.16), rgba(59,130,246,0.08))",
    } as any;
    const addSection = useBuilder.getState().addSection;
    const sectionId = addSection(sectionTemplate);
    if (!sectionId) return;

    useBuilder.getState().selectSection(sectionId);

    window.setTimeout(() => {
      const iframe = document.querySelector("iframe[title='preview']") as HTMLIFrameElement | null;
      const doc = iframe?.contentDocument;
      const section = doc?.querySelector(`[data-wto-section="${sectionId}"]`) as HTMLElement | null;
      section?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
  };

  const beginWidgetDrag = (event: React.DragEvent, widget: WidgetRegistration, variant?: string) => {
    const resolvedVariant = variant || widget.defaultVariant || widget.supportedVariants?.[0] || "";
    event.dataTransfer.setData("application/x-wto-widget", widget.id);
    if (resolvedVariant) event.dataTransfer.setData("application/x-wto-widget-variant", resolvedVariant);
    event.dataTransfer.setData("text/plain", widget.id);
    event.dataTransfer.effectAllowed = "copy";
    window.dispatchEvent(
      new CustomEvent("wto-library-drag-start", {
        detail: { kind: "widget", widgetId: widget.id, variant: resolvedVariant || undefined },
      }),
    );
  };

  const endLibraryDrag = () => {
    window.dispatchEvent(new CustomEvent("wto-library-drag-end"));
  };

  const handleSelectPage = (pageId: string) => {
    useBuilder.getState().selectPage(pageId);
    if (currentProjectId) {
      const editorPath = `/editor/${currentProjectId}`;
      if (typeof window !== "undefined") {
        const url = new URL(window.location.href);
        url.searchParams.set("pageId", pageId);
        if (window.location.pathname === editorPath) {
          window.history.replaceState(window.history.state, "", url.toString());
        } else {
          navigate({ to: `${editorPath}?pageId=${pageId}` as never } as any);
        }
      }
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <aside className={`flex h-full flex-col border-l border-[#2B2B2B] bg-[#1F1F1F] transition-all duration-300 ease-in-out ${collapsed ? "w-[48px]" : "w-[280px]"}`}>
      <div className="flex h-10 shrink-0 items-center justify-between border-b border-[#2B2B2B] px-2">
        {!collapsed ? (
          <div className="flex items-center gap-1">
            {TABS.map(({ key, label, Icon }) => {
              const isActive = activeTab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setActiveTab(key)}
                  className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium transition ${
                    isActive ? "bg-[#FACC15]/15 text-[#FACC15]" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex w-full flex-col items-center gap-1">
            {TABS.map(({ key, Icon }) => {
              const isActive = activeTab === key;
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => { setActiveTab(key); setCollapsed(false); }}
                      className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${
                        isActive ? "bg-[#FACC15]/15 text-[#FACC15]" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="left">{key.charAt(0).toUpperCase() + key.slice(1)}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
        <button
          type="button"
          onClick={() => setCollapsed(!collapsed)}
          className="flex h-7 w-7 items-center justify-center rounded-md text-[#969696] transition hover:bg-[#242424] hover:text-[#F5F5F5]"
          title={collapsed ? "Expand panel" : "Collapse panel"}
        >
          {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {!collapsed && (
        <div className="flex-1 min-h-0 overflow-hidden">
          {activeTab === "widgets" && (
            <div className="flex h-full flex-col overflow-hidden">
              <div className="shrink-0 border-b border-[#2B2B2B] p-2">
                <div className="relative">
                  <input
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="Search widgets..."
                    className="h-9 w-full rounded-[7px] border border-[#363636] bg-[#1F1F1F] pl-3 pr-3 text-[13px] text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/10"
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto">
                {visibleWidgets.length === 0 ? (
                  <div className="rounded-[12px] border border-dashed border-[#363636] bg-[#1F1F1F] m-2 p-3 text-center text-xs text-[#969696]">No widgets match.</div>
                ) : (
                  <div className="space-y-1 p-2">
                    {visibleWidgets.map((widget, index) => {
                      const open = q.trim() ? true : openWidgetId === widget.id;
                      return (
                        <div
                          key={widget.id}
                          className={`overflow-hidden ${index < visibleWidgets.length - 1 ? "border-b border-[#363636]" : ""} bg-[#1F1F1F] rounded-lg`}
                          draggable
                          onDragStart={(event) => beginWidgetDrag(event, widget)}
                          onDragEnd={endLibraryDrag}
                        >
                          <div
                            role="button"
                            tabIndex={0}
                            className="flex h-[52px] w-full cursor-grab items-center gap-3 px-3 text-left text-sm text-[#D0D0D0] transition hover:bg-[#242424] active:cursor-grabbing"
                            onClick={() => {
                              if (q.trim()) return;
                              setOpenWidgetId((prev) => (prev === widget.id ? null : widget.id));
                            }}
                            onKeyDown={(event) => {
                              if (event.key !== "Enter" && event.key !== " ") return;
                              event.preventDefault();
                              if (q.trim()) return;
                              setOpenWidgetId((prev) => (prev === widget.id ? null : widget.id));
                            }}
                          >
                            <span className="inline-flex h-9 w-9 items-center justify-center rounded-[9px] bg-[#2B2B2B] text-[#969696]">
                              <span className="text-xs font-semibold">{widget.displayName.charAt(0)}</span>
                            </span>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center gap-2">
                                <span className="truncate text-[13px] font-medium text-[#F5F5F5]">{widget.displayName}</span>
                                <span className="truncate text-[11px] text-[#969696]">{widget.supportedVariants.length} styles</span>
                              </div>
                            </div>
                            <span className="text-[#969696]">
                              {open ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                            </span>
                          </div>
                          {open ? (
                            <div className="border-t border-[#363636] px-3 pb-3 pt-2">
                              <div className="flex flex-wrap gap-2">
                                {widget.supportedVariants.map((variant) => {
                                  const variantKey = `${widget.id}-${variant}`;
                                  return (
                                    <button
                                      key={variantKey}
                                      type="button"
                                      draggable
                                      onDragStart={(event) => {
                                        event.stopPropagation();
                                        beginWidgetDrag(event, widget, variant);
                                      }}
                                      onDragEnd={(event) => {
                                        event.stopPropagation();
                                        endLibraryDrag();
                                      }}
                                      onClick={() => addWidgetVariant(widget, variant)}
                                      className="min-h-[28px] cursor-grab rounded-[7px] border border-[#363636] bg-[#2B2B2B] px-3 text-[11px] font-medium text-[#D0D0D0] transition hover:border-[#FACC15] hover:text-[#FACC15] active:cursor-grabbing"
                                    >
                                      {variant}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "pages" && (
            <div className="flex h-full flex-col overflow-hidden">
              <PagesPanel
                pages={pages}
                currentPageId={currentPageId}
                addPage={addPage}
                selectPage={handleSelectPage}
                renamePage={renamePage}
                setPageSlug={setPageSlug}
                duplicatePage={duplicatePage}
                deletePage={deletePage}
                setSeoModalPageId={setSeoModalPageId}
              />
              <div className="shrink-0 border-t border-[#2B2B2B] px-3 py-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#969696]">Layers</span>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto">
                <LayersPanel />
              </div>
            </div>
          )}

          {activeTab === "properties" && (
            <div className="flex h-full flex-col overflow-hidden">
              <InspectorPanel />
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
