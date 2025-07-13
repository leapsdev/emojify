import type { NFTData } from '@/components/features/explore/types';
import { fetchFromIpfsGateways, ipfsToHttp } from '@/lib/ipfsGateway';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useContract, useContractRead } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';

export interface NFT extends NFTData {
  owner: string;
  uri: string;
  description?: string;
}

interface NFTMetadata {
  name?: string;
  description?: string;
  image?: string;
  [key: string]: unknown;
}

async function fetchMetadata(uri: string): Promise<NFTMetadata> {
  try {
    const res = await fetchFromIpfsGateways(uri);
    const metadata = await res.json();
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata from all IPFS gateways:', error);
    return {};
  }
}

export function useGlobalNFTs() {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);

  const { data: totalSupply } = useContractRead(contract, 'totalSupply');

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!contract || !totalSupply) return;

      try {
        setLoading(true);
        const nftPromises: Promise<NFT | null>[] = [];

        // 各NFTの情報を取得
        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = i + 1;
          const promise = (async () => {
            try {
              let uri: string;
              try {
                uri = await contract.call('uri', [tokenId]);
              } catch (err) {
                console.error(`Error fetching URI for token ${tokenId}:`, err);
                throw new Error(`Failed to fetch URI for token ${tokenId}`);
              }

              if (!uri) {
                return {
                  tokenId: tokenId.toString(),
                  name: `NFT #${tokenId}`,
                  imageUrl: '/placeholder.svg',
                  owner: '',
                  uri: '',
                  description: 'URI is not set',
                } as NFT;
              }

              // メタデータを取得
              const metadata = await fetchMetadata(uri);

              // 画像URLもIPFSゲートウェイを使用するように変換
              const imageUrl = metadata.image
                ? ipfsToHttp(metadata.image)
                : '/placeholder.svg';

              return {
                tokenId: tokenId.toString(),
                name: metadata.name || `NFT #${tokenId}`,
                imageUrl,
                owner: '',
                uri: ipfsToHttp(uri),
                description: metadata.description || 'No description available',
              } as NFT;
            } catch (err) {
              console.error(`Error fetching NFT #${tokenId}:`, err);
              return null;
            }
          })();

          nftPromises.push(promise);
        }

        const nftResults = await Promise.all(nftPromises);
        const filteredNFTs = nftResults.filter(
          (nft): nft is NFT => nft !== null,
        );
        setNFTs(filteredNFTs);
        setError(null);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('An error occurred while fetching NFTs.');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [contract, totalSupply]);

  return {
    nfts,
    loading,
    error,
  };
}
