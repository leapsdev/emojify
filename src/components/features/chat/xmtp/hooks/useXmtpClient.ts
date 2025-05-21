import { initializeClient } from '@/repository/xmtp/client';
import type { XMTPClient } from '@/repository/xmtp/types';
import type { Signer } from '@ethersproject/abstract-signer';
import { type PrivyWallet, usePrivy } from '@privy-io/react-auth';
import { useEffect, useState } from 'react';

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
        if (!user?.wallet) {
          setError('No wallet found');
          setIsLoading(false);
          return;
        }

        // Signerインターフェースを実装
        const signer: Signer = {
          getAddress: async () => (user.wallet as PrivyWallet).address,
          signMessage: async (message: Uint8Array | string) => {
            const messageString =
              typeof message === 'string'
                ? message
                : new TextDecoder().decode(message);
            return await (user.wallet as PrivyWallet).sign(messageString);
          },
        } as Signer;

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
