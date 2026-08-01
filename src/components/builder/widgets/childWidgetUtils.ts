import type { WidgetData, WidgetInstance } from "./widgetRegistry";

export interface WidgetChildItem {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface WidgetChildLocation {
  columnId?: string | null;
  childContainerId?: string | null;
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
    const containerId = location?.childContainerId ?? location?.columnId ?? null;
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
  const nextChildren = children.map((child) => (child.id === childId ? { ...child, data: { ...(child.data ?? {}), ...patch } } : child));
  return setWidgetChildItems(widget, nextChildren, location);
}
