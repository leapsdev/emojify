'use client';

import { usePrivy as usePrivyOriginal } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

/**
 * クライアントサイドでPrivyのユーザーIDを取得するためのカスタムフック
 * SSRとクライアントサイドの状態を適切に管理
 * @returns オブジェクト { userId, isInitialized, error, isLoading } の代わりに直接userId文字列を返す
 */
export function usePrivyId(): string | undefined {
  const { user, ready } = usePrivyOriginal();
  const [userId, setUserId] = useState<string>();

  useEffect(() => {
    if (!ready) return;

    if (user) {
      setUserId(user.id);
    } else {
      setUserId(undefined);
    }
  }, [ready, user]);

  return userId;
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
