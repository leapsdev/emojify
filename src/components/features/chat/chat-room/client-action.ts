import { db } from '@/lib/firebase/client';
import type { Message } from '@/types/database';
import { DB_INDEXES, DB_PATHS } from '@/types/database';
import { get, off, onValue, ref } from 'firebase/database';

/**
 * チャットルームのメッセージをリアルタイムで購読
 */
export function subscribeToRoomMessages(
  roomId: string,
  onMessage: (messages: Message[]) => void,
): () => void {
  const messagesRef = ref(db, `${DB_INDEXES.roomMessages}/${roomId}`);
  const messages: Message[] = [];

  // 初期データと更新の監視
  onValue(
    messagesRef,
    async (indexSnapshot) => {
      const messageIds = Object.keys(indexSnapshot.val() || {});

      // 全メッセージを取得
      const messageSnapshots = await Promise.all(
        messageIds.map((messageId) =>
          get(ref(db, `${DB_PATHS.messages}/${messageId}`)),
        ),
      );

      // メッセージを配列に変換
      messages.length = 0; // 配列をクリア
      messageSnapshots.forEach((snapshot) => {
        const message = snapshot.val() as Message;
        if (message) {
          messages.push(message);
        }
      });

      // タイムスタンプでソート
      messages.sort((a, b) => a.createdAt - b.createdAt);

      // コールバックを呼び出し
      onMessage(messages);
    },
    () => onMessage([]),
  );

  // クリーンアップ用の関数を返す
  return () => {
    off(messagesRef);
  };
}
