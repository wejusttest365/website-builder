import { createGridColumn, defaultGridWidgetData, isGridWidgetData } from "./GridTypes";
import type { WidgetData } from "../widgetRegistry";
import { PropertyPanel } from "@/components/builder/property-panel/PropertyPanel";
import { useBuilder } from "@/lib/builder/store";

export interface GridPropertiesProps {
  value: WidgetData;
  onChange: (nextValue: WidgetData) => void;
}

export function GridProperties({ value = defaultGridWidgetData, onChange }: GridPropertiesProps) {
  const gridValue = isGridWidgetData(value) ? value : defaultGridWidgetData;
  const columns = Array.isArray(gridValue.content.columns) ? gridValue.content.columns : [];
  const updateGridColumns = useBuilder((s) => s.updateGridColumns);
  const columnCount = Math.max(1, Math.min(6, Number(gridValue.layout.columns ?? (columns.length || 1))));
  const updateContent = (patch: Partial<typeof gridValue.content>) => onChange({ ...gridValue, content: { ...gridValue.content, ...patch } });
  const updateResponsive = (patch: Partial<typeof gridValue.responsive>) => onChange({ ...gridValue, responsive: { ...gridValue.responsive, ...patch } });
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

  const fieldOptions = Array.from({ length: 6 }, (_, index) => ({
    label: `${index + 1} column${index + 1 > 1 ? "s" : ""}`,
    value: String(index + 1),
  }));

  const renderSelect = (label: string, value: string, onChange: (value: string) => void) => (
    <div className="space-y-1">
      <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">{label}</div>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-9 w-full rounded-[8px] border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-100"
      >
        {fieldOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <PropertyPanel
      title="Grid"
      children={
        <div className="space-y-3 px-0 py-0">
          <div className="rounded-[8px] border border-slate-200 bg-white p-3 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Grid</div>
            {renderSelect("Columns", String(columnCount || 1), (next) => setColumnCount(Number(next)))}
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-3 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Responsive</div>
            <div className="space-y-3">
              {renderSelect("Desktop", String(columnCount || 1), (next) => setColumnCount(Number(next)))}
              {renderSelect("Tablet", String(gridValue.responsive.tabletColumns ?? 2), (next) => updateResponsive({ tabletColumns: Number(next) }))}
              {renderSelect("Mobile", String(gridValue.responsive.mobileColumns ?? 1), (next) => updateResponsive({ mobileColumns: Number(next) }))}
            </div>
          </div>

          <div className="rounded-[8px] border border-slate-200 bg-white p-3 space-y-3">
            <div className="text-[10px] uppercase tracking-[0.2em] font-semibold text-slate-500">Column order</div>
            <div className="space-y-2">
              {columns.map((column, index) => (
                <div key={column.id} className="flex items-center justify-between rounded-[8px] border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
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
          </div>
        </div>
      }
    />
  );
}
