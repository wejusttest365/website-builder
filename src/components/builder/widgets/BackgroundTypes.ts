export type WidgetBackgroundType = "none" | "color" | "gradient" | "image";

export interface WidgetBackgroundStyle extends Record<string, unknown> {
  type?: WidgetBackgroundType;
  color?: string;
  gradientStart?: string;
  gradientEnd?: string;
  image?: string;
}
