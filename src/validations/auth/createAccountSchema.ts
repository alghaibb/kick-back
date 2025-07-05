import { z } from "zod";
import {
  emailField,
  firstNameField,
  lastNameField,
  passwordField,
} from "../fieldsSchema";

export const createAccountSchema = z
  .object({
    firstName: firstNameField,
    lastName: lastNameField,
    email: emailField,
    password: passwordField,
    confirmPassword: passwordField,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type CreateAccountValues = z.infer<typeof createAccountSchema>;
