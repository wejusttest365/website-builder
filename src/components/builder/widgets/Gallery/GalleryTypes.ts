import type { BuilderAssetEntry } from "@/lib/builder/image-storage";
import { createStockImageReference } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";

export type GalleryVariant = "Simple Grid";
export type GalleryObjectFit = "cover" | "contain";

export interface GalleryImageItem {
  id: string;
  src: BuilderAssetEntry | string;
  alt: string;
  link?: string;
  openInNewTab?: boolean;
  name?: string;
}

export interface GalleryContentGroup extends Record<string, unknown> {
  images?: GalleryImageItem[];
  selectedImageId?: string;
}

export interface GalleryStyleGroup extends Record<string, unknown> {
  desktopColumns?: number;
  tabletColumns?: number;
  mobileColumns?: number;
  imageHeight?: string;
  objectFit?: GalleryObjectFit;
  borderRadius?: string;
  imageGap?: string;
  imageBorderEnabled?: boolean;
  borderColor?: string;
  borderWidth?: string;
  hoverEnabled?: boolean;
  hoverScale?: number;
  hoverShadow?: boolean;
  backgroundColor?: string;
}

export interface GalleryLayoutGroup extends Record<string, unknown> {
  paddingTop?: string;
  paddingBottom?: string;
  paddingX?: string;
}

export interface GalleryResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface GalleryAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface GalleryAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface GalleryWidgetData extends WidgetData {
  type: "gallery";
  variant: GalleryVariant;
  content: GalleryContentGroup;
  style: GalleryStyleGroup;
  layout: GalleryLayoutGroup;
  responsive: GalleryResponsiveGroup;
  animation: GalleryAnimationGroup;
  advanced: GalleryAdvancedGroup;
}

export function createGalleryId(prefix = "gallery") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createGalleryImage(partial?: Partial<GalleryImageItem>): GalleryImageItem {
  const src =
    partial?.src ??
    createStockImageReference(
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    );
  const filename =
    typeof src === "object" && src !== null
      ? String((src as { filename?: string }).filename ?? "")
      : "";
  return {
    id: partial?.id ?? createGalleryId("img"),
    src,
    alt: partial?.alt ?? "Gallery image",
    link: partial?.link ?? "",
    openInNewTab: partial?.openInNewTab ?? false,
    name: partial?.name ?? (filename || "Gallery image"),
  };
}

export function normalizeGalleryPx(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric >= 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function clampGalleryColumns(value: unknown, min: number, max: number, fallback: number): number {
  const num = Number(value);
  if (!Number.isFinite(num)) return fallback;
  return Math.max(min, Math.min(max, Math.round(num)));
}

export function isGalleryWidgetData(value: unknown): value is GalleryWidgetData {
  return Boolean(value && typeof value === "object" && (value as { type?: string }).type === "gallery");
}

const SAMPLE_IMAGES = [
  {
    id: "gallery-img-1",
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
    alt: "Mountain landscape at sunrise",
    name: "mountain-sunrise.jpg",
  },
  {
    id: "gallery-img-2",
    url: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
    alt: "Forest path through green trees",
    name: "forest-path.jpg",
  },
  {
    id: "gallery-img-3",
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80",
    alt: "Foggy hills and rolling landscape",
    name: "foggy-hills.jpg",
  },
  {
    id: "gallery-img-4",
    url: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?auto=format&fit=crop&w=1200&q=80",
    alt: "Sunlight through dense forest",
    name: "sunlit-forest.jpg",
  },
  {
    id: "gallery-img-5",
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
    alt: "Tropical beach with clear water",
    name: "tropical-beach.jpg",
  },
  {
    id: "gallery-img-6",
    url: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
    alt: "Snow-covered mountain peaks",
    name: "snow-peaks.jpg",
  },
];

export const defaultGalleryWidgetData: GalleryWidgetData = {
  id: "gallery-default",
  type: "gallery",
  variant: "Simple Grid",
  content: {
    images: SAMPLE_IMAGES.map((item) =>
      createGalleryImage({
        id: item.id,
        src: createStockImageReference(item.url),
        alt: item.alt,
        name: item.name,
      }),
    ),
    selectedImageId: "gallery-img-1",
  },
  style: {
    desktopColumns: 3,
    tabletColumns: 2,
    mobileColumns: 1,
    imageHeight: "240px",
    objectFit: "cover",
    borderRadius: "12px",
    imageGap: "16px",
    imageBorderEnabled: false,
    borderColor: "#e2e8f0",
    borderWidth: "1px",
    hoverEnabled: true,
    hoverScale: 1.03,
    hoverShadow: true,
    backgroundColor: "transparent",
  },
  layout: {
    paddingTop: "40px",
    paddingBottom: "40px",
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
