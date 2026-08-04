import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import {
  clampServicesColumns,
  defaultServicesWidgetData,
  getServicesCardShadow,
  isServicesWidgetData,
  normalizeServicesPx,
  type ServiceItem,
  type ServicesAlignment,
  type ServicesCardShadow,
  type ServicesWidgetData,
} from "./ServicesTypes";

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
  return String(value || "services").replace(/[^a-zA-Z0-9_-]/g, "");
}

function attr(name: string, value: string | undefined, editorMode: boolean) {
  if (!editorMode || !value) return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

function isBuilderAssetEntry(value: unknown): value is BuilderAssetEntry {
  return typeof value === "object" && value !== null && "src" in value;
}

function resolveServiceSrc(item: ServiceItem): string {
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
  return "col-md-4";
}

function desktopColClass(columns: number): string {
  if (columns <= 1) return "col-lg-12";
  if (columns === 2) return "col-lg-6";
  if (columns === 3) return "col-lg-4";
  return "col-lg-3";
}

function alignToJustify(alignment: ServicesAlignment | undefined): string {
  if (alignment === "center") return "center";
  if (alignment === "right") return "flex-end";
  return "flex-start";
}

function alignToText(alignment: ServicesAlignment | undefined): string {
  if (alignment === "center") return "center";
  if (alignment === "right") return "right";
  return "left";
}

function objectPosition(value: unknown): string {
  if (value === "top") return "top center";
  if (value === "bottom") return "bottom center";
  return "center center";
}

export function buildServicesBootstrapMarkup(
  data: WidgetData = defaultServicesWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const servicesData = isServicesWidgetData(data) ? data : defaultServicesWidgetData;
  if (servicesData.advanced?.visibility === false) return "";

  const style = servicesData.style ?? {};
  const layout = servicesData.layout ?? {};
  const services = Array.isArray(servicesData.content?.services) ? servicesData.content.services : [];
  if (!services.length) return "";

  const desktopColumns = clampServicesColumns(style.desktopColumns, 1, 4, 3);
  const tabletColumns = clampServicesColumns(style.tabletColumns, 1, 3, 2);
  const mobileColumns = clampServicesColumns(style.mobileColumns, 1, 2, 1);
  const backgroundColor = String(style.backgroundColor || "#f8fafc");
  const maxWidth = normalizeServicesPx(style.maxWidth, "1140px");
  const cardGap = normalizeServicesPx(style.cardGap, "24px");
  const cardAlignment = (style.cardAlignment || "center") as ServicesAlignment;
  const cardBackgroundColor = String(style.cardBackgroundColor || "#ffffff");
  const cardBorderEnabled = style.cardBorderEnabled !== false;
  const cardBorderColor = String(style.cardBorderColor || "#e2e8f0");
  const cardBorderWidth = normalizeServicesPx(style.cardBorderWidth, "1px");
  const cardBorderRadius = normalizeServicesPx(style.cardBorderRadius, "16px");
  const cardShadow = getServicesCardShadow((style.cardShadow || "small") as ServicesCardShadow);
  const cardPadding = normalizeServicesPx(style.cardPadding, "0px");
  const equalCardHeight = style.equalCardHeight !== false;
  const imageHeight = normalizeServicesPx(style.imageHeight, "200px");
  const objectFit = style.objectFit === "contain" ? "contain" : "cover";
  const imageBorderRadius = normalizeServicesPx(style.imageBorderRadius, "0px");
  const imagePos = objectPosition(style.imagePosition);
  const headingColor = String(style.headingColor || "#0f172a");
  const headingFontSize = normalizeServicesPx(style.headingFontSize, "20px");
  const headingFontWeight = String(style.headingFontWeight || "700");
  const headingLineHeight = String(style.headingLineHeight || "1.3");
  const headingMarginBottom = normalizeServicesPx(style.headingMarginBottom, "10px");
  const descriptionColor = String(style.descriptionColor || "#475569");
  const descriptionFontSize = normalizeServicesPx(style.descriptionFontSize, "15px");
  const descriptionLineHeight = String(style.descriptionLineHeight || "1.6");
  const descriptionMarginBottom = normalizeServicesPx(style.descriptionMarginBottom, "18px");
  const buttonAlignment = (style.buttonAlignment || "left") as ServicesAlignment;
  const buttonBackgroundColor = String(style.buttonBackgroundColor || "#0f172a");
  const buttonTextColor = String(style.buttonTextColor || "#ffffff");
  const buttonBorderColor = String(style.buttonBorderColor || "#0f172a");
  const buttonBorderWidth = normalizeServicesPx(style.buttonBorderWidth, "1px");
  const buttonBorderRadius = normalizeServicesPx(style.buttonBorderRadius, "10px");
  const buttonFontSize = normalizeServicesPx(style.buttonFontSize, "14px");
  const buttonFontWeight = String(style.buttonFontWeight || "600");
  const buttonPaddingX = normalizeServicesPx(style.buttonPaddingX, "18px");
  const buttonPaddingY = normalizeServicesPx(style.buttonPaddingY, "10px");
  const hoverEnabled = style.hoverEnabled !== false;
  const hoverLift = normalizeServicesPx(style.hoverLift, "6px");
  const hoverShadow = style.hoverShadow !== false;
  const imageZoomOnHover = style.imageZoomOnHover !== false;
  const paddingTop = normalizeServicesPx(layout.paddingTop, "64px");
  const paddingBottom = normalizeServicesPx(layout.paddingBottom, "64px");
  const paddingX = normalizeServicesPx(layout.paddingX, "24px");

  const servicesClass = `wto-services-${escapeCssIdent(servicesData.id)}`;
  const hideOnMobile = Boolean(servicesData.responsive?.hideOnMobile);
  const hideOnTablet = Boolean(servicesData.responsive?.hideOnTablet);
  const hideOnDesktop = Boolean(servicesData.responsive?.hideOnDesktop);
  const hideCss = [
    hideOnMobile ? `@media (max-width:767.98px){.${servicesClass}{display:none!important;}}` : "",
    hideOnTablet ? `@media (min-width:768px) and (max-width:991.98px){.${servicesClass}{display:none!important;}}` : "",
    hideOnDesktop ? `@media (min-width:992px){.${servicesClass}{display:none!important;}}` : "",
  ]
    .filter(Boolean)
    .join("");
  const extraClass = servicesData.advanced?.className
    ? ` ${escapeHtml(String(servicesData.advanced.className))}`
    : "";
  const servicesDomId = servicesData.advanced?.id
    ? ` id="${escapeHtml(String(servicesData.advanced.id))}"`
    : "";
  const colClasses = `${mobileColClass(mobileColumns)} ${tabletColClass(tabletColumns)} ${desktopColClass(desktopColumns)}`;
  const borderCss = cardBorderEnabled
    ? `border:${escapeHtml(cardBorderWidth)} solid ${escapeHtml(cardBorderColor)};`
    : "border:0;";
  const hoverCss = hoverEnabled
    ? `.${servicesClass} .wto-services-card:hover{transform:translateY(-${escapeHtml(hoverLift)});${hoverShadow ? "box-shadow:0 18px 36px rgba(15,23,42,0.16);" : ""}}
.${servicesClass} .wto-services-card:hover .wto-services-image img{${imageZoomOnHover ? "transform:scale(1.05);" : ""}}`
    : "";

  const cardsHtml = services
    .map((item, index) => {
      const src = escapeHtml(resolveServiceSrc(item));
      const alt = escapeHtml(item.alt || item.heading || `Service ${index + 1}`);
      const imageKey = `image-${item.id}`;
      const headingKey = `heading-${item.id}`;
      const descriptionKey = `description-${item.id}`;
      const buttonKey = `button-${item.id}`;
      const imageHtml = `<div class="wto-services-image"${attr("data-wto-widget-element-key", imageKey, editorMode)}${attr("data-wto-widget-element-type", "image", editorMode)}><img src="${src}" alt="${alt}" loading="${index < 3 ? "eager" : "lazy"}" /></div>`;
      const headingHtml =
        item.showHeading !== false
          ? `<h3 class="wto-services-heading"${attr("data-wto-widget-element-key", headingKey, editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(item.heading || "Service")}</h3>`
          : "";
      const descriptionHtml =
        item.showDescription !== false
          ? `<p class="wto-services-description"${attr("data-wto-widget-element-key", descriptionKey, editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(item.description || "")}</p>`
          : "";
      const buttonHtml =
        item.showButton !== false
          ? `<div class="wto-services-button-wrap"><a class="wto-services-button" href="${escapeHtml(item.buttonUrl || "#")}"${item.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}${attr("data-wto-widget-element-key", buttonKey, editorMode)}${attr("data-wto-widget-element-type", "button", editorMode)}>${escapeHtml(item.buttonLabel || "Learn More")}</a></div>`
          : "";
      return `<div class="${colClasses} wto-services-col"><article class="wto-services-card"${attr("data-wto-widget-element-key", item.id, editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)}>${imageHtml}<div class="wto-services-body">${headingHtml}${descriptionHtml}${buttonHtml}</div></article></div>`;
    })
    .join("");

  return `
<style>
.${servicesClass}{
  width:100%;
  box-sizing:border-box;
  background:${escapeHtml(backgroundColor)};
  padding:${escapeHtml(paddingTop)} ${escapeHtml(paddingX)} ${escapeHtml(paddingBottom)};
}
.${servicesClass} .wto-services-inner{
  width:100%;
  max-width:${escapeHtml(maxWidth)} !important;
  margin-left:auto;
  margin-right:auto;
}
.${servicesClass} .wto-services-row{
  --bs-gutter-x:${escapeHtml(cardGap)};
  --bs-gutter-y:${escapeHtml(cardGap)};
  display:flex;
  flex-wrap:wrap;
  justify-content:${alignToJustify(cardAlignment)};
  margin-left:calc(${escapeHtml(cardGap)} / -2);
  margin-right:calc(${escapeHtml(cardGap)} / -2);
}
.${servicesClass} .wto-services-col{
  padding-left:calc(${escapeHtml(cardGap)} / 2);
  padding-right:calc(${escapeHtml(cardGap)} / 2);
  padding-top:calc(${escapeHtml(cardGap)} / 2);
  padding-bottom:calc(${escapeHtml(cardGap)} / 2);
  display:flex;
}
.${servicesClass} .wto-services-card{
  width:100%;
  background:${escapeHtml(cardBackgroundColor)};
  ${borderCss}
  border-radius:${escapeHtml(cardBorderRadius)};
  box-shadow:${cardShadow};
  padding:${escapeHtml(cardPadding)};
  overflow:hidden;
  display:flex;
  flex-direction:column;
  ${equalCardHeight ? "height:100%;" : ""}
  transition:transform .2s ease, box-shadow .2s ease;
}
.${servicesClass} .wto-services-image{
  width:100%;
  height:${escapeHtml(imageHeight)};
  overflow:hidden;
  border-radius:${escapeHtml(imageBorderRadius)};
  background:#e2e8f0;
}
.${servicesClass} .wto-services-image img{
  width:100%;
  height:100%;
  object-fit:${objectFit};
  object-position:${imagePos};
  display:block;
  transition:transform .25s ease;
}
.${servicesClass} .wto-services-body{
  display:flex;
  flex-direction:column;
  ${equalCardHeight ? "flex:1 1 auto;" : ""}
  padding:20px;
}
.${servicesClass} .wto-services-heading{
  margin:0 0 ${escapeHtml(headingMarginBottom)};
  color:${escapeHtml(headingColor)};
  font-size:${escapeHtml(headingFontSize)};
  font-weight:${escapeHtml(headingFontWeight)};
  line-height:${escapeHtml(headingLineHeight)};
}
.${servicesClass} .wto-services-description{
  margin:0 0 ${escapeHtml(descriptionMarginBottom)};
  color:${escapeHtml(descriptionColor)};
  font-size:${escapeHtml(descriptionFontSize)};
  line-height:${escapeHtml(descriptionLineHeight)};
  ${equalCardHeight ? "flex:1 1 auto;" : ""}
}
.${servicesClass} .wto-services-button-wrap{
  margin-top:auto;
  text-align:${alignToText(buttonAlignment)};
}
.${servicesClass} .wto-services-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  background:${escapeHtml(buttonBackgroundColor)};
  color:${escapeHtml(buttonTextColor)};
  border:${escapeHtml(buttonBorderWidth)} solid ${escapeHtml(buttonBorderColor)};
  border-radius:${escapeHtml(buttonBorderRadius)};
  font-size:${escapeHtml(buttonFontSize)};
  font-weight:${escapeHtml(buttonFontWeight)};
  padding:${escapeHtml(buttonPaddingY)} ${escapeHtml(buttonPaddingX)};
  text-decoration:none;
  line-height:1.2;
}
${hoverCss}
${hideCss}
</style>
<section${servicesDomId} class="wto-services ${servicesClass}${extraClass}" data-wto-services="1" aria-label="Services">
  <div class="wto-services-inner">
    <div class="row wto-services-row">${cardsHtml}</div>
  </div>
</section>`.trim();
}
