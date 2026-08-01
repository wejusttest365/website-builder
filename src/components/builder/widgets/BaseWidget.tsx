import { useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { useBuilder } from "@/lib/builder/store";
import { SelectControl } from "@/components/builder/property-panel/controls/SelectControl";
import { TextControl } from "@/components/builder/property-panel/controls/TextControl";
import type { WidgetData } from "./widgetRegistry";

export type SectionWidthMode = "container" | "fluid" | "custom";
export interface SectionWidthLayout {
  containerMode?: SectionWidthMode;
  maxWidth?: string;
  horizontalPadding?: string;
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

function resolveSectionWidthLayout(layout?: Record<string, unknown>): Required<SectionWidthLayout> {
  const raw = layout ?? {};
  const containerMode = raw.containerMode === "fluid" || raw.containerMode === "custom" ? (raw.containerMode as SectionWidthMode) : "container";
  return {
    containerMode,
    maxWidth: String(raw.maxWidth ?? "1200px"),
    horizontalPadding: String(raw.horizontalPadding ?? "24px"),
  };
}

export function getSectionWidthStyle(layout?: Record<string, unknown>): CSSProperties {
  const { containerMode, maxWidth, horizontalPadding } = resolveSectionWidthLayout(layout);
  const style: CSSProperties = {
    width: "100%",
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    boxSizing: "border-box",
  };

  if (containerMode === "container" || containerMode === "custom") {
    style.maxWidth = maxWidth;
    style.marginLeft = "auto";
    style.marginRight = "auto";
  }

  return style;
}

export function renderSectionWidthBootstrapWrapper(layout: Record<string, unknown> | undefined, html: string): string {
  const { containerMode, maxWidth, horizontalPadding } = resolveSectionWidthLayout(layout);
  const styles = [
    "width:100%;",
    `padding-left:${escapeHtml(horizontalPadding)};`,
    `padding-right:${escapeHtml(horizontalPadding)};`,
    "box-sizing:border-box;",
  ];

  if (containerMode === "container" || containerMode === "custom") {
    styles.push(`max-width:${escapeHtml(maxWidth)};`, "margin-left:auto;", "margin-right:auto;");
  }

  return `<div style="${styles.join("")}">${html}</div>`;
}

export function SectionWidthProperties({
  layout,
  onChange,
}: {
  layout?: Record<string, unknown>;
  onChange: (patch: Partial<SectionWidthLayout>) => void;
}) {
  const { containerMode, maxWidth, horizontalPadding } = resolveSectionWidthLayout(layout);

  return (
    <div className="space-y-2">
      <SelectControl
        label="Section Width"
        value={containerMode}
        options={[
          { label: "Container", value: "container" },
          { label: "Fluid", value: "fluid" },
          { label: "Custom", value: "custom" },
        ]}
        onChange={(next) => onChange({ containerMode: next as SectionWidthMode })}
      />
      {containerMode === "custom" ? (
        <TextControl label="Max width" value={maxWidth} onChange={(next) => onChange({ maxWidth: next })} />
      ) : null}
      <TextControl label="Horizontal padding" value={horizontalPadding} onChange={(next) => onChange({ horizontalPadding: next })} />
    </div>
  );
}

export interface BaseWidgetProps {
  data: WidgetData;
  widgetType: string;
  title: string;
  variantLabel?: string;
  wrapperClassName?: string;
  contentClassName?: string;
  toolbar?: ReactNode;
  children: ReactNode;
}

function getResponsiveClasses(responsive?: Record<string, unknown>) {
  const classes: string[] = [];
  if (!responsive) return "";

  if (responsive.hideOnMobile) {
    classes.push("hidden sm:block");
  }
  if (responsive.hideOnTablet) {
    classes.push("hidden lg:block");
  }
  if (responsive.hideOnDesktop) {
    classes.push("hidden xl:block");
  }

  return classes.join(" ");
}

export function BaseWidget({
  data,
  widgetType,
  title,
  variantLabel,
  wrapperClassName = "",
  contentClassName = "",
  toolbar,
  children,
}: BaseWidgetProps) {
  const selectedWidgetId = useBuilder((s) => s.selectedWidgetId);
  const [hovered, setHovered] = useState(false);
  const isSelected = data.id === selectedWidgetId;
  const responsiveClasses = useMemo(() => getResponsiveClasses(data.responsive as Record<string, unknown> | undefined), [data.responsive]);

  return (
    <div
      className={`relative ${responsiveClasses} ${wrapperClassName}`.trim()}
      data-widget={widgetType}
      data-widget-id={data.id}
      data-widget-variant={data.variant}
      data-widget-selected={isSelected ? "1" : "0"}
      data-wto-widget-root="1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className={`relative ${contentClassName}`.trim()}
        style={getSectionWidthStyle(data.layout as Record<string, unknown> | undefined)}
      >
        <div
          className={`pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-700 shadow-sm transition-opacity duration-200 ${
            isSelected || hovered ? "opacity-100" : "opacity-0"
          }`}
        >
          <span>{title}</span>
          {variantLabel ? (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
              {variantLabel}
            </span>
          ) : null}
          {isSelected ? (
            <span className="rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
              Selected
            </span>
          ) : null}
        </div>

        {toolbar || children}
      </div>
    </div>
  );
}
