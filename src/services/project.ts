import {
  collection,
  getDocs,
  query,
  where,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
} from "firebase/firestore";

import { auth } from "@/firebase/firebase";
import { db } from "@/firebase/firebase";
import type { Project } from "@/lib/builder/store";

export async function createProject(project: Project) {
  const user = auth.currentUser;

  if (!user) throw new Error("User not logged in");

  await setDoc(doc(db, "projects", project.id), {
    ownerId: user.uid,
    project,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return project.id;
}
 
export async function getProjects(ownerId: string) {
  const q = query(
    collection(db, "projects"),
    where("ownerId", "==", ownerId)
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
}