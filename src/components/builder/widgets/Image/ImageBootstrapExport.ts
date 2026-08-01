import type { WidgetData } from "../widgetRegistry";
import { defaultImageWidgetData, isImageWidgetData } from "./ImageTypes";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import { getResponsiveSpacingCss, getSpacingValueForDevice, serializeSpacingValue } from "../spacing";

function escapeHtml(value: string | number | boolean | undefined) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function getWidthStyle(width?: string) {
  return width ? `width: ${escapeHtml(width)};` : "";
}

export function buildImageBootstrapMarkup(data: WidgetData = defaultImageWidgetData): string {
  const imageData = isImageWidgetData(data) ? data : defaultImageWidgetData;
  function isBuilderAssetEntry(value: unknown): value is BuilderAssetEntry {
    return typeof value === "object" && value !== null && "src" in value;
  }

  const src = escapeHtml(String(isBuilderAssetEntry(imageData.content.src) ? getAssetValue(imageData.content.src) ?? "" : imageData.content.src || ""));
  const alt = escapeHtml(String(imageData.content.alt || "Image"));
  const caption = escapeHtml(String(imageData.content.caption || ""));
  const url = escapeHtml(String(imageData.content.url || ""));
  const target = imageData.content.openInNewTab ? ` target="_blank" rel="noopener noreferrer"` : "";
  const loading = imageData.advanced.lazyLoad ? "lazy" : "eager";
  const wrapperClass = `image-widget-${escapeHtml(imageData.id)}`;

  const wrapperClasses = ["d-inline-block"];
  if (imageData.layout.alignment === "center") wrapperClasses.push("text-center");
  if (imageData.layout.alignment === "right") wrapperClasses.push("text-end");
  if (imageData.responsive.hideOnMobile) wrapperClasses.push("d-none", "d-sm-inline-block");

  const desktopMargin = serializeSpacingValue(getSpacingValueForDevice(imageData.layout.margin, "desktop"));
  const desktopPadding = serializeSpacingValue(getSpacingValueForDevice(imageData.layout.padding, "desktop"));
  const wrapperStyleFragments = [
    desktopMargin ? `margin: ${escapeHtml(desktopMargin)};` : "",
    desktopPadding ? `padding: ${escapeHtml(desktopPadding)};` : "",
    imageData.layout.maxWidth ? `max-width: ${escapeHtml(String(imageData.layout.maxWidth))};` : "",
  ].filter(Boolean);

  const imageStyleFragments = [
    imageData.style.height ? `height: ${escapeHtml(String(imageData.style.height))};` : "",
    imageData.style.objectFit ? `object-fit: ${escapeHtml(String(imageData.style.objectFit))};` : "",
    imageData.style.borderRadius ? `border-radius: ${escapeHtml(String(imageData.style.borderRadius))};` : "",
    imageData.style.borderWidth ? `border: ${escapeHtml(String(imageData.style.borderWidth))} solid ${escapeHtml(String(imageData.style.borderColor || "#dee2e6"))};` : "",
    imageData.style.shadow ? "box-shadow: 0 0.75rem 1.5rem rgba(15, 23, 42, 0.12);" : "",
    imageData.style.opacity !== undefined ? `opacity: ${escapeHtml(String(imageData.style.opacity))};` : "",
    "display: block;",
    "max-width: 100%;",
  ].filter(Boolean);

  const overlayStyles = imageData.variant === "Image with Overlay" ? `
    position: absolute;
    inset: 0;
    background-color: ${escapeHtml(String(imageData.style.overlayColor || "#000000"))};
    opacity: ${escapeHtml(String(imageData.style.overlayOpacity ?? 0.3))};
    border-radius: ${escapeHtml(String(imageData.style.borderRadius || "0px"))};
  ` : "";

  const wrapperStyles = wrapperStyleFragments.join(" ");
  const imageStyles = imageStyleFragments.join(" ");
  const figureStyles = `position: relative; display: inline-block; ${imageStyles}`;

  const responsiveStyles: string[] = [];
  const spacingCss = getResponsiveSpacingCss(imageData.layout as Record<string, unknown>, wrapperClass);
  const desktopWidth = imageData.responsive.desktopWidth;
  const tabletWidth = imageData.responsive.tabletWidth;
  const mobileWidth = imageData.responsive.mobileWidth;

  if (desktopWidth) {
    responsiveStyles.push(`.${wrapperClass} { width: ${escapeHtml(String(desktopWidth))}; }`);
  }
  if (tabletWidth) {
    responsiveStyles.push(`@media (max-width: 991px) { .${wrapperClass} { width: ${escapeHtml(String(tabletWidth))}; } }`);
  }
  if (mobileWidth) {
    responsiveStyles.push(`@media (max-width: 767px) { .${wrapperClass} { width: ${escapeHtml(String(mobileWidth))}; } }`);
  }
  if (spacingCss) {
    responsiveStyles.push(spacingCss);
  }

  const imageElement = `
    <figure class="${wrapperClass}" style="${wrapperStyles}">
      <img src="${src}" alt="${alt}" loading="${loading}" style="${imageStyles}" />
      ${imageData.variant === "Image with Overlay" ? `<div style="${overlayStyles}"></div>` : ""}
      ${imageData.variant === "Card Image" && caption ? `<figcaption style="margin-top: 0.75rem; color: #495057; font-size: 0.95rem;">${caption}</figcaption>` : imageData.variant === "Image with Caption" && caption ? `<figcaption style="margin-top: 0.75rem; color: #495057; font-size: 0.95rem;">${caption}</figcaption>` : ""}
    </figure>
  `;

  const linked = url ? `<a href="${url}"${target} style="text-decoration: none; display: inline-block;">${imageElement}</a>` : imageElement;
  const styles = responsiveStyles.length ? `<style>${responsiveStyles.join(" ")}</style>` : "";

  return `${styles}${linked}`;
}
