'use client';

import { CollectButton } from '@/components/features/collect-emoji/components/CollectButton';
import { CreatorInfo } from '@/components/features/collect-emoji/components/CreatorInfo';
import { EmojiDetails } from '@/components/features/collect-emoji/components/EmojiDetails';
import { EmojiImage } from '@/components/features/collect-emoji/components/EmojiImage';
import type { EmojiData } from '@/components/features/collect-emoji/types';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import {
  ThirdwebProvider,
  useContract,
  useContractRead,
} from '@thirdweb-dev/react';
import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

// IPFSゲートウェイのURLを定義
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
];

// IPFSのURLをゲートウェイURLに変換する関数
const convertIpfsToGatewayUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';

  if (ipfsUrl.startsWith('ipfs://')) {
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    return `${IPFS_GATEWAYS[0]}${ipfsHash}`;
  }
  return ipfsUrl;
};

function CollectEmojiPageContent() {
  const params = useParams();
  const tokenId = params?.id as string;
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { data: uri } = useContractRead(contract, 'uri', [tokenId]);

  useEffect(() => {
    const fetchEmojiData = async () => {
      if (!uri) return;

      try {
        setLoading(true);
        const gatewayUrl = convertIpfsToGatewayUrl(uri);
        console.log('Fetching metadata from:', gatewayUrl);

        const response = await fetch(gatewayUrl);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const metadata = await response.json();
        console.log('Fetched metadata:', metadata);

        // 画像URLをIPFSゲートウェイを使用するように変換
        const imageUrl = metadata.image
          ? convertIpfsToGatewayUrl(metadata.image)
          : '/placeholder.svg';

        setEmojiData({
          id: tokenId,
          image: imageUrl,
          creator: {
            id: '0x...', // 実際のクリエイターアドレスを設定
            username: 'Creator',
            avatar: '/placeholder.svg',
            timeAgo: '2 days ago',
          },
          details: {
            firstCollector: '0x...', // 実際のコレクターアドレスを設定
            firstCollectorAvatar: '/placeholder.svg',
            token: 'ETH',
            network: 'Base Sepolia',
          },
        });
        setError(null);
      } catch (err) {
        console.error('Error fetching emoji data:', err);
        setError('NFTデータの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    if (uri) {
      fetchEmojiData();
    }
  }, [uri, tokenId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-purple-500" />
      </div>
    );
  }

  if (error || !emojiData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-red-500 text-xl">
          {error || 'NFTが見つかりませんでした。'}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <EmojiImage image={emojiData.image} />
        </div>
        <div className="space-y-6">
          <CreatorInfo creator={emojiData.creator} />
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
      activeChain="base-sepolia-testnet"
      clientId={process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID}
    >
      <CollectEmojiPageContent />
    </ThirdwebProvider>
  );
}
