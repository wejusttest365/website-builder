import { useMemo } from "react";
import { defaultContainerWidgetData, isContainerWidgetData } from "./ContainerTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { TextControl, NumberControl, SpacingControl } from "@/components/builder/property-controls";
import { BackgroundProperties } from "../BackgroundProperties";
import { SectionWidthProperties } from "../BaseWidget";

export interface ContainerPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

function backgroundSummary(style: Record<string, unknown>) {
  const type = String(style?.type ?? "none");
  if (type === "none" || !type) return "None";
  if (type === "color") return String(style.color || "Color");
  if (type === "gradient") return "Gradient";
  if (type === "image") return "Image";
  return type;
}

export function ContainerProperties({ value = defaultContainerWidgetData, onChange, onClose }: ContainerPropertiesProps) {
  const containerValue = useMemo(() => (isContainerWidgetData(value) ? value : defaultContainerWidgetData), [value]);
  const updateContent = (patch: Partial<typeof containerValue.content>) => onChange({ ...containerValue, content: { ...containerValue.content, ...patch } });
  const updateLayout = (patch: Partial<typeof containerValue.layout>) => onChange({ ...containerValue, layout: { ...containerValue.layout, ...patch } });
  const updateStyle = (patch: Partial<typeof containerValue.style>) => onChange({ ...containerValue, style: { ...containerValue.style, ...patch } });
  const children = Array.isArray(containerValue.content.children) ? containerValue.content.children : [];

  return (
    <PropertyPanel
      title="Container"
      onClose={onClose}
      content={
        <div className="space-y-2.5">
          <TextControl label="Title" value={containerValue.content.title ?? ""} onChange={(next) => updateContent({ title: next })} />
          <TextControl label="Description" value={containerValue.content.description ?? ""} onChange={(next) => updateContent({ description: next })} />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[12px] text-slate-600">
            Children: {children.length}. Select a child on the canvas to edit it.
          </div>
        </div>
      }
      background={
        <BackgroundProperties
          background={containerValue.style as any}
          onChange={(next) => updateStyle(next as any)}
        />
      }
      backgroundSummary={backgroundSummary(containerValue.style as any)}
      layout={
        <div className="space-y-2.5">
          <SectionWidthProperties layout={containerValue.layout} onChange={(patch) => updateLayout(patch as any)} />
          <TextControl label="Gap" value={String(containerValue.layout.gap ?? "1rem")} onChange={(next) => updateLayout({ gap: next })} />
          <NumberControl label="Columns" value={containerValue.layout.columns ?? 1} min={1} max={4} onChange={(next) => updateLayout({ columns: next })} />
          <SpacingControl label="Padding" value={(containerValue.layout as any).padding ?? containerValue.style.padding} onChange={(next) => updateLayout({ padding: next as any })} />
          <SpacingControl label="Margin" value={(containerValue.layout as any).margin ?? containerValue.style.margin} onChange={(next) => updateLayout({ margin: next as any })} />
        </div>
      }
    />
  );
}
