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
              selected ? "border-[#FACC15] bg-[#FACC15]/10 shadow-sm" : "border-[#363636] bg-[#1F1F1F] hover:border-[#2B2B2B]"
            }`}
          >
            <button
              type="button"
              onClick={() => onSelectProject(id)}
              className="flex min-w-0 flex-1 flex-col items-start gap-1 text-left"
            >
              <span className="text-sm font-semibold text-[#F5F5F5]">{project.name}</span>
              <span className="text-xs text-[#969696]">
                {project.pages.length} page{project.pages.length === 1 ? "" : "s"} • {published ? "Published" : "Draft"}
              </span>
            </button>

            <button
              type="button"
              onClick={() => onOpen(id)}
              className="inline-flex h-10 items-center justify-center rounded-full border border-[#363636] bg-[#1F1F1F] px-3 text-sm text-[#D0D0D0] transition hover:bg-[#242424]"
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
