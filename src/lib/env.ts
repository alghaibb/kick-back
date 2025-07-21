import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    DATABASE_URL: z.string().min(1, "DATABASE_URL is required").url(),
    DATABASE_URL_UNPOOLED: z.string().min(1, "DATABASE_URL_UNPOOLED is required").url(),
    PGHOST: z.string().min(1, "PGHOST is required"),
    PGHOST_UNPOOLED: z.string().min(1, "PGHOST_UNPOOLED is required"),
    PGUSER: z.string().min(1, "PGUSER is required"),
    PGDATABASE: z.string().min(1, "PGDATABASE is required"),
    PGPASSWORD: z.string().min(1, "PGPASSWORD is required"),
    POSTGRES_URL: z.string().min(1, "POSTGRES_URL is required").url(),
    POSTGRES_URL_NON_POOLING: z.string().min(1, "POSTGRES_URL_NON_POOLING is required").url(),
    POSTGRES_HOST: z.string().min(1, "POSTGRES_HOST is required"),
    POSTGRES_USER: z.string().min(1, "POSTGRES_USER is required"),
    POSTGRES_PASSWORD: z.string().min(1, "POSTGRES_PASSWORD is required"),
    POSTGRES_DATABASE: z.string().min(1, "POSTGRES_DATABASE is required"),
    POSTGRES_URL_NO_SSL: z.string().min(1, "POSTGRES_URL_NO_SSL is required").url(),
    POSTGRES_PRISMA_URL: z.string().min(1, "POSTGRES_PRISMA_URL is required").url(),

    AUTH_SECRET: z.string().min(1, "AUTH_SECRET is required"),
    RESEND_API_KEY: z.string().min(1, "RESEND_API_KEY is required"),
    AUTH_GOOGLE_ID: z.string().min(1, "AUTH_GOOGLE_ID is required"),
    AUTH_GOOGLE_SECRET: z.string().min(1, "AUTH_GOOGLE_SECRET is required"),
    AUTH_FACEBOOK_ID: z.string().min(1, "AUTH_FACEBOOK_ID is required"),
    AUTH_FACEBOOK_SECRET: z.string().min(1, "AUTH_FACEBOOK_SECRET is required"),
    BLOB_READ_WRITE_TOKEN: z
      .string()
      .min(1, "BLOB_READ_WRITE_TOKEN is required"),
    CRON_SECRET: z.string().min(1, "CRON_SECRET is required"),
    TWILIO_ACCOUNT_SID: z.string().min(1, "TWILIO_ACCOUNT_SID is required"),
    TWILIO_AUTH_TOKEN: z.string().min(1, "TWILIO_AUTH_TOKEN is required"),
    TWILIO_PHONE_NUMBER: z.string().min(1, "TWILIO_PHONE_NUMBER is required"),
  },
  client: {
    NEXT_PUBLIC_BASE_URL: z
      .string()
      .min(1, "A NEXT_PUBLIC_BASE_URL is required")
      .url(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
});
