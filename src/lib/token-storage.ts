/**
 * localStorage based token storage utilities for Privy authentication
 */

const TOKEN_KEY = 'privy-access-token';

/**
 * localStorageからアクセストークンを取得
 */
export function getStoredToken(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to get token from localStorage:', error);
    return null;
  }
}

/**
 * localStorageにアクセストークンを保存
 */
export function setStoredToken(token: string): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch (error) {
    console.error('Failed to store token in localStorage:', error);
  }
}

/**
 * localStorageからアクセストークンを削除
 */
export function removeStoredToken(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch (error) {
    console.error('Failed to remove token from localStorage:', error);
  }
}

/**
 * Authorization헤더用のトークン文字列を取得
 */
export function getAuthorizationHeader(): string | null {
  const token = getStoredToken();
  return token ? `Bearer ${token}` : null;
}
