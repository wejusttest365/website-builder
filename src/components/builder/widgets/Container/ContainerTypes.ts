import type { WidgetData } from "../widgetRegistry";

export type ContainerChildWidgetType = "heading" | "text" | "button" | "image";
export type WidgetChildType = ContainerChildWidgetType;

export interface ContainerChildItem {
  id: string;
  type: ContainerChildWidgetType;
  data?: Record<string, unknown>;
}

export type WidgetChildItem = ContainerChildItem;

export function createContainerChildItem(type: ContainerChildWidgetType, overrides: Partial<ContainerChildItem> = {}): ContainerChildItem {
  return {
    id: overrides.id ?? `${type}-${Math.random().toString(36).slice(2, 8)}`,
    type,
    data: overrides.data ?? {},
  };
}

export const createChildItem = createContainerChildItem;

export function getContainerChildWidgetData(child: ContainerChildItem) {
  const source = (child.data ?? {}) as Record<string, unknown>;
  const hasNestedData = ["content", "style", "layout", "responsive", "animation", "advanced", "variant"].some((key) => key in source);

  return {
    content: (hasNestedData ? (source.content as Record<string, unknown> | undefined) ?? {} : source) as Record<string, unknown>,
    style: (hasNestedData ? (source.style as Record<string, unknown> | undefined) ?? {} : {}) as Record<string, unknown>,
    layout: (hasNestedData ? (source.layout as Record<string, unknown> | undefined) ?? {} : {}) as Record<string, unknown>,
    responsive: (hasNestedData ? (source.responsive as Record<string, unknown> | undefined) ?? {} : {}) as Record<string, unknown>,
    animation: (hasNestedData ? (source.animation as Record<string, unknown> | undefined) ?? {} : {}) as Record<string, unknown>,
    advanced: (hasNestedData ? (source.advanced as Record<string, unknown> | undefined) ?? {} : {}) as Record<string, unknown>,
    variant: typeof source.variant === "string" ? source.variant : undefined,
  };
}

export const getChildWidgetData = getContainerChildWidgetData;

export function buildContainerChildData(value: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; responsive?: Record<string, unknown>; animation?: Record<string, unknown>; advanced?: Record<string, unknown>; variant?: string }) {
  return {
    content: value.content ?? {},
    style: value.style ?? {},
    layout: value.layout ?? {},
    responsive: value.responsive ?? {},
    animation: value.animation ?? {},
    advanced: value.advanced ?? {},
    variant: value.variant,
  };
}

export const buildChildData = buildContainerChildData;

export interface ContainerWidgetData extends WidgetData {
  id: string;
  type: string;
  variant: "Simple" | "Stacked" | "Grid" | "Card";
  content: {
    title?: string;
    description?: string;
    children?: ContainerChildItem[];
  };
  style: {
    backgroundColor?: string;
    padding?: string;
    margin?: string;
    borderRadius?: string;
    borderWidth?: string;
    borderColor?: string;
    shadow?: string;
  };
  layout: {
    alignment?: "left" | "center" | "right";
    gap?: string;
    columns?: number;
  };
  responsive: Record<string, unknown>;
  animation: Record<string, unknown>;
  advanced: {
    id?: string;
    className?: string;
    dataAttributes?: Record<string, string>;
    customCss?: string;
    visibility?: boolean;
  };
}

export function isContainerWidgetData(data: WidgetData): data is ContainerWidgetData {
  return data.type === "container";
}

export const defaultContainerWidgetData: ContainerWidgetData = {
  id: "container-widget-v1",
  type: "container",
  variant: "Simple",
  content: {
    title: "Content Area",
    description: "Drop content widgets into this container.",
    children: [],
  },
  style: {
    backgroundColor: "transparent",
    padding: "1rem",
    margin: "0rem",
    borderRadius: "0.5rem",
    borderWidth: "0px",
    borderColor: "#e5e7eb",
    shadow: "none",
  },
  layout: {
    alignment: "left",
    gap: "1rem",
    columns: 1,
  },
  responsive: {
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 400,
    delay: 0,
  },
  advanced: {
    id: "container-widget-v1",
    className: "",
    dataAttributes: {},
    customCss: "",
    visibility: true,
  },
};
