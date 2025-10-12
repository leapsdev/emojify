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
              // balanceOfをチェックして、アドレスがNFTを所有しているか確認
              const balance = (await readContract(config, {
                ...emojiContract,
                functionName: 'balanceOf',
                args: [address as `0x${string}`, BigInt(tokenId)],
              })) as bigint;
              if (Number(balance) === 0) return;

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
                  owner: address,
                  uri: '',
                  name: `NFT #${tokenId}`,
                  description: 'URIが設定されていません',
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
                owner: address,
                uri: ipfsToHttp(uri),
                imageUrl,
                name: metadata.name || `NFT #${tokenId}`,
                description: metadata.description || '',
              };

              // 取得次第、即座にstateに追加
              setNFTs((prev) => {
                // 重複チェック: 既に同じtokenIdが存在する場合は追加しない
                if (prev.some((item) => item.tokenId === nft.tokenId)) {
                  return prev;
                }
                return [...prev, nft];
              });
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
  }, [address]);

  return { nfts, loading, error };
}
