import type { BuilderAssetEntry } from "@/lib/builder/image-storage";
import { createStockImageReference } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";

export type AboutVariant = "Split Content";
export type AboutAlignment = "left" | "center" | "right";
export type AboutVerticalAlign = "top" | "center" | "bottom";
export type AboutImageSide = "left" | "right";
export type AboutObjectFit = "cover" | "contain";
export type AboutObjectPosition = "center" | "top" | "bottom" | "left" | "right";
export type AboutShadow = "none" | "small" | "medium" | "large";
export type AboutColumnPreset = "8-4" | "7-5" | "6-6" | "5-7" | "4-8" | "custom";
export type AboutFeatureIcon = "check" | "star" | "bolt" | "circle" | "none";
export type AboutTabletLayout = "columns" | "stack";
export type AboutMobileOrder = "content-image" | "image-content";

export interface AboutFeatureItem {
  id: string;
  text: string;
  icon?: AboutFeatureIcon;
}

export interface AboutContentGroup extends Record<string, unknown> {
  showEyebrow?: boolean;
  eyebrow?: string;
  showHeading?: boolean;
  heading?: string;
  showDescription?: boolean;
  description?: string;
  showFeatures?: boolean;
  features?: AboutFeatureItem[];
  selectedFeatureId?: string;
  showButton?: boolean;
  buttonLabel?: string;
  buttonUrl?: string;
  openInNewTab?: boolean;
  showImage?: boolean;
  imageSrc?: BuilderAssetEntry | string;
  imageAlt?: string;
  imageName?: string;
}

export interface AboutStyleGroup extends Record<string, unknown> {
  backgroundColor?: string;
  maxWidth?: string;
  columnPreset?: AboutColumnPreset;
  contentColumns?: number;
  imageColumns?: number;
  columnGap?: string;
  verticalAlign?: AboutVerticalAlign;
  contentAlignment?: AboutAlignment;
  imageSide?: AboutImageSide;
  imageHeight?: string;
  objectFit?: AboutObjectFit;
  objectPosition?: AboutObjectPosition;
  imageBorderRadius?: string;
  imageBorderEnabled?: boolean;
  imageBorderColor?: string;
  imageBorderWidth?: string;
  imageShadow?: AboutShadow;
  imageZoomOnHover?: boolean;
  eyebrowColor?: string;
  eyebrowFontSize?: string;
  eyebrowFontWeight?: string;
  eyebrowLetterSpacing?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  headingLineHeight?: string;
  headingMarginBottom?: string;
  descriptionColor?: string;
  descriptionFontSize?: string;
  descriptionLineHeight?: string;
  descriptionMarginBottom?: string;
  featureColor?: string;
  featureFontSize?: string;
  featureIconColor?: string;
  featureItemGap?: string;
  buttonAlignment?: AboutAlignment;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  buttonBorderColor?: string;
  buttonBorderWidth?: string;
  buttonBorderRadius?: string;
  buttonFontSize?: string;
  buttonFontWeight?: string;
  buttonPaddingX?: string;
  buttonPaddingY?: string;
  buttonHoverBackgroundColor?: string;
  buttonHoverTextColor?: string;
  buttonHoverBorderColor?: string;
}

export interface AboutLayoutGroup extends Record<string, unknown> {
  paddingTop?: string;
  paddingBottom?: string;
  paddingX?: string;
}

