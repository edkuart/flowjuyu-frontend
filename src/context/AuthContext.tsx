"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";

/* ===========================
   Roles
=========================== */
export type Rol =
  | "comprador"
  | "buyer"
  | "vendedor"
  | "seller"
  | "admin"
  | "soporte"
  | "support";

export type RolNormalized = "comprador" | "vendedor" | "admin" | "soporte";

export function normalizeRole(rol?: string): RolNormalized | undefined {
  if (!rol) return undefined;

  const r = rol.toLowerCase().trim();

  if (r === "buyer") return "comprador";
  if (r === "seller") return "vendedor";
  if (r === "support") return "soporte";

  if (r === "comprador") return "comprador";
  if (r === "vendedor") return "vendedor";
  if (r === "admin") return "admin";
  if (r === "soporte") return "soporte";

  return undefined;
}

/* ===========================
   User types
=========================== */
export interface User {
  id: string;
  nombre: string;
  correo?: string;
  rol: RolNormalized; // siempre normalizado
  [key: string]: any;
}

// Usuario crudo que viene del backend
type RawUser = {
  id: string;
  nombre: string;
  correo?: string;
  rol?: string;
  [key: string]: any;
};

/* ===========================
   Context
=========================== */
interface AuthContextProps {
  user: User | null;
  token: string | null;
  ready: boolean;
  isAuthenticated: boolean;
  login: (user: RawUser, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(
  undefined
);

/* ===========================
   Provider
=========================== */
export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  // ===========================
  // Restaurar sesión
  // ===========================
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsed: RawUser = JSON.parse(storedUser);
        const rolNorm = normalizeRole(parsed?.rol);

        if (!rolNorm) {
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        } else {
          setUser({ ...parsed, rol: rolNorm });
          setToken(storedToken);
        }
      }
    } catch (error) {
      console.error("Error restaurando sesión:", error);
      localStorage.removeItem("user");
      localStorage.removeItem("token");
    } finally {
      setReady(true);
    }
  }, []);

  // ===========================
  // Login
  // ===========================
  const login = (u: RawUser, t: string) => {
    const rolNorm = normalizeRole(u?.rol);
    if (!rolNorm) {
      throw new Error(`Rol inválido recibido: ${u?.rol}`);
    }

    const userToStore: User = {
      ...u,
      rol: rolNorm,
    };

    setUser(userToStore);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("token", t);
  };

  // ===========================
  // Logout
  // ===========================
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

/* ===========================
   Hook
=========================== */
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
