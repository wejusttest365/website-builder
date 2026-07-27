import { useCallback, useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { useCloudProjectsStore } from "@/lib/builder/cloudProjectsStore";
import type { Project } from "@/features/projects/project.types";

export type DashboardProject = Project;

export function useCloudProjects() {
  const { user, authReady } = useAuth();
  const projects = useCloudProjectsStore((state) => state.projects);
  const loading = useCloudProjectsStore((state) => state.loading);
  const error = useCloudProjectsStore((state) => state.error);
  const refreshVersion = useCloudProjectsStore((state) => state.refreshVersion);
  const loadProjects = useCloudProjectsStore((state) => state.loadProjects);
  const refreshProjects = useCloudProjectsStore((state) => state.refreshProjects);

  useEffect(() => {
    void loadProjects(authReady, user);
  }, [authReady, user, refreshVersion, loadProjects]);

  const refresh = useCallback(() => {
    refreshProjects();
  }, [refreshProjects]);

  return { projects, loading, error, refresh };
}
