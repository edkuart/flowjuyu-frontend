import NextAuth, { DefaultSession } from 'next-auth'
import { JWT as DefaultJWT } from 'next-auth/jwt'

/**
 * Extiende el tipo `user` que NextAuth maneja
 */
declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      name: string
      email: string
      role: 'comprador' | 'vendedor'
    } & DefaultSession['user']
  }

  interface User {
    id: string
    name: string
    email: string
    role: 'comprador' | 'vendedor'
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT {
    id: string
    name: string
    email: string
    role: 'comprador' | 'vendedor'
  }
}
