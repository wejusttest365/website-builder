import type { WidgetData, WidgetInstance } from "../widgetRegistry";

export type GridColumn = {
  id: string;
  span: number;
  children: WidgetInstance[];
};

export interface GridChildItem {
  id: string;
  type: string;
  data?: Record<string, unknown>;
}

export interface GridWidgetData extends WidgetData {
  type: "grid";
  variant: string;
  content: {
    columns: GridColumn[];
  };
  style: {
    backgroundColor?: string;
    border?: string;
    borderRadius?: string;
    shadow?: string;
    gap?: string;
    columnGap?: string;
    rowGap?: string;
  };
  layout: {
    containerWidth?: string;
    columns?: number;
    alignment?: "start" | "center" | "end" | "stretch";
    padding?: string | Record<string, unknown>;
    margin?: string | Record<string, unknown>;
  };
  responsive: {
    stackOnMobile?: boolean;
    tabletColumns?: number | null;
    mobileColumns?: number | null;
  };
  animation: Record<string, unknown>;
  advanced: {
    id?: string;
    className?: string;
    visibility?: boolean;
  };
}

export const gridVariantDefinitions = [
  { label: "One column", value: "One column", columns: [12] },
  { label: "Two equal columns", value: "Two equal columns", columns: [6, 6] },
  { label: "Three equal columns", value: "Three equal columns", columns: [4, 4, 4] },
  { label: "Four equal columns", value: "Four equal columns", columns: [3, 3, 3, 3] },
  { label: "Five equal columns", value: "Five equal columns", columns: [12, 12, 12, 12, 12] },
  { label: "Six equal columns", value: "Six equal columns", columns: [12, 12, 12, 12, 12, 12] },
  { label: "Wide left", value: "Wide left", columns: [8, 4] },
  { label: "Wide right", value: "Wide right", columns: [4, 8] },
  { label: "Sidebar left", value: "Sidebar left", columns: [3, 9] },
  { label: "Sidebar right", value: "Sidebar right", columns: [9, 3] },
] as const;

export function getEqualColumnSpan(count: number): number {
  const safe = Math.max(1, Math.min(6, Math.round(count) || 1));
  if (safe <= 1) return 12;
  if (safe === 2) return 6;
  if (safe === 3) return 4;
  if (safe === 4) return 3;
  return 12;
}

export function createGridColumn(span: number, id?: string): GridColumn {
  return {
    id: id ?? `column-${Math.random().toString(36).slice(2, 8)}`,
    span,
    children: [],
  };
}

export function buildGridColumns(variant: string): GridColumn[] {
  const definition = gridVariantDefinitions.find((item) => item.value === variant);
  if (!definition) return [createGridColumn(12)];
  return definition.columns.map((span) => createGridColumn(span));
}

export function buildGridColumnsForCount(count: number): GridColumn[] {
  const safe = Math.max(1, Math.min(6, Math.round(count) || 1));
  const span = getEqualColumnSpan(safe);
  return Array.from({ length: safe }, () => createGridColumn(span));
}

export function getGridVariantForCount(count: number): string {
  if (count <= 1) return "One column";
  if (count === 2) return "Two equal columns";
  if (count === 3) return "Three equal columns";
  if (count === 4) return "Four equal columns";
  if (count === 5) return "Five equal columns";
  return "Six equal columns";
}

export function resolveGridColumnCount(grid: Pick<GridWidgetData, "layout" | "content" | "variant">): number {
  const fromLayout = Number(grid.layout?.columns);
  if (Number.isFinite(fromLayout) && fromLayout > 0) {
    return Math.max(1, Math.min(6, Math.round(fromLayout)));
  }
  const fromContent = Array.isArray(grid.content?.columns) ? grid.content.columns.length : 0;
  if (fromContent > 0) return Math.max(1, Math.min(6, fromContent));
  const fromVariant = buildGridColumns(String(grid.variant || "One column")).length;
  return Math.max(1, Math.min(6, fromVariant || 1));
}

export function resolveResponsiveGridColumns(
  desktopColumns: number,
  tabletColumns?: number | null,
  mobileColumns?: number | null,
): { desktop: number; tablet: number; mobile: number } {
  const desktop = Math.max(1, Math.min(6, desktopColumns || 1));
  const tabletFallback = desktop >= 3 ? 2 : desktop;
  const tablet =
    tabletColumns == null || !Number.isFinite(Number(tabletColumns))
      ? tabletFallback
      : Math.max(1, Math.min(6, Math.round(Number(tabletColumns))));
  const mobile =
    mobileColumns == null || !Number.isFinite(Number(mobileColumns))
      ? 1
      : Math.max(1, Math.min(6, Math.round(Number(mobileColumns))));
  return { desktop, tablet, mobile };
}

export function buildCssGridTemplateColumns(
  columns: Array<{ span?: number }>,
  columnCount?: number,
  variant?: string,
): string {
  const count = Math.max(1, columnCount ?? columns.length ?? 1);
  const trackCount = Math.max(1, columns.length || count);
  const unequalVariants = new Set(["Wide left", "Wide right", "Sidebar left", "Sidebar right"]);
  const forceEqual = !variant || !unequalVariants.has(String(variant));
  if (forceEqual || !columns.length) {
    return `repeat(${trackCount}, minmax(0, 1fr))`;
  }
  const spans = columns.map((column) => {
    const span = Number(column.span);
    return Number.isFinite(span) && span > 0 ? span : getEqualColumnSpan(trackCount);
  });
  const allEqual = spans.every((span) => span === spans[0]);
  if (allEqual) {
    return `repeat(${trackCount}, minmax(0, 1fr))`;
  }
  return spans.map((span) => `minmax(0, ${span}fr)`).join(" ");
}

/** @deprecated Prefer CSS Grid; kept for legacy callers. */
export function getColumnBootstrapClass(span: number, stackOnMobile = true): string {
  const desktopClass = (() => {
    switch (span) {
      case 6:
        return "col-md-6";
      case 4:
        return "col-md-4";
      case 3:
        return "col-md-3";
      case 8:
        return "col-md-8";
      case 9:
        return "col-md-9";
      case 12:
      default:
        return "col-12";
    }
  })();

  if (!stackOnMobile) return desktopClass;
  return desktopClass === "col-12" ? "col-12" : `col-12 ${desktopClass}`;
}

export const defaultGridWidgetData: GridWidgetData = {
  id: "grid-default",
  type: "grid",
  variant: "One column",
  content: {
    columns: buildGridColumns("One column"),
  },
  style: {
    backgroundColor: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    shadow: "none",
    gap: "16px",
    columnGap: "16px",
    rowGap: "16px",
  },
  layout: {
    containerWidth: "container",
    columns: 1,
    alignment: "stretch",
    padding: "16px",
    margin: "0px",
  },
  responsive: {
    stackOnMobile: true,
    tabletColumns: null,
    mobileColumns: null,
  },
  animation: {},
  advanced: {
    id: "",
    className: "",
    visibility: true,
  },
};

export function isGridWidgetData(value: WidgetData): value is GridWidgetData {
  return value?.type === "grid";
}

export function syncGridInstanceToVariant(instance: WidgetInstance<WidgetData>, variant: string): WidgetInstance<WidgetData> {
  const columns = buildGridColumns(variant);
  return {
    ...instance,
    variant,
    content: {
      ...(instance.content as Record<string, unknown>),
      columns,
    },
    layout: {
      ...(instance.layout as Record<string, unknown>),
      columns: columns.length,
    },
  } as WidgetInstance<WidgetData>;
}
