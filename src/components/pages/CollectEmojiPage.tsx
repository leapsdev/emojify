'use client';

import { CollectButton } from '@/components/features/collect-emoji/components/CollectButton';
import { CreatorInfo } from '@/components/features/collect-emoji/components/CreatorInfo';
import { EmojiDetails } from '@/components/features/collect-emoji/components/EmojiDetails';
import { EmojiImage } from '@/components/features/collect-emoji/components/EmojiImage';
import { useCollectNFT } from '@/components/features/collect-emoji/hooks/useCollectNFT';
import { WalletConnectButton } from '@/components/shared/WalletConnectButton';
import { Loading } from '@/components/ui/Loading';
import { useCollectWallet } from '@/hooks/useCollectWallet';
import EthereumProviders from '@/lib/basename/EthereumProviders';
import { useParams } from 'next/navigation';

function CollectEmojiPageContent() {
  const params = useParams();
  const tokenId = params?.id as string;
  const { emojiData, loading, error } = useCollectNFT(tokenId);
  const { isConnected } = useCollectWallet();

  if (!isConnected) {
    return <WalletConnectButton />;
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loading size="xl" className="mb-4" />
      </div>
    );
  }

  if (error || !emojiData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-8">
        <div>
          <EmojiImage image={emojiData.image} />
        </div>
        <div className="space-y-6">
          <CreatorInfo creator={emojiData.creator} name={emojiData.name} />
          <EmojiDetails details={emojiData.details} />
          <CollectButton tokenId={emojiData.id} />
        </div>
      </div>
    </div>
  );
}

export function CollectEmojiPage() {
  return (
    <EthereumProviders>
      <CollectEmojiPageContent />
    </EthereumProviders>
  );
}
