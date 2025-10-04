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
  const {
    address: unifiedWalletAddress,
    isConnected: walletConnected,
    isLoading: walletLoading,
    error: walletError,
  } = useUnifiedWallet();

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
      // Firebase認証が失敗していてもFarcaster認証が成功している場合はウォレットアドレスを返す
      if (isFarcasterAuthenticated === true) {
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
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    unifiedWalletAddress,
  ]);

  // 認証状態の初期化が完了しているかチェック
  const isAuthInitialized = useCallback((): boolean => {
    // Mini App環境: Farcaster認証の初期化が完了しているかチェック
    if (isMiniApp) {
      // ローディング中は待機
      if (isFarcasterLoading) {
        return false;
      }
      // 認証状態が確定している（true/false）場合は初期化完了とみなす
      // ただし、認証が成功している場合は即座に初期化完了とする
      if (
        isFarcasterAuthenticated === true &&
        isFarcasterFirebaseAuthenticated
      ) {
        return true;
      }
      const result = isFarcasterAuthenticated !== undefined;
      return result;
    }

    // Web環境: Privy認証の初期化完了を確認
    // ローディング中は待機
    if (isPrivyLoading) {
      return false;
    }
    const result = isPrivyAuthenticated !== undefined;
    return result;
  }, [
    isPrivyLoading,
    isFarcasterLoading,
    isMiniApp,
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
    isPrivyAuthenticated,
  ]);

  // 統合認証状態を計算
  const unifiedState = useMemo((): UnifiedAuthState => {
    const walletAddress = getWalletAddress();

    // 認証状態の詳細デバッグログ

    // 認証状態の判定
    let isAuthenticated = false;
    let user: User | null = null;
    let error: string | null = null;

    if (isMiniApp) {
      // Mini App環境: Farcaster認証を使用
      // Firebase認証が失敗していてもFarcaster認証が成功している場合は認証済みとして扱う
      isAuthenticated = isFarcasterAuthenticated === true;
      user = farcasterFirebaseUser;
      error = farcasterError;
    } else {
      // Web環境: Privy認証を使用
      isAuthenticated = isPrivyAuthenticated && isPrivyFirebaseAuthenticated;
      user = privyFirebaseUser;
      error = privyError;
    }

    // 認証が成功している場合は即座にローディングを終了
    const isLoading = isAuthenticated ? false : !isAuthInitialized();

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
