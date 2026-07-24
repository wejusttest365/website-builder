 import { saveBuilderProject, getBuilderProject } from "@/services/builderProject";
import { create } from "zustand";
import { nanoid } from "nanoid"; 
import type { SectionTemplate } from "./sections";
import type { TemplateDefinition } from "./templates";
import { createImageAssetReference, normalizeAssetMap, saveImageBlob, type BuilderAssetEntry } from "./image-storage";
loadCloudProject: (id: string) => Promise<void>;
export interface PageSection {
  id: string;
  templateId: string;
  name: string;
  html: string;
  collapsed?: boolean;
  style?: Record<string, string>;
  className?: string;
  domId?: string;
  hidden?: boolean;
  animation?: {
    type: string; // fade-in | fade-up | fade-down | slide-left | slide-right | zoom-in | zoom-out | flip | bounce
    duration?: number; // ms
    delay?: number; // ms
    repeat?: boolean;
  };
  sticky?: boolean; // for nav/header sections
  // shared marker for header/footer sections that are synced across pages
  shared?: "header" | "footer";
  sharedKey?: string;
}

export interface PageSeo {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  robots?: string;
  author?: string;
  language?: string;
  viewport?: string;
  charset?: string;
  openGraphTitle?: string;
  openGraphDescription?: string;
  openGraphImage?: string;
  openGraphUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  structuredData?: string;
  customHeadHtml?: string;
  customCss?: string;
  customJs?: string;
}

export interface ProjectSeo {
  googleAnalyticsId?: string;
  googleTagManagerId?: string;
  googleSearchConsoleVerification?: string;
  googleSiteVerification?: string;
  bingVerification?: string;
  facebookPixelId?: string;
  metaPixelId?: string;
  googleAdsConversionId?: string;
  googleAdsConversionLabel?: string;
  themeColor?: string;
  favicon?: string;
  appleTouchIcon?: string;
  language?: string;
  viewport?: string;
  charset?: string;
}

export interface Page {
  id: string;
  name: string;
  slug: string; // filename without extension, e.g. "index", "about-us"
  sections: PageSection[];
  hidden?: boolean;
  description?: string; // SEO meta description
  keywords?: string; // SEO meta keywords
  seo?: PageSeo;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  currentPageId: string;
  globalCss: string;
  globalJs: string;
  customHead: string; // Custom HTML for head (GA tracking, etc.)
  seo?: ProjectSeo;
  createdAt: number;
  updatedAt: number;
  publishedAt?: number;
  thumbnail?: string;
  assets?: Record<string, BuilderAssetEntry>;
  selectedTemplateId?: string | null;
  description?: string;
  keywords?: string;
}

interface HistoryEntry {
  pageId: string;
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
}

interface SelectedElementInfo {
  kind: "section" | "text" | "image" | "link" | "container";
  index: number | null;
  tag?: string;
}

interface BuilderState {
  projects: Record<string, Project>;
  currentProjectId: string | null;
  selectedSectionId: string | null;
  selectedElement: SelectedElementInfo | null;
  selectedElementStyle: Record<string, string> | null;
  device: "desktop" | "tablet" | "mobile";
  dark: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  hydrated: boolean;
  leftPanelOpen: boolean;
  leftPanelView:
   | "dashboard"
  | "projects"
  | "pages"
  | "templates"
  | "widgets"
  | "favorites"
  | "shared"
  | "trash"
  
  showProjectDashboard: boolean;

  setLeftPanelOpen: (v: boolean) => void;
  toggleLeftPanel: () => void;
  setLeftPanelView: (
    view:
    | "dashboard"
    | "projects"
    | "pages"
    | "templates"
    | "widgets"
    | "favorites"
    | "shared"
    | "trash"
   
  ) => void;
  setShowProjectDashboard: (show: boolean) => void;
  setSelectedElementStyle: (style: Record<string, string> | null) => void;

  hydrate: () => void;
  persist: () => boolean;

  saveBuilderProject: (name?: string) => string;
  newProject: (name?: string) => string;
  selectProject: (id: string) => void;
  loadProject: (id: string) => void;
  loadCloudProject: (id: string) => Promise<void>;

  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => string;
  deleteProject: (id: string) => void;
  publishProject: (id: string) => void;

