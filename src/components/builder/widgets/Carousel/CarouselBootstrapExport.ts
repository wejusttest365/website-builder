import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import { getAssetValue, type BuilderAssetEntry } from "@/lib/builder/image-storage";
import {
  defaultCarouselWidgetData,
  isCarouselWidgetData,
  normalizeCarouselPx,
  type CarouselSlide,
  type CarouselWidgetData,
} from "./CarouselTypes";

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
  return String(value || "carousel").replace(/[^a-zA-Z0-9_-]/g, "");
}

function attr(name: string, value: string | undefined, editorMode: boolean) {
  if (!editorMode || !value) return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

function isBuilderAssetEntry(value: unknown): value is BuilderAssetEntry {
  return typeof value === "object" && value !== null && "src" in value;
}

function resolveSlideSrc(slide: CarouselSlide): string {
  if (isBuilderAssetEntry(slide.src)) {
    return String(getAssetValue(slide.src) ?? "");
  }
  return String(slide.src || "");
}

function colorWithOpacity(color: string, opacity: number): string {
  const o = Math.max(0, Math.min(1, Number.isFinite(opacity) ? opacity : 1));
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
  if (hex.length !== 6) return raw;
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  if ([r, g, b].some((n) => Number.isNaN(n))) return raw;
  return `rgba(${r},${g},${b},${o})`;
}

function getSlides(carousel: CarouselWidgetData): CarouselSlide[] {
  return Array.isArray(carousel.content?.slides) ? carousel.content.slides : [];
}

export function buildCarouselBootstrapMarkup(
  data: WidgetData = defaultCarouselWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const carousel = isCarouselWidgetData(data) ? data : defaultCarouselWidgetData;
  if (carousel.advanced?.visibility === false) return "";

  const style = carousel.style ?? {};
  const content = carousel.content ?? {};
  const slides = getSlides(carousel);
  if (!slides.length) return "";

  const heightDesktop = normalizeCarouselPx(style.heightDesktop, "560px");
  const heightTablet = normalizeCarouselPx(style.heightTablet, "420px");
  const heightMobile = normalizeCarouselPx(style.heightMobile, "280px");
  const objectFit = style.objectFit === "contain" ? "contain" : "cover";
  const backgroundColor = String(style.backgroundColor || "#0f172a");
  const borderRadius = normalizeCarouselPx(style.borderRadius, "0px");
  const overflowHidden = style.overflowHidden !== false;
  const showArrows = style.showArrows !== false;
  const arrowSize = normalizeCarouselPx(style.arrowSize, "44px");
  const arrowColor = String(style.arrowColor || "#ffffff");
  const arrowBg = colorWithOpacity(
    String(style.arrowBackgroundColor || "#0f172a"),
    Number(style.arrowBackgroundOpacity ?? 0.45),
  );
  const arrowRadius = normalizeCarouselPx(style.arrowBorderRadius, "9999px");
  const arrowPosition = style.arrowPosition === "outside" ? "outside" : "inside";
  const showDots = style.showDots !== false;
  const dotSize = normalizeCarouselPx(style.dotSize, "10px");
  const dotActive = String(style.dotActiveColor || "#ffffff");
  const dotInactive = String(style.dotInactiveColor || "rgba(255,255,255,0.45)");
  const dotPosition = style.dotPosition === "outside-bottom" ? "outside-bottom" : "inside-bottom";

  const autoplay = Boolean(content.autoplay);
  const autoplayDelay = Math.max(500, Number(content.autoplayDelay ?? 5000) || 5000);
  const infiniteLoop = content.infiniteLoop !== false;
  const pauseOnHover = content.pauseOnHover !== false;
  const transitionDuration = Math.max(0, Number(content.transitionDuration ?? 500) || 500);
  const keyboardNavigation = content.keyboardNavigation !== false;
  const swipeNavigation = content.swipeNavigation !== false;

  const selectedSlideId = String(content.selectedSlideId || "");
  const startIndex = Math.max(
    0,
    slides.findIndex((slide) => slide.id === selectedSlideId),
  );
  const safeStartIndex = startIndex >= 0 ? startIndex : 0;

  const hideOnMobile = Boolean(carousel.responsive?.hideOnMobile);
  const hideOnTablet = Boolean(carousel.responsive?.hideOnTablet);
  const hideOnDesktop = Boolean(carousel.responsive?.hideOnDesktop);
  const carouselClass = `wto-carousel-${escapeCssIdent(carousel.id)}`;
  const hideCss = [
    hideOnMobile ? `@media (max-width:767.98px){.${carouselClass}{display:none!important;}}` : "",
    hideOnTablet ? `@media (min-width:768px) and (max-width:991.98px){.${carouselClass}{display:none!important;}}` : "",
    hideOnDesktop ? `@media (min-width:992px){.${carouselClass}{display:none!important;}}` : "",
  ]
    .filter(Boolean)
    .join("");
  const extraClass = carousel.advanced?.className ? ` ${escapeHtml(String(carousel.advanced.className))}` : "";
  const carouselDomId = carousel.advanced?.id ? ` id="${escapeHtml(String(carousel.advanced.id))}"` : "";
  const arrowInset = arrowPosition === "inside" ? "16px" : `-${arrowSize}`;
  const dotSizeNum = Number.parseFloat(dotSize) || 10;
  const dotsBottom =
    dotPosition === "inside-bottom"
      ? "16px"
      : `-${normalizeCarouselPx(`${dotSizeNum * 2 + 12}px`, "32px")}`;
  const outsideArrowPad = arrowPosition === "outside" ? arrowSize : "0px";
  const outsideDotsPad =
    dotPosition === "outside-bottom"
      ? normalizeCarouselPx(`${dotSizeNum * 2 + 20}px`, "40px")
      : "0px";

  const slideHtml = slides
    .map((slide, index) => {
      const src = escapeHtml(resolveSlideSrc(slide));
      const alt = escapeHtml(slide.alt || `Slide ${index + 1}`);
      const link = String(slide.link || "").trim();
      const img = `<img src="${src}" alt="${alt}" loading="${index === 0 ? "eager" : "lazy"}" draggable="false" style="width:100%;height:100%;object-fit:${objectFit};display:block;" />`;
      const media = link
        ? `<a href="${escapeHtml(link)}"${slide.openInNewTab ? ' target="_blank" rel="noopener noreferrer"' : ""} style="display:block;width:100%;height:100%;">${img}</a>`
        : img;
      return `<div class="wto-carousel-slide" data-carousel-slide="1" data-slide-id="${escapeHtml(slide.id)}"${attr("data-wto-widget-element-key", slide.id, editorMode)}${attr("data-wto-widget-element-type", "image", editorMode)} role="group" aria-roledescription="slide" aria-label="Slide ${index + 1} of ${slides.length}">${media}</div>`;
    })
    .join("");

  const dotsHtml = showDots
    ? `<div class="wto-carousel-dots" role="tablist" aria-label="Carousel pagination">${slides
        .map(
          (slide, index) =>
            `<button type="button" class="wto-carousel-dot${index === safeStartIndex ? " is-active" : ""}" data-carousel-dot="1" data-index="${index}" data-wto-ignore-edit="1" aria-label="Go to slide ${index + 1}"></button>`,
        )
        .join("")}</div>`
    : "";

  const arrowSvgPrev =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 18l-6-6 6-6"/></svg>';
  const arrowSvgNext =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 18l6-6-6-6"/></svg>';

  const arrowsHtml = showArrows
    ? `<button type="button" class="wto-carousel-arrow wto-carousel-prev" data-carousel-prev="1" data-wto-ignore-edit="1" aria-label="Previous slide">${arrowSvgPrev}</button><button type="button" class="wto-carousel-arrow wto-carousel-next" data-carousel-next="1" data-wto-ignore-edit="1" aria-label="Next slide">${arrowSvgNext}</button>`
    : "";

  return `
<style>
.${carouselClass}{
  position:relative;
  width:100%;
  max-width:100%;
  box-sizing:border-box;
  background:${escapeHtml(backgroundColor)};
  border-radius:${escapeHtml(borderRadius)};
  overflow:${overflowHidden ? "hidden" : "visible"};
  padding-left:${escapeHtml(outsideArrowPad)};
  padding-right:${escapeHtml(outsideArrowPad)};
  padding-bottom:${escapeHtml(outsideDotsPad)};
}
.${carouselClass} .wto-carousel-viewport{
  position:relative;
  width:100%;
  height:${escapeHtml(heightDesktop)};
  overflow:hidden;
}
.${carouselClass} .wto-carousel-track{
  display:flex;
  height:100%;
  width:100%;
  transform:translate3d(${-safeStartIndex * 100}%,0,0);
  transition:transform ${transitionDuration}ms ease;
  will-change:transform;
}
.${carouselClass} .wto-carousel-slide{
  flex:0 0 100%;
  width:100%;
  height:100%;
  position:relative;
  overflow:hidden;
}
.${carouselClass} .wto-carousel-arrow{
  position:absolute;
  top:50%;
  transform:translateY(-50%);
  z-index:3;
  width:${escapeHtml(arrowSize)};
  height:${escapeHtml(arrowSize)};
  border:0;
  border-radius:${escapeHtml(arrowRadius)};
  display:inline-flex;
  align-items:center;
  justify-content:center;
  color:${escapeHtml(arrowColor)};
  background:${escapeHtml(arrowBg)};
  cursor:pointer;
  padding:0;
  line-height:1;
  transition:opacity .15s ease, transform .15s ease;
}
.${carouselClass} .wto-carousel-arrow.is-disabled,
.${carouselClass} .wto-carousel-arrow:disabled{
  opacity:.35;
  cursor:not-allowed;
}
.${carouselClass} .wto-carousel-prev{ left:${escapeHtml(arrowInset)}; }
.${carouselClass} .wto-carousel-next{ right:${escapeHtml(arrowInset)}; }
.${carouselClass} .wto-carousel-dots{
  position:absolute;
  left:50%;
  transform:translateX(-50%);
  bottom:${escapeHtml(dotsBottom)};
  z-index:3;
  display:flex;
  align-items:center;
  gap:8px;
}
.${carouselClass} .wto-carousel-dot{
  width:${escapeHtml(dotSize)};
  height:${escapeHtml(dotSize)};
  border-radius:9999px;
  border:0;
  padding:0;
  cursor:pointer;
  background:${escapeHtml(dotInactive)};
  transition:transform .15s ease, background .15s ease;
}
.${carouselClass} .wto-carousel-dot.is-active{
  background:${escapeHtml(dotActive)};
  transform:scale(1.15);
}
@media (max-width:991.98px){
  .${carouselClass} .wto-carousel-viewport{ height:${escapeHtml(heightTablet)}; }
}
@media (max-width:767.98px){
  .${carouselClass} .wto-carousel-viewport{ height:${escapeHtml(heightMobile)}; }
}
${hideCss}
</style>
<section${carouselDomId} class="wto-carousel ${carouselClass}${extraClass}" data-wto-carousel="1" data-autoplay="${autoplay ? "1" : "0"}" data-autoplay-delay="${autoplayDelay}" data-loop="${infiniteLoop ? "1" : "0"}" data-pause-hover="${pauseOnHover ? "1" : "0"}" data-transition="${transitionDuration}" data-keyboard="${keyboardNavigation ? "1" : "0"}" data-swipe="${swipeNavigation ? "1" : "0"}" data-start-index="${safeStartIndex}" role="region" aria-roledescription="carousel" aria-label="Image carousel">
  <div class="wto-carousel-viewport">
    <div class="wto-carousel-track" data-carousel-track="1">${slideHtml}</div>
  </div>
  ${arrowsHtml}
  ${dotsHtml}
</section>`.trim();
}
