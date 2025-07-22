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

export function useProfileNFTs(address?: string) {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      try {
        setLoading(true);
        setError(null);
        const totalSupply = (await readContract(config, {
          ...emojiContract,
          functionName: 'totalSupply',
        })) as bigint;
        const nftPromises: Promise<NFT | null>[] = [];
        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = i + 1;
          const promise = (async () => {
            try {
              // balanceOfをチェックして、アドレスがNFTを所有しているか確認
              const balance = (await readContract(config, {
                ...emojiContract,
                functionName: 'balanceOf',
                args: [address as `0x${string}`, BigInt(tokenId)],
              })) as bigint;
              if (Number(balance) === 0) return null;
              let uri: string;
              try {
                uri = (await readContract(config, {
                  ...emojiContract,
                  functionName: 'uri',
                  args: [BigInt(tokenId)],
                })) as string;
              } catch (err) {
                console.error(`Error fetching URI for token ${tokenId}:`, err);
                throw new Error(`Failed to fetch URI for token ${tokenId}`);
              }
              if (!uri) {
                return {
                  tokenId: tokenId.toString(),
                  owner: address,
                  uri: '',
                  name: `NFT #${tokenId}`,
                  description: 'URIが設定されていません',
                } as NFT;
              }
              // メタデータを取得
              const metadata = await fetchMetadata(uri);
              const imageUrl = metadata.image
                ? ipfsToHttp(metadata.image)
                : '/placeholder.svg';
              return {
                tokenId: tokenId.toString(),
                owner: address,
                uri: ipfsToHttp(uri),
                imageUrl,
                name: metadata.name || `NFT #${tokenId}`,
                description: metadata.description || '',
              } as NFT;
            } catch (err) {
              console.error(`Error processing NFT ${tokenId}:`, err);
              return null;
            }
          })();
          nftPromises.push(promise);
        }
        const results = await Promise.all(nftPromises);
        setNFTs(results.filter(Boolean) as NFT[]);
      } catch {
        setError('NFTの取得に失敗しました');
        setNFTs([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNFTs();
  }, [address]);

  return { nfts, loading, error };
}
