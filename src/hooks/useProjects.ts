import { useCallback } from 'react';
import type { Project } from '@/features/projects/project.types';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/services/projectService';
import { useProjectStore } from '@/store/projectStore';
import { useCloudProjectsStore } from '@/lib/builder/cloudProjectsStore';
import { useBuilder } from '@/lib/builder/store';

export function useProjects() {
  const {
    projects,
    selectedProjectId,
    setProjects,
    addProject,
    updateProject: updateProjectInStore,
    removeProject,
    selectProject,
    clearProjects,
  } = useProjectStore();

  const loadProjects = useCallback(
    async (ownerId: string) => {
      const fetchedProjects = await getProjects(ownerId);
      setProjects(fetchedProjects);
      return fetchedProjects;
    },
    [setProjects]
  );

  const createNewProject = useCallback(
    async (project: Project) => {
      const projectId = await createProject(project);
      const createdProject = { ...project, id: projectId };
      addProject(createdProject);
      return createdProject;
    },
    [addProject]
  );

  const updateExistingProject = useCallback(
    async (projectId: string, updates: Partial<Project>) => {
      await updateProject(projectId, updates);
      updateProjectInStore(projectId, updates);
    },
    [updateProjectInStore]
  );

  const deleteExistingProject = useCallback(
    async (projectId: string) => {
      // Delete from cloud first
      await deleteProject(projectId);

      // Remove from project metadata store (single source of truth for metadata)
      removeProject(projectId);

      // Remove from builder-local store if present. If the project is currently open in the editor,
      // navigate to the dashboard to avoid leaving broken references.
      try {
        const builderState = useBuilder.getState();
        const wasCurrent = builderState.currentProjectId === projectId;
        if (builderState.projects && builderState.projects[projectId]) {
          builderState.deleteProject(projectId);
        }
        if (wasCurrent && typeof window !== 'undefined') {
          // Prefer client-side navigation if available by updating location.
          try {
            window.history.replaceState({}, '', '/dashboard');
            // Also trigger a popstate so routers listening may react
            window.dispatchEvent(new PopStateEvent('popstate'));
          } catch (e) {
            window.location.href = '/dashboard';
          }
        }
      } catch (err) {
        // ignore
      }

      // Optimistically update cloud projects store so Recent Projects updates immediately,
      // then refresh from Firestore to ensure the store matches the server.
      try {
        useCloudProjectsStore.setState((state) => ({
          projects: state.projects.filter((p) => p.id !== projectId),
        }));
      } catch (err) {
        // ignore
      }

      try {
        useCloudProjectsStore.getState().refreshProjects();
      } catch (err) {
        // ignore
      }
    },
    [removeProject]
  );

  return {
    projects,
    selectedProjectId,
    loadProjects,
    createNewProject,
    updateExistingProject,
    deleteExistingProject,
    setProjects,
    selectProject,
    clearProjects,
  };
}
