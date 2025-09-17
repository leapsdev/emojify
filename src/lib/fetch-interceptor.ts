/**
 * Fetch Interceptor
 * Farcaster SDK内のPrivy analyticsリクエストをプロキシ経由で送信するためのfetchインターセプター
 */

// 元のfetch関数とXMLHttpRequestを保存（クライアントサイドでのみ）
const originalFetch = typeof window !== 'undefined' ? window.fetch : undefined;
const originalXHR =
  typeof window !== 'undefined' ? window.XMLHttpRequest : undefined;

// インターセプト対象のURL
const PROXY_ANALYTICS_URL =
  '/api/proxy/privy-farcaster/api/v1/analytics_events';

/**
 * Fetch Interceptorを初期化
 */
export function initializeFetchInterceptor() {
  if (typeof window === 'undefined' || !originalFetch || !originalXHR) {
    return;
  }

  // 既にインターセプトされている場合はスキップ
  if (
    '__intercepted' in window.fetch &&
    (window.fetch as { __intercepted?: boolean }).__intercepted
  ) {
    console.log('🔄 Fetch interceptor already initialized');
    return;
  }

  console.log('🔧 Initializing fetch interceptor for Privy analytics...');

  // グローバルスコープでofetchもインターセプト（Farcaster SDKで使用される可能性）
  const globalWindow = window as {
    $fetch?: (url: string, options?: unknown) => Promise<unknown>;
  };
  if (globalWindow.$fetch) {
    const original$fetch = globalWindow.$fetch;
    globalWindow.$fetch = async (url: string, options?: unknown) => {
      if (url.includes('privy.farcaster.xyz/api/v1/analytics_events')) {
        console.log(
          '🔄 Intercepting $fetch to Privy analytics, redirecting to proxy',
        );
        return original$fetch(PROXY_ANALYTICS_URL, options);
      }
      return original$fetch(url, options);
    };
  }

  // fetchをオーバーライド
  window.fetch = async function interceptedFetch(
    input: RequestInfo | URL,
    init?: RequestInit,
  ): Promise<Response> {
    // URLを文字列に変換
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.href
          : input.url;

    // すべてのPrivyリクエストをログ出力（デバッグ用）
    if (url.includes('privy.farcaster.xyz')) {
      console.log('🔍 Fetch Interceptor detected Privy request:', url);
      console.log('🔍 Method:', init?.method || 'GET');
      console.log('🔍 Headers:', init?.headers);
      console.log('🔍 Request type:', typeof input);
    }

    // Privy analytics URLをインターセプト（より柔軟なマッチング）
    if (url.includes('privy.farcaster.xyz/api/v1/analytics_events')) {
      console.log(
        '🔄 Intercepting Privy analytics request, redirecting to proxy',
      );
      console.log('🎯 Original URL:', url);
      console.log('🔀 Proxy URL:', PROXY_ANALYTICS_URL);

      try {
        // プロキシURLでリクエストを実行
        const response = await originalFetch(PROXY_ANALYTICS_URL, {
          ...init,
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
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

  // XMLHttpRequestもインターセプト
  window.XMLHttpRequest = function InterceptedXMLHttpRequest() {
    const xhr = new originalXHR();
    const originalOpen = xhr.open;

    xhr.open = function (
      method: string,
      url: string | URL,
      ...args: unknown[]
    ) {
      const urlString = typeof url === 'string' ? url : url.toString();

      // Privy analytics URLをインターセプト
      if (urlString.includes('privy.farcaster.xyz/api/v1/analytics_events')) {
        console.log(
          '🔄 Intercepting XMLHttpRequest to Privy analytics, redirecting to proxy',
        );
        console.log('🎯 Original URL:', urlString);
        console.log('🔀 Proxy URL:', PROXY_ANALYTICS_URL);
        return originalOpen.call(
          this,
          method,
          PROXY_ANALYTICS_URL,
          ...(args.map((arg) => arg ?? true) as [boolean, string?, string?]),
        );
      }

      // その他のリクエストは通常通り
      return originalOpen.call(
        this,
        method,
        urlString,
        ...(args.map((arg) => arg ?? true) as [boolean, string?, string?]),
      );
    };

    return xhr;
  } as unknown as typeof XMLHttpRequest;

  // インターセプト済みフラグを設定
  (window.fetch as { __intercepted?: boolean }).__intercepted = true;
  (window.XMLHttpRequest as { __intercepted?: boolean }).__intercepted = true;
  console.log(
    '✅ Fetch and XMLHttpRequest interceptor initialized successfully',
  );
}

/**
 * Fetch Interceptorを無効化
 */
export function disableFetchInterceptor() {
  if (typeof window === 'undefined' || !originalFetch || !originalXHR) {
    return;
  }

  const fetchWithFlag = window.fetch as { __intercepted?: boolean };
  const xhrWithFlag = window.XMLHttpRequest as { __intercepted?: boolean };

  if (fetchWithFlag.__intercepted) {
    window.fetch = originalFetch;
    fetchWithFlag.__intercepted = undefined;
  }

  if (xhrWithFlag.__intercepted) {
    window.XMLHttpRequest = originalXHR;
    xhrWithFlag.__intercepted = undefined;
  }

  console.log('🔄 Fetch and XMLHttpRequest interceptor disabled');
}
