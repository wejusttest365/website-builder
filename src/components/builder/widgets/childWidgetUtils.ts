import type { WidgetData, WidgetInstance } from "./widgetRegistry";
import { buildContainerChildData, getContainerChildWidgetData, type ContainerChildItem } from "./Container/ContainerTypes";
import { getHeroChildItems } from "./Hero/HeroTypes";
import { normalizeFontSizeFields } from "./fontSize";

export { buildContainerChildData as buildChildData, getContainerChildWidgetData as getChildWidgetData } from "./Container/ContainerTypes";

export interface WidgetChildItem {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface WidgetChildLocation {
  columnId?: string | null;
  childContainerId?: string | null;
}

export function findGridColumnIdForChild(
  widget: WidgetData | WidgetInstance | null | undefined,
  childId: string | null | undefined,
): string | null {
  if (!widget || widget.type !== "grid" || !childId) return null;
  const content = (widget.content ?? {}) as Record<string, unknown>;
  const columns = Array.isArray(content.columns) ? (content.columns as Array<Record<string, unknown>>) : [];
  for (const column of columns) {
    const children = Array.isArray(column.children) ? (column.children as WidgetChildItem[]) : [];
    if (children.some((child) => child.id === childId)) {
      return String(column.id ?? "") || null;
    }
  }
  return null;
}

export function getWidgetChildItems(widget: WidgetData | WidgetInstance | null | undefined, location?: WidgetChildLocation): WidgetChildItem[] {
  if (!widget) return [];
  const content = (widget.content ?? {}) as Record<string, unknown>;
  const containerId = location?.childContainerId ?? location?.columnId ?? null;

  if (widget.type === "grid") {
    const columns = Array.isArray(content.columns) ? (content.columns as Array<Record<string, unknown>>) : [];
    if (containerId) {
      const column = columns.find((candidate) => String(candidate.id ?? "") === String(containerId ?? ""));
      return Array.isArray(column?.children) ? ((column.children as WidgetChildItem[]) ?? []) : [];
    }
    return columns.flatMap((column) => (Array.isArray(column.children) ? (column.children as WidgetChildItem[]) : []));
  }

  if (widget.type === "hero") {
    const heroChildren = Array.isArray(content.children) ? ((content.children as WidgetChildItem[]) ?? []) : [];
    return heroChildren.length > 0 ? heroChildren : getHeroChildItems(widget as any);
  }

  return Array.isArray(content.children) ? ((content.children as WidgetChildItem[]) ?? []) : [];
}

export function setWidgetChildItems(
  widget: WidgetData | WidgetInstance,
  nextChildren: WidgetChildItem[],
  location?: WidgetChildLocation,
): WidgetData | WidgetInstance {
  if (!widget) return widget;
  const content = { ...(widget.content ?? {}) } as Record<string, unknown>;

  if (widget.type === "grid") {
    const columns = Array.isArray(content.columns) ? (content.columns as Array<Record<string, unknown>>) : [];
    let containerId = location?.childContainerId ?? location?.columnId ?? null;
    if (!containerId && nextChildren.length) {
      const sampleId = nextChildren[0]?.id;
      containerId = findGridColumnIdForChild(widget, sampleId);
    }
    if (containerId) {
      const nextColumns = columns.map((column) => {
        const columnId = String(column.id ?? "");
        if (columnId !== String(containerId ?? "")) {
          return column;
        }
        return { ...column, children: nextChildren };
      });
      return { ...widget, content: { ...content, columns: nextColumns } } as WidgetData | WidgetInstance;
    }
    return widget;
  }

  if (widget.type === "hero") {
    return { ...widget, content: { ...content, children: nextChildren } } as WidgetData | WidgetInstance;
  }

  return { ...widget, content: { ...content, children: nextChildren } } as WidgetData | WidgetInstance;
}

export function updateWidgetChildData(
  widget: WidgetData | WidgetInstance,
  childId: string | null | undefined,
  patch: Record<string, unknown>,
  location?: WidgetChildLocation,
): WidgetData | WidgetInstance {
  const children = getWidgetChildItems(widget, location);
  if (!childId) return widget;
  const nextChildren = children.map((child) => (child.id === childId ? { ...child, data: mergeWidgetChildData(child.data, patch) } : child));
  return setWidgetChildItems(widget, nextChildren, location);
}

export function mergeWidgetChildData(
  currentData: Record<string, unknown> | undefined,
  patch: Partial<{
    content: Record<string, unknown>;
    style: Record<string, unknown>;
    layout: Record<string, unknown>;
    responsive: Record<string, unknown>;
    animation: Record<string, unknown>;
    advanced: Record<string, unknown>;
    variant: string;
  }> = {},
): Record<string, unknown> {
  const current = (currentData ?? {}) as Record<string, unknown>;
  const normalized = getContainerChildWidgetData({ id: "", type: "text", data: current } as ContainerChildItem);

  return {
    ...current,
    content: { ...normalized.content, ...(patch.content ?? {}) },
    style: normalizeFontSizeFields({ ...normalized.style, ...(patch.style ?? {}) }),
    layout: { ...normalized.layout, ...(patch.layout ?? {}) },
    responsive: normalizeFontSizeFields({ ...normalized.responsive, ...(patch.responsive ?? {}) }),
    animation: { ...normalized.animation, ...(patch.animation ?? {}) },
    advanced: { ...normalized.advanced, ...(patch.advanced ?? {}) },
    ...(patch.variant !== undefined ? { variant: patch.variant } : normalized.variant !== undefined ? { variant: normalized.variant } : {}),
  };
}

export function buildNormalizedChildData(
  value: Partial<{
    content: Record<string, unknown>;
    style: Record<string, unknown>;
    layout: Record<string, unknown>;
    responsive: Record<string, unknown>;
    animation: Record<string, unknown>;
    advanced: Record<string, unknown>;
    variant: string;
  }> = {},
): Record<string, unknown> {
  return buildContainerChildData(value);
}
