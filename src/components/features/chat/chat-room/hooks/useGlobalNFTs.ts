import type { NFTData } from '@/components/features/explore/types';
import { config } from '@/lib/basename/wagmi';
import { emojiContract } from '@/lib/contracts';
import { ipfsToHttp } from '@/lib/ipfsGateway';
import { readContract } from '@wagmi/core';
import { useEffect, useState } from 'react';

export interface NFT extends NFTData {
  owner: string;
  uri: string;
  description?: string;
}

async function fetchMetadata(uri: string) {
  const url = ipfsToHttp(uri);
  const res = await fetch(url);
  if (!res.ok) throw new Error('Failed to fetch metadata');
  return res.json();
}

export function useGlobalNFTs() {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        setLoading(true);
        setError(null);
        setNFTs([]); // Reset NFTs on fetch start

        const totalSupply = (await readContract(config, {
          ...emojiContract,
          functionName: 'totalSupply',
        })) as bigint;

        // ストリーミング方式: 取得したNFTから順次表示
        const fetchPromises: Promise<void>[] = [];

        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = i + 1;
          const promise = (async () => {
            try {
              let uri: string;
              try {
                uri = (await readContract(config, {
                  ...emojiContract,
                  functionName: 'uri',
                  args: [BigInt(tokenId)],
                })) as string;
              } catch (err) {
                console.error(`Error fetching URI for token ${tokenId}:`, err);
                return;
              }

              if (!uri) {
                const nft: NFT = {
                  tokenId: tokenId.toString(),
                  name: `NFT #${tokenId}`,
                  imageUrl: '/placeholder.svg',
                  owner: '',
                  uri: '',
                  description: 'URI is not set',
                };

                // 取得次第、即座にstateに追加
                setNFTs((prev) => {
                  // 重複チェック: 既に同じtokenIdが存在する場合は追加しない
                  if (prev.some((item) => item.tokenId === nft.tokenId)) {
                    return prev;
                  }
                  return [...prev, nft];
                });
                return;
              }

              // メタデータを取得
              const metadata = await fetchMetadata(uri);
              const imageUrl = metadata.image
                ? ipfsToHttp(metadata.image)
                : '/placeholder.svg';

              const nft: NFT = {
                tokenId: tokenId.toString(),
                name: metadata.name || `NFT #${tokenId}`,
                imageUrl,
                owner: '',
                uri: ipfsToHttp(uri),
                description: metadata.description || 'No description available',
              };

              // 取得次第、即座にstateに追加
              setNFTs((prev) => [...prev, nft]);
            } catch (err) {
              console.error(`Error processing NFT ${tokenId}:`, err);
            }
          })();
          fetchPromises.push(promise);
        }

        // すべてのNFT取得完了を待つ
        await Promise.all(fetchPromises);
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
}
