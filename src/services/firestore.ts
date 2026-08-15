import { doc, getDoc, serverTimestamp, updateDoc, setDoc } from "firebase/firestore";
import { db } from "@/firebase/firebase";

export function sanitizeForFirestore(value: any, seen?: WeakSet<any>): any {
  if (value === undefined) return undefined;

  if (value === null) return null;

  if (typeof value === "string" || typeof value === "boolean") {
    return value;
  }

  if (typeof value === "number") {
    if (isNaN(value) || !isFinite(value)) {
      return null;
    }
    return value;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => sanitizeForFirestore(item, seen))
      .filter((v) => v !== undefined);
  }

  if (typeof value === "object" && value.constructor === Object) {
    if (seen && seen.has(value)) {
      return null;
    }

    const nextSeen = seen || new WeakSet();
    nextSeen.add(value);

    const result: Record<string, any> = {};

    Object.entries(value).forEach(([key, val]) => {
      const cleaned = sanitizeForFirestore(val, nextSeen);

      if (cleaned !== undefined) {
        result[key] = cleaned;
      }
    });

    return result;
  }

  if (value instanceof Map) {
    return sanitizeForFirestore(Object.fromEntries(value), seen);
  }

  if (value instanceof Set) {
    return sanitizeForFirestore(Array.from(value), seen);
  }

  if (value instanceof RegExp) {
    return value.toString();
  }

  return null;
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