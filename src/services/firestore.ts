import { doc, getDoc, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export function sanitizeForFirestore(value: any): any {
  if (value === undefined) return undefined;

  if (value === null) return null;

  if (Array.isArray(value)) {
    return value
      .map(sanitizeForFirestore)
      .filter(v => v !== undefined);
  }

  if (
    typeof value === "object" &&
    value.constructor === Object
  ) {
    const result: Record<string, any> = {};

    Object.entries(value).forEach(([key, val]) => {
      const cleaned = sanitizeForFirestore(val);

      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    });

    return result;
  }

  return value;
}

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