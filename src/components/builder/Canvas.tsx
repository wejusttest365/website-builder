import { useBuilder, pageOf, composePageSections, SHARED_HEADER_SECTION_ID, SHARED_FOOTER_SECTION_ID } from "@/lib/builder/store";
import { SECTION_LIBRARY } from "@/lib/builder/sections";
import { useEffect, useMemo, useRef, useState } from "react";
import { useMounted } from "@/hooks/use-mounted";
import { APP_CSS_HREF, buildPreviewHTML } from "@/lib/builder/preview";
import { getImageObjectUrl } from "@/lib/builder/image-storage";
import { createWidgetInstance, createWidgetSectionTemplate, getWidgetRegistration } from "@/components/builder/widgets/widgetRegistry";
import { buildContainerChildData, createContainerChildItem } from "@/components/builder/widgets/Container/ContainerTypes";
import { createGridColumn, getEqualColumnSpan, resolveGridColumnCount } from "@/components/builder/widgets/Grid/GridTypes";
import { nanoid } from "nanoid";
import { UploadCloud } from "lucide-react";

function composedInsertToPageIndex(project: NonNullable<ReturnType<typeof useBuilder.getState>["currentProject"]>, insertIndex: number) {
  const page = pageOf(project);
  const composed = composePageSections(project, page, { includeHiddenChrome: true });
  let pageIdx = 0;
  const max = Math.max(0, Math.min(insertIndex, composed.length));
  for (let i = 0; i < max; i++) {
    const section = composed[i];
    if (!section) continue;
    if (section.id === SHARED_HEADER_SECTION_ID || section.id === SHARED_FOOTER_SECTION_ID || section.shared === "header" || section.shared === "footer") {
      continue;
    }
    pageIdx += 1;
  }
  return pageIdx;
}

interface Props {
  editable?: boolean;
  disablePointerEvents?: boolean;
  iframeRef?: React.RefObject<HTMLIFrameElement | null>;
}