  addPage: (name?: string, slug?: string) => string;
  renamePage: (id: string, name: string) => void;
  setPageSlug: (id: string, slug: string) => void;
  duplicatePage: (id: string) => string;
  deletePage: (id: string) => void;
  selectPage: (id: string) => void;

  addSection: (tpl: SectionTemplate, index?: number) => string;
  applyTemplate: (tpl: TemplateDefinition) => void;
  updateSection: (id: string, patch: Partial<PageSection>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  toggleCollapsed: (id: string) => void;
  toggleHidden: (id: string) => void;
  selectSection: (id: string | null) => void;
  selectElement: (value: SelectedElementInfo | null) => void;

  setGlobalCss: (v: string) => void;
  setGlobalJs: (v: string) => void;
  setCustomHead: (v: string) => void;
  setPageSeo: (id: string, patch: Partial<PageSeo>) => void;
  setProjectSeo: (patch: Partial<ProjectSeo>) => void;
  setPageDescription: (id: string, v: string) => void;
  setPageKeywords: (id: string, v: string) => void;
  setSectionHtml: (id: string, html: string) => void;
  setPageHtml: (html: string) => void; // replaces all sections with a single custom block

  setDevice: (d: "desktop" | "tablet" | "mobile") => void;
  toggleDark: () => void;

  addAsset: (dataUrl: string, extHint?: string) => string;

  undo: () => void;
  redo: () => void;
  pushHistory: () => void;

  currentProject: () => Project | null;
  currentPage: () => Page | null;
}

const STORAGE_KEY = "wto-builder-v2";
const LEGACY_KEY = "wto-builder-v1";
const DB_NAME = "wto-builder-db";
const DB_STORE = "projects";

function slugify(s: string) {
  return (
    s
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "page"
  );
}

// Best-effort migration of a legacy Project (with `sections`) into a
// single-page Project with `pages`.
function migrateProject(raw: unknown): Project {
  const p = raw as Partial<Project> & { sections?: PageSection[]; description?: string; keywords?: string };
  if (p.pages && p.currentPageId) {
    const pages: Page[] = p.pages.map((page): Page => ({
      ...page,
      description: page.description ?? "",
      keywords: page.keywords ?? "",
    }));
    return {
      id: String(p.id),
      name: p.name ?? "Untitled",
      pages,
      currentPageId: p.currentPageId,
      globalCss: p.globalCss ?? "/* Global CSS */\n",
      globalJs: p.globalJs ?? "// Global JS\n",
      customHead: p.customHead ?? "",
      createdAt: p.createdAt ?? Date.now(),
      updatedAt: p.updatedAt ?? Date.now(),
      assets: p.assets,
    };
  }
  const pageId = nanoid(8);
  const pages: Page[] = [
    {
      id: pageId,
      name: "Home",
      slug: "index",
      sections: p.sections ?? [],
      description: p.description ?? "",
      keywords: p.keywords ?? "",
    },
  ];
  return {
    id: String(p.id ?? nanoid(8)),
    name: p.name ?? "Untitled",
    pages,
    currentPageId: pageId,
    globalCss: p.globalCss ?? "/* Global CSS */\n",
    globalJs: p.globalJs ?? "// Global JS\n",
    customHead: p.customHead ?? "",
    createdAt: p.createdAt ?? Date.now(),
    updatedAt: p.updatedAt ?? Date.now(),
    assets: p.assets,
  };
}

type StoredLeftPanelView =
  | "dashboard"
  | "projects"
  | "pages"
  | "templates"
  | "widgets"
  | "favorites"
  | "shared"
  | "trash";

function normalizeStoredLeftPanelView(
  view: StoredLeftPanelView | undefined
): BuilderState["leftPanelView"] | undefined {
  return view;
}

function loadFromStorage(): { projects: Record<string, Project>; currentProjectId: string | null; leftPanelOpen?: boolean; leftPanelView?: StoredLeftPanelView } {
  if (typeof window === "undefined") return { projects: {}, currentProjectId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY) ?? sessionStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(LEGACY_KEY);
    if (!raw) return { projects: {}, currentProjectId: null };
    const parsed = JSON.parse(raw) as { projects: Record<string, unknown>; currentProjectId: string | null };
    const projects: Record<string, Project> = {};
    for (const [id, p] of Object.entries(parsed.projects || {})) {
      const migrated = migrateProject(p);
      migrated.assets = normalizeAssetMap(migrated.assets as Record<string, unknown> | undefined) as Record<string, BuilderAssetEntry> | undefined;
      projects[id] = migrated;
    }
    return {
      projects,
      currentProjectId: parsed.currentProjectId ?? null,
      leftPanelOpen: (parsed as any).leftPanelOpen,
      leftPanelView: (parsed as any).leftPanelView,
    };
  } catch {
    return { projects: {}, currentProjectId: null };
  }
}

