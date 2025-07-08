import { z } from "zod";
import { emailField } from "../fieldsSchema";

export const inviteGroupSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  email: emailField,
  role: z.enum(["member", "admin"]),
});

export type InviteGroupValues = z.infer<typeof inviteGroupSchema>;

export const serverInviteGroupSchema = z.object({
  groupId: z.string().min(1, "Group ID is required"),
  email: emailField,
  role: z.enum(["member", "admin"]),
});

export type ServerInviteGroupValues = z.infer<typeof serverInviteGroupSchema>;

export const acceptInviteSchema = z.object({
  token: z.string().min(1, "Token is required"),
});

export type AcceptInviteValues = z.infer<typeof acceptInviteSchema>; 