export function Canvas({ editable = true, disablePointerEvents = false, iframeRef }: Props) {
  const project = useBuilder((s) => (s.currentProjectId ? s.projects[s.currentProjectId] : null));

  const selectedId = useBuilder((s) => s.selectedSectionId);
  const device = useBuilder((s) => s.device);
  const select = useBuilder((s) => s.selectSection);
  const selectElement = useBuilder((s) => s.selectElement);
  const selectPage = useBuilder((s) => s.selectPage);
  const selectedElement = useBuilder((s) => s.selectedElement);
  const setSelectedElementStyle = useBuilder((s) => s.setSelectedElementStyle);
  const setSectionHtml = useBuilder((s) => s.setSectionHtml);
  const remove = useBuilder((s) => s.removeSection);
  const dup = useBuilder((s) => s.duplicateSection);
  const move = useBuilder((s) => s.moveSection);
  const toggleCollapsed = useBuilder((s) => s.toggleCollapsed);
  const updateSection = useBuilder((s) => s.updateSection);
  const addSection = useBuilder((s) => s.addSection);
  const setLeftPanelView = useBuilder((s) => s.setLeftPanelView);
  const setLeftPanelOpen = useBuilder((s) => s.setLeftPanelOpen);
  const [screenshotPending, setScreenshotPending] = useState(false);
  const [draggingLibrarySection, setDraggingLibrarySection] = useState(false);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const libraryDragRef = useRef<{ kind?: string; widgetId?: string; variant?: string; sectionId?: string } | null>(null);
  const [srcDoc, setSrcDoc] = useState("");
  const [placeholderIndex, setPlaceholderIndex] = useState<number | null>(null);
  const [containerDropTarget, setContainerDropTarget] = useState<{ containerId: string; insertIndex: number } | null>(null);
  const [previewCycle, setPreviewCycle] = useState(0);
  const skipRebuildRef = useRef(false);
  const innerIframeRef = useRef<HTMLIFrameElement | null>(null);
  const iframeRefToUse = iframeRef ?? innerIframeRef;
  const wrapperRef = useRef<HTMLDivElement>(null);
  const pendingScrollTopRef = useRef<number | null>(null);
  const pendingOuterScrollTopRef = useRef<number | null>(null);
  const mounted = useMounted();

  async function resolvePreviewAssets() {
    if (!project?.assets) return {} as Record<string, string>;
    const resolvedEntries = await Promise.all(
      Object.entries(project.assets).map(async ([name, value]) => {
        if (typeof value === "string") return [name, value] as const;
        const candidate = value?.src && /^(data:|https?:|blob:)/i.test(value.src) ? value.src : null;
        const objectUrl = value?.imageId ? await getImageObjectUrl(value.imageId) : null;
        return [name, candidate ?? objectUrl ?? `images/${value?.filename ?? name}`] as const;
      }),
    );
    return Object.fromEntries(resolvedEntries.filter((entry): entry is readonly [string, string] => !!entry[1]));
  }

  const restoreOuterScroll = () => {
    const top = pendingOuterScrollTopRef.current;
    if (top == null) return;
    const wrapper = wrapperRef.current;
    if (wrapper) wrapper.scrollTop = top;
    pendingOuterScrollTopRef.current = null;
  };

  function loadHtml2Canvas() {
    if (typeof window === "undefined") return null;
    const existing = (window as any).html2canvas;
    if (existing) return existing;

    return new Promise<any>((resolve, reject) => {
      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js";
      script.async = true;
      script.onload = () => {
        if ((window as any).html2canvas) {
          resolve((window as any).html2canvas);
        } else {
          reject(new Error("html2canvas loaded but did not initialize"));
        }
      };
      script.onerror = () => reject(new Error("Unable to load html2canvas"));
      document.body.appendChild(script);
    });
  }

  async function downloadScreenshot() {
    if (!mounted || !project || !iframeRefToUse.current) return;
    const html2canvas = await loadHtml2Canvas();
    if (!html2canvas) return;

    const iframeDoc = iframeRefToUse.current.contentDocument;
    if (!iframeDoc) return;

    const body = iframeDoc.body;
    const width = Math.max(body.scrollWidth, body.clientWidth, iframeDoc.documentElement.scrollWidth);
    const height = Math.max(body.scrollHeight, body.clientHeight, iframeDoc.documentElement.scrollHeight);

    setScreenshotPending(true);
    try {
      const canvas = await html2canvas(body as any, {
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
        backgroundColor: "#ffffff",
      });
      canvas.toBlob((blob: Blob | null) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `${project.name.replace(/\s+/g, "-").toLowerCase()}-screenshot.png`;
        link.click();
        URL.revokeObjectURL(url);
      });
    } finally {
      setScreenshotPending(false);
    }
  }

  useEffect(() => {
    function onScreenshot() {
      void downloadScreenshot();
    }
    window.addEventListener("wto-screenshot-request", onScreenshot as EventListener);
    return () => window.removeEventListener("wto-screenshot-request", onScreenshot as EventListener);
  }, [downloadScreenshot]);

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

  const sendIframeMessage = (type: string, payload?: Record<string, unknown>) => {
    const iframeWindow = iframeRefToUse.current?.contentWindow;
    if (!iframeWindow) return;
    iframeWindow.postMessage({ __wto: true, type, payload }, "*");
  };

  const scrollSectionIntoView = (sectionId: string) => {
    window.setTimeout(() => {
      const iframe = iframeRefToUse.current;
      const doc = iframe?.contentDocument;
      const section = doc?.querySelector(`[data-wto-section="${sectionId}"]`) as HTMLElement | null;
      if (!section) return;
      section.scrollIntoView({ block: "center", behavior: "smooth" });
      const view = doc?.defaultView;
      if (view) {
        const top = view.scrollY + section.getBoundingClientRect().top - 120;
        view.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      }
    }, 80);
  };

  useEffect(() => {
    if (!mounted) return;
    const iframeWindow = iframeRefToUse.current?.contentWindow;
    if (!iframeWindow) return;
    try {
      iframeWindow.postMessage({ __wto: true, type: 'set-selected-section', payload: { sectionId: selectedId } }, '*');
    } catch (_) {}
  }, [mounted, selectedId]);

  useEffect(() => {
    if (!draggingLibrarySection) {
      sendIframeMessage("hide-drop-target");
      setPlaceholderIndex(null);
      setContainerDropTarget(null);
    }
  }, [draggingLibrarySection]);

  const structuralKey = useMemo(() => {
    if (!project) return "";
    const page = pageOf(project);
    const sections = composePageSections(project, page, { includeHiddenChrome: true });
    return JSON.stringify({
      ids: sections.map((s: any) => s.id + ":" + (s.collapsed ? 1 : 0) + ":" + (s.hidden ? 1 : 0)),
      styles: sections.map((s: any) => s.style),
      classes: sections.map((s: any) => s.className),
      domIds: sections.map((s: any) => s.domId),
      sharedHeader: project.sharedHeader?.widgetInstance ?? null,
      sharedFooter: project.sharedFooter?.widgetInstance ?? null,
      pageChrome: {
        useGlobalHeader: page?.useGlobalHeader,
        useGlobalFooter: page?.useGlobalFooter,
        hideHeader: page?.hideHeader,
        hideFooter: page?.hideFooter,
      },
      // Grid-only fingerprint: column/child updates must rebuild canvas even when updatedAt collides.
      grids: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "grid") return null;
        const columns = Array.isArray(widget.content?.columns) ? widget.content.columns : [];
        return {
          id: widget.id,
          variant: widget.variant,
          layoutColumns: widget.layout?.columns ?? null,
          columnIds: columns.map((column: any) => column?.id ?? ""),
          columnChildCounts: columns.map((column: any) => (Array.isArray(column?.children) ? column.children.length : 0)),
          columnChildIds: columns.map((column: any) =>
            Array.isArray(column?.children) ? column.children.map((child: any) => child?.id).join(",") : "",
          ),
          styleGap: widget.style?.columnGap ?? widget.style?.gap ?? null,
          responsive: widget.responsive ?? null,
        };
      }),
      carousels: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "carousel") return null;
        const slides = Array.isArray(widget.content?.slides) ? widget.content.slides : [];
        return {
          id: widget.id,
          variant: widget.variant,
          slideIds: slides.map((slide: any) => slide?.id ?? "").join(","),
          slideSrcs: slides
            .map((slide: any) => {
              const src = slide?.src;
              if (typeof src === "string") return src;
              if (src && typeof src === "object") return String(src.url || src.src || src.filename || "");
              return "";
            })
            .join("|"),
          selectedSlideId: widget.content?.selectedSlideId ?? null,
          style: widget.style ?? null,
          contentFlags: {
            autoplay: widget.content?.autoplay ?? false,
            autoplayDelay: widget.content?.autoplayDelay ?? 5000,
            infiniteLoop: widget.content?.infiniteLoop ?? true,
            pauseOnHover: widget.content?.pauseOnHover ?? true,
            transitionDuration: widget.content?.transitionDuration ?? 500,
            keyboardNavigation: widget.content?.keyboardNavigation ?? true,
            swipeNavigation: widget.content?.swipeNavigation ?? true,
          },
          responsive: widget.responsive ?? null,
          advanced: widget.advanced ?? null,
        };
      }),
      galleries: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "gallery") return null;
        const images = Array.isArray(widget.content?.images) ? widget.content.images : [];
        return {
          id: widget.id,
          variant: widget.variant,
          imageIds: images.map((item: any) => item?.id ?? "").join(","),
          imageSrcs: images
            .map((item: any) => {
              const src = item?.src;
              if (typeof src === "string") return src;
              if (src && typeof src === "object") return String(src.url || src.src || src.filename || "");
              return "";
            })
            .join("|"),
          selectedImageId: widget.content?.selectedImageId ?? null,
          style: widget.style ?? null,
          layout: widget.layout ?? null,
          responsive: widget.responsive ?? null,
          advanced: widget.advanced ?? null,
        };
      }),
      faqs: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "faq") return null;
        const items = Array.isArray(widget.content?.items) ? widget.content.items : [];
        return {
          id: widget.id,
          variant: widget.variant,
          itemIds: items.map((item: any) => item?.id ?? "").join(","),
          itemText: items
            .map((item: any) => `${item?.question ?? ""}|${item?.answer ?? ""}|${item?.enabled !== false ? 1 : 0}`)
            .join("||"),
          selectedItemId: widget.content?.selectedItemId ?? null,
          contentFlags: {
            allowMultiple: widget.content?.allowMultiple ?? false,
            defaultOpenItemId: widget.content?.defaultOpenItemId ?? null,
            openAllByDefault: widget.content?.openAllByDefault ?? false,
            closeAllByDefault: widget.content?.closeAllByDefault ?? false,
          },
          style: widget.style ?? null,
          layout: widget.layout ?? null,
          responsive: widget.responsive ?? null,
          advanced: widget.advanced ?? null,
        };
      }),
      servicesSections: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "services") return null;
        const services = Array.isArray(widget.content?.services) ? widget.content.services : [];
        return {
          id: widget.id,
          variant: widget.variant,
          serviceIds: services.map((item: any) => item?.id ?? "").join(","),
          serviceSrcs: services
            .map((item: any) => {
              const src = item?.src;
              if (typeof src === "string") return src;
              if (src && typeof src === "object") return String(src.url || src.src || src.filename || "");
              return "";
            })
            .join("|"),
          serviceText: services
            .map((item: any) => `${item?.heading ?? ""}|${item?.description ?? ""}|${item?.buttonLabel ?? ""}|${item?.buttonUrl ?? ""}|${item?.showHeading !== false ? 1 : 0}|${item?.showDescription !== false ? 1 : 0}|${item?.showButton !== false ? 1 : 0}`)
            .join("||"),
          selectedServiceId: widget.content?.selectedServiceId ?? null,
          style: widget.style ?? null,
          layout: widget.layout ?? null,
          responsive: widget.responsive ?? null,
          advanced: widget.advanced ?? null,
        };
      }),
      abouts: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "about") return null;
        const features = Array.isArray(widget.content?.features) ? widget.content.features : [];
        return {
          id: widget.id,
          variant: widget.variant,
          contentFlags: {
            showEyebrow: widget.content?.showEyebrow !== false,
            showHeading: widget.content?.showHeading !== false,
            showDescription: widget.content?.showDescription !== false,
            showFeatures: widget.content?.showFeatures !== false,
            showButton: widget.content?.showButton !== false,
            showImage: widget.content?.showImage !== false,
            eyebrow: widget.content?.eyebrow ?? "",
            heading: widget.content?.heading ?? "",
            description: widget.content?.description ?? "",
            buttonLabel: widget.content?.buttonLabel ?? "",
            buttonUrl: widget.content?.buttonUrl ?? "",
            imageSrc:
              typeof widget.content?.imageSrc === "string"
                ? widget.content.imageSrc
                : String(widget.content?.imageSrc?.url || widget.content?.imageSrc?.src || ""),
          },
          featureIds: features.map((item: any) => item?.id ?? "").join(","),
          featureText: features.map((item: any) => `${item?.text ?? ""}|${item?.icon ?? ""}`).join("||"),
          style: widget.style ?? null,
          layout: widget.layout ?? null,
          responsive: widget.responsive ?? null,
          advanced: widget.advanced ?? null,
        };
      }),
      ctas: sections.map((s: any) => {
        const widget = s.widgetInstance;
        if (!widget || widget.type !== "cta") return null;
        return {
          id: widget.id,
          variant: widget.variant,
          contentFlags: {
            showEyebrow: widget.content?.showEyebrow !== false,
            showHeading: widget.content?.showHeading !== false,
            showParagraph: widget.content?.showParagraph !== false,
            showPrimaryButton: widget.content?.showPrimaryButton !== false,
            showSecondaryButton: widget.content?.showSecondaryButton !== false,
            eyebrow: widget.content?.eyebrow ?? "",
            heading: widget.content?.heading ?? "",
            paragraph: widget.content?.paragraph ?? "",
            primaryButtonLabel: widget.content?.primaryButtonLabel ?? "",
            primaryButtonUrl: widget.content?.primaryButtonUrl ?? "",
            secondaryButtonLabel: widget.content?.secondaryButtonLabel ?? "",
            secondaryButtonUrl: widget.content?.secondaryButtonUrl ?? "",
            backgroundImageSrc:
              typeof widget.content?.backgroundImageSrc === "string"
                ? widget.content.backgroundImageSrc
                : String(
                    widget.content?.backgroundImageSrc?.url ||
                      widget.content?.backgroundImageSrc?.src ||
                      "",
                  ),
            backgroundImageAlt: widget.content?.backgroundImageAlt ?? "",
          },
          style: widget.style ?? null,
          layout: widget.layout ?? null,
          responsive: widget.responsive ?? null,
          advanced: widget.advanced ?? null,
        };
      }),
      css: project.globalCss,
      js: project.globalJs,
      editable,
      assets: project.assets ? Object.keys(project.assets).join(",") : "",
      pageId: project.currentPageId,
      updatedAt: project.updatedAt,
      device,
    });
  }, [project, editable, device]);

  const htmlKey = useMemo(
    () => composePageSections(project, pageOf(project), { includeHiddenChrome: true }).map((s: any) => s.html).join("\u0001") ?? "",
    [project],
  );

  useEffect(() => {
    if (!mounted) return;
    const onStart = (event: Event) => {
      setDraggingLibrarySection(true);
      const detail = (event as CustomEvent).detail;
      if (detail && typeof detail === "object") {
        libraryDragRef.current = detail as { kind?: string; widgetId?: string; variant?: string; sectionId?: string };
      } else if (typeof detail === "string") {
        libraryDragRef.current = { kind: "section", sectionId: detail };
      } else {
        libraryDragRef.current = null;
      }
    };
    const onEnd = () => {
      setDraggingLibrarySection(false);
      libraryDragRef.current = null;
    };
    window.addEventListener("wto-library-drag-start", onStart as EventListener);
    window.addEventListener("wto-library-drag-end", onEnd);
    window.addEventListener("wto-library-drag-element-start", onStart as EventListener);
    window.addEventListener("wto-library-drag-element-end", onEnd);
    return () => {
      window.removeEventListener("wto-library-drag-start", onStart as EventListener);
      window.removeEventListener("wto-library-drag-end", onEnd);
      window.removeEventListener("wto-library-drag-element-start", onStart as EventListener);
      window.removeEventListener("wto-library-drag-element-end", onEnd);
    };
  }, [mounted]);

  useEffect(() => {
    if (!project) return;
    const build = async () => {
      const iframeWindow = iframeRefToUse.current?.contentWindow;
      if (iframeWindow) {
        pendingScrollTopRef.current = iframeWindow.scrollY ?? iframeWindow.pageYOffset ?? 0;
      }
      pendingOuterScrollTopRef.current = wrapperRef.current?.scrollTop ?? null;
      const resolvedAssets = await resolvePreviewAssets();
      setSrcDoc(
        buildPreviewHTML({
          sections: composePageSections(project, pageOf(project), { includeHiddenChrome: true }),
          globalCss: project.globalCss,
          globalJs: project.globalJs,
          editable,
          selectedId,
          assets: resolvedAssets,
          pages: project.pages?.map((p) => ({ id: p.id, slug: p.slug })) ?? [],
          description: pageOf(project)?.description,
          keywords: pageOf(project)?.keywords,
          customHead: project.customHead,
          currentPageSlug: pageOf(project)?.slug,
          previewCssHref: APP_CSS_HREF,
          device,
        }),
      );
    };

    if (skipRebuildRef.current) {
      skipRebuildRef.current = false;
      const timeout = window.setTimeout(() => {
        void build();
      }, 100);
      return () => window.clearTimeout(timeout);
    }

    void build();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [structuralKey, htmlKey, previewCycle]);

  useEffect(() => {
    const doc = iframeRefToUse.current?.contentDocument;
    if (!doc) return;
    doc.querySelectorAll("[data-wto-section]").forEach((node) => {
      const el = node as HTMLElement;
      const isSelected = el.getAttribute("data-wto-section") === selectedId;
      el.classList.toggle("wto-selected", isSelected);
      if (!isSelected) {
        el.style.outline = "";
        el.style.outlineOffset = "";
      }
    });
  }, [selectedId, srcDoc]);

  useEffect(() => {
    const doc = iframeRefToUse.current?.contentDocument;
    if (!doc?.body) return;
    if (editable) {
      doc.body.setAttribute("data-builder-edit-mode", "1");
      doc.body.setAttribute("data-builder-device", device);
    } else {
      doc.body.removeAttribute("data-builder-edit-mode");
      doc.body.removeAttribute("data-builder-device");
    }
  }, [device, editable, srcDoc]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    (window as unknown as { __wtoEditable: boolean }).__wtoEditable = editable;
    function onMsg(e: MessageEvent) {
      const data = e.data as { __wto?: boolean; type?: string; payload?: Record<string, unknown> };
      if (!data || !data.__wto) return;
      if (data.type === "select") {
        const sectionId = String(data.payload?.sectionId ?? "");
        select(sectionId);
        const elementKind = String(data.payload?.elementKind ?? "section");
        const index = data.payload?.index != null ? Number(data.payload.index) : null;
        const tag = data.payload?.tag ? String(data.payload.tag) : undefined;
        const style = data.payload?.style && typeof data.payload.style === 'object' ? (data.payload.style as Record<string, string>) : null;
        const widgetId = data.payload?.widgetId ? String(data.payload.widgetId) : null;
        const parentWidgetId = data.payload?.parentWidgetId ? String(data.payload.parentWidgetId) : null;
        const childId = data.payload?.childId ? String(data.payload.childId) : null;
        const elementKey = data.payload?.elementKey ? String(data.payload.elementKey) : null;
        const elementType = data.payload?.elementType ? String(data.payload.elementType) : null;
        const columnId = data.payload?.columnId ? String(data.payload.columnId) : null;
        const nextSelection = elementKind === "section"
          ? null
          : {
              kind: elementKind as any,
              index: Number.isFinite(index) ? index : null,
              tag,
              sectionId: sectionId || null,
              widgetId,
              parentWidgetId,
              childId,
              elementKey,
              elementType,
              columnId,
            };
        selectElement(nextSelection);
        setSelectedElementStyle(style);
      }
      if (data.type === 'open-preview-link') {
        const href = String(data.payload?.href || '');
        if (!href) return;
        try {
          const isAbsolute = /^(https?:)?\/\//i.test(href);
          const url = isAbsolute ? href : (window.location.origin + (href.startsWith('/') ? href : '/' + href));
          window.open(url, '_blank', 'noopener,noreferrer');
        } catch (_) {}
      }
      if (data.type === 'preview-form-submit') {
        const action = String(data.payload?.action || '');
        const isAbsolute = /^(https?:)?\/\//i.test(action);
        const url = isAbsolute ? action : (window.location.origin + (action.startsWith('/') ? action : '/' + action));
        try { window.open(url, '_blank', 'noopener,noreferrer'); } catch (_) {}
      }
      if (data.type === "navigate-page") {
        const slug = String(data.payload?.slug ?? "");
        if (!slug || !project) return;
        const page = project.pages.find((p) => p.slug === slug);
        if (page) {
  selectPage(page.id);
  setLeftPanelView("pages");
}
      }
      if (data.type === "section-html") {
        skipRebuildRef.current = true;
        setSectionHtml(String(data.payload?.sectionId ?? ""), String(data.payload?.html ?? ""));
        setPreviewCycle((value) => value + 1);
        useBuilder.getState().persist();
      }
      if (data.type === "element-duplicate") {
        const nextSelection = {
          sectionId: data.payload?.sectionId ? String(data.payload.sectionId) : null,
          widgetId: data.payload?.widgetId ? String(data.payload.widgetId) : null,
          elementKey: data.payload?.elementKey ? String(data.payload.elementKey) : null,
          elementType: data.payload?.elementType ? String(data.payload.elementType) : null,
          kind: data.payload?.kind ? String(data.payload.kind) : "widget",
          index: data.payload?.index != null ? Number(data.payload.index) : null,
          tag: data.payload?.tag ? String(data.payload.tag) : null,
        } as any;
        if (nextSelection.sectionId && nextSelection.widgetId) {
          useBuilder.getState().duplicateElement(nextSelection);
        }
      }
      if (data.type === "widget-add-child") {
        const sectionId = String(data.payload?.sectionId ?? "");
        const widgetId = data.payload?.widgetId ? String(data.payload.widgetId) : null;
        const parentWidgetId = data.payload?.parentWidgetId ? String(data.payload.parentWidgetId) : widgetId;
        const childType = data.payload?.childType ? String(data.payload.childType) : null;
        const widgetType = data.payload?.widgetType ? String(data.payload.widgetType) : null;
        const columnId = data.payload?.columnId ? String(data.payload.columnId) : null;
        if (!sectionId || !widgetId || !childType || !widgetType) return;
        const state = useBuilder.getState();
        const cur = state.currentProject();
        const page = cur ? pageOf(cur) : null;
        const targetSection = page?.sections.find((section: any) => section.id === sectionId);
        const containerWidget = targetSection?.widgetInstance;
        if (!containerWidget || containerWidget.id !== parentWidgetId) return;
        const registration = getWidgetRegistration(widgetType);
        const supportedTypes = registration?.childElementTypes ?? [];
        if (!supportedTypes.includes(childType)) return;
        const childInstance = createWidgetInstance(childType);
        const childItem = createContainerChildItem(childType as any, {
          id: nanoid(8),
          data: buildContainerChildData({
            content: childInstance.content,
            style: childInstance.style,
            layout: childInstance.layout,
            responsive: childInstance.responsive,
            animation: childInstance.animation,
            advanced: childInstance.advanced,
            variant: childInstance.variant,
          }),
        });

        if (containerWidget.type === "grid") {
          const desiredCount = resolveGridColumnCount(containerWidget as any);
          const equalSpan = getEqualColumnSpan(desiredCount);
          let columns = Array.isArray(containerWidget.content?.columns)
            ? containerWidget.content.columns.map((column: any) => ({
                ...column,
                children: Array.isArray(column.children) ? [...column.children] : [],
              }))
            : [];
          while (columns.length < desiredCount) {
            columns.push(createGridColumn(equalSpan));
          }
          // Prefer explicit column, else last-selected column on the grid, else Column 1.
          const liveSelected = state.selectedElement as any;
          const selectedColumnId =
            columnId ||
            (liveSelected?.widgetId === containerWidget.id ? liveSelected?.columnId : null) ||
            columns[0]?.id ||
            null;
          const targetColumnId = String(selectedColumnId ?? columns[0]?.id ?? "");
          if (!targetColumnId) return;
          const nextColumns = columns.map((column: any) => {
            if (String(column.id ?? "") !== targetColumnId) return column;
            const existingChildren = Array.isArray(column.children) ? [...column.children] : [];
            return { ...column, children: [...existingChildren, childItem] };
          });
          const matched = nextColumns.some(
            (column: any) =>
              String(column.id ?? "") === targetColumnId &&
              Array.isArray(column.children) &&
              column.children.some((child: any) => child?.id === childItem.id),
          );
          if (!matched) {
            // Fallback: still add to first column so the menu never silently no-ops.
            nextColumns[0] = {
              ...nextColumns[0],
              children: [...(Array.isArray(nextColumns[0]?.children) ? nextColumns[0].children : []), childItem],
            };
          }
          state.updateWidgetInstance(containerWidget.id, {
            ...containerWidget,
            layout: {
              ...containerWidget.layout,
              columns: desiredCount,
            },
            content: {
              ...containerWidget.content,
              columns: nextColumns,
            },
          } as any);
          state.pushHistory();
          state.selectSection(targetSection.id);
          state.selectElement({
            kind: "widget",
            sectionId: targetSection.id,
            widgetId: containerWidget.id,
            parentWidgetId: containerWidget.id,
            childId: childItem.id,
            elementKey: childItem.id,
            elementType: childType,
            columnId: matched ? targetColumnId : nextColumns[0]?.id ?? targetColumnId,
          } as any);
          return;
        }

        const nextChildren = [...(Array.isArray(containerWidget.content?.children) ? containerWidget.content.children : [])];
        nextChildren.push(childItem);
        state.updateWidgetInstance(containerWidget.id, {
          ...containerWidget,
          content: {
            ...containerWidget.content,
            children: nextChildren,
          },
        } as any);
        state.pushHistory();
        state.selectSection(targetSection.id);
        state.selectElement({
          kind: "widget",
          sectionId: targetSection.id,
          widgetId: containerWidget.id,
          parentWidgetId: containerWidget.id,
          childId: childItem.id,
          elementKey: childItem.id,
          elementType: "container",
        } as any);
        return;
      }
      if (data.type === "section-action") {
        const sid = String(data.payload?.sectionId ?? "");
        const act = String(data.payload?.action ?? "");
        if (!sid) return;
        const state = useBuilder.getState();
        const cur = state.currentProject();
        const secs = cur ? pageOf(cur)?.sections ?? [] : [];
        const fromIdx = secs.findIndex((s: any) => s.id === sid);
        if (act === "move") {
          state.selectSection(sid);
        }
        const isSharedChrome = sid === SHARED_HEADER_SECTION_ID || sid === SHARED_FOOTER_SECTION_ID;
        if (!isSharedChrome) {
          if ((act === "up" || act === "move-up") && fromIdx > 0) state.moveSection(fromIdx, fromIdx - 1);
          if ((act === "down" || act === "move-down") && fromIdx >= 0 && fromIdx < secs.length - 1) state.moveSection(fromIdx, fromIdx + 1);
          if (act === "top" && fromIdx > 0) state.moveSection(fromIdx, 0);
          if (act === "bottom" && fromIdx >= 0) state.moveSection(fromIdx, secs.length - 1);
          if (act === "dup") state.duplicateSection(sid);
          if (act === "del") state.removeSection(sid);
        }
        if (act === "hide") state.toggleHidden(sid);
        if (act === "template") {
          state.setLeftPanelView("templates");
          state.setLeftPanelOpen(true);
        }
      }
      if (data.type === "element-action") {
        const sectionId = String(data.payload?.sectionId ?? "");
        const parentWidgetId = data.payload?.parentWidgetId ? String(data.payload.parentWidgetId) : null;
        const childId = data.payload?.selectedChildId ? String(data.payload.selectedChildId) : (data.payload?.childId ? String(data.payload.childId) : (data.payload?.elementKey ? String(data.payload.elementKey) : null));
        const childContainerId = data.payload?.childContainerId ? String(data.payload.childContainerId) : (data.payload?.columnId ? String(data.payload.columnId) : null);
        const action = String(data.payload?.action ?? "");
        if (!sectionId || !parentWidgetId || !childId) return;
        const state = useBuilder.getState();
        if (action === "move-up") state.moveChildUp(sectionId, parentWidgetId, childContainerId, childId);
        if (action === "move-down") state.moveChildDown(sectionId, parentWidgetId, childContainerId, childId);
        if (action === "duplicate") state.duplicateChild(sectionId, parentWidgetId, childContainerId, childId);
        if (action === "delete") state.deleteChild(sectionId, parentWidgetId, childContainerId, childId);
      }
      if (data.type === "grid-columns") {
        const sectionId = String(data.payload?.sectionId ?? "");
        const widgetId = data.payload?.widgetId ? String(data.payload.widgetId) : null;
        const count = data.payload?.count != null ? Number(data.payload.count) : null;
        if (!sectionId || !widgetId || count == null) return;
        const state = useBuilder.getState();
        state.updateGridColumns(widgetId, count);
      }
      if (data.type === "element-style") {
        const sectionId = String(data.payload?.sectionId ?? "");
        const widgetId = data.payload?.widgetId ? String(data.payload.widgetId) : null;
        const parentWidgetId = data.payload?.parentWidgetId ? String(data.payload.parentWidgetId) : widgetId;
        const childId = data.payload?.childId ? String(data.payload.childId) : (data.payload?.elementKey ? String(data.payload.elementKey) : null);
        const elementKey = data.payload?.elementKey ? String(data.payload.elementKey) : null;
        const columnId = data.payload?.columnId ? String(data.payload.columnId) : null;
        const patch = data.payload?.stylePatch && typeof data.payload.stylePatch === "object" ? (data.payload.stylePatch as Record<string, unknown>) : null;
        if (!sectionId || !parentWidgetId || !childId || !patch) return;
        useBuilder.getState().updateWidgetElementStyle(sectionId, parentWidgetId, childId, elementKey, patch, columnId ? { columnId } : undefined);
      }
      if (data.type === "element-content") {
        const sectionId = String(data.payload?.sectionId ?? "");
        const widgetId = data.payload?.widgetId ? String(data.payload.widgetId) : null;
        const parentWidgetId = data.payload?.parentWidgetId ? String(data.payload.parentWidgetId) : widgetId;
        const childId = data.payload?.childId ? String(data.payload.childId) : (data.payload?.elementKey ? String(data.payload.elementKey) : null);
        const elementKey = data.payload?.elementKey ? String(data.payload.elementKey) : null;
        const columnId = data.payload?.columnId ? String(data.payload.columnId) : null;
        const patch = data.payload?.contentPatch && typeof data.payload.contentPatch === "object" ? (data.payload.contentPatch as Record<string, unknown>) : null;
        if (!sectionId || !parentWidgetId || !childId || !patch) return;
        useBuilder.getState().updateWidgetElementContent(sectionId, parentWidgetId, childId, elementKey, patch, columnId ? { columnId } : undefined);
      }
      if (data.type === "section-move") {
        const fromId = String(data.payload?.fromId ?? "");
        const toId = String(data.payload?.toId ?? "");
        const before = !!data.payload?.before;
        const state = useBuilder.getState();
        const cur = state.currentProject();
        if (!fromId || !toId || !cur) return;
        if (fromId === SHARED_HEADER_SECTION_ID || fromId === SHARED_FOOTER_SECTION_ID) return;
        if (toId === SHARED_HEADER_SECTION_ID || toId === SHARED_FOOTER_SECTION_ID) return;
        const secs = pageOf(cur)?.sections ?? [];
        const fromIdx = secs.findIndex((s: any) => s.id === fromId);
        const toIdx = secs.findIndex((s: any) => s.id === toId);
        if (fromIdx < 0 || toIdx < 0) return;
        const target = before ? toIdx : toIdx + 1;
        state.moveSection(fromIdx, target > fromIdx ? target - 1 : target);
      }
      if (data.type === 'placeholder-update') {
        const idx = data.payload?.insertIndex;
        if (idx == null) setPlaceholderIndex(null);
        else setPlaceholderIndex(Number(idx));
      }
      if (data.type === 'container-drop-target') {
        const containerId = data.payload?.containerId ? String(data.payload.containerId) : null;
        const insertIndex = data.payload?.insertIndex != null ? Number(data.payload.insertIndex) : null;
        if (containerId && insertIndex != null) {
          setContainerDropTarget({ containerId, insertIndex });
        } else {
          setContainerDropTarget(null);
        }
      }
      if (data.type === "console") {
        window.dispatchEvent(new CustomEvent("wto-console", { detail: data.payload }));
      }
    }
    window.addEventListener("message", onMsg);
    function onWtoConsole(ev: Event) {
      try {
        const detail = (ev as CustomEvent).detail;
        const level = String(detail?.level || "log");
        const args = Array.isArray(detail?.args) ? detail.args : [detail?.args];
        const method = console[level as keyof Console] as ((...args: unknown[]) => void) | undefined;
        method?.("[wto-iframe]", ...args);
      } catch (err) {
        console.error("wto-iframe console handler error", err);
      }
    }
    window.addEventListener("wto-console", onWtoConsole as EventListener);
    return () => {
      window.removeEventListener("message", onMsg);
      window.removeEventListener("wto-console", onWtoConsole as EventListener);
    };
  }, [editable, project, select, selectPage, setSectionHtml]);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDraggingLibrarySection(false);
    setContainerDropTarget(null);
    const elementHtml = e.dataTransfer.getData("application/x-wto-element");
    if (elementHtml && project) {
      const page = pageOf(project);
      const sectionCount = page?.sections.length ?? 0;
      if (!page || sectionCount === 0) return;
      const frame = iframeRefToUse.current;
      const frameRect = frame?.getBoundingClientRect();
      try {
        if (frame && frame.contentDocument && frameRect) {
          const relX = e.clientX - frameRect.left;
          const relY = e.clientY - frameRect.top;
          const doc = frame.contentDocument;
          const el = doc.elementFromPoint(relX, relY) as Element | null;
          const secEl = el?.closest && el.closest("[data-wto-section]");
          const sectionId = secEl?.getAttribute("data-wto-section");
          if (sectionId) {
            const target = (page.sections ?? []).find((s: any) => s.id === sectionId);
            if (target) {
              const idxEl = el?.closest && el.closest("[data-wto-idx]");
              if (idxEl) {
                const outer = (idxEl as HTMLElement).outerHTML;
                const html = target.html;
                const i = html.indexOf(outer);
                let nextHtml = html;
                if (i >= 0) {
                  nextHtml = html.slice(0, i) + elementHtml + html.slice(i);
                } else {
                  nextHtml = html + elementHtml;
                }
                useBuilder.getState().updateSection(target.id, { html: nextHtml });
                useBuilder.getState().selectSection(target.id);
                return;
              }
              useBuilder.getState().updateSection(target.id, { html: target.html + elementHtml });
              useBuilder.getState().selectSection(target.id);
              return;
            }
          }
        }
      } catch (err) {
        console.error("element drop insert error", err);
      }
      let insertIndex: number | null = placeholderIndex != null ? placeholderIndex : null;
      if (insertIndex == null) {
        if (frameRect) {
          const dropY = Math.max(frameRect.top, Math.min(e.clientY, frameRect.bottom));
          const ratio = (dropY - frameRect.top) / frameRect.height;
          insertIndex = Math.floor(ratio * sectionCount);
          if (insertIndex < 0) insertIndex = 0;
          if (insertIndex >= sectionCount) insertIndex = sectionCount - 1;
        } else {
          insertIndex = 0;
        }
      }
      const target = page.sections[insertIndex];
      if (!target) return;
      useBuilder.getState().updateSection(target.id, { html: target.html + elementHtml });
      useBuilder.getState().selectSection(target.id);
      return;
    }

    const widgetId = e.dataTransfer.getData("application/x-wto-widget") || libraryDragRef.current?.widgetId || "";
    if (widgetId && project) {
      const variant = e.dataTransfer.getData("application/x-wto-widget-variant") || libraryDragRef.current?.variant || "";
      const registration = getWidgetRegistration(widgetId);
      const childType = registration?.type;
      const supportedChildTypes = new Set(["heading", "text", "button", "image"]);

      if (containerDropTarget && childType && supportedChildTypes.has(childType)) {
        const page = pageOf(project);
        const targetSection = page?.sections.find((section: any) => section.widgetInstance?.id === containerDropTarget.containerId);
        const containerWidget = targetSection?.widgetInstance;
        if (containerWidget && Array.isArray(containerWidget.content?.children)) {
          const nextChildren = [...containerWidget.content.children];
          const childInstance = createWidgetInstance(childType, variant ? { variant } : {});
          const childItem = createContainerChildItem(childType as any, {
            id: nanoid(8),
            data: buildContainerChildData({
              content: childInstance.content,
              style: childInstance.style,
              layout: childInstance.layout,
              responsive: childInstance.responsive,
              animation: childInstance.animation,
              advanced: childInstance.advanced,
              variant: childInstance.variant,
            }),
          });
          nextChildren.splice(containerDropTarget.insertIndex, 0, childItem);
          useBuilder.getState().updateWidgetInstance(containerWidget.id, {
            ...containerWidget,
            content: {
              ...containerWidget.content,
              children: nextChildren,
            },
          } as any);
          useBuilder.getState().pushHistory();
          useBuilder.getState().selectSection(targetSection.id);
          useBuilder.getState().selectElement({
            kind: "widget",
            sectionId: targetSection.id,
            widgetId: containerWidget.id,
            parentWidgetId: containerWidget.id,
            childId: childItem.id,
            elementKey: childItem.id,
            elementType: "container",
          } as any);
          libraryDragRef.current = null;
          return;
        }
      }

      const page = pageOf(project);
      const composedCount = composePageSections(project, page, { includeHiddenChrome: true }).length;
      const sectionCount = page?.sections.length ?? 0;
      let insertIndex = sectionCount;

      const frame = iframeRefToUse.current;
      const frameRect = frame?.getBoundingClientRect();
      if (frameRect) {
        if (placeholderIndex == null) {
          const dropY = Math.max(frameRect.top, Math.min(e.clientY, frameRect.bottom));
          const ratio = (dropY - frameRect.top) / frameRect.height;
          insertIndex = composedInsertToPageIndex(project, Math.floor(ratio * (composedCount + 1)));
        } else {
          insertIndex = composedInsertToPageIndex(project, placeholderIndex);
        }
      }

      const sectionTemplate = createWidgetSectionTemplate(widgetId, variant ? { variant } : {});
      const sectionId = addSection(sectionTemplate as any, insertIndex ?? sectionCount);
      if (sectionId) {
        useBuilder.getState().selectSection(sectionId);
        scrollSectionIntoView(sectionId);
      }
      libraryDragRef.current = null;
      return;
    }

    const tplId = e.dataTransfer.getData("application/x-wto-section") || libraryDragRef.current?.sectionId || e.dataTransfer.getData("text/plain");
    if (!tplId) return;
    const tpl = SECTION_LIBRARY.find((s) => s.id === tplId);
    if (!tpl || !project) return;

    const page = pageOf(project);
    const composedCount = composePageSections(project, page, { includeHiddenChrome: true }).length;
    const sectionCount = page?.sections.length ?? 0;
    let insertIndex = sectionCount;

    const frame = iframeRefToUse.current;
    const frameRect = frame?.getBoundingClientRect();
    if (frameRect) {
      // prefer placeholder index when provided by iframe
      if (placeholderIndex == null) {
        const dropY = Math.max(frameRect.top, Math.min(e.clientY, frameRect.bottom));
        const ratio = (dropY - frameRect.top) / frameRect.height;
        insertIndex = composedInsertToPageIndex(project, Math.floor(ratio * (composedCount + 1)));
      } else {
        insertIndex = composedInsertToPageIndex(project, placeholderIndex);
      }
    }

    const sectionId = addSection(tpl, insertIndex ?? sectionCount);
    if (sectionId) {
      useBuilder.getState().selectSection(sectionId);
      scrollSectionIntoView(sectionId);
    }
    libraryDragRef.current = null;
  };

  const handleSectionDrop = (targetIndex: number) => (e: React.DragEvent) => {
    const sourceId = e.dataTransfer.getData("application/x-wto-existing-section") || draggingSectionId;
    if (!sourceId || !project) return;
    e.preventDefault();
    const fromIndex = (pageOf(project)?.sections ?? []).findIndex((s: any) => s.id === sourceId);
    if (fromIndex < 0 || fromIndex === targetIndex) return;
    move(fromIndex, targetIndex);
    setDraggingSectionId(null);
  };

  const frameWidth = device === "desktop" ? "100%" : device === "tablet" ? "820px" : "390px";
  const frameMaxWidth = device === "desktop" ? "100%" : "100%";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div
        className="relative flex-1 overflow-hidden"
        onDragEnter={(e) => e.preventDefault()}
        onDragOver={(e) => {
          e.preventDefault();
          e.dataTransfer.dropEffect = "copy";
          const frame = iframeRefToUse.current;
          const frameRect = frame?.getBoundingClientRect();
          if (frameRect) {
            const widgetId = libraryDragRef.current?.widgetId || "";
            sendIframeMessage("show-drop-target", {
              y: e.clientY - frameRect.top,
              x: e.clientX - frameRect.left,
              widgetId,
            });
          }
        }}
        onDragLeave={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          if (e.clientX <= rect.left || e.clientX >= rect.right || e.clientY <= rect.top || e.clientY >= rect.bottom) {
            sendIframeMessage("hide-drop-target");
          }
        }}
        onDrop={(e) => {
          sendIframeMessage("hide-drop-target");
          handleDrop(e);
        }}
      >
        <div ref={wrapperRef} className="w-full h-full min-h-0 flex items-stretch justify-start overflow-y-auto overflow-x-auto bg-[radial-gradient(circle_at_top,_rgba(99,102,241,0.08),_transparent_42%)] p-1 pb-4">
          <div
            className="relative flex h-full min-h-0 flex-col overflow-hidden border border-black/5 bg-white shadow-[0_20px_80px_-28px_rgba(15,23,42,0.35)] transition-all duration-200"
            style={{ width: frameWidth, maxWidth: frameMaxWidth, minWidth: 0, margin: 0, overflowX: "hidden" }}
          >
            {mounted ? (
              <iframe
                ref={iframeRefToUse}
                title="preview"
                srcDoc={srcDoc}
                onLoad={restoreSavedScroll}
                className={`w-full h-full border-0 ${(disablePointerEvents || draggingLibrarySection) ? "pointer-events-none" : ""}`}
              />
            ) : null}
            {mounted && project && pageOf(project)?.sections.length === 0 && !project.sharedHeader && !project.sharedFooter ? (
              <div
                className={`absolute inset-0 flex flex-col items-center justify-center gap-4 border px-6 py-10 text-center text-sm ${
                  draggingLibrarySection
                    ? "border-dashed border-sky-400 bg-sky-100/80 text-sky-700"
                    : "border-dashed border-slate-300/80 bg-[radial-gradient(circle_at_top,_rgba(124,58,237,0.10),_transparent_55%),rgba(255,255,255,0.96)] text-slate-600"
                }`}
              >
                {draggingLibrarySection ? (
                  <div className="max-w-[320px] space-y-2">
                    <div className="text-base font-semibold text-sky-800">Drop widget here</div>
                    <div className="text-sm leading-6 text-sky-700/80">Release to add this widget to the canvas.</div>
                  </div>
                ) : (
                  <>
                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-violet-600/10 text-violet-600 shadow-sm">
                      <UploadCloud className="h-8 w-8" />
                    </div>
                    <div className="max-w-[280px] space-y-2">
                      <div className="text-base font-semibold text-slate-900">Start building your website.</div>
                      <div className="text-sm leading-6 text-slate-500">Open the widget library and drop in a hero, navbar, or content block to begin.</div>
                    </div>
                    <button
                      className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800"
                      onClick={() => {
                        setLeftPanelView("widgets");
                        setLeftPanelOpen(true);
                      }}
                    >
                      <span>Open Widgets</span>
                    </button>
                  </>
                )}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
