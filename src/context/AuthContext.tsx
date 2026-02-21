"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* ===================================================
   🎯 ROLES (UNIFICADOS CON BACKEND)
=================================================== */

export type Role =
  | "buyer"
  | "seller"
  | "admin"
  | "support";

/* ===================================================
   👤 USER TYPES
=================================================== */

export interface User {
  id: string;
  nombre: string;
  correo?: string;
  rol: Role;
  [key: string]: any;
}

type RawUser = {
  id: string;
  nombre: string;
  correo?: string;
  rol: Role;
  [key: string]: any;
};

/* ===================================================
   🧠 CONTEXT
=================================================== */

interface AuthContextProps {
  user: User | null;
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (user: RawUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

/* ===================================================
   🚀 PROVIDER
=================================================== */

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // 🔁 Restaurar sesión
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsed: RawUser = JSON.parse(storedUser);
        setUser(parsed);
        setToken(storedToken);
      }
    } catch (error) {
      console.error("Error restaurando sesión:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setReady(true);
    }
  }, []);

  // 🔐 Login
  const login = (user: RawUser, token: string) => {
    setUser(user);
    setToken(token);

    localStorage.setItem("user", JSON.stringify(user));
    localStorage.setItem("token", token);
  };

  // 🚪 Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    router.replace("/login");
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        ready,
        isAuthenticated: !!user && !!token,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/* ===================================================
   🪝 HOOK
=================================================== */

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }

  return ctx;
};