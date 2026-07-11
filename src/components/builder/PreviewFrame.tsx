import { useEffect, useMemo, useRef, useState } from "react";
import { UploadCloud } from "lucide-react";
import { useBuilder, pageOf } from "@/lib/builder/store";
import { buildPreviewHTML, resolveAssetPaths } from "@/lib/builder/preview";

interface Props {
  editable?: boolean;
  disablePointerEvents?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export function PreviewFrame({ editable = true, disablePointerEvents = false, iframeRef }: Props) {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));
  const selectedId = useBuilder((s) => s.selectedSectionId);
  const device = useBuilder((s) => s.device);
  const select = useBuilder((s) => s.selectSection);
  const selectPage = useBuilder((s) => s.selectPage);
  const setSectionHtml = useBuilder((s) => s.setSectionHtml);
  const updateSection = useBuilder((s) => s.updateSection);
  const addAsset = useBuilder((s) => s.addAsset);
  const innerIframeRef = useRef<HTMLIFrameElement>(null);
  const iframeRefToUse = iframeRef ?? innerIframeRef;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [imageEditor, setImageEditor] = useState<{
    sectionId: string;
    src: string;
    idx: string | null;
    path?: string | null;
    kind: "img" | "box";
  } | null>(null);
  const skipRebuildRef = useRef(false);
  const [srcDoc, setSrcDoc] = useState("");
  const [previewCycle, setPreviewCycle] = useState(0);
  const pendingScrollTopRef = useRef<number | null>(null);
  const pendingOuterScrollTopRef = useRef<number | null>(null);

  function assetPathForDataUrl(src: string) {
    if (!project || !src.startsWith("data:")) return src;
    const asset = Object.entries(project.assets ?? {}).find(([_name, data]) => data === src);
    return asset ? `images/${asset[0]}` : src;
  }

  const restoreOuterScroll = () => {
    const top = pendingOuterScrollTopRef.current;
    if (top == null) return;
    const wrapper = wrapperRef.current;
    if (wrapper) wrapper.scrollTop = top;
    pendingOuterScrollTopRef.current = null;
  };

  const restoreSavedScroll = () => {
    const iframe = iframeRefToUse.current;
    const win = iframe?.contentWindow;
    const scrollTop = pendingScrollTopRef.current;
    if (win && scrollTop != null) {
      win.scrollTo(0, scrollTop);
    }
    pendingScrollTopRef.current = null;
    restoreOuterScroll();
  };

  // Rebuild srcDoc for structural changes OR html changes that did NOT come from
  // inside the iframe. This prevents scroll jumps while inline-editing text.
  const structuralKey = useMemo(() => {
    if (!project) return "";
    return JSON.stringify({
      ids: (pageOf(project)?.sections ?? []).map((s: any) => s.id + ":" + (s.collapsed ? 1 : 0)),
      styles: (pageOf(project)?.sections ?? []).map((s: any) => s.style),
      classes: (pageOf(project)?.sections ?? []).map((s: any) => s.className),
      domIds: (pageOf(project)?.sections ?? []).map((s: any) => s.domId),
      css: project.globalCss,
      js: project.globalJs,
      editable,
      assets: project.assets ? Object.keys(project.assets).join(",") : "",
      pageId: project.currentPageId,
      updatedAt: project.updatedAt,
    });
  }, [project, editable]);
  const htmlKey = useMemo(
    () => (pageOf(project)?.sections ?? []).map((s: any) => s.html).join("\u0001") ?? "",
    [project],
  );

  useEffect(() => {
    if (!project) return;
    const build = () => {
      const iframeWindow = iframeRefToUse.current?.contentWindow;
      if (iframeWindow) {
        pendingScrollTopRef.current = iframeWindow.scrollY ?? iframeWindow.pageYOffset ?? 0;
      }
      pendingOuterScrollTopRef.current = wrapperRef.current?.scrollTop ?? null;
      setSrcDoc(
        buildPreviewHTML({
          sections: (pageOf(project)?.sections ?? []),
          globalCss: project.globalCss,
          globalJs: project.globalJs,
          editable,
          selectedId,
          assets: project.assets,
          pages: project.pages?.map((p) => ({ id: p.id, slug: p.slug })) ?? [],
          description: pageOf(project)?.description,
          keywords: pageOf(project)?.keywords,
          customHead: project.customHead,
        }),
      );
    };

    if (skipRebuildRef.current) {
      skipRebuildRef.current = false;
      const timeout = window.setTimeout(build, 100);
      return () => window.clearTimeout(timeout);
    }

    build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuralKey, htmlKey, previewCycle]);

  useEffect(() => {
    const doc = iframeRefToUse.current?.contentDocument;
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
      if (data.type === "navigate-page") {
        const slug = String(data.payload?.slug ?? "");
        if (!slug || !project) return;
        const page = project.pages.find((p) => p.slug === slug);
        if (page) selectPage(page.id);
      }
      if (data.type === "section-html") {
        // Iframe already has the updated DOM — skip srcDoc rebuild to preserve scroll.
        skipRebuildRef.current = true;
        setSectionHtml(String(data.payload?.sectionId ?? ""), String(data.payload?.html ?? ""));
        setPreviewCycle((value) => value + 1);
        useBuilder.getState().persist();
      }
    // handle brand upload requests from preview runtime
    async function handleBrandUpload(payload: any) {
      const sid = String(payload?.sectionId ?? "");
      if (!sid || !project) return;
      const section = (pageOf(project)?.sections ?? []).find((s: any) => s.id === sid);
      if (!section) return;
      const doc = new DOMParser().parseFromString(`<body>${section.html}</body>`, 'text/html');
      const brand = findBrandAnchorInDoc(doc);
      const currentSrc = brand?.querySelector('img')?.getAttribute('src') || "";
      setImageEditor({ sectionId: sid, src: assetPathForDataUrl(currentSrc), idx: null, kind: 'img' });
    }
      if (data.type === "image-click")
        setImageEditor({
          sectionId: String(data.payload?.sectionId ?? ""),
          src: assetPathForDataUrl(String(data.payload?.src ?? "")),
          idx: data.payload?.idx != null ? String(data.payload.idx) : null,
          path: data.payload?.path ? String(data.payload.path) : null,
          kind: (data.payload?.kind as "img" | "box") ?? "img",
        });
      // Inline toolbar actions from preview runtime
      if (data.type === "section-action") {
        const sid = String(data.payload?.sectionId ?? "");
        const act = String(data.payload?.action ?? "");
        if (!sid) return;
        const state = useBuilder.getState();
        const cur = state.currentProject();
        const moveByIndex = (from: number, to: number) => {
          const move = state.moveSection;
          if (from != null && to != null) move(from, to);
        };
        // map actions
        const secs = cur ? pageOf(cur)?.sections ?? [] : [];
        const fromIdx = secs.findIndex((s: any) => s.id === sid);
        if (act === "up" && fromIdx > 0) moveByIndex(fromIdx, fromIdx - 1);
        if (act === "down" && fromIdx >= 0 && fromIdx < secs.length - 1) moveByIndex(fromIdx, fromIdx + 1);
        if (act === "top" && fromIdx > 0) moveByIndex(fromIdx, 0);
        if (act === "bottom" && fromIdx >= 0) moveByIndex(fromIdx, secs.length - 1);
        if (act === "dup") state.duplicateSection(sid);
        if (act === "hide") state.toggleHidden(sid);
        if (act === "del") state.removeSection(sid);
      }
      if (data.type === "section-move") {
        const fromId = String(data.payload?.fromId ?? "");
        const toId = String(data.payload?.toId ?? "");
        const before = !!data.payload?.before;
        const state = useBuilder.getState();
        const cur = state.currentProject();
        if (!fromId || !toId || !cur) return;
        const secs = pageOf(cur)?.sections ?? [];
        const fromIdx = secs.findIndex((s: any) => s.id === fromId);
        const toIdx = secs.findIndex((s: any) => s.id === toId);
        if (fromIdx < 0 || toIdx < 0) return;
        const target = before ? toIdx : toIdx + 1;
        state.moveSection(fromIdx, target > fromIdx ? target - 1 : target);
      }
      if (data.type === "console") {
        window.dispatchEvent(new CustomEvent("wto-console", { detail: data.payload }));
      }
      if (data.type === 'brand-upload') handleBrandUpload(data.payload || {});
    }
    window.addEventListener("message", onMsg);
    // Debug: log forwarded iframe console messages to parent console for easier debugging
    function onWtoConsole(ev: Event) {
      try {
        // detail has { level, args }
        const detail = (ev as CustomEvent).detail;
        const level = String(detail?.level || 'log');
        const args = Array.isArray(detail?.args) ? detail.args : [detail?.args];
        const method = console[level as keyof Console] as ((...args: unknown[]) => void) | undefined;
        // prefix so it's easy to find
        method?.('[wto-iframe]', ...args);
      } catch (err) {
        console.error('wto-iframe console handler error', err);
      }
    }
    window.addEventListener('wto-console', onWtoConsole as EventListener);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener('wto-console', onWtoConsole as EventListener);
    };
  }, [editable, project, select, selectPage, setSectionHtml]);

  const width = device === "desktop" ? "1180px" : device === "tablet" ? "820px" : "390px";

  return (
    <div ref={wrapperRef} className="w-full h-full min-h-0 flex items-stretch overflow-hidden bg-muted/40 p-4">
      <div className="bg-white shadow-xl transition-all flex min-h-0 flex-1 flex-col h-full" style={{ width, maxWidth: "100%", overflowX: "hidden" }}>
        <iframe
          ref={iframeRefToUse}
          title="preview"
          srcDoc={srcDoc}
          onLoad={restoreSavedScroll}
          className={`w-full h-full border-0 ${disablePointerEvents ? "pointer-events-none" : ""}`}
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
            const section = (pageOf(project)?.sections ?? []).find((s: any) => s.id === imageEditor.sectionId);
            if (!section) return;
            const nextHtml = replaceImageAt(section.html, imageEditor, newSrc);
            updateSection(section.id, { html: nextHtml });
            setImageEditor(null);
          }}
          onRemove={() => {
            if (!project) return;
            const section = (pageOf(project)?.sections ?? []).find((s: any) => s.id === imageEditor.sectionId);
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
  // Support legacy numeric idx (data-wto-idx) and path strings like "1,3,2"
  if (!idx) return null;
  if (idx.includes(',')) {
    const parts = idx.split(',').map((p) => Number(p));
    let cur: Element | null = root as Element | null;
    for (const p of parts) {
      if (!cur || !cur.children || cur.children.length <= p) return null;
      cur = cur.children[p] as Element | null;
    }
    return cur;
  }
  return root.querySelector(`[data-wto-idx="${CSS.escape(idx)}"]`);
}

function parseSection(html: string) {
  return new DOMParser().parseFromString(`<body>${html}</body>`, "text/html");
}

function findBrandAnchorInDoc(doc: Document) {
  const header = doc.body.querySelector("header");
  const nav = doc.body.querySelector("nav") ?? doc.body.querySelector("[data-wto-nav]");
  const anchors = header ? Array.from(header.querySelectorAll("a")) : [];
  if (nav) anchors.push(...Array.from(nav.querySelectorAll("a")));
  const brand =
    anchors.find((a) => !a.closest("ul") && !a.closest("li") && !a.closest("[data-wto-nav-menu]") && ((a.getAttribute("href") || "").trim() === "#top" || (header && a.closest("header") && !a.closest("nav")))) ||
    anchors.find((a) => !a.closest("ul") && !a.closest("li") && !a.closest("[data-wto-nav-menu]"));
  return brand ?? null;
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
  target: { idx: string | null; path?: string | null; src: string; kind: "img" | "box" },
  newSrc: string,
): string {
  const doc = parseSection(html);
  const root =
    doc.body.children.length === 1 && doc.body.firstElementChild?.tagName.toLowerCase() === "section"
      ? (doc.body.firstElementChild as Element)
      : doc.body;
  let el: Element | null = null;
  if (target.idx) el = findByIdx(root, target.idx);
  if (!el && target.path) el = findByIdx(root, target.path);
  if (!el && target.src && target.kind === "img") {
    el = doc.body.querySelector(`img[src="${cssAttr(target.src)}"]`);
  }
  if (!el && target.kind === "img") {
    const brand = findBrandAnchorInDoc(doc);
    if (brand) {
      brand.innerHTML = "";
      const img = doc.createElement("img");
      img.setAttribute("src", newSrc);
      img.setAttribute("alt", "logo");
      img.setAttribute("style", "height:40px;width:auto;object-fit:contain;");
      brand.appendChild(img);
      return doc.body.innerHTML;
    }
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
  target: { idx: string | null; path?: string | null; src: string; kind: "img" | "box" },
): string {
  const doc = parseSection(html);
  const root =
    doc.body.children.length === 1 && doc.body.firstElementChild?.tagName.toLowerCase() === "section"
      ? (doc.body.firstElementChild as Element)
      : doc.body;
  let el: Element | null = null;
  if (target.idx) el = findByIdx(root, target.idx);
  if (!el && target.path) el = findByIdx(root, target.path);
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
  resolvedPreview,
  onUpload,
  onClose,
  onApply,
  onRemove,
}: {
  initialSrc: string;
  resolvedPreview: string;
  onUpload: (dataUrl: string, ext?: string) => string;
  onClose: () => void;
  onApply: (src: string) => void;
  onRemove: () => void;
}) {
  const [url, setUrl] = useState(initialSrc);
  const [previewUrl, setPreviewUrl] = useState(resolvedPreview);
  useEffect(() => {
    setUrl(initialSrc);
    setPreviewUrl(resolvedPreview);
  }, [initialSrc, resolvedPreview]);
  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-lg p-6">
        <h3 className="text-lg font-bold">Edit Image</h3>
        <div className="mt-4 aspect-video bg-muted rounded-lg overflow-hidden flex items-center justify-center">
          {previewUrl || url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={previewUrl || url} alt="preview" className="max-w-full max-h-full object-contain" />
          ) : (
            <span className="text-muted-foreground text-sm">No image</span>
          )}
        </div>
        <div className="mt-4 space-y-3">
          <label className="text-sm font-medium">Image URL</label>
          <input
            className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm"
            value={url}
            onChange={(e) => { setUrl(e.target.value); setPreviewUrl(e.target.value); }}
            placeholder="https://..."
          />
          <div className="space-y-2">
            <span className="text-sm font-medium">Upload from device</span>
            <label className="inline-flex items-center gap-2 rounded-lg border border-input bg-muted px-3 py-2 text-sm font-medium text-foreground cursor-pointer hover:bg-accent/10">
              <UploadCloud className="h-4 w-4" />
              Choose file
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={(e) => {
                  const f = e.currentTarget.files?.[0];
                  if (!f) return;
                  const r = new FileReader();
                  r.onload = () => {
                    const dataUrl = String(r.result);
                    const ext = f.name.split(".").pop();
                    const path = onUpload(dataUrl, ext);
                    setUrl(path || dataUrl);
                    setPreviewUrl(dataUrl);
                    e.currentTarget.value = "";
                  };
                  r.readAsDataURL(f);
                }}
              />
            </label>
          </div>
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
