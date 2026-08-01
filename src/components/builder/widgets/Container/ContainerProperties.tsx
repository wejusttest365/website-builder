import { useMemo } from "react";
import { buildContainerChildData, createContainerChildItem, defaultContainerWidgetData, isContainerWidgetData } from "./ContainerTypes";
import type { WidgetData } from "../widgetRegistry";
import { SectionWidthProperties } from "../BaseWidget";

export interface ContainerPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function ContainerProperties({ value = defaultContainerWidgetData, onChange }: ContainerPropertiesProps) {
  const containerValue = useMemo(() => (isContainerWidgetData(value) ? value : defaultContainerWidgetData), [value]);
  const updateContent = (patch: Partial<typeof containerValue.content>) => onChange({ ...containerValue, content: { ...containerValue.content, ...patch } });
  const updateLayout = (patch: Partial<typeof containerValue.layout>) => onChange({ ...containerValue, layout: { ...containerValue.layout, ...patch } });
  const updateStyle = (patch: Partial<typeof containerValue.style>) => onChange({ ...containerValue, style: { ...containerValue.style, ...patch } });
  const children = Array.isArray(containerValue.content.children) ? containerValue.content.children : [];
  const updateChildren = (nextChildren: typeof children) => updateContent({ children: nextChildren as typeof containerValue.content.children });
  const addChild = (type: "heading" | "text" | "button" | "image") => updateChildren([...children, createContainerChildItem(type)]);
  const removeChild = (childId: string) => updateChildren(children.filter((child) => child.id !== childId));
  const updateChildWidget = (childId: string, nextValue: WidgetData) => {
    const nextChildren = children.map((child) => (child.id === childId ? { ...child, data: buildContainerChildData(nextValue) } : child));
    updateChildren(nextChildren);
  };

  return (
    <div className="space-y-4 p-2 text-sm">
      <div className="rounded-lg border border-input bg-background p-3">
        <div className="mb-2 font-semibold">Container</div>
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Title</span>
          <input className="rounded border border-input bg-background px-2 py-2" value={containerValue.content.title ?? ""} onChange={(e) => updateContent({ title: e.target.value })} />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Description</span>
          <textarea className="min-h-20 rounded border border-input bg-background px-2 py-2" value={containerValue.content.description ?? ""} onChange={(e) => updateContent({ description: e.target.value })} />
        </label>
      </div>
      <div className="rounded-lg border border-input bg-background p-3">
        <div className="mb-2 font-semibold">Layout</div>
        <div className="mb-4">
          <SectionWidthProperties layout={containerValue.layout} onChange={(patch) => updateLayout(patch)} />
        </div>
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Gap</span>
          <input className="rounded border border-input bg-background px-2 py-2" value={containerValue.layout.gap ?? "1rem"} onChange={(e) => updateLayout({ gap: e.target.value })} />
        </label>
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Columns</span>
          <input type="number" min={1} max={4} className="rounded border border-input bg-background px-2 py-2" value={containerValue.layout.columns ?? 1} onChange={(e) => updateLayout({ columns: Number(e.target.value) })} />
        </label>
      </div>
      <div className="rounded-lg border border-input bg-background p-3">
        <div className="mb-2 font-semibold">Styling</div>
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Padding</span>
          <input className="rounded border border-input bg-background px-2 py-2" value={containerValue.style.padding ?? "1rem"} onChange={(e) => updateStyle({ padding: e.target.value })} />
        </label>
        <label className="mb-2 flex flex-col gap-1">
          <span className="text-xs uppercase tracking-wide text-muted-foreground">Background</span>
          <input className="rounded border border-input bg-background px-2 py-2" value={containerValue.style.backgroundColor ?? ""} onChange={(e) => updateStyle({ backgroundColor: e.target.value })} />
        </label>
      </div>
    </div>
  );
}
