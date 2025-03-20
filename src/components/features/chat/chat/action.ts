import type { ChatRoom } from '@/types/database';
import { db } from '@/lib/firebase/client';
import { ref, onValue, get, off } from 'firebase/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';

export function subscribeToUserRoomsAction(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void
) {
  return subscribeToUserRooms(userId, onRooms);
}

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読
 * @param userId ユーザーID
 * @param onRooms ルーム一覧が更新されたときのコールバック
 * @returns 購読解除用の関数
 */
export function subscribeToUserRooms(
  userId: string,
  onRooms: (rooms: ChatRoom[]) => void,
): () => void {
  const userRoomsRef = ref(db, `${DB_INDEXES.userRooms}/${userId}`);
  const rooms: ChatRoom[] = [];

  // リアルタイム監視を設定
  onValue(userRoomsRef, async (indexSnapshot) => {
    const userRooms = indexSnapshot.val() || {};
    const roomIds = Object.keys(userRooms);

    // 各ルームの詳細を取得
    const roomSnapshots = await Promise.all(
      roomIds.map((roomId) => get(ref(db, `${DB_PATHS.chatRooms}/${roomId}`))),
    );

    // 配列を更新
    rooms.length = 0;
    roomSnapshots.forEach((snapshot) => {
      const room = snapshot.val() as ChatRoom;
      if (room) {
        rooms.push(room);
      }
    });

    // 更新日時でソート
    rooms.sort((a, b) => b.updatedAt - a.updatedAt);

    // コールバックを呼び出し
    onRooms(rooms);
  });

  // クリーンアップ関数を返す
  return () => off(userRoomsRef);
}
