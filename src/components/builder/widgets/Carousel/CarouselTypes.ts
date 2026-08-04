import type { BuilderAssetEntry } from "@/lib/builder/image-storage";
import { createStockImageReference } from "@/lib/builder/image-storage";
import type { WidgetData } from "../widgetRegistry";

export type CarouselVariant = "Full-Width Image Slider";
export type CarouselObjectFit = "cover" | "contain";
export type CarouselArrowPosition = "inside" | "outside";
export type CarouselDotPosition = "inside-bottom" | "outside-bottom";

export interface CarouselSlide {
  id: string;
  src: BuilderAssetEntry | string;
  alt: string;
  link?: string;
  openInNewTab?: boolean;
  name?: string;
}

export interface CarouselContentGroup extends Record<string, unknown> {
  slides?: CarouselSlide[];
  selectedSlideId?: string;
  autoplay?: boolean;
  autoplayDelay?: number;
  infiniteLoop?: boolean;
  pauseOnHover?: boolean;
  transitionDuration?: number;
  keyboardNavigation?: boolean;
  swipeNavigation?: boolean;
}

export interface CarouselStyleGroup extends Record<string, unknown> {
  heightDesktop?: string;
  heightTablet?: string;
  heightMobile?: string;
  objectFit?: CarouselObjectFit;
  backgroundColor?: string;
  borderRadius?: string;
  overflowHidden?: boolean;
  showArrows?: boolean;
  arrowSize?: string;
  arrowColor?: string;
  arrowBackgroundColor?: string;
  arrowBackgroundOpacity?: number;
  arrowBorderRadius?: string;
  arrowPosition?: CarouselArrowPosition;
  showDots?: boolean;
  dotSize?: string;
  dotActiveColor?: string;
  dotInactiveColor?: string;
  dotPosition?: CarouselDotPosition;
}

export interface CarouselLayoutGroup extends Record<string, unknown> {
  paddingTop?: string;
  paddingBottom?: string;
}

export interface CarouselResponsiveGroup extends Record<string, unknown> {
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
}

export interface CarouselAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: string;
  duration?: number;
  delay?: number;
}

export interface CarouselAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  visibility?: boolean;
}

export interface CarouselWidgetData extends WidgetData {
  type: "carousel";
  variant: CarouselVariant;
  content: CarouselContentGroup;
  style: CarouselStyleGroup;
  layout: CarouselLayoutGroup;
  responsive: CarouselResponsiveGroup;
  animation: CarouselAnimationGroup;
  advanced: CarouselAdvancedGroup;
}

export function createCarouselId(prefix = "carousel") {
  return `${prefix}-${Math.random().toString(36).slice(2, 8)}`;
}

export function createCarouselSlide(partial?: Partial<CarouselSlide>): CarouselSlide {
  const src =
    partial?.src ??
    createStockImageReference(
      "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
    );
  const filename =
    typeof src === "object" && src !== null
      ? String((src as { filename?: string }).filename ?? "")
      : "";
  return {
    id: partial?.id ?? createCarouselId("slide"),
    src,
    alt: partial?.alt ?? "Carousel slide",
    link: partial?.link ?? "",
    openInNewTab: partial?.openInNewTab ?? false,
    name: partial?.name ?? (filename || "Slide image"),
  };
}

export function normalizeCarouselPx(value: unknown, fallback: string): string {
  const raw = String(value ?? "").trim();
  if (!raw) return fallback;
  if (/^\d+(\.\d+)?px$/i.test(raw)) return raw;
  const numeric = Number(raw);
  if (Number.isFinite(numeric) && numeric >= 0) return `${numeric}px`;
  const match = raw.match(/^(\d+(?:\.\d+)?)/);
  if (match) return `${match[1]}px`;
  return fallback;
}

export function isCarouselWidgetData(value: unknown): value is CarouselWidgetData {
  return Boolean(
    value &&
      typeof value === "object" &&
      (value as { type?: string }).type === "carousel",
  );
}

export const defaultCarouselWidgetData: CarouselWidgetData = {
  id: "carousel-default",
  type: "carousel",
  variant: "Full-Width Image Slider",
  content: {
    slides: [
      createCarouselSlide({
        id: "slide-1",
        src: createStockImageReference(
          "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
        ),
        alt: "Mountain landscape at sunrise",
        name: "mountain-sunrise.jpg",
      }),
      createCarouselSlide({
        id: "slide-2",
        src: createStockImageReference(
          "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
        ),
        alt: "Forest path through green trees",
        name: "forest-path.jpg",
      }),
      createCarouselSlide({
        id: "slide-3",
        src: createStockImageReference(
          "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1600&q=80",
        ),
        alt: "Foggy hills and rolling landscape",
        name: "foggy-hills.jpg",
      }),
    ],
    selectedSlideId: "slide-1",
    autoplay: false,
    autoplayDelay: 5000,
    infiniteLoop: true,
    pauseOnHover: true,
    transitionDuration: 500,
    keyboardNavigation: true,
    swipeNavigation: true,
  },
  style: {
    heightDesktop: "560px",
    heightTablet: "420px",
    heightMobile: "280px",
    objectFit: "cover",
    backgroundColor: "#0f172a",
    borderRadius: "0px",
    overflowHidden: true,
    showArrows: true,
    arrowSize: "44px",
    arrowColor: "#ffffff",
    arrowBackgroundColor: "#0f172a",
    arrowBackgroundOpacity: 0.45,
    arrowBorderRadius: "9999px",
    arrowPosition: "inside",
    showDots: true,
    dotSize: "10px",
    dotActiveColor: "#ffffff",
    dotInactiveColor: "rgba(255,255,255,0.45)",
    dotPosition: "inside-bottom",
  },
  layout: {
    paddingTop: "0px",
    paddingBottom: "0px",
  },
  responsive: {
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 500,
    delay: 0,
  },
  advanced: {
    id: "",
    className: "",
    visibility: true,
  },
};
