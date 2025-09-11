'use client';

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

export function FarcasterAuthStatus() {
  const { isInFarcasterApp, userContext, isAuthenticated, isAuthenticating } =
    useFarcasterAuth();

  if (!isInFarcasterApp) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 bg-white border rounded-lg p-3 shadow-lg text-sm">
      <div className="font-semibold text-gray-800">Farcaster Mini App</div>
      {isAuthenticating && <div className="text-blue-600">認証中...</div>}
      {isAuthenticated && userContext && (
        <div className="text-green-600">
          {userContext.displayName || userContext.username} としてログイン済み
        </div>
      )}
    </div>
  );
}
