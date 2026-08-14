import type { WidgetData } from "../widgetRegistry";
import type { SectionWidthMode } from "../BaseWidget";

export interface NavbarNavItem extends Record<string, unknown> {
  label: string;
  href?: string;
  icon?: string;
  children?: NavbarNavItem[];
  /** Linked builder page id for auto-synced nav items. */
  linkedPageId?: string;
  /** When true, rename sync may update the label. */
  autoLabel?: boolean;
}

export interface NavbarContentGroup extends Record<string, unknown> {
  logoText?: string;
  logoHref?: string;
  logoImageSrc?: string;
  logoWidth?: string;
  navItems?: NavbarNavItem[];
  showCta?: boolean;
  ctaEnabled?: boolean;
  ctaLabel?: string;
  ctaHref?: string;
  hamburgerIcon?: string;
}

export interface NavbarStyleGroup extends Record<string, unknown> {
  backgroundColor?: string;
  textColor?: string;
  hoverColor?: string;
  activeColor?: string;
  padding?: string;
  shadow?: "none" | "sm" | "md" | "lg";
  border?: boolean;
  borderColor?: string;
  transparency?: number;
  blur?: number;
  ctaStyle?: "primary" | "secondary" | "outline";
}

export interface NavbarLayoutGroup extends Record<string, unknown> {
  breakpoint?: "sm" | "md" | "lg" | "xl" | "xxl";
  containerWidth?: "narrow" | "standard" | "wide" | "full";
  sticky?: boolean;
  logoPosition?: "left" | "center" | "right";
  menuAlignment?: "left" | "center" | "right";
  containerMode?: SectionWidthMode;
  backgroundFullWidth?: boolean;
  maxWidth?: string;
  horizontalPadding?: string;
  navbarHeight?: string;
  horizontalSpacing?: string;
}

export interface NavbarResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  desktopBehavior?: "inline" | "collapse" | "stack";
  tabletBehavior?: "inline" | "collapse" | "stack";
  mobileBehavior?: "inline" | "collapse" | "stack";
  mobileMenuAlignment?: "left" | "center" | "right";
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
  variant:
    | "Classic Light"
    | "Dark Premium"
    | "Gradient CTA"
    | "Minimal No Button"
    | "Centered Brand"
    | "Classic"
    | "Centered Logo"
    | "Transparent"
    | "Glass"
    | "Minimal";
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

export function getNavbarVariantDefaultShowCta(variant?: string) {
  switch (variant) {
    case "Classic":
    case "Classic Light":
      return true;
    case "Gradient CTA":
      return true;
    case "Glass":
    case "Transparent":
    case "Centered Logo":
    case "Minimal":
    case "Minimal No Button":
    case "Dark Premium":
    case "Centered Brand":
    default:
      return false;
  }
}

export function normalizeNavbarWidgetData(data: NavbarWidgetData): NavbarWidgetData {
  return {
    ...defaultNavbarWidgetData,
    ...data,
    content: {
      ...defaultNavbarWidgetData.content,
      ...(data.content || {}),
      navItems: Array.isArray(data.content?.navItems)
        ? data.content.navItems
        : defaultNavbarWidgetData.content.navItems,
    },
    style: {
      ...defaultNavbarWidgetData.style,
      ...(data.style || {}),
    },
    layout: {
      ...defaultNavbarWidgetData.layout,
      ...(data.layout || {}),
    },
    responsive: {
      ...defaultNavbarWidgetData.responsive,
      ...(data.responsive || {}),
    },
    animation: {
      ...defaultNavbarWidgetData.animation,
      ...(data.animation || {}),
    },
    advanced: {
      ...defaultNavbarWidgetData.advanced,
      ...(data.advanced || {}),
    },
  };
}

export const defaultNavbarWidgetData: NavbarWidgetData = {
  id: "navbar-widget-v1",
  type: "navbar",
  variant: "Classic Light",
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
    showCta: true,
    ctaEnabled: true,
    ctaLabel: "Get started",
    ctaHref: "#",
    hamburgerIcon: "bars",
  },
  style: {
    backgroundColor: "#ffffff",
    textColor: "#212529",
    hoverColor: "#2563eb",
    activeColor: "#0f172a",
    padding: "1rem",
    shadow: "sm",
    border: true,
    borderColor: "#e9ecef",
    transparency: 1,
    blur: 12,
    ctaStyle: "primary",
  },
  layout: {
    breakpoint: "lg",
    containerWidth: "standard",
    sticky: false,
    logoPosition: "left",
    menuAlignment: "left",
    containerMode: "container",
    backgroundFullWidth: true,
    maxWidth: "1200px",
    navbarHeight: "72px",
    horizontalSpacing: "1rem",
  },
  responsive: {
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
    desktopBehavior: "inline",
    tabletBehavior: "collapse",
    mobileBehavior: "collapse",
    mobileMenuAlignment: "left",
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