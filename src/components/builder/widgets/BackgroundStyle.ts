import type { CSSProperties } from "react";
import type { WidgetBackgroundStyle } from "./BackgroundTypes";

function escapeCssValue(value?: string) {
  if (!value) return "";
  return value.replace(/'/g, "\\'").replace(/"/g, "\\\"");
}

export function getWidgetBackgroundStyle(background?: WidgetBackgroundStyle): CSSProperties {
  const type = background?.type || "none";
  const color = String(background?.color || "").trim();
  const gradientStart = String(background?.gradientStart || "#ffffff").trim();
  const gradientEnd = String(background?.gradientEnd || "#f8fafc").trim();
  const image = String(background?.image || "").trim();

  const style: CSSProperties = {};
  if (type === "color") {
    if (color) style.backgroundColor = color;
  }
  if (type === "gradient") {
    style.backgroundImage = `linear-gradient(180deg, ${gradientStart}, ${gradientEnd})`;
    if (color) style.backgroundColor = color;
  }
  if (type === "image" && image) {
    style.backgroundImage = `url('${escapeCssValue(image)}')`;
    style.backgroundSize = "cover";
    style.backgroundPosition = "center";
    style.backgroundRepeat = "no-repeat";
    if (color) style.backgroundColor = color;
  }

  return style;
}

export function getWidgetBackgroundCss(background?: WidgetBackgroundStyle): string {
  const type = background?.type || "none";
  const color = String(background?.color || "").trim();
  const gradientStart = String(background?.gradientStart || "#ffffff").trim();
  const gradientEnd = String(background?.gradientEnd || "#f8fafc").trim();
  const image = String(background?.image || "").trim();

  const styles: string[] = [];
  if (type === "color") {
    if (color) styles.push(`background-color: ${escapeCssValue(color)};`);
  }
  if (type === "gradient") {
    styles.push(`background-image: linear-gradient(180deg, ${escapeCssValue(gradientStart)}, ${escapeCssValue(gradientEnd)});`);
    if (color) styles.push(`background-color: ${escapeCssValue(color)};`);
  }
  if (type === "image" && image) {
    styles.push(`background-image: url('${escapeCssValue(image)}');`);
    styles.push("background-size: cover;");
    styles.push("background-position: center;");
    styles.push("background-repeat: no-repeat;");
    if (color) styles.push(`background-color: ${escapeCssValue(color)};`);
  }

  return styles.join(" ");
}
