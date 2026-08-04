import { nanoid } from "nanoid";
import { createWidgetInstance, type WidgetInstance } from "@/components/builder/widgets/widgetRegistry";
import type { NavbarNavItem } from "@/components/builder/widgets/Navbar/NavbarTypes";
import type { Page, PageSection, Project } from "./store";

export const SHARED_HEADER_SECTION_ID = "wto-shared-header";
export const SHARED_FOOTER_SECTION_ID = "wto-shared-footer";


export function isNavbarSection(section: PageSection | null | undefined): boolean {
  if (!section) return false;
  if (section.shared === "header") return true;
  if (section.widgetInstance?.type === "navbar") return true;
  const name = String(section.name || "").toLowerCase();
  if (name.includes("navbar") || name.includes("header") || name.includes("nav")) return true;
  if (/<nav\b/i.test(section.html || "") || /<header\b/i.test(section.html || "")) return true;
  return false;
}

export function isFooterSection(section: PageSection | null | undefined): boolean {
  if (!section) return false;
  if (section.shared === "footer") return true;
  if (section.widgetInstance?.type === "footer") return true;
  const name = String(section.name || "").toLowerCase();
  if (name.includes("footer")) return true;
  if (/<footer\b/i.test(section.html || "")) return true;
  return false;
}

export function isSharedChromeSection(section: PageSection | null | undefined): boolean {
  if (!section) return false;
  return (
    section.id === SHARED_HEADER_SECTION_ID ||
    section.id === SHARED_FOOTER_SECTION_ID ||
    section.shared === "header" ||
    section.shared === "footer"
  );
}

export function createDefaultSharedHeader(pages: Page[] = []): PageSection {
  const home = pages[0];
  const navItems: NavbarNavItem[] = (pages.length ? pages : [{ id: "home", name: "Home", slug: "index", sections: [] } as Page]).map((page) => ({
    label: page.name,
    href: `page:${page.id}`,
    linkedPageId: page.id,
    autoLabel: true,
  }));
  const widgetInstance = createWidgetInstance("navbar", {
    id: `navbar-${nanoid(6)}`,
    content: {
      logoText: "Brand",
      navItems,
    },
  });
  return {
    id: SHARED_HEADER_SECTION_ID,
    templateId: "shared-navbar",
    name: "Header",
    html: "",
    widgetInstance,
    shared: "header",
    sticky: true,
  };
}

export function createDefaultSharedFooter(): PageSection {
  const widgetInstance = createWidgetInstance("footer", {
    id: `footer-${nanoid(6)}`,
  });
  return {
    id: SHARED_FOOTER_SECTION_ID,
    templateId: "shared-footer",
    name: "Footer",
    html: "",
    widgetInstance,
    shared: "footer",
  };
}

export function normalizeSharedSection(
  section: PageSection,
  role: "header" | "footer",
): PageSection {
  return {
    ...section,
    id: role === "header" ? SHARED_HEADER_SECTION_ID : SHARED_FOOTER_SECTION_ID,
    shared: role,
    sharedKey: role === "header" ? "global-header" : "global-footer",
    name: role === "header" ? section.name || "Header" : section.name || "Footer",
  };
}

export function pageUsesGlobalHeader(page: Page | null | undefined): boolean {
  if (!page) return true;
  if (page.useGlobalHeader === false) return false;
  return true;
}

export function pageUsesGlobalFooter(page: Page | null | undefined): boolean {
  if (!page) return true;
  if (page.useGlobalFooter === false) return false;
  return true;
}

export function pageHidesHeader(page: Page | null | undefined): boolean {
  return Boolean(page?.hideHeader);
}

export function pageHidesFooter(page: Page | null | undefined): boolean {
  return Boolean(page?.hideFooter);
}

/** Compose render order: shared header + page sections + shared footer. */
export function composePageSections(
  project: Project | null | undefined,
  page: Page | null | undefined,
  opts?: { includeHiddenChrome?: boolean },
): PageSection[] {
  if (!project || !page) return page?.sections ?? [];
  const out: PageSection[] = [];
  const includeHidden = opts?.includeHiddenChrome === true;

  if (project.sharedHeader && pageUsesGlobalHeader(page) && (includeHidden || !pageHidesHeader(page))) {
    out.push({
      ...project.sharedHeader,
      id: SHARED_HEADER_SECTION_ID,
      shared: "header",
      hidden: pageHidesHeader(page) ? true : project.sharedHeader.hidden,
    });
  }

  for (const section of page.sections ?? []) {
    if (isNavbarSection(section) || isFooterSection(section)) continue;
    out.push(section);
  }

  if (project.sharedFooter && pageUsesGlobalFooter(page) && (includeHidden || !pageHidesFooter(page))) {
    out.push({
      ...project.sharedFooter,
      id: SHARED_FOOTER_SECTION_ID,
      shared: "footer",
      hidden: pageHidesFooter(page) ? true : project.sharedFooter.hidden,
    });
  }

  return out;
}

export function findSectionInProject(
  project: Project | null | undefined,
  sectionId: string | null | undefined,
  page?: Page | null,
): PageSection | null {
  if (!project || !sectionId) return null;
  if (project.sharedHeader && (sectionId === project.sharedHeader.id || sectionId === SHARED_HEADER_SECTION_ID)) {
    return project.sharedHeader;
  }
  if (project.sharedFooter && (sectionId === project.sharedFooter.id || sectionId === SHARED_FOOTER_SECTION_ID)) {
    return project.sharedFooter;
  }
  const targetPage = page ?? project.pages.find((p) => p.id === project.currentPageId) ?? project.pages[0];
  return targetPage?.sections.find((s) => s.id === sectionId) ?? null;
}

