'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import {
  type DataSnapshot,
  type DatabaseReference,
  get,
  onValue,
  ref,
} from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読するhook
 */
export function useUserRooms(userId: string, initialRooms: ChatRoom[]) {
  // ルーム一覧の状態を管理
  const roomsRef = useRef<ChatRoom[]>(initialRooms);

  // 現在のルーム一覧を返す
  const getSnapshot = useCallback(() => {
    return roomsRef.current;
  }, []);

  // ルーム一覧の変更を監視
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!userId) {
        roomsRef.current = [];
        callback();
        return () => {};
      }

      // ユーザーのルーム一覧を監視
      const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);
      const unsubscribe = onValue(userRoomsRef, async (snapshot) => {
        try {
          const snapshotVal = snapshot.val();
          if (!snapshotVal) {
            roomsRef.current = [];
          } else {
            // ルームIDの一覧を取得
            const roomIds = Object.keys(snapshotVal);

            // 各ルームの情報を取得
            const roomPromises = roomIds.map((roomId) => {
              const roomRef: DatabaseReference = ref(
                db,
                `${DB_PATHS.chatRooms}/${roomId}`,
              );
              return get(roomRef);
            });
            const roomSnapshots: DataSnapshot[] =
              await Promise.all(roomPromises);

            // ルーム一覧を更新
            roomsRef.current = roomSnapshots
              .map((snapshot) => snapshot.val())
              .filter((room): room is ChatRoom => room !== null)
              .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
          }
          callback();
        } catch (error) {
          console.error('Failed to fetch rooms:', error);
        }
      });

      // クリーンアップ
      return () => {
        unsubscribe();
        roomsRef.current = initialRooms;
      };
    },
    [userId, initialRooms],
  );

  // サーバーレンダリング時は初期ルーム一覧を返す
  const getServerSnapshot = useCallback(() => {
    return initialRooms;
  }, [initialRooms]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
