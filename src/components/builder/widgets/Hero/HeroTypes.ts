import type { WidgetData } from "../widgetRegistry";
import { createContainerChildItem, type ContainerChildItem, getContainerChildWidgetData, buildContainerChildData } from "../Container/ContainerTypes";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import { DEFAULT_HERO_PADDING, DEFAULT_ZERO_SPACING } from "../spacing";

export interface HeroContentGroup extends Record<string, unknown> {
  children?: ContainerChildItem[];
  badge?: string;
  heading?: string;
  subheading?: string;
  description?: string;
  trustText?: string;
  ctaPrimaryLabel?: string;
  ctaPrimaryHref?: string;
  ctaSecondaryLabel?: string;
  ctaSecondaryHref?: string;
  mediaAlt?: string;
  mediaSrc?: BuilderAssetEntry;
  statsVisible?: boolean;
  statsValue?: string;
  statsLabel?: string;
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
  statsBackgroundColor?: string;
  statsTextColor?: string;
  statsBorderRadius?: string;
  statsPosition?: "top-right" | "top-left" | "bottom-right" | "bottom-left";
  statsOffsetTop?: string;
  statsOffsetRight?: string;
  statsOffsetBottom?: string;
  statsOffsetLeft?: string;
  statsWidth?: string;
  glowVisible?: boolean;
  glowColorA?: string;
  glowColorB?: string;
  glowOpacity?: number;
  glowBlur?: string;
  glowSizeA?: string;
  glowSizeB?: string;
  glowPositionATop?: string;
  glowPositionALeft?: string;
  glowPositionBBottom?: string;
  glowPositionBRight?: string;
}

export interface HeroLayoutGroup extends Record<string, unknown> {
  align?: "left" | "center" | "right";
  columns?: "split" | "stacked";
  containerWidth?: "narrow" | "standard" | "wide";
  contentWidth?: "narrow" | "standard" | "wide";
  imagePosition?: "right" | "left" | "bottom";
  padding?: unknown;
  margin?: unknown;
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

  children.push(
    createContainerChildItem("text", {
      id: "trustText",
      data: {
        content: { text: String(content.trustText ?? "No coding required • Fully responsive • Export ready") },
        style: { color: String(style.textColor ?? "#94a3b8") },
        advanced: { visibility: true },
      },
    }),
  );

  const imageSrc = resolveImageSource(content.mediaSrc);
  // console.log("HERO MEDIA SRC", content.mediaSrc);
  // console.log("HERO RESOLVED SRC", imageSrc);
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

  const hasStatsText = (typeof content.statsValue === "string" && content.statsValue.trim().length > 0) || (typeof content.statsLabel === "string" && content.statsLabel.trim().length > 0);
  if (content.statsVisible || hasStatsText) {
    children.push(
      createContainerChildItem("container", {
        id: "statsCard",
        data: {
          style: {
            top: String(style.statsOffsetTop ?? "1.5rem"),
            right: String(style.statsOffsetRight ?? "1rem"),
            bottom: String(style.statsOffsetBottom ?? ""),
            left: String(style.statsOffsetLeft ?? ""),
            width: String(style.statsWidth ?? "min(240px, 55%)"),
            padding: "1rem 1.2rem",
            borderRadius: String(style.statsBorderRadius ?? "1.5rem"),
            backgroundColor: String(style.statsBackgroundColor ?? "rgba(15,23,42,0.86)"),
            border: "1px solid rgba(255,255,255,0.08)",
            backdropFilter: "blur(24px)",
            boxShadow: "0 40px 100px rgba(15,23,42,0.45)",
            color: String(style.statsTextColor ?? "#f8fafc"),
          },
          advanced: { visibility: true },
        },
      }),
    );
    children.push(
      createContainerChildItem("text", {
        id: "statsValue",
        data: {
          content: { text: String(content.statsValue ?? "") },
          style: { fontSize: "32px", fontWeight: "800" },
          advanced: { visibility: true },
        },
      }),
    );
    children.push(
      createContainerChildItem("text", {
        id: "statsMeta",
        data: {
          content: { text: String(content.statsLabel ?? "") },
          style: { color: "#cbd5e1", fontSize: "15px" },
          advanced: { visibility: true },
        },
      }),
    );
  }

