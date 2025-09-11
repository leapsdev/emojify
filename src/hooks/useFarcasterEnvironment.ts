'use client';

import { useEffect, useState } from 'react';
import { useFarcasterMiniApp } from './useFarcasterMiniApp';

interface FarcasterEnvironment {
  isInFarcasterApp: boolean;
  userContext: {
    fid: number;
    username?: string;
    displayName?: string;
    pfpUrl?: string;
  } | null;
  isLoading: boolean;
}

export function useFarcasterEnvironment(): FarcasterEnvironment {
  const { isReady, context, sdk } = useFarcasterMiniApp();
  const [environment, setEnvironment] = useState<FarcasterEnvironment>({
    isInFarcasterApp: false,
    userContext: null,
    isLoading: true,
  });

  useEffect(() => {
    const checkFarcasterEnvironment = async () => {
      if (!isReady || !sdk) {
        setEnvironment((prev) => ({ ...prev, isLoading: false }));
        return;
      }

      try {
        // Farcaster Mini App内かどうかを検出
        const isInFarcasterApp =
          typeof window !== 'undefined' &&
          (window.parent !== window ||
            navigator.userAgent.includes('Farcaster') ||
            document.referrer.includes('farcaster'));

        if (isInFarcasterApp && context) {
          const userContext = (
            context as {
              user?: {
                fid: number;
                username?: string;
                displayName?: string;
                pfpUrl?: string;
              };
            }
          )?.user;
          setEnvironment({
            isInFarcasterApp: true,
            userContext: userContext || null,
            isLoading: false,
          });
        } else {
          setEnvironment({
            isInFarcasterApp: false,
            userContext: null,
            isLoading: false,
          });
        }
      } catch (error) {
        console.error('Farcaster環境検出エラー:', error);
        setEnvironment({
          isInFarcasterApp: false,
          userContext: null,
          isLoading: false,
        });
      }
    };

    checkFarcasterEnvironment();
  }, [isReady, context, sdk]);

  return environment;
}
