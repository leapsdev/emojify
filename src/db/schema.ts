import { pgTable, text, timestamp } from 'drizzle-orm/pg-core';

// ユーザーテーブル
export const users = pgTable('users', {
  id: text('id').primaryKey(), // PrivyのユーザーID
  address: text('address'), // ウォレットアドレス
  username: text('username'),
  profileImageUrl: text('profile_image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
