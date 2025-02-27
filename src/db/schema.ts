import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

// ユーザーテーブル
export const users = sqliteTable('users', {
  id: text('id').primaryKey(), // PrivyのユーザーID
  address: text('address'), // ウォレットアドレス
  username: text('username'),
  profileImageUrl: text('profile_image_url'),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});
