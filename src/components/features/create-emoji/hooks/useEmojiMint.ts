import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { usePrivy } from '@privy-io/react-auth';
import { type EIP1193Provider, createWalletClient, custom } from 'viem';
import { base, baseSepolia } from 'viem/chains';
import { useAccount, useWalletClient } from 'wagmi';

export const useEmojiMint = () => {
  const { data: walletClient } = useWalletClient({ config });
  const { address } = useAccount();
  const { authenticated, user } = usePrivy();

  const mintNFT = async (metadataUrl: string) => {
    // まずWagmiのウォレットクライアントを試す
    if (walletClient && address) {
      try {
        const transactionHash = await walletClient.writeContract({
          ...emojiContract,
          functionName: 'registerNewEmoji',
          args: [address as `0x${string}`, metadataUrl, '0x' as `0x${string}`],
        });

        return { transactionHash: transactionHash as string };
      } catch (error: unknown) {
        const e = error as { code?: number; message?: string };
        if (e.code === 4001) {
          throw new Error('Transaction cancelled.');
        }
        console.error('Wagmi transaction error:', error);
        throw new Error(e.message || 'Transaction failed with unknown error');
      }
    }

    // フォールバック: Privyから直接Viemクライアントを作成
    if (!authenticated || !user?.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      const privyAddress = user.wallet.address;

      const provider = await (
        user.wallet as unknown as {
          getEthereumProvider: () => Promise<unknown>;
        }
      ).getEthereumProvider();

      if (
        !provider ||
        typeof provider !== 'object' ||
        !('request' in provider)
      ) {
        throw new Error('Ethereum provider not available from Privy wallet');
      }

      const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
      const chain = isProd ? base : baseSepolia;

      const privyWalletClient = createWalletClient({
        account: privyAddress as `0x${string}`,
        chain,
        transport: custom(provider as EIP1193Provider),
      });

      const transactionHash = await privyWalletClient.writeContract({
        ...emojiContract,
        functionName: 'registerNewEmoji',
        args: [
          privyAddress as `0x${string}`,
          metadataUrl,
          '0x' as `0x${string}`,
        ],
      });

      return { transactionHash: transactionHash as string };
    } catch (error: unknown) {
      const e = error as { code?: number; message?: string };
      if (e.code === 4001) {
        throw new Error('Transaction cancelled.');
      }
      console.error('Privy transaction error:', error);
      throw new Error(e.message || 'Transaction failed with unknown error');
    }
  };

  return { mintNFT };
};
