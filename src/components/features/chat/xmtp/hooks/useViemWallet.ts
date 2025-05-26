import { useWalletClient } from 'wagmi';
import { useCallback } from 'react';
import { Address, Hex } from 'viem';

export const useViemWallet = () => {
  const { data: walletClient } = useWalletClient();

  const signMessage = useCallback(async (address: Address, message: string): Promise<Hex> => {
    if (!walletClient) {
      throw new Error('ウォレットクライアントが見つかりません');
    }

    try {
      const signature = await walletClient.signMessage({
        message: message as string,
        account: address as Address,
      });

      return signature;
    } catch (error) {
      console.error('メッセージの署名に失敗:', error);
      throw new Error('メッセージの署名に失敗しました');
    }
  }, [walletClient]);

  return {
    signMessage,
  };
};
