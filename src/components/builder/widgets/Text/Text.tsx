import React from "react";
import { defaultTextWidgetData, isTextWidgetData } from "./TextTypes";
import type { WidgetData } from "../widgetRegistry";
import { BaseWidget } from "../BaseWidget";
import { getWidgetElementDuplicateEntries } from "../elementDuplication";
import { useBuilder } from "@/lib/builder/store";
import { getSpacingStyleValue } from "../spacing";

export interface TextProps {
  data: WidgetData;
}

export function Text({ data = defaultTextWidgetData }: TextProps) {
  const textData = isTextWidgetData(data) ? data : defaultTextWidgetData;
  const visible = textData.advanced.visibility ?? true;
  const device = useBuilder((s) => s.device);
  if (!visible) {
    return null;
  }

  const duplicateEntries = getWidgetElementDuplicateEntries(textData);

  function buildRenderState(entry?: { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> }) {
    const content = entry?.content ? { ...textData.content, ...entry.content } : textData.content;
    const style = entry?.style ? { ...textData.style, ...entry.style } : textData.style;
    const layout = entry?.layout ? { ...textData.layout, ...entry.layout } : textData.layout;
    const advanced = entry?.advanced ? { ...textData.advanced, ...entry.advanced } : textData.advanced;
    const text = String(content.text || "Write clear, readable content that keeps visitors engaged.");
    const alignClass = layout.alignment === "center" ? "text-center" : layout.alignment === "right" ? "text-end" : "text-start";

    const textStyle: React.CSSProperties = {
      fontFamily: style.fontFamily as string | undefined,
      color: style.textColor as string | undefined,
      fontSize: style.fontSize as string | undefined,
      fontWeight: style.fontWeight as string | undefined,
      lineHeight: style.lineHeight as string | undefined,
      letterSpacing: style.letterSpacing as string | undefined,
      margin: 0,
      padding: 0,
      display: "block",
    };

    if (textData.variant === "Lead Text") {
      textStyle.fontSize = "1.25rem";
      textStyle.fontWeight = "500";
    }

    if (textData.variant === "Muted Text") {
      textStyle.color = "#6b7280";
    }

    if (textData.variant === "Highlight") {
      textStyle.backgroundColor = "#fffbeb";
      textStyle.padding = "0.25rem 0.5rem";
      textStyle.borderRadius = "0.5rem";
    }

    const contentNode = content.richText ? <span dangerouslySetInnerHTML={{ __html: String(text) }} /> : text;

    return { alignClass, textStyle, contentNode, layout, visible: advanced.visibility ?? true, text };
  }

  const elementsToRender = [{ key: "text", duplicateId: null, entry: null as { content?: Record<string, unknown>; style?: Record<string, unknown>; layout?: Record<string, unknown>; advanced?: Record<string, unknown> } | null }].concat(
    duplicateEntries.map((entry) => ({ key: entry.key, duplicateId: entry.id, entry })),
  );

  return (
    <BaseWidget
      data={textData}
      widgetType="text"
      title="Text"
      variantLabel={textData.variant}
      wrapperClassName="w-full"
      contentClassName="overflow-hidden"
    >
      <div className="space-y-3">
        {elementsToRender.map((item) => {
          const renderState = buildRenderState(item.entry ?? undefined);
          if (!renderState.visible) return null;
          return (
            <div key={`${item.key}-${item.duplicateId || "base"}`} className={renderState.alignClass} style={{ margin: renderState.layout.margin, padding: renderState.layout.padding }}>
              {textData.variant === "Quote" ? (
                <blockquote
                  className={renderState.alignClass}
                  style={renderState.textStyle}
                  data-wto-widget-element-key={item.key}
                  data-wto-widget-element-type="text"
                  {...(item.duplicateId ? { "data-wto-duplicate-id": item.duplicateId } : {})}
                >
                  {renderState.contentNode}
                </blockquote>
              ) : textData.variant === "Small Text" ? (
                <small
                  className={renderState.alignClass}
                  style={renderState.textStyle}
                  data-wto-widget-element-key={item.key}
                  data-wto-widget-element-type="text"
                  {...(item.duplicateId ? { "data-wto-duplicate-id": item.duplicateId } : {})}
                >
                  {renderState.contentNode}
                </small>
              ) : (
                <p
                  className={renderState.alignClass}
                  style={renderState.textStyle}
                  data-wto-widget-element-key={item.key}
                  data-wto-widget-element-type="text"
                  {...(item.duplicateId ? { "data-wto-duplicate-id": item.duplicateId } : {})}
                >
                  {renderState.contentNode}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </BaseWidget>
  );
}
