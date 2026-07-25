import { useEffect, useState } from "react";
import { buildExportBundle } from "@/lib/builder/preview";
import type { Project } from "@/lib/builder/store";

export function DemoView({ projectId }: { projectId: string }) {
  const [mounted, setMounted] = useState(false);
  const [proj, setProj] = useState<Project | null>(null);
  const [activePageId, setActivePageId] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    let timeout: number | null = null;
    const handleResponse = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && event.origin !== 'null') return;
      const data = event.data as {
        __lovablePreviewPayload?: true;
        projectId?: string;
        project?: Project;
        pageId?: string | null;
      };
      if (!data || data.__lovablePreviewPayload !== true) return;
      if (data.projectId !== projectId) return;
      if (!data.project) return;
      setProj(data.project);
      setActivePageId(data.pageId ?? data.project.currentPageId ?? data.project.pages?.[0]?.id ?? null);
      if (timeout) window.clearTimeout(timeout);
    };

    window.addEventListener("message", handleResponse);

    try {
      const raw =
        localStorage.getItem("wto-builder-v2") ??
        localStorage.getItem("wto-builder-v1") ??
        localStorage.getItem("wto-builder-state");
      if (raw) {
        const data = JSON.parse(raw) as { projects: Record<string, Project> };
        const p = data.projects?.[projectId];
        if (p) {
          const urlParams = new URLSearchParams(window.location.search);
          const pageParam = urlParams.get("page")?.replace(/^[./]+/, "").replace(/\.html$/i, "");
          const matchedPage = pageParam
            ? p.pages.find((pg) => pg.id === pageParam || pg.slug === pageParam)
            : null;
          setProj(p);
          setActivePageId(matchedPage?.id ?? p.currentPageId ?? p.pages?.[0]?.id ?? null);
          return () => window.removeEventListener("message", handleResponse);
        }
      }
    } catch {
      // storage not available, use opener message instead
    }

    if (typeof window !== "undefined" && window.opener) {
      timeout = window.setTimeout(() => {
        if (!proj) setNotFound(true);
      }, 2000);
      return () => {
        window.removeEventListener("message", handleResponse);
        if (timeout) window.clearTimeout(timeout);
      };
    }

    setNotFound(true);
    return () => window.removeEventListener("message", handleResponse);
  }, [mounted, projectId]);

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

  if (!mounted) return null;

  if (notFound) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-center p-8">
        <div>
          <h1 className="text-2xl font-bold">Project not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Live share links only work in the browser where the project was created.
          </p>
        </div>
      </div>
    );
  }

  if (!proj || activePageId === null) return null;

  const page = proj.pages.find((pg) => pg.id === activePageId) ?? proj.pages[0];

  const bundle = buildExportBundle({
    sections: (page?.sections ?? []),
    globalCss: proj?.globalCss ?? "",
    globalJs: proj?.globalJs ?? "",
    title: proj?.name ?? "",
    description: page?.description,
    keywords: page?.keywords,
    seo: page?.seo,
    projectSeo: proj?.seo,
    customHead: proj?.customHead,
    assets: proj?.assets,
    inlineAssets: true,
  });

  return (
    <iframe
      title={proj.name}
      srcDoc={bundle.complete}
      style={{ width: "100vw", height: "100vh", border: 0 }}
    />
  );
}
