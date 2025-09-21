'use client';

import {
  type FarcasterInitializationResult,
  getFarcasterSDK,
  initializeFarcasterMiniApp,
} from '@/lib/farcaster';
import { auth } from '@/repository/db/config/client';
import {
  type User,
  onAuthStateChanged,
  signInWithCustomToken,
} from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';

interface FarcasterAuthState extends FarcasterInitializationResult {
  isFarcasterAuthenticated: boolean;
  isFirebaseAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  farcasterToken: string | null;
  autoLoginAttempted: boolean;
}

/**
 * Farcaster SDK初期化 + Quick Auth + Firebase認証を管理するカスタムフック
 * Farcaster Mini App環境で使用される
 */
export function useFarcasterAuth() {
  const [state, setState] = useState<FarcasterAuthState>({
    // SDK初期化状態
    isSDKLoaded: false,
    isReady: false,
    context: null,
    isMiniApp: false,
    error: null,
    // 認証状態
    isFarcasterAuthenticated: false,
    isFirebaseAuthenticated: false,
    isLoading: true,
    user: null,
    farcasterToken: null,
    autoLoginAttempted: false,
  });

  // SDK初期化処理
  const initializeSDK = useCallback(async () => {
    if (state.isSDKLoaded) {
      return;
    }

    try {
      const result = await initializeFarcasterMiniApp();
      console.log('Farcaster SDK初期化結果:', result);
      
      // コンテキスト情報を詳細にログ出力
      if (result.context) {
        console.log('Farcasterコンテキスト詳細:', {
          keys: Object.keys(result.context),
          values: result.context
        });
      }
      
      setState((prev) => ({
        ...prev,
        isSDKLoaded: result.isSDKLoaded,
        isReady: result.isReady,
        context: result.context,
        isMiniApp: result.isMiniApp,
        error: result.error,
      }));
    } catch (error) {
      console.error('Farcaster SDK初期化エラー:', error);
      setState((prev) => ({
        ...prev,
        isSDKLoaded: true,
        isReady: false,
        isMiniApp: false,
        error: error instanceof Error ? error.message : 'SDK初期化エラー',
      }));
    }
  }, [state.isSDKLoaded]);

  const authenticateWithFarcaster = useCallback(async () => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      // Mini App環境でない場合はエラー
      if (!state.isMiniApp) {
        throw new Error('この機能はFarcaster Mini App環境でのみ利用可能です');
      }

      // SDKが準備完了していない場合はエラー
      if (!state.isSDKLoaded || !state.isReady) {
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
        
        // SDKからユーザー情報を取得してログ出力
        try {
          // Farcaster SDKでは、トークンからユーザー情報を取得する方法を確認
          console.log('Farcasterトークン詳細:', {
            token: `${token.substring(0, 20)}...`, // トークンの一部のみログ出力
            length: token.length
          });
        } catch (userError) {
          console.log('ユーザー情報の取得に失敗:', userError);
        }
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
      console.log('Firebaseカスタムトークンの取得を開始します');
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
      console.log('Firebaseカスタムトークンの取得が完了しました');

      // Firebaseにカスタムトークンでサインイン
      const firebaseUser = await signInWithCustomToken(auth, customToken);
      
      console.log('Farcaster認証完了: Firebase認証も成功しました');
      console.log('Firebaseユーザー情報:', {
        uid: firebaseUser.user.uid,
        email: firebaseUser.user.email,
        displayName: firebaseUser.user.displayName,
        photoURL: firebaseUser.user.photoURL,
      });

      // 認証成功時はローディング状態を終了
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
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
  }, [state.isMiniApp, state.isSDKLoaded, state.isReady]);

  // SDK初期化を実行
  useEffect(() => {
    initializeSDK();
  }, [initializeSDK]);

  useEffect(() => {
    // Firebase認証状態の監視
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setState((prev) => ({
        ...prev,
        isFirebaseAuthenticated: !!user,
        // Farcaster認証が成功している場合、Firebase認証が完了したらローディングを終了
        // ただし、既にisLoadingがfalseになっている場合は変更しない
        isLoading:
          prev.isFarcasterAuthenticated && prev.isLoading
            ? !user
            : prev.isLoading,
        user,
      }));
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // SDKが準備完了した時点で自動認証を実行
  useEffect(() => {
    if (
      state.isSDKLoaded &&
      state.isReady &&
      state.isMiniApp &&
      !state.autoLoginAttempted &&
      !state.isFarcasterAuthenticated
    ) {
      console.log('Farcaster SDK準備完了、自動ログインを開始します');
      setState((prev) => ({ ...prev, autoLoginAttempted: true }));
      authenticateWithFarcaster();
    }
  }, [
    state.isSDKLoaded,
    state.isReady,
    state.isMiniApp,
    state.autoLoginAttempted,
    state.isFarcasterAuthenticated,
    authenticateWithFarcaster,
  ]);

  // SDK初期化と自動ログインのみを実行するため、戻り値は不要
  return;
}
