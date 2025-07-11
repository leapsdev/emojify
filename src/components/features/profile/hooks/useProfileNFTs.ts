import { convertIpfsToGatewayUrl } from '@/lib/ipfs-utils';
import { EMOJI_CONTRACT_ADDRESS } from '@/lib/thirdweb';
import { useContract, useContractRead } from '@thirdweb-dev/react';
import { useEffect, useState } from 'react';

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

async function fetchMetadata(uri: string): Promise<NFTMetadata> {
  try {
    const httpUrl = await convertIpfsToGatewayUrl(uri);
    console.log('Fetching metadata from:', httpUrl);
    const response = await fetch(httpUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch metadata: ${response.statusText}`);
    }
    const metadata = await response.json();
    console.log('Fetched metadata:', metadata);
    return metadata;
  } catch (error) {
    console.error('Error fetching metadata:', error);
    return {};
  }
}

export function useProfileNFTs(address?: string) {
  const [nfts, setNFTs] = useState<NFT[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { contract } = useContract(EMOJI_CONTRACT_ADDRESS);

  const { data: totalSupply } = useContractRead(contract, 'totalSupply');

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!contract || !totalSupply || !address) return;

      try {
        setLoading(true);
        const nftPromises: Promise<NFT | null>[] = [];

        // 各NFTの情報を取得
        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = i + 1;
          const promise = (async () => {
            try {
              // balanceOfをチェックして、アドレスがNFTを所有しているか確認
              const balance = await contract.call('balanceOf', [
                address,
                tokenId,
              ]);
              if (Number(balance) === 0) return null;

              let uri: string;
              try {
                uri = await contract.call('uri', [tokenId]);
                console.log(`Token ${tokenId} URI:`, uri);
              } catch (err) {
                console.error(`Error fetching URI for token ${tokenId}:`, err);
                throw new Error(`Failed to fetch URI for token ${tokenId}`);
              }

              if (!uri) {
                console.warn(`Empty URI for token ${tokenId}`);
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
              console.log(`Token ${tokenId} metadata:`, metadata);

              // 画像URLもIPFSゲートウェイを使用するように変換
              const imageUrl = metadata.image
                ? await convertIpfsToGatewayUrl(metadata.image)
                : undefined;
              console.log(`Token ${tokenId} image URL:`, imageUrl);

              return {
                tokenId: tokenId.toString(),
                owner: address,
                uri: await convertIpfsToGatewayUrl(uri),
                imageUrl,
                name: metadata.name || `NFT #${tokenId}`,
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
        console.log('Filtered NFTs:', filteredNFTs);
        setNFTs(filteredNFTs);
        setError(null);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('NFTの取得中にエラーが発生しました。');
      } finally {
        setLoading(false);
      }
    };

    fetchNFTs();
  }, [contract, totalSupply, address]);

  return {
    nfts,
    loading,
    error,
  };
}
