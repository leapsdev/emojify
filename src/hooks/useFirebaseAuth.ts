'use client';

import { auth } from '@/repository/db/config/client';
import { usePrivy } from '@privy-io/react-auth';
import {
  type User,
  onAuthStateChanged,
  signInWithCustomToken,
  signOut,
} from 'firebase/auth';
import { useEffect, useState } from 'react';

interface FirebaseAuthState {
  isFirebaseAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export function useFirebaseAuth() {
  const { authenticated: isPrivyAuthenticated, user: privyUser } = usePrivy();
  const [state, setState] = useState<FirebaseAuthState>({
    isFirebaseAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
  });

  useEffect(() => {
    const syncFirebaseAuth = async () => {
      try {
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

        // Firebaseカスタムトークンを取得
        const response = await fetch('/api/auth/firebase-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
          },
        });

        if (!response.ok) {
          throw new Error('Firebaseトークンの取得に失敗しました');
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
  }, [isPrivyAuthenticated, privyUser?.id]);

  const signOutFromFirebase = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebaseサインアウトエラー:', error);
    }
  };

  return {
    ...state,
    signOutFromFirebase,
  };
}
