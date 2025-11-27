// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";


export type Rol =
  | "comprador"
  | "buyer"
  | "vendedor"
  | "seller"
  | "admin";


function normalizeRole(rol: Rol): "comprador" | "vendedor" | "admin" {
  switch (rol) {
    case "buyer":
      return "comprador";
    case "seller":
      return "vendedor";
    default:
      return rol; 
  }
}

export interface User {
  id: string;
  nombre: string;
  rol: Rol;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  ready: boolean;
  login: (user: User, token: string) => void;
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
        const parsed = JSON.parse(storedUser) as User;

        parsed.rol = normalizeRole(parsed.rol);

        setUser(parsed);
        setToken(storedToken);
      }
    } finally {
      setReady(true);
    }
  }, []);

  const login = (u: User, t: string) => {
    u.rol = normalizeRole(u.rol);

    setUser(u);
    setToken(t);
    localStorage.setItem("user", JSON.stringify(u));
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
