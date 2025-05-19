'use client';

import { db } from '@/repository/config/client';
import { ref as dbRef, onValue } from 'firebase/database';
import { useCallback, useRef } from 'react';
import { useSyncExternalStore } from 'react';

/**
 * ユーザー間のフレンド状態を監視するカスタムフック
 * @param currentUserId 現在のユーザーID
 * @param targetUserId 対象のユーザーID
 * @param initialState サーバーから取得した初期フレンド状態
 * @returns フレンド状態（boolean）
 */
export const useIsFriend = (
  currentUserId: string,
  targetUserId: string,
  initialState = false,
) => {
  // 現在のフレンド状態を保持するref
  const friendStatusRef = useRef(initialState);

  const subscribe = useCallback(
    (callback: (value: boolean) => void) => {
      if (!currentUserId || !targetUserId) {
        callback(false);
        return () => {};
      }

      const ref = dbRef(db, `users/${currentUserId}/friends/${targetUserId}`);
      const unsubscribe = onValue(
        ref,
        (snapshot) => {
          const exists = snapshot.exists();
          friendStatusRef.current = exists;
          callback(exists);
        },
        (error) => {
          console.error('Error watching friend status:', error);
          friendStatusRef.current = false;
          callback(false);
        },
      );

      return () => unsubscribe();
    },
    [currentUserId, targetUserId],
  );

  // 現在のフレンド状態を返す
  const getSnapshot = useCallback(() => {
    return friendStatusRef.current;
  }, []);

  // サーバーサイドでは初期値を返す
  const getServerSnapshot = useCallback(() => initialState, [initialState]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
