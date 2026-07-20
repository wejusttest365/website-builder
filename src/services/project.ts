import { collection, getDocs, getDoc, doc, setDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase/firebase";
import { db } from "@/firebase/firebase";
import type { Project } from "@/lib/builder/store";

function getProjectCollectionRef(userId: string) {
  return collection(db, "users", userId, "projects");
}

function getProjectDocRef(userId: string, projectId: string) {
  return doc(db, "users", userId, "projects", projectId);
}

export async function createProject(project: Project) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  await setDoc(getProjectDocRef(user.uid, project.id), {
    ownerId: user.uid,
    project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return project.id;
}
 
export async function getProjects(ownerId: string) {
  const snapshot = await getDocs(getProjectCollectionRef(ownerId));

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}

export async function updateProject(projectId: string, project: Project) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  await updateDoc(getProjectDocRef(user.uid, projectId), {
    project,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProject(projectId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  await deleteDoc(getProjectDocRef(user.uid, projectId));
}

export async function getProject(projectId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("User not logged in");

  const snapshot = await getDoc(getProjectDocRef(user.uid, projectId));

  if (!snapshot.exists()) {
    throw new Error("Project not found");
  }

  return snapshot.data();
}