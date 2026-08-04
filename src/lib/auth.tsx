import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { createUserIfNotExists } from "@/services/firestore";

import {
  signInWithGoogle,
  signInWithEmail,
  registerWithEmail,
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
  authReady: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);


export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [signingIn, setSigningIn] = useState(false);
  const [authReady, setAuthReady] = useState(false);
  const latestUserId = useRef<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (typeof window !== "undefined" && import.meta.env.DEV && window.localStorage.getItem("wto-dev-auth") === "1") {
      const devUser: AuthUser = {
        id: "dev-user",
        name: "Dev User",
        email: "dev@example.com",
        plan: "Free plan",
        initials: "DU",
      };
      latestUserId.current = devUser.id;
      setUser(devUser);
      setAuthReady(true);
      return () => {
        isMounted = false;
      };
    }

    const unsubscribe = subscribeToAuth(async (firebaseUser) => {
      if (!isMounted) return;

      if (!firebaseUser) {
        latestUserId.current = null;
        setUser(null);
        setAuthReady(true);
        return;
      }

      if (latestUserId.current === firebaseUser.uid && authReady) {
        return;
      }

      latestUserId.current = firebaseUser.uid;
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
            .map((word) => word[0])
            .join("")
            .substring(0, 2),
      });
      setAuthReady(true);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

 

  const login = async (email: string, password: string) => {
    setSigningIn(true);
    try {
      await signInWithEmail(email, password);
    } finally {
      setSigningIn(false);
    }
  };

  const register = async (firstName: string, lastName: string, email: string, password: string) => {
    setSigningIn(true);
    try {
      await registerWithEmail(email, password);
    } finally {
      setSigningIn(false);
    }
  };

  const logout = async () => {
  await firebaseLogout();
  setUser(null);
};

 const loginWithGoogle = async () => {
  setSigningIn(true);

  try {
    const result = await signInWithGoogle();
    await createUserIfNotExists(result.user);
  } finally {
    setSigningIn(false);
  }
};
const value = useMemo(
  () => ({
    user,
    signingIn,
    authReady,
    login,
    register,
    loginWithGoogle,
    logout,
  }),
  [user, signingIn, authReady],
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
