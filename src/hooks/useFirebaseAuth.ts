'use client';

import { auth } from '@/repository/db/config/client';
import { usePrivy } from '@privy-io/react-auth';
import { signInWithCustomToken, signOut } from 'firebase/auth';
import type { User } from 'firebase/auth';
import { useEffect, useState } from 'react';

// Farcaster miniapp環境用のwindow拡張の型定義
interface FarcasterWindow extends Window {
  farcasterMiniApp?: boolean;
  privyToken?: string;
}

/**
 * Farcasterのminiapp環境かどうかを判定する
 * @returns miniapp環境の場合true
 */
function isFarcasterMiniApp(): boolean {
  try {
    // User-Agentからminiapp環境を検出
    const userAgent = navigator.userAgent || '';
    const referer = document.referrer || '';

    // Farcaster関連のUser-AgentやRefererをチェック
    return (
      userAgent.includes('Farcaster') ||
      userAgent.includes('miniapp') ||
      referer.includes('farcaster.xyz') ||
      referer.includes('warpcast.com') ||
      // カスタムプロパティでminiapp環境を検出
      (window as FarcasterWindow).farcasterMiniApp === true ||
      // URLパラメータでminiapp環境を検出
      new URLSearchParams(window.location.search).get('miniapp') === 'true'
    );
  } catch (error) {
    console.warn('MiniApp detection failed:', error);
    return false;
  }
}

/**
 * miniapp環境でのトークン取得を試行する
 * @returns Privyトークン
 */
async function getPrivyTokenForMiniApp(): Promise<string | null> {
  try {
    // 1. カスタムプロパティからトークンを取得
    const windowToken = (window as FarcasterWindow).privyToken;
    if (windowToken) {
      return windowToken;
    }

    // 2. localStorageからトークンを取得
    const localToken = localStorage.getItem('privy-token');
    if (localToken) {
      return localToken;
    }

    // 3. sessionStorageからトークンを取得
    const sessionToken = sessionStorage.getItem('privy-token');
    if (sessionToken) {
      return sessionToken;
    }

    return null;
  } catch (error) {
    console.error('MiniApp token extraction error:', error);
    return null;
  }
}

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

        let accessToken: string | null = null;

        // miniapp環境の場合は専用の方法でトークンを取得
        if (isFarcasterMiniApp()) {
          accessToken = await getPrivyTokenForMiniApp();
        }

        // miniapp環境でトークンが取得できない場合は通常の方法を使用
        if (!accessToken) {
          accessToken = await getAccessToken();
        }

        if (!accessToken) {
          throw new Error('Privyアクセストークンの取得に失敗しました');
        }

        // miniapp環境の場合はトークンを保存
        if (isFarcasterMiniApp()) {
          try {
            localStorage.setItem('privy-token', accessToken);
            (window as FarcasterWindow).privyToken = accessToken;
          } catch (error) {
            console.warn('Failed to save token to storage:', error);
          }
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

        setState({
          isFirebaseAuthenticated: true,
          isLoading: false,
          error: null,
          user: auth.currentUser,
        });
      } catch (error) {
        console.error('Firebase認証同期エラー:', error);
        setState({
          isFirebaseAuthenticated: false,
          isLoading: false,
          error: error instanceof Error ? error.message : '不明なエラー',
          user: null,
        });
      }
    };

    syncFirebaseAuth();
  }, [isPrivyAuthenticated, privyUser?.id, getAccessToken]);

  return state;
}
