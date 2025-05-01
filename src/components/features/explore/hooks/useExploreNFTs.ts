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

// IPFSゲートウェイのURLを定義
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

// IPFSのURLをゲートウェイURLに変換する関数
const convertIpfsToGatewayUrl = async (ipfsUrl: string): Promise<string> => {
  if (!ipfsUrl) return '';

  if (ipfsUrl.startsWith('ipfs://')) {
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    // 最初のゲートウェイで試す
    return `${IPFS_GATEWAYS[0]}${ipfsHash}`;
  }
  return ipfsUrl;
};

// メタデータを取得する関数
const fetchMetadata = async (url: string): Promise<NFTMetadata> => {
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
      return await response.json();
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

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!contract || !totalSupply) return;

      try {
        setLoading(true);
        const nftPromises: Promise<NFT>[] = [];

        // 各NFTの情報を取得
        for (let i = 0; i < Number(totalSupply); i++) {
          const tokenId = i + 1;
          const promise = (async () => {
            try {
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
                  owner: 'Unknown',
                  uri: '',
                  name: `NFT #${tokenId}`,
                  description: 'URIが設定されていません',
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
                description: metadata.description || 'No description available',
              };
            } catch (err) {
              console.error(`Error fetching NFT #${tokenId}:`, err);
              return {
                tokenId: tokenId.toString(),
                owner: 'Unknown',
                uri: '',
                name: `NFT #${tokenId}`,
                description: 'メタデータの取得に失敗しました',
              };
            }
          })();

          nftPromises.push(promise);
        }

        const nftResults = await Promise.all(nftPromises);
        setNFTs(nftResults);
        setError(null);
      } catch (err) {
        console.error('Error fetching NFTs:', err);
        setError('NFTの取得中にエラーが発生しました。');
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
};
