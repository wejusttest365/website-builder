import assert from "node:assert/strict";
import { buildExportBundle, buildPreviewHTML, buildSiteExport } from "../src/lib/builder/preview.ts";

const png = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAACklEQVR4nGMAAQABAA0qL2YAAAAAElFTkSuQmCC";
const svg = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciLz4=";

const section = {
  id: "s1",
  templateId: "img-test",
  name: "Image test",
  html: '<section class="p-8"><img src="images/test.png" alt="hero" /><div style="background-image:url(\'images/bg.svg\');height:40px"></div></section>',
} as any;

const assets = {
  "test.png": png,
  "bg.svg": svg,
} as Record<string, string>;

const preview = buildPreviewHTML({
  sections: [section],
  globalCss: "",
  globalJs: "",
  editable: false,
  assets,
});
assert.match(preview, /src="data:image\/png;base64/i);
assert.match(preview, /background-image:url\('data:image\/svg\+xml;base64/i);

const bundle = buildExportBundle({
  sections: [section],
  globalCss: "",
  globalJs: "",
  title: "Test",
  assets,
  inlineAssets: true,
});
assert.match(bundle.html, /src="data:image\/png;base64/i);
assert.match(bundle.complete, /background-image:url\('data:image\/svg\+xml;base64/i);

const exportData = buildSiteExport({
  id: "project-1",
  name: "Demo",
  pages: [{ id: "page-1", name: "Home", slug: "index", sections: [section] }],
  currentPageId: "page-1",
  globalCss: "",
  globalJs: "",
  customHead: "",
  createdAt: Date.now(),
  updatedAt: Date.now(),
  assets,
} as any);
assert.ok(exportData.files.some((file) => file.path === "index.html"));
assert.ok(exportData.files.some((file) => file.path === "images/test.png"));
console.log("image asset renderer verified");
