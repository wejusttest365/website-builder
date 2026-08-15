import { type DragEvent, type FormEvent, type SVGProps, useMemo, useRef, useState, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { SECTION_LIBRARY, CATEGORIES, type SectionTemplate } from "@/lib/builder/sections";
import { useMounted } from "@/hooks/use-mounted";
import { ClientOnly } from "./ClientOnly";
import { useBuilder, type Page } from "@/lib/builder/store";
import { LayoutDashboard, Search, Copy, ChevronDown, ChevronRight, ChevronLeft, FileText, Layers, FolderOpen, LayoutGrid, Grid2x2, ImageIcon, SlidersHorizontal, Settings, LogOut, BookOpen, Menu, ChevronUp, UserCircle, Bell, Sparkles, X, Eye, EyeOff, Mail, Lock, User, Heart, Trash2, Server, Globe, Users, Plus } from "lucide-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { toast } from "sonner";
import { TEMPLATE_LIBRARY, type TemplateDefinition } from "@/lib/builder/templates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { SeoSettingsPanel } from "./SeoSettingsPanel";
import { SeoDialog } from "./SeoDialog";
import { PageActionsMenu } from "./PageActionsMenu";
import { SidebarBadge } from "./SidebarBadge";
import { useCloudProjects } from "@/lib/builder/useCloudProjects";
import { createWidgetSectionTemplate, getAllWidgetRegistrations, getWidgetBootstrapExport, createWidgetInstance, type WidgetRegistration } from "@/components/builder/widgets/widgetRegistry";

function GoogleLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 533.5 544.3" fill="none" aria-hidden="true" {...props}>
      <path d="M533.5 278.4c0-17.4-1.5-34.2-4.3-50.4H272v95.5h146.9c-6.3 34-25 62.8-53.3 82v68.1h86.2c50.4-46.5 81.7-114.9 81.7-195.2z" fill="#4285F4" />
      <path d="M272 544.3c72.6 0 133.6-24.1 178.2-65.5l-86.2-68.1c-24.1 16.1-55 25.7-92 25.7-70.7 0-130.6-47.7-152-111.7H31.7v70.2C75.7 482.6 167.1 544.3 272 544.3z" fill="#34A853" />
      <path d="M120 325.2c-11.7-34.9-11.7-72.4 0-107.3V147.7H31.7c-39.8 79.8-39.8 173.7 0 253.5L120 325.2z" fill="#FBBC05" />
      <path d="M272 107.7c39.5 0 75 13.6 103 40.3l77.3-77.3C403.7 24.9 344.2 0 272 0 167.1 0 75.7 61.7 31.7 147.7l88.3 70.2C141.4 155.4 201.3 107.7 272 107.7z" fill="#EA4335" />
    </svg>
  );
}

const MAIN_MENU_ITEMS = [
  { key: "dashboard" as const, label: "Dashboard", Icon: LayoutDashboard, route: "/dashboard" },
  { key: "projects" as const, label: "My Projects", Icon: FolderOpen, route: "/dashboard/projects" },
  { key: "templates" as const, label: "Templates", Icon: Layers, route: "/dashboard/templates" },
  { key: "favorites" as const, label: "Favorites", Icon: Heart, route: "/dashboard/favorites" },
  { key: "trash" as const, label: "Trash", Icon: Trash2, route: "/dashboard/trash" },
] as const;

const EDITOR_PANEL_ITEMS = [
  { key: "pages" as const, label: "Pages", Icon: FileText },
  { key: "widgets" as const, label: "Widgets", Icon: Grid2x2 },
] as const;

const CANVAS_MENU_KEYS = EDITOR_PANEL_ITEMS.map((item) => item.key);
const EXTRA_PANEL_KEYS: readonly string[] = [];
const EMPTY_PAGES: Page[] = [];

type CanvasMenuKey = (typeof CANVAS_MENU_KEYS)[number];
type DashboardMenuKey = (typeof MAIN_MENU_ITEMS)[number]["key"];
type ExtraPanelKey = (typeof EXTRA_PANEL_KEYS)[number];
type PanelViewKey = CanvasMenuKey | DashboardMenuKey | ExtraPanelKey;

