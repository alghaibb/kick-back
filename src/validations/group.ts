import { z } from 'zod';
import { emailField } from './fields';

export const createGroupSchema = z.object({
  name: z.string().min(2, 'Group name must be at least 2 characters'),
  description: z.string().max(300).optional(),
  invites: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        return val
          .split(',')
          .map((email) => email.trim())
          .every((email) => emailField.safeParse(email).success);
      },
      { message: 'One or more emails are invalid' }
    ),
});

export type CreateGroupValues = z.infer<typeof createGroupSchema>;