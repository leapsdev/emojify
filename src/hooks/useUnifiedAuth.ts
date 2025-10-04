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
  
  console.log('🔍 useUnifiedAuth hook started:', { isMiniApp });

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
  
  console.log('🔍 Farcaster auth state:', {
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
    isFarcasterLoading,
    farcasterError,
    farcasterFirebaseUser: !!farcasterFirebaseUser,
  });

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
    // Mini App環境: Farcaster認証の初期化が完了しているかチェック
    if (isMiniApp) {
      // ローディング中は待機
      if (isFarcasterLoading) {
        console.log('🔍 Auth not initialized: Farcaster still loading');
        return false;
      }
      // 認証状態が確定している（true/false）場合は初期化完了とみなす
      // ただし、認証が成功している場合は即座に初期化完了とする
      if (
        isFarcasterAuthenticated === true &&
        isFarcasterFirebaseAuthenticated
      ) {
        console.log('🔍 Auth initialized: Farcaster authenticated');
        return true;
      }
      const result = isFarcasterAuthenticated !== undefined;
      console.log('🔍 Auth initialization check:', {
        isFarcasterAuthenticated,
        result,
      });
      return result;
    }

    // Web環境: Privy認証の初期化完了を確認
    // ローディング中は待機
    if (isPrivyLoading) {
      console.log('🔍 Auth not initialized: Privy still loading');
      return false;
    }
    const result = isPrivyAuthenticated !== undefined;
    console.log('🔍 Privy auth initialization check:', {
      isPrivyAuthenticated,
      result,
    });
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
    console.log('🔍 useUnifiedAuth state calculation:', {
      isMiniApp,
      isFarcasterAuthenticated,
      isFarcasterFirebaseAuthenticated,
      isFarcasterLoading,
      isPrivyAuthenticated,
      isPrivyFirebaseAuthenticated,
      isPrivyLoading,
      unifiedWalletAddress,
      walletAddress,
      isAuthInitialized: isAuthInitialized(),
    });

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

      console.log('🔍 Mini App auth calculation:', {
        isFarcasterAuthenticated,
        isFarcasterFirebaseAuthenticated,
        result: isAuthenticated,
      });
    } else {
      // Web環境: Privy認証を使用
      isAuthenticated = isPrivyAuthenticated && isPrivyFirebaseAuthenticated;
      user = privyFirebaseUser;
      error = privyError;
    }

    // 認証が成功している場合は即座にローディングを終了
    const isLoading = isAuthenticated ? false : !isAuthInitialized();

    console.log('🔍 Final auth state:', {
      isAuthenticated,
      isLoading,
      walletAddress,
    });

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
    isFarcasterLoading,
    farcasterFirebaseUser,
    farcasterError,
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    isPrivyLoading,
    privyFirebaseUser,
    privyError,
    privyReady,
    walletsReady,
    unifiedWalletAddress,
  ]);

  return unifiedState;
}
