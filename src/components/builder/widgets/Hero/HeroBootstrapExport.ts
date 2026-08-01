import { createWidgetInstance, getWidgetBootstrapExport, type WidgetData } from "../widgetRegistry";
import { defaultHeroWidgetData, getHeroChildItems, isHeroWidgetData } from "./HeroTypes";

export function buildHeroBootstrapMarkup(data: WidgetData = defaultHeroWidgetData): string {
  const heroData = isHeroWidgetData(data) ? data : defaultHeroWidgetData;
  const style = heroData.style;
  const layout = heroData.layout;
  const alignClass = layout.align === "center" ? "text-center" : layout.align === "right" ? "text-end" : "text-start";
  const buttonAlignClass = layout.align === "center" ? "justify-content-center" : layout.align === "right" ? "justify-content-end" : "justify-content-start";
  const imageColumnFallback = layout.columns === "stacked" ? "" : '<div class="col-lg-6 mt-4 mt-lg-0"><div class="bg-light rounded-4 p-5 border" aria-hidden="true"></div></div>';
  const heroStyles = [`background:${style.backgroundColor ?? "#f8fafc"};`, `color:${style.textColor ?? "#0f172a"};`].join(" ");

  const children = getHeroChildItems(heroData);
  const leftChildren = children.filter((child) => child.type !== "image");
  const bodyChildren = leftChildren.filter((child) => child.type !== "button");
  const buttonChildren = leftChildren.filter((child) => child.type === "button");
  const imageChildren = children.filter((child) => child.type === "image");

  const renderChildHtml = (child: { id: string; type: string; data?: Record<string, unknown> }) => {
    const childData = child.data ?? {};
    const childInstance = createWidgetInstance(child.type, {
      content: (childData as Record<string, unknown>).content ?? {},
      style: (childData as Record<string, unknown>).style ?? {},
      layout: (childData as Record<string, unknown>).layout ?? {},
      responsive: (childData as Record<string, unknown>).responsive ?? {},
      animation: (childData as Record<string, unknown>).animation ?? {},
      advanced: (childData as Record<string, unknown>).advanced ?? {},
      variant: (childData as Record<string, unknown>).variant as string | undefined,
    } as Partial<WidgetData>);
    const childHtml = getWidgetBootstrapExport(child.type, childInstance) || "";
    // Wrap child with data attributes for selection detection in preview
    return `<div data-wto-parent-widget-id="${heroData.id}" data-wto-child-id="${child.id}" data-wto-widget-element-key="${child.id}" data-wto-widget-element-type="container">${childHtml}</div>`;
  };

  const bodyHtml = bodyChildren.map(renderChildHtml).join("");
  const buttonHtml = buttonChildren.map(renderChildHtml).join("");
  const imageHtml = imageChildren.map(renderChildHtml).join("");

  return `
<section class="py-${style.paddingY ?? 5}" style="${heroStyles}">
  <div class="w-100">
    <div class="row g-4 align-items-center">
      <div class="col-lg-7 ${layout.columns === "stacked" ? "order-2" : ""}">
        <div class="${alignClass}">
          ${bodyHtml}
          ${buttonHtml ? `<div class="d-flex gap-3 flex-wrap ${buttonAlignClass}">${buttonHtml}</div>` : ""}
        </div>
      </div>
      ${imageHtml ? `<div class="col-lg-5 ${layout.columns === "stacked" ? "order-1" : ""}">${imageHtml}</div>` : imageColumnFallback}
    </div>
  </div>
</section>`;
}
