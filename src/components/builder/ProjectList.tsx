import { ArrowRight } from "lucide-react";
import type { Project } from "@/lib/builder/store";

interface ProjectListProps {
  projects: { id: string; project: Project }[];
  selectedProjectId: string | null;
  onSelectProject: (projectId: string) => void;
  onOpen: (projectId: string) => void;
}

export function ProjectList({ projects, selectedProjectId, onSelectProject, onOpen }: ProjectListProps) {
  return (
    <div className="space-y-3">
      {projects.map(({ id, project }) => {
        const selected = id === selectedProjectId;
        const published = Boolean(project.publishedAt);

        return (
          <div
            key={id}
            className={`flex items-center justify-between gap-4 rounded-3xl border px-4 py-4 transition ${
              selected ? "border-primary bg-primary/10 shadow-sm" : "border-border/70 bg-white hover:border-border"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectProject(id)}
              className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
            >
              <span className="text-sm font-semibold text-foreground">{project.name}</span>
              <span className="text-xs text-muted-foreground">
                {project.pages.length} page{project.pages.length === 1 ? "" : "s"} • {published ? "Published" : "Draft"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpen(id)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-border/70 bg-background px-3 text-sm text-foreground transition hover:bg-muted"
            >
              Open
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
