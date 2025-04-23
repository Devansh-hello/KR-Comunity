import { PrismaAdapter } from "@auth/prisma-adapter"
import { prisma } from "@/lib/prisma"
import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import GithubProvider from "next-auth/providers/github"
import CredentialsProvider from "next-auth/providers/credentials"
import bcrypt from "bcryptjs"

// Extend the session user type to include id
declare module "next-auth" {
  interface Session {
    user: {
      id: string
      name?: string | null
      email?: string | null
      image?: string | null
    }
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
    GithubProvider({
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
    }),
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        })

        if (!user || !user.hashedPassword) {
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.hashedPassword
        )

        if (!passwordMatch) {
          return null
        }

        return user
      }
    }),
  ],
  pages: {
    signIn: '/signin',
    error: '/auth/error',
  },
  session: {
    strategy: "jwt"
  },
  callbacks: {
    async session({ session, token }) {
      console.log("Session callback called with token:", token)
      
      if (session?.user && token.sub) {
        session.user.id = token.sub
        // Log the updated session
        console.log("Updated session with user ID:", session)
      } else {
        console.warn("Missing user or token.sub in session callback:", { session, token })
      }
      return session
    },
    async jwt({ token, user, account }) {
      console.log("JWT callback called:", { user, token, account })
      
      if (user) {
        token.sub = user.id
        console.log("JWT callback: Setting token.sub to user.id:", user.id)
      }
      
      // Add account information to debug
      if (account) {
        console.log("Account info in JWT callback:", account)
      }
      
      return token
    },
    async redirect({ url, baseUrl }) {
      // Customize redirect behavior
      console.log("Redirect callback:", { url, baseUrl })
      
      // If the URL starts with the base URL, it's safe to redirect
      if (url.startsWith(baseUrl)) {
        return url;
      }
      
      // If it's an absolute URL but doesn't start with the base URL, 
      // redirect to the homepage
      if (url.startsWith("http")) {
        return baseUrl;
      }
      
      // Otherwise, redirect to the absolute path
      return `${baseUrl}${url}`;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

// Add to your existing session type
interface Session {
  user: {
    id: string
    email: string
    name: string
    role: "USER" | "ADMIN" | "MODERATOR"
    permissions: string[]
    // ... other fields
  }
} 