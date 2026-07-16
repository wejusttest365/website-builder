import { createContext, useContext, useEffect, useMemo, useState } from "react";

type AuthUser = {
  id: string;
  name: string;
  email: string;
  plan: "Free plan" | "Pro plan";
  initials: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  signingIn: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (firstName: string, lastName: string, email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const AUTH_STORAGE_KEY = "lovable_auth_user";

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
    if (typeof window === "undefined") return;
    try {
      const raw = window.localStorage.getItem(AUTH_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as AuthUser;
      if (saved?.email) {
        setUser(saved);
      }
    } catch (_error) {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      if (user) {
        window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(user));
      } else {
        window.localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (_error) {
      // ignore storage errors
    }
  }, [user]);

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

  const logout = () => {
    setUser(null);
  };

  const value = useMemo(
    () => ({ user, signingIn, login, register, logout }),
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
