import type { WidgetData } from "../widgetRegistry";
import { createContainerChildItem, type ContainerChildItem } from "../Container/ContainerTypes";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";

export interface HeroContentGroup extends Record<string, unknown> {
  children?: ContainerChildItem[];
  badge?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  mediaAlt?: string;
  mediaSrc?: BuilderAssetEntry;
}

export interface HeroStyleGroup extends Record<string, unknown> {
  backgroundType?: "solid" | "gradient" | "image";
  backgroundColor?: string;
  headingColor?: string;
  textColor?: string;
  buttonStyle?: "solid" | "outline" | "ghost";
  buttonColor?: string;
  accentColor?: string;
  borderRadius?: string;
  shadow?: string;
  paddingY?: number;
}

export interface HeroLayoutGroup extends Record<string, unknown> {
  align?: "left" | "center" | "right";
  columns?: "split" | "stacked";
  containerWidth?: "narrow" | "standard" | "wide";
  contentWidth?: "narrow" | "standard" | "wide";
  imagePosition?: "right" | "left" | "bottom";
  padding?: string;
  margin?: string;
}

export interface HeroResponsiveGroup extends Record<string, unknown> {
  mobileStack?: boolean;
  hideImageOnMobile?: boolean;
  hideOnMobile?: boolean;
  hideOnTablet?: boolean;
  hideOnDesktop?: boolean;
  mobilePadding?: string;
}

export interface HeroAnimationGroup extends Record<string, unknown> {
  enabled?: boolean;
  type?: "none" | "fade" | "slide-up" | "zoom";
  duration?: number;
  delay?: number;
}

export interface HeroAdvancedGroup extends Record<string, unknown> {
  id?: string;
  className?: string;
  dataAttributes?: Record<string, string>;
  customCss?: string;
  visibility?: boolean;
}

export interface HeroWidgetData extends WidgetData {
  id: string;
  type: string;
  variant: string;
  content: HeroContentGroup;
  style: HeroStyleGroup;
  layout: HeroLayoutGroup;
  responsive: HeroResponsiveGroup;
  animation: HeroAnimationGroup;
  advanced: HeroAdvancedGroup;
}

export function isHeroWidgetData(data: WidgetData): data is HeroWidgetData {
  return data.type === "hero";
}

function resolveImageSource(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (typeof value === "object" && value !== null) {
    const assetValue = getAssetValue(value as BuilderAssetEntry);
    if (assetValue) {
      return assetValue;
    }

    const maybe = value as Record<string, unknown>;
    if (typeof maybe.url === "string" && maybe.url.trim()) {
      return maybe.url.trim();
    }
    if (typeof maybe.src === "string" && maybe.src.trim()) {
      return maybe.src.trim();
    }
    if (typeof maybe.value === "string" && maybe.value.trim()) {
      return maybe.value.trim();
    }
  }

  return "";
}

