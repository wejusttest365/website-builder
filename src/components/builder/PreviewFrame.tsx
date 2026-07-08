import { useEffect, useMemo, useRef, useState } from "react";
import { useBuilder } from "@/lib/builder/store";
import { buildPreviewHTML, resolveAssetPaths } from "@/lib/builder/preview";

interface Props {
  editable?: boolean;
  disablePointerEvents?: boolean;
}

export function PreviewFrame({ editable = true, disablePointerEvents = false }: Props) {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const device = useBuilder((s) => s.device);
  const select = useBuilder((s) => s.selectSection);
  const setSectionHtml = useBuilder((s) => s.setSectionHtml);
  const updateSection = useBuilder((s) => s.updateSection);
  const addAsset = useBuilder((s) => s.addAsset);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [imageEditor, setImageEditor] = useState<{
    sectionId: string;
    src: string;
    idx: string | null;
    kind: "img" | "box";
  } | null>(null);
  const skipRebuildRef = useRef(false);
  const [srcDoc, setSrcDoc] = useState("");

  // Rebuild srcDoc for structural changes OR html changes that did NOT come from
  // inside the iframe. This prevents scroll jumps while inline-editing text.
  const structuralKey = useMemo(() => {
    if (!project) return "";
    return JSON.stringify({
      ids: project.sections.map((s) => s.id + ":" + (s.collapsed ? 1 : 0)),
      styles: project.sections.map((s) => s.style),
      classes: project.sections.map((s) => s.className),
      domIds: project.sections.map((s) => s.domId),
      css: project.globalCss,
      js: project.globalJs,
      editable,
      assets: project.assets ? Object.keys(project.assets).join(",") : "",
    });
  }, [project, editable]);
  const htmlKey = useMemo(
    () => project?.sections.map((s) => s.html).join("\u0001") ?? "",
    [project],
  );

  useEffect(() => {
    if (!project) return;
    if (skipRebuildRef.current) {
      skipRebuildRef.current = false;
      return;
    }
    setSrcDoc(
      buildPreviewHTML({
        sections: project.sections,
        globalCss: project.globalCss,
        globalJs: project.globalJs,
        editable,
        selectedId: null,
        assets: project.assets,
      }),
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuralKey, htmlKey]);

  useEffect(() => {
    const doc = iframeRef.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll("[data-wto-section]").forEach((el) => {
      el.classList.toggle("wto-selected", el.getAttribute("data-wto-section") === selectedId);
    });
  }, [selectedId, srcDoc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __wtoEditable: boolean }).__wtoEditable = editable;
    function onMsg(e: MessageEvent) {
      const data = e.data as { __wto?: boolean; type?: string; payload?: Record<string, unknown> };
      if (!data || !data.__wto) return;
      if (data.type === "select") select(String(data.payload?.sectionId ?? ""));
      if (data.type === "section-html") {
        // Iframe already has the updated DOM — skip srcDoc rebuild to preserve scroll.
        skipRebuildRef.current = true;
        setSectionHtml(String(data.payload?.sectionId ?? ""), String(data.payload?.html ?? ""));
      }
      if (data.type === "image-click")
        setImageEditor({
          sectionId: String(data.payload?.sectionId ?? ""),
          src: String(data.payload?.src ?? ""),
          idx: data.payload?.idx != null ? String(data.payload.idx) : null,
          kind: (data.payload?.kind as "img" | "box") ?? "img",
        });
      if (data.type === "console") {
        window.dispatchEvent(new CustomEvent("wto-console", { detail: data.payload }));
      }
    }
    window.addEventListener("message", onMsg);
    return () => window.removeEventListener("message", onMsg);
  }, [editable, select, setSectionHtml]);

  const width = device === "desktop" ? "1180px" : device === "tablet" ? "820px" : "390px";

  return (
    <div className="w-full h-full flex justify-center items-start overflow-auto bg-muted/40 p-4">
      <div
        className="bg-white shadow-xl transition-all"
        style={{ width, minHeight: "calc(100% - 2rem)", flex: "0 0 auto" }}
      >
        <iframe
          ref={iframeRef}
          title="preview"
          srcDoc={srcDoc}
          className={`w-full h-[calc(100vh-180px)] border-0 ${disablePointerEvents ? "pointer-events-none" : ""}`}
        />
      </div>
      {imageEditor && (
        <ImageEditorModal
          initialSrc={imageEditor.src}
          resolvedPreview={resolveAssetPaths(imageEditor.src, project?.assets)}
          onUpload={(dataUrl, ext) => addAsset(dataUrl, ext)}
          onClose={() => setImageEditor(null)}
          onApply={(newSrc) => {
            if (!project) return;
            const section = project.sections.find((s) => s.id === imageEditor.sectionId);
            if (!section) return;
            const nextHtml = replaceImageAt(section.html, imageEditor, newSrc);
            updateSection(section.id, { html: nextHtml });
            setImageEditor(null);
          }}
          onRemove={() => {
            if (!project) return;
            const section = project.sections.find((s) => s.id === imageEditor.sectionId);
            if (!section) return;
            const nextHtml = removeImageAt(section.html, imageEditor);
            updateSection(section.id, { html: nextHtml });
            setImageEditor(null);
          }}
        />
      )}
    </div>
  );
}

