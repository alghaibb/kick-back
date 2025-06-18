import { z } from 'zod';

export const onboardingSchema = z.object({
  nickname: z.string().max(30).optional(),
  image: z.string().url().optional(),
});

export type OnboardingValues = z.infer<typeof onboardingSchema>;
