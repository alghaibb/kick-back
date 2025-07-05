import { z } from "zod";
import { emailField, passwordField } from "../fieldsSchema";

export const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

export type LoginValues = z.infer<typeof loginSchema>;
