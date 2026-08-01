import type { Project } from "./store";

export interface BootstrapExportFile {
  path: string;
  content: string;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function buildBootstrapExport(project: Pick<Project, "name">) {
  const projectName = project.name?.trim() || "Bootstrap Export";
  const title = escapeHtml(projectName);

  const indexHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${title}</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet" />
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" />
    <link rel="stylesheet" href="./css/styles.css" />
  </head>
  <body>
    <div class="container py-5">
      <div class="row justify-content-center">
        <div class="col-lg-8">
          <h1 class="display-5 fw-bold mb-3">Bootstrap Export Ready</h1>
          <p class="lead text-muted">This page is generated from the Website Builder.</p>
          <div class="alert alert-primary" role="status">
            Phase 1 bootstrap export foundation is active.
          </div>
        </div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script src="./js/app.js"></script>
  </body>
</html>`;

  const stylesCss = `:root {
  --export-font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --export-accent-color: #5b5bd6;
}

body {
  font-family: var(--export-font-family);
  color: #1f2937;
  background-color: #f8fafc;
}

.custom-color-placeholder {
  color: var(--export-accent-color);
}

.spacing-placeholder {
  margin-bottom: 1.5rem;
}

.future-overrides {
  /* Reserved for future bootstrap export enhancements. */
}`;

  const appJs = `document.addEventListener("DOMContentLoaded", () => {
  console.info("Bootstrap export ready");
});
`;

  return {
    files: [
      { path: "Export/index.html", content: indexHtml },
      { path: "Export/css/styles.css", content: stylesCss },
      { path: "Export/js/app.js", content: appJs },
      { path: "Export/images/.gitkeep", content: "" },
    ] as BootstrapExportFile[],
  };
}
