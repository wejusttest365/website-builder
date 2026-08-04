import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import {
  clampGalleryColumns,
  defaultGalleryWidgetData,
  isGalleryWidgetData,
  normalizeGalleryPx,
  type GalleryImageItem,
  type GalleryWidgetData,
} from "./GalleryTypes";

function escapeHtml(value: string | number | boolean | undefined) {
  if (value === undefined || value === null) return "";
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function escapeCssIdent(value: string) {
  return String(value || "gallery").replace(/[^a-zA-Z0-9_-]/g, "");
}

function attr(name: string, value: string | undefined, editorMode: boolean) {
  if (!editorMode || !value) return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

function isBuilderAssetEntry(value: unknown): value is BuilderAssetEntry {
  return typeof value === "object" && value !== null && "src" in value;
}

function resolveImageSrc(item: GalleryImageItem): string {
  if (isBuilderAssetEntry(item.src)) {
    return String(getAssetValue(item.src) ?? "");
  }
  return String(item.src || "");
}

function mobileColClass(columns: number): string {
  return columns <= 1 ? "col-12" : "col-6";
}

function tabletColClass(columns: number): string {
  if (columns <= 1) return "col-md-12";
  if (columns === 2) return "col-md-6";
  if (columns === 3) return "col-md-4";
  return "col-md-3";
}

function desktopColClass(columns: number): string {
  if (columns <= 1) return "col-lg-12";
  if (columns === 2) return "col-lg-6";
  if (columns === 3) return "col-lg-4";
  if (columns === 4) return "col-lg-3";
  if (columns === 5) return "wto-gallery-col-5";
  return "col-lg-2";
}

export function buildGalleryBootstrapMarkup(
  data: WidgetData = defaultGalleryWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const gallery = isGalleryWidgetData(data) ? data : defaultGalleryWidgetData;
  if (gallery.advanced?.visibility === false) return "";

  const style = gallery.style ?? {};
  const layout = gallery.layout ?? {};
  const images = Array.isArray(gallery.content?.images) ? gallery.content.images : [];
  if (!images.length) return "";

  const desktopColumns = clampGalleryColumns(style.desktopColumns, 1, 6, 3);
  const tabletColumns = clampGalleryColumns(style.tabletColumns, 1, 4, 2);
  const mobileColumns = clampGalleryColumns(style.mobileColumns, 1, 2, 1);
  const imageHeight = normalizeGalleryPx(style.imageHeight, "240px");
  const objectFit = style.objectFit === "contain" ? "contain" : "cover";
  const borderRadius = normalizeGalleryPx(style.borderRadius, "12px");
  const imageGap = normalizeGalleryPx(style.imageGap, "16px");
  const imageBorderEnabled = Boolean(style.imageBorderEnabled);
  const borderColor = String(style.borderColor || "#e2e8f0");
  const borderWidth = normalizeGalleryPx(style.borderWidth, "1px");
  const hoverEnabled = style.hoverEnabled !== false;
  const hoverScale = Number.isFinite(Number(style.hoverScale)) ? Number(style.hoverScale) : 1.03;
  const hoverShadow = style.hoverShadow !== false;
  const backgroundColor = String(style.backgroundColor || "transparent");
  const paddingTop = normalizeGalleryPx(layout.paddingTop, "40px");
  const paddingBottom = normalizeGalleryPx(layout.paddingBottom, "40px");
  const paddingX = normalizeGalleryPx(layout.paddingX, "24px");

  const galleryClass = `wto-gallery-${escapeCssIdent(gallery.id)}`;
  const hideOnMobile = Boolean(gallery.responsive?.hideOnMobile);
  const hideOnTablet = Boolean(gallery.responsive?.hideOnTablet);
  const hideOnDesktop = Boolean(gallery.responsive?.hideOnDesktop);
  const hideCss = [
    hideOnMobile ? `@media (max-width:767.98px){.${galleryClass}{display:none!important;}}` : "",
    hideOnTablet ? `@media (min-width:768px) and (max-width:991.98px){.${galleryClass}{display:none!important;}}` : "",
    hideOnDesktop ? `@media (min-width:992px){.${galleryClass}{display:none!important;}}` : "",
  ]
    .filter(Boolean)
    .join("");
  const extraClass = gallery.advanced?.className ? ` ${escapeHtml(String(gallery.advanced.className))}` : "";
  const galleryDomId = gallery.advanced?.id ? ` id="${escapeHtml(String(gallery.advanced.id))}"` : "";
  const colClasses = `${mobileColClass(mobileColumns)} ${tabletColClass(tabletColumns)} ${desktopColClass(desktopColumns)}`;
  const borderCss = imageBorderEnabled
    ? `border:${escapeHtml(borderWidth)} solid ${escapeHtml(borderColor)};`
    : "border:0;";
  const hoverCss = hoverEnabled
    ? `.${galleryClass} .wto-gallery-media:hover{transform:scale(${hoverScale});${hoverShadow ? "box-shadow:0 12px 28px rgba(15,23,42,0.18);" : ""}}`
    : "";

  const itemsHtml = images
    .map((item, index) => {
      const src = escapeHtml(resolveImageSrc(item));
      const alt = escapeHtml(item.alt || `Gallery image ${index + 1}`);
      const link = String(item.link || "").trim();
      const img = `<img src="${src}" alt="${alt}" loading="${index < 3 ? "eager" : "lazy"}" style="width:100%;height:100%;object-fit:${objectFit};display:block;" />`;
      const mediaInner = link
        ? `<a href="${escapeHtml(link)}"${item.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""} style="display:block;width:100%;height:100%;">${img}</a>`
        : img;
      return `<div class="${colClasses} wto-gallery-item"><div class="wto-gallery-media"${attr("data-wto-widget-element-key", item.id, editorMode)}${attr("data-wto-widget-element-type", "image", editorMode)}>${mediaInner}</div></div>`;
    })
    .join("");

  return `
<style>
.${galleryClass}{
  width:100%;
  max-width:100%;
  box-sizing:border-box;
  background:${escapeHtml(backgroundColor)};
  padding:${escapeHtml(paddingTop)} ${escapeHtml(paddingX)} ${escapeHtml(paddingBottom)};
}
.${galleryClass} .wto-gallery-row{
  --bs-gutter-x:${escapeHtml(imageGap)};
  --bs-gutter-y:${escapeHtml(imageGap)};
  margin-left:calc(${escapeHtml(imageGap)} / -2);
  margin-right:calc(${escapeHtml(imageGap)} / -2);
}
.${galleryClass} .wto-gallery-item{
  padding-left:calc(${escapeHtml(imageGap)} / 2);
  padding-right:calc(${escapeHtml(imageGap)} / 2);
  padding-top:calc(${escapeHtml(imageGap)} / 2);
  padding-bottom:calc(${escapeHtml(imageGap)} / 2);
}
.${galleryClass} .wto-gallery-media{
  position:relative;
  width:100%;
  height:${escapeHtml(imageHeight)};
  overflow:hidden;
  border-radius:${escapeHtml(borderRadius)};
  ${borderCss}
  background:#e2e8f0;
  transition:transform .2s ease, box-shadow .2s ease;
}
@media (min-width:992px){
  .${galleryClass} .wto-gallery-col-5{
    flex:0 0 20%;
    max-width:20%;
    width:20%;
  }
}
${hoverCss}
${hideCss}
</style>
<section${galleryDomId} class="wto-gallery ${galleryClass}${extraClass}" data-wto-gallery="1" aria-label="Image gallery">
  <div class="container-fluid px-0">
    <div class="row wto-gallery-row">${itemsHtml}</div>
  </div>
</section>`.trim();
}
