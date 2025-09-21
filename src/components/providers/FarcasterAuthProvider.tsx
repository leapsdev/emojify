'use client';

import { useFarcasterAuth } from '@/hooks/useFarcasterAuth';

interface FarcasterAuthProviderProps {
  children: React.ReactNode;
}

export function FarcasterAuthProvider({
  children,
}: FarcasterAuthProviderProps) {
  // Farcaster SDKの初期化と自動ログインを実行
  useFarcasterAuth();

  return <>{children}</>;
}
