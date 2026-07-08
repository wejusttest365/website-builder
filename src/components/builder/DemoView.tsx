import { useEffect, useState } from "react";
import { buildExportBundle } from "@/lib/builder/preview";
import type { Project } from "@/lib/builder/store";

export function DemoView({ projectId }: { projectId: string }) {
  const [proj, setProj] = useState<Project | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("wto-builder-v1");
      if (!raw) return setNotFound(true);
      const data = JSON.parse(raw) as { projects: Record<string, Project> };
      const p = data.projects?.[projectId];
      if (!p) return setNotFound(true);
      setProj(p);
    } catch {
      setNotFound(true);
    }
  }, [projectId]);

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
  if (!proj) return null;

  const bundle = buildExportBundle({
    sections: proj.sections,
    globalCss: proj.globalCss,
    globalJs: proj.globalJs,
    title: proj.name,
  });

  return (
    <iframe
      title={proj.name}
      srcDoc={bundle.complete}
      style={{ width: "100vw", height: "100vh", border: 0 }}
    />
  );
}
