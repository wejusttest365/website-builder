import { FirebaseError } from "firebase/app";
import { create } from "zustand";
import { auth } from "@/firebase/firebase";
import { getProjects } from "@/services/project";
import type { Project } from "@/features/projects/project.types";

interface CloudProjectsState {
  projects: Project[];
  loading: boolean;
  error: string | null;
  refreshVersion: number;
  loadPromise: Promise<void> | null;
  loadProjects: (authReady: boolean, user: { id: string } | null | undefined) => Promise<void>;
  refreshProjects: () => void;
}

function getProjectLoadErrorMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "permission-denied") {
      return "Unable to load projects due to Firebase permissions. Check your account and Firestore rules.";
    }
    return error.message || "Unable to load projects due to a Firebase error.";
  }

  if (error instanceof Error) {
    return error.message || "Unable to load projects. Please try again.";
  }

  return "Unable to load projects. Please try again.";
}

export const useCloudProjectsStore = create<CloudProjectsState>((set, get) => ({
  projects: [],
  loading: true,
  error: null,
  refreshVersion: 0,
  loadPromise: null,
  loadProjects: async (authReady, user) => {
    if (!authReady) {
      set({ projects: [], loading: true, error: null });
      return;
    }

    if (!user) {
      set({ projects: [], loading: false, error: null });
      return;
    }

    const firebaseUser = auth.currentUser;
    if (!firebaseUser) {
      set({ projects: [], loading: false, error: null });
      return;
    }

    if (firebaseUser.uid !== user.id) {
      set({ projects: [], loading: false, error: "Please refresh or sign in again to access your cloud projects." });
      return;
    }

    const existingPromise = get().loadPromise;
    if (existingPromise) {
      return existingPromise;
    }

    set({ loading: true, error: null });

    const promise = (async () => {
      const data = await getProjects(firebaseUser.uid);
      // Sort projects by updatedAt (newest first) to ensure Recent Projects are deterministic
      const toMillis = (v: any) => {
        if (!v) return 0;
        if (typeof v === 'number') return v;
        if (typeof v?.toDate === 'function') return v.toDate().getTime();
        return Number(v) || 0;
      };
      const sorted = (data || []).slice().sort((a, b) => toMillis(b.updatedAt) - toMillis(a.updatedAt));
      set({ projects: sorted, loading: false, error: null });
    })()
      .catch((loadError) => {
        set({ projects: [], loading: false, error: getProjectLoadErrorMessage(loadError) });
      })
      .finally(() => {
        if (get().loadPromise === promise) {
          set({ loadPromise: null });
        }
      });

    set({ loadPromise: promise });
    return promise;
  },
  refreshProjects: () => {
    set((state) => ({ refreshVersion: state.refreshVersion + 1, loadPromise: null }));
  },
}));
