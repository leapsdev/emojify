import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { emojiContract } from '@/lib/contracts';

export const useEmojiMint = () => {
  const { address, walletClient } = useUnifiedWallet();

  const mintNFT = async (metadataUrl: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // Farcaster環境では EIP-1193 プロバイダー、Wagmi環境ではWalletClientを使用
      const transactionHash =
        walletClient &&
        typeof walletClient === 'object' &&
        walletClient !== null &&
        'writeContract' in walletClient
          ? await (
              walletClient as {
                writeContract: (...args: unknown[]) => Promise<unknown>;
              }
            ).writeContract({
              ...emojiContract,
              functionName: 'registerNewEmoji',
              args: [
                address as `0x${string}`,
                metadataUrl,
                '0x' as `0x${string}`,
              ],
            })
          : await (
              walletClient as {
                request: (...args: unknown[]) => Promise<unknown>;
              }
            ).request({
              method: 'eth_sendTransaction',
              params: [
                {
                  to: emojiContract.address,
                  data: `${emojiContract.abi}`,
                },
              ],
            });

      return { transactionHash: transactionHash as string };
    } catch (error: unknown) {
      const e = error as { code?: number; message?: string };
      if (e.code === 4001) {
        throw new Error('Transaction cancelled.');
      }
      console.error('Transaction error:', error);
      throw new Error(e.message || 'Transaction failed with unknown error');
    }
  };

  return { mintNFT };
};
