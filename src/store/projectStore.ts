import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Project } from '../features/projects/project.types';

interface ProjectStoreState {
  projects: Project[];
  selectedProjectId: string | null;
  setProjects: (projects: Project[]) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  removeProject: (id: string) => void;
  selectProject: (id: string | null) => void;
  clearProjects: () => void;
}

export const useProjectStore = create<ProjectStoreState>()(
  devtools((set) => ({
    projects: [],
    selectedProjectId: null,
    setProjects: (projects) => set({ projects }),
    addProject: (project) => set((state) => ({ projects: [project, ...state.projects] })),
    updateProject: (id, updates) =>
      set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        ),
      })),
    removeProject: (id) =>
      set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        selectedProjectId:
          state.selectedProjectId === id ? null : state.selectedProjectId,
      })),
    selectProject: (id) => set({ selectedProjectId: id }),
    clearProjects: () => set({ projects: [], selectedProjectId: null }),
  }))
);
