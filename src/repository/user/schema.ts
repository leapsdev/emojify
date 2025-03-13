import { z } from 'zod';

export const profileFormSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  bio: z.string().max(500).optional(),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  bio: z.string().nullable(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

export type User = z.infer<typeof userSchema>;
