import { useMemo, type CSSProperties, type ReactNode } from "react";
import { useBuilder } from "@/lib/builder/store";
import type { WidgetData } from "./widgetRegistry";
import { WidgetSection, type WidgetSectionTag } from "./WidgetSection";
import { getWidgetBackgroundStyle } from "./BackgroundStyle";
import { SelectControl, TextControl } from "@/components/builder/property-controls";
import { getWidgetSelectionLabel } from "./widgetSelectionLabels";

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
  const containerMode = raw.containerMode === "container" || raw.containerMode === "custom" ? (raw.containerMode as SectionWidthMode) : "fluid";
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

export function renderSectionWidthBootstrapWrapper(layout: Record<string, unknown> | undefined, outerStyleCss: string | undefined, html: string): string {
  const { containerMode, maxWidth, horizontalPadding } = resolveSectionWidthLayout(layout);

  const outerStyles = [
    "width:100%;",
    "box-sizing:border-box;",
    outerStyleCss ? outerStyleCss : "",
  ]
    .filter(Boolean)
    .join(" ");

  const innerClass = containerMode === "fluid" ? "container-fluid" : "container";
  const innerStyles = [
    "width:100%;",
    "box-sizing:border-box;",
    `padding-left:${escapeHtml(horizontalPadding)};`,
    `padding-right:${escapeHtml(horizontalPadding)};`,
  ];

  if (containerMode === "container" || containerMode === "custom") {
    innerStyles.push(`max-width:${escapeHtml(maxWidth)};`, "margin-left:auto;", "margin-right:auto;");
  }

  return `<div style="${outerStyles}"><div class="${innerClass}" style="${innerStyles.join("")}">${html}</div></div>`;
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
  disableSectionWidthStyle?: boolean;
  as?: WidgetSectionTag;
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
  wrapperClassName = "",
  contentClassName = "",
  disableSectionWidthStyle = false,
  as = "section",
  toolbar,
  children,
}: BaseWidgetProps) {
  const selectedWidgetId = useBuilder((s) => s.selectedWidgetId);
  const selectedElement = useBuilder((s) => s.selectedElement);

  const childSelected =
    Boolean(selectedElement?.childId || selectedElement?.elementKey) &&
    (selectedElement?.parentWidgetId === data.id || selectedElement?.widgetId === data.id);
  const isSelected = data.id === selectedWidgetId && !childSelected;
  const isParentActive = childSelected;
  const badgeLabel = getWidgetSelectionLabel(widgetType, title);

  const responsiveClasses = useMemo(
    () => getResponsiveClasses(data.responsive as Record<string, unknown> | undefined),
    [data.responsive],
  );

  const sectionStyle: CSSProperties = disableSectionWidthStyle
    ? {
        width: "100%",
        maxWidth: "none",
        margin: 0,
        padding: 0,
        boxSizing: "border-box",
      }
    : getSectionWidthStyle(data.layout as Record<string, unknown> | undefined);

  const backgroundStyle = getWidgetBackgroundStyle(data.style as Record<string, unknown> | undefined);

  const selectionOverlay = isSelected || isParentActive ? (
    <div
      className="builder-editor-only pointer-events-none absolute inset-0 z-[20]"
      data-builder-editor-only="1"
      style={{
        border: isSelected ? "1.5px dashed #7c3aed" : "1px dashed rgba(148,163,184,0.75)",
        borderRadius: "inherit",
      }}
    />
  ) : null;

  return (
    <WidgetSection
      as={as}
      className={`${responsiveClasses} ${wrapperClassName}`.trim()}
      contentClassName={contentClassName}
      disableInnerWrapper={disableSectionWidthStyle}
      outerStyle={{
        overflow: "visible",
        position: "relative",
        ...backgroundStyle,
      }}
      innerStyle={sectionStyle}
      dataAttributes={{
        "data-widget": widgetType,
        "data-widget-id": data.id,
        "data-widget-variant": data.variant,
        "data-wto-widget-label": badgeLabel,
        "data-widget-selected": isSelected ? "1" : "0",
        "data-wto-widget-root": "1",
      }}
    >
      {isSelected || isParentActive ? (
        <span
          className="builder-editor-only pointer-events-none absolute left-0 top-0 z-[60] inline-flex -translate-y-[calc(100%+2px)] rounded-[5px] px-[7px] py-[3px] text-[11px] font-semibold leading-tight text-white"
          style={{ background: isParentActive && !isSelected ? "#334155" : "#0f172a" }}
          data-builder-editor-only="1"
        >
          {badgeLabel}
        </span>
      ) : null}
      {selectionOverlay}

      {toolbar || children}
    </WidgetSection>
  );
}
