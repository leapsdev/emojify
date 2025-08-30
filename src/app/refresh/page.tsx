'use client';

import { usePrivy } from '@privy-io/react-auth';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect } from 'react';

// Farcaster miniapp環境用のwindow拡張の型定義
interface FarcasterWindow extends Window {
  farcasterMiniApp?: boolean;
  privyToken?: string;
}

/**
 * Farcasterのminiapp環境かどうかを判定する
 * @returns miniapp環境の場合true
 */
function isFarcasterMiniApp(): boolean {
  try {
    // User-Agentからminiapp環境を検出
    const userAgent = navigator.userAgent || '';
    const referer = document.referrer || '';

    // Farcaster関連のUser-AgentやRefererをチェック
    return (
      userAgent.includes('Farcaster') ||
      userAgent.includes('miniapp') ||
      referer.includes('farcaster.xyz') ||
      referer.includes('warpcast.com') ||
      // カスタムプロパティでminiapp環境を検出
      (window as FarcasterWindow).farcasterMiniApp === true ||
      // URLパラメータでminiapp環境を検出
      new URLSearchParams(window.location.search).get('miniapp') === 'true'
    );
  } catch (error) {
    console.warn('MiniApp detection failed:', error);
    return false;
  }
}

/**
 * miniapp環境に適したCookie設定を取得する
 * @returns Cookie設定文字列
 */
function getCookieSettings(token: string): string {
  const isMiniApp = isFarcasterMiniApp();

  if (isMiniApp) {
    // miniapp環境ではSameSite=laxを使用（クロスサイトリクエストを許可）
    return `privy-token=${token}; path=/; max-age=3600; secure; samesite=lax`;
  }

  // 通常環境ではSameSite=strictを使用
  return `privy-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
}

export default function RefreshPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getAccessToken } = usePrivy();

  useEffect(() => {
    const handleRefresh = async () => {
      try {
        const token = await getAccessToken();
        const redirectUrl = searchParams.get('redirect_uri') || '/';

        if (token) {
          // miniapp環境に適したCookie設定でトークンを設定
          const cookieSettings = getCookieSettings(token);
          document.cookie = cookieSettings;

          // miniapp環境の場合はlocalStorageとsessionStorageにもトークンを保存
          if (isFarcasterMiniApp()) {
            try {
              localStorage.setItem('privy-token', token);
              sessionStorage.setItem('privy-token', token);
              (window as FarcasterWindow).privyToken = token;
              (window as FarcasterWindow).farcasterMiniApp = true;
            } catch (error) {
              console.warn('Failed to save token to storage:', error);
            }
          }

          console.log('Token set with settings:', cookieSettings);
          console.log('Is MiniApp environment:', isFarcasterMiniApp());

          router.push(redirectUrl);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Token refresh error:', error);
        router.push('/');
      }
    };

    handleRefresh();
  }, [getAccessToken, searchParams, router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {/* biome-ignore lint/style/useSelfClosingElements: <explanation> */}
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
        <p>認証中...</p>
      </div>
    </div>
  );
}
