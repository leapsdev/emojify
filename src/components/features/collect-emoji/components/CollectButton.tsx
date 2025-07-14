import { Button } from '@/components/ui/Button';
import { Loading } from '@/components/ui/Loading';
import { TransactionResult } from '@/components/ui/TransactionResult';
import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { useWallets } from '@privy-io/react-auth';
import { readContract, writeContract } from '@wagmi/core';
import { Plus } from 'lucide-react';
import { useState } from 'react';

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
  const { wallets } = useWallets();

  const handleCollect = async () => {
    if (wallets.length === 0) {
      console.error('No wallet connected');
      return;
    }

    try {
      setIsLoading(true);
      setCollectResult(null);
      const walletAddress = wallets[0].address;

      // Check if the current user is the first minter
      const firstMinterAddress = (await readContract(config, {
        ...emojiContract,
        functionName: 'firstMinter',
        args: [BigInt(tokenId)],
      })) as unknown as string;

      const isFirstMinter =
        firstMinterAddress.toLowerCase() === walletAddress.toLowerCase();

      const valueToSend = isFirstMinter ? BigInt(0) : BigInt('500000000000000'); // 0.0005 ETH in wei

      // NFTを取得
      const hash = await writeContract(config, {
        ...emojiContract,
        functionName: 'addEmojiSupply',
        args: [
          walletAddress as `0x${string}`,
          BigInt(tokenId),
          BigInt(1),
          '0x' as `0x${string}`,
        ],
        value: valueToSend,
      });

      setCollectResult({ result: 'success', transactionHash: hash });
    } catch (error: unknown) {
      setCollectResult({ result: 'error' });
      console.error('Collect error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (collectResult) {
    return (
      <TransactionResult
        result={collectResult.result}
        title={collectResult.result === 'success' ? '収集成功' : '収集失敗'}
        message={
          collectResult.result === 'success'
            ? 'NFTの収集に成功しました。'
            : 'NFTの収集に失敗しました。'
        }
        transactionHash={collectResult.transactionHash}
        explorerUrl={
          collectResult.transactionHash
            ? `https://basescan.org/tx/${collectResult.transactionHash}`
            : undefined
        }
      />
    );
  }

  return (
    <Button onClick={handleCollect} disabled={isLoading} className="w-full">
      {isLoading ? <Loading size="sm" /> : <Plus className="mr-2 h-4 w-4" />}{' '}
      収集する
    </Button>
  );
}
