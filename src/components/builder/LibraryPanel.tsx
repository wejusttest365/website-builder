import { type FormEvent, type SVGProps, useMemo, useRef, useState, useEffect } from "react";
import { SECTION_LIBRARY, CATEGORIES, type SectionTemplate } from "@/lib/builder/sections";
import { useMounted } from "@/hooks/use-mounted";
import { useBuilder, type Page } from "@/lib/builder/store";
import { Search, Plus, Copy, ChevronDown, ChevronRight, ChevronLeft, FileText, Layers, FolderOpen, LayoutGrid, Grid2x2, ImageIcon, SlidersHorizontal, Settings, LogOut, BookOpen, Menu, ChevronUp, UserCircle, Bell, Sparkles, X, Eye, EyeOff, Mail, Lock, User } from "lucide-react";
import { toast } from "sonner";
import { TEMPLATE_CATEGORIES, TEMPLATE_LIBRARY, type TemplateDefinition } from "@/lib/builder/templates";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/lib/auth";
import { SeoSettingsPanel } from "./SeoSettingsPanel";

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

const MENU_ITEMS = [
  { key: "pages" as const, label: "Pages", Icon: FileText },
  { key: "templates" as const, label: "Templates", Icon: Layers },
  { key: "widgets" as const, label: "Widgets", Icon: Grid2x2 },
];

