import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { ipfsToHttp } from '@/lib/ipfsGateway';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';
import type { EmojiData } from '../types';

async function fetchMetadata(uri: string) {
  const url = ipfsToHttp(uri);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export const useCollectNFT = (tokenId: string) => {
  const [emojiData, setEmojiData] = useState<EmojiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTData = async () => {
      try {
        setLoading(true);
        setError(null);

        // NFTが存在するかチェック
        const exists = (await readContract(config, {
          ...emojiContract,
          functionName: 'exists',
          args: [BigInt(tokenId)],
        })) as boolean;

        if (!exists) {
          setError('NFTが見つかりません');
          setEmojiData(null);
          return;
        }

        // URIを取得
        const uri = (await readContract(config, {
          ...emojiContract,
          functionName: 'uri',
          args: [BigInt(tokenId)],
        })) as string;

        if (!uri) {
          setError('NFTのメタデータが見つかりません');
          setEmojiData(null);
          return;
        }

        // メタデータを取得
        const metadata = await fetchMetadata(uri);
        const imageUrl = metadata.image
          ? ipfsToHttp(metadata.image)
          : '/placeholder.svg';

        // 最初のミント者を取得
        const firstMinter = (await readContract(config, {
          ...emojiContract,
          functionName: 'firstMinter',
          args: [BigInt(tokenId)],
        })) as string;

        const emojiData: EmojiData = {
          id: tokenId,
          name: metadata.name || `Emoji #${tokenId}`,
          image: imageUrl,
          creator: {
            id: firstMinter,
            username: `${firstMinter.slice(0, 6)}...${firstMinter.slice(-4)}`,
          },
          details: {
            token: 'ETH',
            network: 'Base',
          },
        };

        setEmojiData(emojiData);
      } catch (err) {
        console.error('NFT fetch error:', err);
        setError('NFTの取得に失敗しました');
        setEmojiData(null);
      } finally {
        setLoading(false);
      }
    };

    if (tokenId) {
      fetchNFTData();
    }
  }, [tokenId]);

  return { emojiData, loading, error };
};
