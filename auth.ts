import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import GitHub from "next-auth/providers/github";
import Google from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(db),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  providers: [
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID,
      clientSecret: process.env.AUTH_GITHUB_SECRET,
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
    Credentials({
      async authorize(credentials) {
        const parsed = loginSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;

        const user = await db.user.findUnique({
          where: { email },
          select: { id: true, email: true, name: true, image: true, password: true, role: true },
        });

        if (!user || !user.password) return null;

        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session: updateData }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: string }).role;
      }

      // Handle impersonation updates
      if (trigger === "update" && updateData) {
        if (updateData.impersonateUserId) {
          // Only SUPER_ADMIN can impersonate
          const currentRole = (token.originalRole as string) || (token.role as string);
          if (currentRole === "SUPER_ADMIN") {
            const target = await db.user.findUnique({
              where: { id: updateData.impersonateUserId as string },
              select: { id: true, role: true },
            });
            if (target) {
              token.originalId = token.originalId || token.id;
              token.originalRole = token.originalRole || token.role;
              token.id = target.id;
              token.role = target.role;
              token.impersonating = true;
            }
          }
        }
        if (updateData.stopImpersonation) {
          token.id = token.originalId || token.id;
          token.role = token.originalRole || token.role;
          token.originalId = undefined;
          token.originalRole = undefined;
          token.impersonating = false;
        }
      }

      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        (session.user as { role?: string }).role = token.role as string;
        (session.user as { impersonating?: boolean }).impersonating = (token.impersonating as boolean) || false;
        (session.user as { originalAdminId?: string }).originalAdminId = token.originalId as string | undefined;
      }
      return session;
    },
  },
});
