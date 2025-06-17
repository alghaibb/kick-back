import { z } from "zod";

export const otpSchema = z.object({
  otp: z
    .string()
    .length(6, { message: "Your one-time password must be exactly 6 characters." })
    .regex(/^\d+$/, { message: "OTP must contain only numbers." }),
});

export type OTPValues = z.infer<typeof otpSchema>;