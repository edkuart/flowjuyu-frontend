import NextAuth, { type NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      authorize: async (credentials) => {
        if (
          credentials?.email === 'demo@flowjuyu.com' &&
          credentials?.password === '123456'
        ) {
          return {
            id: '1',
            name: 'Usuario Demo',
            email: credentials.email,
            role: 'comprador',
          }
        }
        return null
      },
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.name = token.name as string
        session.user.email = token.email as string
        session.user.role = token.role as 'comprador' | 'vendedor'
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
    error: '/login?error=CredentialsSignin',
  },
  secret: 'flowjuyu-dev-secret-12345', // 👈 Fijado para entorno local
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
