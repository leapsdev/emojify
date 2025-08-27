import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 現在のタイムスタンプを取得
 */
export function getCurrentTimestamp(): number {
  return Date.now();
}

/**
 * 日付を YYYY/MM/DD 形式にフォーマット
 */
export function formatDateToYYYYMMDD(timestamp: number): string {
  const date = new Date(timestamp);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}/${month}/${day}`;
}

/**
 * 日付を相対的な時間表示にフォーマット（例：今、5分前、昨日）
 */
export function formatRelativeTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);

  // 同じ年かどうかをチェック
  if (now.getFullYear() !== date.getFullYear()) {
    return formatDateToYYYYMMDD(timestamp);
  }

  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 1) {
    return 'just now';
  }
  if (diffMinutes < 60) {
    return diffMinutes === 1 ? '1 minute ago' : `${diffMinutes} minutes ago`;
  }
  if (diffHours < 24) {
    return diffHours === 1 ? '1 hour ago' : `${diffHours} hours ago`;
  }
  if (diffDays === 1) {
    return 'yesterday';
  }
  if (diffDays < 7) {
    return `${diffDays} days ago`;
  }

  return formatDateToYYYYMMDD(timestamp);
}

// Farcaster環境の型定義
interface FarcasterWindow extends Window {
  farcaster?: unknown;
  fc?: unknown;
  miniApp?: unknown;
}

/**
 * Farcaster Mini App環境かどうかを検出する
 * @returns Farcaster Mini App環境の場合はtrue
 */
export function isFarcasterMiniApp(): boolean {
  // クライアントサイドでのみ実行
  if (typeof window === 'undefined') {
    console.log('Farcaster detection: Server-side, returning false');
    return false;
  }

  // Farcaster Mini Appの特徴的な環境変数やプロパティをチェック
  // 1. window.location !== window.parent.location (iframe内)
  // 2. Farcaster特有のプロパティ
  // 3. User-Agentの確認
  
  try {
    console.log('=== Farcaster Environment Detection ===');
    
    // iframe内で動作しているかチェック
    const isInIframe = window.location !== window.parent.location;
    console.log('Is in iframe:', isInIframe);
    
    // Farcaster特有のプロパティをチェック
    const farcasterWindow = window as FarcasterWindow;
    const hasFarcasterProps = !!(
      farcasterWindow.farcaster ||
      farcasterWindow.fc ||
      farcasterWindow.miniApp
    );
    console.log('Has Farcaster properties:', hasFarcasterProps);
    console.log('Farcaster properties:', {
      farcaster: !!farcasterWindow.farcaster,
      fc: !!farcasterWindow.fc,
      miniApp: !!farcasterWindow.miniApp
    });

    // User-AgentでFarcasterを検出
    const userAgent = navigator.userAgent.toLowerCase();
    const isFarcasterUserAgent =
      userAgent.includes('farcaster') ||
      userAgent.includes('fc') ||
      userAgent.includes('mini-app');
    console.log('Is Farcaster User-Agent:', isFarcasterUserAgent);
    console.log('User-Agent:', userAgent);

    const result = isInIframe || hasFarcasterProps || isFarcasterUserAgent;
    console.log('Final Farcaster detection result:', result);
    
    return result;
  } catch (error) {
    // エラーが発生した場合は通常のブラウザ環境とみなす
    console.warn('Farcaster Mini App detection failed:', error);
    return false;
  }
}

/**
 * Farcaster環境でのPrivyトークンの有効性をチェックする
 * @returns トークンが有効な場合はtrue
 */
export function isPrivyTokenValid(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    const privyToken = localStorage.getItem('privy:token');
    if (!privyToken) {
      return false;
    }

    // JWTトークンの構造をチェック（基本的な検証）
    const parts = privyToken.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // ペイロード部分をデコードして有効期限をチェック
    try {
      const payload = JSON.parse(atob(parts[1]));
      const currentTime = Math.floor(Date.now() / 1000);

      if (payload.exp && payload.exp < currentTime) {
        console.log('Privy token has expired');
        return false;
      }

      return true;
    } catch (decodeError) {
      console.warn('Failed to decode Privy token payload:', decodeError);
      return false;
    }
  } catch (error) {
    console.error('Error checking Privy token validity:', error);
    return false;
  }
}

/**
 * 環境に応じたトークン保存方法を取得する
 * @returns トークン保存用のオブジェクト
 */
export function getTokenStorage() {
  const isMiniApp = isFarcasterMiniApp();

  if (isMiniApp) {
    // Farcaster Mini App環境ではlocalStorageを使用
    return {
      setToken: (token: string) => {
        try {
          localStorage.setItem('privy-token-custom', token);
          localStorage.setItem(
            'privy-token-expiry',
            (Date.now() + 3600000).toString(),
          );
        } catch (error) {
          console.error('Failed to save token to localStorage:', error);
        }
      },
      getToken: () => {
        try {
          console.log('=== Token Retrieval Debug ===');
          
          // まず、既存のPrivyトークンを確認
          const privyToken = localStorage.getItem('privy:token');
          console.log('Privy token found:', !!privyToken);
          
          if (privyToken && isPrivyTokenValid()) {
            console.log('Found valid Privy token in localStorage');
            return privyToken;
          }

          // カスタム保存されたトークンを確認
          const customToken = localStorage.getItem('privy-token-custom');
          const expiry = localStorage.getItem('privy-token-expiry');
          
          console.log('Custom token found:', !!customToken);
          console.log('Expiry found:', !!expiry);
          
          if (expiry) {
            const expiryTime = Number.parseInt(expiry, 10);
            const currentTime = Date.now();
            const isValid = currentTime < expiryTime;
            console.log('Token expiry check:', { currentTime, expiryTime, isValid });
          }

          if (
            customToken &&
            expiry &&
            Date.now() < Number.parseInt(expiry, 10)
          ) {
            console.log('Found custom saved token in localStorage');
            return customToken;
          }

          // 期限切れの場合は削除
          if (customToken) {
            localStorage.removeItem('privy-token-custom');
            localStorage.removeItem('privy-token-expiry');
            console.log('Removed expired custom token');
          }

          console.log('No valid token found');
          return null;
        } catch (error) {
          console.error('Failed to get token from localStorage:', error);
          return null;
        }
      },
      removeToken: () => {
        try {
          // カスタム保存されたトークンを削除
          localStorage.removeItem('privy-token-custom');
          localStorage.removeItem('privy-token-expiry');

          // Privyのトークンも削除（オプション）
          // localStorage.removeItem('privy:token');
        } catch (error) {
          console.error('Failed to remove token from localStorage:', error);
        }
      },
    };
  }

  // 通常のブラウザ環境ではクッキーを使用
  return {
    setToken: (token: string) => {
      try {
        document.cookie = `privy-token=${token}; path=/; max-age=3600; secure; samesite=strict`;
      } catch (error) {
        console.error('Failed to save token to cookie:', error);
      }
    },
    getToken: () => {
      try {
        const cookies = document.cookie.split(';');
        const tokenCookie = cookies.find((cookie) =>
          cookie.trim().startsWith('privy-token='),
        );
        return tokenCookie ? tokenCookie.split('=')[1] : null;
      } catch (error) {
        console.error('Failed to get token from cookie:', error);
        return null;
      }
    },
    removeToken: () => {
      try {
        document.cookie =
          'privy-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      } catch (error) {
        console.error('Failed to remove token from cookie:', error);
      }
    },
  };
}
