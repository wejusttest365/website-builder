import type { WidgetData } from "../widgetRegistry";

export interface ButtonContentGroup extends Record<string, unknown> {
  text?: string;
  url?: string;
  openInNewTab?: boolean;
  iconLeft?: string;
  iconRight?: string;
}

export interface ButtonStyleGroup extends Record<string, unknown> {
  fontFamily?: string;
  fontSize?: string;
  variant?: "Filled" | "Outline" | "Ghost" | "Gradient";
  color?: "Primary" | "Secondary" | "Success" | "Danger" | "Custom";
  customColor?: string;
  size?: "Small" | "Medium" | "Large";
  fullWidth?: boolean;
  display?: "inline" | "block";
  borderRadius?: string;
  shadow?: boolean;
}

export interface ButtonLayoutGroup extends Record<string, unknown> {
  alignment?: "left" | "center" | "right";
  padding?: string;
  margin?: string;
}

export interface ButtonResponsiveGroup extends Record<string, unknown> {
  mobileFullWidth?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface ButtonAnimationGroup extends Record<string, unknown> {
  hoverEffect?: "none" | "lift" | "shadow" | "grow";
  entranceAnimation?: "none" | "fade" | "slide-up" | "slide-down";
  duration?: number;
  delay?: number;
}

export interface ButtonAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  visibility?: boolean;
}

export interface ButtonWidgetData extends WidgetData {
  id: string;
  type: "button";
  variant: "Filled" | "Outline" | "Ghost" | "Gradient";
  content: ButtonContentGroup;
  style: ButtonStyleGroup;
  layout: ButtonLayoutGroup;
  responsive: ButtonResponsiveGroup;
  animation: ButtonAnimationGroup;
  advanced: ButtonAdvancedGroup;
}

export function isButtonWidgetData(data: WidgetData): data is ButtonWidgetData {
  return data.type === "button";
}

export const defaultButtonWidgetData: ButtonWidgetData = {
  id: "button-widget-v1",
  type: "button",
  variant: "Filled",
  content: {
    text: "Get started",
    url: "#",
    openInNewTab: false,
    iconLeft: "",
    iconRight: "",
  },
  style: {
    variant: "Filled",
    color: "Primary",
    customColor: "#0d6efd",
    size: "Medium",
    fullWidth: false,
    display: "inline",
    borderRadius: "0.75rem",
    shadow: true,
  },
  layout: {
    alignment: "center",
    padding: "0rem",
    margin: "0rem",
  },
  responsive: {
    mobileFullWidth: true,
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
  },
  animation: {
    hoverEffect: "lift",
    entranceAnimation: "none",
    duration: 400,
    delay: 0,
  },
  advanced: {
    id: "button-widget-v1",
    className: "",
    dataAttributes: {},
    visibility: true,
  },
};
