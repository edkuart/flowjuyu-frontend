"use client";
import { createContext, useContext, useEffect, useState } from "react";

export type Rol = "comprador" | "vendedor" | "admin";

export interface User {
  id: string;
  nombre: string;
  rol: Rol;
  [key: string]: any;
}

interface AuthContextProps {
  user: User | null;
  token: string | null;
  /** true cuando ya se leyó localStorage y el contexto está hidratado */
  ready: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      const storedToken = localStorage.getItem("token");
      if (storedUser && storedToken) {
        setUser(JSON.parse(storedUser) as User);
        setToken(storedToken);
      }
    } finally {
      setReady(true); // ← evita “flash” en guards
    }
  }, []);

  const login = (u: User, t: string) => {
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
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};
