import type { User } from './database';

export interface DisplayUser extends Pick<User, 'id' | 'username'> {
  displayName: string; // usernameと同じ値を使用
  userId: string; // idと同じ値を使用
  avatar: string; // 仮のアバター画像パス
  section: 'friend' | 'other'; // 表示用のセクション情報
}
