import { ArrowRight, Layers } from "lucide-react";
import type { Project } from "@/lib/builder/store";
import { ProjectActionsMenu } from "./ProjectActionsMenu";

interface ProjectCardProps {
  projectId: string;
  project: Project;
  onOpen: (projectId: string) => void;
  onRename: (projectId: string, name: string) => Promise<void>;
  onDuplicate: (projectId: string) => Promise<void>;
  onDelete: (projectId: string) => Promise<void>;
  onPublish: (projectId: string) => Promise<void>;
  onExport: (project: Project) => Promise<void>;
}

function formatPageName(pageSlug: string) {
  return pageSlug === "index" ? "/" : `/${pageSlug}`;
}

export function ProjectCard({ projectId, project, onOpen, onRename, onDuplicate, onDelete, onPublish, onExport }: ProjectCardProps) {
  const published = Boolean(project.publishedAt);

  return (
    <div className="group rounded-3xl border border-border/70 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Project</p>
          <h3 className="mt-3 text-xl font-semibold text-foreground line-clamp-2">{project.name}</h3>
        </div>
        <ProjectActionsMenu
          project={project}
          onRename={onRename}
          onDuplicate={onDuplicate}
          onDelete={onDelete}
          onPublish={onPublish}
          onExport={onExport}
        />
      </div>

      <div className="mt-5 space-y-3">
        <div className="text-sm text-slate-600">{project.pages.length} page{project.pages.length === 1 ? "" : "s"}</div>
        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1 rounded-full border border-border/70 bg-muted px-2 py-1">
            <Layers className="h-3.5 w-3.5" />
            {published ? "Published" : "Draft"}
          </span>
          <span>Updated {new Date(project.updatedAt).toLocaleDateString()}</span>
        </div>

        <div className="rounded-2xl border border-border/70 bg-muted/70 p-4 text-sm text-slate-700">
          <div className="font-medium text-slate-900">Pages</div>
          <ul className="mt-3 space-y-2 text-xs text-slate-600">
            {project.pages.slice(0, 4).map((page) => (
              <li key={page.id} className="flex items-center justify-between rounded-xl bg-white px-3 py-2 shadow-sm">
                <span className="truncate">{page.name}</span>
                <span className="truncate text-[11px] text-slate-500">{formatPageName(page.slug)}</span>
              </li>
            ))}
            {project.pages.length > 4 ? (
              <li className="text-xs text-muted-foreground">+ {project.pages.length - 4} more page{project.pages.length - 4 === 1 ? "" : "s"}</li>
            ) : null}
          </ul>
        </div>
      </div>

      <button
        type="button"
        onClick={() => onOpen(projectId)}
        className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-border bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
      >
        Open project
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  );
}
