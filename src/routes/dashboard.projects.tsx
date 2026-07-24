import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/dashboard/projects")({
  component: ProjectsPage,
});

function ProjectsPage() {
  return <h1>Projects Page</h1>;
}