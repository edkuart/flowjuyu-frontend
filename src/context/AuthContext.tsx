// src/context/AuthContext.tsx
"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";

type User = { id: string; nombre: string; rol: "comprador" | "vendedor" | "admin" } | null;

type AuthCtx = {
  user: User;
  login: (token: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User>(null);

  useEffect(() => {
    // leer token de localStorage y poblar user si aplica
    // ...
  }, []);

  async function login(token: string) {
    // guardar token y setUser(...)
  }

  function logout() {
    // limpiar token y user
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}
