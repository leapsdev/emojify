'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import type { User } from 'firebase/auth';
import { useCallback, useMemo } from 'react';

interface UnifiedAuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  walletAddress: string | null;
  user: User | null; // Firebase User
  error: string | null;
  ready: boolean; // Privy環境でウォレットが準備完了しているか
}

/**
 * 統合認証フック
 * - miniapp環境: Farcaster認証を使用
 * - Web環境: Privy認証を使用
 * - 認証状態、ユーザーID、ローディング状態を統一的に提供
 */
export function useUnifiedAuth(): UnifiedAuthState {
  const { isMiniApp } = useIsMiniApp();

  // 統合ウォレット（環境に応じたウォレットアドレスを取得）
  const { address: unifiedWalletAddress } = useUnifiedWallet();

  // Privy認証関連
  const { authenticated: isPrivyAuthenticated, ready: privyReady } = usePrivy();
  const { ready: walletsReady } = useWallets();
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
    error: farcasterError,
    user: farcasterFirebaseUser,
  } = useFarcasterAuth();

  // 認証状態に基づいてウォレットアドレスを取得
  const getWalletAddress = useCallback((): string | null => {
    // 認証済みの場合、統合ウォレットからアドレスを取得
    // Mini App環境: Farcaster SDKから取得したウォレットアドレス
    // Web環境: Privyの埋め込みウォレットまたは接続済みウォレットアドレス
    if (isMiniApp) {
      if (
        isFarcasterAuthenticated === true &&
        isFarcasterFirebaseAuthenticated
      ) {
        return unifiedWalletAddress || null;
      }
    } else {
      if (isPrivyAuthenticated && isPrivyFirebaseAuthenticated) {
        return unifiedWalletAddress || null;
      }
    }

    return null;
  }, [
    isMiniApp,
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    unifiedWalletAddress,
  ]);

  // 認証状態の初期化が完了しているかチェック
  const isAuthInitialized = useCallback((): boolean => {
    // ローディング中は待機
    if (isPrivyLoading || (isMiniApp && isFarcasterLoading)) {
      return false;
    }

    // Mini App環境: Farcaster認証の初期化が完了しているかチェック
    if (isMiniApp) {
      // 認証状態が確定している（true/false）場合は初期化完了とみなす
      return isFarcasterAuthenticated !== undefined;
    }

    // Web環境: Privy認証の初期化完了を確認
    return isPrivyAuthenticated !== undefined;
  }, [
    isPrivyLoading,
    isFarcasterLoading,
    isMiniApp,
    isFarcasterAuthenticated,
    isPrivyAuthenticated,
  ]);

  // 統合認証状態を計算
  const unifiedState = useMemo((): UnifiedAuthState => {
    const walletAddress = getWalletAddress();
    const isLoading = !isAuthInitialized();

    // 認証状態の判定
    let isAuthenticated = false;
    let user: User | null = null;
    let error: string | null = null;

    if (isMiniApp) {
      // Mini App環境: Farcaster認証を使用
      // undefinedの場合はfalseとして扱う（認証未確定）
      isAuthenticated =
        isFarcasterAuthenticated === true && isFarcasterFirebaseAuthenticated;
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
      walletAddress,
      user,
      error,
      // Privy環境ではウォレットの準備状態も含める
      ready: isMiniApp ? true : privyReady && walletsReady,
    };
  }, [
    getWalletAddress,
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
    privyReady,
    walletsReady,
  ]);

  return unifiedState;
}
