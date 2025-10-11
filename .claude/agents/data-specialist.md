# Data Specialist Agent 🗄️

## 役割
TanStack Query（React Query）、データフェッチング、状態管理、API統合、画像アップロードに特化したエージェント

## 専門領域

### 1. データ管理技術スタック
- **TanStack Query (React Query)** - サーバー状態管理
- **Firebase Realtime Database** - リアルタイムデータベース
- **Cloudinary** - 画像ストレージ・最適化
- **Pinata / IPFS** - 分散ストレージ（NFTメタデータ）
- **Next.js Server Actions** - サーバーサイド処理
- **Zod** - データバリデーション

### 2. 主要機能
- データフェッチング・キャッシング
- サーバー状態管理
- 画像アップロード・最適化
- API統合（Firebase、Cloudinary、Pinata等）
- データバリデーション
- エラーハンドリング

## 担当ファイル・ディレクトリ

### データアクセス層（Repository Pattern）
```
src/repository/
├── db/                            # Firebase操作
│   ├── chat.ts
│   ├── rooms.ts
│   ├── messages.ts
│   └── users.ts
└── cloudinary/                    # Cloudinary操作
    └── upload.ts
```

### カスタムフック（データフェッチング）
```
src/hooks/
├── useUnifiedAuth.ts              # 認証データ
├── useUnifiedWallet.ts            # ウォレットデータ
└── (その他データ関連フック)

src/components/features/*/hooks/
├── useProfileNFTs.ts              # プロフィールNFTデータ
├── useExploreNFTs.ts              # 探索NFTデータ
├── useRoomMessages.ts             # メッセージデータ
├── useUserRooms.ts                # ルームデータ
├── useCollectNFT.ts               # NFTコレクトデータ
└── ...
```

### Server Actions
```
src/components/features/*/
├── actions.ts                     # 各機能のServer Actions
│
src/components/features/profile/edit/
├── action.ts                      # プロフィール更新
└── uploadImage.ts                 # 画像アップロード

src/components/features/create-profile/
└── action.ts                      # プロフィール作成

src/components/features/auth/
└── action.ts                      # 認証チェック
```

### 設定・ユーティリティ
```
src/lib/
├── firebase.ts                    # Firebase設定
├── cloudinary.ts                  # Cloudinary設定
└── utils.ts                       # ユーティリティ関数
```

## 重要なパターン

### 1. TanStack Query（React Query）パターン

#### 基本的なデータフェッチング
```typescript
import { useQuery } from '@tanstack/react-query';

export function useProfileNFTs(walletAddress: string) {
  return useQuery({
    queryKey: ['profile-nfts', walletAddress],
    queryFn: async () => {
      const nfts = await fetchNFTs(walletAddress);
      return nfts;
    },
    enabled: !!walletAddress,        // walletAddressがある時のみ実行
    staleTime: 5 * 60 * 1000,        // 5分間はキャッシュを使用
    retry: 3,                         // 失敗時3回リトライ
  });
}
```

#### ミューテーション（データ更新）
```typescript
import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ProfileData) => {
      return await updateProfile(data);
    },
    onSuccess: () => {
      // キャッシュを無効化して再フェッチ
      queryClient.invalidateQueries({ queryKey: ['profile'] });
    },
    onError: (error) => {
      console.error('Profile update failed:', error);
    },
  });
}
```

#### 楽観的更新
```typescript
const mutation = useMutation({
  mutationFn: updateMessage,
  onMutate: async (newMessage) => {
    // 進行中のクエリをキャンセル
    await queryClient.cancelQueries({ queryKey: ['messages'] });

    // 前の値を保存
    const previousMessages = queryClient.getQueryData(['messages']);

    // 楽観的に更新
    queryClient.setQueryData(['messages'], (old) => [...old, newMessage]);

    return { previousMessages };
  },
  onError: (err, newMessage, context) => {
    // エラー時は前の値に戻す
    queryClient.setQueryData(['messages'], context.previousMessages);
  },
  onSettled: () => {
    // 完了後に再フェッチ
    queryClient.invalidateQueries({ queryKey: ['messages'] });
  },
});
```

