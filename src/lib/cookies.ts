/**
 * 環境に応じたクッキー設定ユーティリティ
 */

import {
  type Environment,
  detectEnvironmentClient,
  getEnvironmentConfig,
} from './environment';

/**
 * クッキー設定オプション
 */
export interface CookieOptions {
  secure?: boolean;
  httpOnly?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
  maxAge?: number;
  expires?: Date;
  path?: string;
  domain?: string;
}

/**
 * 環境に応じたクッキー設定を取得
 */
export function getEnvironmentCookieOptions(
  environment?: Environment,
  customOptions: Partial<CookieOptions> = {},
): CookieOptions {
  // 環境が指定されていない場合は自動検出
  const env = environment || detectEnvironmentClient().environment;
  const config = getEnvironmentConfig(env);

  const defaultOptions: CookieOptions = {
    secure: config.cookieSettings.secure,
    httpOnly: config.cookieSettings.httpOnly,
    sameSite: config.cookieSettings.sameSite,
    path: '/',
    maxAge: 60 * 60 * 24 * 7, // 7日間
  };

  return {
    ...defaultOptions,
    ...customOptions,
  };
}

/**
 * クッキー設定オプションを文字列に変換
 */
export function cookieOptionsToString(options: CookieOptions): string {
  const parts: string[] = [];

  if (options.secure) parts.push('Secure');
  if (options.httpOnly) parts.push('HttpOnly');
  if (options.sameSite) parts.push(`SameSite=${options.sameSite}`);
  if (options.maxAge) parts.push(`Max-Age=${options.maxAge}`);
  if (options.expires) parts.push(`Expires=${options.expires.toUTCString()}`);
  if (options.path) parts.push(`Path=${options.path}`);
  if (options.domain) parts.push(`Domain=${options.domain}`);

  return parts.join('; ');
}

/**
 * 環境に応じてクッキーを設定（クライアントサイド）
 */
export function setEnvironmentCookie(
  name: string,
  value: string,
  environment?: Environment,
  customOptions?: Partial<CookieOptions>,
): void {
  if (typeof document === 'undefined') {
    console.warn('setEnvironmentCookie called on server side');
    return;
  }

  const options = getEnvironmentCookieOptions(environment, customOptions);
  const cookieString = `${name}=${encodeURIComponent(value)}; ${cookieOptionsToString(options)}`;

  document.cookie = cookieString;

  // デバッグ情報を出力
  if (process.env.NODE_ENV === 'development') {
    console.log('Setting cookie:', {
      name,
      value: `${value.substring(0, 20)}...`, // セキュリティのため値は一部のみ表示
      environment: environment || detectEnvironmentClient().environment,
      options,
      cookieString,
    });
  }
}

/**
 * クッキーを取得（クライアントサイド）
 */
export function getCookie(name: string): string | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const nameEQ = `${name}=`;
  const cookies = document.cookie.split(';');

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * クッキーを削除（クライアントサイド）
 */
export function deleteCookie(
  name: string,
  environment?: Environment,
  customOptions?: Partial<CookieOptions>,
): void {
  if (typeof document === 'undefined') {
    return;
  }

  const options = getEnvironmentCookieOptions(environment, {
    ...customOptions,
    maxAge: 0,
    expires: new Date(0),
  });

  const cookieString = `${name}=; ${cookieOptionsToString(options)}`;
  document.cookie = cookieString;
}

/**
 * サーバーサイド用のクッキー設定関数
 */
export function createServerCookieHeader(
  name: string,
  value: string,
  environment: Environment,
  customOptions?: Partial<CookieOptions>,
): string {
  const options = getEnvironmentCookieOptions(environment, customOptions);
  return `${name}=${encodeURIComponent(value)}; ${cookieOptionsToString(options)}`;
}

/**
 * Next.js Response用のクッキー設定
 */
export function setResponseCookie(
  response: Response,
  name: string,
  value: string,
  environment: Environment,
  customOptions?: Partial<CookieOptions>,
): void {
  const cookieHeader = createServerCookieHeader(
    name,
    value,
    environment,
    customOptions,
  );
  response.headers.append('Set-Cookie', cookieHeader);
}

/**
 * 認証関連のクッキー名定数
 */
export const AUTH_COOKIES = {
  ACCESS_TOKEN: 'auth-token',
  REFRESH_TOKEN: 'refresh-token',
  USER_ID: 'user-id',
  SESSION_ID: 'session-id',
  PRIVY_TOKEN: 'privy-token',
  FIREBASE_TOKEN: 'firebase-token',
} as const;

/**
 * 認証トークンを環境に応じて設定
 */
export function setAuthToken(
  token: string,
  environment?: Environment,
  tokenType: keyof typeof AUTH_COOKIES = 'ACCESS_TOKEN',
): void {
  const cookieName = AUTH_COOKIES[tokenType];
  setEnvironmentCookie(cookieName, token, environment, {
    // 認証トークンは重要なので、より短い有効期限を設定
    maxAge: 60 * 60 * 24, // 1日
  });
}

/**
 * 認証トークンを取得
 */
export function getAuthToken(
  tokenType: keyof typeof AUTH_COOKIES = 'ACCESS_TOKEN',
): string | null {
  const cookieName = AUTH_COOKIES[tokenType];
  return getCookie(cookieName);
}

/**
 * 全ての認証トークンを削除
 */
export function clearAuthTokens(environment?: Environment): void {
  Object.values(AUTH_COOKIES).forEach((cookieName) => {
    deleteCookie(cookieName, environment);
  });
}

/**
 * クッキーの健全性チェック
 */
export function validateCookieEnvironment(): {
  isValid: boolean;
  environment: Environment;
  issues: string[];
} {
  const issues: string[] = [];
  const environment = detectEnvironmentClient().environment;

  // クライアントサイドでのみ実行
  if (typeof document === 'undefined') {
    return {
      isValid: false,
      environment: 'normal',
      issues: ['Server-side execution'],
    };
  }

  // 基本的な検証
  if (!document.cookie) {
    issues.push('No cookies available');
  }

  // Farcaster環境での特別な検証
  if (environment === 'farcaster') {
    // Farcaster環境ではセキュアクッキーが機能しない場合がある
    const testCookieName = '_fc_test_cookie';
    try {
      setEnvironmentCookie(testCookieName, 'test', environment);
      const retrieved = getCookie(testCookieName);
      if (!retrieved) {
        issues.push('Cookie setting failed in Farcaster environment');
      } else {
        deleteCookie(testCookieName, environment);
      }
    } catch (error) {
      issues.push(`Cookie test failed: ${error}`);
    }
  }

  return {
    isValid: issues.length === 0,
    environment,
    issues,
  };
}
