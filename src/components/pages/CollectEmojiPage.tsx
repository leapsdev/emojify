'use client';

import { CollectButton } from '@/components/features/collect-emoji/components/CollectButton';
import { CreatorInfo } from '@/components/features/collect-emoji/components/CreatorInfo';
import { EmojiDetails } from '@/components/features/collect-emoji/components/EmojiDetails';
import { EmojiImage } from '@/components/features/collect-emoji/components/EmojiImage';
import type { EmojiData } from '@/components/features/collect-emoji/types';
import EthereumProviders from '@/lib/basename/EthereumProviders';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function CollectEmojiPageContent() {
  const params = useParams();
  const tokenId = params?.id as string;
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEmojiData = async () => {
      try {
        setEmojiData({
          id: tokenId,
          image: '/placeholder.svg',
          creator: {
            id: 'Unknown',
            username: 'Unknown',
          },
          details: {
            token: 'ETH',
            network: 'Base',
          },
          name: 'Unknown Emoji',
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching emoji data:', err);
        setError('An error occurred while fetching NFT data.');
      }
    };

    fetchEmojiData();
  }, [tokenId]);

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
