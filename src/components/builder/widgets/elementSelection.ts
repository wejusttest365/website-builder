export type WidgetElementType = "text" | "image" | "button" | "link" | "container";

export interface WidgetEditableElementDefinition {
  key: string;
  type: WidgetElementType;
  label: string;
}

export interface WidgetElementSelectionPayload {
  sectionId: string | null;
  widgetId: string | null;
  elementKey: string | null;
  elementType: WidgetElementType | null;
  kind: "section" | "widget" | "text" | "image" | "link" | "container";
  index: number | null;
  tag?: string | null;
}

const widgetEditableElementsRegistry = new Map<string, WidgetEditableElementDefinition[]>();

export function registerWidgetEditableElements(widgetType: string, definitions: WidgetEditableElementDefinition[]) {
  widgetEditableElementsRegistry.set(widgetType, definitions);
  return definitions;
}

export function getWidgetEditableElements(widgetType: string) {
  return widgetEditableElementsRegistry.get(widgetType) ?? [];
}

export function resolveWidgetElementSelection(target: Element | null): WidgetElementSelectionPayload | null {
  if (!target) return null;
  const element = target.closest?.("[data-wto-widget-element-key]") as HTMLElement | null;
  if (!element) return null;

  const widgetRoot = element.closest?.("[data-widget-id], [data-wto-widget-root]") as HTMLElement | null;
  const section = target.closest?.("[data-wto-section]") as HTMLElement | null;
  const key = element.getAttribute("data-wto-widget-element-key");
  const type = (element.getAttribute("data-wto-widget-element-type") as WidgetElementType | null) ?? "container";

  return {
    sectionId: section?.dataset.wtoSection ?? null,
    widgetId: widgetRoot?.getAttribute("data-widget-id") ?? null,
    elementKey: key ?? null,
    elementType: type,
    kind: "widget",
    index: null,
    tag: element.tagName ? element.tagName.toLowerCase() : null,
  };
}
