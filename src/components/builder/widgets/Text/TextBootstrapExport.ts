import type { WidgetData } from "../widgetRegistry";
import { getWidgetElementDuplicateEntries } from "../elementDuplication";
import { defaultTextWidgetData, isTextWidgetData } from "./TextTypes";
import { getResponsiveSpacingCss, getSpacingValueForDevice, serializeSpacingValue } from "../spacing";
import { normalizeFontSizeToPx } from "../fontSize";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

export function buildTextBootstrapMarkup(data: WidgetData = defaultTextWidgetData): string {
  const textData = isTextWidgetData(data) ? data : defaultTextWidgetData;
  const duplicateEntries = getWidgetElementDuplicateEntries(textData);

  const renderEntry = (entry?: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> }) => {
    const content = entry?.content ? { ...textData.content, ...entry.content } : textData.content;
    const style = entry?.style ? { ...textData.style, ...entry.style } : textData.style;
    const layout = entry?.layout ? { ...textData.layout, ...entry.layout } : textData.layout;
    const text = escapeHtml(String(content.text || "Write clear, readable content that keeps visitors engaged."));
    const alignmentClass = layout.alignment === "center" ? "text-center" : layout.alignment === "right" ? "text-end" : "text-start";

    const styleFragments: string[] = [];
    const spacingClassName = `wto-spacing-${String(textData.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const desktopMargin = serializeSpacingValue(getSpacingValueForDevice(layout.margin, "desktop"));
    const desktopPadding = serializeSpacingValue(getSpacingValueForDevice(layout.padding, "desktop"));
    if (style.fontFamily) styleFragments.push(`font-family: ${escapeHtml(String(style.fontFamily))};`);
    if (style.textColor) styleFragments.push(`color: ${escapeHtml(String(style.textColor))};`);
    if (style.fontSize) styleFragments.push(`font-size: ${escapeHtml(String(normalizeFontSizeToPx(style.fontSize) ?? style.fontSize))};`);
    if (style.fontWeight) styleFragments.push(`font-weight: ${escapeHtml(String(style.fontWeight))};`);
    if (style.lineHeight) styleFragments.push(`line-height: ${escapeHtml(String(style.lineHeight))};`);
    if (style.letterSpacing) styleFragments.push(`letter-spacing: ${escapeHtml(String(style.letterSpacing))};`);
    if (desktopMargin) styleFragments.push(`margin: ${escapeHtml(desktopMargin)};`);
    if (desktopPadding) styleFragments.push(`padding: ${escapeHtml(desktopPadding)};`);
    styleFragments.push("display: block;");

    if (textData.variant === "Lead Text") {
      styleFragments.push(`font-size: ${escapeHtml(String(normalizeFontSizeToPx(style.fontSize) ?? "20px"))};`);
      styleFragments.push("font-weight: 500;");
    }

    if (textData.variant === "Muted Text") {
      styleFragments.push("color: #6b7280;");
    }

    if (textData.variant === "Highlight") {
      styleFragments.push("background-color: #fffbeb;");
      styleFragments.push("padding: 0.25rem 0.5rem;");
      styleFragments.push("border-radius: 0.5rem;");
    }

    const finalStyle = styleFragments.join(" ");
    const spacingCss = getResponsiveSpacingCss(layout as Record<string, unknown>, spacingClassName);
    const spacingMarkup = spacingCss ? `<style>${spacingCss}</style>` : "";
    const classes = [alignmentClass, spacingClassName].filter(Boolean).join(" ");

    if (textData.variant === "Quote") {
      return `${spacingMarkup}<blockquote class="${classes}" style="${finalStyle}">${text}</blockquote>`;
    }

    if (textData.variant === "Small Text") {
      return `${spacingMarkup}<small class="${classes}" style="${finalStyle}">${text}</small>`;
    }

    return `${spacingMarkup}<p class="${classes}" style="${finalStyle}">${text}</p>`;
  };

  return [renderEntry()].concat(duplicateEntries.map((entry) => renderEntry(entry))).join("\n");
}