  if (style.glowVisible) {
    children.push(
      createContainerChildItem("container", {
        id: "glowA",
        data: {
          style: {
            width: String(style.glowSizeA ?? "260px"),
            height: String(style.glowSizeA ?? "260px"),
            top: String(style.glowPositionATop ?? "-10%"),
            left: String(style.glowPositionALeft ?? "-14%"),
            backgroundColor: String(style.glowColorA ?? "rgba(56,189,248,0.35)"),
            opacity: style.glowOpacity ?? 0.9,
            filter: `blur(${String(style.glowBlur ?? "80px")})`,
            zIndex: 0,
          },
          advanced: { visibility: true },
        },
      }),
    );
    children.push(
      createContainerChildItem("container", {
        id: "glowB",
        data: {
          style: {
            width: String(style.glowSizeB ?? "240px"),
            height: String(style.glowSizeB ?? "240px"),
            bottom: String(style.glowPositionBBottom ?? "-14%"),
            right: String(style.glowPositionBRight ?? "-8%"),
            backgroundColor: String(style.glowColorB ?? "rgba(124,58,237,0.45)"),
            opacity: style.glowOpacity ?? 0.9,
            filter: `blur(${String(style.glowBlur ?? "80px")})`,
            zIndex: 0,
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

function getHeroContentLayout(variant: string) {
  switch (variant) {
    case "Split":
      return "split";
    case "Centered":
      return "centered";
    default:
      return "classic";
  }
}

export function normalizeHeroChildItem(heroData: HeroWidgetData, child: ContainerChildItem): ContainerChildItem {
  const childData = getContainerChildWidgetData(child);
  const layout = getHeroContentLayout(heroData.variant ?? "Classic");

  const injectedChildData = {
    ...childData,
    content: { ...(childData.content ?? {}) },
    style: { ...(childData.style ?? {}) },
    layout: { ...(childData.layout ?? {}) },
    responsive: { ...(childData.responsive ?? {}) },
    animation: { ...(childData.animation ?? {}) },
    advanced: { ...(childData.advanced ?? {}) },
    variant: childData.variant,
  };

  if ((child.type === "heading" || child.type === "text") && !injectedChildData.style?.textColor) {
    injectedChildData.style = {
      ...injectedChildData.style,
      textColor:
        injectedChildData.style?.color ||
        (child.type === "heading" ? heroData.style.headingColor : heroData.style.textColor) ||
        undefined,
    };
  }

  if (layout === "classic") {
    if (child.type === "heading") {
      injectedChildData.style = {
        ...injectedChildData.style,
        textColor: injectedChildData.style?.textColor ?? "#f8fafc",
        fontSize: injectedChildData.style?.fontSize ?? "48px",
        fontWeight: injectedChildData.style?.fontWeight ?? "800",
        lineHeight: injectedChildData.style?.lineHeight ?? "0.95",
        letterSpacing: injectedChildData.style?.letterSpacing ?? "-0.04em",
        gradientStart: injectedChildData.style?.gradientStart ?? "#c084fc",
        gradientEnd: injectedChildData.style?.gradientEnd ?? "#fb7185",
      };
      injectedChildData.variant = injectedChildData.variant ?? "Gradient";
    }

    if (child.id === "badge") {
      injectedChildData.style = {
        ...injectedChildData.style,
        color: injectedChildData.style?.color ?? "#e0e7ff",
        backgroundColor: injectedChildData.style?.backgroundColor ?? "rgba(124,58,237,0.18)",
        borderRadius: injectedChildData.style?.borderRadius ?? "999px",
        padding: injectedChildData.style?.padding ?? "0.65rem 1rem",
        fontSize: injectedChildData.style?.fontSize ?? "12px",
        fontWeight: injectedChildData.style?.fontWeight ?? "700",
        letterSpacing: injectedChildData.style?.letterSpacing ?? "0.14em",
        textTransform: injectedChildData.style?.textTransform ?? "uppercase",
      };
    }

    if (child.id === "subheading") {
      injectedChildData.style = {
        ...injectedChildData.style,
        color: injectedChildData.style?.color ?? "#cbd5e1",
        fontSize: injectedChildData.style?.fontSize ?? "16px",
        lineHeight: injectedChildData.style?.lineHeight ?? "1.7",
      };
    }

    if (child.id === "description") {
      injectedChildData.style = {
        ...injectedChildData.style,
        color: injectedChildData.style?.color ?? "#94a3b8",
        fontSize: injectedChildData.style?.fontSize ?? "16px",
        lineHeight: injectedChildData.style?.lineHeight ?? "1.85",
      };
    }

    if (child.type === "button") {
      injectedChildData.style = {
        ...injectedChildData.style,
        borderRadius: injectedChildData.style?.borderRadius ?? "999px",
        shadow: injectedChildData.style?.shadow ?? true,
      };

      if (child.id === "primaryButton") {
        injectedChildData.variant = injectedChildData.variant ?? "Gradient";
        injectedChildData.content = {
          ...injectedChildData.content,
          text: injectedChildData.content?.text ?? "Get Started Free",
          url: String(injectedChildData.content?.url ?? "#"),
        };
        injectedChildData.style = {
          ...injectedChildData.style,
          variant: injectedChildData.style?.variant ?? "Gradient",
          color: injectedChildData.style?.color ?? "Custom",
          customColor: injectedChildData.style?.customColor ?? "#7c3aed",
          fontWeight: injectedChildData.style?.fontWeight ?? "700",
          background: injectedChildData.style?.background ?? "linear-gradient(90deg, #7c3aed, #ec4899, #f97316)",
        };
      }

      if (child.id === "secondaryButton") {
        injectedChildData.variant = injectedChildData.variant ?? "Outline";
        injectedChildData.content = {
          ...injectedChildData.content,
          text: injectedChildData.content?.text ?? "View Live Demo",
          url: String(injectedChildData.content?.url ?? "#"),
        };
        injectedChildData.style = {
          ...injectedChildData.style,
          variant: injectedChildData.style?.variant ?? "Outline",
          color: injectedChildData.style?.color ?? "Custom",
          customColor: injectedChildData.style?.customColor ?? "rgba(255,255,255,0.88)",
          borderWidth: injectedChildData.style?.borderWidth ?? "1px",
          backgroundColor: injectedChildData.style?.backgroundColor ?? "rgba(255,255,255,0.08)",
          backdropFilter: injectedChildData.style?.backdropFilter ?? "blur(10px)",
        };
      }
    }

    if (child.type === "image") {
      injectedChildData.content = {
        ...injectedChildData.content,
        src: injectedChildData.content?.src ?? "https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80",
        alt: injectedChildData.content?.alt ?? "Hero illustration",
      };
      injectedChildData.style = {
        ...injectedChildData.style,
        width: injectedChildData.style?.width ?? "100%",
        height: injectedChildData.style?.height ?? "auto",
        objectFit: injectedChildData.style?.objectFit ?? "cover",
        borderRadius: injectedChildData.style?.borderRadius ?? "32px",
      };
      injectedChildData.layout = {
        ...injectedChildData.layout,
        alignment: injectedChildData.layout?.alignment ?? "center",
      };
    }
  }

  return {
    ...child,
    data: buildContainerChildData({
      content: injectedChildData.content,
      style: injectedChildData.style,
      layout: injectedChildData.layout,
      responsive: injectedChildData.responsive,
      animation: injectedChildData.animation,
      advanced: injectedChildData.advanced,
      variant: injectedChildData.variant,
    }),
  };
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
  createContainerChildItem("container", {
    id: "glowA",
    data: {
      style: {
        width: "260px",
        height: "260px",
        top: "-10%",
        left: "-14%",
        backgroundColor: "rgba(56,189,248,0.35)",
        opacity: 0.9,
        filter: "blur(80px)",
        zIndex: 0,
      },
      advanced: { visibility: true },
    },
  }),
  createContainerChildItem("container", {
    id: "glowB",
    data: {
      style: {
        width: "240px",
        height: "240px",
        bottom: "-14%",
        right: "-8%",
        backgroundColor: "rgba(124,58,237,0.45)",
        opacity: 0.9,
        filter: "blur(80px)",
        zIndex: 0,
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
    statsVisible: false,
  },
  style: {
    backgroundType: "solid",
    backgroundColor: "#0f1430",
    headingColor: "#ffffff",
    textColor: "#cbd5e1",
    buttonStyle: "solid",
    buttonColor: "#7c3aed",
    accentColor: "#7c3aed",
    borderRadius: "1rem",
    shadow: "sm",
    paddingY: 6,
    statsBackgroundColor: "rgba(15,23,42,0.86)",
    statsTextColor: "#f8fafc",
    statsBorderRadius: "1.5rem",
    statsOffsetTop: "1.5rem",
    statsOffsetRight: "1rem",
    statsWidth: "240px",
    glowVisible: true,
    glowColorA: "rgba(56,189,248,0.35)",
    glowColorB: "rgba(124,58,237,0.45)",
    glowOpacity: 0.9,
    glowBlur: "80px",
    glowSizeA: "260px",
    glowSizeB: "240px",
    glowPositionATop: "-10%",
    glowPositionALeft: "-14%",
    glowPositionBBottom: "-14%",
    glowPositionBRight: "-8%",
  },
  layout: {
    align: "left",
    columns: "split",
    containerWidth: "standard",
    contentWidth: "standard",
    imagePosition: "right",
    padding: DEFAULT_HERO_PADDING,
    margin: DEFAULT_ZERO_SPACING,
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

 
