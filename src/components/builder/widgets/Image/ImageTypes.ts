import type { WidgetData } from "../widgetRegistry";
import type { BuilderAssetEntry } from "@/lib/builder/image-storage";
import { createStockImageReference } from "@/lib/builder/image-storage";

export interface ImageContentGroup extends Record<string, unknown> {
  src?: BuilderAssetEntry;
  url?: string;
  openInNewTab?: boolean;
  alt?: string;
  /** When true, export uses alt="" for decorative images */
  decorative?: boolean;
  caption?: string;
}

export interface ImageStyleGroup extends Record<string, unknown> {
  width?: string;
  height?: string;
  objectFit?: "cover" | "contain" | "fill" | "none";
  borderRadius?: string;
  borderWidth?: string;
  borderColor?: string;
  shadow?: boolean;
  opacity?: number;
  overlayColor?: string;
  overlayOpacity?: number;
}

export interface ImageLayoutGroup extends Record<string, unknown> {
  alignment?: "left" | "center" | "right";
  maxWidth?: string;
  padding?: string;
  margin?: string;
}

export interface ImageResponsiveGroup extends Record<string, unknown> {
  desktopWidth?: string;
  tabletWidth?: string;
  mobileWidth?: string;
  hideOnMobile?: boolean;
}

export interface ImageAnimationGroup extends Record<string, unknown> {
  entranceAnimation?: "none" | "fade" | "slide-up" | "slide-down";
  duration?: number;
  delay?: number;
  hoverZoom?: boolean;
}

export interface ImageAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  visibility?: boolean;
  lazyLoad?: boolean;
}

export interface ImageWidgetData extends WidgetData {
  id: string;
  type: "image";
  variant: "Standard" | "Rounded" | "Card Image" | "Image with Caption" | "Image with Overlay";
  content: ImageContentGroup;
  style: ImageStyleGroup;
  layout: ImageLayoutGroup;
  responsive: ImageResponsiveGroup;
  animation: ImageAnimationGroup;
  advanced: ImageAdvancedGroup;
}

export function isImageWidgetData(data: WidgetData): data is ImageWidgetData {
  return data.type === "image";
}

export const defaultImageWidgetData: ImageWidgetData = {
  id: "image-widget-v1",
  type: "image",
  variant: "Standard",
  content: {
    src: createStockImageReference(
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80"
    ),
    url: "",
    openInNewTab: false,
    alt: "Image description",
    caption: "",
  },
  style: {
    width: "100%",
    height: "auto",
    objectFit: "cover",
    borderRadius: "0px",
    borderWidth: "0px",
    borderColor: "#dee2e6",
    shadow: false,
    opacity: 1,
    overlayColor: "#000000",
    overlayOpacity: 0.3,
  },
  layout: {
    alignment: "center",
    maxWidth: "100%",
    padding: "0rem",
    margin: "0rem",
  },
  responsive: {
    desktopWidth: "100%",
    tabletWidth: "100%",
    mobileWidth: "100%",
    hideOnMobile: false,
  },
  animation: {
    entranceAnimation: "none",
    duration: 400,
    delay: 0,
    hoverZoom: false,
  },
  advanced: {
    id: "image-widget-v1",
    className: "",
    dataAttributes: {},
    visibility: true,
    lazyLoad: true,
  },
};