export interface AboutResponsiveGroup extends Record<string, unknown> {
  tabletLayout?: AboutTabletLayout;
  mobileOrder?: AboutMobileOrder;
  mobileContentAlignment?: AboutAlignment;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface AboutAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface AboutAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface AboutWidgetData extends WidgetData {
  type: "about";
  variant: AboutVariant;
  content: AboutContentGroup;
  style: AboutStyleGroup;
  layout: AboutLayoutGroup;
  responsive: AboutResponsiveGroup;
  animation: AboutAnimationGroup;
  advanced: AboutAdvancedGroup;
}

export function createAboutId(prefix = "about") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createAboutFeature(partial?: Partial<AboutFeatureItem>): AboutFeatureItem {
  return {
    id: partial?.id ?? createAboutId("feature"),
    text: partial?.text ?? "New feature",
    icon: partial?.icon ?? "check",
  };
}

export function normalizeAboutPx(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric >= 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function clampAboutColumns(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function resolveAboutColumns(
  preset: AboutColumnPreset | undefined,
  contentColumns?: number,
): { content: number; image: number; preset: AboutColumnPreset } {
  const map: Record<Exclude<AboutColumnPreset, "custom">, number> = {
    "8-4": 8,
    "7-5": 7,
    "6-6": 6,
    "5-7": 5,
    "4-8": 4,
  };
  if (preset && preset !== "custom" && map[preset] != null) {
    const content = map[preset];
    return { content, image: 12 - content, preset };
  }
  const content = clampAboutColumns(contentColumns, 1, 11, 7);
  return { content, image: 12 - content, preset: "custom" };
}

export function getAboutShadow(shadow: AboutShadow | undefined): string {
  if (shadow === "small") return "0 4px 12px rgba(15,23,42,0.08)";
  if (shadow === "medium") return "0 10px 24px rgba(15,23,42,0.12)";
  if (shadow === "large") return "0 18px 40px rgba(15,23,42,0.16)";
  return "none";
}

export function getAboutFeatureIconClass(icon: AboutFeatureIcon | undefined): string {
  if (icon === "star") return "fa-solid fa-star";
  if (icon === "bolt") return "fa-solid fa-bolt";
  if (icon === "circle") return "fa-solid fa-circle";
  if (icon === "none") return "";
  return "fa-solid fa-check";
}

export function isAboutWidgetData(value: unknown): value is AboutWidgetData {
  return Boolean(value && typeof value === "object" && (value as { type?: string }).type === "about");
}

export const defaultAboutWidgetData: AboutWidgetData = {
  id: "about-default",
  type: "about",
  variant: "Split Content",
  content: {
    showEyebrow: true,
    eyebrow: "ABOUT OUR COMPANY",
    showHeading: true,
    heading: "We Build Digital Experiences That Help Businesses Grow",
    showDescription: true,
    description:
      "We create modern, responsive, and user-focused digital experiences designed to help businesses build trust and grow online. Our approach combines thoughtful design, flexible technology, and practical solutions that work across every device. From first impression to lasting engagement, we focus on clarity, usability, and results that support long-term growth.",
    showFeatures: true,
    features: [
      createAboutFeature({ id: "about-f1", text: "Modern responsive design", icon: "check" }),
      createAboutFeature({ id: "about-f2", text: "Flexible and easy customization", icon: "check" }),
      createAboutFeature({ id: "about-f3", text: "Built for performance and growth", icon: "check" }),
    ],
    selectedFeatureId: "about-f1",
    showButton: true,
    buttonLabel: "Learn More",
    buttonUrl: "/about-us",
    openInNewTab: false,
    showImage: true,
    imageSrc: createStockImageReference(
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1400&q=80",
    ),
    imageAlt: "Creative team collaborating in a modern office",
    imageName: "about-team.jpg",
  },
  style: {
    backgroundColor: "#ffffff",
    maxWidth: "1140px",
    columnPreset: "7-5",
    contentColumns: 7,
    imageColumns: 5,
    columnGap: "32px",
    verticalAlign: "center",
    contentAlignment: "left",
    imageSide: "right",
    imageHeight: "420px",
    objectFit: "cover",
    objectPosition: "center",
    imageBorderRadius: "18px",
    imageBorderEnabled: false,
    imageBorderColor: "#e2e8f0",
    imageBorderWidth: "1px",
    imageShadow: "medium",
    imageZoomOnHover: true,
    eyebrowColor: "#2563eb",
    eyebrowFontSize: "12px",
    eyebrowFontWeight: "700",
    eyebrowLetterSpacing: "2px",
    headingColor: "#0f172a",
    headingFontSize: "36px",
    headingFontWeight: "700",
    headingLineHeight: "1.2",
    headingMarginBottom: "16px",
    descriptionColor: "#475569",
    descriptionFontSize: "16px",
    descriptionLineHeight: "1.7",
    descriptionMarginBottom: "20px",
    featureColor: "#334155",
    featureFontSize: "15px",
    featureIconColor: "#2563eb",
    featureItemGap: "10px",
    buttonAlignment: "left",
    buttonBackgroundColor: "#0f172a",
    buttonTextColor: "#ffffff",
    buttonBorderColor: "#0f172a",
    buttonBorderWidth: "1px",
    buttonBorderRadius: "10px",
    buttonFontSize: "14px",
    buttonFontWeight: "600",
    buttonPaddingX: "20px",
    buttonPaddingY: "12px",
    buttonHoverBackgroundColor: "#1e293b",
    buttonHoverTextColor: "#ffffff",
    buttonHoverBorderColor: "#1e293b",
  },
  layout: {
    paddingTop: "72px",
    paddingBottom: "72px",
    paddingX: "24px",
  },
  responsive: {
    tabletLayout: "columns",
    mobileOrder: "content-image",
    mobileContentAlignment: "left",
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
