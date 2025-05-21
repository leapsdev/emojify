import { usePrivy } from '@privy-io/react-auth';
import { initializeClient } from '@/repository/xmtp/client';
import { useEffect, useState } from 'react';
import type { XMTPClient } from '@/repository/xmtp/types';

export function useXmtpClient() {
  const { user, ready } = usePrivy();
  const [client, setClient] = useState<XMTPClient | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initClient = async () => {
      if (!ready || !user) {
        setIsLoading(false);
        return;
      }

      try {
        // ウォレットがある場合は最初のウォレットを使用
        const wallet = user.wallet;
        if (!wallet) {
          setError('No wallet found');
          setIsLoading(false);
          return;
        }

        // ウォレットのサイナーを取得
        const signer = await wallet.getEthersV5Signer();
        
        // XMTPクライアントを初期化
        const xmtpClient = await initializeClient(signer);
        setClient(xmtpClient);
        setError(null);
      } catch (err) {
        console.error('Failed to initialize XMTP client:', err);
        setError('Failed to initialize XMTP client');
      } finally {
        setIsLoading(false);
      }
    };

    initClient();
  }, [user, ready]);

  return {
    client,
    error,
    isLoading,
  };
}
