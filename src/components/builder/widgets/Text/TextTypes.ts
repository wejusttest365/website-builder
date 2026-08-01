import type { WidgetData } from "../widgetRegistry";

export interface TextContentGroup extends Record<string, unknown> {
  text?: string;
  richText?: boolean;
}

export interface TextStyleGroup extends Record<string, unknown> {
  fontFamily?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
}

export interface TextLayoutGroup extends Record<string, unknown> {
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
}

export interface TextResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  fontSizeMobile?: string;
  fontSizeTablet?: string;
}

export interface TextAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: "none" | "fade" | "slide-up" | "zoom";
  duration?: number;
  delay?: number;
}

export interface TextAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  customCss?: string;
  visibility?: boolean;
}

export interface TextWidgetData extends WidgetData {
  id: string;
  type: string;
  variant: "Paragraph" | "Lead Text" | "Small Text" | "Muted Text" | "Quote" | "Highlight";
  content: TextContentGroup;
  style: TextStyleGroup;
  layout: TextLayoutGroup;
  responsive: TextResponsiveGroup;
  animation: TextAnimationGroup;
  advanced: TextAdvancedGroup;
}

export function isTextWidgetData(data: WidgetData): data is TextWidgetData {
  return data.type === "text";
}

export const defaultTextWidgetData: TextWidgetData = {
  id: "text-widget-v1",
  type: "text",
  variant: "Paragraph",
  content: {
    text: "Write clear, readable content that keeps visitors engaged.",
    richText: false,
  },
  style: {
    textColor: "#111827",
    fontSize: "1rem",
    fontWeight: "400",
    lineHeight: "1.75",
    letterSpacing: "0px",
  },
  layout: {
    alignment: "left",
    padding: "0rem",
    margin: "0rem",
  },
  responsive: {
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
    fontSizeMobile: "0.95rem",
    fontSizeTablet: "1rem",
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 400,
    delay: 0,
  },
  advanced: {
    id: "text-widget-v1",
    className: "",
    dataAttributes: {},
    customCss: "",
    visibility: true,
  },
};
