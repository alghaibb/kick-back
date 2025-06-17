import { z } from "zod";
import { emailField, firstNameField, lastNameField } from "../fields";

export const magicLinkCreateAccountSchema = z.object({
  firstName: firstNameField,
  lastName: lastNameField,
  email: emailField,
});

export type MagicLinkCreateAccountValues = z.infer<typeof magicLinkCreateAccountSchema>;