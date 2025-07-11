export async function uploadToIPFS(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch('https://api.nft.storage/upload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.NFT_STORAGE_API_KEY}`,
    },
    body: formData,
  });

  if (!res.ok) throw new Error('Upload failed');
  const data = await res.json();
  return `ipfs://${data.value.cid}`;
}

export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
  const blob = new Blob([JSON.stringify(metadata)], {
    type: 'application/json',
  });
  const file = new File([blob], 'metadata.json');
  return await uploadToIPFS(file);
}
