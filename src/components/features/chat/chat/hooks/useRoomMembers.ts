'use client';

import { db } from '@/repository/db/config/client';
import type { ChatRoom, User } from '@/repository/db/database';
import { DB_PATHS } from '@/repository/db/database';
import { get, onValue, ref } from 'firebase/database';
import { useCallback, useRef, useSyncExternalStore } from 'react';

type MemberWithUserInfo = {
  joinedAt: number;
  lastReadAt: number;
  username?: string;
  imageUrl?: string | null;
  walletAddress: string;
};

export function useRoomMembers(roomId: string) {
  const membersRef = useRef<Record<string, MemberWithUserInfo>>({});

  const getSnapshot = useCallback(() => {
    return membersRef.current;
  }, []);

  const subscribe = useCallback(
    (callback: () => void) => {
      const roomRef = ref(db, `${DB_PATHS.chatRooms}/${roomId}`);

      const unsubscribe = onValue(roomRef, async (snapshot) => {
        const room = snapshot.val() as ChatRoom;
        if (!room) {
          membersRef.current = {};
          callback();
          return;
        }

        // メンバー情報とユーザー情報を結合
        const membersWithUserInfo: Record<string, MemberWithUserInfo> = {};

        for (const [walletAddress, memberInfo] of Object.entries(
          room.members,
        )) {
          try {
            // ユーザー情報を取得
            const userSnapshot = await get(
              ref(db, `${DB_PATHS.users}/${walletAddress}`),
            );
            const user = userSnapshot.val() as User | null;

            membersWithUserInfo[walletAddress] = {
              ...memberInfo,
              walletAddress,
              username:
                user?.username ||
                `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
              imageUrl: user?.imageUrl || null,
            };
          } catch (error) {
            console.warn(
              `Failed to fetch user data for ${walletAddress}:`,
              error,
            );
            // ユーザー情報が取得できない場合は、ウォレットアドレスを使用
            membersWithUserInfo[walletAddress] = {
              ...memberInfo,
              walletAddress,
              username: `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`,
              imageUrl: null,
            };
          }
        }

        membersRef.current = membersWithUserInfo;
        callback();
      });

      return () => {
        unsubscribe();
        membersRef.current = {};
      };
    },
    [roomId],
  );

  const getServerSnapshot = useCallback(() => {
    return {};
  }, []);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