function cloneSection(section: PageSection): PageSection {
  return JSON.parse(JSON.stringify(section)) as PageSection;
}

function extractFirstChrome(
  pages: Page[],
  predicate: (section: PageSection) => boolean,
  role: "header" | "footer",
): PageSection | null {
  for (const page of pages) {
    for (const section of page.sections ?? []) {
      if (predicate(section)) {
        return normalizeSharedSection(cloneSection(section), role);
      }
    }
  }
  return null;
}

function stripChromeFromPages(pages: Page[]): Page[] {
  return pages.map((page) => {
    const sections = (page.sections ?? []).filter((section) => !isNavbarSection(section) && !isFooterSection(section));
    return {
      ...page,
      sections,
      widgetInstances: sections
        .map((section) => section.widgetInstance)
        .filter((item): item is WidgetInstance => !!item),
      useGlobalHeader: page.useGlobalHeader ?? true,
      useGlobalFooter: page.useGlobalFooter ?? true,
      hideHeader: page.hideHeader ?? false,
      hideFooter: page.hideFooter ?? false,
    };
  });
}

export function syncSharedHeaderNav(
  header: PageSection | null | undefined,
  pages: Page[],
  change?: {
    type: "add" | "rename" | "slug" | "delete";
    pageId: string;
    name?: string;
    previousName?: string;
    slug?: string;
  },
): PageSection | null {
  if (!header?.widgetInstance || header.widgetInstance.type !== "navbar") {
    return header ?? null;
  }

  const content = { ...(header.widgetInstance.content as Record<string, unknown>) };
  let navItems = Array.isArray(content.navItems) ? ([...content.navItems] as NavbarNavItem[]) : [];

  if (!change) {
    // Ensure existing pages have linked items when missing.
    for (const page of pages) {
      const exists = navItems.some((item) => String(item.linkedPageId || "") === page.id);
      if (!exists) {
        navItems.push({
          label: page.name,
          href: `page:${page.id}`,
          linkedPageId: page.id,
          autoLabel: true,
        });
      }
    }
  } else if (change.type === "add") {
    const page = pages.find((p) => p.id === change.pageId);
    if (page && !navItems.some((item) => String(item.linkedPageId || "") === page.id)) {
      navItems.push({
        label: page.name,
        href: `page:${page.id}`,
        linkedPageId: page.id,
        autoLabel: true,
      });
    }
  } else if (change.type === "rename") {
    navItems = navItems.map((item) => {
      if (String(item.linkedPageId || "") !== change.pageId) return item;
      const auto = item.autoLabel !== false;
      const stillDefault = auto && (!change.previousName || item.label === change.previousName);
      if (!stillDefault) return item;
      return { ...item, label: change.name || item.label, autoLabel: true };
    });
  } else if (change.type === "slug") {
    navItems = navItems.map((item) => {
      if (String(item.linkedPageId || "") !== change.pageId) return item;
      return { ...item, href: `page:${change.pageId}` };
    });
  } else if (change.type === "delete") {
    navItems = navItems.filter((item) => String(item.linkedPageId || "") !== change.pageId);
  }

  return {
    ...header,
    widgetInstance: {
      ...header.widgetInstance,
      content: {
        ...content,
        navItems,
      },
    },
  };
}

/** Migrate per-page header/footer copies into project.sharedHeader / sharedFooter. */
export function migrateSharedChrome(project: Project): Project {
  const alreadyMigrated = project.sharedHeader != null || project.sharedFooter != null
    || (project as { sharedChromeMigrated?: boolean }).sharedChromeMigrated === true;

  let sharedHeader = project.sharedHeader
    ? normalizeSharedSection(project.sharedHeader, "header")
    : null;
  let sharedFooter = project.sharedFooter
    ? normalizeSharedSection(project.sharedFooter, "footer")
    : null;

  const hadInlineChrome = project.pages.some((page) =>
    (page.sections ?? []).some((section) => isNavbarSection(section) || isFooterSection(section)),
  );

  if (!sharedHeader) {
    sharedHeader = extractFirstChrome(project.pages, isNavbarSection, "header");
  }
  if (!sharedFooter) {
    sharedFooter = extractFirstChrome(project.pages, isFooterSection, "footer");
  }

  // New/empty projects and migrated ones always get defaults when missing.
  if (!sharedHeader) {
    sharedHeader = createDefaultSharedHeader(project.pages);
  }
  if (!sharedFooter) {
    sharedFooter = createDefaultSharedFooter();
  }

  const pages = hadInlineChrome || !alreadyMigrated
    ? stripChromeFromPages(project.pages)
    : project.pages.map((page) => ({
        ...page,
        useGlobalHeader: page.useGlobalHeader ?? true,
        useGlobalFooter: page.useGlobalFooter ?? true,
        hideHeader: page.hideHeader ?? false,
        hideFooter: page.hideFooter ?? false,
      }));

  sharedHeader = syncSharedHeaderNav(sharedHeader, pages) || sharedHeader;

  return {
    ...project,
    sharedHeader,
    sharedFooter,
    pages,
    sharedChromeMigrated: true,
  } as Project;
}

export function sectionLabelForCanvas(section: PageSection): string | null {
  if (section.shared === "header" || section.id === SHARED_HEADER_SECTION_ID) return "GLOBAL HEADER";
  if (section.shared === "footer" || section.id === SHARED_FOOTER_SECTION_ID) return "GLOBAL FOOTER";
  return null;
}