function findByIdx(root: ParentNode, idx: string): Element | null {
  return root.querySelector(`[data-wto-idx="${CSS.escape(idx)}"]`);
}

function parseSection(html: string) {
  return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
}

// Strip gradient / background color utility classes so the replacement image
// isn't tinted; keep sizing / rounding / aspect classes.
function cleanGradientClasses(cls: string) {
  return cls
    .split(/\s+/)
    .filter(
      (c) =>
        !/^bg-gradient/.test(c) &&
        !/^from-/.test(c) &&
        !/^via-/.test(c) &&
        !/^to-/.test(c) &&
        !/^bg-\[/.test(c),
    )
    .join(" ");
}

function replaceImageAt(
  html: string,
  target: { idx: string | null; src: string; kind: "img" | "box" },
  newSrc: string,
): string {
  const doc = parseSection(html);
  let el: Element | null = null;
  if (target.idx) el = findByIdx(doc.body, target.idx);
  if (!el && target.src && target.kind === "img") {
    el = doc.body.querySelector(`img[src="${cssAttr(target.src)}"]`);
  }
  if (!el) return html;

  if (el.tagName === "IMG") {
    el.setAttribute("src", newSrc);
  } else {
    // Convert decorative box → <img> while preserving sizing/rounding classes.
    const img = doc.createElement("img");
    const cls = cleanGradientClasses(el.getAttribute("class") ?? "");
    img.setAttribute("class", (cls + " object-cover w-full h-full").trim());
    img.setAttribute("src", newSrc);
    img.setAttribute("alt", "");
    // Wrap the img in a container that preserves original box sizing.
    const wrapper = doc.createElement("div");
    wrapper.setAttribute("class", el.getAttribute("class") ?? "");
    wrapper.setAttribute("style", (el.getAttribute("style") ?? "") + ";overflow:hidden");
    wrapper.appendChild(img);
    el.replaceWith(wrapper);
  }
  return doc.body.innerHTML;
}

function removeImageAt(
  html: string,
  target: { idx: string | null; src: string; kind: "img" | "box" },
): string {
  const doc = parseSection(html);
  let el: Element | null = null;
  if (target.idx) el = findByIdx(doc.body, target.idx);
  if (!el && target.src && target.kind === "img") {
    el = doc.body.querySelector(`img[src="${cssAttr(target.src)}"]`);
  }
  if (!el) return html;
  if (el.tagName === "IMG") {
    el.remove();
  } else {
    // Reset a box back to a neutral gradient placeholder.
    const cls = cleanGradientClasses(el.getAttribute("class") ?? "");
    el.setAttribute("class", (cls + " bg-gradient-to-br from-slate-300 to-slate-500").trim());
    el.innerHTML = "";
  }
  return doc.body.innerHTML;
}

function cssAttr(s: string) {
  return s.replace(/"/g, '\\"');
}

function ImageEditorModal({
  initialSrc,
  onClose,
  onApply,
  onRemove,
}: {
  initialSrc: string;
  onClose: () => void;
  onApply: (src: string) => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState(initialSrc);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold">Edit Image</h3>
        <div className="mt-4 aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={url} alt="preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-muted-foreground text-sm">No image</span>
          )}
        </div>
        <div className="mt-4 space-y-3">
          <label className="text-sm font-medium">Image URL</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://…"
          />
          <label className="block">
            <span className="text-sm font-medium">Upload from device</span>
            <input
              type="file"
              accept="image/*"
              className="mt-1 block w-full text-sm"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const r = new FileReader();
                r.onload = () => setUrl(String(r.result));
                r.readAsDataURL(f);
              }}
            />
          </label>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-accent"
            onClick={onRemove}
          >
            Remove
          </button>
          <button
            className="px-4 py-2 text-sm rounded-lg border border-input hover:bg-accent"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 text-sm rounded-lg bg-primary text-primary-foreground hover:bg-primary/90"
            onClick={() => onApply(url)}
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
