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

function normalizeSpacingValue(value?: Partial<SpacingValue> | null): SpacingValue {
  return {
    top: Number(value?.top ?? 0),
    right: Number(value?.right ?? 0),
    bottom: Number(value?.bottom ?? 0),
    left: Number(value?.left ?? 0),
    unit: String(value?.unit ?? "px"),
  };
}

function parseSpacingString(value?: string): SpacingValue {
  const defaultUnit = "px";
  if (!value) return { top: 0, right: 0, bottom: 0, left: 0, unit: defaultUnit };
  const parts = value.trim().split(/\s+/).filter(Boolean);
  const nums: number[] = [];
  let unit = defaultUnit;
  for (const part of parts) {
    const match = part.match(/^(-?\d*\.?\d+)([a-z%]*)$/i);
    if (match) {
      nums.push(Number(match[1]));
      if (match[2]) unit = match[2];
    }
  }
  if (nums.length === 0) return { top: 0, right: 0, bottom: 0, left: 0, unit };
  if (nums.length === 1) return { top: nums[0], right: nums[0], bottom: nums[0], left: nums[0], unit };
  if (nums.length === 2) return { top: nums[0], right: nums[1], bottom: nums[0], left: nums[1], unit };
  if (nums.length === 3) return { top: nums[0], right: nums[1], bottom: nums[2], left: nums[1], unit };
  return { top: nums[0], right: nums[1], bottom: nums[2], left: nums[3], unit };
}

export function parseSpacingValue(value?: unknown): ResponsiveSpacingValue {
  if (typeof value === "string") {
    return { desktop: parseSpacingString(value) };
  }
  if (value && typeof value === "object" && !Array.isArray(value)) {
    const record = value as Record<string, unknown>;
    const result: ResponsiveSpacingValue = {};
    (Object.keys(record) as SpacingDevice[]).forEach((device) => {
      const entry = record[device];
      if (entry && typeof entry === "object" && !Array.isArray(entry)) {
        result[device] = normalizeSpacingValue(entry as Partial<SpacingValue>);
      }
    });
    return result;
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
    [device]: nextValue,
  };
}

export function serializeSpacingValue(value?: SpacingValue | null): string | null {
  if (!value) return null;
  if (value.top === value.right && value.right === value.bottom && value.bottom === value.left) {
    return `${value.top}${value.unit}`;
  }
  return `${value.top}${value.unit} ${value.right}${value.unit} ${value.bottom}${value.unit} ${value.left}${value.unit}`;
}

export function getSpacingStyleValue(value: unknown, device: SpacingDevice): string | undefined {
  return serializeSpacingValue(getSpacingValueForDevice(value, device)) ?? undefined;
}

export function getResponsiveSpacingCss(layout: Record<string, unknown> | undefined, className: string): string {
  const desktopPadding = getSpacingValueForDevice((layout as Record<string, unknown> | undefined)?.padding, "desktop");
  const desktopMargin = getSpacingValueForDevice((layout as Record<string, unknown> | undefined)?.margin, "desktop");
  const tabletPadding = getSpacingValueForDevice((layout as Record<string, unknown> | undefined)?.padding, "tablet");
  const tabletMargin = getSpacingValueForDevice((layout as Record<string, unknown> | undefined)?.margin, "tablet");
  const mobilePadding = getSpacingValueForDevice((layout as Record<string, unknown> | undefined)?.padding, "mobile");
  const mobileMargin = getSpacingValueForDevice((layout as Record<string, unknown> | undefined)?.margin, "mobile");

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
  if (baseParts.length) rules.push(`.${className}{${baseParts.join('')}}`);

  if (tabletPaddingCss || tabletMarginCss) {
    const tabletParts: string[] = [];
    if (tabletPaddingCss) tabletParts.push(`padding:${tabletPaddingCss};`);
    if (tabletMarginCss) tabletParts.push(`margin:${tabletMarginCss};`);
    rules.push(`@media (max-width: 991.98px){.${className}{${tabletParts.join('')}}}`);
  }

  if (mobilePaddingCss || mobileMarginCss) {
    const mobileParts: string[] = [];
    if (mobilePaddingCss) mobileParts.push(`padding:${mobilePaddingCss};`);
    if (mobileMarginCss) mobileParts.push(`margin:${mobileMarginCss};`);
    rules.push(`@media (max-width: 767.98px){.${className}{${mobileParts.join('')}}}`);
  }

  return rules.join("\n");
}