export function LibraryPanel() {
  const [q, setQ] = useState("");
  const [templateCategory, setTemplateCategory] = useState<string>("All");
  const [openCats, setOpenCats] = useState<Record<string, boolean>>(() => ({ Hero: true, Navigation: true, Features: true, Carousel: true }));
  const [seoModalPageId, setSeoModalPageId] = useState<string | null>(null);
  const mounted = useMounted();
  const addSection = useBuilder((s) => s.addSection);
  const applyTemplate = useBuilder((s) => s.applyTemplate);
  const pages = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId]?.pages ?? [] : []));
  const currentProject = useBuilder((s) => s.currentProject());
  const setPageSeo = useBuilder((s) => s.setPageSeo);
  const seoModalPage = pages.find((pg) => pg.id === seoModalPageId) ?? null;
  const currentPageId = useBuilder((s) => s.currentProject()?.currentPageId ?? null);
  const selectPage = useBuilder((s) => s.selectPage);
  const addPage = useBuilder((s) => s.addPage);
  const leftPanelOpen = useBuilder((s) => s.leftPanelOpen);
  const leftPanelView = useBuilder((s) => s.leftPanelView);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);
  const [seoModalTab, setSeoModalTab] = useState<"page" | "project">("page");
  useEffect(() => {
    if (seoModalPageId) {
      setSeoModalTab("page");
    }
  }, [seoModalPageId]);
  const [accountOpen, setAccountOpen] = useState(false);
  const [authDialogOpen, setAuthDialogOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"sign-in" | "sign-up">("sign-in");
  const accountMenuRef = useRef<HTMLDivElement | null>(null);
  const { user, signingIn, login, register, logout } = useAuth();
  const [credentials, setCredentials] = useState({ firstName: "", lastName: "", email: "", password: "", remember: false });
  const [showPassword, setShowPassword] = useState(false);

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

  const handleLogout = () => {
    logout();
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

  // Ensure the left panel is open so the full sidebar is visible after this restore
  useEffect(() => {
    setLeftPanelOpen(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const filteredTemplates = useMemo(() => {
    const t = q.trim().toLowerCase();
    return TEMPLATE_LIBRARY.filter((tpl) => {
      const matchesCategory = templateCategory === "All" || tpl.category === templateCategory;
      const matchesSearch = !t || [tpl.name, tpl.description, tpl.category].join(" ").toLowerCase().includes(t);
      return matchesCategory && matchesSearch;
    });
  }, [q, templateCategory]);

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
      <div className="relative h-full min-h-0 flex flex-row">
        {/* Left Panel: Icons on top, menu content below */}
        <div className="w-56 border-r border-border/70 bg-background/50 flex flex-col flex-shrink-0">
          <div className="px-3 py-3">
            <div className="flex flex-col items-stretch gap-2">
              <div className="flex items-center justify-start gap-4">
                {MENU_ITEMS.map(({ key, label, Icon }) => (
                  <Tooltip key={key}>
                      <TooltipTrigger asChild>
                        <button
                          onClick={() => {
                            // Always open the left panel and switch view — do not collapse when clicking the active icon
                            setLeftPanelView(key);
                            setLeftPanelOpen(true);
                          }}
                          className={`flex flex-col items-center gap-1 px-1 py-0.5 rounded-md transition ${leftPanelOpen && leftPanelView === key ? 'text-primary-foreground' : 'text-muted-foreground'}`}
                          aria-label={label}
                        >
                        <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl transition ${leftPanelOpen && leftPanelView === key ? 'bg-primary text-primary-foreground shadow-md' : 'bg-background border border-border/70'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`mt-1 text-[10px] ${leftPanelOpen && leftPanelView === key ? 'text-foreground font-semibold' : 'text-foreground'}`}>{label}</span>
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" align="center" className="rounded-md bg-slate-900 text-white px-2 py-1 text-xs shadow-md">
                      {`Show ${label}`}
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>

              {/* Removed centered pill — labels are shown under each icon consistently */}
            </div>
          </div>

          {leftPanelOpen && (
            <div className="flex-1 min-h-0 flex flex-col bg-card/95 shadow-inner">
              <div className="flex items-center justify-between border-b border-border/70 bg-card/40 px-3 py-2">
                <div className="text-xs font-semibold text-foreground">{leftPanelView.charAt(0).toUpperCase() + leftPanelView.slice(1)}</div>
              </div>

              <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden px-2 py-1.5 pb-6 space-y-1.5" style={{ scrollbarGutter: "stable" }}>
                {leftPanelView === "pages" ? (
                  <section className="w-full space-y-1.5">
                    <div className="w-full rounded-lg border border-border/70 bg-background/90 p-1.5 space-y-1.5">
                      <div className="flex items-center justify-between gap-2">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Pages</div>
                          <div className="text-xs font-semibold text-foreground">{pages.length} page{pages.length === 1 ? '' : 's'}</div>
                        </div>
                        <button
                          className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground hover:bg-accent hover:text-white transition-colors"
                          onClick={() => addPage()}
                          title="New page"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="space-y-0.5">
                        {pages.map((pg) => (
                          <div
                            key={pg.id}
                            onClick={() => selectPage(pg.id)}
                            className={`w-full rounded-lg px-2 py-1.5 text-xs transition ${pg.id === currentPageId ? 'bg-primary text-primary-foreground shadow-sm hover:bg-primary/80' : 'bg-background/90 text-foreground hover:bg-muted'} flex items-center justify-between gap-2 cursor-pointer`}
                          >
                            <div className="min-w-0">
                              <div className="truncate font-medium text-xs">{pg.name}</div>
                              <div className="text-[9px] text-muted-foreground truncate">/{pg.slug}</div>
                            </div>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={(event) => {
                                    event.stopPropagation();
                                    setSeoModalPageId(pg.id);
                                  }}
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border/70 bg-background/80 text-muted-foreground transition hover:border-primary hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                                  title="Edit page SEO"
                                >
                                  <Settings className="w-4 h-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="bottom" align="center" className="rounded-md bg-slate-900 text-white px-2 py-1 text-xs shadow-md">
                                Edit SEO
                              </TooltipContent>
                            </Tooltip>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                ) : null}

                {leftPanelView === "templates" ? (
                  <section className="w-full space-y-1.5">
                    <div className="w-full rounded-lg border border-border/70 bg-background/90 p-3 space-y-3">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-muted-foreground">Templates</div>
                        <div className="mt-2 text-sm text-foreground">Browse templates in a full-screen gallery experience. Select a design to replace the current page content.</div>
                      </div>
                      <button
                        className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90"
                        onClick={() => setLeftPanelView("templates")}
                      >
                        Open full gallery
                      </button>
                      <div className="rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">
                        Your full-screen marketplace is available above the canvas whenever the Templates view is active.
                      </div>
                    </div>
                  </section>
                ) : null}


                {leftPanelView === "sections" ? (
                  <section className="w-full space-y-1.5">
                    <div className="w-full rounded-lg border border-border/70 bg-background/90 p-1.5">
                      <div className="w-full relative">
                        <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-muted-foreground" />
                        <input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Search sections…"
                          className="w-full pl-7 pr-2 py-1 text-xs rounded-md border border-input/80 bg-background/90 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="w-full space-y-2">
                      {groupedSections.length === 0 ? (
                        <div className="w-full rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">No sections match.</div>
                      ) : (
                        groupedSections.map(([cat, items]) => {
                          const open = q.trim() ? true : openCats[cat] ?? false;
                          return (
                            <div key={cat} className="rounded-lg border border-border/70 bg-background/90 overflow-hidden">
                              <button
                                onClick={() => setOpenCats((s) => ({ ...s, [cat]: !open }))}
                                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                              >
                                {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                <span className="text-[10px]">{cat}</span>
                                <span className="ml-auto text-[8px] font-normal opacity-60">{items.length}</span>
                              </button>
                              {open ? (
                                <div className="space-y-1 p-2 border-t border-border/50">
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

                {leftPanelView === "widgets" ? (
                  <section className="w-full space-y-1.5">
                    <div className="w-full rounded-lg border border-border/70 bg-background/90 p-1.5">
                      <div className="w-full relative">
                        <Search className="w-3.5 h-3.5 absolute left-2 top-1.5 text-muted-foreground" />
                        <input
                          value={q}
                          onChange={(e) => setQ(e.target.value)}
                          placeholder="Search widgets…"
                          className="w-full pl-7 pr-2 py-1 text-xs rounded-md border border-input/80 bg-background/90 shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
                        />
                      </div>
                    </div>
                    <div className="w-full space-y-1">
                      {groupedSections.length === 0 ? (
                        <div className="w-full rounded-lg border border-dashed border-border p-3 text-center text-xs text-muted-foreground">No widgets match.</div>
                      ) : (
                        groupedSections.map(([cat, items]) => {
                          const open = q.trim() ? true : openCats[cat] ?? false;
                          return (
                            <div key={cat} className="rounded-lg border border-border/70 bg-background/90 overflow-hidden">
                              <button
                                onClick={() => setOpenCats((s) => ({ ...s, [cat]: !open }))}
                                className="w-full flex items-center gap-1.5 px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground hover:bg-muted/50 transition"
                              >
                                {open ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                                <span className="text-[10px]">{cat}</span>
                                <span className="ml-auto text-[8px] font-normal opacity-60">{items.length}</span>
                              </button>
                              {open ? (
                                <div className="space-y-1 p-2 border-t border-border/50">
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
              </div>

              <Dialog open={Boolean(seoModalPage)} onOpenChange={(open) => { if (!open) setSeoModalPageId(null); }}>
                <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-2xl p-0">
                  <div className="max-h-[calc(100vh-4rem)] overflow-y-auto rounded-3xl bg-background shadow-lg">
                    <DialogHeader className="border-b border-border/70 px-6 py-5">
                      <DialogTitle>SEO settings for {seoModalPage?.name ?? "page"}</DialogTitle>
                      <DialogDescription>Update page-specific SEO metadata and social preview values.</DialogDescription>
                    </DialogHeader>
                    <div className="p-6">
                      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex items-center rounded-full bg-muted/50 p-1">
                          {(["page", "analytics"] as const).map((tab) => (
                            <button
                              key={tab}
                              type="button"
                              onClick={() => setSeoModalTab(tab)}
                              className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${seoModalTab === tab ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                            >
                              {tab === "page" ? "Page SEO" : "Analytics"}
                            </button>
                          ))}
                        </div>
                        {seoModalTab === "analytics" ? (
                          <div className="text-xs text-muted-foreground">Project-level tracking settings are injected into exported/preview HTML.</div>
                        ) : null}
                      </div>
                      <SeoSettingsPanel page={seoModalPage ?? undefined} project={currentProject ?? undefined} pageOnly={seoModalTab === "page"} projectOnly={seoModalTab === "analytics"} />
                    </div>
                    <DialogFooter className="gap-2 border-t border-border/70 px-6 py-4">
                      <DialogClose asChild>
                        <button type="button" className="inline-flex h-10 items-center justify-center rounded-lg border border-border/70 bg-background px-4 text-sm font-semibold transition hover:bg-muted">
                          Close
                        </button>
                      </DialogClose>
                      <button
                        type="button"
                        className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90"
                        onClick={() => setSeoModalPageId(null)}
                      >
                        Save
                      </button>
                    </DialogFooter>
                  </div>
                </DialogContent>
              </Dialog>

              <div ref={accountMenuRef} className="mt-auto border-t border-border/70 bg-background/90 px-4 pt-3 pb-6">
                <div className="relative">
                  <button
                    type="button"
                    className="w-full rounded-2xl border border-border/70 bg-card/80 px-3 py-3 text-left shadow-sm transition hover:bg-muted/80 hover:text-foreground flex items-center gap-3"
                    onClick={() => {
                      if (user) {
                        setAccountOpen((open) => !open);
                      } else {
                        setAuthDialogOpen(true);
                      }
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold">
                        {user ? user.initials : "L"}
                      </div>
                      <div className="min-w-0">
                        <div className="truncate text-xs font-semibold text-foreground">
                          {user ? user.name : "LOGIN"}
                        </div>
                        <div className="truncate text-[10px] text-muted-foreground">
                          {user ? user.plan : ""}
                        </div>
                      </div>
                    </div>
                    {user ? (
                      <span className="inline-flex h-7 items-center rounded-full border border-border/70 bg-background px-3 text-[10px] font-semibold text-foreground">
                        Profile
                      </span>
                    ) : null}
                  </button>

                  {user && accountOpen ? (
                    <div className="absolute bottom-full left-0 right-0 mb-2 z-50 overflow-hidden rounded-3xl border border-border/70 bg-white shadow-[0_25px_60px_-30px_rgba(15,23,42,0.25)]">
                      <div className="p-4 pb-2">
                        <div className="flex items-center gap-3">
                          <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-semibold">
                            {user.initials}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate text-sm font-semibold text-foreground">{user.name}</div>
                            <div className="truncate text-xs text-muted-foreground">{user.email}</div>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-1 border-t border-border/70 px-3 py-3">
                        {[
                          { label: "Dashboard", icon: FileText, onClick: () => setAccountOpen(false) },
                          { label: "Help & Docs", icon: BookOpen, onClick: () => setAccountOpen(false) },
                          { label: "Changelog", icon: Layers, onClick: () => setAccountOpen(false) },
                          { label: "Log out", icon: LogOut, onClick: handleLogout },
                        ].map(({ label, icon: Icon, onClick }) => (
                          <button
                            key={label}
                            className="w-full flex items-center gap-2 rounded-2xl px-3 py-2 text-left text-sm text-slate-700 transition hover:bg-slate-100"
                            onClick={onClick}
                          >
                            <Icon className="w-4 h-4 text-slate-500" />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={authDialogOpen} onOpenChange={setAuthDialogOpen}>
        <DialogContent
          className="w-[min(100vw-1rem,28rem)] max-h-[calc(100vh-1.5rem)] overflow-y-auto p-0"
          onInteractOutside={(event) => event.preventDefault()}
          onEscapeKeyDown={(event) => event.preventDefault()}
        >
          <div className="overflow-hidden rounded-[26px] bg-white shadow-[0_20px_60px_-24px_rgba(15,23,42,0.25)] ring-1 ring-slate-200">
            <div className="border-b border-slate-200 px-5 py-4 sm:px-6 sm:py-4">
              <DialogTitle className="text-2xl font-semibold tracking-tight text-slate-950">
                {authMode === "sign-in" ? "Welcome back" : "Create your account"}
              </DialogTitle>
              <DialogDescription className="mt-1 text-sm leading-6 text-slate-500">
                {authMode === "sign-in"
                  ? "Sign in to continue your projects."
                  : "Create your account to keep building."}
              </DialogDescription>
            </div>

            <div className="px-5 py-4">
              <div className="space-y-2">
                <button
                  type="button"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                >
                  <GoogleLogo className="h-5 w-5" />
                  Continue with Google
                </button>
              </div>

              <div className="relative my-4">
                <div className="absolute left-0 right-0 top-1/2 h-px bg-slate-200" />
                <div className="relative mx-auto w-max bg-white px-3 text-[10px] uppercase tracking-[0.35em] text-slate-400">
                  or continue with email
                </div>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-2">
                {authMode === "sign-up" ? (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="auth-first-name">
                        First name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          id="auth-first-name"
                          type="text"
                          value={credentials.firstName}
                          onChange={(event) => setCredentials((prev) => ({ ...prev, firstName: event.target.value }))}
                          placeholder="First name"
                          required
                          className="bg-slate-50 border-slate-200 pl-11"
                        />
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="auth-last-name">
                        Last name
                      </label>
                      <div className="relative">
                        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                          <User className="h-4 w-4" />
                        </span>
                        <Input
                          id="auth-last-name"
                          type="text"
                          value={credentials.lastName}
                          onChange={(event) => setCredentials((prev) => ({ ...prev, lastName: event.target.value }))}
                          placeholder="Last name"
                          required
                          className="bg-slate-50 border-slate-200 pl-11"
                        />
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="auth-email">
                    Email address
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Mail className="h-4 w-4" />
                    </span>
                    <Input
                      id="auth-email"
                      type="email"
                      value={credentials.email}
                      onChange={(event) => setCredentials((prev) => ({ ...prev, email: event.target.value }))}
                      placeholder="you@example.com"
                      required
                      className="bg-slate-50 border-slate-200 pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500" htmlFor="auth-password">
                    Password
                  </label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-slate-400">
                      <Lock className="h-4 w-4" />
                    </span>
                    <Input
                      id="auth-password"
                      type={showPassword ? "text" : "password"}
                      value={credentials.password}
                      onChange={(event) => setCredentials((prev) => ({ ...prev, password: event.target.value }))}
                      placeholder={authMode === "sign-up" ? "Create a strong password" : "Enter your password"}
                      required
                      className="bg-slate-50 border-slate-200 pl-11 pr-11"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((visible) => !visible)}
                      className="absolute inset-y-0 right-3 flex items-center text-slate-500"
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {authMode === "sign-up" ? null : null}

                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-500">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={credentials.remember}
                      onChange={(event) => setCredentials((prev) => ({ ...prev, remember: event.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                    />
                    Remember me
                  </label>
                  <button type="button" className="text-slate-600 font-semibold hover:text-slate-900">
                    Forgot password?
                  </button>
                </div>

                <Button type="submit" className="w-full rounded-2xl bg-slate-950 py-2.5 text-base font-semibold text-white hover:bg-slate-900">
                  {signingIn ? (authMode === "sign-in" ? "Signing in…" : "Creating account…") : (authMode === "sign-in" ? "Sign In" : "Create Account")}
                </Button>
              </form>

              <div className="mt-3 border-t border-slate-200 pt-3 text-center text-sm text-slate-500">
                {authMode === "sign-in" ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button type="button" className="font-semibold text-slate-950 hover:text-slate-700" onClick={() => setAuthMode("sign-up")}>
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button type="button" className="font-semibold text-slate-950 hover:text-slate-700" onClick={() => setAuthMode("sign-in") }>
                      Sign in
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
}

function TemplateCard({ tpl, onUse }: { tpl: TemplateDefinition; onUse: () => void }) {
  return (
    <div className="group overflow-hidden rounded-2xl border border-border/70 bg-background/90 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
      <div className="relative h-28 overflow-hidden">
        <img src={tpl.thumbnail} alt={tpl.name} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute left-3 top-3 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-slate-700">
          {tpl.category}
        </div>
      </div>
      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div>
            <div className="text-sm font-semibold text-foreground">{tpl.name}</div>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">{tpl.description}</p>
          </div>
        </div>
        <div className="mt-4">
          <button className="w-full rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground hover:opacity-90" onClick={() => { onUse(); toast.success(`${tpl.name} loaded into the canvas`); }}>
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
      className="group rounded-lg border border-border/70 bg-background/90 hover:border-primary/50 hover:shadow-md transition overflow-hidden cursor-grab"
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData("application/x-wto-section", tpl.id);
        e.dataTransfer.setData("text/plain", tpl.id);
        e.dataTransfer.effectAllowed = "copy";
        window.dispatchEvent(new CustomEvent("wto-library-drag-start", { detail: tpl.id }));
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
        <div className="text-[9px] font-medium truncate flex-1">{tpl.name}</div>
        <button
          className="p-0.5 rounded hover:bg-accent"
          title="Add to canvas"
          onClick={onAdd}
        >
          <Plus className="w-3 h-3" />
        </button>
        <button
          className="p-0.5 rounded hover:bg-accent"
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
