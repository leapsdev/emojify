'use client';

import {
  type FarcasterInitializationResult,
  getFarcasterSDK,
  initializeFarcasterMiniApp,
} from '@/lib/farcaster';
import { normalizeWalletAddress } from '@/lib/wallet-utils';
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

  // 最後に認証したウォレットアドレスを追跡（無限ループ防止）
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
        throw new Error(
          'This feature is only available in Farcaster Mini App environment',
        );
      }

      // SDKが準備完了していない場合はエラー
      if (!state.isSDKLoaded || !state.isReady) {
        throw new Error('Farcaster SDK is not ready');
      }

      const sdk = getFarcasterSDK();
      if (!sdk) {
        throw new Error('Farcaster SDK is not initialized');
      }

      // FIDを事前に取得してBase app環境を検出
      let fid: number | undefined;
      try {
        const context = await sdk.context;
        const userContext = context.user;
        fid = userContext?.fid;

        console.log('Farcaster context:', {
          hasFid: !!fid,
          fid,
          username: userContext?.username,
        });
      } catch (contextError) {
        console.error('Failed to get Farcaster context:', contextError);
      }

      // FID: -1（ダミーアカウント）の場合の特別処理
      if (fid === -1) {
        console.log(
          '🔍 Detected dummy Farcaster account (FID: -1). Using wallet-based authentication.',
        );

        // ウォレットアドレスを取得
        let walletAddress: string | null = null;
        try {
          const provider = await sdk.wallet.getEthereumProvider();
          if (provider) {
            const accounts = (await provider.request({
              method: 'eth_accounts',
            })) as string[];
            walletAddress = accounts?.[0] || null;
          }
        } catch (walletError) {
          console.error('Failed to get wallet address:', walletError);
        }

        if (!walletAddress) {
          throw new Error(
            'Wallet address is required for authentication in Base app environment.',
          );
        }

        // Farcasterユーザー情報を設定（ダミー値）
        setState((prev) => ({
          ...prev,
          farcasterUserId: '-1',
          farcasterUsername: `BaseUser-${walletAddress}`,
          farcasterDisplayName: 'Base User',
          farcasterPfpUrl: null,
        }));

        // ダミーアカウント用のFirebase認証
        const response = await fetch('/api/auth/farcaster-firebase-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            walletAddress,
            isDummyAccount: true,
            fid: -1,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || 'Failed to authenticate with wallet',
          );
        }

        const { customToken } = await response.json();

        // Firebaseにカスタムトークンでサインイン
        await signInWithCustomToken(auth, customToken);

        // 認証成功
        setState((prev) => ({
          ...prev,
          isFarcasterAuthenticated: true,
          farcasterToken: null, // ダミーアカウントはトークンなし
          isLoading: false,
        }));

        return; // ダミーアカウントの処理を終了
      }

      // FIDが無効な値の場合はエラー
      if (!fid || fid < 0) {
        throw new Error(
          `Invalid Farcaster user information (FID: ${fid ?? 'undefined'}). Please use the web version at ${window.location.origin} with Privy authentication.`,
        );
      }

      let token: string;
      try {
        // Farcaster Quick Authトークンを取得
        const result = await sdk.quickAuth.getToken();
        token = result.token;

        if (!token) {
          throw new Error('Failed to get Farcaster token');
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
              'Network error occurred during Farcaster authentication. Please wait and try again.',
            );
          }
          if (
            tokenError.message.includes('400') ||
            tokenError.message.includes('Bad Request')
          ) {
            throw new Error(
              'There is an issue with the Farcaster authentication request. Please reload the app and try again.',
            );
          }
        }

        throw new Error(
          `Failed to get Farcaster token: ${tokenError instanceof Error ? tokenError.message : 'Unknown error'}`,
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
        throw new Error(errorData.error || 'Failed to get Firebase token');
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
          error instanceof Error
            ? error.message
            : 'Authentication error occurred',
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
  // biome-ignore lint/correctness/useExhaustiveDependencies: authenticateWithFarcasterを含めると無限ループが発生するため除外
  useEffect(() => {
    // 認証済み状態でのみチェック
    if (
      !state.isSDKLoaded ||
      !state.isReady ||
      !state.isMiniApp ||
      state.isFarcasterAuthenticated !== true
    ) {
      return;
    }

    const checkWalletChange = async () => {
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

        // ウォレットアドレスが変更された場合のみ再認証
        if (
          currentAddress &&
          lastAuthenticatedWalletRef.current &&
          normalizeWalletAddress(currentAddress) !==
            normalizeWalletAddress(lastAuthenticatedWalletRef.current)
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

    // 3秒ごとにウォレットアドレスをチェック
    const intervalId = setInterval(checkWalletChange, 3000);

    return () => {
      clearInterval(intervalId);
    };
    // authenticateWithFarcasterを依存配列から除外して無限ループを防ぐ
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    state.isSDKLoaded,
    state.isReady,
    state.isMiniApp,
    state.isFarcasterAuthenticated,
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
