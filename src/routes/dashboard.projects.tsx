import { createFileRoute } from "@tanstack/react-router";
import { ProjectsPanel } from "@/components/builder/ProjectsPanel";

export const Route = createFileRoute("/dashboard/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  return <ProjectsPanel />;
}