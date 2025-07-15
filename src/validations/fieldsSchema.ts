import { z } from "zod";

export const emailField = z
  .string()
  .email({ message: "Invalid email address" })
  .trim();

export const passwordField = z
  .string()
  .min(6, { message: "Password must be at least 6 characters" });

export const firstNameField = z
  .string()
  .min(1, { message: "First Name is required" })
  .trim()
  .max(50, { message: "First Name is too long" });

export const lastNameField = z
  .string()
  .max(50, { message: "Last name is too long" })
  .trim()
  .or(z.literal(""))
  .optional();

export const nicknameField = z
  .string()
  .max(30, { message: "Nickname is too long" })
  .trim()
  .optional()
  .or(z.literal(""));