function buildHeroChildItemsFromLegacy(heroData: HeroWidgetData): ContainerChildItem[] {
  const content = heroData.content as HeroContentGroup;
  const style = heroData.style;
  const children: ContainerChildItem[] = [];

  if (content.badge) {
    children.push(
      createContainerChildItem("text", {
        id: "badge",
        data: {
          content: { text: String(content.badge) },
          style: { color: String(style.headingColor ?? style.textColor ?? "#0f172a") },
          advanced: { visibility: true },
        },
      }),
    );
  }

  if (content.heading) {
    children.push(
      createContainerChildItem("heading", {
        id: "heading",
        data: {
          content: { text: String(content.heading) },
          style: { color: String(style.headingColor ?? style.textColor ?? "#0f172a") },
          advanced: { visibility: true },
        },
      }),
    );
  }

  if (content.subheading) {
    children.push(
      createContainerChildItem("text", {
        id: "subheading",
        data: {
          content: { text: String(content.subheading) },
          advanced: { visibility: true },
        },
      }),
    );
  }

  if (content.description) {
    children.push(
      createContainerChildItem("text", {
        id: "description",
        data: {
          content: { text: String(content.description) },
          advanced: { visibility: true },
        },
      }),
    );
  }

  if (content.ctaPrimaryLabel) {
    children.push(
      createContainerChildItem("button", {
        id: "primaryButton",
        data: {
          content: {
            text: String(content.ctaPrimaryLabel),
            url: String(content.ctaPrimaryHref ?? "#"),
          },
          style: { display: "inline" },
          advanced: { visibility: true },
        },
      }),
    );
  }

  if (content.ctaSecondaryLabel) {
    children.push(
      createContainerChildItem("button", {
        id: "secondaryButton",
        data: {
          content: {
            text: String(content.ctaSecondaryLabel),
            url: String(content.ctaSecondaryHref ?? "#"),
          },
          style: { display: "inline" },
          advanced: { visibility: true },
        },
      }),
    );
  }

  const imageSrc = resolveImageSource(content.mediaSrc);
  console.log("HERO MEDIA SRC", content.mediaSrc);
  console.log("HERO RESOLVED SRC", imageSrc);
  if (imageSrc.trim()) {
    children.push(
      createContainerChildItem("image", {
        id: "image",
        data: {
          content: {
            src: imageSrc,
            alt: String(content.mediaAlt ?? "Hero illustration"),
          },
          advanced: { visibility: true },
        },
      }),
    );
  }

  return children;
}

export function getHeroChildItems(heroData: HeroWidgetData): ContainerChildItem[] {
  const children = Array.isArray(heroData.content.children) ? heroData.content.children : [];
  return children.length > 0 ? children : buildHeroChildItemsFromLegacy(heroData);
}

const defaultHeroChildren: ContainerChildItem[] = [
  createContainerChildItem("text", {
    id: "badge",
    data: {
      content: { text: "New standard" },
      style: { color: "#0f172a" },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("heading", {
    id: "heading",
    data: {
      content: { text: "Hero Widget V2" },
      style: { color: "#0f172a" },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("text", {
    id: "subheading",
    data: {
      content: { text: "A Bootstrap-first foundation for future widgets." },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("text", {
    id: "description",
    data: {
      content: { text: "Create polished hero sections with the shared property panel foundation." },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("button", {
    id: "primaryButton",
    data: {
      content: { text: "Get started", url: "#" },
      style: { display: "inline" },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("button", {
    id: "secondaryButton",
    data: {
      content: { text: "Learn more", url: "#" },
      style: { display: "inline" },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("image", {
    id: "image",
    data: {
      content: {
        src: {
          sourceType: "stock",
          src: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
          url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
          filename: "hero-stock-preview.jpg",
          provider: "Builder stock preview",
          attribution: "",
          isPreview: true,
          isWatermarked: true,
        },
        alt: "Hero illustration",
      },
      advanced: { visibility: true },
    },
  }),
];

export const defaultHeroWidgetData: HeroWidgetData = {
  id: "hero-widget-v2",
  type: "hero",
  variant: "Classic",
  content: {
    children: defaultHeroChildren,
  },
  style: {
    backgroundType: "solid",
    backgroundColor: "#f8fafc",
    headingColor: "#0f172a",
    textColor: "#475569",
    buttonStyle: "solid",
    buttonColor: "#2563eb",
    accentColor: "#2563eb",
    borderRadius: "1rem",
    shadow: "sm",
    paddingY: 5,
  },
  layout: {
    align: "left",
    columns: "split",
    containerWidth: "standard",
    contentWidth: "standard",
    imagePosition: "right",
    padding: "2rem",
    margin: "0rem",
  },
  responsive: {
    mobileStack: true,
    hideImageOnMobile: false,
    hideOnMobile: false,
    hideOnTablet: false,
    hideOnDesktop: false,
    mobilePadding: "1rem",
  },
  animation: {
    enabled: false,
    type: "none",
    duration: 400,
    delay: 0,
  },
  advanced: {
    id: "hero-widget-v2",
    className: "",
    dataAttributes: {},
    customCss: "",
    visibility: true,
  },
};

console.log("HERO DEFAULT", defaultHeroWidgetData);
