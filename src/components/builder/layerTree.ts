export interface LayerNode {
  id: string;
  tagName: string;
  label: string;
  children: LayerNode[];
  element: HTMLElement;
  hidden: boolean;
}

const IGNORED_TAGS = new Set([
  "HTML",
  "HEAD",
  "SCRIPT",
  "STYLE",
  "META",
  "LINK",
  "NOSCRIPT",
  "TEMPLATE",
]);

const MEANINGFUL_TAGS = new Set([
  "SECTION",
  "HEADER",
  "FOOTER",
  "NAV",
  "MAIN",
  "ARTICLE",
  "ASIDE",
  "DIV",
  "H1",
  "H2",
  "H3",
  "H4",
  "H5",
  "H6",
  "P",
  "SPAN",
  "A",
  "BUTTON",
  "IMG",
  "UL",
  "OL",
  "LI",
  "FORM",
  "INPUT",
  "TEXTAREA",
  "LABEL",
  "FIGURE",
  "FIGCAPTION",
  "TABLE",
  "TR",
  "TD",
  "TH",
  "BLOCKQUOTE",
  "PRE",
  "CODE",
  "STRONG",
  "EM",
  "BR",
  "HR",
]);

function getLabelForTag(tagName: string): string {
  switch (tagName) {
    case "H1":
      return "Heading 1";
    case "H2":
      return "Heading 2";
    case "H3":
      return "Heading 3";
    case "H4":
      return "Heading 4";
    case "H5":
      return "Heading 5";
    case "H6":
      return "Heading 6";
    case "P":
      return "Paragraph";
    case "A":
      return "Link";
    case "BUTTON":
      return "Button";
    case "IMG":
      return "Image";
    case "UL":
      return "List";
    case "OL":
      return "List";
    case "LI":
      return "List Item";
    case "INPUT":
      return "Input";
    case "TEXTAREA":
      return "Textarea";
    case "FORM":
      return "Form";
    case "LABEL":
      return "Label";
    case "FIGURE":
      return "Figure";
    case "FIGCAPTION":
      return "Caption";
    case "TABLE":
      return "Table";
    case "BLOCKQUOTE":
      return "Quote";
    case "PRE":
      return "Code Block";
    case "CODE":
      return "Code";
    case "STRONG":
      return "Strong";
    case "EM":
      return "Emphasis";
    case "BR":
      return "Line Break";
    case "HR":
      return "Divider";
    case "DIV":
      return "Container";
    case "SECTION":
      return "Section";
    case "HEADER":
      return "Header";
    case "FOOTER":
      return "Footer";
    case "NAV":
      return "Navigation";
    case "MAIN":
      return "Main";
    case "ARTICLE":
      return "Article";
    case "ASIDE":
      return "Aside";
    default:
      return tagName.toLowerCase();
  }
}

function buildLayerTree(element: HTMLElement, sectionId?: string): LayerNode[] {
  const result: LayerNode[] = [];

  for (const child of Array.from(element.children)) {
    const tagName = child.tagName.toUpperCase();

    if (IGNORED_TAGS.has(tagName)) {
      continue;
    }

    const meaningful = MEANINGFUL_TAGS.has(tagName);
    const id = resolveStableId(child as HTMLElement, sectionId);
    const label = buildLabel(child as HTMLElement);
    const hidden = child.getAttribute("data-wto-hidden-layers") === "1";

    const children = meaningful ? buildLayerTree(child as HTMLElement, sectionId) : [];

    result.push({
      id,
      tagName,
      label,
      children,
      element: child as HTMLElement,
      hidden,
    });
  }

  return result;
}

function buildLabel(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  const id = element.id ? `#${element.id}` : "";
  const classes = Array.from(element.classList)
    .filter((c) => !c.startsWith("wto-"))
    .map((c) => `.${c}`)
    .join("");
  const suffix = [id, classes].filter(Boolean).join("") || "";
  const base = getLabelForTag(element.tagName.toUpperCase());
  return suffix ? `${base}${suffix}` : base;
}

function resolveStableId(element: HTMLElement, sectionId?: string): string {
  const sectionAttr = element.getAttribute("data-wto-section");
  if (sectionAttr) return `section-${sectionAttr}`;

  const widgetId = element.getAttribute("data-widget-id");
  if (widgetId) return `widget-${widgetId}`;

  const elementKey = element.getAttribute("data-wto-widget-element-key");
  if (elementKey) {
    const root = element.closest?.("[data-widget-id]") as HTMLElement | null;
    const rootId = root?.getAttribute("data-widget-id") || "unknown";
    return `element-${rootId}-${elementKey}`;
  }

  const parentWrapper = element.closest?.("[data-container-parent-widget-id],[data-wto-parent-widget-id]") as HTMLElement | null;
  if (parentWrapper) {
    const childId = parentWrapper.getAttribute("data-container-child-id") || parentWrapper.getAttribute("data-wto-child-id") || "";
    const root = parentWrapper.closest?.("[data-widget-id]") as HTMLElement | null;
    const rootId = root?.getAttribute("data-widget-id") || "unknown";
    if (childId) return `child-${rootId}-${childId}`;
  }

  const idx = element.getAttribute("data-wto-idx");
  if (idx != null && sectionId) return `dom-${sectionId}-${idx}`;

  return generateFallbackId(element);
}

function generateFallbackId(element: HTMLElement): string {
  const tag = element.tagName.toLowerCase();
  let sibling = element;
  let index = 1;
  while (sibling.previousElementSibling) {
    sibling = sibling.previousElementSibling as HTMLElement;
    if (sibling.tagName.toLowerCase() === tag) index += 1;
  }
  return `${tag}-${index}`;
}

export function getLayerTreeFromBody(body: HTMLElement | null): LayerNode[] {
  if (!body) return [];
  return buildLayerTree(body);
}

export function getLayerTreeForSection(section: HTMLElement): LayerNode[] {
  const sectionId = section.getAttribute("data-wto-section") ?? undefined;
  return buildLayerTree(section, sectionId);
}

export function findLayerNodeById(tree: LayerNode[], id: string): LayerNode | null {
  for (const node of tree) {
    if (node.id === id) return node;
    const found = findLayerNodeById(node.children, id);
    if (found) return found;
  }
  return null;
}

export function expandAncestors(tree: LayerNode[], targetId: string, expanded: Set<string>): Set<string> {
  const result = new Set(expanded);

  function walk(nodes: LayerNode[], ancestors: string[]): boolean {
    for (const node of nodes) {
      const path = [...ancestors, node.id];
      if (node.id === targetId) {
        for (const ancestorId of ancestors) {
          result.add(ancestorId);
        }
        return true;
      }
      if (walk(node.children, path)) return true;
    }
    return false;
  }

  walk(tree, []);
  return result;
}
