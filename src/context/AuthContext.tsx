"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

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

  // si viene algo raro, lo dejamos undefined para no dar permisos
  return undefined;
}

export interface User {
  id: string;
  nombre: string;
  correo?: string;
  rol: RolNormalized; // 👈 guardamos ya normalizado
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (user: any, token: string) => void; // any porque a veces viene "support"
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");

      if (storedUser && storedToken) {
        const parsed = JSON.parse(storedUser);

        const rolNorm = normalizeRole(parsed?.rol);
        if (!rolNorm) {
          // rol inválido => limpiamos para evitar loops raros
          localStorage.removeItem("user");
          localStorage.removeItem("token");
          setUser(null);
          setToken(null);
        } else {
          setUser({ ...parsed, rol: rolNorm });
          setToken(storedToken);
        }
      }
    } finally {
      setReady(true);
    }
  }, []);

  const login = (u: any, t: string) => {
    const rolNorm = normalizeRole(u?.rol);
    if (!rolNorm) {
      throw new Error(`Rol inválido recibido: ${u?.rol}`);
    }

    const userToStore: User = { ...u, rol: rolNorm };

    setUser(userToStore);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(userToStore));
    localStorage.setItem("token", t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.replace("/login");
  };

  return (
    <AuthContext.Provider value={{ user, token, ready, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
