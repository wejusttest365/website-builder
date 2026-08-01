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
  };
  layout: {
    containerWidth?: string;
    padding?: string | Record<string, unknown>;
    margin?: string | Record<string, unknown>;
  };
  responsive: {
    stackOnMobile?: boolean;
    tabletColumns?: number;
    mobileColumns?: number;
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
  if (count <= 1) return [createGridColumn(12)];
  if (count === 2) return [createGridColumn(6), createGridColumn(6)];
  if (count === 3) return [createGridColumn(4), createGridColumn(4), createGridColumn(4)];
  if (count === 4) return [createGridColumn(3), createGridColumn(3), createGridColumn(3), createGridColumn(3)];
  return Array.from({ length: count }, () => createGridColumn(12));
}

export function getGridVariantForCount(count: number): string {
  if (count <= 1) return "One column";
  if (count === 2) return "Two equal columns";
  if (count === 3) return "Three equal columns";
  if (count === 4) return "Four equal columns";
  if (count === 5) return "Five equal columns";
  return "Six equal columns";
}

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
  variant: "Two equal columns",
  content: {
    columns: [createGridColumn(6), createGridColumn(6)],
  },
  style: {
    backgroundColor: "transparent",
    border: "1px solid #e2e8f0",
    borderRadius: "0.75rem",
    shadow: "none",
    gap: "1rem",
  },
  layout: {
    containerWidth: "container",
    padding: "1rem",
    margin: "0rem",
  },
  responsive: {
    stackOnMobile: true,
    tabletColumns: 2,
    mobileColumns: 1,
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
