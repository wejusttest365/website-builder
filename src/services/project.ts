import {
  collection,
  getDocs,
  getDoc,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth } from "@/firebase/firebase";
import { db } from "@/firebase/firebase";
import type { Project } from "@/features/projects/project.types";
export type ProjectMetadata = Omit<Project, "ownerId">;

function getProjectCollectionRef(userId: string) {
  return collection(db, "users", userId, "projects");
}

function getProjectDocRef(userId: string, projectId: string) {
  return doc(db, "users", userId, "projects", projectId);
}

export async function createProject(project: ProjectMetadata) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  await setDoc(getProjectDocRef(user.uid, project.id), {
    name: project.name,
    templateId: project.templateId,
    thumbnail: project.thumbnail,
    favorite: project.favorite,
    status: project.status,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt,
    pages: project.pages,

    ownerId: user.uid,
    createdAtServer: serverTimestamp(),
    updatedAtServer: serverTimestamp(),
  });

  return project.id;
}

export async function getProjects(ownerId: string): Promise<Project[]> {
  const snapshot = await getDocs(getProjectCollectionRef(ownerId));

  return snapshot.docs.map((doc) => ({
    ...(doc.data() as Omit<Project, "id">),
    id: doc.id,
  }));
}

export async function updateProject(projectId: string, updates: Partial<ProjectMetadata>) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  await updateDoc(getProjectDocRef(user.uid, projectId), {
    ...updates,
    updatedAtServer: serverTimestamp(),
  });
}

export const saveProjectMetadata = createProject;
export const updateProjectMetadata = updateProject;
export const deleteProjectMetadata = deleteProject;
export const getProjectMetadata = getProject;

export async function deleteProject(projectId: string) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  await deleteDoc(getProjectDocRef(user.uid, projectId));
}

export async function getProject(projectId: string): Promise<Project> {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  const snapshot = await getDoc(getProjectDocRef(user.uid, projectId));

  if (!snapshot.exists()) {
    throw new Error("Project not found");
  }

  return {
    ...(snapshot.data() as Omit<Project, "id">),
    id: snapshot.id,
  };
}