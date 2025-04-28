'use client';

import { usePrivy as usePrivyOriginal } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

/**
 * クライアントサイドでPrivyのユーザーIDを取得するためのカスタムフック
 * SSRとクライアントサイドの状態を適切に管理
 * @returns ユーザーID、準備完了状態、エラー状態
 */
export function usePrivyId() {
  const { user, ready } = usePrivyOriginal();
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // Privyの初期化完了を待つ
    if (!ready) return;

    try {
      if (user) {
        setUserId(user.id);
      } else {
        setUserId(null);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to get user ID'));
    } finally {
      setIsInitialized(true);
    }
  }, [ready, user]);

  return {
    userId,
    isInitialized,
    error,
    isLoading: !isInitialized && !error
  };
}

/**
 * オリジナルのusePrivyフックをエクスポート
 * 型安全性とSSR対応を強化
 */
export function usePrivy() {
  const privyContext = usePrivyOriginal();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (privyContext.ready) {
      setIsInitialized(true);
    }
  }, [privyContext.ready]);

  return {
    ...privyContext,
    isInitialized,
    isLoading: !isInitialized
  };
}
