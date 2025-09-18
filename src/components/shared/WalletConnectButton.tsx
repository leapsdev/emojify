'use client';

import { Button } from '@/components/ui/Button';
// import { useLogin, usePrivy } from '@privy-io/react-auth'; // 一時的にコメントアウト
import { LogIn } from 'lucide-react';

interface WalletConnectButtonProps {
  className?: string;
  showIcon?: boolean;
}

export const WalletConnectButton = ({
  className = '',
  showIcon = true,
}: WalletConnectButtonProps) => {
  // const { ready, authenticated } = usePrivy(); // 一時的にコメントアウト
  // const { login } = useLogin(); // 一時的にコメントアウト
  const ready = true; // 一時的に固定値
  const authenticated = false; // 一時的に固定値
  const login = () => console.log('Login disabled temporarily'); // 一時的に無効化

  if (authenticated) {
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
