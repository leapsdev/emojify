'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { usePrivy } from '@privy-io/react-auth';
import type { User } from 'firebase/auth';
import { useCallback, useMemo } from 'react';

interface UnifiedAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  userId: string | null;
  user: User | null; // Firebase User
  error: string | null;
}

/**
 * 統合認証フック
 * - miniapp環境: Farcaster認証を使用
 * - Web環境: Privy認証を使用
 * - 認証状態、ユーザーID、ローディング状態を統一的に提供
 */
export function useUnifiedAuth(): UnifiedAuthState {
  const { isMiniApp } = useIsMiniApp();

  // Privy認証関連
  const { authenticated: isPrivyAuthenticated, user: privyUser } = usePrivy();
  const {
    isFirebaseAuthenticated: isPrivyFirebaseAuthenticated,
    isLoading: isPrivyLoading,
    error: privyError,
    user: privyFirebaseUser,
  } = usePrivyAuth();

  // Farcaster認証関連
  const {
    isFarcasterAuthenticated,
    isFirebaseAuthenticated: isFarcasterFirebaseAuthenticated,
    isLoading: isFarcasterLoading,
    farcasterUserId,
    error: farcasterError,
    user: farcasterFirebaseUser,
  } = useFarcasterAuth();

  // 認証状態に基づいてユーザーIDを取得
  const getUserId = useCallback((): string | null => {
    // Mini App環境: Farcaster認証を使用
    if (
      isMiniApp &&
      isFarcasterAuthenticated === true &&
      isFarcasterFirebaseAuthenticated
    ) {
      return farcasterUserId || null;
    }

    // Web環境: Privy認証を使用
    if (!isMiniApp && isPrivyAuthenticated && isPrivyFirebaseAuthenticated) {
      return privyUser?.id || null;
    }

    return null;
  }, [
    isMiniApp,
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
    farcasterUserId,
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    privyUser?.id,
  ]);

  // 認証状態の初期化が完了しているかチェック
  const isAuthInitialized = useCallback((): boolean => {
    // ローディング中は待機
    if (isPrivyLoading || (isMiniApp && isFarcasterLoading)) {
      return false;
    }

    // Mini App環境ではFarcaster認証の初期化完了を待つ
    if (isMiniApp && isFarcasterAuthenticated === undefined) {
      return false;
    }

    // 少なくとも一つの認証プロバイダーが初期化完了していることを確認
    return (
      isPrivyAuthenticated !== undefined ||
      isFarcasterAuthenticated !== undefined
    );
  }, [
    isPrivyLoading,
    isFarcasterLoading,
    isMiniApp,
    isFarcasterAuthenticated,
    isPrivyAuthenticated,
  ]);

  // 統合認証状態を計算
  const unifiedState = useMemo((): UnifiedAuthState => {
    const userId = getUserId();
    const isLoading = !isAuthInitialized();

    // 認証状態の判定
    let isAuthenticated = false;
    let user: User | null = null;
    let error: string | null = null;

    if (isMiniApp) {
      // Mini App環境: Farcaster認証を使用
      // undefinedの場合はfalseとして扱う
      isAuthenticated =
        Boolean(isFarcasterAuthenticated) && isFarcasterFirebaseAuthenticated;
      user = farcasterFirebaseUser;
      error = farcasterError;
    } else {
      // Web環境: Privy認証を使用
      isAuthenticated = isPrivyAuthenticated && isPrivyFirebaseAuthenticated;
      user = privyFirebaseUser;
      error = privyError;
    }

    return {
      isAuthenticated,
      isLoading,
      userId,
      user,
      error,
    };
  }, [
    getUserId,
    isAuthInitialized,
    isMiniApp,
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
    farcasterFirebaseUser,
    farcasterError,
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    privyFirebaseUser,
    privyError,
  ]);

  return unifiedState;
}
