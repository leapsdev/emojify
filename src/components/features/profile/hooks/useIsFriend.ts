'use client';

import { db } from '@/repository/db/config/client';
import { ref as dbRef, onValue } from 'firebase/database';
import { useCallback, useRef } from 'react';
import { useSyncExternalStore } from 'react';

/**
 * ユーザー間のフレンド状態を監視するカスタムフック
 * @param currentWalletAddress 現在のユーザーID
 * @param targetWalletAddress 対象のユーザーID
 * @param initialState サーバーから取得した初期フレンド状態
 * @returns フレンド状態（boolean）
 */
export const useIsFriend = (
  currentWalletAddress: string,
  targetWalletAddress: string,
  initialState = false,
) => {
  // 現在のフレンド状態を保持するref
  const friendStatusRef = useRef(initialState);

  const subscribe = useCallback(
    (callback: (value: boolean) => void) => {
      if (!currentWalletAddress || !targetWalletAddress) {
        callback(false);
        return () => {};
      }

      const ref = dbRef(
        db,
        `users/${currentWalletAddress}/friends/${targetWalletAddress}`,
      );
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
    [currentWalletAddress, targetWalletAddress],
  );

  // 現在のフレンド状態を返す
  const getSnapshot = useCallback(() => {
    return friendStatusRef.current;
  }, []);

  // サーバーサイドでは初期値を返す
  const getServerSnapshot = useCallback(() => initialState, [initialState]);

  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
};
