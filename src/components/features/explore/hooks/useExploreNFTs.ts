import { convertIpfsToGatewayUrl } from '@/lib/ipfs-utils';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useContract, useContractRead } from '@thirdweb-dev/react';
import { useEffect, useMemo, useState } from 'react';

interface NFT {
  tokenId: string;
  owner: string;
  uri: string;
  imageUrl?: string;
  name?: string;
  description?: string;
}

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  [key: string]: unknown;
}

// IPFSゲートウェイのURLを定義
const IPFS_GATEWAYS = ['https://ipfs.io/ipfs/'];

// メタデータキャッシュ
const metadataCache = new Map<string, NFTMetadata>();

// メタデータを取得する関数（キャッシュ付き）
const fetchMetadata = async (url: string): Promise<NFTMetadata> => {
  // キャッシュをチェック
  const cached = metadataCache.get(url);
  if (cached) {
    return cached;
  }

  for (const gateway of IPFS_GATEWAYS) {
    try {
      const gatewayUrl = url.startsWith('ipfs://')
        ? `${gateway}${url.replace('ipfs://', '')}`
        : url;

      const response = await fetch(gatewayUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('Invalid content type');
      }
      const metadata = await response.json();

      // キャッシュに保存
      metadataCache.set(url, metadata);
      return metadata;
    } catch (error) {
      console.warn(`Failed to fetch from ${gateway}:`, error);
    }
  }
  throw new Error('Failed to fetch metadata from all gateways');
};

export const useExploreNFTs = () => {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);

  const { data: totalSupply } = useContractRead(contract, 'totalSupply');

  // totalSupplyが変更されたときのみ実行
  const shouldFetch = useMemo(() => {
    return contract && totalSupply && Number(totalSupply) > 0;
  }, [contract, totalSupply]);

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!shouldFetch || !contract) return;

      try {
        setLoading(true);
        const nftResults: NFT[] = [];
        const supplyCount = Number(totalSupply);

        // バッチサイズを制限してパフォーマンスを改善
        const BATCH_SIZE = 10;
        const batches = Math.ceil(supplyCount / BATCH_SIZE);

        for (let batch = 0; batch < batches; batch++) {
          const startIndex = batch * BATCH_SIZE;
          const endIndex = Math.min(startIndex + BATCH_SIZE, supplyCount);

          const batchPromises: Promise<NFT>[] = [];

          for (let i = startIndex; i < endIndex; i++) {
            const tokenId = i + 1;
            const promise = (async () => {
              try {
                let uri: string;
                try {
                  uri = await contract.call('uri', [tokenId]);
                } catch (err) {
                  console.error(
                    `Error fetching URI for token ${tokenId}:`,
                    err,
                  );
                  throw new Error(`Failed to fetch URI for token ${tokenId}`);
                }

                if (!uri) {
                  console.warn(`Empty URI for token ${tokenId}`);
                  return {
                    tokenId: tokenId.toString(),
                    owner: 'Unknown',
                    uri: '',
                    name: `NFT #${tokenId}`,
                    description: 'URI is not set',
                  };
                }

                // メタデータを取得
                const metadata = await fetchMetadata(uri);

                // 画像URLもIPFSゲートウェイを使用するように変換
                const imageUrl = metadata.image
                  ? await convertIpfsToGatewayUrl(metadata.image)
                  : undefined;

                return {
                  tokenId: tokenId.toString(),
                  owner: 'Unknown',
                  uri: await convertIpfsToGatewayUrl(uri),
                  imageUrl,
                  name: metadata.name || `NFT #${tokenId}`,
                  description:
                    metadata.description || 'No description available',
                };
              } catch (err) {
                console.error(`Error fetching NFT #${tokenId}:`, err);
                return {
                  tokenId: tokenId.toString(),
                  owner: 'Unknown',
                  uri: '',
                  name: `NFT #${tokenId}`,
                  description: 'Failed to fetch metadata',
                };
              }
            })();

            batchPromises.push(promise);
          }

          // バッチごとに実行
          const batchResults = await Promise.all(batchPromises);
          nftResults.push(...batchResults);

          // バッチ間で少し待機してリソースを節約
          if (batch < batches - 1) {
            await new Promise((resolve) => setTimeout(resolve, 100));
          }
        }

        // トークンIDで降順に並べ替え（新しい順）
        const sortedNFTs = nftResults.sort((a, b) => {
          return Number.parseInt(b.tokenId) - Number.parseInt(a.tokenId);
        });
        setNFTs(sortedNFTs);
        setError(null);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('An error occurred while fetching NFTs.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [shouldFetch, contract, totalSupply]);

  return {
    nfts,
    loading,
    error,
  };
};
