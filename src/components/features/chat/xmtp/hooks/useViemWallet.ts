'use client';

import { createWalletClient, custom } from 'viem';
import { base } from 'viem/chains';
import { useCallback } from 'react';

export const useViemWallet = () => {
  const createWallet = useCallback(() => {
    if (!window.ethereum) {
      throw new Error('Ethereumプロバイダーが見つかりません');
    }

    return createWalletClient({
      chain: base,
      transport: custom(window.ethereum)
    });
  }, []);

  const signMessage = useCallback(async (address: string, message: string): Promise<string> => {
    try {
      const wallet = createWallet();
      const signature = await wallet.signMessage({
        account: address as `0x${string}`,
        message: message
      });

      return signature;
    } catch (error) {
      if (error instanceof Error && error.message.includes('User rejected')) {
        throw new Error('署名がキャンセルされました。XMTPの初期化には署名が必要です。');
      }
      throw error;
    }
  }, []);

  return {
    createWallet,
    signMessage
  };
};
