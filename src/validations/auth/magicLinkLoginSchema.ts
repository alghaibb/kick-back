import { z } from "zod";
import { emailField } from "../fieldsSchema";

export const magicLinkLoginSchema = z.object({
  email: emailField,
});

export type MagicLinkLoginValues = z.infer<typeof magicLinkLoginSchema>;