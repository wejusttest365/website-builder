import React from "react";
import { defaultHeadingWidgetData, isHeadingWidgetData } from "./HeadingTypes";
import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { getWidgetElementDuplicateEntries } from "../elementDuplication";
import { useBuilder } from "@/lib/builder/store";
import { getSpacingStyleValue } from "../spacing";
import { normalizeFontSizeToPx } from "../fontSize";

function getHeadingTag(level: string) {
  switch (level) {
    case "h1":
      return "h1";
    case "h2":
      return "h2";
    case "h3":
      return "h3";
    case "h4":
      return "h4";
    case "h5":
      return "h5";
    case "h6":
      return "h6";
    default:
      return "h2";
  }
}

export interface HeadingProps {
  data: WidgetData;
}

export function Heading({ data = defaultHeadingWidgetData }: HeadingProps) {
  const headingData = isHeadingWidgetData(data) ? data : defaultHeadingWidgetData;
  const visible = headingData.advanced.visibility ?? true;
  const device = useBuilder((s) => s.device);
  if (!visible) {
    return null;
  }

  const duplicateEntries = getWidgetElementDuplicateEntries(headingData);

  function buildRenderState(entry?: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> }) {
    const content = entry?.content ? { ...headingData.content, ...entry.content } : headingData.content;
    const style = entry?.style ? { ...headingData.style, ...entry.style } : headingData.style;
    const layout = entry?.layout ? { ...headingData.layout, ...entry.layout } : headingData.layout;
    const advanced = entry?.advanced ? { ...headingData.advanced, ...entry.advanced } : headingData.advanced;
    const text = String(content.text || "Create a bold heading");
    const headingTag = getHeadingTag(String(content.headingLevel || "h2"));
    const alignClass = layout.alignment === "center" ? "text-center" : layout.alignment === "right" ? "text-end" : "text-start";
    const textColor = String(style.textColor ?? "#111827").trim() || "#111827";
    const gradientStart = String(style.gradientStart ?? "").trim();
    const gradientEnd = String(style.gradientEnd ?? "").trim();
    const hasGradient = headingData.variant === "Gradient" && gradientStart && gradientEnd && gradientStart !== gradientEnd;
    const fallbackGradientColor = headingData.variant === "Gradient" && gradientStart && gradientStart === gradientEnd ? gradientStart : undefined;
    const effectiveColor = fallbackGradientColor || textColor;
    const headingStyle: React.CSSProperties = {
      fontFamily: style.fontFamily as string | undefined,
      color: effectiveColor,
      fontSize: normalizeFontSizeToPx(style.fontSize) ?? (style.fontSize as string | undefined),
      fontWeight: style.fontWeight as string | undefined,
      lineHeight: style.lineHeight as string | undefined,
      letterSpacing: style.letterSpacing as string | undefined,
      margin: 0,
      padding: 0,
      display: "block",
    };

    const decorationStyle: React.CSSProperties =
      hasGradient
        ? {
            backgroundImage: `linear-gradient(90deg, ${gradientStart}, ${gradientEnd})`,
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }
        : headingData.variant === "Underline"
        ? {
            borderBottom: `4px solid ${String(style.underlineColor || "#2563eb")}`,
            display: "inline-block",
            paddingBottom: "0.25rem",
          }
        : {};

    const sectionLabel = headingData.variant === "Section Title" ? (
      <div
        className="mb-2 text-uppercase text-muted"
        style={{ color: style.textColor as string | undefined, fontWeight: 600, letterSpacing: "0.12em", fontSize: "14px" }}
      >
        {String(content.label || "Section title")}
      </div>
    ) : null;

    return {
      alignClass,
      headingStyle,
      decorationStyle,
      headingTag,
      sectionLabel,
      layout,
      advanced,
      text,
      visible: advanced.visibility ?? true,
    };
  }

  const elementsToRender = [{ key: "heading", duplicateId: null, entry: null as { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> } | null }].concat(
    duplicateEntries.map((entry) => ({ key: entry.key, duplicateId: entry.id, entry })),
  );

  return (
    <BaseWidget
      data={headingData}
      widgetType="heading"
      title="Heading"
      variantLabel={headingData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <div className="space-y-3">
        {elementsToRender.map((item) => {
          const renderState = buildRenderState(item.entry ?? undefined);
          if (!renderState.visible) return null;
          return (
            <div key={`${item.key}-${item.duplicateId || "base"}`} className={renderState.alignClass} style={{ margin: getSpacingStyleValue(renderState.layout.margin, device), padding: getSpacingStyleValue(renderState.layout.padding, device) }}>
              {renderState.sectionLabel}
              {React.createElement(
                renderState.headingTag,
                {
                  className: renderState.alignClass,
                  style: { ...renderState.headingStyle, ...renderState.decorationStyle },
                  "data-wto-widget-element-key": item.key,
                  "data-wto-widget-element-type": "text",
                  ...(item.duplicateId ? { "data-wto-duplicate-id": item.duplicateId } : {}),
                },
                renderState.text,
              )}
            </div>
          );
        })}
      </div>
    </BaseWidget>
  );
}
