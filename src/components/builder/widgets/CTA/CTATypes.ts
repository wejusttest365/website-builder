import type { BuilderAssetEntry } from "@/lib/builder/image-storage";
import { createStockImageReference } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";

export type CtaVariant = "Gradient / Color CTA" | "Background Image CTA";
export type CtaAlignment = "left" | "center" | "right";
export type CtaVerticalAlign = "top" | "center" | "bottom";
export type CtaBackgroundMode = "solid" | "gradient" | "image";
export type CtaGradientDirection =
  | "left-right"
  | "right-left"
  | "top-bottom"
  | "bottom-top"
  | "diagonal";
export type CtaBackgroundSize = "cover" | "contain";
export type CtaBackgroundPosition = "center" | "top" | "bottom" | "left" | "right";
export type CtaBackgroundRepeat = "no-repeat" | "repeat";
export type CtaButtonLayout = "horizontal" | "vertical";

export interface CtaContentGroup extends Record<string, unknown> {
  showEyebrow?: boolean;
  eyebrow?: string;
  showHeading?: boolean;
  heading?: string;
  showParagraph?: boolean;
  paragraph?: string;
  showPrimaryButton?: boolean;
  primaryButtonLabel?: string;
  primaryButtonUrl?: string;
  primaryOpenInNewTab?: boolean;
  showSecondaryButton?: boolean;
  secondaryButtonLabel?: string;
  secondaryButtonUrl?: string;
  secondaryOpenInNewTab?: boolean;
  backgroundImageSrc?: BuilderAssetEntry | string;
  backgroundImageAlt?: string;
  backgroundImageName?: string;
}

export interface CtaStyleGroup extends Record<string, unknown> {
  backgroundMode?: CtaBackgroundMode;
  backgroundColor?: string;
  gradientEnabled?: boolean;
  gradientStart?: string;
  gradientEnd?: string;
  gradientDirection?: CtaGradientDirection;
  backgroundSize?: CtaBackgroundSize;
  backgroundPosition?: CtaBackgroundPosition;
  backgroundRepeat?: CtaBackgroundRepeat;
  overlayEnabled?: boolean;
  overlayColor?: string;
  overlayOpacity?: number;
  overlayGradientEnabled?: boolean;
  overlayGradientStart?: string;
  overlayGradientEnd?: string;
  overlayGradientDirection?: CtaGradientDirection;
  minHeight?: string;
  contentMaxWidth?: string;
  contentPaddingX?: string;
  horizontalAlign?: CtaAlignment;
  verticalAlign?: CtaVerticalAlign;
  eyebrowColor?: string;
  eyebrowFontSize?: string;
  eyebrowFontWeight?: string;
  eyebrowLetterSpacing?: string;
  eyebrowBackgroundColor?: string;
  eyebrowBorderRadius?: string;
  eyebrowPaddingX?: string;
  eyebrowPaddingY?: string;
  headingColor?: string;
  headingFontSize?: string;
  headingFontWeight?: string;
  headingLineHeight?: string;
  headingMaxWidth?: string;
  headingMarginBottom?: string;
  headingTextShadow?: boolean;
  paragraphColor?: string;
  paragraphFontSize?: string;
  paragraphLineHeight?: string;
  paragraphMaxWidth?: string;
  paragraphMarginBottom?: string;
  buttonLayout?: CtaButtonLayout;
  buttonAlignment?: CtaAlignment;
  buttonGap?: string;
  primaryBackgroundColor?: string;
  primaryTextColor?: string;
  primaryBorderColor?: string;
  primaryBorderWidth?: string;
  primaryBorderRadius?: string;
  primaryFontSize?: string;
  primaryFontWeight?: string;
  primaryPaddingX?: string;
  primaryPaddingY?: string;
  primaryHoverBackgroundColor?: string;
  primaryHoverTextColor?: string;
  primaryHoverBorderColor?: string;
  secondaryBackgroundColor?: string;
  secondaryTextColor?: string;
  secondaryBorderColor?: string;
  secondaryBorderWidth?: string;
  secondaryBorderRadius?: string;
  secondaryFontSize?: string;
  secondaryFontWeight?: string;
  secondaryPaddingX?: string;
  secondaryPaddingY?: string;
  secondaryHoverBackgroundColor?: string;
  secondaryHoverTextColor?: string;
  secondaryHoverBorderColor?: string;
}

export interface CtaLayoutGroup extends Record<string, unknown> {
  paddingTop?: string;
  paddingBottom?: string;
  paddingX?: string;
}

