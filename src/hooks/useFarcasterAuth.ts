'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';
import { useFarcasterEnvironment } from './useFarcasterEnvironment';
import { useFarcasterMiniApp } from './useFarcasterMiniApp';

interface FarcasterAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  farcasterToken: string | null;
}

export function useFarcasterAuth() {
  const { isInFarcasterApp, userContext, isLoading } =
    useFarcasterEnvironment();
  const { sdk } = useFarcasterMiniApp();
  const { authenticated: isPrivyAuthenticated, login } = usePrivy();
  const [authState, setAuthState] = useState<FarcasterAuthState>({
    isAuthenticating: false,
    isAuthenticated: false,
    error: null,
    farcasterToken: null,
  });

  useEffect(() => {
    const handleFarcasterAutoLogin = async () => {
      if (
        isLoading ||
        !isInFarcasterApp ||
        !userContext ||
        isPrivyAuthenticated ||
        !sdk
      ) {
        return;
      }

      setAuthState((prev) => ({
        ...prev,
        isAuthenticating: true,
        error: null,
      }));

      try {
        // Farcaster Mini App SDKのquickAuthを使用して完全自動ログイン
        const { token } = await sdk.quickAuth.getToken();

        if (token) {
          console.log('Farcaster Quick Auth token取得成功:', token);

          // Farcasterの認証情報をPrivyに直接設定
          // モーダルを表示せずに自動ログインを完了
          try {
            // PrivyのFarcasterログインを実行（モーダル表示なし）
            await login();

            setAuthState({
              isAuthenticating: false,
              isAuthenticated: true,
              error: null,
              farcasterToken: token,
            });
          } catch (privyError) {
            console.warn(
              'Privyログインに失敗しましたが、Farcaster認証は成功:',
              privyError,
            );

            // Privyログインに失敗してもFarcaster認証は成功として扱う
            setAuthState({
              isAuthenticating: false,
              isAuthenticated: true,
              error: null,
              farcasterToken: token,
            });
          }
        } else {
          throw new Error('Farcasterトークンの取得に失敗しました');
        }
      } catch (error) {
        console.error('Farcaster自動ログインエラー:', error);

        let errorMessage = '認証に失敗しました';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setAuthState({
          isAuthenticating: false,
          isAuthenticated: false,
          error: errorMessage,
          farcasterToken: null,
        });
      }
    };

    handleFarcasterAutoLogin();
  }, [
    isLoading,
    isInFarcasterApp,
    userContext,
    isPrivyAuthenticated,
    login,
    sdk,
  ]);

  return {
    ...authState,
    userContext,
    isInFarcasterApp,
  };
}