export function LibraryPanel({ variant = "editor" }: { variant?: "editor" | "dashboard" } = {}) {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const [openWidgetId, setOpenWidgetId] = useState<string | null>(null);
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() => ({ Hero: true, Navigation: true, Features: true, Carousel: true }));
  const [seoModalPageId, setSeoModalPageId] = useState<string | null>(null);
  const mounted = useMounted();
  const addSection = useBuilder((s) => s.addSection);
  const applyTemplate = useBuilder((s) => s.applyTemplate);
  const currentProject = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const setPageSeo = useBuilder((s) => s.setPageSeo);
  const currentPageId = useBuilder((s) => currentProject?.currentPageId ?? null);
  const selectPage = useBuilder((s) => s.selectPage);
  const addPage = useBuilder((s) => s.addPage);
  const renamePage = useBuilder((s) => s.renamePage);
  const setPageSlug = useBuilder((s) => s.setPageSlug);
  const duplicatePage = useBuilder((s) => s.duplicatePage);
  const deletePage = useBuilder((s) => s.deletePage);
  const leftPanelOpen = useBuilder((s) => s.leftPanelOpen);
  const leftPanelView = useBuilder((s) => s.leftPanelView);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const setLeftPanelViewRaw = useBuilder((s) => s.setLeftPanelView);
  const showProjectDashboard = useBuilder((s) => s.showProjectDashboard);
  const setShowProjectDashboard = useBuilder((s) => s.setShowProjectDashboard);
  const isPanelOpen = leftPanelOpen !== null;
  const openLeftPanel = (view: "widgets" | "pages") => {
    setLeftPanelOpen(view);
    setLeftPanelViewRaw(view);
  };
  const closeLeftPanel = () => setLeftPanelOpen(null);
  const toggleLeftPanel = () => {
    if (leftPanelOpen === null) {
      openLeftPanel(variant === "dashboard" ? "pages" : "widgets");
    } else {
      closeLeftPanel();
    }
  };
  const setLeftPanelView: (view: PanelViewKey) => void = (view) => {
    setLeftPanelViewRaw(view as any);
  };
  const pages = currentProject?.pages ?? EMPTY_PAGES;
  const currentProjectId = useBuilder((s) => s.currentProjectId);
  const seoModalPage = pages.find((pg: Page) => pg.id === seoModalPageId) ?? null;
  const [seoModalTab, setSeoModalTab] = useState<"page" | "analytics">("page");
  const isCanvasMenuKey = (value: string): value is CanvasMenuKey => CANVAS_MENU_KEYS.includes(value as CanvasMenuKey);
  const dashboardPathMap: Record<DashboardMenuKey, string> = {
    dashboard: "/dashboard",
    projects: "/dashboard/projects",
    templates: "/dashboard/templates",
    favorites: "/dashboard/favorites",
    trash: "/dashboard/trash",
  };

// derive active menu key from the current URL
const [currentPath, setCurrentPath] = useState(() =>
  typeof window !== "undefined" ? window.location.pathname : "/"
);

useEffect(() => {
  const onLocationChange = () =>
    setCurrentPath(window.location.pathname || "/");

  window.addEventListener("popstate", onLocationChange);

  const origPush = history.pushState;
  const origReplace = history.replaceState;

  // @ts-ignore
  history.pushState = function () {
    // @ts-ignore
    const result = origPush.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };

  // @ts-ignore
  history.replaceState = function () {
    // @ts-ignore
    const result = origReplace.apply(this, arguments);
    window.dispatchEvent(new Event("locationchange"));
    return result;
  };

  window.addEventListener("locationchange", onLocationChange);

  return () => {
    window.removeEventListener("popstate", onLocationChange);
    window.removeEventListener("locationchange", onLocationChange);

    // @ts-ignore
    history.pushState = origPush;
    // @ts-ignore
    history.replaceState = origReplace;
  };
}, []);
const routeActiveKey = (() => {
  const path = (currentPath || "/").replace(/\/+$/, "") || "/";

  const entries = Object.entries(dashboardPathMap) as [DashboardMenuKey, string][];
  entries.sort(([, a], [, b]) => b.length - a.length);

  for (const [key, route] of entries) {
    if (path === route || path.startsWith(route + "/")) {
      return key;
    }
  }

  return null;
})();

