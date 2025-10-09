import { Button } from '@/components/ui/Button';
import { LinkButton } from '@/components/ui/LinkButton';
import { Loading } from '@/components/ui/Loading';
import { TransactionResult } from '@/components/ui/TransactionResult';
import { useUnifiedWallet } from '@/hooks/useUnifiedWallet';
import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { readContract } from '@wagmi/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';
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

// Privy環境でCollectトランザクションを送信
const sendCollectTransactionViaPrivy = async (
  walletClient: WalletClient,
  address: string,
  tokenId: string,
  valueToSend: bigint,
): Promise<string> => {
  return (await (
    walletClient as {
      writeContract: (...args: unknown[]) => Promise<unknown>;
    }
  ).writeContract({
    ...emojiContract,
    functionName: 'addEmojiSupply',
    args: [
      address as `0x${string}`,
      BigInt(tokenId),
      BigInt(1),
      '0x' as `0x${string}`,
    ],
    value: valueToSend,
  })) as string;
};

// Farcaster環境でCollectトランザクションを送信
const sendCollectTransactionViaFarcaster = async (
  walletClient: WalletClient,
  address: string,
  tokenId: string,
  valueToSend: bigint,
): Promise<string> => {
  const data = encodeFunctionData({
    abi: emojiContract.abi,
    functionName: 'addEmojiSupply',
    args: [
      address as `0x${string}`,
      BigInt(tokenId),
      BigInt(1),
      '0x' as `0x${string}`,
    ],
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
        value: `0x${valueToSend.toString(16)}`,
        data,
        chainId: getTargetChainId(),
      },
    ],
  })) as string;
};

interface Props {
  tokenId: string;
}

interface CollectResult {
  result: 'success' | 'error';
  transactionHash?: string;
}

export function CollectButton({ tokenId }: Props) {
  const [isLoading, setIsLoading] = useState(false);
  const [collectResult, setCollectResult] = useState<CollectResult | null>(
    null,
  );
  const { address, walletClient } = useUnifiedWallet();

  const handleCollect = async () => {
    if (!walletClient || !address) {
      console.error('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      setCollectResult(null);

      // Check if the current user is the first minter
      const firstMinterAddress = (await readContract(config, {
        ...emojiContract,
        functionName: 'firstMinter',
        args: [BigInt(tokenId)],
      })) as unknown as string;

      const isFirstMinter =
        firstMinterAddress.toLowerCase() === address.toLowerCase();

      const valueToSend = isFirstMinter ? BigInt(0) : BigInt('500000000000000'); // 0.0005 ETH in wei

      // 環境に応じてトランザクション送信方法を選択
      const hash = isPrivyWallet(walletClient)
        ? await sendCollectTransactionViaPrivy(
            walletClient,
            address,
            tokenId,
            valueToSend,
          )
        : await sendCollectTransactionViaFarcaster(
            walletClient,
            address,
            tokenId,
            valueToSend,
          );

      setCollectResult({ result: 'success', transactionHash: hash });
    } catch (error: unknown) {
      setCollectResult({ result: 'error' });
      console.error('Collect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonStyles =
    'w-full bg-gray-900 text-white rounded-full py-2 text-lg font-bold hover:bg-gray-800';

  return (
    <>
      {collectResult && (
        <TransactionResult
          result={collectResult.result}
          title={
            collectResult.result === 'success'
              ? 'Successfully collected!'
              : 'Failed to collect NFT'
          }
          message={
            collectResult.result === 'error'
              ? 'The transaction was rejected. Please try again.'
              : undefined
          }
          transactionHash={collectResult.transactionHash}
          explorerUrl={
            collectResult.transactionHash
              ? `https://basescan.org/tx/${collectResult.transactionHash}`
              : undefined
          }
        />
      )}

      {collectResult ? (
        <LinkButton
          href="/explore"
          content="Back to Explore"
          className={buttonStyles}
        />
      ) : (
        <Button
          className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full py-6 text-lg font-bold "
          onClick={handleCollect}
          disabled={isLoading || !walletClient}
        >
          {isLoading ? (
            <Loading size="sm" className="text-white" />
          ) : (
            <>
              <Plus className="w-5 h-5 mr-2" />
              Collect
            </>
          )}
        </Button>
      )}
    </>
  );
}
