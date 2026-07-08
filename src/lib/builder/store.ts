import { create } from "zustand";
import { nanoid } from "nanoid";
import type { SectionTemplate } from "./sections";

export interface PageSection {
  id: string;
  templateId: string;
  name: string;
  html: string;
  collapsed?: boolean;
  // Wrapper style overrides applied inline on the section container in the iframe.
  style?: Record<string, string>;
  className?: string;
  domId?: string;
}

export interface Project {
  id: string;
  name: string;
  sections: PageSection[];
  globalCss: string;
  globalJs: string;
  createdAt: number;
  updatedAt: number;
  // Uploaded images: filename (without folder) -> data URL.
  // Referenced from HTML as `images/<filename>`.
  assets?: Record<string, string>;
}

interface HistoryEntry {
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

  hydrate: () => void;
  persist: () => void;

  newProject: (name?: string) => string;
  loadProject: (id: string) => void;
  renameProject: (id: string, name: string) => void;
  duplicateProject: (id: string) => string;
  deleteProject: (id: string) => void;

  addSection: (tpl: SectionTemplate, index?: number) => void;
  updateSection: (id: string, patch: Partial<PageSection>) => void;
  removeSection: (id: string) => void;
  duplicateSection: (id: string) => void;
  moveSection: (fromIndex: number, toIndex: number) => void;
  toggleCollapsed: (id: string) => void;
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
}

const STORAGE_KEY = "wto-builder-v1";

function loadFromStorage(): { projects: Record<string, Project>; currentProjectId: string | null } {
  if (typeof window === "undefined") return { projects: {}, currentProjectId: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { projects: {}, currentProjectId: null };
    return JSON.parse(raw);
  } catch {
    return { projects: {}, currentProjectId: null };
  }
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
    const { projects, currentProjectId } = loadFromStorage();
    let pid = currentProjectId;
    let projs = projects;
    if (!pid || !projs[pid]) {
      // create default
      const id = nanoid(8);
      const proj: Project = {
        id,
        name: "Untitled Project",
        sections: [],
        globalCss: "/* Global CSS */\n",
        globalJs: "// Global JS\n",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      projs = { ...projs, [id]: proj };
      pid = id;
    }
    set({ projects: projs, currentProjectId: pid, hydrated: true });
    const p = projs[pid];
    set({
      history: [{ sections: p.sections, globalCss: p.globalCss, globalJs: p.globalJs }],
      historyIndex: 0,
    });
  },

  persist: () => {
    if (typeof window === "undefined") return;
    const { projects, currentProjectId } = get();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ projects, currentProjectId }));
    } catch {
      /* ignore */
    }
  },

  currentProject: () => {
    const { projects, currentProjectId } = get();
    return currentProjectId ? projects[currentProjectId] ?? null : null;
  },

  newProject: (name = "Untitled Project") => {
    const id = nanoid(8);
    const p: Project = {
      id,
      name,
      sections: [],
      globalCss: "/* Global CSS */\n",
      globalJs: "// Global JS\n",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    set((s) => ({
      projects: { ...s.projects, [id]: p },
      currentProjectId: id,
      selectedSectionId: null,
      history: [{ sections: [], globalCss: p.globalCss, globalJs: p.globalJs }],
      historyIndex: 0,
    }));
    get().persist();
    return id;
  },

  loadProject: (id) => {
    const p = get().projects[id];
    if (!p) return;
    set({
      currentProjectId: id,
      selectedSectionId: null,
      history: [{ sections: p.sections, globalCss: p.globalCss, globalJs: p.globalJs }],
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
      ...src,
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

  pushHistory: () => {
    const p = get().currentProject();
    if (!p) return;
    const snap: HistoryEntry = {
      sections: JSON.parse(JSON.stringify(p.sections)),
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
    if (!p) return;
    const section: PageSection = {
      id: nanoid(8),
      templateId: tpl.id,
      name: tpl.name,
      html: tpl.html,
    };
    const sections = [...p.sections];
    const at = index ?? sections.length;
    sections.splice(at, 0, section);
    updateCurrent(set, get, { sections });
    get().pushHistory();
    set({ selectedSectionId: section.id });
  },

  updateSection: (id, patch) => {
    const p = get().currentProject();
    if (!p) return;
    const sections = p.sections.map((s) => (s.id === id ? { ...s, ...patch } : s));
    updateCurrent(set, get, { sections });
  },

  removeSection: (id) => {
    const p = get().currentProject();
    if (!p) return;
    const sections = p.sections.filter((s) => s.id !== id);
    updateCurrent(set, get, { sections });
    get().pushHistory();
    if (get().selectedSectionId === id) set({ selectedSectionId: null });
  },

  duplicateSection: (id) => {
    const p = get().currentProject();
    if (!p) return;
    const idx = p.sections.findIndex((s) => s.id === id);
    if (idx < 0) return;
    const copy: PageSection = { ...p.sections[idx], id: nanoid(8) };
    const sections = [...p.sections];
    sections.splice(idx + 1, 0, copy);
    updateCurrent(set, get, { sections });
    get().pushHistory();
  },

  moveSection: (from, to) => {
    const p = get().currentProject();
    if (!p) return;
    const sections = [...p.sections];
    const [item] = sections.splice(from, 1);
    sections.splice(to, 0, item);
    updateCurrent(set, get, { sections });
    get().pushHistory();
  },

  toggleCollapsed: (id) => {
    const p = get().currentProject();
    if (!p) return;
    const sections = p.sections.map((s) =>
      s.id === id ? { ...s, collapsed: !s.collapsed } : s,
    );
    updateCurrent(set, get, { sections });
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
    const p = get().currentProject();
    if (!p) return;
    const sections = p.sections.map((s) => (s.id === id ? { ...s, html } : s));
    updateCurrent(set, get, { sections });
  },
  setPageHtml: (html) => {
    const p = get().currentProject();
    if (!p) return;
    const sections: PageSection[] = [
      { id: nanoid(8), templateId: "custom", name: "Custom HTML", html },
    ];
    updateCurrent(set, get, { sections });
    get().pushHistory();
  },

  setDevice: (device) => set({ device }),
  toggleDark: () => set((s) => ({ dark: !s.dark })),

  undo: () => {
    const { history, historyIndex } = get();
    if (historyIndex <= 0) return;
    const entry = history[historyIndex - 1];
    updateCurrent(set, get, entry, false);
    set({ historyIndex: historyIndex - 1 });
  },
  redo: () => {
    const { history, historyIndex } = get();
    if (historyIndex >= history.length - 1) return;
    const entry = history[historyIndex + 1];
    updateCurrent(set, get, entry, false);
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
