import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createUserIfNotExists } from "@/services/firestore";

import {
  signInWithGoogle,
  subscribeToAuth,
  logout as firebaseLogout,
} from "@/services/auth";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  photoURL?: string;
  plan: "Free plan" | "Pro plan";
  initials: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  signingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
loginWithGoogle: () => Promise<void>;
logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);


function createUser(email: string, fullName?: string): AuthUser {
  const normalizedEmail = email.trim().toLowerCase();
  const guessedName = fullName?.trim() || normalizedEmail.split("@")[0] || "User";
  const displayName = guessedName
    .split(/[^a-z0-9]+/i)
    .filter(Boolean)
    .map((part) => `${part.charAt(0).toUpperCase()}${part.slice(1)}`)
    .join(" ") || "Lovable User";
  const initials = displayName
    .split(" ")
    .map((part) => part.slice(0, 1).toUpperCase())
    .slice(0, 2)
    .join("");

  return {
    id: `mock-${normalizedEmail}`,
    name: displayName,
    email: normalizedEmail,
    plan: "Free plan",
    initials: initials || "L",
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signingIn, setSigningIn] = useState(false);

  useEffect(() => {
  const unsubscribe = subscribeToAuth(async (firebaseUser) => {
  if (!firebaseUser) {
    setUser(null);
    return;
  }

  console.log("Firebase User:", firebaseUser);
  console.log("Photo URL:", firebaseUser.photoURL);

  setUser({
    id: firebaseUser.uid,
    name: firebaseUser.displayName || "User",
    email: firebaseUser.email || "",
    photoURL: firebaseUser.photoURL || "",
    plan: "Free plan",
    initials:
      (firebaseUser.displayName || "U")
        .split(" ")
        .map((word) => word[0])
        .join("")
        .substring(0, 2),
  });
});

  return unsubscribe;
}, []);

 

  const login = async (email: string, _password: string) => {
    setSigningIn(true);
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        setUser(createUser(email));
        setSigningIn(false);
        resolve();
      }, 300);
    });
  };

  const register = async (firstName: string, lastName: string, email: string, _password: string) => {
    setSigningIn(true);
    return new Promise<void>((resolve) => {
      window.setTimeout(() => {
        const name = `${firstName.trim()} ${lastName.trim()}`.trim();
        setUser(createUser(email, name || undefined));
        setSigningIn(false);
        resolve();
      }, 300);
    });
  };

  const logout = async () => {
  await firebaseLogout();
  setUser(null);
};

 const loginWithGoogle = async () => {
  setSigningIn(true);

  try {
    const result = await signInWithGoogle();

    const firebaseUser = result.user;

    await createUserIfNotExists(firebaseUser);

    setUser({
      id: firebaseUser.uid,
      name: firebaseUser.displayName || "User",
      email: firebaseUser.email || "",
      photoURL: firebaseUser.photoURL || "",
      plan: "Free plan",
      initials:
        (firebaseUser.displayName || "U")
          .split(" ")
          .map((word) => word.charAt(0).toUpperCase())
          .join("")
          .substring(0, 2),
    });
  } finally {
    setSigningIn(false);
  }
};
const value = useMemo(
  () => ({
    user,
    signingIn,
    login,
    register,
    loginWithGoogle,
    logout,
  }),
  [user, signingIn],
);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider.");
  }

  return context;
}
