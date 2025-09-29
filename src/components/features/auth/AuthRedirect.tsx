'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { usePrivy } from '@privy-io/react-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect } from 'react';
import { checkUserExists } from './action';

type Props = {
  mode: 'auth' | 'profile';
};

export const AuthRedirect = ({ mode }: Props) => {
  const { authenticated: isPrivyAuthenticated, user: privyUser } = usePrivy();
  const {
    isFirebaseAuthenticated: isPrivyFirebaseAuthenticated,
    isLoading: isPrivyLoading,
  } = usePrivyAuth();
  const {
    isFarcasterAuthenticated,
    isFirebaseAuthenticated: isFarcasterFirebaseAuthenticated,
    isLoading: isFarcasterLoading,
    farcasterUserId,
  } = useFarcasterAuth();

  // 統合認証状態も取得
  const { isLoading: isUnifiedLoading } = useUnifiedAuth();
  const { isMiniApp } = useIsMiniApp();

  const router = useRouter();
  const pathname = usePathname();

  // 認証状態に基づいてユーザーIDを取得
  const getUserId = useCallback((): string => {
    // Mini App環境: Farcaster認証を使用
    if (
      isMiniApp &&
      isFarcasterAuthenticated &&
      isFarcasterFirebaseAuthenticated
    ) {
      return farcasterUserId || '';
    }

    // Web環境: Privy認証を使用
    if (!isMiniApp && isPrivyAuthenticated && isPrivyFirebaseAuthenticated) {
      return privyUser?.id || '';
    }

    return '';
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

  // プロフィール作成ページでのリダイレクト処理
  const handleProfileModeRedirect = useCallback(async () => {
    const userId = getUserId();
    if (!userId) return;

    const exists = await checkUserExists(userId);
    if (exists) {
      router.push('/chat');
    }
  }, [getUserId, router]);

  // 認証ページでのリダイレクト処理
  const handleAuthModeRedirect = useCallback(async () => {
    // 統合認証のローディング中は待機
    if (isUnifiedLoading) {
      return; // ローディング中はリダイレクトしない
    }

    // miniapp環境では認証処理が完了するまで待機
    if (isMiniApp && isFarcasterLoading) {
      return; // ローディング中はリダイレクトしない
    }

    // miniapp環境では認証状態が未確定の場合はリダイレクトしない
    if (isMiniApp && isFarcasterAuthenticated === undefined) {
      return;
    }

    const userId = getUserId();
    const isAuthenticated = !!userId;

    // 特定のページではリダイレクトしない
    if (pathname === '/' || pathname === '/profile/create') return;
    if (!isMiniApp && pathname === '/signup') return;
    if (pathname === '/choose-friends') return;

    // miniapp環境での認証状態の詳細チェック
    if (isMiniApp) {
      // Farcaster認証が完了しているかチェック
      if (isFarcasterAuthenticated === false) {
        // Farcaster認証が失敗した場合は認証ページへ
        router.push('/');
        return;
      }

      // Farcaster認証は成功しているが、Firebase認証が失敗している場合
      if (
        isFarcasterAuthenticated === true &&
        !isFarcasterFirebaseAuthenticated
      ) {
        // Firebase認証の再試行を待つ（ローディング状態を継続）
        return;
      }
    }

    if (isAuthenticated && userId) {
      const exists = await checkUserExists(userId);
      if (!exists) {
        // ユーザーが存在しない場合はプロフィール作成ページへ
        router.push('/profile/create');
      }
    } else {
      // 未認証の場合は認証ページへ
      router.push('/');
    }
  }, [
    getUserId,
    pathname,
    isMiniApp,
    router,
    isUnifiedLoading,
    isFarcasterLoading,
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
  ]);

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // 認証状態の初期化が完了するまで待機
      if (!isAuthInitialized()) {
        return;
      }

      // モードに応じてリダイレクト処理を実行
      if (mode === 'profile') {
        await handleProfileModeRedirect();
      } else if (mode === 'auth') {
        await handleAuthModeRedirect();
      }
    };

    handleAuthRedirect();
  }, [
    isAuthInitialized,
    mode,
    handleProfileModeRedirect,
    handleAuthModeRedirect,
  ]);

  return null;
};
