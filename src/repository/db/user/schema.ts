import { z } from 'zod';

export type AuthProvider = 'privy' | 'farcaster';

export const profileFormSchema = z.object({
  email: z.string().email().nullable().optional(),
  username: z.string().min(3).max(20),
  bio: z.string().max(500).nullable().optional(),
  imageUrl: z.string().nullable().optional(),
});

export type ProfileForm = z.infer<typeof profileFormSchema>;

export const userSchema = z.object({
  id: z.string(),
  authProvider: z.enum(['privy', 'farcaster']),
  email: z.string().email().nullable().optional(),
  username: z.string(),
  bio: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
  friends: z
    .record(
      z.object({
        createdAt: z.number(),
      }),
    )
    .optional(),
});

export type User = z.infer<typeof userSchema>;
