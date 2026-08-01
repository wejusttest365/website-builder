import type { GridWidgetData } from "./GridTypes";
import { getColumnBootstrapClass } from "./GridTypes";
import { createWidgetInstance, getWidgetBootstrapExport } from "../widgetRegistry";
import { getChildWidgetData } from "../Container/ContainerTypes";

export function buildGridBootstrapMarkup(widget: GridWidgetData): string {
  if (widget.advanced?.visibility === false) return "";

  const columns = Array.isArray(widget.content?.columns) && widget.content.columns.length ? widget.content.columns : [];
  const columnCount = Math.max(1, Math.min(6, Number((widget as any).layout?.columns ?? columns.length ?? 1)));
  const gap = widget.style.gap ?? "1rem";
  const stackOnMobile = widget.responsive.stackOnMobile ?? true;
  const tabletColumns = Math.max(1, Math.min(6, Number(widget.responsive.tabletColumns ?? Math.min(2, columnCount || 1))));
  const mobileColumns = Math.max(1, Math.min(6, Number(widget.responsive.mobileColumns ?? 1)));
  const useBootstrapColumns = columnCount <= 4;
  const padding = widget.layout.padding ?? "1rem";
  const margin = widget.layout.margin ?? "0rem";
  const backgroundColor = widget.style.backgroundColor ?? "transparent";
  const border = widget.style.border ?? "1px solid #e2e8f0";
  const borderRadius = widget.style.borderRadius ?? "0.75rem";
  const shadow = widget.style.shadow ?? "none";
  const extraClassName = widget.advanced?.className ? ` ${widget.advanced.className}` : "";

  const columnMarkup = columns.length
    ? columns.map((column) => {
        const childMarkup = (column.children ?? []).map((child) => {
          const childData = getChildWidgetData(child as any);
          const childInstance = createWidgetInstance(child.type, {
            id: `${widget.id}-${child.id}`,
            content: childData.content,
            style: childData.style,
            layout: childData.layout,
            responsive: childData.responsive,
            animation: childData.animation,
            advanced: childData.advanced,
            variant: childData.variant,
          } as any);
          const childHtml = getWidgetBootstrapExport(child.type, childInstance) || "";
          return `<div data-container-parent-widget-id="${widget.id}" data-container-child-id="${child.id}" data-wto-parent-widget-id="${widget.id}" data-wto-child-id="${child.id}" data-wto-widget-element-key="${child.id}" data-wto-widget-element-type="container" data-grid-column-id="${column.id}">${childHtml}</div>`;
        }).join("");

        return `
      <div${useBootstrapColumns ? ` class="${getColumnBootstrapClass(column.span, stackOnMobile)}"` : " style=\"min-width:0;\""}>
        <div class="h-100 rounded p-3" data-grid-column-id="${column.id}" data-grid-column-wrapper="1">
          <div class="d-flex flex-column gap-2">
            ${childMarkup || ""}
          </div>
        </div>
      </div>`;
      }).join("")
    : '<div></div>';

  return `
    <section id="${widget.advanced?.id ?? ""}"${extraClassName ? ` class="${extraClassName.trim()}"` : ""} style="padding:${padding};margin:${margin};background:${backgroundColor};border:${border};border-radius:${borderRadius};box-shadow:${shadow};">
      ${useBootstrapColumns ? `<div class="row ${stackOnMobile ? "flex-column flex-md-row" : "flex-column"}">${columnMarkup}</div>` : `<style>
        .wto-grid-${widget.id} { display:grid; gap:${gap}; grid-template-columns: repeat(${Math.max(1, columns.length)}, minmax(0, 1fr)); }
        @media (max-width: 991px) { .wto-grid-${widget.id} { grid-template-columns: repeat(${Math.max(1, tabletColumns)}, minmax(0, 1fr)) !important; } }
        @media (max-width: 767px) { .wto-grid-${widget.id} { grid-template-columns: repeat(${Math.max(1, mobileColumns)}, minmax(0, 1fr)) !important; } }
        @media (max-width: 767px) { .wto-grid-${widget.id} { grid-template-columns: 1fr !important; } }
      </style><div class="wto-grid-${widget.id}">${columnMarkup}</div>`}
    </section>`;
}
