# IPFS置き換えタスク: ThirdwebからNFT.Storageへの移行

## 概要
EmojiChatプロジェクトでIPFS実装をThirdwebからNFT.Storageに置き換えるタスクの詳細内容。

## 重要な注意事項
**2024年6月30日にNFT.Storage Classicのアップロード機能が停止されました。**
代替案として以下のサービスを検討する必要があります：
- **Web3.Storage** (推奨)
- **Filebase**
- **Lighthouse Storage**

## 現在の実装状況

### 影響を受けるファイル
1. **`src/components/features/create-emoji/hooks/useIPFS.ts`** - メインのIPFS処理
2. **`src/components/features/chat/chat-room/hooks/useGlobalNFTs.ts`** - IPFS URL変換
3. **`src/components/features/explore/hooks/useExploreNFTs.ts`** - IPFS URL変換
4. **`src/components/features/profile/hooks/useProfileNFTs.ts`** - IPFS URL変換
5. **`src/components/features/create-emoji/CreateEmojiForm.tsx`** - useIPFS利用
6. **`src/components/pages/CollectEmojiPage.tsx`** - IPFS関連表示

### 現在の実装パターン
- **Thirdweb Storage**を使用したファイルアップロード
- **IPFS URL**から**HTTP URL**への変換
- **メタデータ**のIPFSアップロード

## 推奨移行先: Web3.Storage

### Web3.Storageの特徴
- **料金**: 無料プラン（5GB）、有料プラン（$10/月〜）
- **技術**: IPFS + Filecoin
- **パフォーマンス**: 高速な読み書き
- **互換性**: S3互換API

### 必要なライブラリ
```bash
pnpm add web3.storage
pnpm remove @thirdweb-dev/storage
```

## 実装タスク詳細

### 1. 環境変数設定
```env
# .env.local に追加
WEB3_STORAGE_API_TOKEN=your_api_token_here
```

### 2. useIPFS.tsの書き換え

**現在の実装**:
```typescript
import { ThirdwebStorage } from '@thirdweb-dev/storage';

const storage = new ThirdwebStorage({
  clientId: CLIENT_ID,
});

export const useIPFS = () => {
  const uploadToIPFS = async (file: File): Promise<string> => {
    const uri = await storage.upload(file);
    return uri;
  };
  
  const uploadMetadataToIPFS = async (imageUrl: string, creatorAddress: string) => {
    const metadata = {
      name: '',
      description: '',
      image: imageUrl,
      attributes: [{ trait_type: 'creator', value: creatorAddress }],
    };
    const metadataUrl = await storage.upload(metadata);
    return metadataUrl;
  };
};
```

