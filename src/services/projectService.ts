import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db } from '@/firebase/firebase';
import type { Project } from '@/features/projects/project.types';

function getProjectsCollectionRef(userId: string) {
  return collection(db, 'users', userId, 'projects');
}

function getProjectDocRef(userId: string, projectId: string) {
  return doc(db, 'users', userId, 'projects', projectId);
}

function requireAuthenticatedUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error('User not logged in');
  }

  return user;
}

function toProject(documentId: string, data: Record<string, unknown>): Project {
  const { id: _, ...rest } = data;
  return {
    id: documentId,
    name: (data.name as string) || 'Untitled',
    ...rest,
  } as Project;
}

export async function createProject(project: Project): Promise<string> {
  const user = requireAuthenticatedUser();
  const projectId = project.id ?? doc(getProjectsCollectionRef(user.uid)).id;

  await setDoc(getProjectDocRef(user.uid, projectId), {
    ...project,
    id: projectId,
    ownerId: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return projectId;
}

export async function getProjects(ownerId: string): Promise<Project[]> {
  const snapshot = await getDocs(getProjectsCollectionRef(ownerId));

  return snapshot.docs.map((document) => toProject(document.id, document.data() as Record<string, unknown>));
}

export async function getProject(projectId: string): Promise<Project> {
  const user = requireAuthenticatedUser();
  const snapshot = await getDoc(getProjectDocRef(user.uid, projectId));

  if (!snapshot.exists()) {
    throw new Error('Project not found');
  }

  return toProject(snapshot.id, snapshot.data() as Record<string, unknown>);
}

export async function updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
  const user = requireAuthenticatedUser();

  await updateDoc(getProjectDocRef(user.uid, projectId), {
    ...updates,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string): Promise<void> {
  const user = requireAuthenticatedUser();

  await deleteDoc(getProjectDocRef(user.uid, projectId));
}
