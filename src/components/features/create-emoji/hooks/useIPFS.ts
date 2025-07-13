import { PinataSDK } from 'pinata';

// PinataSDKインスタンスの初期化
const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL!,
});

export const useIPFS = () => {
  // IPFSアップロード関数（Pinata経由）
  const uploadToIPFS = async (file: File): Promise<string> => {
    const result = await pinata.upload.public.file(file);
    return `ipfs://${result.cid}`;
  };

  // IPFSのURLをhttpsに変換する関数（Pinataゲートウェイ優先）
  const ipfsToHttp = (ipfsUrl: string) => {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`;
  };

  // メタデータをIPFSにアップロード（Pinata経由）
  const uploadMetadataToIPFS = async (
    imageUrl: string,
    creatorAddress: string,
  ) => {
    const metadata = {
      name: '',
      description: '',
      image: imageUrl,
      attributes: [
        {
          trait_type: 'creator',
          value: creatorAddress,
        },
      ],
    };
    const result = await pinata.upload.public.json(metadata);
    return `ipfs://${result.cid}`;
  };

  return {
    uploadToIPFS,
    ipfsToHttp,
    uploadMetadataToIPFS,
  };
};
