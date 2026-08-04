import {
  isGridWidgetData,
  defaultGridWidgetData,
  resolveGridColumnCount,
  resolveResponsiveGridColumns,
  createGridColumn,
  getEqualColumnSpan,
  buildCssGridTemplateColumns,
} from "./GridTypes";
import { createWidgetInstance, getWidgetBootstrapExport } from "../widgetRegistry";
import { getChildWidgetData } from "../Container/ContainerTypes";
import type { WidgetData, WidgetExportContext } from "../widgetRegistry";
import { getSpacingStyleValue } from "../spacing";

function escapeCssIdent(value: string) {
  return String(value || "grid").replace(/[^a-zA-Z0-9_-]/g, "");
}

export function buildGridBootstrapMarkup(
  data: WidgetData = defaultGridWidgetData,
  context?: WidgetExportContext,
): string {
  const editorMode = context?.editorMode === true;
  const widget = isGridWidgetData(data) ? data : defaultGridWidgetData;
  if (widget.advanced?.visibility === false) return "";

  const desktopColumns = resolveGridColumnCount(widget);
  const sourceColumns = Array.isArray(widget.content?.columns) ? widget.content.columns : [];
  const equalSpan = getEqualColumnSpan(desktopColumns);
  const columns = Array.from({ length: Math.max(1, desktopColumns) }, (_, index) => {
    const source = sourceColumns[index];
    if (source) {
      return {
        ...source,
        children: Array.isArray(source.children) ? source.children : [],
      };
    }
    return createGridColumn(equalSpan, `column-${index + 1}`);
  });
  const { tablet, mobile } = resolveResponsiveGridColumns(
    desktopColumns,
    widget.responsive.tabletColumns,
    widget.responsive.mobileColumns,
  );
  const columnGap = String(widget.style.columnGap || widget.style.gap || "16px");
  const rowGap = String(widget.style.rowGap || widget.style.gap || "16px");
  const alignItems = String(widget.layout.alignment || "stretch");
  const padding = getSpacingStyleValue(widget.layout.padding, "desktop") ?? "16px";
  const margin = getSpacingStyleValue(widget.layout.margin, "desktop") ?? "0px";
  const backgroundColor = widget.style.backgroundColor ?? "transparent";
  const border = widget.style.border ?? "1px solid #e2e8f0";
  const borderRadius = widget.style.borderRadius ?? "0.75rem";
  const shadow = widget.style.shadow ?? "none";
  const extraClassName = widget.advanced?.className ? ` ${widget.advanced.className}` : "";
  const gridClass = `wto-css-grid-${escapeCssIdent(widget.id)}`;
  const desktopTemplate = buildCssGridTemplateColumns(columns, desktopColumns, widget.variant);
  const tabletTemplate = `repeat(${Math.max(1, tablet)},minmax(0,1fr))`;
  const mobileTemplate = `repeat(${Math.max(1, mobile)},minmax(0,1fr))`;

  const columnMarkup = columns
    .map((column) => {
      const childMarkup = (column.children ?? [])
        .map((child) => {
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
          const childHtml = getWidgetBootstrapExport(child.type, childInstance, context) || "";
          return `<div class="wto-grid-item" data-container-parent-widget-id="${widget.id}" data-container-child-id="${child.id}" data-wto-parent-widget-id="${widget.id}" data-wto-child-id="${child.id}" data-wto-widget-element-key="${child.id}" data-wto-widget-element-type="${child.type}" data-grid-column-id="${column.id}" data-grid-item="1" style="min-width:0;width:100%;max-width:none;box-sizing:border-box;">${childHtml}</div>`;
        })
        .join("");

      const emptyPlaceholder = editorMode
        ? `<div class="builder-editor-only wto-grid-drop-placeholder" data-builder-editor-only="1">Drop widgets here</div>`
        : "";

      return `
      <div class="wto-grid-column" data-grid-column-id="${column.id}" data-grid-column-wrapper="1" style="min-width:0;width:100%;max-width:none;box-sizing:border-box;">
        <div style="min-width:0;width:100%;max-width:none;box-sizing:border-box;${editorMode ? "min-height:72px;" : ""}">
          ${childMarkup || emptyPlaceholder}
        </div>
      </div>`;
    })
    .join("");

  const editorOnlyCss = editorMode
    ? `
.${gridClass}>.wto-grid-column{
  min-height:72px;
}
body[data-builder-edit-mode="1"] .${gridClass}>.wto-grid-column{
  outline:1px dashed rgba(148,163,184,0.45);
  outline-offset:-1px;
  border-radius:6px;
}
body[data-builder-edit-mode="1"] .${gridClass}>.wto-grid-column:hover:not(.wto-sel-selected){
  outline:1px dashed rgba(124,58,237,0.45);
}
body[data-builder-edit-mode="1"] .${gridClass} .wto-grid-drop-placeholder{
  min-height:64px;
  width:100%;
  max-width:none;
  box-sizing:border-box;
  align-items:center;
  justify-content:center;
  border:1px dashed #cbd5e1;
  border-radius:8px;
  color:#94a3b8;
  font-size:12px;
  line-height:1.3;
  padding:10px;
  text-align:center;
  pointer-events:none;
  background:transparent;
}
body[data-builder-edit-mode="1"][data-builder-device="tablet"] .${gridClass}{
  grid-template-columns:${tabletTemplate} !important;
}
body[data-builder-edit-mode="1"][data-builder-device="mobile"] .${gridClass}{
  grid-template-columns:${mobileTemplate} !important;
}`
    : `
@media (max-width:991.98px){
  .${gridClass}{
    grid-template-columns:${tabletTemplate} !important;
  }
}
@media (max-width:767.98px){
  .${gridClass}{
    grid-template-columns:${mobileTemplate} !important;
  }
}`;

  return `
<style>
.${gridClass}{
  display:grid !important;
  width:100%;
  max-width:100%;
  min-width:0;
  box-sizing:border-box;
  grid-template-columns:${desktopTemplate};
  column-gap:${columnGap};
  row-gap:${rowGap};
  align-items:${alignItems};
}
.${gridClass}>.wto-grid-column,
.${gridClass} .wto-grid-item{
  min-width:0 !important;
  width:100% !important;
  max-width:none !important;
  box-sizing:border-box !important;
  flex:none !important;
}
${editorOnlyCss}
</style>
<section
  id="${widget.advanced?.id ?? ""}"
  class="${gridClass}${extraClassName}"
  data-widget="grid"
  data-grid-columns-count="${desktopColumns}"
  style="display:grid;grid-template-columns:${desktopTemplate};column-gap:${columnGap};row-gap:${rowGap};align-items:${alignItems};padding:${padding};margin:${margin};background:${backgroundColor};border:${border};border-radius:${borderRadius};box-shadow:${shadow};width:100%;max-width:100%;min-width:0;box-sizing:border-box;"
>
  ${columnMarkup}
</section>`;
}
