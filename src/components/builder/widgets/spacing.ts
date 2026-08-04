export type SpacingDevice = "desktop" | "tablet" | "mobile";

export interface SpacingValue {
  top: number;
  right: number;
  bottom: number;
  left: number;
  unit: string;
}

export interface ResponsiveSpacingValue {
  desktop?: SpacingValue;
  tablet?: SpacingValue;
  mobile?: SpacingValue;
}

const ROOT_FONT_SIZE_PX = 16;
const DEVICE_KEYS: SpacingDevice[] = ["desktop", "tablet", "mobile"];

function toPxAmount(amount: number, unit: string): number {
  const normalized = String(unit || "px").toLowerCase();
  if (normalized === "rem" || normalized === "em") {
    return Math.round(amount * ROOT_FONT_SIZE_PX);
  }
  return Math.round(amount);
}

function normalizeSpacingValue(value?: Partial<SpacingValue> | null): SpacingValue {
  const unit = String(value?.unit ?? "px");
  return {
    top: toPxAmount(Number(value?.top ?? 0), unit),
    right: toPxAmount(Number(value?.right ?? 0), unit),
    bottom: toPxAmount(Number(value?.bottom ?? 0), unit),
    left: toPxAmount(Number(value?.left ?? 0), unit),
    unit: "px",
  };
}

function isFlatSpacingValue(value: Record<string, unknown>): boolean {
  return "top" in value || "right" in value || "bottom" in value || "left" in value || "unit" in value;
}

function parseSpacingString(value?: string): SpacingValue {
  if (!value || value === "[object Object]") {
    return { top: 0, right: 0, bottom: 0, left: 0, unit: "px" };
  }
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const nums: number[] = [];
  let unit = "px";
  for (const part of parts) {
    if (/^-?\d*\.?\d+$/.test(part)) {
      nums.push(Number(part));
      continue;
    }
    const match = part.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
    if (match) {
      nums.push(Number(match[1]));
      if (match[2]) unit = match[2];
    }
  }
  if (nums.length === 0) return { top: 0, right: 0, bottom: 0, left: 0, unit: "px" };
  if (nums.length === 1) return normalizeSpacingValue({ top: nums[0], right: nums[0], bottom: nums[0], left: nums[0], unit });
  if (nums.length === 2) return normalizeSpacingValue({ top: nums[0], right: nums[1], bottom: nums[0], left: nums[1], unit });
  if (nums.length === 3) return normalizeSpacingValue({ top: nums[0], right: nums[1], bottom: nums[2], left: nums[1], unit });
  return normalizeSpacingValue({ top: nums[0], right: nums[1], bottom: nums[2], left: nums[3], unit });
}

export function parseSpacingValue(value?: unknown): ResponsiveSpacingValue {
  if (typeof value === "number") {
    return { desktop: normalizeSpacingValue({ top: value, right: value, bottom: value, left: value, unit: "px" }) };
  }
  if (typeof value === "string") {
    return { desktop: parseSpacingString(value) };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    if (DEVICE_KEYS.some((device) => record[device] != null)) {
      const result: ResponsiveSpacingValue = {};
      DEVICE_KEYS.forEach((device) => {
        const entry = record[device];
        if (typeof entry === "string") {
          result[device] = parseSpacingString(entry);
        } else if (entry && typeof entry === "object" && !Array.isArray(entry)) {
          result[device] = normalizeSpacingValue(entry as Partial<SpacingValue>);
        }
      });
      return result;
    }
    if (isFlatSpacingValue(record)) {
      return { desktop: normalizeSpacingValue(record as Partial<SpacingValue>) };
    }
  }
  return {};
}

export function getSpacingValueForDevice(value: unknown, device: SpacingDevice): SpacingValue {
  const parsed = parseSpacingValue(value);
  if (device === "tablet") {
    return parsed.tablet ?? parsed.desktop ?? { top: 0, right: 0, bottom: 0, left: 0, unit: "px" };
  }
  if (device === "mobile") {
    return parsed.mobile ?? parsed.tablet ?? parsed.desktop ?? { top: 0, right: 0, bottom: 0, left: 0, unit: "px" };
  }
  return parsed.desktop ?? { top: 0, right: 0, bottom: 0, left: 0, unit: "px" };
}

export function hasSpacingValueForDevice(value: unknown, device: SpacingDevice): boolean {
  const parsed = parseSpacingValue(value);
  return !!parsed[device];
}

