import { create } from "zustand";
import { nanoid } from "nanoid";
import type { SectionTemplate } from "./sections";

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

export interface Page {
  id: string;
  name: string;
  slug: string; // filename without extension, e.g. "index", "about-us"
  sections: PageSection[];
  hidden?: boolean;
}

export interface Project {
  id: string;
  name: string;
  pages: Page[];
  currentPageId: string;
  globalCss: string;
  globalJs: string;
  createdAt: number;
  updatedAt: number;
  assets?: Record<string, string>;
}

interface HistoryEntry {
  pageId: string;
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
}

interface BuilderState {
  projects: Record<string, Project>;
  currentProjectId: string | null;
  selectedSectionId: string | null;
  device: "desktop" | "tablet" | "mobile";
  dark: boolean;
  history: HistoryEntry[];
  historyIndex: number;
  hydrated: boolean;
  leftPanelOpen: boolean;

  setLeftPanelOpen: (v: boolean) => void;
  toggleLeftPanel: () => void;

  hydrate: () => void;
  persist: () => void;

  newProject: (name?: string) => string;
  loadProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => string;
  deleteProject: (id: string) => void;

  addPage: (name?: string, slug?: string) => string;
  renamePage: (id: string, name: string) => void;
  setPageSlug: (id: string, slug: string) => void;
  duplicatePage: (id: string) => string;
  deletePage: (id: string) => void;
  selectPage: (id: string) => void;

  addSection: (tpl: SectionTemplate, index?: number) => void;
  updateSection: (id: string, patch: Partial<PageSection>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  toggleCollapsed: (id: string) => void;
  toggleHidden: (id: string) => void;
  selectSection: (id: string | null) => void;

  setGlobalCss: (v: string) => void;
  setGlobalJs: (v: string) => void;
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
  const p = raw as Partial<Project> & { sections?: PageSection[] };
  if (p.pages && p.currentPageId) {
    return {
      id: String(p.id),
      name: p.name ?? "Untitled",
      pages: p.pages,
      currentPageId: p.currentPageId,
      globalCss: p.globalCss ?? "/* Global CSS */\n",
      globalJs: p.globalJs ?? "// Global JS\n",
      createdAt: p.createdAt ?? Date.now(),
      updatedAt: p.updatedAt ?? Date.now(),
      assets: p.assets,
    };
  }
  const pageId = nanoid(8);
  return {
    id: String(p.id ?? nanoid(8)),
    name: p.name ?? "Untitled",
    pages: [
      {
        id: pageId,
        name: "Home",
        slug: "index",
        sections: p.sections ?? [],
      },
    ],
    currentPageId: pageId,
    globalCss: p.globalCss ?? "/* Global CSS */\n",
    globalJs: p.globalJs ?? "// Global JS\n",
    createdAt: p.createdAt ?? Date.now(),
    updatedAt: p.updatedAt ?? Date.now(),
    assets: p.assets,
  };
}

function loadFromStorage(): { projects: Record<string, Project>; currentProjectId: string | null; leftPanelOpen?: boolean } {
  if (typeof window === "undefined") return { projects: {}, currentProjectId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_KEY);
    if (!raw) return { projects: {}, currentProjectId: null };
    const parsed = JSON.parse(raw) as { projects: Record<string, unknown>; currentProjectId: string | null };
    const projects: Record<string, Project> = {};
    for (const [id, p] of Object.entries(parsed.projects || {})) {
      projects[id] = migrateProject(p);
    }
    return { projects, currentProjectId: parsed.currentProjectId ?? null, leftPanelOpen: (parsed as any).leftPanelOpen };
  } catch {
    return { projects: {}, currentProjectId: null };
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
    createdAt: Date.now(),
    updatedAt: Date.now(),
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

export const useBuilder = create<BuilderState>((set, get) => ({
  projects: {},
  currentProjectId: null,
  selectedSectionId: null,
  device: "desktop",
  dark: false,
  history: [],
  historyIndex: -1,
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    const { projects, currentProjectId, leftPanelOpen } = loadFromStorage();
    let pid = currentProjectId;
    let projs = projects;
    if (!pid || !projs[pid]) {
      const proj = emptyProject();
      projs = { ...projs, [proj.id]: proj };
      pid = proj.id;
    }
    set({ projects: projs, currentProjectId: pid, hydrated: true, leftPanelOpen: leftPanelOpen ?? true });
    const p = projs[pid];
    const page = getCurrentPage(p)!;
    set({
      history: [{ pageId: page.id, sections: page.sections, globalCss: p.globalCss, globalJs: p.globalJs }],
      historyIndex: 0,
    });
  },

  persist: () => {
    if (typeof window === "undefined") return;
    const { projects, currentProjectId } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, currentProjectId, leftPanelOpen: get().leftPanelOpen }));
    } catch {
      /* ignore */
    }
  },

  leftPanelOpen: true,
  setLeftPanelOpen: (v) => set({ leftPanelOpen: v }),
  toggleLeftPanel: () => set((s) => ({ leftPanelOpen: !s.leftPanelOpen })),

  currentProject: () => {
    const { projects, currentProjectId } = get();
    return currentProjectId ? projects[currentProjectId] ?? null : null;
  },
  currentPage: () => getCurrentPage(get().currentProject()),

  newProject: (name = "Untitled Project") => {
    const p = emptyProject(name);
    const page = p.pages[0];
    set((s) => ({
      projects: { ...s.projects, [p.id]: p },
      currentProjectId: p.id,
      selectedSectionId: null,
      history: [{ pageId: page.id, sections: [], globalCss: p.globalCss, globalJs: p.globalJs }],
      historyIndex: 0,
    }));
    get().persist();
    return p.id;
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

  addSection: (tpl, index) => {
    const p = get().currentProject();
    const page = getCurrentPage(p);
    if (!p || !page) return;
    const section: PageSection = {
      id: nanoid(8),
      templateId: tpl.id,
      name: tpl.name,
      html: tpl.html,
    };
    const sections = [...page.sections];
    const at = index ?? sections.length;
    sections.splice(at, 0, section);
    updatePageSections(set, get, sections);
    get().pushHistory();
    set({ selectedSectionId: section.id });
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
    if (get().selectedSectionId === id) set({ selectedSectionId: null });
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

  selectSection: (id) => set({ selectedSectionId: id }),

  addAsset: (dataUrl, extHint) => {
    const p = get().currentProject();
    if (!p) return "";
    const mimeMatch = /^data:([^;]+);/.exec(dataUrl);
    const mime = mimeMatch?.[1] ?? "image/png";
    const ext =
      extHint?.replace(/^\./, "").toLowerCase() ||
      (mime.split("/")[1] || "png").replace("jpeg", "jpg");
    const assets = { ...(p.assets ?? {}) };
    let n = Object.keys(assets).length + 1;
    let filename = `image-${n}.${ext}`;
    while (assets[filename]) {
      n += 1;
      filename = `image-${n}.${ext}`;
    }
    assets[filename] = dataUrl;
    updateCurrent(set, get, { assets });
    return `images/${filename}`;
  },

  setGlobalCss: (v) => {
    updateCurrent(set, get, { globalCss: v });
  },
  setGlobalJs: (v) => {
    updateCurrent(set, get, { globalJs: v });
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
