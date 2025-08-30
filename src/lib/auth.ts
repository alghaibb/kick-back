import { env } from "@/lib/env";
import prisma from "@/lib/prisma";
import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import type { NextAuthConfig } from "next-auth";
import NextAuth from "next-auth";
import { Adapter } from "next-auth/adapters";
import { encode as defaultEncode } from "next-auth/jwt";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { v4 as uuid } from "uuid";

const adapter = PrismaAdapter(prisma) as Adapter;

const authConfig: NextAuthConfig = {
  adapter,
  providers: [
    Google({
      clientId: env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
      clientSecret: env.AUTH_GOOGLE_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    Facebook({
      clientId: env.NEXT_PUBLIC_FACEBOOK_APP_ID,
      clientSecret: env.AUTH_FACEBOOK_SECRET,
      allowDangerousEmailAccountLinking: true,
      authorization: {
        params: {
          prompt: "select_account",
        },
      },
    }),
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          const { email, password } = credentials as {
            email: string;
            password?: string;
          };

          if (!email) {
            throw new Error("Email is required.");
          }

          const user = await prisma.user.findUnique({
            where: { email },
          });

          if (!user) {
            throw new Error("No user found with this email.");
          }

          // If password is provided, validate it
          if (password) {
            const isPasswordValid = await bcrypt.compare(
              password,
              user.password as string
            );
            if (!isPasswordValid) {
              throw new Error("Invalid credentials.");
            }
          }

          // If no password, ensure the user is verified
          if (!password && !user.emailVerified) {
            throw new Error("Email is not verified. Please verify your email.");
          }

          return {
            id: user.id,
            name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
            email: user.email,
            emailVerified: user.emailVerified,
            image: user.image,
          };
        } catch (error) {
          console.error("[NextAuth][credentials] Error:", error);
          throw new Error("Invalid credentials.");
        }
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      if (!account || !profile) {
        return true;
      }

      const existingUser = await prisma.user.findUnique({
        where: { email: user.email as string },
      });

      // If the user doesn't exist, create a new one
      if (!existingUser) {
        await prisma.user.create({
          data: {
            email: user.email ?? "",
            firstName: profile?.given_name ?? "",
            lastName: profile?.family_name ?? "",
            emailVerified: new Date(),
            image: profile?.picture ?? null,
            hasOnboarded: false, // Ensure new OAuth users go through onboarding
          },
        });
      }

      return true;
    },
    async redirect({ url, baseUrl }) {
      // After OAuth callback, redirect to our auth-redirect page
      if (
        url.includes("/api/auth/callback/google") ||
        url.includes("/api/auth/callback/facebook")
      ) {
        return `${baseUrl}/auth-redirect`;
      }

      // For any callback, go to auth-redirect to check onboarding
      if (url.includes("/callback/")) {
        return `${baseUrl}/auth-redirect`;
      }

      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;

      return `${baseUrl}/auth-redirect`;
    },
    async jwt({ token, account, user }) {
      if (user) {
        token.image = user.image ?? null;
      }

      if (account?.provider === "credentials") {
        token.credentials = true;
      }

      if (account?.provider === "email") {
        token.sub = account.userId;
      }
      return token;
    },
  },
  jwt: {
    encode: async function (params) {
      if (params.token?.credentials) {
        const sessionToken = uuid();

        if (!params.token.sub) {
          console.error("[NextAuth][jwt.encode] No user ID found in token");
          throw new Error("No user ID found in token");
        }

        const userId = params.token.sub;
        if (!adapter.createSession) {
          console.error(
            "[NextAuth][jwt.encode] createSession method is not defined on the adapter"
          );
          throw new Error("createSession method is not defined on the adapter");
        }
        const createdSession = await adapter.createSession({
          sessionToken: sessionToken,
          userId: userId,
          expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        });

        if (!createdSession) {
          console.error("[NextAuth][jwt.encode] Failed to create session");
          throw new Error("Failed to create session");
        }

        // Re-enable push subscriptions for this user when they log in
        try {
          await prisma.pushSubscription.updateMany({
            where: { userId },
            data: { disabled: false },
          });
        } catch (error) {
          console.error(
            "Failed to re-enable push subscriptions on login:",
            error
          );
          // Don't fail the login if this fails
        }

        return sessionToken;
      }
      return defaultEncode(params);
    },
  },
  pages: {
    signIn: "/login",
    signOut: "/login",
  },
  cookies: {
    sessionToken: {
      name: `${process.env.NODE_ENV === "production" ? "__Secure-" : ""}authjs.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
  trustHost: true,
  secret: env.AUTH_SECRET,
  experimental: { enableWebAuthn: true },
};

export const { handlers, signIn, signOut, auth } = NextAuth(authConfig);
