import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await db.user.findUnique({
          where: { email: credentials.email },
          include: { profile: true },
        })

        if (!user || !user.password) {
          return null
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          hasCompletedOnboarding: user.profile?.onboardingCompleted ?? false,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.hasCompletedOnboarding = user.hasCompletedOnboarding
      }
      
      // Fetch latest onboarding status
      if (token.id) {
        const profile = await db.userProfile.findUnique({
          where: { userId: token.id as string },
        })
        token.hasCompletedOnboarding = profile?.onboardingCompleted ?? false
      }
      
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding as boolean
      }
      return session
    },
  },
  events: {
    async signIn({ user }) {
      // Update last login time
      if (user.id) {
        await db.user.update({
          where: { id: user.id },
          data: { updatedAt: new Date() },
        })
      }
    },
  },
  debug: process.env.NODE_ENV === "development",
}

declare module "next-auth" {
  interface User {
    id?: string
    hasCompletedOnboarding?: boolean
  }
  
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      image?: string | null
      hasCompletedOnboarding: boolean
    }
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string
    hasCompletedOnboarding?: boolean
  }
}