function isStorageAvailable(storage: Storage | null): boolean {
  if (!storage) return false;
  try {
    const testKey = "__wto_storage_test__";
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

function requestPersistentStorage(): void {
  if (typeof window === "undefined" || typeof navigator === "undefined") return;
  const storageApi = (navigator as Navigator & { storage?: { persist?: () => Promise<boolean> } }).storage;
  if (!storageApi?.persist) return;
  void storageApi.persist().catch(() => undefined);
}

function writeToIndexedDB(payload: string): boolean {
  if (typeof window === "undefined" || !("indexedDB" in window)) return false;
  try {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(DB_STORE)) {
        db.createObjectStore(DB_STORE);
      }
    };
    request.onsuccess = () => {
      const db = request.result;
      const tx = db.transaction(DB_STORE, "readwrite");
      tx.objectStore(DB_STORE).put(payload, STORAGE_KEY);
      tx.oncomplete = () => db.close();
      tx.onerror = () => db.close();
    };
    request.onerror = () => undefined;
    return true;
  } catch {
    return false;
  }
}

function emptyProject(name = "Untitled Project"): Project {
  const id = nanoid(8);
  const pageId = nanoid(8);
  return {
    id,
    name,
    pages: [{ id: pageId, name: "Home", slug: "index", sections: [] }],
    currentPageId: pageId,
    globalCss: "/* Global CSS */\n",
    globalJs: "// Global JS\n",
    customHead: "",
    createdAt: Date.now(),
    updatedAt: Date.now(),
    thumbnail: undefined,
  };
}

function getCurrentPage(project: Project | null): Page | null {
  if (!project) return null;
  return project.pages.find((p) => p.id === project.currentPageId) ?? project.pages[0] ?? null;
}

// Public helper so views/exports can pick the current page.
export function pageOf(project: Project | null): Page | null {
  return getCurrentPage(project);
}

void requestPersistentStorage();

