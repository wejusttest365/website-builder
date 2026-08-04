import { type CSSProperties, type ElementType, type ReactNode } from "react";

export type WidgetSectionTag = "header" | "section" | "footer" | "div";
export type WidgetSectionContentWidth = "container" | "fluid" | "custom";

export interface WidgetSectionProps {
  as?: WidgetSectionTag;
  contentWidth?: WidgetSectionContentWidth;
  maxWidth?: string;
  horizontalPadding?: string;
  className?: string;
  contentClassName?: string;
  outerStyle?: CSSProperties;
  innerStyle?: CSSProperties;
  disableInnerWrapper?: boolean;
  dataAttributes?: Record<
    string,
    string | number | boolean | null | undefined
  >;
  children: ReactNode;
}

function normalizeContentWidth(contentWidth?: WidgetSectionContentWidth) {
  return contentWidth === "container" || contentWidth === "custom" ? contentWidth : "fluid";
}
export function WidgetSection({
  as = "section",
  contentWidth = "fluid",
  maxWidth = "1200px",
  horizontalPadding = "24px",
  className = "",
  contentClassName = "",
  outerStyle,
  innerStyle,
  disableInnerWrapper = false,
  dataAttributes,
  children,
}: WidgetSectionProps) {
  const Component = as as ElementType;
  const normalizedContentWidth = normalizeContentWidth(contentWidth);

  const outerContent = disableInnerWrapper ? (
    children
  ) : (
    <div
      className={`builder-widget-container ${contentClassName}`.trim()}
      style={{
        width: "100%",
        maxWidth:
          normalizedContentWidth === "fluid"
            ? "none"
            : maxWidth,
        marginInline: "auto",
        paddingInline: horizontalPadding,
        boxSizing: "border-box",
        ...innerStyle,
      }}
    >
      {children}
    </div>
  );

  return (
  <Component
    className={`builder-widget ${className}`.trim()}
    style={{
      width: "100%",
      maxWidth: "none",
      margin: 0,
      position: "relative",
      ...outerStyle,
    }}
    {...dataAttributes}
  >
    {disableInnerWrapper ? (
      children
    ) : (
      <div
        className={`builder-widget-container ${contentClassName}`.trim()}
        style={{
          width: "100%",
          maxWidth:
            normalizedContentWidth === "fluid"
              ? "none"
              : maxWidth,
          marginInline: "auto",
          paddingInline: horizontalPadding,
          boxSizing: "border-box",
          ...innerStyle,
        }}
      >
        {children}
      </div>
    )}
  </Component>
);
}