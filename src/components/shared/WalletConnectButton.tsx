'use client';

import { Button } from '@/components/ui/Button';
import { useUnifiedAuth } from '@/hooks/useUnifiedAuth';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { LogIn } from 'lucide-react';

interface WalletConnectButtonProps {
  className?: string;
  showIcon?: boolean;
}

export const WalletConnectButton = ({
  className = '',
  showIcon = true,
}: WalletConnectButtonProps) => {
  const { ready } = usePrivy();
  const { login } = useLogin();
  const { isAuthenticated, isLoading } = useUnifiedAuth();

  // 認証状態の初期化中は何も表示しない
  if (isLoading) {
    return null;
  }

  // 統合認証状態をチェック（Mini App環境ではFarcaster認証、Web環境ではPrivy認証）
  if (isAuthenticated) {
    return null;
  }

  return (
    <div
      className={`flex flex-col items-center justify-center min-h-screen text-center space-y-6 p-8 ${className}`}
    >
      <Button
        disabled={!ready}
        onClick={login}
        className="bg-blue-600 text-white rounded-full px-8 py-4 text-lg font-bold hover:bg-blue-700 transition-colors shadow-lg"
      >
        {showIcon && <LogIn className="mr-2 h-5 w-5" />}
        Connect Wallet
      </Button>
    </div>
  );
};
