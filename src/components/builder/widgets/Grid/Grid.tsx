import { BaseWidget } from "../BaseWidget";
import {
  buildCssGridTemplateColumns,
  defaultGridWidgetData,
  getEqualColumnSpan,
  isGridWidgetData,
  resolveGridColumnCount,
  resolveResponsiveGridColumns,
  createGridColumn,
} from "./GridTypes";
import type { WidgetData } from "../widgetRegistry";
import { createWidgetInstance, getWidgetRegistration } from "../widgetRegistry";
import { getChildWidgetData } from "../Container/ContainerTypes";
import { useBuilder } from "@/lib/builder/store";
import { getSpacingBoxStyle } from "../spacing";

export interface GridProps {
  data: WidgetData;
}

export function Grid({ data = defaultGridWidgetData }: GridProps) {
  const gridValue = isGridWidgetData(data) ? data : defaultGridWidgetData;
  const visible = gridValue.advanced.visibility ?? true;
  const device = useBuilder((s) => s.device);
  const select = useBuilder((s) => s.selectElement);
  if (!visible) return null;

  const desktopColumns = resolveGridColumnCount(gridValue);
  const sourceColumns = Array.isArray(gridValue.content.columns) ? gridValue.content.columns : [];
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
    gridValue.responsive.tabletColumns,
    gridValue.responsive.mobileColumns,
  );

  const activeColumns =
    device === "mobile" ? mobile : device === "tablet" ? tablet : desktopColumns;

  const spacingBox = getSpacingBoxStyle(gridValue.layout.padding, gridValue.layout.margin, device);
  const columnGap = String(gridValue.style.columnGap || gridValue.style.gap || "16px");
  const rowGap = String(gridValue.style.rowGap || gridValue.style.gap || "16px");
  const alignItems = gridValue.layout.alignment || "stretch";

  const gridClass = `wto-css-grid wto-css-grid-${String(gridValue.id).replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const desktopTemplate = buildCssGridTemplateColumns(columns, desktopColumns, gridValue.variant);
  const activeTemplate =
    activeColumns === desktopColumns
      ? desktopTemplate
      : `repeat(${Math.max(1, activeColumns)}, minmax(0, 1fr))`;

  function renderChild(child: { id: string; type: string; data?: Record<string, unknown> }, columnId: string) {
    const childData = getChildWidgetData(child as any);
    const childInstance = createWidgetInstance(child.type, {
      id: `${gridValue.id}-${child.id}`,
      content: childData.content,
      style: childData.style,
      layout: childData.layout,
      responsive: childData.responsive,
      animation: childData.animation,
      advanced: childData.advanced,
      variant: childData.variant,
    } as Partial<WidgetData>);
    const registration = getWidgetRegistration(child.type);
    const Component = registration?.component;

    return (
      <div
        key={child.id}
        className="wto-grid-item"
        data-container-parent-widget-id={gridValue.id}
        data-container-child-id={child.id}
        data-wto-parent-widget-id={gridValue.id}
        data-wto-child-id={child.id}
        data-wto-widget-element-key={child.id}
        data-wto-widget-element-type={child.type}
        data-grid-column-id={columnId}
        data-grid-item="1"
        style={{ minWidth: 0, width: "100%", maxWidth: "none", boxSizing: "border-box" }}
        onClick={(event) => {
          event.stopPropagation();
          select({
            kind: "widget",
            sectionId: null,
            widgetId: gridValue.id,
            parentWidgetId: gridValue.id,
            childId: child.id,
            elementKey: child.id,
            elementType: child.type,
            columnId,
            index: null,
          } as any);
        }}
      >
        {Component ? <Component data={childInstance as WidgetData} /> : null}
      </div>
    );
  }

  return (
    <BaseWidget
      data={gridValue}
      widgetType="grid"
      title="Grid"
      variantLabel={gridValue.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-visible"
    >
      <style>{`
        .${gridClass} {
          display: grid;
          width: 100%;
          max-width: 100%;
          box-sizing: border-box;
          grid-template-columns: ${activeTemplate};
          column-gap: ${columnGap};
          row-gap: ${rowGap};
          align-items: ${alignItems};
        }
        .${gridClass} > .wto-grid-column,
        .${gridClass} .wto-grid-item {
          min-width: 0;
          width: 100%;
          max-width: none;
          box-sizing: border-box;
          flex: none;
        }
      `}</style>
      <div
        id={gridValue.advanced.id || undefined}
        className={[
          gridClass,
          gridValue.advanced.className ?? "",
        ]
          .filter(Boolean)
          .join(" ")}
        data-widget="grid"
        data-grid-columns-count={desktopColumns}
        style={{
          padding: spacingBox.padding ?? "16px",
          margin: spacingBox.margin ?? "0px",
          backgroundColor: gridValue.style.backgroundColor ?? "transparent",
          border: gridValue.style.border ?? "1px solid #e2e8f0",
          borderRadius: gridValue.style.borderRadius ?? "0.75rem",
          boxShadow: gridValue.style.shadow ?? "none",
          width: "100%",
          maxWidth: "100%",
          boxSizing: "border-box",
          display: "grid",
          gridTemplateColumns: activeTemplate,
          columnGap,
          rowGap,
          alignItems,
        }}
      >
        {columns.map((column) => (
          <div
            key={column.id}
            className="wto-grid-column"
            data-grid-column-id={column.id}
            data-grid-column-wrapper="1"
            style={{ minWidth: 0, width: "100%", maxWidth: "none", boxSizing: "border-box" }}
          >
            <div
              className="relative h-full min-h-[60px] rounded-md text-sm text-slate-400"
              style={{ minWidth: 0, width: "100%", maxWidth: "none", boxSizing: "border-box" }}
            >
              <div className="builder-editor-only absolute inset-0 rounded-md border border-dashed border-slate-200/80 bg-slate-50/40 pointer-events-none" />
              <div className="relative z-10 flex flex-col gap-2" style={{ minWidth: 0, width: "100%" }}>
                {column.children?.length ? (
                  column.children.map((child) => renderChild(child as any, column.id))
                ) : (
                  <span className="builder-editor-only px-2 py-3">Drop widgets here</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </BaseWidget>
  );
}
