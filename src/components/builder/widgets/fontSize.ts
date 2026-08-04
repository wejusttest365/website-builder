/** Canonical root font size used when converting rem/em to px. */
export const ROOT_FONT_SIZE_PX = 16;

/** Shared px options for builder typography controls. */
export const FONT_SIZE_OPTIONS = [
  "12px",
  "13px",
  "14px",
  "15px",
  "16px",
  "18px",
  "20px",
  "24px",
  "28px",
  "32px",
  "36px",
  "40px",
  "48px",
  "56px",
  "64px",
  "72px",
  "80px",
] as const;

const FONT_SIZE_FIELD_KEYS = ["fontSize", "fontSizeMobile", "fontSizeTablet"] as const;

function roundPx(value: number) {
  if (!Number.isFinite(value)) return undefined;
  return `${Math.round(value)}px`;
}

function convertAbsoluteUnit(amount: number, unit: string): string | undefined {
  const normalizedUnit = unit.toLowerCase();
  if (normalizedUnit === "px" || normalizedUnit === "") return roundPx(amount);
  if (normalizedUnit === "rem" || normalizedUnit === "em") return roundPx(amount * ROOT_FONT_SIZE_PX);
  return undefined;
}

/**
 * Normalize any builder-controlled font-size value to canonical px.
 * Supports: "16px", "1rem", "1em", 16, "16", and simple clamp() with absolute units.
 * Returns undefined when the value is empty or cannot be safely converted.
 */
export function normalizeFontSizeToPx(value: unknown): string | undefined {
  if (value == null) return undefined;
  if (typeof value === "number") return roundPx(value);

  const raw = String(value).trim();
  if (!raw) return undefined;

  if (/^-?\d*\.?\d+$/.test(raw)) {
    return roundPx(Number(raw));
  }

  const simple = raw.match(/^(-?\d*\.?\d+)\s*(px|rem|em)$/i);
  if (simple) {
    return convertAbsoluteUnit(Number(simple[1]), simple[2] || "px");
  }

  const clampMatch = raw.match(/^clamp\(\s*(.+)\s*\)$/i);
  if (clampMatch) {
    const parts = clampMatch[1].split(",").map((part) => part.trim()).filter(Boolean);
    for (const candidate of [parts[1], parts[2], parts[0]]) {
      if (!candidate) continue;
      const normalized = normalizeFontSizeToPx(candidate);
      if (normalized) return normalized;
    }
  }

  const token = raw.match(/(-?\d*\.?\d+)\s*(px|rem|em)\b/i);
  if (token) {
    return convertAbsoluteUnit(Number(token[1]), token[2]);
  }

  return undefined;
}

/** Normalize known typography font-size fields on a style/responsive object. */
export function normalizeFontSizeFields<T extends Record<string, unknown>>(source: T | null | undefined): T {
  if (!source || typeof source !== "object") return (source ?? {}) as T;
  const next = { ...source } as Record<string, unknown>;
  for (const key of FONT_SIZE_FIELD_KEYS) {
    if (!(key in next)) continue;
    const current = next[key];
    if (current == null || current === "") continue;
    const normalized = normalizeFontSizeToPx(current);
    if (normalized) next[key] = normalized;
  }
  return next as T;
}
