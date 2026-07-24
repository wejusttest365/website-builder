import { createFileRoute } from "@tanstack/react-router";
import { ProjectDashboard } from "@/components/builder/ProjectDashboard";

export const Route = createFileRoute("/dashboard/")({
  component: DashboardHome,
});

function DashboardHome() {
  return <ProjectDashboard />;
}