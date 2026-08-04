import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import {
  defaultFAQWidgetData,
  getEnabledFAQItems,
  isFAQWidgetData,
  normalizeFAQPx,
  resolveFAQInitialOpenIds,
  type FAQIconPosition,
  type FAQIconStyle,
  type FAQWidgetData,
} from "./FAQTypes";

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
  return String(value || "faq").replace(/[^a-zA-Z0-9_-]/g, "");
}

function attr(name: string, value: string | undefined, editorMode: boolean) {
  if (!editorMode || !value) return "";
  return ` ${name}="${escapeHtml(value)}"`;
}

function renderIcon(style: FAQIconStyle): string {
  if (style === "plus-minus") {
    return `<span class="wto-faq-icon-plus" aria-hidden="true"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg></span><span class="wto-faq-icon-minus" aria-hidden="true"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M5 12h14"/></svg></span>`;
  }
  if (style === "arrow") {
    return `<span class="wto-faq-icon-main" aria-hidden="true"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="M13 6l6 6-6 6"/></svg></span>`;
  }
  return `<span class="wto-faq-icon-main" aria-hidden="true"><svg width="1em" height="1em" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9l6 6 6-6"/></svg></span>`;
}

export function buildFAQBootstrapMarkup(
  data: WidgetData = defaultFAQWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const faq = isFAQWidgetData(data) ? data : defaultFAQWidgetData;
  if (faq.advanced?.visibility === false) return "";

  const style = faq.style ?? {};
  const layout = faq.layout ?? {};
  const items = getEnabledFAQItems(faq);
  if (!items.length) return "";

  const openIds = new Set(resolveFAQInitialOpenIds(faq));
  const allowMultiple = Boolean(faq.content?.allowMultiple);
  const backgroundColor = String(style.backgroundColor || "transparent");
  const maxWidth = normalizeFAQPx(style.maxWidth, "760px");
  const itemBg = String(style.itemBackgroundColor || "#ffffff");
  const itemOpenBg = String(style.itemOpenBackgroundColor || "#f8fafc");
  const borderColor = String(style.borderColor || "#e2e8f0");
  const borderWidth = normalizeFAQPx(style.borderWidth, "1px");
  const borderRadius = normalizeFAQPx(style.borderRadius, "12px");
  const itemGap = normalizeFAQPx(style.itemGap, "12px");
  const questionColor = String(style.questionColor || "#0f172a");
  const questionFontSize = normalizeFAQPx(style.questionFontSize, "16px");
  const questionFontWeight = String(style.questionFontWeight || "600");
  const questionPadding = String(style.questionPadding || "16px");
  const answerColor = String(style.answerColor || "#475569");
  const answerFontSize = normalizeFAQPx(style.answerFontSize, "15px");
  const answerLineHeight = String(style.answerLineHeight || "1.6");
  const answerPadding = String(style.answerPadding || "0px 16px 16px");
  const iconStyle = (style.iconStyle || "chevron") as FAQIconStyle;
  const iconSize = normalizeFAQPx(style.iconSize, "18px");
  const iconColor = String(style.iconColor || "#64748b");
  const iconPosition = (style.iconPosition || "right") as FAQIconPosition;
  const rotateIcon = style.rotateIconWhenOpen !== false;
  const transitionEnabled = style.transitionEnabled !== false;
  const transitionDuration = Math.max(0, Number(style.transitionDuration ?? 280) || 280);
  const paddingTop = normalizeFAQPx(layout.paddingTop, "48px");
  const paddingBottom = normalizeFAQPx(layout.paddingBottom, "48px");
  const paddingX = normalizeFAQPx(layout.paddingX, "24px");

  const faqClass = `wto-faq-${escapeCssIdent(faq.id)}`;
  const accordionId = escapeHtml(String(faq.advanced?.id || `wto-faq-${escapeCssIdent(faq.id)}`));
  const hideOnMobile = Boolean(faq.responsive?.hideOnMobile);
  const hideOnTablet = Boolean(faq.responsive?.hideOnTablet);
  const hideOnDesktop = Boolean(faq.responsive?.hideOnDesktop);
  const hideCss = [
    hideOnMobile ? `@media (max-width:767.98px){.${faqClass}{display:none!important;}}` : "",
    hideOnTablet ? `@media (min-width:768px) and (max-width:991.98px){.${faqClass}{display:none!important;}}` : "",
    hideOnDesktop ? `@media (min-width:992px){.${faqClass}{display:none!important;}}` : "",
  ]
    .filter(Boolean)
    .join("");
  const extraClass = faq.advanced?.className ? ` ${escapeHtml(String(faq.advanced.className))}` : "";
  const iconHtml = renderIcon(iconStyle);
  const durationCss = transitionEnabled ? `${transitionDuration}ms` : "0ms";
  const iconOrder = iconPosition === "left" ? "row" : "row-reverse";

  const itemsHtml = items
    .map((item) => {
      const isOpen = openIds.has(item.id);
      const headerId = `${escapeCssIdent(faq.id)}-h-${escapeCssIdent(item.id)}`;
      const panelId = `${escapeCssIdent(faq.id)}-p-${escapeCssIdent(item.id)}`;
      const questionKey = `question-${item.id}`;
      const answerKey = `answer-${item.id}`;
      const parentAttr = allowMultiple ? "" : ` data-bs-parent="#${accordionId}"`;
      return `
      <div class="wto-faq-item${isOpen ? " is-open" : ""}" data-faq-item="1" data-faq-item-id="${escapeHtml(item.id)}"${attr("data-wto-widget-element-key", item.id, editorMode)}${attr("data-wto-widget-element-type", "container", editorMode)}>
        <h3 class="wto-faq-question-wrap">
          <button type="button" class="wto-faq-trigger" data-faq-trigger="1" data-bs-toggle="collapse" data-bs-target="#${panelId}" id="${headerId}" aria-expanded="${isOpen ? "true" : "false"}" aria-controls="${panelId}">
            <span class="wto-faq-question"${attr("data-wto-widget-element-key", questionKey, editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(item.question)}</span>
            <span class="wto-faq-icon" aria-hidden="true">${iconHtml}</span>
          </button>
        </h3>
        <div class="wto-faq-panel collapse${isOpen ? " show" : ""}" data-faq-panel="1" id="${panelId}" role="region" aria-labelledby="${headerId}"${parentAttr}>
          <div class="wto-faq-panel-inner">
            <div class="wto-faq-answer"${attr("data-wto-widget-element-key", answerKey, editorMode)}${attr("data-wto-widget-element-type", "text", editorMode)}>${escapeHtml(item.answer)}</div>
          </div>
        </div>
      </div>`;
    })
    .join("");

  return `
<style>
.${faqClass}{
  width:100%;
  box-sizing:border-box;
  background:${escapeHtml(backgroundColor)};
  padding:${escapeHtml(paddingTop)} ${escapeHtml(paddingX)} ${escapeHtml(paddingBottom)};
}
.${faqClass} .wto-faq-inner{
  width:100%;
  max-width:${escapeHtml(maxWidth)};
  margin:0 auto;
  display:flex;
  flex-direction:column;
  gap:${escapeHtml(itemGap)};
}
.${faqClass} .wto-faq-item{
  background:${escapeHtml(itemBg)};
  border:${escapeHtml(borderWidth)} solid ${escapeHtml(borderColor)};
  border-radius:${escapeHtml(borderRadius)};
  overflow:hidden;
}
.${faqClass} .wto-faq-item.is-open,
.${faqClass} .wto-faq-item:has(.wto-faq-panel.show){
  background:${escapeHtml(itemOpenBg)};
}
.${faqClass} .wto-faq-question-wrap{
  margin:0;
}
.${faqClass} .wto-faq-trigger{
  width:100%;
  display:flex;
  flex-direction:${iconOrder};
  align-items:center;
  justify-content:space-between;
  gap:12px;
  border:0;
  background:transparent;
  color:${escapeHtml(questionColor)};
  font-size:${escapeHtml(questionFontSize)};
  font-weight:${escapeHtml(questionFontWeight)};
  line-height:1.4;
  text-align:left;
  padding:${escapeHtml(questionPadding)};
  cursor:pointer;
  box-shadow:none;
}
.${faqClass} .wto-faq-trigger:focus{
  outline:2px solid rgba(37,99,235,.35);
  outline-offset:2px;
}
.${faqClass} .wto-faq-question{
  flex:1 1 auto;
  min-width:0;
}
.${faqClass} .wto-faq-icon{
  flex:0 0 auto;
  width:${escapeHtml(iconSize)};
  height:${escapeHtml(iconSize)};
  color:${escapeHtml(iconColor)};
  display:inline-flex;
  align-items:center;
  justify-content:center;
  font-size:${escapeHtml(iconSize)};
  transition:transform ${durationCss} ease;
}
.${faqClass} .wto-faq-icon svg{
  width:1em;
  height:1em;
  display:block;
}
.${faqClass} .wto-faq-icon-minus{ display:none; }
.${faqClass} .wto-faq-item.is-open .wto-faq-icon-plus,
.${faqClass} .wto-faq-item:has(.wto-faq-panel.show) .wto-faq-icon-plus{ display:none; }
.${faqClass} .wto-faq-item.is-open .wto-faq-icon-minus,
.${faqClass} .wto-faq-item:has(.wto-faq-panel.show) .wto-faq-icon-minus{ display:inline-flex; }
${
  rotateIcon
    ? `.${faqClass} .wto-faq-item.is-open .wto-faq-icon-main,
.${faqClass} .wto-faq-item:has(.wto-faq-panel.show) .wto-faq-icon-main{ transform:rotate(180deg); }`
    : ""
}
.${faqClass} .wto-faq-panel.collapsing{
  transition-duration:${durationCss};
}
.${faqClass} .wto-faq-panel-inner{
  overflow:hidden;
  min-height:0;
}
.${faqClass} .wto-faq-answer{
  color:${escapeHtml(answerColor)};
  font-size:${escapeHtml(answerFontSize)};
  line-height:${escapeHtml(answerLineHeight)};
  padding:${escapeHtml(answerPadding)};
  white-space:pre-wrap;
}
${hideCss}
</style>
<section id="${accordionId}" class="wto-faq ${faqClass}${extraClass}" data-wto-faq="1" data-multiple="${allowMultiple ? "1" : "0"}" data-transition="${transitionDuration}" data-transition-enabled="${transitionEnabled ? "1" : "0"}" aria-label="Frequently asked questions">
  <div class="wto-faq-inner accordion">${itemsHtml}</div>
</section>`.trim();
}
