export const useIPFS = () => {
  // IPFSアップロード関数（API Route経由）
  const uploadToIPFS = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch('/api/pinata-upload', {
      method: 'POST',
      body: formData,
    });
    if (!res.ok) throw new Error('ファイルのアップロードに失敗しました');
    const data = await res.json();
    return `ipfs://${data.cid}`;
  };

  // IPFSのURLをhttpsに変換する関数（Pinataゲートウェイ優先）
  const ipfsToHttp = (ipfsUrl: string) => {
    const hash = ipfsUrl.replace('ipfs://', '');
    return `https://${process.env.NEXT_PUBLIC_GATEWAY_URL}/ipfs/${hash}`;
  };

  // メタデータをIPFSにアップロード（API Route経由）
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
    const res = await fetch('/api/pinata-upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(metadata),
    });
    if (!res.ok) throw new Error('メタデータのアップロードに失敗しました');
    const data = await res.json();
    return `ipfs://${data.cid}`;
  };

  return {
    uploadToIPFS,
    ipfsToHttp,
    uploadMetadataToIPFS,
  };
};
