import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required").url(),
    AUTH_GOOGLE_ID: z.string().min(1, "GOOGLE_CLIENT_ID is required"),
    AUTH_GOOGLE_SECRET: z.string().min(1, "GOOGLE_CLIENT_SECRET is required"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z.string().min(1, "A NEXT_PUBLIC_BASE_URL is required").url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});