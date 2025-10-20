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

interface PrivyAuthState {
  isFirebaseAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
}

export function usePrivyAuth() {
  const {
    authenticated: isPrivyAuthenticated,
    user: privyUser,
    getAccessToken,
  } = usePrivy();
  const [state, setState] = useState<PrivyAuthState>({
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

        // Privyアクセストークンを取得
        const accessToken = await getAccessToken();
        if (!accessToken) {
          throw new Error('Failed to get Privy access token');
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
          throw new Error(errorData.error || 'Failed to get Firebase token');
        }

        const { token } = await response.json();

        // Firebaseにカスタムトークンでサインイン
        await signInWithCustomToken(auth, token);
      } catch (error) {
        console.error('Firebase authentication sync error:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error
              ? error.message
              : 'Authentication error occurred',
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
  }, [isPrivyAuthenticated, privyUser?.id, getAccessToken]);

  const signOutFromFirebase = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Firebase sign out error:', error);
    }
  };

  return {
    ...state,
    signOutFromFirebase,
  };
}