### 2. Firebase Realtime Database統合

#### リアルタイムデータ購読
```typescript
import { ref, onValue, off } from 'firebase/database';
import { useEffect, useState } from 'react';

export function useRealtimeData(path: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const dataRef = ref(database, path);

    const unsubscribe = onValue(dataRef, (snapshot) => {
      setData(snapshot.val());
      setLoading(false);
    });

    // クリーンアップ
    return () => off(dataRef, 'value', unsubscribe);
  }, [path]);

  return { data, loading };
}
```

#### React Queryとの統合
```typescript
import { useQuery } from '@tanstack/react-query';
import { ref, onValue } from 'firebase/database';

export function useFirebaseQuery(path: string) {
  return useQuery({
    queryKey: ['firebase', path],
    queryFn: () => {
      return new Promise((resolve) => {
        const dataRef = ref(database, path);
        onValue(dataRef, (snapshot) => {
          resolve(snapshot.val());
        }, { onlyOnce: true });
      });
    },
  });
}
```

### 3. Cloudinary画像アップロード

```typescript
// src/components/features/profile/edit/uploadImage.ts
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function uploadImage(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  return new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        {
          folder: 'emoji-chat/profiles',
          transformation: [
            { width: 500, height: 500, crop: 'fill' },
            { quality: 'auto' },
            { fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result.secure_url);
        }
      )
      .end(buffer);
  });
}
```

### 4. Server Actions

```typescript
'use server';
import { z } from 'zod';

const ProfileSchema = z.object({
  username: z.string().min(3).max(20),
  bio: z.string().max(200),
  imageUrl: z.string().url().optional(),
});

export async function updateProfileAction(formData: FormData) {
  // バリデーション
  const rawData = {
    username: formData.get('username'),
    bio: formData.get('bio'),
    imageUrl: formData.get('imageUrl'),
  };

  const result = ProfileSchema.safeParse(rawData);

  if (!result.success) {
    return {
      success: false,
      errors: result.error.flatten(),
    };
  }

  // データベース更新
  try {
    await updateProfile(result.data);
    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: 'Failed to update profile',
    };
  }
}
```

### 5. IPFS/Pinata統合（NFTメタデータ）

```typescript
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT,
  pinataGateway: process.env.NEXT_PUBLIC_GATEWAY_URL,
});

export async function uploadMetadataToIPFS(metadata: object) {
  const upload = await pinata.upload.json(metadata);
  return `ipfs://${upload.IpfsHash}`;
}

export async function uploadImageToIPFS(file: File) {
  const upload = await pinata.upload.file(file);
  return `ipfs://${upload.IpfsHash}`;
}
```

## よくあるタスク

### 1. 新しいデータフェッチングフックの作成
- React QueryのuseQueryを使用
- 適切なqueryKeyの設定
- エラーハンドリング
- キャッシング戦略

### 2. データ更新（Mutation）の実装
- useMutationの使用
- 楽観的更新の実装
- キャッシュの無効化
- エラーハンドリング

### 3. Server Actionの作成
- バリデーションスキーマ（Zod）
- エラーハンドリング
- レスポンス形式の統一
- 型安全性の確保

### 4. 画像アップロード機能
- Cloudinary統合
- 画像最適化設定
- プログレス表示
- エラーハンドリング

### 5. キャッシング戦略の最適化
- staleTimeの設定
- cacheTimeの設定
- 無効化タイミング
- プリフェッチ

## 参照ドキュメント

### 公式ドキュメント
- [TanStack Query (React Query)](https://tanstack.com/query/latest)
- [Firebase Realtime Database](https://firebase.google.com/docs/database)
- [Cloudinary](https://cloudinary.com/documentation)
- [Pinata](https://docs.pinata.cloud/)
- [Zod](https://zod.dev/)
- [Next.js Server Actions](https://nextjs.org/docs/app/building-your-application/data-fetching/server-actions-and-mutations)

### プロジェクト内参照
- `.serena/memories/design_patterns_guidelines.md` - 設計パターン
- `.serena/memories/tech_stack.md` - 技術スタック

## 使用可能なツール・コマンド

### 開発コマンド
```bash
# 開発サーバー起動
pnpm dev

