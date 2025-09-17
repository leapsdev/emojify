/**
 * Fetch Interceptor
 * Farcaster SDK内のPrivy analyticsリクエストをプロキシ経由で送信するためのfetchインターセプター
 */

// 元のfetch関数を保存
const originalFetch = window.fetch;

// インターセプト対象のURL
const PRIVY_ANALYTICS_URL = 'https://privy.farcaster.xyz/api/v1/analytics_events';
const PROXY_ANALYTICS_URL = '/api/proxy/privy-farcaster/api/v1/analytics_events';

/**
 * Fetch Interceptorを初期化
 */
export function initializeFetchInterceptor() {
  if (typeof window === 'undefined') {
    return;
  }

  // 既にインターセプトされている場合はスキップ
  if ('__intercepted' in window.fetch && (window.fetch as { __intercepted?: boolean }).__intercepted) {
    console.log('🔄 Fetch interceptor already initialized');
    return;
  }

  console.log('🔧 Initializing fetch interceptor for Privy analytics...');

  // fetchをオーバーライド
  window.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit
  ): Promise<Response> {
    // URLを文字列に変換
    const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;

    // Privy analytics URLをインターセプト
    if (url === PRIVY_ANALYTICS_URL) {
      console.log('🔄 Intercepting Privy analytics request, redirecting to proxy');
      console.log('🎯 Original URL:', url);
      console.log('🔀 Proxy URL:', PROXY_ANALYTICS_URL);

      try {
        // プロキシURLでリクエストを実行
        const response = await originalFetch(PROXY_ANALYTICS_URL, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...init?.headers,
          },
        });

        console.log('✅ Proxy analytics request successful:', response.status);
        return response;
      } catch (error) {
        console.warn('⚠️ Proxy analytics request failed:', error);
        
        // エラーの場合は成功レスポンスを模倣
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json',
          },
        });
      }
    }

    // その他のリクエストは通常通り処理
    return originalFetch(input, init);
  };

  // インターセプト済みフラグを設定
  (window.fetch as { __intercepted?: boolean }).__intercepted = true;
  console.log('✅ Fetch interceptor initialized successfully');
}

/**
 * Fetch Interceptorを無効化
 */
export function disableFetchInterceptor() {
  if (typeof window === 'undefined') {
    return;
  }

  const fetchWithFlag = window.fetch as { __intercepted?: boolean };
  if (fetchWithFlag.__intercepted) {
    window.fetch = originalFetch;
    fetchWithFlag.__intercepted = undefined;
    console.log('🔄 Fetch interceptor disabled');
  }
}
