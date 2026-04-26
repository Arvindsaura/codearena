import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@next-auth/prisma-adapter";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    CredentialsProvider({
      name: "LeetCode Username",
      credentials: {
        username: { label: "Username", type: "text", placeholder: "leetcode_user" },
      },
      async authorize(credentials) {
        if (!credentials?.username) return null;
        
        // Find or create user based ONLY on username
        let user = await prisma.user.findFirst({
          where: { 
            OR: [
              { leetcodeUser: credentials.username },
              { name: credentials.username }
            ]
          }
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              name: credentials.username,
              leetcodeUser: credentials.username,
              email: `${credentials.username}@codearena.anon`, // Temporary internal email
            }
          });
        }
        
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.id}`,
        };
      }
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: "/", // Redirect to home for custom login
  },
  secret: process.env.NEXTAUTH_SECRET || "codearena_secret",
};
