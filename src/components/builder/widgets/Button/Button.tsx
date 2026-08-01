import React, { useState } from "react";
import { defaultButtonWidgetData, isButtonWidgetData } from "./ButtonTypes";
import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { getWidgetElementDuplicateEntries } from "../elementDuplication";
import { useBuilder } from "@/lib/builder/store";
import { getSpacingStyleValue } from "../spacing";

function getThemeColor(color: string, customColor?: string) {
  if (color === "Custom") {
    return customColor || "#0d6efd";
  }

  switch (color) {
    case "Secondary":
      return "#6c757d";
    case "Success":
      return "#198754";
    case "Danger":
      return "#dc3545";
    default:
      return "#0d6efd";
  }
}

function getButtonPadding(size: string) {
  switch (size) {
    case "Small":
      return "0.55rem 1rem";
    case "Large":
      return "0.95rem 1.75rem";
    default:
      return "0.75rem 1.5rem";
  }
}

export interface ButtonProps {
  data: WidgetData;
}

export function Button({ data = defaultButtonWidgetData }: ButtonProps) {
  const buttonData = isButtonWidgetData(data) ? data : defaultButtonWidgetData;
  const visible = buttonData.advanced.visibility ?? true;
  const [hovered, setHovered] = useState(false);
  const duplicateEntries = getWidgetElementDuplicateEntries(buttonData);
  const device = useBuilder((s) => s.device);

  if (!visible) {
    return null;
  }

  function buildRenderState(entry?: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> }) {
    const content = entry?.content ? { ...buttonData.content, ...entry.content } : buttonData.content;
    const style = entry?.style ? { ...buttonData.style, ...entry.style } : buttonData.style;
    const layout = entry?.layout ? { ...buttonData.layout, ...entry.layout } : buttonData.layout;
    const advanced = entry?.advanced ? { ...buttonData.advanced, ...entry.advanced } : buttonData.advanced;
    const alignmentClass =
      layout.alignment === "center"
        ? "text-center"
        : layout.alignment === "right"
        ? "text-end"
        : "text-start";

    const variant = buttonData.variant || String(style.variant ?? "Filled");
    const color = getThemeColor(style.color ?? "Primary", String(style.customColor ?? "#0d6efd"));
    const isGhost = variant === "Ghost";
    const isOutline = variant === "Outline";
    const isGradient = variant === "Gradient";
    const isFilled = variant === "Filled";
    const textColor = isFilled || isGradient ? "#ffffff" : color;
    const backgroundColor = isFilled ? color : isGradient ? `linear-gradient(90deg, ${color}, ${color}cc)` : "transparent";
    const borderColor = isGhost ? "transparent" : color;
    const displayMode = style.display === "block" ? "block" : "inline";
    const widthStyle = style.fullWidth || buttonData.responsive.mobileFullWidth ? "100%" : undefined;
    const hoverTransform = hovered
      ? buttonData.animation.hoverEffect === "lift"
        ? "translateY(-2px)"
        : buttonData.animation.hoverEffect === "grow"
        ? "scale(1.02)"
        : "none"
      : "none";
    const justifyContent =
      layout.alignment === "center"
        ? "center"
        : layout.alignment === "right"
        ? "flex-end"
        : "flex-start";

    const buttonStyle: React.CSSProperties = {
      fontFamily: style.fontFamily as string | undefined,
      fontSize: style.fontSize as string | undefined,
      display: displayMode === "block" ? "flex" : "inline-flex",
      alignItems: "center",
      justifyContent,
      gap: "0.5rem",
      width: widthStyle,
      padding: getButtonPadding(style.size ?? "Medium"),
      borderRadius: style.borderRadius,
      border: isGhost ? "1px solid transparent" : `1px solid ${borderColor}`,
      background: backgroundColor,
      color: textColor,
      boxShadow: style.shadow ? "0 0.75rem 1.5rem rgba(15, 23, 42, 0.12)" : undefined,
      textDecoration: "none",
      transform: hoverTransform,
      transition: "all 180ms ease-in-out",
      whiteSpace: "nowrap",
    };

    if (isOutline) {
      buttonStyle.background = "transparent";
      buttonStyle.color = color;
    }

    if (isGhost) {
      buttonStyle.background = "transparent";
      buttonStyle.color = color;
      buttonStyle.border = "1px solid transparent";
    }

    if (style.color === "Custom" && !isFilled && !isGradient) {
      buttonStyle.color = color;
      buttonStyle.border = `1px solid ${color}`;
    }

    const wrapperStyle: React.CSSProperties = {
      margin: getSpacingStyleValue(layout.margin, device),
      padding: getSpacingStyleValue(layout.padding, device),
      textAlign:
        layout.alignment === "center"
          ? "center"
          : layout.alignment === "right"
          ? "right"
          : "left",
    };

    const url = String(content.url || "#");
    const target = content.openInNewTab ? "_blank" : undefined;
    const rel = content.openInNewTab ? "noopener noreferrer" : undefined;
    const iconLeft = String(content.iconLeft ?? "").trim();
    const iconRight = String(content.iconRight ?? "").trim();

    const dataAttributes = Object.fromEntries(
      Object.entries(advanced.dataAttributes || {}).map(([key, value]) => [`data-${key}`, String(value)])
    ) as React.AnchorHTMLAttributes<HTMLAnchorElement>;

    return { alignmentClass, wrapperStyle, buttonStyle, url, target, rel, iconLeft, iconRight, dataAttributes, visible: advanced.visibility ?? true, content };
  }

  const elementsToRender = [{ key: "button", duplicateId: null, entry: null as { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> } | null }].concat(
    duplicateEntries.map((entry) => ({ key: entry.key, duplicateId: entry.id, entry })),
  );

  return (
    <BaseWidget
      data={buttonData}
      widgetType="button"
      title="Button"
      variantLabel={`${buttonData.variant} • ${buttonData.style.color}`}
      wrapperClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <div className="space-y-3">
        {elementsToRender.map((item) => {
          const renderState = buildRenderState(item.entry ?? undefined);
          if (!renderState.visible) return null;
          return (
            <div key={`${item.key}-${item.duplicateId || "base"}`} className={`${renderState.alignmentClass}`} style={renderState.wrapperStyle}>
              <a
                href={renderState.url}
                target={renderState.target}
                rel={renderState.rel}
                className={`${renderState.buttonStyle.display === "flex" ? "w-full" : "inline-flex"}`}
                style={renderState.buttonStyle}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
                data-wto-widget-element-key={item.key}
                data-wto-widget-element-type="button"
                {...(item.duplicateId ? { "data-wto-duplicate-id": item.duplicateId } : {})}
                {...renderState.dataAttributes}
              >
                {renderState.iconLeft ? <i className={`fa-solid fa-${renderState.iconLeft}`} aria-hidden="true" /> : null}
                <span>{String(renderState.content.text || "Get started")}</span>
                {renderState.iconRight ? <i className={`fa-solid fa-${renderState.iconRight}`} aria-hidden="true" /> : null}
              </a>
            </div>
          );
        })}
      </div>
    </BaseWidget>
  );
}
