import { FirebaseError } from "firebase/app";
import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { auth } from "@/firebase/firebase";
import { getProjects } from "@/services/project";
import type { Project } from "@/lib/builder/store";

export interface CloudProjectRecord {
  id: string;
  ownerId: string;
  project: Project;
  createdAt?: any;
  updatedAt?: any;
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

export function useCloudProjects() {
  const { user, authReady } = useAuth();
  const [projects, setProjects] = useState<CloudProjectRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function load() {
      if (!authReady) {
        if (!isMounted) return;
        setProjects([]);
        setError(null);
        setLoading(true);
        return;
      }

      if (!user) {
        if (!isMounted) return;
        setProjects([]);
        setError(null);
        setLoading(false);
        return;
      }

      const firebaseUser = auth.currentUser;
      if (!firebaseUser) {
        if (!isMounted) return;
        setProjects([]);
        setError("Unable to load cloud projects without an active Firebase session.");
        setLoading(false);
        return;
      }

      if (firebaseUser.uid !== user.id) {
        if (!isMounted) return;
        setProjects([]);
        setError("Please refresh or sign in again to access your cloud projects.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const data = await getProjects(firebaseUser.uid);
        if (!isMounted) return;
        setProjects(data as CloudProjectRecord[]);
      } catch (loadError) {
        console.error("Failed to load cloud projects", loadError);
        if (!isMounted) return;
        setProjects([]);
        setError(getProjectLoadErrorMessage(loadError));
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    load();

    return () => {
      isMounted = false;
    };
  }, [authReady, user, refreshKey]);

  const refresh = useCallback(() => setRefreshKey((value) => value + 1), []);

  return { projects, loading, error, refresh };
}
