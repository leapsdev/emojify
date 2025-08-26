import { getAuthorizationHeader, removeStoredToken } from './token-storage';

/**
 * 自動的にAuthorization헤더を付与するfetch wrapper
 */
export async function authenticatedFetch(
  input: RequestInfo | URL,
  init?: RequestInit,
): Promise<Response> {
  const authHeader = getAuthorizationHeader();

  const headers = new Headers(init?.headers);
  if (authHeader) {
    headers.set('Authorization', authHeader);
  }

  const response = await fetch(input, {
    ...init,
    headers,
  });

  // 401エラーの場合はトークンを削除してリダイレクト
  if (response.status === 401) {
    removeStoredToken();
    if (typeof window !== 'undefined') {
      window.location.href = '/signup';
    }
  }

  return response;
}

/**
 * JSON APIリクエスト用のヘルパー
 */
export async function apiRequest<T = unknown>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: unknown;
    headers?: Record<string, string>;
  } = {},
): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;

  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    config.body = JSON.stringify(body);
  }

  const response = await authenticatedFetch(endpoint, config);

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`API request failed: ${response.status} ${errorText}`);
  }

  // レスポンスが空の場合は null を返す
  const contentType = response.headers.get('content-type');
  if (!contentType || !contentType.includes('application/json')) {
    return null as T;
  }

  return response.json();
}
