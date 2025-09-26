'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
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
  const { isMiniApp } = useIsMiniApp();

  const router = useRouter();
  const pathname = usePathname();

  // 認証状態に基づいてユーザーIDを取得するヘルパー関数
  const getUserId = useCallback((): string => {
    console.log('getUserId: 認証状態チェック', {
      isMiniApp,
      isFarcasterAuthenticated,
      isFarcasterFirebaseAuthenticated,
      farcasterUserId,
      isPrivyAuthenticated,
      isPrivyFirebaseAuthenticated,
      privyUserId: privyUser?.id,
    });

    // Mini App環境の場合、Farcaster認証を使用
    if (
      isMiniApp &&
      isFarcasterAuthenticated &&
      isFarcasterFirebaseAuthenticated
    ) {
      console.log('getUserId: Farcaster認証を使用', { farcasterUserId });
      return farcasterUserId || '';
    }
    // Web環境の場合、Privy認証を使用
    if (!isMiniApp && isPrivyAuthenticated && isPrivyFirebaseAuthenticated) {
      console.log('getUserId: Privy認証を使用', { privyUserId: privyUser?.id });
      return privyUser?.id || '';
    }

    console.log('getUserId: 認証されていない');
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

  useEffect(() => {
    const handleAuthRedirect = async () => {
      // 認証状態の初期化が完了するまで待機
      // Mini App環境でない場合は、Farcasterのローディング状態を無視
      const shouldWaitForLoading =
        isPrivyLoading || (isMiniApp && isFarcasterLoading);
      if (shouldWaitForLoading) {
        console.log('AuthRedirect: 認証状態の初期化待機中...', {
          isPrivyLoading,
          isFarcasterLoading,
          isMiniApp,
          shouldWaitForLoading,
        });
        return;
      }

      // Mini App環境では、Farcaster認証の初期化が完了するまで追加で待機
      if (isMiniApp && isFarcasterAuthenticated === undefined) {
        console.log(
          'AuthRedirect: Mini App環境でFarcaster認証の初期化待機中...',
        );
        return;
      }

      console.log('AuthRedirect: 認証状態チェック', {
        mode,
        pathname,
        isMiniApp,
        isPrivyAuthenticated,
        isPrivyFirebaseAuthenticated,
        isFarcasterAuthenticated,
        isFarcasterFirebaseAuthenticated,
        privyUserId: privyUser?.id,
        farcasterUserId,
      });

      // 認証状態がまだ初期化されていない場合は待機
      // 少なくとも一つの認証プロバイダーが初期化完了していることを確認
      const hasAnyAuthProvider =
        isPrivyAuthenticated !== undefined ||
        isFarcasterAuthenticated !== undefined;
      if (!hasAnyAuthProvider) {
        console.log('AuthRedirect: 認証プロバイダーの初期化待機中...');
        return;
      }

      // プロフィール作成ページの場合
      if (mode === 'profile') {
        const userId = getUserId();

        if (userId) {
          const exists = await checkUserExists(userId);
          if (exists) {
            router.push('/chat');
          }
        }
        return;
      }

      // 認証関連のページの場合
      if (mode === 'auth') {
        const userId = getUserId();
        const isAuthenticated = !!userId;

        // ルートパス（/）の場合は何もしない
        if (pathname === '/') {
          return;
        }

        // その他の認証関連ページ
        if (pathname === '/profile/create') return;

        // Mini Appでない環境で/signupページの場合はリダイレクトしない
        if (!isMiniApp && pathname === '/signup') return;

        // 認証されている場合
        if (isAuthenticated && userId) {
          console.log('AuthRedirect: 認証済み、DBチェック開始', { userId });
          const exists = await checkUserExists(userId);
          console.log('AuthRedirect: DBチェック結果', { userId, exists });
          if (!exists) {
            // DBにユーザーが存在しない場合はprofile/createに転送
            console.log(
              'AuthRedirect: ユーザーが存在しないためprofile/createに転送',
            );
            router.push('/profile/create');
          } else {
            // DBにユーザーが存在する場合
            console.log(
              'AuthRedirect: ユーザーが存在するため、適切なページにリダイレクト',
            );
            // Mini App環境で認証済みユーザーが存在する場合は/chatにリダイレクト
            // ただし、既に/chatにいる場合はリダイレクトしない
            if (isMiniApp && pathname !== '/chat') {
              router.push('/chat');
            }
            // Web環境の場合は現在のページに留まる（既に適切なページにいる可能性が高い）
          }
        } else {
          // 認証されていない場合は認証ページに転送
          console.log('AuthRedirect: 未認証のため認証ページに転送');
          router.push('/');
        }
      }
    };

    handleAuthRedirect();
  }, [
    getUserId,
    isPrivyLoading,
    isFarcasterLoading,
    router,
    pathname,
    mode,
    isMiniApp,
    isFarcasterAuthenticated,
    isFarcasterFirebaseAuthenticated,
    farcasterUserId,
    isPrivyAuthenticated,
    isPrivyFirebaseAuthenticated,
    privyUser?.id,
  ]);

  return null;
};
