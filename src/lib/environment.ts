/**
 * 環境判定ユーティリティ関数
 * クライアントサイドとサーバーサイド両方で使用可能
 */

/**
 * 環境タイプの定義
 */
export type Environment = 'farcaster' | 'normal';

/**
 * 環境検出の結果
 */
export interface EnvironmentDetectionResult {
  environment: Environment;
  isFarcasterEnvironment: boolean;
  detectionMethods: {
    urlParams: boolean;
    userAgent: boolean;
    headers: boolean;
  };
}

/**
 * Farcaster関連のURLパラメータをチェック
 */
function checkFarcasterUrlParams(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const params = urlObj.searchParams;

    return !!(
      params.get('frame_url') ||
      params.get('cast_hash') ||
      params.get('fid') ||
      params.get('fc_referrer') ||
      params.get('miniapp') === 'true' ||
      params.get('fc_frame') === 'true'
    );
  } catch {
    return false;
  }
}

/**
 * User-AgentからFarcaster環境を検出
 */
function checkFarcasterUserAgent(userAgent: string): boolean {
  if (!userAgent) return false;

  const ua = userAgent.toLowerCase();
  return !!(
    ua.includes('farcaster') ||
    ua.includes('warpcast') ||
    ua.includes('miniapp') ||
    ua.includes('frame')
  );
}

/**
 * HTTPヘッダーからFarcaster環境を検出
 */
function checkFarcasterHeaders(
  headers: Headers | Record<string, string>,
): boolean {
  // Headers オブジェクトと通常のオブジェクトの両方に対応
  const getHeader = (key: string): string | null => {
    if (headers instanceof Headers) {
      return headers.get(key);
    }
    return headers[key] || headers[key.toLowerCase()] || null;
  };

  const farcasterFrame = getHeader('x-farcaster-frame');
  const farcasterMiniapp = getHeader('x-farcaster-miniapp');
  const referer = getHeader('referer');
  const origin = getHeader('origin');

  return !!(
    farcasterFrame ||
    farcasterMiniapp ||
    (referer &&
      (referer.includes('farcaster') || referer.includes('warpcast'))) ||
    (origin && (origin.includes('farcaster') || origin.includes('warpcast')))
  );
}

/**
 * クライアントサイドでの環境検出
 */
export function detectEnvironmentClient(): EnvironmentDetectionResult {
  if (typeof window === 'undefined') {
    return {
      environment: 'normal',
      isFarcasterEnvironment: false,
      detectionMethods: {
        urlParams: false,
        userAgent: false,
        headers: false,
      },
    };
  }

  const urlParams = checkFarcasterUrlParams(window.location.href);
  const userAgent = checkFarcasterUserAgent(navigator.userAgent);

  // クライアントサイドではヘッダーの直接チェックはできない
  const headers = false;

  const isFarcasterEnvironment = urlParams || userAgent || headers;

  return {
    environment: isFarcasterEnvironment ? 'farcaster' : 'normal',
    isFarcasterEnvironment,
    detectionMethods: {
      urlParams,
      userAgent,
      headers,
    },
  };
}

/**
 * サーバーサイドでの環境検出
 */
export function detectEnvironmentServer(
  url: string,
  userAgent = '',
  headers: Headers | Record<string, string> = {},
): EnvironmentDetectionResult {
  const urlParams = checkFarcasterUrlParams(url);
  const userAgentCheck = checkFarcasterUserAgent(userAgent);
  const headersCheck = checkFarcasterHeaders(headers);

  const isFarcasterEnvironment = urlParams || userAgentCheck || headersCheck;

  return {
    environment: isFarcasterEnvironment ? 'farcaster' : 'normal',
    isFarcasterEnvironment,
    detectionMethods: {
      urlParams,
      userAgent: userAgentCheck,
      headers: headersCheck,
    },
  };
}

/**
 * Next.js Requestオブジェクトから環境を検出
 */
export function detectEnvironmentFromRequest(request: {
  url: string;
  headers: Headers;
}): EnvironmentDetectionResult {
  const userAgent = request.headers.get('user-agent') || '';

  return detectEnvironmentServer(request.url, userAgent, request.headers);
}

/**
 * 環境に応じた設定を取得
 */
export interface EnvironmentConfig {
  cookieSettings: {
    secure: boolean;
    sameSite: 'strict' | 'lax' | 'none';
    httpOnly: boolean;
  };
  redirectBehavior: {
    allowDirectRedirects: boolean;
    usePostMessage: boolean;
  };
}

/**
 * 環境に応じた設定を取得
 */
export function getEnvironmentConfig(
  environment: Environment,
): EnvironmentConfig {
  if (environment === 'farcaster') {
    return {
      cookieSettings: {
        secure: false, // Farcaster環境では多くの場合HTTPSが保証されないため
        sameSite: 'lax', // より緩い設定でクロスサイトリクエストを許可
        httpOnly: true,
      },
      redirectBehavior: {
        allowDirectRedirects: true,
        usePostMessage: false, // Farcaster環境では通常のリダイレクトを使用
      },
    };
  }

  // 通常環境（デフォルト）
  return {
    cookieSettings: {
      secure: process.env.NODE_ENV === 'production', // 本番環境ではHTTPS必須
      sameSite: 'strict', // より厳しいセキュリティ設定
      httpOnly: true,
    },
    redirectBehavior: {
      allowDirectRedirects: true,
      usePostMessage: false,
    },
  };
}

/**
 * デバッグ用の環境情報を取得
 */
export function getEnvironmentDebugInfo(
  result: EnvironmentDetectionResult,
): Record<string, unknown> {
  return {
    environment: result.environment,
    isFarcasterEnvironment: result.isFarcasterEnvironment,
    detectionMethods: result.detectionMethods,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof window !== 'undefined' ? navigator.userAgent : 'server-side',
    url: typeof window !== 'undefined' ? window.location.href : 'server-side',
  };
}
