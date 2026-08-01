import { BaseWidget } from "../BaseWidget";
import { defaultGridWidgetData, getColumnBootstrapClass, isGridWidgetData } from "./GridTypes";
import type { WidgetData } from "../widgetRegistry";
import { createWidgetInstance, getWidgetRegistration } from "../widgetRegistry";
import { getChildWidgetData } from "../Container/ContainerTypes";
import { useBuilder } from "@/lib/builder/store";

export interface GridProps {
  data: WidgetData;
}

export function Grid({ data = defaultGridWidgetData }: GridProps) {
  const gridValue = isGridWidgetData(data) ? data : defaultGridWidgetData;
  const visible = gridValue.advanced.visibility ?? true;
  if (!visible) return null;

  const columnCount = Math.max(1, Math.min(6, Number(gridValue.layout.columns ?? gridValue.content.columns?.length ?? 1)));
  const columns = (Array.isArray(gridValue.content.columns) && gridValue.content.columns.length ? gridValue.content.columns : Array.from({ length: columnCount }, () => ({ id: `column-${Math.random().toString(36).slice(2, 8)}`, span: 12, children: [] }))) as Array<{ id: string; span: number; children?: Array<{ id: string; type: string; data?: Record<string, unknown> }> }>;
  const select = useBuilder((s) => s.selectElement);
  const stackOnMobile = gridValue.responsive.stackOnMobile ?? true;
  const tabletColumns = Math.max(1, Math.min(6, Number(gridValue.responsive.tabletColumns ?? Math.min(2, columnCount || 1))));
  const mobileColumns = Math.max(1, Math.min(6, Number(gridValue.responsive.mobileColumns ?? 1)));
  const useBootstrapColumns = columnCount <= 4;
  const containerStyle = {
    padding: gridValue.layout.padding ?? "1rem",
    margin: gridValue.layout.margin ?? "0rem",
    backgroundColor: gridValue.style.backgroundColor ?? "transparent",
    border: gridValue.style.border ?? "1px solid #e2e8f0",
    borderRadius: gridValue.style.borderRadius ?? "0.75rem",
    boxShadow: gridValue.style.shadow ?? "none",
  } as const;

  function renderChild(child: { id: string; type: string; data?: Record<string, unknown> }, columnId: string) {
    const childData = getChildWidgetData(child);
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
        data-container-parent-widget-id={gridValue.id}
        data-container-child-id={child.id}
        data-wto-parent-widget-id={gridValue.id}
        data-wto-child-id={child.id}
        data-wto-widget-element-key={child.id}
        data-wto-widget-element-type="container"
        data-grid-column-id={columnId}
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
            index: null,
          });
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
      contentClassName="overflow-hidden"
    >
      <div
        id={gridValue.advanced.id || undefined}
        className={[gridValue.advanced.className ?? ""].filter(Boolean).join(" ")}
        style={containerStyle}
      >
        {columns.length === 0 ? (
          <div className="builder-editor-only text-sm text-slate-400">Drop widgets here</div>
        ) : useBootstrapColumns ? (
          <div className={`row ${stackOnMobile ? "flex-column flex-md-row" : "flex-column"}`}>
            {columns.map((column) => (
              <div key={column.id} className={getColumnBootstrapClass(column.span, stackOnMobile)}>
                <div className="relative h-full min-h-[60px] rounded-md p-3 text-sm text-slate-400">
                  <div className="builder-editor-only absolute inset-0 rounded-md border border-dashed border-slate-200 bg-slate-50/70" />
                  <div className="relative z-10">
                    {column.children?.length ? column.children.map((child) => renderChild(child, column.id)) : <span className="builder-editor-only">Empty column</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <style>{`
              .wto-grid-${gridValue.id} {
                display: grid;
                gap: ${gridValue.style.gap ?? "1rem"};
                grid-template-columns: repeat(${Math.max(1, columns.length)}, minmax(0, 1fr));
              }
              @media (max-width: 991px) {
                .wto-grid-${gridValue.id} {
                  grid-template-columns: repeat(${Math.max(1, tabletColumns)}, minmax(0, 1fr)) !important;
                }
              }
              @media (max-width: 767px) {
                .wto-grid-${gridValue.id} {
                  grid-template-columns: repeat(${Math.max(1, mobileColumns)}, minmax(0, 1fr)) !important;
                }
              }
            `}</style>
            <div className={`wto-grid-${gridValue.id}`}>
              {columns.map((column) => (
                <div key={column.id} className="min-w-0">
                  <div className="relative h-full min-h-[60px] rounded-md p-3 text-sm text-slate-400">
                    <div className="builder-editor-only absolute inset-0 rounded-md border border-dashed border-slate-200 bg-slate-50/70" />
                    <div className="relative z-10">
                      {column.children?.length ? column.children.map((child) => renderChild(child, column.id)) : <span className="builder-editor-only">Empty column</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </BaseWidget>
  );
}
