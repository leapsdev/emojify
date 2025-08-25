'use client';

import { clearAuthTokens, getAuthToken, setAuthToken } from '@/lib/cookies';
import type { Environment } from '@/lib/environment';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useFarcasterEnvironment } from './useFarcasterEnvironment';

/**
 * 統合認証状態
 */
export interface UnifiedAuthState {
  /** 認証済みかどうか（Privy + Cookie の両方をチェック） */
  isAuthenticated: boolean;
  /** Privy認証状態 */
  isPrivyAuthenticated: boolean;
  /** Cookieベース認証状態 */
  isCookieAuthenticated: boolean;
  /** 認証状態の同期が完了したかどうか */
  isSynchronized: boolean;
  /** ローディング状態 */
  isLoading: boolean;
  /** エラー状態 */
  error: string | null;
  /** Privyユーザー情報 */
  user: unknown | null;
  /** 現在の環境 */
  environment: Environment;
  /** 認証トークン */
  accessToken: string | null;
}

/**
 * 統合認証アクション
 */
export interface UnifiedAuthActions {
  /** ログイン */
  login: () => void;
  /** ログアウト */
  logout: () => void;
  /** 認証状態を同期 */
  synchronize: () => Promise<void>;
  /** トークンをリフレッシュ */
  refreshToken: () => Promise<string | null>;
}

/**
 * Privy認証状態とクッキー認証状態を統合するフック
 */
export function useUnifiedAuth(): UnifiedAuthState & UnifiedAuthActions {
  const {
    ready: privyReady,
    authenticated: isPrivyAuthenticated,
    user: privyUser,
    login: privyLogin,
    logout: privyLogout,
    getAccessToken,
  } = usePrivy();

  const { isFarcasterEnvironment, isDetectionComplete } =
    useFarcasterEnvironment();

  const [state, setState] = useState<Omit<UnifiedAuthState, 'isAuthenticated'>>(
    {
      isPrivyAuthenticated: false,
      isCookieAuthenticated: false,
      isSynchronized: false,
      isLoading: true,
      error: null,
      user: null,
      environment: 'normal',
      accessToken: null,
    },
  );

  const environment: Environment = isFarcasterEnvironment
    ? 'farcaster'
    : 'normal';

  // 認証状態の監視と同期
  useEffect(() => {
    if (!privyReady || !isDetectionComplete) {
      return;
    }

    const synchronizeAuth = async () => {
      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        // Cookieから認証トークンを取得
        const cookieToken = getAuthToken('PRIVY_TOKEN');

        // Privyからアクセストークンを取得（認証済みの場合のみ）
        let privyToken: string | null = null;
        if (isPrivyAuthenticated) {
          try {
            privyToken = await getAccessToken();
          } catch (error) {
            console.warn('Failed to get Privy access token:', error);
          }
        }

        // 認証状態の判定
        const isCookieAuthenticated = Boolean(cookieToken);
        const hasValidPrivyToken = Boolean(privyToken);

        // トークンの同期
        if (hasValidPrivyToken && privyToken && privyToken !== cookieToken) {
          // Privyトークンをクッキーに同期
          setAuthToken(privyToken, environment, 'PRIVY_TOKEN');
          console.log('Synchronized Privy token to cookie');
        }

        // 最終的な認証トークンを決定
        const finalToken = privyToken || cookieToken;

        setState((prev) => ({
          ...prev,
          isPrivyAuthenticated,
          isCookieAuthenticated,
          isSynchronized: true,
          isLoading: false,
          user: privyUser,
          environment,
          accessToken: finalToken,
        }));

        // デバッグ情報を出力
        if (process.env.NODE_ENV === 'development') {
          console.log('Auth synchronization completed:', {
            environment,
            isFarcasterEnvironment,
            isPrivyAuthenticated,
            isCookieAuthenticated,
            hasValidPrivyToken,
            cookieToken: cookieToken ? 'present' : 'missing',
            privyToken: privyToken ? 'present' : 'missing',
            finalToken: finalToken ? 'present' : 'missing',
          });
        }
      } catch (error) {
        console.error('Auth synchronization error:', error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error:
            error instanceof Error ? error.message : 'Authentication error',
          isSynchronized: true,
        }));
      }
    };

    synchronizeAuth();
  }, [
    privyReady,
    isPrivyAuthenticated,
    privyUser,
    getAccessToken,
    environment,
    isFarcasterEnvironment,
    isDetectionComplete,
  ]);

  // 統合認証状態の判定
  const isAuthenticated = Boolean(
    state.isSynchronized &&
      (state.isPrivyAuthenticated || state.isCookieAuthenticated) &&
      state.accessToken,
  );

  // ログイン処理
  const login = () => {
    privyLogin();
  };

  // ログアウト処理
  const logout = () => {
    try {
      // Cookieをクリア
      clearAuthTokens(environment);

      // Privyからログアウト
      privyLogout();

      // ローカル状態をリセット
      setState((prev) => ({
        ...prev,
        isPrivyAuthenticated: false,
        isCookieAuthenticated: false,
        isSynchronized: false,
        user: null,
        accessToken: null,
        error: null,
      }));

      console.log('Logout completed');
    } catch (error) {
      console.error('Logout error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Logout error',
      }));
    }
  };

  // 手動同期
  const synchronize = async () => {
    if (!privyReady) {
      throw new Error('Privy not ready');
    }

    setState((prev) => ({ ...prev, isLoading: true }));
    // useEffect内の同期ロジックを再実行させるためにダミー更新
    setState((prev) => ({ ...prev, isSynchronized: false }));
  };

  // トークンリフレッシュ
  const refreshToken = async (): Promise<string | null> => {
    try {
      if (!isPrivyAuthenticated) {
        throw new Error('Not authenticated with Privy');
      }

      const newToken = await getAccessToken();
      if (newToken) {
        setAuthToken(newToken, environment, 'PRIVY_TOKEN');
        setState((prev) => ({ ...prev, accessToken: newToken }));
        console.log('Token refreshed successfully');
      }

      return newToken;
    } catch (error) {
      console.error('Token refresh error:', error);
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Token refresh error',
      }));
      return null;
    }
  };

  return {
    // State
    isAuthenticated,
    isPrivyAuthenticated: state.isPrivyAuthenticated,
    isCookieAuthenticated: state.isCookieAuthenticated,
    isSynchronized: state.isSynchronized,
    isLoading: state.isLoading,
    error: state.error,
    user: state.user,
    environment,
    accessToken: state.accessToken,

    // Actions
    login,
    logout,
    synchronize,
    refreshToken,
  };
}

/**
 * 認証が必要なページで使用するヘルパーフック
 */
export function useAuthGuard(): {
  isLoading: boolean;
  isAuthenticated: boolean;
  redirectToAuth: () => void;
} {
  const { isAuthenticated, isLoading, login } = useUnifiedAuth();

  const redirectToAuth = () => {
    if (!isAuthenticated) {
      login();
    }
  };

  return {
    isLoading,
    isAuthenticated,
    redirectToAuth,
  };
}
