import { useCallback } from 'react';
import type { Project } from '@/features/projects/project.types';
import {
  createProject,
  deleteProject,
  getProjects,
  updateProject,
} from '@/services/projectService';
import { useProjectStore } from '@/store/projectStore';

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
      await deleteProject(projectId);
      removeProject(projectId);
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