export interface CtaResponsiveGroup extends Record<string, unknown> {
  desktopMinHeight?: string;
  desktopHeadingFontSize?: string;
  tabletMinHeight?: string;
  tabletHeadingFontSize?: string;
  mobileMinHeight?: string;
  mobileHeadingFontSize?: string;
  stackButtonsOnMobile?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface CtaAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface CtaAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface CtaWidgetData extends WidgetData {
  type: "cta";
  variant: CtaVariant;
  content: CtaContentGroup;
  style: CtaStyleGroup;
  layout: CtaLayoutGroup;
  responsive: CtaResponsiveGroup;
  animation: CtaAnimationGroup;
  advanced: CtaAdvancedGroup;
}

export function createCtaId(prefix = "cta") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function normalizeCtaPx(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric >= 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function clampCtaOpacity(value: unknown, fallback = 60): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(0, Math.min(100, Math.round(num)));
}

export function getCtaGradientAngle(direction: CtaGradientDirection | undefined): string {
  if (direction === "right-left") return "270deg";
  if (direction === "top-bottom") return "180deg";
  if (direction === "bottom-top") return "0deg";
  if (direction === "diagonal") return "135deg";
  return "90deg";
}

export function getCtaBackgroundPosition(value: CtaBackgroundPosition | undefined): string {
  if (value === "top") return "center top";
  if (value === "bottom") return "center bottom";
  if (value === "left") return "left center";
  if (value === "right") return "right center";
  return "center center";
}

export function isCtaWidgetData(value: unknown): value is CtaWidgetData {
  return Boolean(value && typeof value === "object" && (value as { type?: string }).type === "cta");
}

const DEFAULT_CTA_IMAGE = createStockImageReference(
  "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80",
);

export function getCtaVariantDefaults(variant: CtaVariant): {
  style: Partial<CtaStyleGroup>;
  content?: Partial<CtaContentGroup>;
  layout?: Partial<CtaLayoutGroup>;
  responsive?: Partial<CtaResponsiveGroup>;
} {
  if (variant === "Background Image CTA") {
    return {
      content: {
        backgroundImageSrc: DEFAULT_CTA_IMAGE,
        backgroundImageAlt: "Modern creative workspace",
        backgroundImageName: "cta-workspace.jpg",
      },
      style: {
        backgroundMode: "image",
        backgroundColor: "#0f172a",
        gradientEnabled: false,
        gradientStart: "#2563eb",
        gradientEnd: "#7c3aed",
        gradientDirection: "diagonal",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        overlayEnabled: true,
        overlayColor: "#0f172a",
        overlayOpacity: 60,
        overlayGradientEnabled: false,
        overlayGradientStart: "#0f172a",
        overlayGradientEnd: "#1e293b",
        overlayGradientDirection: "top-bottom",
        minHeight: "420px",
        contentMaxWidth: "760px",
        contentPaddingX: "24px",
        horizontalAlign: "center",
        verticalAlign: "center",
        eyebrowColor: "#e2e8f0",
        eyebrowFontSize: "12px",
        eyebrowFontWeight: "700",
        eyebrowLetterSpacing: "2px",
        eyebrowBackgroundColor: "rgba(255,255,255,0.12)",
        eyebrowBorderRadius: "999px",
        eyebrowPaddingX: "14px",
        eyebrowPaddingY: "6px",
        headingColor: "#ffffff",
        headingFontSize: "44px",
        headingFontWeight: "700",
        headingLineHeight: "1.15",
        headingMaxWidth: "720px",
        headingMarginBottom: "16px",
        headingTextShadow: true,
        paragraphColor: "#e2e8f0",
        paragraphFontSize: "18px",
        paragraphLineHeight: "1.7",
        paragraphMaxWidth: "640px",
        paragraphMarginBottom: "28px",
        buttonLayout: "horizontal",
        buttonAlignment: "center",
        buttonGap: "12px",
        primaryBackgroundColor: "#ffffff",
        primaryTextColor: "#0f172a",
        primaryBorderColor: "#ffffff",
        primaryBorderWidth: "1px",
        primaryBorderRadius: "10px",
        primaryFontSize: "15px",
        primaryFontWeight: "600",
        primaryPaddingX: "24px",
        primaryPaddingY: "14px",
        primaryHoverBackgroundColor: "#f1f5f9",
        primaryHoverTextColor: "#0f172a",
        primaryHoverBorderColor: "#f1f5f9",
        secondaryBackgroundColor: "transparent",
        secondaryTextColor: "#ffffff",
        secondaryBorderColor: "rgba(255,255,255,0.7)",
        secondaryBorderWidth: "1px",
        secondaryBorderRadius: "10px",
        secondaryFontSize: "15px",
        secondaryFontWeight: "600",
        secondaryPaddingX: "24px",
        secondaryPaddingY: "14px",
        secondaryHoverBackgroundColor: "rgba(255,255,255,0.12)",
        secondaryHoverTextColor: "#ffffff",
        secondaryHoverBorderColor: "#ffffff",
      },
      layout: {
        paddingTop: "88px",
        paddingBottom: "88px",
        paddingX: "24px",
      },
      responsive: {
        desktopMinHeight: "420px",
        desktopHeadingFontSize: "44px",
        tabletMinHeight: "360px",
        tabletHeadingFontSize: "36px",
        mobileMinHeight: "320px",
        mobileHeadingFontSize: "30px",
        stackButtonsOnMobile: true,
      },
    };
  }

  return {
    style: {
      backgroundMode: "gradient",
      backgroundColor: "#2563eb",
      gradientEnabled: true,
      gradientStart: "#2563eb",
      gradientEnd: "#7c3aed",
      gradientDirection: "left-right",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      overlayEnabled: false,
      overlayColor: "#0f172a",
      overlayOpacity: 40,
      overlayGradientEnabled: false,
      overlayGradientStart: "#0f172a",
      overlayGradientEnd: "#1e293b",
      overlayGradientDirection: "top-bottom",
      minHeight: "380px",
      contentMaxWidth: "760px",
      contentPaddingX: "24px",
      horizontalAlign: "center",
      verticalAlign: "center",
      eyebrowColor: "#e0e7ff",
      eyebrowFontSize: "12px",
      eyebrowFontWeight: "700",
      eyebrowLetterSpacing: "2px",
      eyebrowBackgroundColor: "rgba(255,255,255,0.14)",
      eyebrowBorderRadius: "999px",
      eyebrowPaddingX: "14px",
      eyebrowPaddingY: "6px",
      headingColor: "#ffffff",
      headingFontSize: "44px",
      headingFontWeight: "700",
      headingLineHeight: "1.15",
      headingMaxWidth: "720px",
      headingMarginBottom: "16px",
      headingTextShadow: false,
      paragraphColor: "#eef2ff",
      paragraphFontSize: "18px",
      paragraphLineHeight: "1.7",
      paragraphMaxWidth: "640px",
      paragraphMarginBottom: "28px",
      buttonLayout: "horizontal",
      buttonAlignment: "center",
      buttonGap: "12px",
      primaryBackgroundColor: "#ffffff",
      primaryTextColor: "#1e3a8a",
      primaryBorderColor: "#ffffff",
      primaryBorderWidth: "1px",
      primaryBorderRadius: "10px",
      primaryFontSize: "15px",
      primaryFontWeight: "600",
      primaryPaddingX: "24px",
      primaryPaddingY: "14px",
      primaryHoverBackgroundColor: "#f8fafc",
      primaryHoverTextColor: "#1e3a8a",
      primaryHoverBorderColor: "#f8fafc",
      secondaryBackgroundColor: "transparent",
      secondaryTextColor: "#ffffff",
      secondaryBorderColor: "rgba(255,255,255,0.75)",
      secondaryBorderWidth: "1px",
      secondaryBorderRadius: "10px",
      secondaryFontSize: "15px",
      secondaryFontWeight: "600",
      secondaryPaddingX: "24px",
      secondaryPaddingY: "14px",
      secondaryHoverBackgroundColor: "rgba(255,255,255,0.14)",
      secondaryHoverTextColor: "#ffffff",
      secondaryHoverBorderColor: "#ffffff",
    },
    layout: {
      paddingTop: "88px",
      paddingBottom: "88px",
      paddingX: "24px",
    },
    responsive: {
      desktopMinHeight: "380px",
      desktopHeadingFontSize: "44px",
      tabletMinHeight: "340px",
      tabletHeadingFontSize: "36px",
      mobileMinHeight: "300px",
      mobileHeadingFontSize: "30px",
      stackButtonsOnMobile: true,
    },
  };
}

export function applyCtaVariant(instance: CtaWidgetData, variant: CtaVariant): CtaWidgetData {
  const defaults = getCtaVariantDefaults(variant);
  return {
    ...instance,
    variant,
    content: {
      ...instance.content,
      ...(defaults.content ?? {}),
    },
    style: {
      ...instance.style,
      ...defaults.style,
    },
    layout: {
      ...instance.layout,
      ...(defaults.layout ?? {}),
    },
    responsive: {
      ...instance.responsive,
      ...(defaults.responsive ?? {}),
    },
  };
}

const gradientDefaults = getCtaVariantDefaults("Gradient / Color CTA");

export const defaultCtaWidgetData: CtaWidgetData = {
  id: "cta-default",
  type: "cta",
  variant: "Gradient / Color CTA",
  content: {
    showEyebrow: true,
    eyebrow: "READY TO GET STARTED?",
    showHeading: true,
    heading: "Build Your Next Website With Confidence",
    showParagraph: true,
    paragraph:
      "Create a professional, responsive website with flexible tools designed to help you bring your ideas to life.",
    showPrimaryButton: true,
    primaryButtonLabel: "Start Building Free",
    primaryButtonUrl: "#",
    primaryOpenInNewTab: false,
    showSecondaryButton: true,
    secondaryButtonLabel: "Explore Features",
    secondaryButtonUrl: "#",
    secondaryOpenInNewTab: false,
    backgroundImageSrc: DEFAULT_CTA_IMAGE,
    backgroundImageAlt: "Modern creative workspace",
    backgroundImageName: "cta-workspace.jpg",
  },
  style: {
    ...(gradientDefaults.style as CtaStyleGroup),
  },
  layout: {
    ...(gradientDefaults.layout as CtaLayoutGroup),
  },
  responsive: {
    ...(gradientDefaults.responsive as CtaResponsiveGroup),
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
