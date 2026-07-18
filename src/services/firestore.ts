import { doc, getDoc, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

 export async function createUserIfNotExists(user: any) {
  if (!user) return;

  const userRef = doc(db, "users", user.uid);
  const snapshot = await getDoc(userRef);

  if (!snapshot.exists()) {
    await setDoc(userRef, {
      uid: user.uid,
      name: user.displayName || "",
      email: user.email || "",
      photoURL: user.photoURL || "",
      plan: "Free",
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
    });
  } else {
    await updateDoc(userRef, {
      lastLogin: serverTimestamp(),
    });
  }
}