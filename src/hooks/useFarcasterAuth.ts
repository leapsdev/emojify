'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
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
  autoLoginAttempted: boolean;
}

/**
 * Farcaster Quick Auth + Firebase認証を管理するカスタムフック
 * Farcaster Mini App環境で使用される
 */
export function useFarcasterAuth() {
  const { isSDKLoaded, isReady, isMiniApp } = useFarcasterMiniApp();
  const [state, setState] = useState<FarcasterAuthState>({
    isFarcasterAuthenticated: false,
    isFirebaseAuthenticated: false,
    isLoading: true,
    error: null,
    user: null,
    farcasterToken: null,
    autoLoginAttempted: false,
  });

  const authenticateWithFarcaster = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Mini App環境でない場合はエラー
      if (!isMiniApp) {
        throw new Error('この機能はFarcaster Mini App環境でのみ利用可能です');
      }

      // SDKが準備完了していない場合はエラー
      if (!isSDKLoaded || !isReady) {
        throw new Error('Farcaster SDKが準備完了していません');
      }

      const sdk = getFarcasterSDK();
      if (!sdk) {
        throw new Error('Farcaster SDKが初期化されていません');
      }

      console.log('Farcaster認証開始: SDKとMini App環境が確認されました');

      let token: string;
      try {
        // Farcaster Quick Authトークンを取得
        const result = await sdk.quickAuth.getToken();
        token = result.token;

        if (!token) {
          throw new Error('Farcasterトークンの取得に失敗しました');
        }

        console.log('Farcasterトークン取得成功');
      } catch (tokenError) {
        console.error('Farcaster SDK token取得エラー:', tokenError);

        // CORSエラーまたはネットワークエラーの場合の詳細なエラーメッセージ
        if (tokenError instanceof Error) {
          if (
            tokenError.message.includes('CORS') ||
            tokenError.message.includes('blocked') ||
            tokenError.message.includes('net::ERR_FAILED')
          ) {
            throw new Error(
              'Farcaster認証でネットワークエラーが発生しました。しばらく待ってから再試行してください。',
            );
          }
          if (
            tokenError.message.includes('400') ||
            tokenError.message.includes('Bad Request')
          ) {
            throw new Error(
              'Farcaster認証リクエストに問題があります。アプリを再読み込みして再試行してください。',
            );
          }
        }

        throw new Error(
          `Farcasterトークンの取得に失敗しました: ${tokenError instanceof Error ? tokenError.message : '不明なエラー'}`,
        );
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

      console.log('Farcaster認証完了: Firebase認証も成功しました');

      // 認証完了後に状態を明示的に更新 - 少し遅延を入れてFirebase認証の完了を待つ
      setTimeout(() => {
        setState((prev) => {
          const newState = {
            ...prev,
            isLoading: false,
            error: null,
          };
          console.log('🎯 Farcaster認証完了後の状態更新:', newState);
          return newState;
        });
      }, 100);
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
  }, [isMiniApp, isSDKLoaded, isReady]);

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
        autoLoginAttempted: false,
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
      console.log('🔥 Firebase認証状態変更:', { user: !!user, uid: user?.uid });
      setState((prev) => {
        const newState = {
          ...prev,
          isFirebaseAuthenticated: !!user,
          user,
        };

        // 両方の認証が完了している場合はローディングを終了
        if (prev.isFarcasterAuthenticated && !!user) {
          newState.isLoading = false;
          console.log('🎯 Firebase認証完了、ローディング終了');
        }

        console.log('🔥 Firebase認証後の状態:', newState);
        return newState;
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // SDKが準備完了した時点で自動認証を実行
  useEffect(() => {
    if (
      isSDKLoaded &&
      isReady &&
      isMiniApp &&
      !state.autoLoginAttempted &&
      !state.isFarcasterAuthenticated
    ) {
      console.log('Farcaster SDK準備完了、自動ログインを開始します');
      setState((prev) => ({ ...prev, autoLoginAttempted: true }));
      authenticateWithFarcaster();
    }
  }, [
    isSDKLoaded,
    isReady,
    isMiniApp,
    state.autoLoginAttempted,
    state.isFarcasterAuthenticated,
    authenticateWithFarcaster,
  ]);

  return {
    ...state,
    authenticateWithFarcaster,
    signOutFromFarcaster,
  };
}
