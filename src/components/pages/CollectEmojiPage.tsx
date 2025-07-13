'use client';

import { CollectButton } from '@/components/features/collect-emoji/components/CollectButton';
import { CreatorInfo } from '@/components/features/collect-emoji/components/CreatorInfo';
import { EmojiDetails } from '@/components/features/collect-emoji/components/EmojiDetails';
import { EmojiImage } from '@/components/features/collect-emoji/components/EmojiImage';
import type { EmojiData } from '@/components/features/collect-emoji/types';
import { ipfsToHttp } from '@/lib/ipfsGateway';
import { EMOJI_CONTRACT_ADDRESS, activeChain } from '@/lib/thirdweb';
import {
  ThirdwebProvider,
  useContract,
  useContractRead,
} from '@thirdweb-dev/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function CollectEmojiPageContent() {
  const params = useParams();
  const tokenId = params?.id as string;
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: uri } = useContractRead(contract, 'uri', [tokenId]);

  useEffect(() => {
    const fetchEmojiData = async () => {
      if (!uri) return;

      try {
        const gatewayUrl = ipfsToHttp(uri);
        console.log('Fetching metadata from:', gatewayUrl);

        const response = await fetch(gatewayUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const metadata = await response.json();
        console.log('Fetched metadata:', metadata);

        // 画像URLをIPFSゲートウェイを使用するように変換
        const imageUrl = metadata.image
          ? ipfsToHttp(metadata.image)
          : '/placeholder.svg';

        // クリエイター情報をメタデータから取得
        const creatorAddress = metadata.attributes?.find(
          (attr: { trait_type: string; value: string }) =>
            attr.trait_type === 'creator',
        )?.value;

        setEmojiData({
          id: tokenId,
          image: imageUrl,
          creator: {
            id: creatorAddress || 'Unknown',
            username: creatorAddress
              ? `${creatorAddress.slice(0, 6)}...${creatorAddress.slice(-4)}`
              : 'Unknown',
          },
          details: {
            token: 'ETH',
            network: 'Base',
          },
          name: metadata.name,
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching emoji data:', err);
        setError('An error occurred while fetching NFT data.');
      }
    };

    if (uri) {
      fetchEmojiData();
    }
  }, [uri, tokenId]);

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
    <ThirdwebProvider
      activeChain={activeChain}
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <CollectEmojiPageContent />
    </ThirdwebProvider>
  );
}
