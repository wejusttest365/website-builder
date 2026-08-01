import { createWidgetInstance, getWidgetBootstrapExport, type WidgetData } from "../widgetRegistry";
import { defaultContainerWidgetData, getContainerChildWidgetData, isContainerWidgetData } from "./ContainerTypes";

export function buildContainerBootstrapMarkup(data: WidgetData = defaultContainerWidgetData): string {
  const containerData = isContainerWidgetData(data) ? data : defaultContainerWidgetData;
  const children = Array.isArray(containerData.content.children) ? containerData.content.children : [];
  const content = children
    .map((child) => {
      const childData = getContainerChildWidgetData(child);
      const childInstance = createWidgetInstance(child.type, {
        id: `${containerData.id}-${child.id}`,
        content: childData.content,
        style: childData.style,
        layout: childData.layout,
        responsive: childData.responsive,
        animation: childData.animation,
        advanced: childData.advanced,
        variant: childData.variant,
      });
      const childHtml = getWidgetBootstrapExport(child.type, childInstance) || "";
      // Wrap child with data attributes for selection detection in preview
      return `<div data-container-parent-widget-id="${containerData.id}" data-container-child-id="${child.id}" data-container-widget-element-key="${child.id}" data-container-widget-element-type="container">${childHtml}</div>`;
    })
    .join("");

  const columnClass = Number(containerData.layout.columns ?? 1) > 1 ? "row g-4" : "d-flex flex-column gap-3";

  return `
<section class="py-4">
  <div class="w-100">
    <div class="rounded-3 ${columnClass}" style="background:${String(containerData.style.backgroundColor ?? "transparent")};padding:${String(containerData.style.padding ?? "1rem")};margin:${String(containerData.style.margin ?? "0rem")};border:${String(containerData.style.borderWidth ?? "0px")} solid ${String(containerData.style.borderColor ?? "transparent")};">
      ${content}
    </div>
  </div>
</section>`;
}
