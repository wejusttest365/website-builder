import type { WidgetData } from "./widgetRegistry";
import type { WidgetElementType } from "./elementSelection";

export interface WidgetElementDuplicateEntry {
  id: string;
  key: string;
  type: WidgetElementType;
  content?: Record<string, unknown>;
  style?: Record<string, unknown>;
  layout?: Record<string, unknown>;
  advanced?: Record<string, unknown>;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function createEntry(
  key: string,
  type: WidgetElementType,
  content: Record<string, unknown> | undefined,
  style: Record<string, unknown> | undefined,
  layout: Record<string, unknown> | undefined,
  advanced: Record<string, unknown> | undefined,
): WidgetElementDuplicateEntry {
  return {
    id: `${key}-${Math.random().toString(36).slice(2, 10)}`,
    key,
    type,
    content: clone(content),
    style: clone(style),
    layout: clone(layout),
    advanced: clone(advanced),
  };
}

export function getWidgetElementDuplicateEntries(data: WidgetData): WidgetElementDuplicateEntry[] {
  const advanced = (data as WidgetData & { advanced?: Record<string, unknown> }).advanced ?? {};
  const duplicatedElements = advanced.duplicatedElements;
  return Array.isArray(duplicatedElements) ? (duplicatedElements as WidgetElementDuplicateEntry[]) : [];
}

export function createWidgetElementDuplicateEntry(data: WidgetData, elementKey: string | null, elementType: string | null): WidgetElementDuplicateEntry | null {
  const type = data.type;
  const advanced = (data as WidgetData & { advanced?: Record<string, unknown> }).advanced ?? {};

  switch (type) {
    case "heading": {
      if (elementKey !== "heading") return null;
      return createEntry(
        "heading",
        "text",
        {
          text: String((data.content as Record<string, unknown>).text ?? ""),
          headingLevel: (data.content as Record<string, unknown>).headingLevel ?? "h2",
          label: (data.content as Record<string, unknown>).label ?? "",
        },
        {
          textColor: (data.style as Record<string, unknown>).textColor,
          fontSize: (data.style as Record<string, unknown>).fontSize,
          fontWeight: (data.style as Record<string, unknown>).fontWeight,
          lineHeight: (data.style as Record<string, unknown>).lineHeight,
          letterSpacing: (data.style as Record<string, unknown>).letterSpacing,
          underlineColor: (data.style as Record<string, unknown>).underlineColor,
          gradientStart: (data.style as Record<string, unknown>).gradientStart,
          gradientEnd: (data.style as Record<string, unknown>).gradientEnd,
        },
        {
          alignment: (data.layout as Record<string, unknown>).alignment,
          padding: (data.layout as Record<string, unknown>).padding,
          margin: (data.layout as Record<string, unknown>).margin,
        },
        { visibility: true },
      );
    }
    case "text": {
      if (elementKey !== "text") return null;
      return createEntry(
        "text",
        "text",
        {
          text: String((data.content as Record<string, unknown>).text ?? ""),
          richText: (data.content as Record<string, unknown>).richText ?? false,
        },
        {
          textColor: (data.style as Record<string, unknown>).textColor,
          fontSize: (data.style as Record<string, unknown>).fontSize,
          fontWeight: (data.style as Record<string, unknown>).fontWeight,
          lineHeight: (data.style as Record<string, unknown>).lineHeight,
          letterSpacing: (data.style as Record<string, unknown>).letterSpacing,
        },
        {
          alignment: (data.layout as Record<string, unknown>).alignment,
          padding: (data.layout as Record<string, unknown>).padding,
          margin: (data.layout as Record<string, unknown>).margin,
        },
        { visibility: true },
      );
    }
    case "button": {
      if (elementKey !== "button") return null;
      return createEntry(
        "button",
        "button",
        {
          text: (data.content as Record<string, unknown>).text ?? "",
          url: (data.content as Record<string, unknown>).url ?? "#",
          openInNewTab: (data.content as Record<string, unknown>).openInNewTab ?? false,
          iconLeft: (data.content as Record<string, unknown>).iconLeft ?? "",
          iconRight: (data.content as Record<string, unknown>).iconRight ?? "",
        },
        {
          ...(data.style as Record<string, unknown>),
          display: (data.style as Record<string, unknown>).display ?? "inline",
        },
        {
          alignment: (data.layout as Record<string, unknown>).alignment,
          padding: (data.layout as Record<string, unknown>).padding,
          margin: (data.layout as Record<string, unknown>).margin,
        },
        { visibility: true },
      );
    }
    case "image": {
      if (elementKey !== "image") return null;
      return createEntry(
        "image",
        "image",
        {
          src: (data.content as Record<string, unknown>).src ?? "",
          alt: (data.content as Record<string, unknown>).alt ?? "",
          caption: (data.content as Record<string, unknown>).caption ?? "",
          url: (data.content as Record<string, unknown>).url ?? "",
          openInNewTab: (data.content as Record<string, unknown>).openInNewTab ?? false,
        },
        {
          width: (data.style as Record<string, unknown>).width,
          height: (data.style as Record<string, unknown>).height,
          objectFit: (data.style as Record<string, unknown>).objectFit,
          borderRadius: (data.style as Record<string, unknown>).borderRadius,
          borderWidth: (data.style as Record<string, unknown>).borderWidth,
          borderColor: (data.style as Record<string, unknown>).borderColor,
          shadow: (data.style as Record<string, unknown>).shadow,
          opacity: (data.style as Record<string, unknown>).opacity,
        },
        {
          alignment: (data.layout as Record<string, unknown>).alignment,
          padding: (data.layout as Record<string, unknown>).padding,
          margin: (data.layout as Record<string, unknown>).margin,
          maxWidth: (data.layout as Record<string, unknown>).maxWidth,
        },
        { visibility: true },
      );
    }
    case "hero": {
      const heroContent = data.content as Record<string, unknown>;
      const heroStyle = data.style as Record<string, unknown>;
      if (elementKey === "badge") {
        return createEntry("badge", "text", { text: String(heroContent.badge ?? "") }, { color: heroStyle.headingColor ?? heroStyle.textColor }, undefined, { visibility: true });
      }
      if (elementKey === "heading") {
        return createEntry("heading", "text", { text: String(heroContent.heading ?? "") }, { color: heroStyle.headingColor ?? heroStyle.textColor }, undefined, { visibility: true });
      }
      if (elementKey === "subheading" || elementKey === "description") {
        return createEntry(elementKey, "text", { text: String(heroContent[elementKey] ?? heroContent.description ?? "") }, undefined, undefined, { visibility: true });
      }
      if (elementKey === "primaryButton") {
        return createEntry("primaryButton", "button", { text: String(heroContent.ctaPrimaryLabel ?? "") }, { display: "inline" }, undefined, { visibility: true });
      }
      if (elementKey === "secondaryButton") {
        return createEntry("secondaryButton", "button", { text: String(heroContent.ctaSecondaryLabel ?? "") }, { display: "inline" }, undefined, { visibility: true });
      }
      if (elementKey === "image") {
        const imageSrc = typeof heroContent.mediaSrc === "object" && heroContent.mediaSrc !== null ? (heroContent.mediaSrc as any).src || String(heroContent.mediaSrc) : String(heroContent.mediaSrc ?? "");
        return createEntry("image", "image", { src: imageSrc, alt: String(heroContent.mediaAlt ?? "") }, undefined, undefined, { visibility: true });
      }
      return null;
    }
    case "navbar": {
      if (elementKey === "ctaButton") {
        return createEntry("ctaButton", "button", { text: (data.content as Record<string, unknown>).ctaLabel ?? "" }, undefined, undefined, { visibility: true });
      }
      return null;
    }
    default: {
      if (!elementKey || !elementType) return null;
      return createEntry(elementKey, elementType as WidgetElementType, { ...clone((data.content as Record<string, unknown>) ?? {}) }, { ...clone((data.style as Record<string, unknown>) ?? {}) }, { ...clone((data.layout as Record<string, unknown>) ?? {}) }, { visibility: true });
    }
  }
}