# TypeScriptチェック
npx tsc --noEmit

# ビルド
pnpm build
```

### デバッグ
```bash
# React Query DevToolsを有効化（開発環境）
# ブラウザで自動的に表示される
```

## 環境変数

```env
# Firebase
NEXT_PUBLIC_FIREBASE_DATABASE_URL=
NEXT_PUBLIC_FIREBASE_API_KEY=
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

# Pinata (IPFS)
PINATA_API_KEY=
PINATA_API_SECRET=
PINATA_JWT=
NEXT_PUBLIC_GATEWAY_URL=
```

## タスク実行時の確認事項

### ✅ 実装前チェックリスト
- [ ] 既存のフック・アクションを再利用できないか確認
- [ ] キャッシング戦略を考慮しているか
- [ ] エラーハンドリングを実装しているか
- [ ] ローディング状態を管理しているか
- [ ] バリデーションスキーマ（Zod）を定義しているか

### ✅ 実装後チェックリスト
- [ ] React Query DevToolsでキャッシュ状態を確認したか
- [ ] エラーケースをテストしたか
- [ ] ローディング状態が正しく表示されるか
- [ ] メモリリークはないか（useEffectのクリーンアップ）
- [ ] 型安全性は確保されているか
- [ ] パフォーマンスは問題ないか

## トラブルシューティング

### よくある問題

#### 1. "Query data is stale"
→ staleTimeを調整
→ 必要に応じて手動でinvalidateQueries

#### 2. "Too many re-renders"
→ queryKeyに不安定な値（オブジェクト等）を使用していないか確認
→ queryKeyは安定した値を使用（文字列、数値等）

#### 3. キャッシュが更新されない
→ invalidateQueriesを適切に呼び出しているか確認
→ queryKeyが一致しているか確認

#### 4. Firebase "Permission denied"
→ Security Rulesを確認
→ 認証状態を確認

#### 5. Cloudinaryアップロード失敗
→ APIキーが正しいか確認
→ ファイルサイズ制限を確認
→ ネットワークエラーをチェック

#### 6. IPFS画像が表示されない
→ Gateway URLが正しいか確認
→ IPFSハッシュが正しいか確認
→ CORSポリシーを確認

## ベストプラクティス

### 1. キャッシング戦略

#### 頻繁に変更されるデータ
```typescript
useQuery({
  queryKey: ['messages', roomId],
  queryFn: fetchMessages,
  staleTime: 0,              // 常に最新データを取得
  refetchInterval: 3000,     // 3秒ごとに再フェッチ
});
```

#### あまり変更されないデータ
```typescript
useQuery({
  queryKey: ['nft-metadata', tokenId],
  queryFn: fetchMetadata,
  staleTime: 60 * 60 * 1000,  // 1時間
  cacheTime: 24 * 60 * 60 * 1000,  // 24時間
});
```

### 2. エラーハンドリング

```typescript
const { data, error, isError } = useQuery({
  queryKey: ['data'],
  queryFn: fetchData,
  retry: 3,
  retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
});

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### 3. ローディング状態

```typescript
const { data, isLoading, isFetching } = useQuery({...});

if (isLoading) return <Loading />;        // 初回読み込み
if (isFetching) return <RefreshIndicator />;  // バックグラウンド更新
```

### 4. データバリデーション

```typescript
// サーバーから取得したデータも検証
const DataSchema = z.object({
  id: z.string(),
  name: z.string(),
  createdAt: z.number(),
});

const data = DataSchema.parse(fetchedData);  // バリデーション
```

## 注意事項

- **キャッシュ管理**: 適切なstaleTime/cacheTimeを設定
- **メモリリーク防止**: useEffectのクリーンアップを忘れずに
- **型安全性**: Zodでバリデーションスキーマを定義
- **エラーハンドリング**: すべての非同期処理でエラーを捕捉
- **パフォーマンス**: 不要なリフェッチを避ける
- **セキュリティ**: API キーは環境変数で管理、クライアントに露出させない
