import { WTO_CAROUSEL_RUNTIME } from "@/components/builder/widgets/Carousel/CarouselRuntime";
import { WTO_FAQ_RUNTIME } from "@/components/builder/widgets/FAQ/FAQRuntime";

export type WidgetExportResult = {
  html: string;
  css?: string;
  js?: string;
};

export type ExportDependencyFlags = {
  bootstrap?: boolean;
  fontAwesome?: boolean;
};

/** Normalize legacy string exporters and richer export objects. */
export function normalizeWidgetExport(result: string | WidgetExportResult | null | undefined): WidgetExportResult {
  if (!result) return { html: "" };
  if (typeof result === "string") return { html: result };
  return {
    html: String(result.html || ""),
    css: result.css ? String(result.css) : undefined,
    js: result.js ? String(result.js) : undefined,
  };
}

/** Pull `<style>` blocks out of widget HTML so they can live in css/styles.css. */
export function extractStyleTags(html: string): { html: string; css: string } {
  const blocks: string[] = [];
  const cleaned = String(html || "").replace(/<style\b[^>]*>([\s\S]*?)<\/style>/gi, (_match, css: string) => {
    const trimmed = String(css || "").trim();
    if (trimmed) blocks.push(trimmed);
    return "";
  });
  return {
    html: cleaned.replace(/^\s+/, "").trim(),
    css: blocks.join("\n\n"),
  };
}

export function dedupeCssBlocks(blocks: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const block of blocks) {
    const trimmed = String(block || "").trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out.join("\n\n");
}

export function dedupeJsBlocks(blocks: string[]): string {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const block of blocks) {
    const trimmed = String(block || "").trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    out.push(trimmed);
  }
  return out.join("\n\n");
}

/** Static runtimes keyed by widget type. Safe to include when the widget appears anywhere in the site. */
export const WIDGET_TYPE_EXPORT_JS: Record<string, string> = {
  carousel: WTO_CAROUSEL_RUNTIME,
  faq: WTO_FAQ_RUNTIME,
};

export const BOOTSTRAP_CSS_CDN =
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css";
export const BOOTSTRAP_BUNDLE_JS_CDN =
  "https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js";
export const FONT_AWESOME_CDN =
  "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css";

/**
 * Widgets that already render a full-width outer section and must not be
 * re-wrapped in the shared container width helper.
 */
export const FULL_WIDTH_EXPORT_MARKERS = [
  "builder-navbar",
  "builder-footer",
  "builder-hero",
  "builder-cta",
  "data-wto-carousel",
  "data-wto-faq",
  "data-wto-gallery",
] as const;

export function isFullWidthExportHtml(html: string): boolean {
  return FULL_WIDTH_EXPORT_MARKERS.some((marker) => html.includes(marker));
}