**新しい実装**:
```typescript
import { Web3Storage } from 'web3.storage';

const storage = new Web3Storage({ 
  token: process.env.WEB3_STORAGE_API_TOKEN! 
});

export const useIPFS = () => {
  const uploadToIPFS = async (file: File): Promise<string> => {
    const cid = await storage.put([file]);
    return `ipfs://${cid}/${file.name}`;
  };
  
  const uploadMetadataToIPFS = async (imageUrl: string, creatorAddress: string) => {
    const metadata = {
      name: '',
      description: '',
      image: imageUrl,
      attributes: [{ trait_type: 'creator', value: creatorAddress }],
    };
    const metadataBlob = new Blob([JSON.stringify(metadata)], { 
      type: 'application/json' 
    });
    const metadataFile = new File([metadataBlob], 'metadata.json');
    const cid = await storage.put([metadataFile]);
    return `ipfs://${cid}/metadata.json`;
  };
};
```

### 3. IPFS URL変換の統一

**現在の実装** (各ファイルで重複):
```typescript
async function convertIpfsToGatewayUrl(ipfsUrl: string): Promise<string> {
  if (!ipfsUrl) return '';
  if (ipfsUrl.startsWith('ipfs://')) {
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return ipfsUrl;
}
```

**新しい統一実装**:
```typescript
// src/lib/ipfs-utils.ts (新規作成)
export const convertIpfsToGatewayUrl = (ipfsUrl: string): string => {
  if (!ipfsUrl) return '';
  if (ipfsUrl.startsWith('ipfs://')) {
    const ipfsHash = ipfsUrl.replace('ipfs://', '');
    return `https://ipfs.io/ipfs/${ipfsHash}`;
  }
  return ipfsUrl;
};

export const getReliableIpfsUrl = async (ipfsUrl: string): Promise<string> => {
  const gateways = [
    'https://ipfs.io/ipfs/',
    'https://cloudflare-ipfs.com/ipfs/',
    'https://gateway.pinata.cloud/ipfs/',
  ];
  
  const hash = ipfsUrl.replace('ipfs://', '');
  
  for (const gateway of gateways) {
    try {
      const response = await fetch(`${gateway}${hash}`, { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      if (response.ok) {
        return `${gateway}${hash}`;
      }
    } catch (error) {
      continue;
    }
  }
  
  return `https://ipfs.io/ipfs/${hash}`;
};
```

### 4. 各ファイルの更新内容

#### `useGlobalNFTs.ts`
```typescript
import { convertIpfsToGatewayUrl } from '@/lib/ipfs-utils';

// convertIpfsToGatewayUrl関数を削除し、共通ライブラリを使用
```

#### `useExploreNFTs.ts`
```typescript
import { convertIpfsToGatewayUrl, getReliableIpfsUrl } from '@/lib/ipfs-utils';

// 重複コードを削除し、共通ライブラリを使用
// 複数ゲートウェイ対応を追加
```

#### `useProfileNFTs.ts`
```typescript
import { convertIpfsToGatewayUrl } from '@/lib/ipfs-utils';

// convertIpfsToGatewayUrl関数を削除し、共通ライブラリを使用
```

### 5. 環境変数とドキュメント更新

#### `README.md`更新
```markdown
# Web3.Storage configuration
WEB3_STORAGE_API_TOKEN=your_api_token_here
```

#### `.env.example`作成/更新
```env
# Web3.Storage configuration
WEB3_STORAGE_API_TOKEN=your_api_token_here
```

## 実装手順

### Step 1: 依存関係の更新
```bash
pnpm add web3.storage
pnpm remove @thirdweb-dev/storage
```

### Step 2: 環境変数設定
1. Web3.Storageでアカウント作成
2. APIトークン取得
3. `.env.local`に追加

### Step 3: 共通ライブラリ作成
1. `src/lib/ipfs-utils.ts`を作成
2. IPFS URL変換関数を統一

### Step 4: useIPFS.tsの書き換え
1. Web3.Storageライブラリに移行
2. アップロード処理を更新

### Step 5: 各ファイルの更新
1. 重複コードを削除
2. 共通ライブラリを使用
3. エラーハンドリング強化

### Step 6: テストと検証
1. 絵文字作成機能のテスト
2. 既存NFTの表示確認
3. IPFS URL変換の動作確認

## 注意事項

### 1. 既存データの互換性
- 既存のIPFS URLは変更されない
- 新しいアップロードのみWeb3.Storageを使用

### 2. エラーハンドリング
- ネットワークエラー対応
- APIレート制限対応
- フォールバック機能

### 3. パフォーマンス
- 複数ゲートウェイでの冗長性
- タイムアウト設定
- キャッシュ機能

### 4. セキュリティ
- APIトークンの適切な管理
- 環境変数の設定
- エラーメッセージでの機密情報漏洩防止

## 完了条件

- [x] 現在の実装調査完了
- [x] 移行先サービス選定完了
- [ ] Web3.Storageライブラリ導入
- [ ] useIPFS.ts書き換え完了
- [ ] 共通ライブラリ作成完了
- [ ] 各ファイル更新完了
- [ ] 環境変数設定完了
- [ ] テスト完了
- [ ] ドキュメント更新完了

## 推定作業時間
- **実装**: 4-6時間
- **テスト**: 2-3時間
- **ドキュメント**: 1時間
- **総計**: 7-10時間

## 追加検討事項

### 代替サービス比較
1. **Web3.Storage**: 推奨、無料プランあり
2. **Filebase**: より多くの無料ストレージ
3. **継続使用**: Thirdweb Storage（現状維持）

### 将来的な拡張
- 複数ストレージプロバイダー対応
- 自動冗長化機能
- 使用量モニタリング