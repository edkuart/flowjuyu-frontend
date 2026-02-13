import NextAuth, { DefaultSession } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

/**
 * Roles permitidos en toda la app
 */
export type UserRole =
  | "comprador"
  | "vendedor"
  | "admin"
  | "soporte"
  | "buyer"
  | "seller"
  | "support";

/**
 * Extiende Session
 */
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name: string;
      email: string;
      role: UserRole;
      backendToken?: string;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    backendToken?: string;
  }
}

/**
 * Extiende JWT
 */
declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id?: string;
    name?: string;
    email?: string;
    role?: UserRole;
    backendToken?: string;
  }
}
