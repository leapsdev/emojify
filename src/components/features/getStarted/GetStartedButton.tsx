'use client';

import { useIsMiniApp } from '@/components/providers/AuthProvider';
import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';
import { usePrivyAuth } from '@/hooks/usePrivyAuth';
import { usePrivy } from '@privy-io/react-auth';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import { checkUserExists } from '../auth/action';

export const GetStartedButton = () => {
  const { isMiniApp } = useIsMiniApp();
  const { authenticated: isPrivyAuthenticated, user: privyUser } = usePrivy();
  const { isFirebaseAuthenticated: isPrivyFirebaseAuthenticated } =
    usePrivyAuth();
  const {
    isFarcasterAuthenticated,
    isFirebaseAuthenticated: isFarcasterFirebaseAuthenticated,
    farcasterUserId,
  } = useFarcasterAuth();
  const router = useRouter();

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

  const handleClick = useCallback(async () => {
    // Mini App以外の場合は/signupにリダイレクト
    if (!isMiniApp) {
      router.push('/signup');
      return;
    }

    // Mini App環境の場合
    const userId = getUserId();

    if (userId) {
      // 認証済みの場合、DBでユーザーの存在をチェック
      const exists = await checkUserExists(userId);
      if (exists) {
        router.push('/chat');
      } else {
        router.push('/profile/create');
      }
    } else {
      // 未認証の場合は認証ページへ
      router.push('/');
    }
  }, [isMiniApp, getUserId, router]);

  return (
    <div className="mt-auto">
      <button
        type="button"
        onClick={handleClick}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white rounded-full py-2.5 text-xl font-black flex justify-center items-center"
      >
        Get started
      </button>
    </div>
  );
};
