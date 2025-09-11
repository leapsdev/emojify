'use client';

import { useFarcasterEnvironment } from './useFarcasterEnvironment';
import { useFarcasterMiniApp } from './useFarcasterMiniApp';
import { useEffect, useState } from 'react';

interface FarcasterDirectAuthState {
  isAuthenticating: boolean;
  isAuthenticated: boolean;
  error: string | null;
  farcasterToken: string | null;
  userContext: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
}

export function useFarcasterDirectAuth() {
  const { isInFarcasterApp, userContext, isLoading } = useFarcasterEnvironment();
  const { sdk } = useFarcasterMiniApp();
  const [authState, setAuthState] = useState<FarcasterDirectAuthState>({
    isAuthenticating: false,
    isAuthenticated: false,
    error: null,
    farcasterToken: null,
    userContext: null,
  });

  useEffect(() => {
    const handleDirectAuth = async () => {
      if (isLoading || !isInFarcasterApp || !userContext || !sdk) {
        return;
      }

      setAuthState(prev => ({ ...prev, isAuthenticating: true, error: null }));

      try {
        // Farcaster Mini App SDKのquickAuthを使用してトークンを取得
        const { token } = await sdk.quickAuth.getToken();

        if (token) {
          console.log('Farcaster Direct Auth成功:', {
            token: `${token.substring(0, 20)}...`,
            user: userContext,
          });

          setAuthState({
            isAuthenticating: false,
            isAuthenticated: true,
            error: null,
            farcasterToken: token,
            userContext: userContext,
          });
        } else {
          throw new Error('Farcasterトークンの取得に失敗しました');
        }
      } catch (error) {
        console.error('Farcaster Direct Authエラー:', error);
        
        let errorMessage = '認証に失敗しました';
        if (error instanceof Error) {
          errorMessage = error.message;
        }

        setAuthState({
          isAuthenticating: false,
          isAuthenticated: false,
          error: errorMessage,
          farcasterToken: null,
          userContext: null,
        });
      }
    };

    handleDirectAuth();
  }, [isLoading, isInFarcasterApp, userContext, sdk]);

  return {
    ...authState,
    isInFarcasterApp,
  };
}
