import type { BuilderAssetEntry } from "@/lib/builder/image-storage";
import { createStockImageReference } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";

export type ServicesVariant = "Service Cards";
export type ServicesObjectFit = "cover" | "contain";
export type ServicesAlignment = "left" | "center" | "right";
export type ServicesCardShadow = "none" | "small" | "medium" | "large";
export type ServicesImagePosition = "top" | "center" | "bottom";

export interface ServiceItem {
  id: string;
  src: BuilderAssetEntry | string;
  alt: string;
  name?: string;
  showHeading?: boolean;
  heading?: string;
  showDescription?: boolean;
  description?: string;
  showButton?: boolean;
  buttonLabel?: string;
  buttonUrl?: string;
  openInNewTab?: boolean;
}

export interface ServicesContentGroup extends Record<string, unknown> {
  services?: ServiceItem[];
  selectedServiceId?: string;
}

export interface ServicesStyleGroup extends Record<string, unknown> {
  backgroundColor?: string;
  maxWidth?: string;
  desktopColumns?: number;
  tabletColumns?: number;
  mobileColumns?: number;
  cardGap?: string;
  cardAlignment?: ServicesAlignment;
  cardBackgroundColor?: string;
  cardBorderEnabled?: boolean;
  cardBorderColor?: string;
  cardBorderWidth?: string;
  cardBorderRadius?: string;
  cardShadow?: ServicesCardShadow;
  cardPadding?: string;
  equalCardHeight?: boolean;
  imageHeight?: string;
  objectFit?: ServicesObjectFit;
  imageBorderRadius?: string;
  imagePosition?: ServicesImagePosition;
  headingColor?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  headingLineHeight?: string;
  headingMarginBottom?: string;
  descriptionColor?: string;
  descriptionFontSize?: string;
  descriptionLineHeight?: string;
  descriptionMarginBottom?: string;
  buttonAlignment?: ServicesAlignment;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: string;
  buttonBorderRadius?: string;
  buttonFontSize?: string;
  buttonFontWeight?: string;
  buttonPaddingX?: string;
  buttonPaddingY?: string;
  hoverEnabled?: boolean;
  hoverLift?: string;
  hoverShadow?: boolean;
  imageZoomOnHover?: boolean;
}

export interface ServicesLayoutGroup extends Record<string, unknown> {
  paddingTop?: string;
  paddingBottom?: string;
  paddingX?: string;
}

export interface ServicesResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface ServicesAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface ServicesAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface ServicesWidgetData extends WidgetData {
  type: "services";
  variant: ServicesVariant;
  content: ServicesContentGroup;
  style: ServicesStyleGroup;
  layout: ServicesLayoutGroup;
  responsive: ServicesResponsiveGroup;
  animation: ServicesAnimationGroup;
  advanced: ServicesAdvancedGroup;
}

export function createServicesId(prefix = "service") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createServiceItem(partial?: Partial<ServiceItem>): ServiceItem {
  const src =
    partial?.src ??
    createStockImageReference(
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    );
  const filename =
    typeof src === "object" && src !== null
      ? String((src as { filename?: string }).filename ?? "")
      : "";
  return {
    id: partial?.id ?? createServicesId("svc"),
    src,
    alt: partial?.alt ?? "Service image",
    name: partial?.name ?? (filename || "Service image"),
    showHeading: partial?.showHeading !== false,
    heading: partial?.heading ?? "New service",
    showDescription: partial?.showDescription !== false,
    description: partial?.description ?? "Describe this service and the value it provides.",
    showButton: partial?.showButton !== false,
    buttonLabel: partial?.buttonLabel ?? "Learn More",
    buttonUrl: partial?.buttonUrl ?? "#",
    openInNewTab: partial?.openInNewTab ?? false,
  };
}

export function normalizeServicesPx(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric >= 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function clampServicesColumns(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function isServicesWidgetData(value: unknown): value is ServicesWidgetData {
  return Boolean(value && typeof value === "object" && (value as { type?: string }).type === "services");
}

export function getServicesCardShadow(shadow: ServicesCardShadow | undefined): string {
  if (shadow === "small") return "0 4px 12px rgba(15,23,42,0.08)";
  if (shadow === "medium") return "0 10px 24px rgba(15,23,42,0.12)";
  if (shadow === "large") return "0 18px 40px rgba(15,23,42,0.16)";
  return "none";
}

const DEFAULT_SERVICES: ServiceItem[] = [
  createServiceItem({
    id: "svc-1",
    src: createStockImageReference(
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
    ),
    alt: "Modern workspace for website design",
    name: "website-design.jpg",
    heading: "Professional Website Design",
    description:
      "Create modern, responsive websites designed to build trust and deliver a great experience on every device.",
    buttonLabel: "Learn More",
    buttonUrl: "#",
  }),
  createServiceItem({
    id: "svc-2",
    src: createStockImageReference(
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    ),
    alt: "Developer working on custom website features",
    name: "custom-development.jpg",
    heading: "Custom Development",
    description:
      "Build flexible, scalable website features tailored to your business goals and workflow.",
    buttonLabel: "Explore Services",
    buttonUrl: "#",
  }),
  createServiceItem({
    id: "svc-3",
    src: createStockImageReference(
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=1200&q=80",
    ),
    alt: "Team reviewing digital growth analytics",
    name: "seo-growth.jpg",
    heading: "SEO & Digital Growth",
    description:
      "Improve visibility, attract more visitors, and grow your online presence with effective digital strategies.",
    buttonLabel: "Get Started",
    buttonUrl: "#",
  }),
];

export const defaultServicesWidgetData: ServicesWidgetData = {
  id: "services-default",
  type: "services",
  variant: "Service Cards",
  content: {
    services: DEFAULT_SERVICES,
    selectedServiceId: "svc-1",
  },
  style: {
    backgroundColor: "#f8fafc",
    maxWidth: "1140px",
    desktopColumns: 3,
    tabletColumns: 2,
    mobileColumns: 1,
    cardGap: "24px",
    cardAlignment: "center",
    cardBackgroundColor: "#ffffff",
    cardBorderEnabled: true,
    cardBorderColor: "#e2e8f0",
    cardBorderWidth: "1px",
    cardBorderRadius: "16px",
    cardShadow: "small",
    cardPadding: "0px",
    equalCardHeight: true,
    imageHeight: "200px",
    objectFit: "cover",
    imageBorderRadius: "0px",
    imagePosition: "center",
    headingColor: "#0f172a",
    headingFontSize: "20px",
    headingFontWeight: "700",
    headingLineHeight: "1.3",
    headingMarginBottom: "10px",
    descriptionColor: "#475569",
    descriptionFontSize: "15px",
    descriptionLineHeight: "1.6",
    descriptionMarginBottom: "18px",
    buttonAlignment: "left",
    buttonBackgroundColor: "#0f172a",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#0f172a",
    buttonBorderWidth: "1px",
    buttonBorderRadius: "10px",
    buttonFontSize: "14px",
    buttonFontWeight: "600",
    buttonPaddingX: "18px",
    buttonPaddingY: "10px",
    hoverEnabled: true,
    hoverLift: "6px",
    hoverShadow: true,
    imageZoomOnHover: true,
  },
  layout: {
    paddingTop: "64px",
    paddingBottom: "64px",
    paddingX: "24px",
  },
  responsive: {
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 300,
    delay: 0,
  },
  advanced: {
    id: "",
    className: "",
    visibility: true,
  },
};
