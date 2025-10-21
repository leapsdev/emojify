/**
 * カスタムService Worker
 * Farcaster SDK内のPrivy analyticsリクエストをプロキシ経由で送信
 */

// Privy Farcaster analytics URLをプロキシURLに変換
const PRIVY_ANALYTICS_URL = 'https://privy.farcaster.xyz/api/v1/analytics_events';
const PROXY_ANALYTICS_URL = '/api/proxy/privy-farcaster/api/v1/analytics_events';

self.addEventListener('fetch', (event) => {
  const requestUrl = event.request.url;
  
  // Privy analytics eventsリクエストをインターセプト（URLパターンマッチングを改善）
  if (requestUrl.includes('privy.farcaster.xyz/api/v1/analytics_events')) {
    console.log('🔄 Intercepting Privy analytics request:', requestUrl);
    console.log('🔄 Redirecting to proxy:', PROXY_ANALYTICS_URL);
    
    // リクエストボディをクローンして処理
    event.respondWith(
      (async () => {
        try {
          // リクエストボディを取得
          let body = null;
          if (event.request.method !== 'GET' && event.request.method !== 'HEAD') {
            body = await event.request.clone().text();
          }

          // プロキシURLに変更したリクエストを作成
          const proxyRequest = new Request(PROXY_ANALYTICS_URL, {
            method: event.request.method,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
              // 元のヘッダーから必要なものをコピー
              ...(event.request.headers.get('Authorization') && {
                'Authorization': event.request.headers.get('Authorization')
              })
            },
            body: body,
            mode: 'cors',
            credentials: 'same-origin'
          });
          
          // プロキシリクエストをフェッチ
          const response = await fetch(proxyRequest);
          console.log('✅ Proxy analytics request successful:', response.status);
          
          // レスポンスを返す
          return new Response(await response.text(), {
            status: response.status,
            statusText: response.statusText,
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*',
              'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
              'Access-Control-Allow-Headers': 'Content-Type, Authorization'
            }
          });
        } catch (error) {
          console.warn('⚠️ Proxy analytics request failed:', error);
          // エラーの場合は成功レスポンスを模倣してエラーを隠す
          return new Response(JSON.stringify({ success: true }), {
            status: 200,
            statusText: 'OK',
            headers: {
              'Content-Type': 'application/json',
              'Access-Control-Allow-Origin': '*'
            }
          });
        }
      })()
    );
    return; // 早期リターンで他の処理をスキップ
  }
  
  // その他のリクエストは通常通り処理（何もしない）
});

self.addEventListener('install', (event) => {
  console.log('🔧 Custom Service Worker installing');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🚀 Custom Service Worker activated');
  event.waitUntil(clients.claim());
});
