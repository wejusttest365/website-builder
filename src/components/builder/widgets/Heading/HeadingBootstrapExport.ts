import type { WidgetData } from "../widgetRegistry";
import { getWidgetElementDuplicateEntries } from "../elementDuplication";
import { defaultHeadingWidgetData, isHeadingWidgetData } from "./HeadingTypes";
import { getResponsiveSpacingCss, getSpacingValueForDevice, serializeSpacingValue } from "../spacing";
import { normalizeFontSizeToPx } from "../fontSize";

function escapeHtml(value: string | undefined) {
  if (!value) return "";
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function getHeadingTag(level: string) {
  switch (level) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    default:
      return "h2";
  }
}

export function buildHeadingBootstrapMarkup(data: WidgetData = defaultHeadingWidgetData): string {
  const headingData = isHeadingWidgetData(data) ? data : defaultHeadingWidgetData;
  const duplicateEntries = getWidgetElementDuplicateEntries(headingData);

  const renderEntry = (entry?: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> }) => {
    const content = entry?.content ? { ...headingData.content, ...entry.content } : headingData.content;
    const style = entry?.style ? { ...headingData.style, ...entry.style } : headingData.style;
    const layout = entry?.layout ? { ...headingData.layout, ...entry.layout } : headingData.layout;
    const text = escapeHtml(String(content.text || "Create a bold heading"));
    const level = getHeadingTag(String(content.headingLevel || "h2"));
    const alignment = layout.alignment === "center" ? "text-center" : layout.alignment === "right" ? "text-end" : "text-start";
    const styleFragments: string[] = [];
    const spacingClassName = `wto-spacing-${String(headingData.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;
    const desktopMargin = serializeSpacingValue(getSpacingValueForDevice(layout.margin, "desktop"));
    const desktopPadding = serializeSpacingValue(getSpacingValueForDevice(layout.padding, "desktop"));

    const gradientStart = String(style.gradientStart ?? "").trim();
    const gradientEnd = String(style.gradientEnd ?? "").trim();
    const hasGradient = headingData.variant === "Gradient" && gradientStart && gradientEnd && gradientStart !== gradientEnd;

    if (style.fontFamily) styleFragments.push(`font-family: ${escapeHtml(String(style.fontFamily))};`);
    if (style.textColor) styleFragments.push(`color: ${escapeHtml(String(style.textColor))};`);
    if (style.fontSize) styleFragments.push(`font-size: ${escapeHtml(String(normalizeFontSizeToPx(style.fontSize) ?? style.fontSize))};`);
    if (style.fontWeight) styleFragments.push(`font-weight: ${escapeHtml(String(style.fontWeight))};`);
    if (style.lineHeight) styleFragments.push(`line-height: ${escapeHtml(String(style.lineHeight))};`);
    if (style.letterSpacing) styleFragments.push(`letter-spacing: ${escapeHtml(String(style.letterSpacing))};`);
    if (desktopMargin) styleFragments.push(`margin: ${escapeHtml(desktopMargin)};`);
    if (desktopPadding) styleFragments.push(`padding: ${escapeHtml(desktopPadding)};`);
    styleFragments.push("display: block;");

    const headingStyle = styleFragments.join(" ");
    const spacingCss = getResponsiveSpacingCss(layout as Record<string, unknown>, spacingClassName);
    const spacingMarkup = spacingCss ? `<style>${spacingCss}</style>` : "";
    const labelHtml = headingData.variant === "Section Title" ? `<div class="mb-2 text-uppercase text-muted" style="font-weight:600;letter-spacing:0.12em;font-size:14px;color:${escapeHtml(String(style.textColor || "#111827"))};">${escapeHtml(String(content.label || "Section title"))}</div>` : "";

    const gradientStyle = hasGradient ? `background-image: linear-gradient(90deg, ${escapeHtml(gradientStart)}, ${escapeHtml(gradientEnd)}); -webkit-background-clip: text; -webkit-text-fill-color: transparent;` : "";
    const underlineStyle = headingData.variant === "Underline" ? `border-bottom: 4px solid ${escapeHtml(String(style.underlineColor || "#2563eb"))}; display: inline-block; padding-bottom: 0.25rem;` : "";

    const decorationStyle = [gradientStyle, underlineStyle].filter(Boolean).join(" ");
    const decorationWrapperStart = decorationStyle ? `<span style="${decorationStyle}">` : "";
    const decorationWrapperEnd = decorationStyle ? `</span>` : "";

    return `${spacingMarkup}<div class="${[alignment, spacingClassName].filter(Boolean).join(" ")}" style="${desktopMargin ? `margin:${escapeHtml(desktopMargin)};` : ""}${desktopPadding ? `padding:${escapeHtml(desktopPadding)};` : ""}">
  ${labelHtml}
  <${level} class="mb-0" style="${headingStyle} ${escapeHtml(decorationStyle)}">${decorationWrapperStart}${text}${decorationWrapperEnd}</${level}>
</div>`;
  };

  return [renderEntry()].concat(duplicateEntries.map((entry) => renderEntry(entry))).join("\n");
}