export const useBuilder = create<BuilderState>((set, get) => ({
  projects: {},
  currentProjectId: null,
  selectedSectionId: null,
  selectedElement: null,
  selectedElementStyle: null,
  device: "desktop",
  dark: false,
  history: [],
  historyIndex: -1,
  hydrated: false,
  showProjectDashboard: false,

  setShowProjectDashboard: (show) => set({ showProjectDashboard: show }),

  hydrate: () => {
    if (get().hydrated) return;
    const { projects, currentProjectId, leftPanelOpen, leftPanelView } = loadFromStorage();
    let pid = currentProjectId;
    let projs = projects;
   if (!pid || !projs[pid]) {
  // Don't create a new project here.
  // Editor route will load the project (local/cloud).
  set({
    projects: projs,
    currentProjectId: null,
    hydrated: true,
    leftPanelOpen: leftPanelOpen ?? true,
    leftPanelView: normalizeStoredLeftPanelView(leftPanelView) ?? "pages",
  });
  return;
}
    set({ projects: projs, currentProjectId: pid, hydrated: true, leftPanelOpen: leftPanelOpen ?? true, leftPanelView: normalizeStoredLeftPanelView(leftPanelView) ?? "pages" });
    const p = projs[pid];
    const page = getCurrentPage(p)!;
    set({
      history: [{ pageId: page.id, sections: page.sections, globalCss: p.globalCss, globalJs: p.globalJs }],
      historyIndex: 0,
    });
  },

  persist: () => {
    if (typeof window === "undefined") return false;
    const { projects, currentProjectId } = get();
    const payload = JSON.stringify({ projects, currentProjectId, leftPanelOpen: get().leftPanelOpen, leftPanelView: get().leftPanelView });

    if (isStorageAvailable(window.localStorage)) {
      try {
        localStorage.setItem(STORAGE_KEY, payload);
        requestPersistentStorage();
        return true;
      } catch (err) {
        console.warn("localStorage save failed, falling back to other storage options", err);
      }
    }

    if (isStorageAvailable(window.sessionStorage)) {
      try {
        sessionStorage.setItem(STORAGE_KEY, payload);
        requestPersistentStorage();
        return true;
      } catch (err) {
        console.warn("sessionStorage save failed, falling back to IndexedDB", err);
      }
    }

    const wroteToIndexedDb = writeToIndexedDB(payload);
    if (wroteToIndexedDb) {
      requestPersistentStorage();
      return true;
    }

    console.error("Persist failed for all available storage backends.");
    return false;
  },

  leftPanelOpen: true,
  leftPanelView: "pages",
  setLeftPanelOpen: (v) => set({ leftPanelOpen: v }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),
  setLeftPanelView: (view) => set({ leftPanelView: view }),
  setSelectedElementStyle: (style) => set({ selectedElementStyle: style }),

  currentProject: () => {
    const { projects, currentProjectId } = get();
    return currentProjectId ? projects[currentProjectId] ?? null : null;
  },
  currentPage: () => getCurrentPage(get().currentProject()),

  saveBuilderProject: (name = "Untitled Project") => {
    return get().newProject(name);
  },

  newProject: (name = "Untitled Project") => {
  const p = emptyProject(name);
  const page = p.pages[0];

  set((s) => ({
    projects: { ...s.projects, [p.id]: p },
    currentProjectId: p.id,
    selectedSectionId: null,
    showProjectDashboard: false,      // <-- ADD THIS
    leftPanelOpen: true,              // <-- ADD THIS
    leftPanelView: "widgets",         // <-- ADD THIS

    history: [{
      pageId: page.id,
      sections: [],
      globalCss: p.globalCss,
      globalJs: p.globalJs,
    }],
    historyIndex: 0,
  }));

  get().persist();
  return p.id;
},

  selectProject: (id) => {
    get().loadProject(id);
  },

  loadProject: (id) => {
    const p = get().projects[id];
    if (!p) return;
    const page = getCurrentPage(p)!;
    set({
      currentProjectId: id,
      selectedSectionId: null,
      history: [{ pageId: page.id, sections: page.sections, globalCss: p.globalCss, globalJs: p.globalJs }],
      historyIndex: 0,
    });
    get().persist();
  },
  
 loadCloudProject: async (id: string) => {
  const project = await getBuilderProject(id);

  if (!project) return;

  const page = getCurrentPage(project)!;

  set((s) => ({
    projects: {
      ...s.projects,
      [project.id]: project,
    },
    currentProjectId: project.id,
    selectedSectionId: null,
    history: [
      {
        pageId: page.id,
        sections: page.sections,
        globalCss: project.globalCss,
        globalJs: project.globalJs,
      },
    ],
    historyIndex: 0,
  }));

  get().persist();
},
  renameProject: (id, name) => {
    set((s) => {
      const p = s.projects[id];
      if (!p) return s;
      return { projects: { ...s.projects, [id]: { ...p, name, updatedAt: Date.now() } } };
    });
    get().persist();
  },

  duplicateProject: (id) => {
    const src = get().projects[id];
    if (!src) return "";
    const nid = nanoid(8);
    const copy: Project = {
      ...JSON.parse(JSON.stringify(src)),
      id: nid,
      name: src.name + " (copy)",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      publishedAt: undefined,
    };
    set((s) => ({ projects: { ...s.projects, [nid]: copy } }));
    get().persist();
    return nid;
  },

  deleteProject: (id) => {
    set((s) => {
      const next = { ...s.projects };
      delete next[id];
      const stillCurrent = s.currentProjectId === id ? null : s.currentProjectId;
      return { projects: next, currentProjectId: stillCurrent };
    });
    get().persist();
    if (!get().currentProjectId) get().newProject();
  },

  publishProject: (id) => {
    set((s) => {
      const project = s.projects[id];
      if (!project) return s;
      const next: Project = { ...project, publishedAt: Date.now(), updatedAt: Date.now() };
      return { projects: { ...s.projects, [id]: next } };
    });
    get().persist();
  },

  // -------- Pages --------
  addPage: (name = "New Page", slug) => {
    const p = get().currentProject();
    if (!p) return "";
    const id = nanoid(8);
    let s = slug ? slugify(slug) : slugify(name);
    while (p.pages.some((pg) => pg.slug === s)) s += "-1";
    // Copy shared header/footer sections from an existing page (prefer first page)
    const src = p.pages[0] ?? null;
    const sharedSections: PageSection[] = [];
    if (src) {
      for (const sec of src.sections) {
        if ((sec as any).shared) {
          const copy: PageSection = { ...JSON.parse(JSON.stringify(sec)), id: nanoid(8) };
          sharedSections.push(copy);
        }
      }
    }
    const page: Page = { id, name, slug: s, sections: sharedSections };
    updateCurrent(set, get, { pages: [...p.pages, page], currentPageId: id });
    set({ selectedSectionId: null });
    get().pushHistory();
    return id;
  },
  renamePage: (id, name) => {
    const p = get().currentProject();
    if (!p) return;
    updateCurrent(set, get, {
      pages: p.pages.map((pg) => (pg.id === id ? { ...pg, name } : pg)),
    });
  },
  setPageSlug: (id, slug) => {
    const p = get().currentProject();
    if (!p) return;
    const s = slugify(slug);
    updateCurrent(set, get, {
      pages: p.pages.map((pg) => (pg.id === id ? { ...pg, slug: s } : pg)),
    });
  },
  duplicatePage: (id) => {
    const p = get().currentProject();
    if (!p) return "";
    const src = p.pages.find((pg) => pg.id === id);
    if (!src) return "";
    const nid = nanoid(8);
    let s = src.slug + "-copy";
    while (p.pages.some((pg) => pg.slug === s)) s += "-1";
    const copy: Page = {
      ...JSON.parse(JSON.stringify(src)),
      id: nid,
      name: src.name + " (copy)",
      slug: s,
    };
    updateCurrent(set, get, { pages: [...p.pages, copy], currentPageId: nid });
    return nid;
  },
  deletePage: (id) => {
    const p = get().currentProject();
    if (!p || p.pages.length <= 1) return;
    const nextPages = p.pages.filter((pg) => pg.id !== id);
    const nextCurrent = p.currentPageId === id ? nextPages[0].id : p.currentPageId;
    updateCurrent(set, get, { pages: nextPages, currentPageId: nextCurrent });
    set({ selectedSectionId: null });
    get().pushHistory();
  },
  selectPage: (id) => {
    const p = get().currentProject();
    if (!p || !p.pages.some((pg) => pg.id === id)) return;
    updateCurrent(set, get, { currentPageId: id });
    set({ selectedSectionId: null });
  },

  pushHistory: () => {
    const p = get().currentProject();
    const page = getCurrentPage(p);
    if (!p || !page) return;
    const snap: HistoryEntry = {
      pageId: page.id,
      sections: JSON.parse(JSON.stringify(page.sections)),
      globalCss: p.globalCss,
      globalJs: p.globalJs,
    };
    set((s) => {
      const trimmed = s.history.slice(0, s.historyIndex + 1);
      const next = [...trimmed, snap].slice(-100);
      return { history: next, historyIndex: next.length - 1 };
    });
  },

  addSection: (tpl: SectionTemplate, index?: number): string => {
    const project = get().currentProject();
    if (!project) return "";
    const page = getCurrentPage(project);
    if (!page) return "";
    const sectionId: string = nanoid(8);
    const section: PageSection = {
      id: sectionId,
      templateId: tpl.id,
      name: tpl.name,
      html: tpl.html,
      animation: { type: "fade-up", duration: 700, delay: 0 },
    };
    const sections = [...page.sections];
    const at = index ?? sections.length;
    sections.splice(at, 0, section);
    updatePageSections(set, get, sections);
    get().pushHistory();
    set({ selectedSectionId: sectionId });
    return sectionId;
  },

  applyTemplate: (tpl) => {
    const current = get().currentProject();
    if (!current) return;

    const createSection = (section: any, key?: string, delayOffset = 0): PageSection => {
      const shared: "header" | "footer" | undefined = section.type === "header" ? "header" : section.type === "footer" ? "footer" : undefined;
      return {
        id: nanoid(8),
        templateId: `${tpl.id}-${section.name}-${key ?? nanoid(8)}`,
        name: section.name,
        html: section.html,
        style: section.style,
        className: section.className,
        collapsed: section.collapsed,
        hidden: section.hidden,
        animation: { type: "fade-up", duration: 700, delay: delayOffset },
        ...(shared ? { shared, sharedKey: key } : {}),
      };
    };

    const templateProjectSeo = (tpl as any).projectSeo ?? (tpl as any).seo;
    const resetProjectBase: Partial<Project> = {
      name: current.name || tpl.name,
      selectedTemplateId: tpl.id,
      globalCss: tpl.globalCss ?? current.globalCss ?? "/* Global CSS */\n",
      globalJs: tpl.globalJs ?? current.globalJs ?? "// Global JS\n",
      customHead: tpl.customHead ?? current.customHead ?? "",
      seo: templateProjectSeo ? { ...templateProjectSeo } : current.seo,
      assets: current.assets ?? {},
      description: current.description,
      keywords: current.keywords,
      updatedAt: Date.now(),
    };

    const buildTemplatePage = (pageDef: any) => {
      const sharedHeader = (tpl.sharedSections ?? []).filter((section) => section.type === "header");
      const sharedFooter = (tpl.sharedSections ?? []).filter((section) => section.type === "footer");
      const pageSections: PageSection[] = [];

      sharedHeader.forEach((section, index) => {
        pageSections.push(createSection(section, `${tpl.id}-shared-header-${index}`, index * 80));
      });
      pageDef.sections.forEach((section: any, index: number) => {
        pageSections.push(createSection(section, undefined, sharedHeader.length * 80 + index * 80));
      });
      sharedFooter.forEach((section, index) => {
        pageSections.push(createSection(section, `${tpl.id}-shared-footer-${index}`, (sharedHeader.length + pageDef.sections.length + index) * 80));
      });

      return {
        id: nanoid(8),
        name: pageDef.name ?? "Home",
        slug: slugify(pageDef.slug ?? pageDef.name ?? "index"),
        description: pageDef.description,
        keywords: pageDef.keywords,
        seo: pageDef.seo ? { ...pageDef.seo } : undefined,
        sections: pageSections,
      };
    };

    if (tpl.pages && tpl.pages.length > 0) {
      const pages = tpl.pages.map(buildTemplatePage);
      const firstPageId = pages[0].id;
      updateCurrent(set, get, {
        ...resetProjectBase,
        pages,
        currentPageId: firstPageId,
      });
      set({ selectedSectionId: null, selectedElement: null, selectedElementStyle: null, history: [{ pageId: firstPageId, sections: JSON.parse(JSON.stringify(pages[0].sections)), globalCss: resetProjectBase.globalCss ?? "", globalJs: resetProjectBase.globalJs ?? "" }], historyIndex: 0 });
      get().persist();
      return;
    }

    const sections = tpl.sections.map((section, index) => ({
      id: nanoid(8),
      templateId: `${tpl.id}-${index}`,
      name: section.name,
      html: section.html,
      style: section.style,
      className: section.className,
      collapsed: section.collapsed,
      hidden: section.hidden,
      animation: { type: "fade-up", duration: 700, delay: index * 80 },
    }));
    const page = {
      id: nanoid(8),
      name: "Home",
      slug: "index",
      sections,
    };
    updateCurrent(set, get, {
      ...resetProjectBase,
      pages: [page],
      currentPageId: page.id,
    });
    set({ selectedSectionId: null, selectedElement: null, selectedElementStyle: null, history: [{ pageId: page.id, sections: JSON.parse(JSON.stringify(page.sections)), globalCss: resetProjectBase.globalCss ?? "", globalJs: resetProjectBase.globalJs ?? "" }], historyIndex: 0 });
    get().persist();
  },

  updateSection: (id, patch) => {
    const cur = get().currentProject();
    if (!cur) return;
    // find original section and its sharedKey (if any)
    let original: PageSection | null = null;
    for (const pg of cur.pages) {
      const s = pg.sections.find((ss) => ss.id === id);
      if (s) {
        original = s;
        break;
      }
    }
    if (!original) return;
    const sharedKey = (original as any).sharedKey as string | undefined;
    const pages = cur.pages.map((pg) => {
      // if we're turning this section into a shared section and this page lacks it,
      // insert a copy in the appropriate place.
      const hasShared = (pg.sections || []).some((s) => (s as any).sharedKey === (patch as any).sharedKey);
      let sections = pg.sections.map((s) => {
        if (s.id === id) return { ...s, ...patch };
        if (sharedKey && (s as any).sharedKey === sharedKey) return { ...s, ...patch };
        return s;
      });
      if ((patch as any).shared && (patch as any).sharedKey && !hasShared) {
        // create a copy of the updated section for this page
        const copy: PageSection = { ...JSON.parse(JSON.stringify({ ...original, ...patch })), id: nanoid(8) };
        if ((patch as any).shared === "header") {
          sections = [copy, ...sections];
        } else {
          sections = [...sections, copy];
        }
      }
      return { ...pg, sections };
    });
    updateCurrent(set, get, { pages });
  },

  removeSection: (id) => {
    const cur = get().currentProject();
    if (!cur) return;
    const page = getCurrentPage(cur);
    if (!page) return;
    const removedIndex = page.sections.findIndex((s) => s.id === id);
    if (removedIndex < 0) return;

    // check if section is shared and remove from all pages
    let original: PageSection | null = null;
    for (const pg of cur.pages) {
      const s = pg.sections.find((ss) => ss.id === id);
      if (s) {
        original = s;
        break;
      }
    }
    if (!original) return;
    const sharedKey = (original as any).sharedKey as string | undefined;
    const pages = cur.pages.map((pg) => ({
      ...pg,
      sections: pg.sections.filter((s) => {
        if (s.id === id) return false;
        if (sharedKey && (s as any).sharedKey === sharedKey) return false;
        return true;
      }),
    }));
    updateCurrent(set, get, { pages });
    get().pushHistory();

    const currentlySelected = get().selectedSectionId;
    if (currentlySelected === id) {
      const nextPage = getCurrentPage(get().currentProject());
      const nextId = nextPage?.sections?.[Math.min(Math.max(0, removedIndex), (nextPage.sections.length || 1) - 1)]?.id ?? null;
      set({ selectedSectionId: nextId });
    }
  },

  duplicateSection: (id) => {
    const page = getCurrentPage(get().currentProject());
    if (!page) return;
    const idx = page.sections.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const copy: PageSection = { ...JSON.parse(JSON.stringify(page.sections[idx])), id: nanoid(8) };
    const sections = [...page.sections];
    sections.splice(idx + 1, 0, copy);
    updatePageSections(set, get, sections);
    get().pushHistory();
  },

  moveSection: (from, to) => {
    const page = getCurrentPage(get().currentProject());
    if (!page) return;
    const sections = [...page.sections];
    const [item] = sections.splice(from, 1);
    if (!item) return;
    sections.splice(to, 0, item);
    updatePageSections(set, get, sections);
    get().pushHistory();
  },

  toggleCollapsed: (id) => {
    const page = getCurrentPage(get().currentProject());
    if (!page) return;
    const sections = page.sections.map((s) =>
      s.id === id ? { ...s, collapsed: !s.collapsed } : s,
    );
    updatePageSections(set, get, sections);
  },
  toggleHidden: (id) => {
    const page = getCurrentPage(get().currentProject());
    if (!page) return;
    const sections = page.sections.map((s) =>
      s.id === id ? { ...s, hidden: !s.hidden } : s,
    );
    updatePageSections(set, get, sections);
  },

  selectSection: (id) => set({ selectedSectionId: id, selectedElement: null, selectedElementStyle: null }),
  selectElement: (value) => set({ selectedElement: value, selectedElementStyle: null }),

  addAsset: (dataUrl, filenameHint) => {
    try {
      const p = get().currentProject();
      if (!p) return "";
      const { ref, blob } = createImageAssetReference(dataUrl, filenameHint);
      void saveImageBlob(ref.imageId, ref.filename, blob, ref.mimeType);
      const assets = { ...(p.assets ?? {}) } as Record<string, BuilderAssetEntry>;
      assets[ref.filename] = ref;
      updateCurrent(set, get, { assets });
      return `images/${ref.filename}`;
    } catch (err) {
      console.error("addAsset failed", err);
      return "";
    }
  },

  setGlobalCss: (v) => {
    updateCurrent(set, get, { globalCss: v });
  },
  setGlobalJs: (v) => {
    updateCurrent(set, get, { globalJs: v });
  },
  setCustomHead: (v) => {
    updateCurrent(set, get, { customHead: v });
  },
  setPageSeo: (id, patch) => {
    const p = get().currentProject();
    if (!p) return;
    updateCurrent(set, get, {
      pages: p.pages.map((pg) => {
        if (pg.id !== id) return pg;
        const nextSeo = { ...pg.seo, ...patch };
        const nextPage: Page = { ...pg, seo: nextSeo };
        if (patch.description !== undefined) nextPage.description = patch.description;
        if (patch.keywords !== undefined) nextPage.keywords = patch.keywords;
        return nextPage;
      }),
    });
  },
  setProjectSeo: (patch) => {
    updateCurrent(set, get, {
      seo: { ...get().currentProject()?.seo, ...patch },
    });
  },
  setPageDescription: (id, v) => {
    const p = get().currentProject();
    if (!p) return;
    updateCurrent(set, get, {
      pages: p.pages.map((pg) => {
        if (pg.id !== id) return pg;
        return {
          ...pg,
          description: v,
          seo: { ...pg.seo, description: v },
        };
      }),
    });
  },
  setPageKeywords: (id, v) => {
    const p = get().currentProject();
    if (!p) return;
    updateCurrent(set, get, {
      pages: p.pages.map((pg) => {
        if (pg.id !== id) return pg;
        return {
          ...pg,
          keywords: v,
          seo: { ...pg.seo, keywords: v },
        };
      }),
    });
  },
  setSectionHtml: (id, html) => {
    const page = getCurrentPage(get().currentProject());
    if (!page) return;
    const sections = page.sections.map((s) => (s.id === id ? { ...s, html } : s));
    updatePageSections(set, get, sections);
  },
  setPageHtml: (html) => {
    const page = getCurrentPage(get().currentProject());
    if (!page) return;
    const sections: PageSection[] = [
      { id: nanoid(8), templateId: "custom", name: "Custom HTML", html },
    ];
    updatePageSections(set, get, sections);
    get().pushHistory();
  },

  setDevice: (device) => set({ device }),
  toggleDark: () => set((s) => ({ dark: !s.dark })),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const entry = history[historyIndex - 1];
    applyHistoryEntry(set, get, entry);
    set({ historyIndex: historyIndex - 1 });
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    applyHistoryEntry(set, get, entry);
    set({ historyIndex: historyIndex + 1 });
  },
}));

