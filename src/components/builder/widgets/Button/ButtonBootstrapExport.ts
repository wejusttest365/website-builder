import type { WidgetData } from "../widgetRegistry";
import { getWidgetElementDuplicateEntries } from "../elementDuplication";
import { defaultButtonWidgetData, isButtonWidgetData } from "./ButtonTypes";
import { getResponsiveSpacingCss, getSpacingValueForDevice, serializeSpacingValue } from "../spacing";
import { normalizeFontSizeToPx } from "../fontSize";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\"/g, "&quot;").replace(/'/g, "&#39;");
}

function getThemeColor(color: string, customColor?: string) {
  if (color === "Custom") {
    return customColor || "#0d6efd";
  }

  switch (color) {
    case "Secondary":
      return "#6c757d";
    case "Success":
      return "#198754";
    case "Danger":
      return "#dc3545";
    default:
      return "#0d6efd";
  }
}

function getSizePadding(size: string) {
  switch (size) {
    case "Small":
      return "0.55rem 1rem";
    case "Large":
      return "0.95rem 1.75rem";
    default:
      return "0.75rem 1.5rem";
  }
}

export function buildButtonBootstrapMarkup(data: WidgetData = defaultButtonWidgetData): string {
  const buttonData = isButtonWidgetData(data) ? data : defaultButtonWidgetData;
  const duplicateEntries = getWidgetElementDuplicateEntries(buttonData);

  const renderEntry = (entry?: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> }) => {
    const content = entry?.content ? { ...buttonData.content, ...entry.content } : buttonData.content;
    const style = entry?.style ? { ...buttonData.style, ...entry.style } : buttonData.style;
    const layout = entry?.layout ? { ...buttonData.layout, ...entry.layout } : buttonData.layout;
    const advanced = entry?.advanced ? { ...buttonData.advanced, ...entry.advanced } : buttonData.advanced;
    const variant = buttonData.variant ?? String(style.variant ?? "Filled");
    const text = escapeHtml(String(content.text || "Get started"));
    const url = escapeHtml(String(content.url || "#"));
    const iconLeft = escapeHtml(String(content.iconLeft || "")).trim();
    const iconRight = escapeHtml(String(content.iconRight || "")).trim();
    const color = getThemeColor(style.color ?? "Primary", String(style.customColor ?? "#0d6efd"));
    const sizePadding = getSizePadding(style.size ?? "Medium");
    const borderRadius = escapeHtml(String(style.borderRadius || "0.75rem"));

    const classes = ["btn"];
    const bootstrapColor = style.color === "Secondary" ? "secondary" : style.color === "Success" ? "success" : style.color === "Danger" ? "danger" : "primary";

    if (variant === "Outline") {
      classes.push(`btn-outline-${bootstrapColor}`);
    } else if (variant === "Ghost") {
      classes.push("btn-link");
    } else {
      classes.push(`btn-${bootstrapColor}`);
    }

    if (style.fullWidth) {
      classes.push("w-100");
    }

    if (buttonData.responsive.hideOnMobile) {
      classes.push("d-none", "d-sm-inline-flex");
    }
    if (buttonData.responsive.hideOnTablet) {
      classes.push("d-none", "d-md-inline-flex");
    }
    if (buttonData.responsive.hideOnDesktop) {
      classes.push("d-none", "d-lg-inline-flex");
    }

    const styleFragments: string[] = [];
    if (style.fontFamily) styleFragments.push(`font-family: ${escapeHtml(String(style.fontFamily))};`);
    if (style.fontSize) styleFragments.push(`font-size: ${escapeHtml(String(normalizeFontSizeToPx(style.fontSize) ?? style.fontSize))};`);
    styleFragments.push(`padding: ${sizePadding};`);
    styleFragments.push(`border-radius: ${borderRadius};`);
    if (style.display === "block") {
      styleFragments.push("display: flex;");
    } else {
      styleFragments.push("display: inline-flex;");
    }

    if (style.shadow) {
      styleFragments.push(`box-shadow: 0 0.75rem 1.5rem rgba(15, 23, 42, 0.12);`);
    }

    if (variant === "Filled") {
      if (style.color === "Custom") {
        styleFragments.push(`background-color: ${color};`, `border-color: ${color};`, `color: #ffffff;`);
      }
    }

    if (variant === "Gradient") {
      styleFragments.push(`background-image: linear-gradient(90deg, ${color} 0%, ${color}cc 100%);`, `border-color: ${color};`, `color: #ffffff;`);
    }

    if (variant === "Outline") {
      if (style.color === "Custom") {
        styleFragments.push(`border-color: ${color};`, `color: ${color};`);
      }
    }

    if (variant === "Ghost") {
      if (style.color === "Custom") {
        styleFragments.push(`color: ${color};`);
      }
      styleFragments.push("background-color: transparent; border-color: transparent;");
    }

    const dataAttributes = Object.entries(advanced.dataAttributes || {})
      .map(([key, value]) => `data-${escapeHtml(key)}="${escapeHtml(String(value))}"`)
      .join(" ");

    const openInNewTab = content.openInNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";

    const iconLeftMarkup = iconLeft ? `<i class="fa-solid fa-${iconLeft}" aria-hidden="true"></i> ` : "";
    const iconRightMarkup = iconRight ? ` <i class="fa-solid fa-${iconRight}" aria-hidden="true"></i>` : "";

    const spacingClassName = `wto-spacing-${String(buttonData.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const desktopMargin = serializeSpacingValue(getSpacingValueForDevice(layout.margin, "desktop"));
    const desktopPadding = serializeSpacingValue(getSpacingValueForDevice(layout.padding, "desktop"));
    const wrapperStyles: string[] = [];
    if (desktopMargin) wrapperStyles.push(`margin: ${escapeHtml(desktopMargin)};`);
    if (desktopPadding) wrapperStyles.push(`padding: ${escapeHtml(desktopPadding)};`);

    const alignmentClass =
      layout.alignment === "center"
        ? "text-center"
        : layout.alignment === "right"
        ? "text-end"
        : "text-start";

    const buttonClass = classes.join(" ");
    const buttonStyle = styleFragments.join(" ");
    const wrapperStyle = wrapperStyles.join(" ");
    const spacingCss = getResponsiveSpacingCss(layout as Record<string, unknown>, spacingClassName);
    const spacingMarkup = spacingCss ? `<style>${spacingCss}</style>` : "";

    return `${spacingMarkup}<div class="${[alignmentClass, spacingClassName].filter(Boolean).join(" ")}" style="${wrapperStyle}">
    <a href="${url}" class="${buttonClass}" style="${buttonStyle}"${openInNewTab}${dataAttributes}>
      ${iconLeftMarkup}${text}${iconRightMarkup}
    </a>
  </div>`;
  };

  const entries = [renderEntry()].concat(duplicateEntries.map((entry) => renderEntry(entry)));
  return entries.join("\n");
}
