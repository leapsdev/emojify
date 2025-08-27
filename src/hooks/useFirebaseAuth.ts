'use client';

import { auth } from '@/repository/db/config/client';
import { usePrivy } from '@privy-io/react-auth';
import {
  type User,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useFarcasterMiniApp } from './useFarcasterMiniApp';

interface FirebaseAuthState {
  isFirebaseAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export function useFirebaseAuth() {
  const {
    authenticated: isPrivyAuthenticated,
    user: privyUser,
    getAccessToken,
  } = usePrivy();
  const { isFarcasterEnv } = useFarcasterMiniApp();
  const [state, setState] = useState<FirebaseAuthState>({
    isFirebaseAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
  });

  // 認証処理の重複実行を防ぐためのフラグ
  const isAuthenticating = useRef(false);
  const lastPrivyUserId = useRef<string | null>(null);

  // トークン取得をメモ化して無限ループを防ぐ
  const getStoredToken = useCallback(() => {
    if (isFarcasterEnv) {
      try {
        const token = localStorage.getItem('privy-token');
        const expiry = localStorage.getItem('privy-token-expiry');

        if (token && expiry && Date.now() < Number.parseInt(expiry, 10)) {
          return token;
        }

        // 期限切れの場合は削除
        if (token) {
          localStorage.removeItem('privy-token');
          localStorage.removeItem('privy-token-expiry');
        }

        return null;
      } catch (error) {
        console.error('Failed to get token from localStorage:', error);
        return null;
      }
    }
    return null;
  }, [isFarcasterEnv]);

  useEffect(() => {
    const syncFirebaseAuth = async () => {
      // 既に認証処理中の場合はスキップ
      if (isAuthenticating.current) {
        return;
      }

      // PrivyユーザーIDが変更されていない場合はスキップ
      if (lastPrivyUserId.current === privyUser?.id) {
        return;
      }

      try {
        isAuthenticating.current = true;
        lastPrivyUserId.current = privyUser?.id || null;

        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        if (!isPrivyAuthenticated || !privyUser?.id) {
          // Privyが未認証の場合、Firebaseからサインアウト
          await signOut(auth);
          setState({
            isFirebaseAuthenticated: false,
            isLoading: false,
            error: null,
            user: null,
          });
          return;
        }

        let accessToken: string | null = null;

        if (isFarcasterEnv) {
          // Farcaster環境では保存されたトークンを優先使用
          accessToken = getStoredToken();
          if (!accessToken) {
            // 保存されたトークンがない場合は新しく取得
            console.log('No stored token found, getting new token from Privy');
            accessToken = await getAccessToken();
          } else {
            console.log('Using stored token from localStorage');
          }
        } else {
          // 通常のブラウザ環境ではPrivyから直接取得
          accessToken = await getAccessToken();
        }

        if (!accessToken) {
          throw new Error('Privyアクセストークンの取得に失敗しました');
        }

        // Firebaseカスタムトークンを取得
        const response = await fetch('/api/auth/firebase-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || 'Firebaseトークンの取得に失敗しました',
          );
        }

        const { token } = await response.json();

        // Firebaseにカスタムトークンでサインイン
        await signInWithCustomToken(auth, token);
      } catch (error) {
        console.error('Firebase認証同期エラー:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : '認証エラーが発生しました',
        }));
      } finally {
        isAuthenticating.current = false;
      }
    };

    // Firebase認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState((prev) => ({
        ...prev,
        isFirebaseAuthenticated: !!user,
        isLoading: false,
        user,
      }));
    });

    // Privy認証状態が変更されたときにFirebase認証を同期
    syncFirebaseAuth();

    return () => {
      unsubscribe();
    };
  }, [
    isPrivyAuthenticated,
    privyUser?.id,
    getAccessToken,
    isFarcasterEnv,
    getStoredToken,
  ]);

  const signOutFromFirebase = async () => {
    try {
      await signOut(auth);
      // サインアウト時にフラグをリセット
      isAuthenticating.current = false;
      lastPrivyUserId.current = null;
    } catch (error) {
      console.error('Firebaseサインアウトエラー:', error);
    }
  };

  return {
    ...state,
    signOutFromFirebase,
  };
}
