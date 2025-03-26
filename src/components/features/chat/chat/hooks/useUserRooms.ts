'use client';

import { db } from '@/lib/firebase/client';
import type { ChatRoom } from '@/types/database';
import { DB_PATHS } from '@/types/database';
import { onValue, ref } from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

/**
 * ユーザーのチャットルーム一覧をリアルタイムで購読するhook
 */
export function useUserRooms(userId: string, initialRooms: ChatRoom[]) {
  // ルーム一覧をrefで管理
  const roomsRef = useRef<ChatRoom[]>(initialRooms);
  const roomRefsRef = useRef<ReturnType<typeof ref>[]>([]);

  // 現在のルーム一覧を返す
  const getSnapshot = useCallback(() => {
    return roomsRef.current;
  }, []);

  // ルームを更新して通知
  const updateRoom = useCallback((room: ChatRoom) => {
    roomsRef.current = [
      ...roomsRef.current.filter((r) => r.id !== room.id),
      room,
    ].sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0));
  }, []);

  // ルーム一覧の変更を監視
  const subscribe = useCallback(
    (callback: () => void) => {
      if (!userId) {
        roomsRef.current = [];
        callback();
        return () => {};
      }

      const userRoomsRef = ref(db, `${DB_PATHS.userRooms}/${userId}`);

      const unsubscribe = onValue(userRoomsRef, async (indexSnapshot) => {
        const snapshotVal = indexSnapshot.val();
        if (!snapshotVal) {
          roomsRef.current = [];
          callback();
          return;
        }

        // 既存のリスナーをクリーンアップ
        roomRefsRef.current.forEach((roomRef) => {
          onValue(roomRef, () => {});
        });
        roomRefsRef.current = [];

        // チャットルームの変更を監視
        Object.keys(snapshotVal).forEach((roomId) => {
          const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);
          roomRefsRef.current.push(roomRef);

          onValue(roomRef, (snapshot) => {
            const room = snapshot.val() as ChatRoom;
            if (room) {
              updateRoom(room);
              callback();
            }
          });
        });
      });

      return () => {
        roomRefsRef.current.forEach((roomRef) => {
          onValue(roomRef, () => {});
        });
        roomRefsRef.current = [];
        unsubscribe();
        roomsRef.current = initialRooms;
      };
    },
    [userId, initialRooms, updateRoom],
  );

  // サーバーレンダリング時は初期ルーム一覧を返す
  const getServerSnapshot = useCallback(() => {
    return initialRooms;
  }, [initialRooms]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
