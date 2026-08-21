import { useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/lib/auth";
import { APP_CSS_HREF, buildPreviewHTML } from "@/lib/builder/preview";
import type { Project } from "@/lib/builder/store";
import { composePageSections } from "@/lib/builder/sharedChrome";
import { getBuilderProject } from "@/services/builderProject";
import { resolveAssetUrls, type BuilderAssetEntry } from "@/lib/builder/image-storage";

function extractProjectId(param: string) {
  const match = param.match(/-([A-Za-z0-9_]+)$/);
  return match ? match[1] : param;
}

export function DemoView({ projectId }: { projectId: string }) {
  const [mounted, setMounted] = useState(false);
  const [proj, setProj] = useState<Project | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [cloudLoading, setCloudLoading] = useState(false);
  const [cloudError, setCloudError] = useState<string | null>(null);
  const actualProjectId = extractProjectId(projectId);
  const { user, authReady } = useAuth();
  const lastPreviewHtmlRef = useRef<string | null>(null);
  const projRef = useRef<Project | null>(null);

  useEffect(() => {
    setMounted(true);
    console.log("[PREVIEW:WINDOW] DemoView mounted", { projectId, actualProjectId, mounted: true, authReady: !!authReady, userId: user?.id });
  }, []);

  useEffect(() => {
    const handleResponse = (event: MessageEvent) => {
      console.log("[PREVIEW:RECEIVER] message received", {
        origin: event.origin,
        source: typeof event.source,
        data: typeof event.data === 'object' && event.data !== null ? Object.keys(event.data as any) : typeof event.data,
      });
      const data = event.data as {
        __lovablePreviewPayload?: true;
        projectId?: string;
        project?: Project;
        pageId?: string | null;
      };
      if (!data || data.__lovablePreviewPayload !== true) return;
      if (data.projectId !== actualProjectId) {
        console.warn("[PREVIEW:RECEIVER] rejected: projectId mismatch", { received: data.projectId, expected: actualProjectId });
        return;
      }
      if (!data.project) {
        console.warn("[PREVIEW:RECEIVER] rejected: missing project", { projectId: data.projectId });
        return;
      }
      console.log("[PREVIEW:RECEIVER] payload accepted", { projectId: data.projectId, pageId: data.pageId, projectName: data.project.name, pages: data.project.pages?.length });
      setProj(data.project);
      projRef.current = data.project;
      const requestedPageId = data.pageId ?? data.project.currentPageId ?? data.project.pages?.[0]?.id ?? null;
      const fallbackPageId = requestedPageId ?? data.project.pages?.[0]?.id ?? null;
      setActivePageId(fallbackPageId);
    };

    window.addEventListener("message", handleResponse);

    if (window.opener) {
      try {
        console.log("[PREVIEW:WINDOW] sending __previewReady to opener", { openerOrigin: window.opener.location?.origin, currentOrigin: window.location.origin });
        window.opener.postMessage({ __previewReady: true }, "*");
      } catch (e) {
        console.log("[PREVIEW:WINDOW] __previewReady send failed", e);
      }
    } else {
      console.warn("[PREVIEW:WINDOW] window.opener is null, cannot send __previewReady");
    }

    return () => window.removeEventListener("message", handleResponse);
  }, [actualProjectId]);

  useEffect(() => {
    if (!mounted) return;
    let loadedFromStorage = false;
    try {
      const raw =
        localStorage.getItem("wto-builder-v2") ??
        localStorage.getItem("wto-builder-v1") ??
        localStorage.getItem("wto-builder-state");
      console.log("[PREVIEW:RECEIVER] localStorage check", { keys: ["wto-builder-v2", "wto-builder-v1", "wto-builder-state"], hasRaw: !!raw, rawLength: raw?.length });
      if (raw) {
        const data = JSON.parse(raw) as { projects: Record<string, Project> };
        const p = data.projects?.[actualProjectId];
        console.log("[PREVIEW:RECEIVER] localStorage project lookup", { actualProjectId, hasProject: !!p, projectIds: Object.keys(data.projects || {}).slice(0, 5) });
        if (p) {
          const urlParams = new URLSearchParams(window.location.search);
          const pageParam = urlParams.get("page")?.replace(/^[./]+/, "").replace(/\.html$/i, "");
          const matchedPage = pageParam
            ? p.pages.find((pg) => pg.id === pageParam || pg.slug === pageParam)
            : null;
          const requestedPageId = matchedPage?.id ?? p.currentPageId ?? p.pages?.[0]?.id ?? null;
          const fallbackPageId = requestedPageId ?? p.pages?.[0]?.id ?? null;
          console.log("[PREVIEW:RECEIVER] localStorage project loaded", { projectId: p.id, pageParam, matchedPageId: matchedPage?.id, pageCount: p.pages?.length, requestedPageId, fallbackPageId });
          setProj(p);
          projRef.current = p;
          setActivePageId(fallbackPageId);
          loadedFromStorage = true;
        }
      }
    } catch (err) {
      console.warn("[PREVIEW:RECEIVER] localStorage load failed", err);
    }
    console.log("[PREVIEW:RECEIVER] localStorage loadedFromStorage", { loadedFromStorage });
  }, [mounted, actualProjectId]);

  useEffect(() => {
    if (!mounted || proj || notFound) return;
    const timeout = window.setTimeout(() => {
      if (!projRef.current && !notFound) {
        setNotFound(true);
        setCloudError("Preview failed to load. Open this page from the builder, or check that you are signed in.");
      }
    }, 8000);
    return () => window.clearTimeout(timeout);
  }, [mounted, proj, notFound]);

  useEffect(() => {
    if (!mounted || !authReady) return;
    if (proj || notFound || cloudLoading) return;

    let cancelled = false;
    async function loadFromCloud() {
      console.log("[PREVIEW:RECEIVER] cloud load starting", { actualProjectId, userId: user?.id, authReady });
      if (!user?.id) {
        console.warn("[PREVIEW:RECEIVER] cloud load skipped: no user");
        setCloudError("Sign in required to preview this project.");
        setNotFound(true);
        return;
      }
      setCloudLoading(true);
      setCloudError(null);
      try {
        const project = await getBuilderProject(actualProjectId);
        if (cancelled) return;
        console.log("[PREVIEW:RECEIVER] cloud load success", { projectId: project.id, pageCount: project.pages?.length });
        const urlParams = new URLSearchParams(window.location.search);
        const pageParam = urlParams.get("page")?.replace(/^[./]+/, "").replace(/\.html$/i, "");
        const matchedPage = pageParam
          ? project.pages.find((pg) => pg.id === pageParam || pg.slug === pageParam)
          : null;
        const requestedPageId = matchedPage?.id ?? project.currentPageId ?? project.pages?.[0]?.id ?? null;
        const fallbackPageId = requestedPageId ?? project.pages?.[0]?.id ?? null;
        setProj(project);
        projRef.current = project;
        setActivePageId(fallbackPageId);
        setNotFound(false);
      } catch (err) {
        if (cancelled) return;
        console.error("[PREVIEW:RECEIVER] cloud load failed:", err);
        setCloudError(err instanceof Error ? err.message : "Unable to load project");
        setNotFound(true);
      } finally {
        if (!cancelled) {
          setCloudLoading(false);
        }
      }
    }

    void loadFromCloud();
    return () => {
      cancelled = true;
    };
  }, [mounted, authReady, user?.id, actualProjectId, proj, notFound, cloudLoading]);

  useEffect(() => {
    if (!notFound || !user?.id || proj) return;
    setNotFound(false);
  }, [user?.id, notFound, proj]);

  useEffect(() => {
    if (!mounted || !proj) return;
    const currentProject = proj;
    let cancelled = false;
    async function resolveProjectAssets() {
      const assets = await resolveAssetUrls(currentProject.assets);
      if (cancelled || !assets) return;
      setProj((prev) => {
        if (!prev) return prev;
        projRef.current = { ...prev, assets: assets as Record<string, BuilderAssetEntry> };
        return { ...prev, assets: assets as Record<string, BuilderAssetEntry> };
      });
    }
    void resolveProjectAssets();
    return () => {
      cancelled = true;
    };
  }, [mounted, proj?.id]);

  useEffect(() => {
    if (!mounted || !proj) return;
    const handlePreviewMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== 'null') return;
      const data = event.data as { __wto?: boolean; type?: string; payload?: Record<string, unknown> };
      if (!data || !data.__wto) return;
      if (data.type !== "navigate-page") return;
      const slug = String(data.payload?.slug ?? "");
      const page = proj.pages.find((pg) => pg.slug === slug || pg.id === slug);
      if (!page) return;
      setActivePageId(page.id);
      const params = new URLSearchParams(window.location.search);
      params.set("page", slug);
      window.history.replaceState({}, "", `${window.location.pathname}?${params.toString()}`);
    };
    window.addEventListener("message", handlePreviewMessage);
    return () => window.removeEventListener("message", handlePreviewMessage);
  }, [mounted, proj]);

  const previewHtml = useMemo(() => {
    const currentProj = projRef.current || proj;
    console.log("[PREVIEW:HTML] buildPreviewHTML called", { hasProject: !!currentProj, activePageId, projId: currentProj?.id });
    if (!currentProj || activePageId === null) {
      console.log("[PREVIEW:HTML] no project or page yet, keeping previous html", { hasProject: !!currentProj, activePageId });
      return lastPreviewHtmlRef.current;
    }
    const page = currentProj.pages.find((pg) => pg.id === activePageId) ?? currentProj.pages[0];
    if (!page) {
      console.warn("[PREVIEW:HTML] no page found for activePageId", { activePageId, pageCount: currentProj.pages?.length, projectId: currentProj.id });
      return lastPreviewHtmlRef.current;
    }
    const composedSections = composePageSections(currentProj, page);
    console.log("[PREVIEW:HTML] composed sections", {
      composedCount: composedSections.length,
      composedIds: composedSections.map((s) => s.id),
      firstComposedSectionKeys: composedSections[0] ? Object.keys(composedSections[0]) : 'empty',
    });
    const html = buildPreviewHTML({
      sections: composedSections,
      globalCss: currentProj.globalCss || "",
      globalJs: currentProj.globalJs || "",
      editable: false,
      assets: currentProj.assets,
      pages: currentProj.pages.map((pg) => ({ id: pg.id, slug: pg.slug })),
      currentPageSlug: page.slug,
      title: currentProj.name,
      description: page.description,
      keywords: page.keywords,
      seo: page.seo,
      projectSeo: currentProj.seo,
      customHead: currentProj.customHead,
      previewCssHref: APP_CSS_HREF,
    });
    console.log("[PREVIEW:HTML] built", { htmlLength: html.length, title: currentProj.name });
    lastPreviewHtmlRef.current = html;
    return html;
  }, [proj, activePageId]);

  if (!mounted) return null;

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-8">
        <div>
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {cloudError
              ? cloudError
              : "Open this link from the builder, or make sure you are signed in to access shared previews."}
          </p>
        </div>
      </div>
    );
  }

  const hasProject = !!projRef.current || !!proj;

  console.log("[PREVIEW:IFRAME] render check", { mounted, hasProject, activePageId, previewHtmlLength: previewHtml?.length, notFound, cloudLoading, cloudError });

  if (!hasProject || activePageId === null || !previewHtml) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-8">
        <div>
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
          <p className="mt-3 text-sm text-muted-foreground">Loading preview…</p>
        </div>
      </div>
    );
  }

  console.log("[PREVIEW:IFRAME] rendering iframe", { title: (projRef.current || proj)?.name, htmlLength: previewHtml.length });
  return (
    <iframe
      title={(projRef.current || proj)?.name || "Preview"}
      srcDoc={previewHtml}
      style={{ width: "100vw", height: "100vh", border: 0 }}
    />
  );
}
