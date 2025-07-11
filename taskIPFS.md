# IPFSアップロード機能: nft.storage HTTP APIへの移行

## 概要
EmojiChatプロジェクトのIPFS/NFTストレージ機能を、nft.storageのHTTP API（APIキー認証）を用いた実装に置き換える。

---

## 1. 影響範囲

- `src/components/features/create-emoji/hooks/useIPFS.ts`
  - ファイル/メタデータのアップロード処理をHTTP API呼び出しに変更
- `src/components/features/explore/hooks/useExploreNFTs.ts`
  - IPFS URL変換処理は共通化
- `src/components/features/profile/hooks/useProfileNFTs.ts`
  - IPFS URL変換処理は共通化
- `src/lib/ipfs-utils.ts`
  - IPFS→HTTP変換関数の共通化

---

## 2. 必要な環境変数

`.env.local`に以下を追加
```
NFT_STORAGE_API_KEY=your_api_key_here
```

---

## 3. 実装例

### 3.1 ファイルアップロード（HTTP API）

```typescript
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
```

### 3.2 メタデータアップロード

```typescript
export async function uploadMetadataToIPFS(metadata: object): Promise<string> {
  const blob = new Blob([JSON.stringify(metadata)], { type: 'application/json' });
  const file = new File([blob], 'metadata.json');
  return await uploadToIPFS(file);
}
```

---

## 4. IPFS URL変換の共通化

`src/lib/ipfs-utils.ts`にて
```typescript
export const convertIpfsToGatewayUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  if (ipfsUrl.startsWith('ipfs://')) {
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return ipfsUrl;
};
```

## 5. 注意事項

- **APIキーを使ったnft.storageへのアップロード処理は、必ずサーバーサイド（例: Next.jsのServer ActionsやAPI Routeなど）で実行してください。クライアントサイドでAPIキーを扱う実装は絶対に避けてください。**
- APIキーの漏洩に注意（サーバーサイドでのみ利用推奨）
- アップロードサイズ制限やレートリミットに注意
- 既存データの互換性は維持

---

## 6. 完了条件

- [x] HTTP APIによるアップロード実装
- [x] 共通ユーティリティの整理
- [x] ドキュメント更新