export function createSpacingOverride(value: unknown, device: SpacingDevice, nextValue: SpacingValue): ResponsiveSpacingValue {
  const parsed = parseSpacingValue(value);
  return {
    ...parsed,
    [device]: normalizeSpacingValue(nextValue),
  };
}

export function serializeSpacingValue(value?: SpacingValue | null): string | null {
  if (!value) return null;
  const normalized = normalizeSpacingValue(value);
  if (normalized.top === normalized.right && normalized.right === normalized.bottom && normalized.bottom === normalized.left) {
    return `${normalized.top}px`;
  }
  return `${normalized.top}px ${normalized.right}px ${normalized.bottom}px ${normalized.left}px`;
}

export function getSpacingStyleValue(value: unknown, device: SpacingDevice = "desktop"): string | undefined {
  return serializeSpacingValue(getSpacingValueForDevice(value, device)) ?? undefined;
}

export function getSpacingBoxStyle(
  padding: unknown,
  margin: unknown,
  device: SpacingDevice = "desktop",
): { padding?: string; margin?: string } {
  return {
    padding: getSpacingStyleValue(padding, device),
    margin: getSpacingStyleValue(margin, device),
  };
}

export function getResponsiveSpacingCss(layout: Record<string, unknown> | undefined, className: string): string {
  const desktopPadding = getSpacingValueForDevice(layout?.padding, "desktop");
  const desktopMargin = getSpacingValueForDevice(layout?.margin, "desktop");
  const tabletPadding = getSpacingValueForDevice(layout?.padding, "tablet");
  const tabletMargin = getSpacingValueForDevice(layout?.margin, "tablet");
  const mobilePadding = getSpacingValueForDevice(layout?.padding, "mobile");
  const mobileMargin = getSpacingValueForDevice(layout?.margin, "mobile");

  const rules: string[] = [];
  const desktopPaddingCss = serializeSpacingValue(desktopPadding);
  const desktopMarginCss = serializeSpacingValue(desktopMargin);
  const tabletPaddingCss = serializeSpacingValue(tabletPadding);
  const tabletMarginCss = serializeSpacingValue(tabletMargin);
  const mobilePaddingCss = serializeSpacingValue(mobilePadding);
  const mobileMarginCss = serializeSpacingValue(mobileMargin);

  const baseParts: string[] = [];
  if (desktopPaddingCss) baseParts.push(`padding:${desktopPaddingCss};`);
  if (desktopMarginCss) baseParts.push(`margin:${desktopMarginCss};`);
  if (baseParts.length) rules.push(`.${className}{${baseParts.join("")}}`);

  if (tabletPaddingCss || tabletMarginCss) {
    const tabletParts: string[] = [];
    if (tabletPaddingCss) tabletParts.push(`padding:${tabletPaddingCss};`);
    if (tabletMarginCss) tabletParts.push(`margin:${tabletMarginCss};`);
    rules.push(`@media (max-width: 991.98px){.${className}{${tabletParts.join("")}}}`);
  }

  if (mobilePaddingCss || mobileMarginCss) {
    const mobileParts: string[] = [];
    if (mobilePaddingCss) mobileParts.push(`padding:${mobilePaddingCss};`);
    if (mobileMarginCss) mobileParts.push(`margin:${mobileMarginCss};`);
    rules.push(`@media (max-width: 767.98px){.${className}{${mobileParts.join("")}}}`);
  }

  return rules.join("\n");
}

/** Canonical Hero defaults used by panel + render + export. */
export const DEFAULT_HERO_PADDING: ResponsiveSpacingValue = {
  desktop: { top: 80, right: 0, bottom: 80, left: 0, unit: "px" },
  tablet: { top: 56, right: 0, bottom: 56, left: 0, unit: "px" },
  mobile: { top: 40, right: 0, bottom: 40, left: 0, unit: "px" },
};

export const DEFAULT_ZERO_SPACING: ResponsiveSpacingValue = {
  desktop: { top: 0, right: 0, bottom: 0, left: 0, unit: "px" },
};

export function resolveHeroLayoutPadding(value: unknown): unknown {
  if (value == null || value === "" || value === "[object Object]" || value === "2rem" || value === "0rem") {
    return DEFAULT_HERO_PADDING;
  }
  return value;
}

export function resolveHeroLayoutMargin(value: unknown): unknown {
  if (value == null || value === "" || value === "[object Object]" || value === "0rem") {
    return DEFAULT_ZERO_SPACING;
  }
  return value;
}
