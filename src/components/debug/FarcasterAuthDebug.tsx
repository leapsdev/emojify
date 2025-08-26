'use client';

import { useFarcasterMiniApp } from '@/hooks/useFarcasterMiniApp';
import { isFarcasterMiniAppEnvironment } from '@/lib/farcaster-utils';
import { usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

interface DebugInfo {
  isFarcasterEnvironment: boolean;
  isPrivyAuthenticated: boolean;
  privyUserId: string | null;
  isSDKLoaded: boolean;
  isReady: boolean;
  context: unknown;
  cookies: Record<string, string>;
  userAgent: string;
  timestamp: string;
}

/**
 * Farcaster認証のデバッグ情報を表示するコンポーネント
 * 開発環境でのみ表示される
 */
export function FarcasterAuthDebug() {
  const { authenticated, user, getAccessToken } = usePrivy();
  const { isSDKLoaded, isReady, context } = useFarcasterMiniApp();
  const [debugInfo, setDebugInfo] = useState<DebugInfo | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    // 開発環境でのみ実行
    if (process.env.NODE_ENV !== 'development') {
      return;
    }

    const updateDebugInfo = async () => {
      // クッキー情報を取得
      const cookies: Record<string, string> = {};
      if (typeof document !== 'undefined') {
        document.cookie.split(';').forEach((cookie) => {
          const [key, value] = cookie.trim().split('=');
          if (key && value) {
            cookies[key] = value;
          }
        });
      }

      try {
        const token = await getAccessToken();
        setAccessToken(token ? 'Present' : null);
      } catch {
        setAccessToken('Error');
      }

      const info: DebugInfo = {
        isFarcasterEnvironment: isFarcasterMiniAppEnvironment(),
        isPrivyAuthenticated: authenticated,
        privyUserId: user?.id || null,
        isSDKLoaded,
        isReady,
        context,
        cookies,
        userAgent:
          typeof navigator !== 'undefined' ? navigator.userAgent : 'N/A',
        timestamp: new Date().toISOString(),
      };

      setDebugInfo(info);
    };

    updateDebugInfo();

    // 5秒ごとに更新
    const interval = setInterval(updateDebugInfo, 5000);

    return () => clearInterval(interval);
  }, [authenticated, user, isSDKLoaded, isReady, context, getAccessToken]);

  // 開発環境でのみ表示
  if (process.env.NODE_ENV !== 'development' || !debugInfo) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-black bg-opacity-90 text-white p-4 rounded-lg max-w-md text-xs font-mono z-50">
      <div className="mb-2 font-bold">🔍 Farcaster Auth Debug</div>
      <div className="space-y-1">
        <div>
          <span className="text-yellow-400">Farcaster Env:</span>{' '}
          <span
            className={
              debugInfo.isFarcasterEnvironment
                ? 'text-green-400'
                : 'text-red-400'
            }
          >
            {debugInfo.isFarcasterEnvironment ? 'YES' : 'NO'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">Privy Auth:</span>{' '}
          <span
            className={
              debugInfo.isPrivyAuthenticated ? 'text-green-400' : 'text-red-400'
            }
          >
            {debugInfo.isPrivyAuthenticated ? 'YES' : 'NO'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">User ID:</span>{' '}
          <span className="text-blue-400">
            {debugInfo.privyUserId
              ? `${debugInfo.privyUserId.substring(0, 8)}...`
              : 'None'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">SDK Loaded:</span>{' '}
          <span
            className={
              debugInfo.isSDKLoaded ? 'text-green-400' : 'text-red-400'
            }
          >
            {debugInfo.isSDKLoaded ? 'YES' : 'NO'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">SDK Ready:</span>{' '}
          <span
            className={debugInfo.isReady ? 'text-green-400' : 'text-red-400'}
          >
            {debugInfo.isReady ? 'YES' : 'NO'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">Access Token:</span>{' '}
          <span
            className={
              accessToken === 'Present' ? 'text-green-400' : 'text-red-400'
            }
          >
            {accessToken || 'None'}
          </span>
        </div>
        <div>
          <span className="text-yellow-400">Cookies:</span>
        </div>
        <div className="ml-2">
          {Object.entries(debugInfo.cookies)
            .filter(([key]) => key.includes('privy'))
            .map(([key, value]) => (
              <div key={key}>
                <span className="text-purple-400">{key}:</span>{' '}
                <span className="text-gray-400">
                  {value.length > 10 ? `${value.substring(0, 10)}...` : value}
                </span>
              </div>
            ))}
        </div>
        <div className="text-gray-500 text-xs mt-2">
          {debugInfo.timestamp.split('T')[1].split('.')[0]}
        </div>
      </div>
    </div>
  );
}
