import { z } from 'zod';

export const profileFormSchema = z.object({
  email: z.string().email(),
  username: z.string().min(3).max(20),
  bio: z.string().max(500).optional().nullable(),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

export const linkedAccountSchema = z.object({
  type: z.string(),
  address: z.string(),
});

export type LinkedAccount = z.infer<typeof linkedAccountSchema>;

export const userSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  username: z.string(),
  bio: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  friends: z
    .record(
      z.object({
        createdAt: z.number(),
      }),
    )
    .optional(),
  linkedAccounts: z.array(linkedAccountSchema).optional(),
});

export type User = z.infer<typeof userSchema>;
