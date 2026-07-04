import NextAuth from "next-auth"
import Google from "next-auth/providers/google"
import Credentials from "next-auth/providers/credentials"
import { prisma } from "@/lib/prisma"
import { verifyPassword } from "@/lib/password"
import { upsertGoogleUser } from "@/lib/user-service"
import { logger } from "@/lib/logger"
import { AUTH_PAGES } from "@/lib/routes"

export const { auth, handlers, signIn, signOut } = NextAuth({
  providers: [
    Google,
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      authorize: async (credentials) => {
        const email = credentials.email as string
        const password = credentials.password as string

        const user = await prisma.user.findUnique({ where: { email } })
        if (!user || !user.hashedPassword) return null

        const isValid = await verifyPassword(password, user.hashedPassword)
        if (!isValid) return null

        return { id: user.id, email: user.email, name: user.name }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google") {
        if (!user.email) {
          logger.error("Google sign-in failed: no email")
          return false
        }
        return upsertGoogleUser(user.email, user.name)
      }
      return true
    },
    async session({ session }) {
      if (session.user.email) {
        const dbUser = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { id: true },
        })
        if (dbUser) session.user.id = dbUser.id
      }
      return session
    },
  },
  pages: {
    signIn: AUTH_PAGES[0],
  },
})
