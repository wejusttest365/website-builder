import React from "react";
import { BaseWidget } from "../BaseWidget";
import type { WidgetData } from "../widgetRegistry";
import { defaultContainerWidgetData, getContainerChildWidgetData, isContainerWidgetData } from "./ContainerTypes";
import { createWidgetInstance, getWidgetRegistration } from "../widgetRegistry";

export interface ContainerProps {
  data: WidgetData;
}

function buildChildPreview(child: { type: string; data?: Record<string, unknown> }) {
  const type = child.type;
  if (type === "heading") {
    const text = String((child.data?.text as string | undefined) ?? "Heading");
    return <h3 className="mb-0 text-lg font-semibold">{text}</h3>;
  }
  if (type === "text") {
    const text = String((child.data?.text as string | undefined) ?? "Text content");
    return <p className="mb-0 text-sm text-slate-600">{text}</p>;
  }
  if (type === "button") {
    const text = String((child.data?.text as string | undefined) ?? "Button");
    return <button className="btn btn-primary btn-sm">{text}</button>;
  }
  if (type === "image") {
    return <div className="rounded border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500">Image</div>;
  }
  return null;
}

export function Container({ data = defaultContainerWidgetData }: ContainerProps) {
  const containerData = isContainerWidgetData(data) ? data : defaultContainerWidgetData;
  const visible = containerData.advanced.visibility ?? true;
  if (!visible) return null;

  const children = Array.isArray(containerData.content.children) ? containerData.content.children : [];
  const layout = containerData.layout;
  const gap = layout.gap ?? "1rem";
  const columns = Math.max(1, Number(layout.columns ?? 1));
  const layoutClass = columns > 1 ? "row g-4" : "d-flex flex-column gap-3";
  const containerStyle: React.CSSProperties = {
    backgroundColor: containerData.style.backgroundColor as string | undefined,
    padding: containerData.style.padding as string | undefined,
    margin: containerData.style.margin as string | undefined,
    borderRadius: containerData.style.borderRadius as string | undefined,
    border: `${String(containerData.style.borderWidth ?? "0px")} solid ${String(containerData.style.borderColor ?? "transparent")}`,
    boxShadow: containerData.style.shadow === "none" ? undefined : (containerData.style.shadow as string | undefined),
  };

  return (
    <BaseWidget
      data={containerData}
      widgetType="container"
      title="Container"
      variantLabel={containerData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <div className={`rounded-2xl border border-transparent ${layoutClass}`} style={containerStyle} data-container-widget-id={containerData.id} data-container-drop-root="1">
        {children.length === 0 ? (
          <div className="rounded border border-dashed border-slate-300 bg-slate-50/70 p-4 text-sm text-slate-500">
            Add content widgets to this container.
          </div>
        ) : (
          children.map((child, childIndex) => {
            const childData = getContainerChildWidgetData(child);
            const childInstance = createWidgetInstance(child.type, {
              id: `${containerData.id}-${child.id}`,
              content: childData.content,
              style: childData.style,
              layout: childData.layout,
              responsive: childData.responsive,
              animation: childData.animation,
              advanced: childData.advanced,
              variant: childData.variant ?? (child.type === "button" ? "Filled" : undefined),
            } as Partial<WidgetData>);
            const registration = getWidgetRegistration(child.type);
            const Component = registration?.component;
            return (
              <div key={child.id} className={columns > 1 ? "col-12 col-md-6" : "w-100"} data-container-parent-widget-id={containerData.id} data-container-child-id={child.id} data-container-child-index={childIndex} data-container-child-wrapper="1" data-wto-widget-element-key={child.id} data-wto-widget-element-type="container">
                {Component ? <Component data={childInstance as WidgetData} /> : buildChildPreview(child)}
              </div>
            );
          })
        )}
      </div>
    </BaseWidget>
  );
}
