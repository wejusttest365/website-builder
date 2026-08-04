import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import {
  defaultAboutWidgetData,
  getAboutFeatureIconClass,
  getAboutShadow,
  isAboutWidgetData,
  normalizeAboutPx,
  resolveAboutColumns,
  type AboutAlignment,
  type AboutFeatureItem,
  type AboutImageSide,
  type AboutObjectPosition,
  type AboutShadow,
  type AboutVerticalAlign,
  type AboutWidgetData,
} from "./AboutTypes";

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
  return String(value || "about").replace(/[^a-zA-Z0-9_-]/g, "");
}

function attr(name: string, value: string | undefined, editorMode: boolean) {
  if (!editorMode || !value) return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

function isBuilderAssetEntry(value: unknown): value is BuilderAssetEntry {
  return typeof value === "object" && value !== null && "src" in value;
}

function resolveImageSrc(src: unknown): string {
  if (isBuilderAssetEntry(src as BuilderAssetEntry)) {
    return String(getAssetValue(src as BuilderAssetEntry) ?? "");
  }
  return String(src || "");
}

function alignToFlex(alignment: AboutAlignment | undefined): string {
  if (alignment === "center") return "center";
  if (alignment === "right") return "flex-end";
  return "flex-start";
}

function alignToText(alignment: AboutAlignment | undefined): string {
  if (alignment === "center") return "center";
  if (alignment === "right") return "right";
  return "left";
}

function verticalAlignClass(value: AboutVerticalAlign | undefined): string {
  if (value === "top") return "align-items-start";
  if (value === "bottom") return "align-items-end";
  return "align-items-center";
}

function objectPosition(value: AboutObjectPosition | undefined): string {
  if (value === "top") return "top center";
  if (value === "bottom") return "bottom center";
  if (value === "left") return "left center";
  if (value === "right") return "right center";
  return "center center";
}

function mdColClass(columns: number): string {
  return `col-md-${Math.max(1, Math.min(11, columns))}`;
}

export function buildAboutBootstrapMarkup(
  data: WidgetData = defaultAboutWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const about = isAboutWidgetData(data) ? data : defaultAboutWidgetData;
  if (about.advanced?.visibility === false) return "";

  const content = about.content ?? {};
  const style = about.style ?? {};
  const layout = about.layout ?? {};
  const responsive = about.responsive ?? {};
  const columns = resolveAboutColumns(style.columnPreset, style.contentColumns);
  const features = Array.isArray(content.features) ? content.features : [];

  const backgroundColor = String(style.backgroundColor || "#ffffff");
  const maxWidth = normalizeAboutPx(style.maxWidth, "1140px");
  const columnGap = normalizeAboutPx(style.columnGap, "32px");
  const verticalAlign = (style.verticalAlign || "center") as AboutVerticalAlign;
  const contentAlignment = (style.contentAlignment || "left") as AboutAlignment;
  const imageSide = (style.imageSide || "right") as AboutImageSide;
  const imageHeight = normalizeAboutPx(style.imageHeight, "420px");
  const objectFit = style.objectFit === "contain" ? "contain" : "cover";
  const objectPos = objectPosition(style.objectPosition as AboutObjectPosition | undefined);
  const imageBorderRadius = normalizeAboutPx(style.imageBorderRadius, "18px");
  const imageBorderEnabled = Boolean(style.imageBorderEnabled);
  const imageBorderColor = String(style.imageBorderColor || "#e2e8f0");
  const imageBorderWidth = normalizeAboutPx(style.imageBorderWidth, "1px");
  const imageShadow = getAboutShadow((style.imageShadow || "medium") as AboutShadow);
  const imageZoomOnHover = style.imageZoomOnHover !== false;
  const paddingTop = normalizeAboutPx(layout.paddingTop, "72px");
  const paddingBottom = normalizeAboutPx(layout.paddingBottom, "72px");
  const paddingX = normalizeAboutPx(layout.paddingX, "24px");
  const tabletLayout = responsive.tabletLayout === "stack" ? "stack" : "columns";
  const mobileOrder = responsive.mobileOrder === "image-content" ? "image-content" : "content-image";
  const mobileContentAlignment = (responsive.mobileContentAlignment || "left") as AboutAlignment;

  const aboutClass = `wto-about-${escapeCssIdent(about.id)}`;
  const hideOnMobile = Boolean(responsive.hideOnMobile);
  const hideOnTablet = Boolean(responsive.hideOnTablet);
  const hideOnDesktop = Boolean(responsive.hideOnDesktop);
  const hideCss = [
    hideOnMobile ? `@media (max-width:767.98px){.${aboutClass}{display:none!important;}}` : "",
    hideOnTablet ? `@media (min-width:768px) and (max-width:991.98px){.${aboutClass}{display:none!important;}}` : "",
    hideOnDesktop ? `@media (min-width:992px){.${aboutClass}{display:none!important;}}` : "",
  ]
    .filter(Boolean)
    .join("");
  const extraClass = about.advanced?.className ? ` ${escapeHtml(String(about.advanced.className))}` : "";
  const aboutDomId = about.advanced?.id ? ` id="${escapeHtml(String(about.advanced.id))}"` : "";
  const contentCol = mdColClass(columns.content);
  const imageCol = mdColClass(columns.image);
  const rowDirection = imageSide === "left" ? "flex-md-row-reverse" : "";
  const tabletStackCss =
    tabletLayout === "stack"
      ? `@media (min-width:768px) and (max-width:991.98px){.${aboutClass} .wto-about-content-col,.${aboutClass} .wto-about-image-col{flex:0 0 100%;max-width:100%;}}`
      : "";
  const imageBorderCss = imageBorderEnabled
    ? `border:${escapeHtml(imageBorderWidth)} solid ${escapeHtml(imageBorderColor)};`
    : "border:0;";
  const hoverCss = imageZoomOnHover
    ? `.${aboutClass} .wto-about-image:hover img{transform:scale(1.04);}`
    : "";

  const eyebrowHtml =
    content.showEyebrow !== false
      ? `<div class="wto-about-eyebrow"${attr("data-wto-widget-element-key", "eyebrow", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(content.eyebrow || "")}</div>`
      : "";
  const headingHtml =
    content.showHeading !== false
      ? `<h2 class="wto-about-heading"${attr("data-wto-widget-element-key", "heading", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(content.heading || "")}</h2>`
      : "";
  const descriptionHtml =
    content.showDescription !== false
      ? `<p class="wto-about-description"${attr("data-wto-widget-element-key", "description", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(content.description || "")}</p>`
      : "";

  const featuresHtml =
    content.showFeatures !== false && features.length
      ? `<ul class="wto-about-features">${features
          .map((feature: AboutFeatureItem) => {
            const iconClass = getAboutFeatureIconClass(feature.icon);
            const iconHtml = iconClass
              ? `<i class="${escapeHtml(iconClass)}" aria-hidden="true"></i>`
              : "";
            return `<li class="wto-about-feature"${attr("data-wto-widget-element-key", `feature-${feature.id}`, editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${iconHtml}<span>${escapeHtml(feature.text || "")}</span></li>`;
          })
          .join("")}</ul>`
      : "";

  const buttonHtml =
    content.showButton !== false
      ? `<div class="wto-about-button-wrap"><a class="wto-about-button" href="${escapeHtml(content.buttonUrl || "#")}"${content.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}${attr("data-wto-widget-element-key", "button", editorMode)}${attr("data-wto-widget-element-type", "button", editorMode)}>${escapeHtml(content.buttonLabel || "Learn More")}</a></div>`
      : "";

  const imageSrc = escapeHtml(resolveImageSrc(content.imageSrc));
  const imageHtml =
    content.showImage !== false
      ? `<div class="wto-about-image"${attr("data-wto-widget-element-key", "image", editorMode)}${attr("data-wto-widget-element-type", "image", editorMode)}><img src="${imageSrc}" alt="${escapeHtml(content.imageAlt || "About us")}" loading="eager" /></div>`
      : "";

  const contentOrderMobile = mobileOrder === "image-content" ? "order-2" : "order-1";
  const imageOrderMobile = mobileOrder === "image-content" ? "order-1" : "order-2";

  return `
<style>
.${aboutClass}{
  width:100%;
  box-sizing:border-box;
  background:${escapeHtml(backgroundColor)};
  padding:${escapeHtml(paddingTop)} ${escapeHtml(paddingX)} ${escapeHtml(paddingBottom)};
}
.${aboutClass} .wto-about-inner{
  width:100%;
  max-width:${escapeHtml(maxWidth)} !important;
  margin-left:auto;
  margin-right:auto;
}
.${aboutClass} .wto-about-row{
  --bs-gutter-x:${escapeHtml(columnGap)};
  --bs-gutter-y:${escapeHtml(columnGap)};
  margin-left:calc(${escapeHtml(columnGap)} / -2);
  margin-right:calc(${escapeHtml(columnGap)} / -2);
}
.${aboutClass} .wto-about-content-col,
.${aboutClass} .wto-about-image-col{
  padding-left:calc(${escapeHtml(columnGap)} / 2);
  padding-right:calc(${escapeHtml(columnGap)} / 2);
  padding-top:calc(${escapeHtml(columnGap)} / 2);
  padding-bottom:calc(${escapeHtml(columnGap)} / 2);
}
.${aboutClass} .wto-about-content{
  display:flex;
  flex-direction:column;
  align-items:${alignToFlex(contentAlignment)};
  text-align:${alignToText(contentAlignment)};
  height:100%;
}
.${aboutClass} .wto-about-eyebrow{
  color:${escapeHtml(String(style.eyebrowColor || "#2563eb"))};
  font-size:${escapeHtml(normalizeAboutPx(style.eyebrowFontSize, "12px"))};
  font-weight:${escapeHtml(String(style.eyebrowFontWeight || "700"))};
  letter-spacing:${escapeHtml(normalizeAboutPx(style.eyebrowLetterSpacing, "2px"))};
  text-transform:uppercase;
  margin:0 0 12px;
}
.${aboutClass} .wto-about-heading{
  margin:0 0 ${escapeHtml(normalizeAboutPx(style.headingMarginBottom, "16px"))};
  color:${escapeHtml(String(style.headingColor || "#0f172a"))};
  font-size:${escapeHtml(normalizeAboutPx(style.headingFontSize, "36px"))};
  font-weight:${escapeHtml(String(style.headingFontWeight || "700"))};
  line-height:${escapeHtml(String(style.headingLineHeight || "1.2"))};
}
.${aboutClass} .wto-about-description{
  margin:0 0 ${escapeHtml(normalizeAboutPx(style.descriptionMarginBottom, "20px"))};
  color:${escapeHtml(String(style.descriptionColor || "#475569"))};
  font-size:${escapeHtml(normalizeAboutPx(style.descriptionFontSize, "16px"))};
  line-height:${escapeHtml(String(style.descriptionLineHeight || "1.7"))};
  white-space:pre-wrap;
  max-width:40rem;
}
.${aboutClass} .wto-about-features{
  list-style:none;
  margin:0 0 22px;
  padding:0;
  width:100%;
  display:flex;
  flex-direction:column;
  gap:${escapeHtml(normalizeAboutPx(style.featureItemGap, "10px"))};
}
.${aboutClass} .wto-about-feature{
  display:flex;
  align-items:flex-start;
  gap:10px;
  color:${escapeHtml(String(style.featureColor || "#334155"))};
  font-size:${escapeHtml(normalizeAboutPx(style.featureFontSize, "15px"))};
  line-height:1.5;
}
.${aboutClass} .wto-about-feature i{
  color:${escapeHtml(String(style.featureIconColor || "#2563eb"))};
  margin-top:3px;
  width:16px;
  text-align:center;
}
.${aboutClass} .wto-about-button-wrap{
  width:100%;
  text-align:${alignToText((style.buttonAlignment || "left") as AboutAlignment)};
}
.${aboutClass} .wto-about-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:${escapeHtml(String(style.buttonBackgroundColor || "#0f172a"))};
  color:${escapeHtml(String(style.buttonTextColor || "#ffffff"))};
  border:${escapeHtml(normalizeAboutPx(style.buttonBorderWidth, "1px"))} solid ${escapeHtml(String(style.buttonBorderColor || "#0f172a"))};
  border-radius:${escapeHtml(normalizeAboutPx(style.buttonBorderRadius, "10px"))};
  font-size:${escapeHtml(normalizeAboutPx(style.buttonFontSize, "14px"))};
  font-weight:${escapeHtml(String(style.buttonFontWeight || "600"))};
  padding:${escapeHtml(normalizeAboutPx(style.buttonPaddingY, "12px"))} ${escapeHtml(normalizeAboutPx(style.buttonPaddingX, "20px"))};
  text-decoration:none;
  line-height:1.2;
  transition:background .15s ease, color .15s ease, border-color .15s ease;
}
.${aboutClass} .wto-about-button:hover{
  background:${escapeHtml(String(style.buttonHoverBackgroundColor || "#1e293b"))};
  color:${escapeHtml(String(style.buttonHoverTextColor || "#ffffff"))};
  border-color:${escapeHtml(String(style.buttonHoverBorderColor || "#1e293b"))};
}
.${aboutClass} .wto-about-image{
  width:100%;
  height:${escapeHtml(imageHeight)};
  overflow:hidden;
  border-radius:${escapeHtml(imageBorderRadius)};
  box-shadow:${imageShadow};
  ${imageBorderCss}
  background:#e2e8f0;
}
.${aboutClass} .wto-about-image img{
  width:100%;
  height:100%;
  object-fit:${objectFit};
  object-position:${objectPos};
  display:block;
  transition:transform .25s ease;
}
@media (max-width:767.98px){
  .${aboutClass} .wto-about-content{
    align-items:${alignToFlex(mobileContentAlignment)};
    text-align:${alignToText(mobileContentAlignment)};
  }
  .${aboutClass} .wto-about-button-wrap{
    text-align:${alignToText(mobileContentAlignment)};
  }
  .${aboutClass} .wto-about-heading{ font-size:28px; }
}
${tabletStackCss}
${hoverCss}
${hideCss}
</style>
<section${aboutDomId} class="wto-about ${aboutClass}${extraClass}" data-wto-about="1" aria-label="About us">
  <div class="wto-about-inner">
    <div class="row wto-about-row ${verticalAlignClass(verticalAlign)} ${rowDirection}">
      <div class="col-12 ${contentCol} wto-about-content-col ${contentOrderMobile} order-md-0">
        <div class="wto-about-content">
          ${eyebrowHtml}
          ${headingHtml}
          ${descriptionHtml}
          ${featuresHtml}
          ${buttonHtml}
        </div>
      </div>
      <div class="col-12 ${imageCol} wto-about-image-col ${imageOrderMobile} order-md-0">
        ${imageHtml}
      </div>
    </div>
  </div>
</section>`.trim();
}
