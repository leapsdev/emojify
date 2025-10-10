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
import { useCallback, useEffect, useRef, useState } from 'react';

interface FarcasterAuthState extends FarcasterInitializationResult {
  isFarcasterAuthenticated: boolean | undefined; // undefinedを許可
  isFirebaseAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  farcasterToken: string | null;
  farcasterUserId: string | null;
  farcasterUsername: string | null;
  farcasterDisplayName: string | null;
  farcasterPfpUrl: string | null;
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
    // 認証状態 - 初期値をundefinedに変更して認証状態を未確定にする
    isFarcasterAuthenticated: undefined, // false → undefined
    isFirebaseAuthenticated: false,
    isLoading: true,
    user: null,
    farcasterToken: null,
    farcasterUserId: null,
    farcasterUsername: null,
    farcasterDisplayName: null,
    farcasterPfpUrl: null,
    autoLoginAttempted: false,
  });

  // 最後に認証したウォレットアドレスを追跡
  const lastAuthenticatedWalletRef = useRef<string | null>(null);

  // SDK初期化処理
  const initializeSDK = useCallback(async () => {
    if (state.isSDKLoaded) {
      return;
    }

    try {
      const result = await initializeFarcasterMiniApp();
      setState((prev) => ({
        ...prev,
        isSDKLoaded: result.isSDKLoaded,
        isReady: result.isReady,
        context: result.context,
        isMiniApp: result.isMiniApp,
        error: result.error,
      }));
    } catch (error) {
      console.error('Farcaster SDK initialization error:', error);
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

      let token: string;
      try {
        // Farcaster Quick Authトークンを取得
        const result = await sdk.quickAuth.getToken();
        token = result.token;

        if (!token) {
          throw new Error('Farcasterトークンの取得に失敗しました');
        }

        // SDKからユーザー情報を取得してログ出力
        try {
          const context = await sdk.context;
          const userContext = context.user;

          // Farcasterユーザー情報を設定
          if (userContext?.fid) {
            setState((prev) => ({
              ...prev,
              farcasterUserId: userContext.fid.toString(),
              farcasterUsername: userContext.username || null,
              farcasterDisplayName: userContext.displayName || null,
              farcasterPfpUrl: userContext.pfpUrl || null,
            }));
          }
        } catch {}
      } catch (tokenError) {
        console.error('Farcaster SDK token retrieval error:', tokenError);

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

      // Farcaster SDKからウォレットアドレスを取得
      let walletAddress: string | null = null;

      try {
        const provider = await sdk.wallet.getEthereumProvider();
        if (provider) {
          const accounts = (await provider.request({
            method: 'eth_requestAccounts',
          })) as string[];
          walletAddress = accounts?.[0] || null;
        }
      } catch {
        try {
          const provider = await sdk.wallet.getEthereumProvider();
          if (provider) {
            const accounts = (await provider.request({
              method: 'eth_accounts',
            })) as string[];
            walletAddress = accounts?.[0] || null;
          }
        } catch (fallbackError) {
          console.error(
            'Wallet address retrieval completely failed:',
            fallbackError,
          );
        }
      }

      // サーバーサイドでFirebaseカスタムトークンを取得
      const response = await fetch('/api/auth/farcaster-firebase-token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          walletAddress: walletAddress,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Firebase token retrieval error:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
        });
        throw new Error(
          errorData.error || 'Firebaseトークンの取得に失敗しました',
        );
      }

      const { customToken } = await response.json();

      // Firebaseにカスタムトークンでサインイン
      await signInWithCustomToken(auth, customToken);

      // 認証成功時、ウォレットアドレスを記録
      lastAuthenticatedWalletRef.current = walletAddress;

      // 認証成功時はローディング状態を終了
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Farcaster authentication error:', error);
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
        isLoading:
          prev.isFarcasterAuthenticated === true ? false : prev.isLoading,
        user,
        // 認証が成功した後は状態を安定させる（リセットしない）
        ...(prev.isFarcasterAuthenticated === true && {
          isFarcasterAuthenticated: true,
        }),
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
      state.isFarcasterAuthenticated !== true
    ) {
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

  // ウォレットアドレス変更を検出して再認証
  useEffect(() => {
    const checkWalletChange = async () => {
      // SDK、認証状態、MiniApp環境をチェック
      if (
        !state.isSDKLoaded ||
        !state.isReady ||
        !state.isMiniApp ||
        state.isFarcasterAuthenticated !== true
      ) {
        return;
      }

      try {
        const sdk = getFarcasterSDK();
        if (!sdk) {
          return;
        }

        // 現在のウォレットアドレスを取得
        const provider = await sdk.wallet.getEthereumProvider();
        if (!provider) {
          return;
        }

        let currentAccounts: string[];
        try {
          currentAccounts = (await provider.request({
            method: 'eth_accounts',
          })) as string[];
        } catch {
          return;
        }

        const currentAddress = currentAccounts?.[0];

        // ウォレットアドレスが変更された場合、再認証
        if (
          currentAddress &&
          lastAuthenticatedWalletRef.current &&
          currentAddress !== lastAuthenticatedWalletRef.current
        ) {
          console.log('🔄 Wallet address changed, re-authenticating...', {
            old: lastAuthenticatedWalletRef.current,
            new: currentAddress,
          });

          // 再認証を実行
          await authenticateWithFarcaster();
        }
      } catch (error) {
        console.error('Failed to check wallet change:', error);
      }
    };

    // 定期的にウォレットアドレスをチェック（accountsChangedイベントのバックアップ）
    const intervalId = setInterval(checkWalletChange, 2000);

    return () => {
      clearInterval(intervalId);
    };
  }, [
    state.isSDKLoaded,
    state.isReady,
    state.isMiniApp,
    state.isFarcasterAuthenticated,
    authenticateWithFarcaster,
  ]);

  // 認証状態とFarcasterユーザー情報を返す
  return {
    isFarcasterAuthenticated: state.isFarcasterAuthenticated,
    isFirebaseAuthenticated: state.isFirebaseAuthenticated,
    isLoading: state.isLoading,
    farcasterUserId: state.farcasterUserId,
    farcasterUsername: state.farcasterUsername,
    farcasterDisplayName: state.farcasterDisplayName,
    farcasterPfpUrl: state.farcasterPfpUrl,
    user: state.user,
    error: state.error,
  };
}
