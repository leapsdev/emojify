import { emojiContract } from '@/lib/contracts';
import { usePrivy } from '@privy-io/react-auth';
import { type EIP1193Provider, createWalletClient, custom } from 'viem';
import { base, baseSepolia } from 'viem/chains';

export const useEmojiMint = () => {
  const { authenticated, user } = usePrivy();

  const mintNFT = async (metadataUrl: string) => {
    // Privyの認証状態をチェック
    if (!authenticated || !user?.wallet) {
      throw new Error('Wallet not connected');
    }

    try {
      // Privyのウォレットアドレスを取得
      const privyAddress = user.wallet.address;

      // PrivyのウォレットからEthereum Providerを取得
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

      // Privyプロバイダーを使ってViemのWalletClientを作成
      const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
      const chain = isProd ? base : baseSepolia;

      const privyWalletClient = createWalletClient({
        account: privyAddress as `0x${string}`,
        chain,
        transport: custom(provider as EIP1193Provider),
      });

      // WalletClientを使って直接コントラクトを実行
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
      console.error('Transaction error:', error);
      throw new Error(e.message || 'Transaction failed with unknown error');
    }
  };

  return { mintNFT };
};
