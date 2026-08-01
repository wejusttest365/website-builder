import type { WidgetData } from "../widgetRegistry";

export interface HeadingContentGroup extends Record<string, unknown> {
  text?: string;
  headingLevel?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  label?: string;
}

export interface HeadingStyleGroup extends Record<string, unknown> {
  fontFamily?: string;
  textColor?: string;
  fontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  letterSpacing?: string;
  underlineColor?: string;
  gradientStart?: string;
  gradientEnd?: string;
}

export interface HeadingLayoutGroup extends Record<string, unknown> {
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
}

export interface HeadingResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  fontSizeMobile?: string;
  fontSizeTablet?: string;
}

export interface HeadingAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: "none" | "fade" | "slide-up" | "zoom";
  duration?: number;
  delay?: number;
}

export interface HeadingAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  customCss?: string;
  visibility?: boolean;
}

export interface HeadingWidgetData extends WidgetData {
  id: string;
  type: string;
  variant: "Simple" | "Section Title" | "Centered" | "Gradient" | "Underline";
  content: HeadingContentGroup;
  style: HeadingStyleGroup;
  layout: HeadingLayoutGroup;
  responsive: HeadingResponsiveGroup;
  animation: HeadingAnimationGroup;
  advanced: HeadingAdvancedGroup;
}

export function isHeadingWidgetData(data: WidgetData): data is HeadingWidgetData {
  return data.type === "heading";
}

export const defaultHeadingWidgetData: HeadingWidgetData = {
  id: "heading-widget-v1",
  type: "heading",
  variant: "Simple",
  content: {
    text: "Create a bold heading",
    headingLevel: "h2",
    label: "Section title",
  },
  style: {
    textColor: "#111827",
    fontSize: "3rem",
    fontWeight: "700",
    lineHeight: "1.1",
    letterSpacing: "0px",
    underlineColor: "#2563eb",
    gradientStart: "#2563eb",
    gradientEnd: "#9333ea",
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
    fontSizeMobile: "2rem",
    fontSizeTablet: "2.5rem",
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 400,
    delay: 0,
  },
  advanced: {
    id: "heading-widget-v1",
    className: "",
    dataAttributes: {},
    customCss: "",
    visibility: true,
  },
};
