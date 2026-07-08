import { useEffect, useMemo, useRef, useState } from "react";
import { useBuilder } from "@/lib/builder/store";
import { buildPreviewHTML } from "@/lib/builder/preview";

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
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [imageEditor, setImageEditor] = useState<{ sectionId: string; src: string } | null>(null);

  const srcDoc = useMemo(() => {
    if (!project) return "";
    return buildPreviewHTML({
      sections: project.sections,
      globalCss: project.globalCss,
      globalJs: project.globalJs,
      editable,
      selectedId: null,
    });
  }, [project, editable]);

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
      if (data.type === "section-html")
        setSectionHtml(String(data.payload?.sectionId ?? ""), String(data.payload?.html ?? ""));
      if (data.type === "image-click")
        setImageEditor({
          sectionId: String(data.payload?.sectionId ?? ""),
          src: String(data.payload?.src ?? ""),
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
          onClose={() => setImageEditor(null)}
          onApply={(newSrc) => {
            if (!project) return;
            const section = project.sections.find((s) => s.id === imageEditor.sectionId);
            if (!section) return;
            const nextHtml = section.html.replace(
              new RegExp(`(src=["'])${escapeRegExp(imageEditor.src)}(["'])`),
              `$1${newSrc}$2`,
            );
            updateSection(section.id, { html: nextHtml });
            setImageEditor(null);
          }}
          onRemove={() => {
            if (!project) return;
            const section = project.sections.find((s) => s.id === imageEditor.sectionId);
            if (!section) return;
            const nextHtml = section.html.replace(
              new RegExp(`<img[^>]*src=["']${escapeRegExp(imageEditor.src)}["'][^>]*>`),
              "",
            );
            updateSection(section.id, { html: nextHtml });
            setImageEditor(null);
          }}
        />
      )}
    </div>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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
