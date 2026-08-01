import type { WidgetData } from "../widgetRegistry";

export interface NavbarNavItem extends Record<string, unknown> {
  label: string;
  href: string;
  icon?: string;
}

export interface NavbarContentGroup extends Record<string, unknown> {
  logoText?: string;
  logoHref?: string;
  logoImageSrc?: string;
  logoWidth?: string;
  navItems?: NavbarNavItem[];
  ctaLabel?: string;
  ctaHref?: string;
  hamburgerIcon?: string;
}

export interface NavbarStyleGroup extends Record<string, unknown> {
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  borderColor?: string;
}

export interface NavbarLayoutGroup extends Record<string, unknown> {
  breakpoint?: "sm" | "md" | "lg" | "xl" | "xxl";
  containerWidth?: "narrow" | "standard" | "wide" | "full";
  sticky?: boolean;
}

export interface NavbarResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface NavbarAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: "none" | "fade" | "slide-up" | "zoom";
  duration?: number;
  delay?: number;
}

export interface NavbarAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  customCss?: string;
  visibility?: boolean;
}

export interface NavbarWidgetData extends WidgetData {
  id: string;
  type: string;
  variant: "Classic" | "Centered Logo" | "Transparent" | "Glass" | "Minimal";
  content: NavbarContentGroup;
  style: NavbarStyleGroup;
  layout: NavbarLayoutGroup;
  responsive: NavbarResponsiveGroup;
  animation: NavbarAnimationGroup;
  advanced: NavbarAdvancedGroup;
}

export function isNavbarWidgetData(data: WidgetData): data is NavbarWidgetData {
  return data.type === "navbar";
}

export const defaultNavbarWidgetData: NavbarWidgetData = {
  id: "navbar-widget-v1",
  type: "navbar",
  variant: "Classic",
  content: {
    logoText: "Brand",
    logoHref: "#",
    logoImageSrc: "",
    logoWidth: "140px",
    navItems: [
      { label: "Home", href: "#" },
      { label: "Features", href: "#features" },
      { label: "Pricing", href: "#pricing" },
      { label: "Contact", href: "#contact" },
    ],
    ctaLabel: "Get started",
    ctaHref: "#",
    hamburgerIcon: "bars",
  },
  style: {
    backgroundColor: "#ffffff",
    textColor: "#212529",
    padding: "1rem",
    shadow: "sm",
    border: true,
    borderColor: "#e9ecef",
  },
  layout: {
    breakpoint: "lg",
    containerWidth: "standard",
    sticky: false,
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
    id: "navbar-widget-v1",
    className: "",
    dataAttributes: {},
    customCss: "",
    visibility: true,
  },
};