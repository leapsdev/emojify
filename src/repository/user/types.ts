export type User = {
  id: string;
  address: string | null;
  username: string | null;
  profileImageUrl: string | null;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateProfileInput = {
  username?: string;
  profileImageUrl?: string;
  address?: string;
  email?: string;
};

export type UpdateProfileInput = CreateProfileInput;

export type SearchUsersInput = {
  query: string;
  limit?: number;
  offset?: number;
};
