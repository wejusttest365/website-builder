import type { Project } from "./store";

/**
 * @deprecated Placeholder bootstrap scaffold. Real ZIP export uses buildSiteExport() in preview.ts.
 * Kept only so accidental imports fail loudly instead of shipping demo HTML.
 */
export function buildBootstrapExport(_project: Pick<Project, "name">): never {
  throw new Error(
    "buildBootstrapExport() is deprecated. Use buildSiteExport() which exports the current builder pages.",
  );
}