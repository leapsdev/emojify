import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { emojiContract } from '@/lib/contracts';
import { encodeFunctionData } from 'viem';

type WalletClient = unknown;

// Privy環境のWalletClientかどうかを判定
const isPrivyWallet = (
  walletClient: WalletClient,
): walletClient is {
  writeContract: (...args: unknown[]) => Promise<unknown>;
} => {
  return (
    !!walletClient &&
    typeof walletClient === 'object' &&
    walletClient !== null &&
    'writeContract' in walletClient
  );
};

// 環境に応じた適切なチェーンIDを取得
const getTargetChainId = (): string => {
  const isProd = process.env.NEXT_PUBLIC_ENVIRONMENT === 'production';
  // Base: 8453, Base Sepolia: 84532
  return isProd ? '0x2105' : '0x14a34'; // 16進数表記
};

// Privy環境でトランザクションを送信
const sendTransactionViaPrivy = async (
  walletClient: WalletClient,
  address: string,
  metadataUrl: string,
): Promise<string> => {
  return (await (
    walletClient as {
      writeContract: (...args: unknown[]) => Promise<unknown>;
    }
  ).writeContract({
    ...emojiContract,
    functionName: 'registerNewEmoji',
    args: [address as `0x${string}`, metadataUrl, '0x' as `0x${string}`],
  })) as string;
};

// Farcaster環境でトランザクションを送信
const sendTransactionViaFarcaster = async (
  walletClient: WalletClient,
  address: string,
  metadataUrl: string,
): Promise<string> => {
  const data = encodeFunctionData({
    abi: emojiContract.abi,
    functionName: 'registerNewEmoji',
    args: [address as `0x${string}`, metadataUrl, '0x' as `0x${string}`],
  });

  return (await (
    walletClient as {
      request: (...args: unknown[]) => Promise<unknown>;
    }
  ).request({
    method: 'eth_sendTransaction',
    params: [
      {
        from: address,
        to: emojiContract.address,
        data,
        chainId: getTargetChainId(),
      },
    ],
  })) as string;
};

export const useEmojiMint = () => {
  const { address, walletClient } = useUnifiedWallet();

  const mintNFT = async (metadataUrl: string) => {
    if (!walletClient || !address) {
      throw new Error('Wallet not connected');
    }

    try {
      // 環境に応じてトランザクション送信方法を選択
      const transactionHash = isPrivyWallet(walletClient)
        ? await sendTransactionViaPrivy(walletClient, address, metadataUrl)
        : await sendTransactionViaFarcaster(walletClient, address, metadataUrl);

      return { transactionHash };
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
