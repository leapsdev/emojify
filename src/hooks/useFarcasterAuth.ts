'use client';

import { getFarcasterSDK } from '@/lib/farcaster';
import { auth } from '@/repository/db/config/client';
import {
  type User,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

interface FarcasterAuthState {
  isFarcasterAuthenticated: boolean;
  isFirebaseAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  farcasterToken: string | null;
}

/**
 * Farcaster Quick Auth + Firebase認証を管理するカスタムフック
 * Farcaster Mini App環境で使用される
 */
export function useFarcasterAuth() {
  const [state, setState] = useState<FarcasterAuthState>({
    isFarcasterAuthenticated: false,
    isFirebaseAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
    farcasterToken: null,
  });

  const authenticateWithFarcaster = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const sdk = getFarcasterSDK();
      if (!sdk) {
        throw new Error('Farcaster SDKが初期化されていません');
      }

      // Farcaster Quick Authトークンを取得
      const { token } = await sdk.quickAuth.getToken();

      if (!token) {
        throw new Error('Farcasterトークンの取得に失敗しました');
      }

      setState((prev) => ({
        ...prev,
        isFarcasterAuthenticated: true,
        farcasterToken: token,
      }));

      // サーバーサイドでFirebaseカスタムトークンを取得
      const response = await fetch('/api/auth/farcaster-firebase-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          errorData.error || 'Firebaseトークンの取得に失敗しました',
        );
      }

      const { customToken } = await response.json();

      // Firebaseにカスタムトークンでサインイン
      await signInWithCustomToken(auth, customToken);
    } catch (error) {
      console.error('Farcaster認証エラー:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error:
          error instanceof Error ? error.message : '認証エラーが発生しました',
        isFarcasterAuthenticated: false,
        farcasterToken: null,
      }));
    }
  }, []);

  const signOutFromFarcaster = useCallback(async () => {
    try {
      await signOut(auth);
      setState({
        isFarcasterAuthenticated: false,
        isFirebaseAuthenticated: false,
        isLoading: false,
        error: null,
        user: null,
        farcasterToken: null,
      });
    } catch (error) {
      console.error('Farcasterサインアウトエラー:', error);
      setState((prev) => ({
        ...prev,
        error:
          error instanceof Error
            ? error.message
            : 'サインアウトエラーが発生しました',
      }));
    }
  }, []);

  useEffect(() => {
    // Firebase認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState((prev) => ({
        ...prev,
        isFirebaseAuthenticated: !!user,
        isLoading: prev.isFarcasterAuthenticated ? false : prev.isLoading,
        user,
      }));
    });

    // 初期認証を実行
    authenticateWithFarcaster();

    return () => {
      unsubscribe();
    };
  }, [authenticateWithFarcaster]);

  return {
    ...state,
    authenticateWithFarcaster,
    signOutFromFarcaster,
  };
}
