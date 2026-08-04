import {
  defaultGridWidgetData,
  isGridWidgetData,
  resolveGridColumnCount,
} from "./GridTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { useBuilder } from "@/lib/builder/store";
import { SelectControl, SpacingControl, TextControl } from "@/components/builder/property-controls";
import { BackgroundProperties } from "../BackgroundProperties";
import { SectionWidthProperties } from "../BaseWidget";

export interface GridPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
  onClose?: () => void;
}

function backgroundSummary(style: Record<string, unknown>) {
  const type = String(style?.type ?? "none");
  if (type === "none" || !type) {
    if (style?.backgroundColor && String(style.backgroundColor) !== "transparent") {
      return String(style.backgroundColor);
    }
    return "None";
  }
  if (type === "color") return String(style.color || "Color");
  if (type === "gradient") return "Gradient";
  if (type === "image") return "Image";
  return type;
}

const COLUMN_OPTIONS = Array.from({ length: 6 }, (_, index) => ({
  label: `${index + 1} column${index + 1 > 1 ? "s" : ""}`,
  value: String(index + 1),
}));

const INHERIT_COLUMN_OPTIONS = [{ label: "Inherit", value: "inherit" }, ...COLUMN_OPTIONS];

const ALIGN_OPTIONS = [
  { label: "Stretch", value: "stretch" },
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
];

export function GridProperties({ value = defaultGridWidgetData, onChange, onClose }: GridPropertiesProps) {
  const gridValue = isGridWidgetData(value) ? value : defaultGridWidgetData;
  const columns = Array.isArray(gridValue.content.columns) ? gridValue.content.columns : [];
  const updateGridColumns = useBuilder((s) => s.updateGridColumns);
  const columnCount = resolveGridColumnCount(gridValue);

  const updateLayout = (patch: Partial<typeof gridValue.layout>) =>
    onChange({ ...gridValue, layout: { ...gridValue.layout, ...patch } });
  const updateStyle = (patch: Partial<typeof gridValue.style>) =>
    onChange({ ...gridValue, style: { ...gridValue.style, ...patch } });
  const updateResponsive = (patch: Partial<typeof gridValue.responsive>) =>
    onChange({ ...gridValue, responsive: { ...gridValue.responsive, ...patch } });
  const updateContent = (patch: Partial<typeof gridValue.content>) =>
    onChange({ ...gridValue, content: { ...gridValue.content, ...patch } });

  const setColumnCount = (count: number) => {
    const safeCount = Math.max(1, Math.min(6, count || 1));
    updateGridColumns(gridValue.id, safeCount);
  };

  const moveColumn = (index: number, direction: -1 | 1) => {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= columns.length) return;
    const nextColumns = [...columns];
    const [target] = nextColumns.splice(index, 1);
    nextColumns.splice(nextIndex, 0, target);
    updateContent({ columns: nextColumns });
  };

  const columnGap = String(gridValue.style.columnGap || gridValue.style.gap || "16px");
  const rowGap = String(gridValue.style.rowGap || gridValue.style.gap || "16px");
  const tabletValue =
    gridValue.responsive.tabletColumns == null || !Number.isFinite(Number(gridValue.responsive.tabletColumns))
      ? "inherit"
      : String(gridValue.responsive.tabletColumns);
  const mobileValue =
    gridValue.responsive.mobileColumns == null || !Number.isFinite(Number(gridValue.responsive.mobileColumns))
      ? "inherit"
      : String(gridValue.responsive.mobileColumns);

  return (
    <PropertyPanel
      title="Grid"
      onClose={onClose}
      content={
        <div className="space-y-2.5">
          <SelectControl
            label="Columns"
            value={String(columnCount)}
            options={COLUMN_OPTIONS}
            onChange={(next) => setColumnCount(Number(next))}
          />
          <div className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-2 text-[12px] text-slate-600">
            {columns.length} column slot{columns.length === 1 ? "" : "s"}. Select a grid item on the canvas to edit child properties.
          </div>
          {columns.length > 1 ? (
            <div className="space-y-2">
              <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Column order</div>
              {columns.map((column, index) => (
                <div
                  key={column.id}
                  className="flex items-center justify-between rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                >
                  <span>Column {index + 1}</span>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => moveColumn(index, -1)}
                      disabled={index === 0}
                    >
                      ↑
                    </button>
                    <button
                      type="button"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-[8px] border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                      onClick={() => moveColumn(index, 1)}
                      disabled={index === columns.length - 1}
                    >
                      ↓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}
        </div>
      }
      background={
        <BackgroundProperties
          background={gridValue.style as any}
          onChange={(next) => updateStyle(next as any)}
        />
      }
      backgroundSummary={backgroundSummary(gridValue.style as any)}
      layout={
        <div className="space-y-2.5">
          <SectionWidthProperties layout={gridValue.layout as any} onChange={(patch) => updateLayout(patch as any)} />
          <SelectControl
            label="Columns"
            value={String(columnCount)}
            options={COLUMN_OPTIONS}
            onChange={(next) => setColumnCount(Number(next))}
          />
          <TextControl
            label="Column gap"
            value={columnGap}
            onChange={(next) => updateStyle({ columnGap: next, gap: next })}
          />
          <TextControl
            label="Row gap"
            value={rowGap}
            onChange={(next) => updateStyle({ rowGap: next })}
          />
          <SelectControl
            label="Align items"
            value={String(gridValue.layout.alignment || "stretch")}
            options={ALIGN_OPTIONS}
            onChange={(next) => updateLayout({ alignment: next as typeof gridValue.layout.alignment })}
          />
          <SpacingControl
            label="Padding"
            value={gridValue.layout.padding as any}
            onChange={(next) => updateLayout({ padding: next as any })}
          />
          <SpacingControl
            label="Margin"
            value={gridValue.layout.margin as any}
            onChange={(next) => updateLayout({ margin: next as any })}
          />
        </div>
      }
      responsive={
        <div className="space-y-2.5">
          <SelectControl
            label="Desktop columns"
            value={String(columnCount)}
            options={COLUMN_OPTIONS}
            onChange={(next) => setColumnCount(Number(next))}
          />
          <SelectControl
            label="Tablet columns"
            value={tabletValue}
            options={INHERIT_COLUMN_OPTIONS}
            onChange={(next) =>
              updateResponsive({ tabletColumns: next === "inherit" ? null : Number(next) })
            }
          />
          <SelectControl
            label="Mobile columns"
            value={mobileValue}
            options={INHERIT_COLUMN_OPTIONS}
            onChange={(next) =>
              updateResponsive({ mobileColumns: next === "inherit" ? null : Number(next) })
            }
          />
        </div>
      }
    />
  );
}