const activePanelKey = showProjectDashboard
  ? (routeActiveKey ?? "dashboard")
  : isCanvasMenuKey(leftPanelView)
    ? leftPanelView
    : "pages";
  const primaryMenuItems = MAIN_MENU_ITEMS;
  const editorMenuItems = EDITOR_PANEL_ITEMS;
  const { projects: cloudProjects } = useCloudProjects();
  const badgeCounts = useMemo(() => {
    const list = cloudProjects as Array<{ status?: string; favorite?: boolean }>;
    return {
      projects: list.filter((project) => project.status !== "trashed").length,
      favorites: list.filter((project) => Boolean(project.favorite) && project.status !== "trashed").length,
      trash: list.filter((project) => project.status === "trashed").length,
      templates: TEMPLATE_LIBRARY.length,
    };
  }, [cloudProjects]);
  const toolMenuItems: Array<{
    key: PanelViewKey;
    label: string;
    Icon: React.ComponentType<{ className?: string }>;
  }> = [];
  const widgetRegistryEntries = useMemo(() => getAllWidgetRegistrations(), []);
  const insertWidgetIntoPage = (widget: WidgetRegistration) => {
    const sectionTemplate = createWidgetSectionTemplate(widget.id);
    const sectionId = addSection(sectionTemplate as any);
    if (!sectionId) return;

    useBuilder.getState().selectSection(sectionId);

    window.setTimeout(() => {
      const iframe = document.querySelector("iframe[title='preview']") as HTMLIFrameElement | null;
      const doc = iframe?.contentDocument;
      const section = doc?.querySelector(`[data-wto-section="${sectionId}"]`) as HTMLElement | null;
      section?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
  };

  const beginWidgetDrag = (event: DragEvent, widget: WidgetRegistration, variant?: string) => {
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
    const html = getWidgetBootstrapExport(widget.type, widgetInstance);
    const sectionTemplate: SectionTemplate = {
      id: `${widget.id}-${widgetInstance.id}`,
      name: widget.displayName,
      category: widget.category,
      html,
      widgetInstance,
      thumbBg: "linear-gradient(135deg, rgba(148,163,184,0.16), rgba(59,130,246,0.08))",
    };
    const sectionId = addSection(sectionTemplate as any);
    if (!sectionId) return;

    useBuilder.getState().selectSection(sectionId);

    window.setTimeout(() => {
      const iframe = document.querySelector("iframe[title='preview']") as HTMLIFrameElement | null;
      const doc = iframe?.contentDocument;
      const section = doc?.querySelector(`[data-wto-section="${sectionId}"]`) as HTMLElement | null;
      section?.scrollIntoView({ block: "center", behavior: "smooth" });
    }, 80);
  };
  const showEditorMenuSection = Boolean(currentProjectId) && !showProjectDashboard;
  const currentViewLabel = [...primaryMenuItems, ...editorMenuItems].find((item) => item.key === activePanelKey)?.label ?? activePanelKey;
  const [overlayView, setOverlayView] = useState<PanelViewKey | null>(null);
  const overlayLabel = overlayView ? [...primaryMenuItems, ...editorMenuItems].find((item) => item.key === overlayView)?.label ?? overlayView : "";
  const isOverlayOpen = Boolean(overlayView);
  const prevLeftPanelOpenRef = useRef<"widgets" | "pages" | "layers" | null>(null);
  const prevLeftPanelViewRef = useRef(leftPanelView);

  useEffect(() => {
    if (!isPanelOpen) {
      setOverlayView(null);
    }
    prevLeftPanelOpenRef.current = leftPanelOpen;
    prevLeftPanelViewRef.current = leftPanelView;
  }, [leftPanelOpen, leftPanelView]);

  useEffect(() => {
    const becameOpen = prevLeftPanelOpenRef.current === null && leftPanelOpen !== null;
    const viewChanged = prevLeftPanelViewRef.current !== leftPanelView;

    if (
      isPanelOpen &&
      !showProjectDashboard &&
      isCanvasMenuKey(leftPanelView) &&
      (becameOpen || viewChanged)
    ) {
      setOverlayView(leftPanelView);
    }
  }, [leftPanelOpen, leftPanelView, showProjectDashboard, isCanvasMenuKey, isPanelOpen]);


  useEffect(() => {
    if (leftPanelOpen && !showProjectDashboard && leftPanelView === "widgets") {
      setOverlayView("widgets");
    }
  }, [leftPanelOpen, leftPanelView, showProjectDashboard]);

  useEffect(() => {
    if (seoModalPageId) {
      setSeoModalTab("page");
    }
  }, [seoModalPageId]);

  useEffect(() => {
    if (showProjectDashboard) {
      setOverlayView(null);
    }
  }, [showProjectDashboard]);

  const [accountOpen, setAccountOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const {
  user,
  signingIn,
  login,
  register,
  logout,
  loginWithGoogle,
} = useAuth();
  const [credentials, setCredentials] = useState({ firstName: "", lastName: "", email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);
useEffect(() => {
  if (user) {
    setAuthDialogOpen(false);

    setCredentials({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      remember: false,
    });

    setAuthMode("sign-in");
  }
}, [user]);
  const handleAuthSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!credentials.email.trim() || !credentials.password.trim()) return;

    if (authMode === "sign-up") {
      await register(credentials.firstName, credentials.lastName, credentials.email, credentials.password);
    } else {
      await login(credentials.email, credentials.password);
    }

    setAuthDialogOpen(false);
    setCredentials({ firstName: "", lastName: "", email: "", password: "", remember: false });
  };

const handleLogout = async () => {
  await logout();
  setAccountOpen(false);
};

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      if (accountOpen && accountMenuRef.current && !accountMenuRef.current.contains(event.target as Node)) {
        setAccountOpen(false);
      }
    }
    window.addEventListener("mousedown", handleOutsideClick);
    return () => window.removeEventListener("mousedown", handleOutsideClick);
  }, [accountOpen]);

  const filteredSections = useMemo(() => {
    const t = q.trim().toLowerCase();
    if (!t) return SECTION_LIBRARY;
    return SECTION_LIBRARY.filter((section) => section.name.toLowerCase().includes(t) || section.category.toLowerCase().includes(t));
  }, [q]);

  const groupedSections = useMemo(() => {
    const map = new Map<string, SectionTemplate[]>();
    for (const section of filteredSections) {
      if (!map.has(section.category)) map.set(section.category, []);
      map.get(section.category)!.push(section);
    }
    return CATEGORIES.filter((c) => map.has(c)).map((c) => [c, map.get(c)!] as const);
  }, [filteredSections]);

  if (!mounted) {
    return (
      <div className="flex h-full flex-row bg-card">
        <div className="w-16 border-r border-border/70 flex flex-col items-center justify-start gap-2 py-4 bg-background/50" />
        <div className="flex-1 flex flex-col">
          <div className="p-3 border-b border-border">
            <div className="h-9 rounded-lg bg-muted" />
          </div>
          <div className="flex-1 space-y-2 p-2">
            <div className="h-16 rounded-xl bg-muted" />
            <div className="h-16 rounded-xl bg-muted" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className={`relative h-full min-h-0 flex flex-col ${variant === "dashboard" ? "bg-[#202020]" : "bg-[#202020]"}`}>
        <div className="px-2 py-2">
          <div className={`${isPanelOpen ? "space-y-2" : "space-y-1"}`}>
            {primaryMenuItems.map(({ key, label, Icon }) => {
              const active = activePanelKey === key;
              const badgeCount = key === "projects"
                ? badgeCounts.projects
                : key === "templates"
                  ? badgeCounts.templates
                  : key === "favorites"
                    ? badgeCounts.favorites
                    : key === "trash"
                      ? badgeCounts.trash
                      : 0;
              return (
                <Tooltip key={key}>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      onClick={() => {
                        const destination = dashboardPathMap[key as DashboardMenuKey];
                        if (destination) {
                          setShowProjectDashboard(true);
                          openLeftPanel("pages");
                          setOverlayView(null);
                          navigate({ to: destination as never });
                        }
                      }}
                      className={`group flex w-full ${isPanelOpen ? "items-center gap-2 px-2.5 py-2 text-left" : "justify-center px-0 py-2"} rounded-md text-sm font-semibold transition ${
                        active ? "bg-[#303030] text-[#F5F5F5]" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"
                      }`}
                    >
                      <div className={`relative flex ${isPanelOpen ? "w-full items-center gap-2" : "items-center justify-center"}`}>
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                          active ? "bg-[#FACC15]/15 text-[#FACC15]" : "bg-[#2B2B2B] text-[#969696]"
                        }`}>
                          <Icon className="h-4 w-4" />
                        </span>
                        {isPanelOpen ? <span className="truncate flex-1">{label}</span> : null}
                        {badgeCount > 0 ? (
                          <span className={isPanelOpen ? "ml-auto mr-1" : "absolute -right-1 -top-1"}>
                            <SidebarBadge count={badgeCount} active={active} />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side={isPanelOpen ? "bottom" : "right"}>{label}</TooltipContent>
                </Tooltip>
              );
            })}
          </div>

          {showEditorMenuSection && variant !== "dashboard" ? (
            <>
              {isPanelOpen ? <div className="my-3 border-t border-[#363636]" /> : null}
              <div className={`${isPanelOpen ? "space-y-2" : "space-y-1"}`}>
                {editorMenuItems.map(({ key, label, Icon }) => {
                  const active = activePanelKey === key;
                  return (
                    <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          type="button"
                          onClick={() => {
                            setShowProjectDashboard(false);
                            setLeftPanelView(key);
                            if (key === "widgets") {
                              openLeftPanel("widgets");
                            } else if (key === "pages") {
                              setLeftPanelOpen("pages");
                            } else {
                              openLeftPanel("widgets");
                            }
                            setOverlayView(key);

                            if (currentProjectId) {
                              const editorPath = `/editor/${currentProjectId}`;
                              if (window.location.pathname !== editorPath) {
                                navigate({ to: editorPath as never });
                              }
                            }
                          }}
                           className={`group flex w-full ${isPanelOpen ? "items-center gap-2 px-2.5 py-2 text-left" : "justify-center px-0 py-2"} rounded-md text-sm font-semibold transition ${
                             active ? "bg-[#303030] text-[#F5F5F5]" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"
                           }`}
                         >
                           <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                             active ? "bg-[#FACC15]/15 text-[#FACC15]" : "bg-[#2B2B2B] text-[#969696]"
                           }`}>
                             <Icon className="h-4 w-4" />
                           </span>
                           {isPanelOpen ? <span className="truncate">{label}</span> : null}
                         </button>
                       </TooltipTrigger>
                       <TooltipContent side={isPanelOpen ? "bottom" : "right"}>{label}</TooltipContent>
                     </Tooltip>
                   );
                 })}
               </div>
             </>
           ) : null}

           {toolMenuItems.length > 0 && variant !== "dashboard" ? (
             <>
               {isPanelOpen ? (
                 <div className="mt-5 mb-2 px-3 text-[10px] uppercase tracking-[0.24em] text-[#969696]">Tools</div>
               ) : null}
               <div className={`${isPanelOpen ? "space-y-2" : "space-y-1"}`}>
                 {toolMenuItems.map(({ key, label, Icon }) => {
                   const active = activePanelKey === key;
                   const badge = undefined;
                   return (
                     <Tooltip key={key}>
                       <TooltipTrigger asChild>
                         <button
                           type="button"
                           onClick={() => {
                             setLeftPanelView(key);
                             if (showProjectDashboard) {
                               const destination = dashboardPathMap[key as DashboardMenuKey];
                               if (destination) {
                                 navigate({ to: destination as never });
                               }
                             } else {
                               setOverlayView(key);
                             }
                           }}
                           className={`group flex w-full ${isPanelOpen ? "items-center justify-between gap-2 px-2.5 py-2 text-left" : "justify-center px-0 py-2"} rounded-md text-sm font-semibold transition ${
                             active ? "bg-[#303030] text-[#F5F5F5]" : "text-[#969696] hover:bg-[#242424] hover:text-[#F5F5F5]"
                           }`}
                         >
                           <span className={`flex ${isPanelOpen ? "items-center gap-2" : "items-center justify-center"}`}>
                             <span className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                               active ? "bg-[#FACC15]/15 text-[#FACC15]" : "bg-[#2B2B2B] text-[#969696]"
                             }`}>
                               <Icon className="h-4 w-4" />
                             </span>
                             {isPanelOpen ? <span className="truncate">{label}</span> : null}
                           </span>
                           {isPanelOpen && badge ? (
                             <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                               badge === "Beta" ? "bg-[#2B2B2B] text-[#969696]" : "bg-[#FACC15]/15 text-[#FACC15]"
                             }`}>
                               {badge}
                             </span>
                           ) : null}
                         </button>
                       </TooltipTrigger>
                       <TooltipContent side={isPanelOpen ? "bottom" : "right"}>{label}</TooltipContent>
                     </Tooltip>
                   );
                 })}
               </div>
             </>
           ) : null}
         </div>

         {isPanelOpen ? (
          <div className="flex-1 min-h-0 overflow-hidden px-3 pb-3">
            <div className={`absolute inset-0 z-20 flex flex-col bg-[#1F1F1F] shadow-2xl transition-transform duration-300 ${isOverlayOpen ? "translate-x-0" : "-translate-x-full"}`}>
              <div className="flex items-center gap-3 border-b border-[#363636] bg-[#1F1F1F] px-4 py-3">
                <button
                  type="button"
                  onClick={() => {
                    setOverlayView(null);
                    if (!showProjectDashboard) {
                      setLeftPanelView("pages");
                    }
                  }}
                  className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] transition hover:border-[#FACC15] hover:text-[#FACC15]"
                  aria-label="Back to menu"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <div className="text-sm font-semibold text-[#F5F5F5]">{overlayLabel}</div>
              </div>
              <div className="flex-1 min-h-0 overflow-y-auto" style={{ scrollbarGutter: "stable" }}>
                {overlayView ? (
                  showProjectDashboard ? (
                    <DashboardPanel view={overlayView as DashboardPanelView} setLeftPanelOpen={setLeftPanelOpen} setLeftPanelView={setLeftPanelView} />
                  ) : (
                    <>
                      {overlayView === "pages" ? (
                        <section className="space-y-3">
                          <div className="bg-[#1F1F1F] p-2">
                            <div className="flex items-center justify-between gap-2">
                              <div>
                                <div className="text-[9px] uppercase tracking-[0.3em] text-[#969696]">Pages</div>
                                <div className="mt-1 text-sm font-semibold text-[#F5F5F5]">{pages.length} page{pages.length === 1 ? "" : "s"}</div>
                              </div>
                              <button
                                className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-[#363636] bg-[#1F1F1F] text-[#D0D0D0] transition hover:border-[#FACC15] hover:text-[#FACC15]"
                                onClick={() => addPage()}
                                title="New page"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <div className="space-y-2">
                            {pages.map((pg) => (
                              <div
                                key={pg.id}
                                onClick={() => {
                                  setShowProjectDashboard(false);
                                  setLeftPanelView("pages");
                                  selectPage(pg.id);

                                  if (currentProjectId) {
                                    const editorPath = `/editor/${currentProjectId}`;
                                    if (typeof window !== "undefined") {
                                      const url = new URL(window.location.href);
                                      url.searchParams.set("pageId", pg.id);
                                      if (window.location.pathname === editorPath) {
                                        window.history.replaceState(window.history.state, "", url.toString());
                                      } else {
                                        navigate({ to: `${editorPath}?pageId=${pg.id}` as never } as any);
                                      }
                                    }
                                  }
                                }}
                                className={`group flex w-full cursor-pointer items-center gap-2 rounded justify-between px-2.5 py-2 text-left text-sm font-semibold transition ${pg.id === currentPageId ? "bg-[#303030] text-[#F5F5F5]" : "text-[#D0D0D0] hover:bg-[#242424]"}`}
                              >
                                <div className="min-w-0">
                                  <div className="truncate font-medium text-[#F5F5F5]">{pg.name}</div>
                                  <div className="text-[10px] text-[#969696]">/{pg.slug}</div>
                                </div>

                                <div onClick={(event) => event.stopPropagation()}>
                                  <PageActionsMenu
                                    page={pg}
                                    pageCount={pages.length}
                                    onRename={renamePage}
                                    onSetSlug={setPageSlug}
                                    onDuplicate={duplicatePage}
                                    onDelete={deletePage}
                                    onSeo={setSeoModalPageId}
                                  />
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {overlayView === "templates" ? (
                        <section className="space-y-3">
                          <div className="rounded-3xl border border-[#363636] bg-[#1F1F1F] p-4">
                            <div className="text-[9px] uppercase tracking-[0.3em] text-[#969696]">Templates</div>
                            <p className="mt-2 text-sm text-[#D0D0D0]">Browse templates in a full-screen gallery experience. Select a design to replace the current page content.</p>
                            <button
                              className="mt-4 w-full rounded-2xl bg-[#FACC15] px-4 py-3 text-xs font-semibold text-[#111111] transition hover:bg-[#FDE047]"
                              onClick={() => {
                                openLeftPanel("widgets");
                                setLeftPanelView("templates");
                              }}
                            >
                              Open template gallery
                            </button>
                          </div>
                        </section>
                      ) : null}

                      {overlayView === "shared" ? (
                        <section className="space-y-3">
                          <div className="rounded-3xl border border-[#363636] bg-[#1F1F1F] p-3">
                            <div className="relative">
                              <Search className="pointer-events-none absolute left-3 top-3.5 h-4 w-4 text-[#969696]" />
                              <input
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search sections…"
                                className="w-full rounded-2xl border border-[#363636] bg-[#1F1F1F] py-3 pl-11 pr-4 text-sm text-[#F5F5F5] shadow-sm outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/10"
                              />
                            </div>
                          </div>

                          <div className="space-y-3">
                            {groupedSections.length === 0 ? (
                              <div className="rounded-3xl border border-dashed border-[#363636] bg-[#1F1F1F] p-4 text-center text-xs text-[#969696]">No sections match.</div>
                            ) : (
                              groupedSections.map(([cat, items]) => {
                                const open = q.trim() ? true : openCats[cat] ?? false;
                                return (
                                  <div key={cat} className="overflow-hidden rounded-3xl border border-[#363636] bg-[#1F1F1F]">
                                    <button
                                      onClick={() => setOpenCats((s) => ({ ...s, [cat]: !open }))}
                                      className="flex w-full items-center gap-2 px-4 py-3 text-left text-xs font-semibold uppercase tracking-[0.18em] text-[#969696] transition hover:bg-[#242424]"
                                    >
                                      {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
                                      <span>{cat}</span>
                                      <span className="ml-auto text-[9px] font-normal text-[#6F6F6F]">{items.length}</span>
                                    </button>
                                    {open ? (
                                      <div className="space-y-2 border-t border-[#363636] px-3 py-3">
                                        {items.map((tpl) => (
                                          <SectionCard key={tpl.id} tpl={tpl} onAdd={() => addSection(tpl)} />
                                        ))}
                                      </div>
                                    ) : null}
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </section>
                      ) : null}

                      {overlayView === "widgets" ? (
                        <section className="flex h-full flex-col overflow-hidden bg-[#1F1F1F]">
                          <div className="sticky top-0 z-10 border-b border-[#363636] bg-[#1F1F1F] px-3 py-3">
                            <div className="space-y-3"> 
                              <div className="relative">
                                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#969696]" />
                                <input
                                  value={q}
                                  onChange={(e) => setQ(e.target.value)}
                                  placeholder="Search widgets..."
                                  className="h-9 w-full rounded-[7px] border border-[#363636] bg-[#1F1F1F] pl-10 pr-3 text-[13px] text-[#F5F5F5] outline-none transition focus:border-[#FACC15] focus:ring-2 focus:ring-[#FACC15]/10"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="flex-1" id="widgetScroll">
                            {visibleWidgets.length === 0 ? (
                              <div className="rounded-[12px] border border-dashed border-[#363636] bg-[#1F1F1F] p-3 text-center text-xs text-[#969696]">No widgets match.</div>
                            ) : (
                              <div className="space-y-1">
                                {visibleWidgets.map((widget, index) => {
                                  const open = q.trim() ? true : openWidgetId === widget.id;
                                  return (
                                    <div
                                      key={widget.id}
                                      className={`overflow-hidden ${index < visibleWidgets.length - 1 ? "border-b border-[#363636]" : ""} bg-[#1F1F1F]`}
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
                                          <FontAwesomeIcon icon={widget.icon as any} className="h-4 w-4" />
                                        </span>
                                        <div className="min-w-0 flex-1">
                                          <div className="flex items-center gap-2">
                                            <span className="truncate text-[13px] font-medium text-[#F5F5F5]">{widget.displayName}</span>
                                            <span className="truncate text-[11px] text-[#969696]">{widget.supportedVariants.length} styles</span>
                                          </div>
                                        </div>
                                        <span className="text-[#969696]">
                                          {open ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
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
                        </section>
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-[#969696]">Select a menu item to open a panel.</div>
                      )}
                    </>
                  )
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">Select a menu item to open a panel.</div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent
          className="w-[min(100vw-1rem,28rem)] max-h-[calc(100vh-1.5rem)] overflow-y-auto p-0"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <div className="overflow-hidden rounded-[26px] bg-[#1F1F1F] shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] ring-1 ring-[#363636]">
            <div className="border-b border-[#363636] px-5 py-4 sm:px-6 sm:py-4">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-[#F5F5F5]">
                {authMode === "sign-in" ? "Welcome back" : "Create your account"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6 text-[#969696]">
                {authMode === "sign-in"
                  ? "Sign in to continue your projects."
                  : "Create your account to keep building."}
              </DialogDescription>
            </div>

            <div className="px-5 py-4">
              <div className="space-y-2">
                {/* <button
                  type="button"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <GoogleLogo className="h-5 w-5" />
                  Continue with Google
                </button> */}

<button
  type="button"
  onClick={async () => {
    try {
      await loginWithGoogle();
    } catch (err) {
      console.error(err);
      toast.error("Google sign in failed");
    }
  }}
  className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-[#363636] bg-[#1F1F1F] px-4 py-2.5 text-sm font-semibold text-[#F5F5F5] transition hover:bg-[#242424]"
>
  <GoogleLogo className="h-5 w-5" />
  Continue with Google
</button>


              </div>

              <div className="relative my-4">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-[#363636]" />
                <div className="relative mx-auto w-max bg-[#1F1F1F] px-3 text-[10px] uppercase tracking-[0.35em] text-[#969696]">
                  or continue with email
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-2">
                {authMode === "sign-up" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#969696]" htmlFor="auth-first-name">
                        First name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#969696]">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          id="auth-first-name"
                          type="text"
                          value={credentials.firstName}
                          onChange={(event) => setCredentials((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="First name"
                          required
                          className="bg-[#1F1F1F] border-[#363636] pl-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#969696]" htmlFor="auth-last-name">
                        Last name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#969696]">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          id="auth-last-name"
                          type="text"
                          value={credentials.lastName}
                          onChange={(event) => setCredentials((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Last name"
                          required
                          className="bg-[#1F1F1F] border-[#363636] pl-11"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#969696]" htmlFor="auth-email">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#969696]">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="auth-email"
                      type="email"
                      value={credentials.email}
                      onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@example.com"
                      required
                      className="bg-[#1F1F1F] border-[#363636] pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-[#969696]" htmlFor="auth-password">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-[#969696]">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder={authMode === "sign-up" ? "Create a strong password" : "Enter your password"}
                      required
                      className="bg-[#1F1F1F] border-[#363636] pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-3 flex items-center text-[#969696]"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-[#969696]">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={credentials.remember}
                      onChange={(event) => setCredentials((prev) => ({ ...prev, remember: event.target.checked }))}
                      className="h-4 w-4 rounded border-[#363636] text-[#FACC15] focus:ring-[#FACC15]"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-[#FACC15] font-semibold hover:text-[#FDE047]">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full rounded-2xl bg-[#FACC15] py-2.5 text-base font-semibold text-[#111111] hover:bg-[#FDE047]">
                  {signingIn ? (authMode === "sign-in" ? "Signing in…" : "Creating account…") : (authMode === "sign-in" ? "Sign In" : "Create Account")}
                </Button>
              </form>

              <div className="mt-3 border-t border-[#363636] pt-3 text-center text-sm text-[#969696]">
                {authMode === "sign-in" ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button type="button" className="text-[#FACC15] font-semibold hover:text-[#FDE047]" onClick={() => setAuthMode("sign-up")}>
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" className="text-[#FACC15] font-semibold hover:text-[#FDE047]" onClick={() => setAuthMode("sign-in") }>
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <SeoDialog
        page={seoModalPage}
        project={currentProject}
        open={Boolean(seoModalPage)}
        onClose={() => setSeoModalPageId(null)}
      />
    </TooltipProvider>
  );
}

function TemplateCard({ tpl, onUse }: { tpl: TemplateDefinition; onUse: () => void }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-[#363636] bg-[#1F1F1F] shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-28 overflow-hidden">
        <img src={tpl.thumbnail} alt={tpl.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-[#1F1F1F]/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-[#D0D0D0]">
          {tpl.category}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-[#F5F5F5]">{tpl.name}</div>
            <p className="mt-1 text-xs leading-5 text-[#969696]">{tpl.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <button className="w-full rounded-lg bg-[#FACC15] px-3 py-2 text-xs font-semibold text-[#111111] hover:bg-[#FDE047]" onClick={() => { onUse(); toast.success(`${tpl.name} loaded into the canvas`); }}>
            Use Template
          </button>
        </div>
      </div>
    </div>
  );
}

function SectionCard({ tpl, onAdd }: { tpl: SectionTemplate; onAdd: () => void }) {
  return (
    <div
      className="group rounded-lg border border-[#363636] bg-[#1F1F1F] hover:border-[#FACC15]/50 hover:shadow-md transition overflow-hidden cursor-grab"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-wto-section", tpl.id);
        e.dataTransfer.setData("text/plain", tpl.id);
        e.dataTransfer.effectAllowed = "copy";
        window.dispatchEvent(new CustomEvent("wto-library-drag-start", { detail: { kind: "section", sectionId: tpl.id } }));
      }}
      onDragEnd={() => window.dispatchEvent(new CustomEvent("wto-library-drag-end"))}
      onDoubleClick={onAdd}
    >
      <div
        className="h-9 flex items-center justify-center text-white text-[9px] font-bold tracking-wider"
        style={{ background: tpl.thumbBg }}
      >
        {tpl.category.toUpperCase()}
      </div>
      <div className="px-2 py-1.5 flex items-center gap-1">
        <div className="text-[9px] font-medium truncate flex-1 text-[#F5F5F5]">{tpl.name}</div>
        <button
          className="p-0.5 rounded hover:bg-[#242424] text-[#969696]"
          title="Add to canvas"
          onClick={onAdd}
        >
          <Plus className="w-3 h-3" />
        </button>
        <button
          className="p-0.5 rounded hover:bg-[#242424] text-[#969696]"
          title="Copy HTML"
          onClick={async () => {
            await navigator.clipboard.writeText(tpl.html);
            toast.success("HTML copied");
          }}
        >
          <Copy className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}

type DashboardPanelView = Extract<
  PanelViewKey,
  "dashboard" | "projects" | "templates" | "favorites" | "shared" | "trash"
>;

function DashboardPanel({ view, setLeftPanelOpen, setLeftPanelView }: { view: DashboardPanelView; setLeftPanelOpen: (open: "widgets" | "pages" | null) => void; setLeftPanelView: (view: PanelViewKey) => void; }) {
  const projects = useBuilder((s) => s.projects);
  const projectEntries = useMemo(() => Object.values(projects), [projects]);
  const totalProjects = projectEntries.length;

  const sectionCard = (title: string, subtitle: string, description: string, action?: { label: string; onClick: () => void }) => (
    <div className="rounded-2xl border border-[#363636] bg-[#1F1F1F] p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[9px] uppercase tracking-[0.24em] text-[#969696]">{title}</p>
          <h3 className="mt-2 text-sm font-semibold text-[#F5F5F5]">{subtitle}</h3>
          <p className="mt-2 text-xs leading-5 text-[#969696]">{description}</p>
        </div>
        {action ? (
          <button
            type="button"
            className="rounded-full bg-[#FACC15] px-3 py-2 text-[11px] font-semibold text-[#111111] transition hover:bg-[#FDE047]"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        ) : null}
      </div>
    </div>
  );

  return (
    <>
      {view === "projects" ? (
        <section className="w-full space-y-4">
          <div className="rounded-3xl border border-[#363636] bg-[#1F1F1F] p-4 shadow-sm">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-[9px] uppercase tracking-[0.24em] text-[#969696]">Projects</div>
                <div className="mt-2 text-sm font-semibold text-[#F5F5F5]">{totalProjects} project{totalProjects === 1 ? "" : "s"}</div>
                <p className="mt-1 text-xs text-[#969696]">Quickly manage your active websites and open your latest project.</p>
              </div>
              <button
                type="button"
                className="h-10 rounded-full bg-[#FACC15] px-4 text-xs font-semibold text-[#111111] transition hover:bg-[#FDE047]"
                onClick={() => {
                  setLeftPanelView("pages");
                  setLeftPanelOpen("pages");
                }}
              >
                New
              </button>
            </div>
          </div>

          <div className="space-y-2">
            {projectEntries.length > 0 ? (
              projectEntries.slice(0, 3).map((project) => (
                <div key={project.id} className="rounded-2xl border border-[#363636] bg-[#1F1F1F] p-3 text-sm text-[#D0D0D0] shadow-sm">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate font-medium text-[#F5F5F5]">{project.name}</div>
                      <div className="text-[10px] text-[#969696]">
                        Updated <ClientOnly>{new Date(project.updatedAt).toLocaleDateString()}</ClientOnly>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="rounded-full border border-[#363636] bg-[#1F1F1F] px-2 py-1 text-[10px] font-semibold text-[#D0D0D0] transition hover:border-[#FACC15] hover:text-[#FACC15]"
                      onClick={() => {
                        setLeftPanelView("templates");
                        setLeftPanelOpen("pages");
                      }}
                    >
                      Open
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-[#363636] bg-[#1F1F1F]/80 p-4 text-xs text-[#969696]">
                No projects found. Create a new project to start building.
              </div>
            )}
          </div>
        </section>
      ) : view === "pages" ? (
        <section className="w-full space-y-4">
          {sectionCard(
            "Templates",
            "Browse high-impact layouts",
            "Select a prebuilt template and launch your website with one click.",
            {
              label: "Explore",
              onClick: () => {
                setLeftPanelView("templates");
                setLeftPanelOpen("pages");
              },
            }
          )}
        </section>
      ) : view === "templates" ? (
        <section className="w-full space-y-4">
          {sectionCard(
            "Favorites",
            "Saved assets & templates",
            "Keep your most-used resources ready for rapid page building.",
            {
              label: "View",
              onClick: () => {
                setLeftPanelView("sections");
                setLeftPanelOpen("pages");
              },
            }
          )}
        </section>
      ) : view === "sections" ? (
        <section className="w-full space-y-4">
          {sectionCard(
            "Shared",
            "Collaborate on reusable content",
            "Sync sections across pages and keep your design system consistent.",
            {
              label: "Sync",
              onClick: () => {
                setLeftPanelView("sections");
                setLeftPanelOpen("pages");
              },
            }
          )}
        </section>
      ) : view === "widgets" ? (
        <section className="w-full space-y-4">
          {sectionCard(
            "Trash",
            "Recover deleted components",
            "Restore recently removed items or clean up old assets from your dashboard.",
            {
              label: "Review",
              onClick: () => {
                setLeftPanelView("widgets");
                setLeftPanelOpen("pages");
              },
            }
          )}
        </section>
      ): null}
    </>
  );
}