function updateCurrent(
  set: (fn: (s: BuilderState) => Partial<BuilderState>) => void,
  get: () => BuilderState,
  patch: Partial<Project>,
  persist = true,
) {
  set((s) => {
    if (!s.currentProjectId) return s;
    const cur = s.projects[s.currentProjectId];
    if (!cur) return s;
    const next: Project = { ...cur, ...patch, updatedAt: Date.now() };
    return { projects: { ...s.projects, [s.currentProjectId]: next } };
  });
  if (persist) get().persist();
}

function updatePageSections(
  set: (fn: (s: BuilderState) => Partial<BuilderState>) => void,
  get: () => BuilderState,
  sections: PageSection[],
) {
  set((s) => {
    if (!s.currentProjectId) return s;
    const cur = s.projects[s.currentProjectId];
    if (!cur) return s;
    const pages = cur.pages.map((pg) =>
      pg.id === cur.currentPageId ? { ...pg, sections } : pg,
    );
    return {
      projects: {
        ...s.projects,
        [s.currentProjectId]: { ...cur, pages, updatedAt: Date.now() },
      },
    };
  });
  get().persist();
}

function applyHistoryEntry(
  set: (fn: (s: BuilderState) => Partial<BuilderState>) => void,
  get: () => BuilderState,
  entry: HistoryEntry,
) {
  set((s) => {
    if (!s.currentProjectId) return s;
    const cur = s.projects[s.currentProjectId];
    if (!cur) return s;
    const pages = cur.pages.map((pg) =>
      pg.id === entry.pageId ? { ...pg, sections: entry.sections } : pg,
    );
    return {
      projects: {
        ...s.projects,
        [s.currentProjectId]: {
          ...cur,
          pages,
          currentPageId: entry.pageId,
          globalCss: entry.globalCss,
          globalJs: entry.globalJs,
          updatedAt: Date.now(),
        },
      },
    };
  });
  get().persist();
}
