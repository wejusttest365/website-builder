import { doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";
import { auth } from "@/firebase/firebase";
import { db } from "@/firebase/firebase";
import { sanitizeForFirestore } from "@/services/firestore";
import type { Project } from "@/lib/builder/store";
function getProjectDocRef(userId: string, projectId: string) {
  return doc(db, "users", userId, "builderProjects", projectId);
}

function requireUser() {
  const user = auth.currentUser;

  if (!user) {
    throw new Error("User not logged in");
  }

  return user;
}
export async function saveBuilderProject(project: Project) {
  const user = requireUser();

  await setDoc(
    getProjectDocRef(user.uid, project.id),
    {
      ...sanitizeForFirestore(project),
      updatedAtServer: serverTimestamp(),
    },
    { merge: true }
  );
}

export async function deleteBuilderProject(projectId: string) {
  const user = requireUser();
  await deleteDoc(getProjectDocRef(user.uid, projectId));
}

export async function getBuilderProject(projectId: string): Promise<Project> {
  const user = requireUser();

  const snapshot = await getDoc(getProjectDocRef(user.uid, projectId));

  if (!snapshot.exists()) {
    throw new Error("Builder project not found");
  }

  return snapshot.data() as Project;
}