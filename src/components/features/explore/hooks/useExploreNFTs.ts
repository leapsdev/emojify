import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { ipfsToHttp } from '@/lib/ipfsGateway';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';

interface NFT {
  tokenId: string;
  owner: string;
  uri: string;
  imageUrl?: string;
  name?: string;
  description?: string;
}

async function fetchMetadata(uri: string) {
  const url = ipfsToHttp(uri);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export const useExploreNFTs = () => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        const totalSupply = (await readContract(config, {
          ...emojiContract,
          functionName: 'totalSupply',
        })) as bigint;
        const nftResults: NFT[] = [];
        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = i + 1;
          try {
            const uri = (await readContract(config, {
              ...emojiContract,
              functionName: 'uri',
              args: [BigInt(tokenId)],
            })) as string;
            if (!uri) continue;
            const metadata = await fetchMetadata(uri);
            const imageUrl = metadata.image
              ? ipfsToHttp(metadata.image)
              : '/placeholder.svg';
            nftResults.push({
              tokenId: tokenId.toString(),
              owner: '',
              uri: ipfsToHttp(uri),
              imageUrl,
              name: metadata.name || `NFT #${tokenId}`,
              description: metadata.description || '',
            });
          } catch {
            // skip broken token
          }
        }
        // 新しい順にソート
        nftResults.sort((a, b) => Number(b.tokenId) - Number(a.tokenId));
        setNFTs(nftResults);
      } catch {
        setError('NFTの取得に失敗しました');
        setNFTs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, []);

  return { nfts, loading, error };
};
