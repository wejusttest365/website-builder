import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import {
  clampCtaOpacity,
  defaultCtaWidgetData,
  getCtaBackgroundPosition,
  getCtaGradientAngle,
  isCtaWidgetData,
  normalizeCtaPx,
  type CtaAlignment,
  type CtaBackgroundMode,
  type CtaBackgroundPosition,
  type CtaBackgroundRepeat,
  type CtaBackgroundSize,
  type CtaButtonLayout,
  type CtaGradientDirection,
  type CtaVerticalAlign,
  type CtaWidgetData,
} from "./CTATypes";

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
  return String(value || "cta").replace(/[^a-zA-Z0-9_-]/g, "");
}

function escapeCssValue(value: string) {
  return String(value || "").replace(/'/g, "\\'").replace(/"/g, '\\"');
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

function alignToFlex(alignment: CtaAlignment | undefined): string {
  if (alignment === "left") return "flex-start";
  if (alignment === "right") return "flex-end";
  return "center";
}

function alignToText(alignment: CtaAlignment | undefined): string {
  if (alignment === "left") return "left";
  if (alignment === "right") return "right";
  return "center";
}

function verticalAlignToFlex(value: CtaVerticalAlign | undefined): string {
  if (value === "top") return "flex-start";
  if (value === "bottom") return "flex-end";
  return "center";
}

function colorWithOpacity(color: string, opacityPercent: number): string {
  const o = Math.max(0, Math.min(1, opacityPercent / 100));
  const raw = String(color || "#0f172a").trim();
  if (/^rgba?\(/i.test(raw)) {
    const nums = raw.replace(/rgba?\(/i, "").replace(/\)/, "").split(",").map((part) => part.trim());
    const r = Number(nums[0]) || 0;
    const g = Number(nums[1]) || 0;
    const b = Number(nums[2]) || 0;
    return `rgba(${r},${g},${b},${o})`;
  }
  let hex = raw.replace("#", "");
  if (hex.length === 3) {
    hex = hex
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  if (hex.length !== 6) {
    return raw;
  }
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return raw;
  return `rgba(${r},${g},${b},${o})`;
}

function buildBackgroundCss(cta: CtaWidgetData): string {
  const style = cta.style ?? {};
  const mode = (style.backgroundMode || "gradient") as CtaBackgroundMode;
  const solid = String(style.backgroundColor || "#2563eb");
  const gradientEnabled = style.gradientEnabled !== false;
  const start = String(style.gradientStart || "#2563eb");
  const end = String(style.gradientEnd || "#7c3aed");
  const angle = getCtaGradientAngle(style.gradientDirection as CtaGradientDirection | undefined);
  const imageSrc = resolveImageSrc(cta.content?.backgroundImageSrc);
  const size = (style.backgroundSize === "contain" ? "contain" : "cover") as CtaBackgroundSize;
  const position = getCtaBackgroundPosition(style.backgroundPosition as CtaBackgroundPosition | undefined);
  const repeat = (style.backgroundRepeat === "repeat" ? "repeat" : "no-repeat") as CtaBackgroundRepeat;

  if (mode === "solid") {
    return `background-color:${escapeCssValue(solid)};background-image:none;`;
  }

  if (mode === "image") {
    const imageCss = imageSrc
      ? `background-image:url('${escapeCssValue(imageSrc)}');`
      : "background-image:none;";
    return [
      `background-color:${escapeCssValue(solid)};`,
      imageCss,
      `background-size:${size};`,
      `background-position:${position};`,
      `background-repeat:${repeat};`,
    ].join("");
  }

  if (gradientEnabled) {
    return [
      `background-color:${escapeCssValue(solid)};`,
      `background-image:linear-gradient(${angle}, ${escapeCssValue(start)}, ${escapeCssValue(end)});`,
    ].join("");
  }

  return `background-color:${escapeCssValue(solid)};background-image:none;`;
}

function buildOverlayCss(cta: CtaWidgetData): string {
  const style = cta.style ?? {};
  if (style.overlayEnabled === false) return "";
  const opacity = clampCtaOpacity(style.overlayOpacity, 60);
  const useGradient = Boolean(style.overlayGradientEnabled);
  if (useGradient) {
    const start = colorWithOpacity(String(style.overlayGradientStart || "#0f172a"), opacity);
    const end = colorWithOpacity(String(style.overlayGradientEnd || "#1e293b"), opacity);
    const angle = getCtaGradientAngle(style.overlayGradientDirection as CtaGradientDirection | undefined);
    return `background-image:linear-gradient(${angle}, ${start}, ${end});background-color:transparent;`;
  }
  return `background:${colorWithOpacity(String(style.overlayColor || "#0f172a"), opacity)};`;
}

export function buildCtaBootstrapMarkup(
  data: WidgetData = defaultCtaWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const cta = isCtaWidgetData(data) ? data : defaultCtaWidgetData;
  if (cta.advanced?.visibility === false) return "";

  const content = cta.content ?? {};
  const style = cta.style ?? {};
  const layout = cta.layout ?? {};
  const responsive = cta.responsive ?? {};

  const ctaClass = `wto-cta-${escapeCssIdent(cta.id)}`;
  const paddingTop = normalizeCtaPx(layout.paddingTop, "88px");
  const paddingBottom = normalizeCtaPx(layout.paddingBottom, "88px");
  const paddingX = normalizeCtaPx(layout.paddingX ?? style.contentPaddingX, "24px");
  const minHeight = normalizeCtaPx(
    responsive.desktopMinHeight ?? style.minHeight,
    normalizeCtaPx(style.minHeight, "380px"),
  );
  const contentMaxWidth = normalizeCtaPx(style.contentMaxWidth, "760px");
  const horizontalAlign = (style.horizontalAlign || "center") as CtaAlignment;
  const verticalAlign = (style.verticalAlign || "center") as CtaVerticalAlign;
  const buttonLayout = (style.buttonLayout || "horizontal") as CtaButtonLayout;
  const buttonAlignment = (style.buttonAlignment || horizontalAlign) as CtaAlignment;
  const buttonGap = normalizeCtaPx(style.buttonGap, "12px");
  const headingDesktop = normalizeCtaPx(
    responsive.desktopHeadingFontSize ?? style.headingFontSize,
    "44px",
  );
  const headingTablet = normalizeCtaPx(responsive.tabletHeadingFontSize, "36px");
  const headingMobile = normalizeCtaPx(responsive.mobileHeadingFontSize, "30px");
  const minHeightTablet = normalizeCtaPx(responsive.tabletMinHeight, "340px");
  const minHeightMobile = normalizeCtaPx(responsive.mobileMinHeight, "300px");
  const stackButtonsOnMobile = responsive.stackButtonsOnMobile !== false;
  const showOverlay = Boolean(style.overlayEnabled);

  const hideOnMobile = Boolean(responsive.hideOnMobile);
  const hideOnTablet = Boolean(responsive.hideOnTablet);
  const hideOnDesktop = Boolean(responsive.hideOnDesktop);
  const hideCss = [
    hideOnMobile ? `@media (max-width:767.98px){.${ctaClass}{display:none!important;}}` : "",
    hideOnTablet
      ? `@media (min-width:768px) and (max-width:991.98px){.${ctaClass}{display:none!important;}}`
      : "",
    hideOnDesktop ? `@media (min-width:992px){.${ctaClass}{display:none!important;}}` : "",
  ]
    .filter(Boolean)
    .join("");

  const extraClass = cta.advanced?.className ? ` ${escapeHtml(String(cta.advanced.className))}` : "";
  const ctaDomId = cta.advanced?.id ? ` id="${escapeHtml(String(cta.advanced.id))}"` : "";

  const eyebrowHtml =
    content.showEyebrow !== false
      ? `<div class="wto-cta-eyebrow"${attr("data-wto-widget-element-key", "eyebrow", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(content.eyebrow || "")}</div>`
      : "";

  const headingHtml =
    content.showHeading !== false
      ? `<h2 class="wto-cta-heading"${attr("data-wto-widget-element-key", "heading", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(content.heading || "")}</h2>`
      : "";

  const paragraphHtml =
    content.showParagraph !== false
      ? `<p class="wto-cta-paragraph"${attr("data-wto-widget-element-key", "paragraph", editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(content.paragraph || "")}</p>`
      : "";

  const primaryHtml =
    content.showPrimaryButton !== false
      ? `<a class="wto-cta-button wto-cta-button-primary" href="${escapeHtml(content.primaryButtonUrl || "#")}"${content.primaryOpenInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}${attr("data-wto-widget-element-key", "primaryButton", editorMode)}${attr("data-wto-widget-element-type", "button", editorMode)} aria-label="${escapeHtml(content.primaryButtonLabel || "Primary call to action")}">${escapeHtml(content.primaryButtonLabel || "Start Building Free")}</a>`
      : "";

  const secondaryHtml =
    content.showSecondaryButton !== false
      ? `<a class="wto-cta-button wto-cta-button-secondary" href="${escapeHtml(content.secondaryButtonUrl || "#")}"${content.secondaryOpenInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""}${attr("data-wto-widget-element-key", "secondaryButton", editorMode)}${attr("data-wto-widget-element-type", "button", editorMode)} aria-label="${escapeHtml(content.secondaryButtonLabel || "Secondary call to action")}">${escapeHtml(content.secondaryButtonLabel || "Explore Features")}</a>`
      : "";

  const buttonsHtml =
    primaryHtml || secondaryHtml
      ? `<div class="wto-cta-buttons">${primaryHtml}${secondaryHtml}</div>`
      : "";

  const backgroundCss = buildBackgroundCss(cta);
  const overlayCss = showOverlay ? buildOverlayCss(cta) : "";
  const overlayHtml = showOverlay
    ? `<div class="wto-cta-overlay" aria-hidden="true"${attr("data-wto-widget-element-key", "overlay", editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)}></div>`
    : "";

  const bgAlt = escapeHtml(content.backgroundImageAlt || "Call to action background");
  const backgroundHtml = `<div class="wto-cta-background" role="img" aria-label="${bgAlt}"${attr("data-wto-widget-element-key", "background", editorMode)}${attr("data-wto-widget-element-type", "image", editorMode)}></div>`;

  const headingShadow = style.headingTextShadow
    ? "text-shadow:0 8px 24px rgba(15,23,42,0.35);"
    : "text-shadow:none;";

  return `
<style>
.${ctaClass}.full-width-cta,
.${ctaClass}{
  position:relative;
  width:100%;
  box-sizing:border-box;
  display:flex;
  align-items:${verticalAlignToFlex(verticalAlign)};
  justify-content:center;
  min-height:${escapeHtml(minHeight)};
  padding:${escapeHtml(paddingTop)} ${escapeHtml(paddingX)} ${escapeHtml(paddingBottom)};
  overflow:hidden;
}
.${ctaClass} .wto-cta-background{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
  z-index:0;
  ${backgroundCss}
}
${
  showOverlay
    ? `.${ctaClass} .wto-cta-overlay{
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  pointer-events:none;
  z-index:1;
  ${overlayCss}
}`
    : ""
}
.${ctaClass} .container.wto-cta-inner,
.${ctaClass} .wto-cta-inner{
  position:relative;
  z-index:2;
  width:100%;
  max-width:${escapeHtml(contentMaxWidth)} !important;
  margin-left:auto;
  margin-right:auto;
  padding-left:0;
  padding-right:0;
}
.${ctaClass} .wto-cta-content{
  display:flex;
  flex-direction:column;
  align-items:${alignToFlex(horizontalAlign)};
  text-align:${alignToText(horizontalAlign)};
  width:100%;
}
.${ctaClass} .wto-cta-eyebrow{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  margin:0 0 16px;
  color:${escapeHtml(String(style.eyebrowColor || "#e0e7ff"))};
  font-size:${escapeHtml(normalizeCtaPx(style.eyebrowFontSize, "12px"))};
  font-weight:${escapeHtml(String(style.eyebrowFontWeight || "700"))};
  letter-spacing:${escapeHtml(normalizeCtaPx(style.eyebrowLetterSpacing, "2px"))};
  text-transform:uppercase;
  background:${escapeHtml(String(style.eyebrowBackgroundColor || "rgba(255,255,255,0.14)"))};
  border-radius:${escapeHtml(normalizeCtaPx(style.eyebrowBorderRadius, "999px"))};
  padding:${escapeHtml(normalizeCtaPx(style.eyebrowPaddingY, "6px"))} ${escapeHtml(normalizeCtaPx(style.eyebrowPaddingX, "14px"))};
}
.${ctaClass} .wto-cta-heading{
  margin:0 0 ${escapeHtml(normalizeCtaPx(style.headingMarginBottom, "16px"))};
  color:${escapeHtml(String(style.headingColor || "#ffffff"))};
  font-size:${escapeHtml(headingDesktop)};
  font-weight:${escapeHtml(String(style.headingFontWeight || "700"))};
  line-height:${escapeHtml(String(style.headingLineHeight || "1.15"))};
  max-width:${escapeHtml(normalizeCtaPx(style.headingMaxWidth, "720px"))};
  ${headingShadow}
}
.${ctaClass} .wto-cta-paragraph{
  margin:0 0 ${escapeHtml(normalizeCtaPx(style.paragraphMarginBottom, "28px"))};
  color:${escapeHtml(String(style.paragraphColor || "#eef2ff"))};
  font-size:${escapeHtml(normalizeCtaPx(style.paragraphFontSize, "18px"))};
  line-height:${escapeHtml(String(style.paragraphLineHeight || "1.7"))};
  max-width:${escapeHtml(normalizeCtaPx(style.paragraphMaxWidth, "640px"))};
  white-space:pre-wrap;
}
.${ctaClass} .wto-cta-buttons{
  display:flex;
  flex-direction:${buttonLayout === "vertical" ? "column" : "row"};
  flex-wrap:wrap;
  align-items:${buttonLayout === "vertical" ? alignToFlex(buttonAlignment) : "center"};
  justify-content:${alignToFlex(buttonAlignment)};
  gap:${escapeHtml(buttonGap)};
  width:100%;
}
.${ctaClass} .wto-cta-button{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  text-decoration:none;
  line-height:1.2;
  transition:background .15s ease, color .15s ease, border-color .15s ease;
  box-sizing:border-box;
}
.${ctaClass} .wto-cta-button-primary{
  background:${escapeHtml(String(style.primaryBackgroundColor || "#ffffff"))};
  color:${escapeHtml(String(style.primaryTextColor || "#1e3a8a"))};
  border:${escapeHtml(normalizeCtaPx(style.primaryBorderWidth, "1px"))} solid ${escapeHtml(String(style.primaryBorderColor || "#ffffff"))};
  border-radius:${escapeHtml(normalizeCtaPx(style.primaryBorderRadius, "10px"))};
  font-size:${escapeHtml(normalizeCtaPx(style.primaryFontSize, "15px"))};
  font-weight:${escapeHtml(String(style.primaryFontWeight || "600"))};
  padding:${escapeHtml(normalizeCtaPx(style.primaryPaddingY, "14px"))} ${escapeHtml(normalizeCtaPx(style.primaryPaddingX, "24px"))};
}
.${ctaClass} .wto-cta-button-primary:hover{
  background:${escapeHtml(String(style.primaryHoverBackgroundColor || "#f8fafc"))};
  color:${escapeHtml(String(style.primaryHoverTextColor || "#1e3a8a"))};
  border-color:${escapeHtml(String(style.primaryHoverBorderColor || "#f8fafc"))};
}
.${ctaClass} .wto-cta-button-secondary{
  background:${escapeHtml(String(style.secondaryBackgroundColor || "transparent"))};
  color:${escapeHtml(String(style.secondaryTextColor || "#ffffff"))};
  border:${escapeHtml(normalizeCtaPx(style.secondaryBorderWidth, "1px"))} solid ${escapeHtml(String(style.secondaryBorderColor || "rgba(255,255,255,0.75)"))};
  border-radius:${escapeHtml(normalizeCtaPx(style.secondaryBorderRadius, "10px"))};
  font-size:${escapeHtml(normalizeCtaPx(style.secondaryFontSize, "15px"))};
  font-weight:${escapeHtml(String(style.secondaryFontWeight || "600"))};
  padding:${escapeHtml(normalizeCtaPx(style.secondaryPaddingY, "14px"))} ${escapeHtml(normalizeCtaPx(style.secondaryPaddingX, "24px"))};
}
.${ctaClass} .wto-cta-button-secondary:hover{
  background:${escapeHtml(String(style.secondaryHoverBackgroundColor || "rgba(255,255,255,0.14)"))};
  color:${escapeHtml(String(style.secondaryHoverTextColor || "#ffffff"))};
  border-color:${escapeHtml(String(style.secondaryHoverBorderColor || "#ffffff"))};
}
@media (max-width:991.98px){
  .${ctaClass}{ min-height:${escapeHtml(minHeightTablet)}; }
  .${ctaClass} .wto-cta-heading{ font-size:${escapeHtml(headingTablet)}; }
}
@media (max-width:767.98px){
  .${ctaClass}{ min-height:${escapeHtml(minHeightMobile)}; }
  .${ctaClass} .wto-cta-heading{ font-size:${escapeHtml(headingMobile)}; }
  ${
    stackButtonsOnMobile
      ? `.${ctaClass} .wto-cta-buttons{ flex-direction:column; align-items:${alignToFlex(buttonAlignment)}; }`
      : ""
  }
}
${hideCss}
</style>
<section${ctaDomId} class="wto-cta full-width-cta builder-cta ${ctaClass}${extraClass}" data-wto-cta="1" aria-label="Call to action">
  ${backgroundHtml}
  ${overlayHtml}
  <div class="container wto-cta-inner">
    <div class="wto-cta-content">
      ${eyebrowHtml}
      ${headingHtml}
      ${paragraphHtml}
      ${buttonsHtml}
    </div>
  </div>
</section>`.trim();
}
