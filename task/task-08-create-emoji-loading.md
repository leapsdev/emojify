# タスク13: 絵文字作成ページのローディング実装

## 目的
絵文字作成ページで統一ローディングコンポーネントを使用し、NFT作成処理のローディング状態を適切に表示する。

## 実装ファイル
- `src/app/(main)/create-emoji/loading.tsx`

## 対象ページ
- `/create-emoji` (絵文字作成ページ)

## 要件
- 絵文字作成フローのローディング状態管理
- NFT作成処理時のローディング表示
- IPFSアップロード時のローディング表示
- 適切なサイズとスタイリング

## 実装内容

### 絵文字作成ページのローディング
```typescript
// src/app/(main)/create-emoji/loading.tsx
import { Loading } from '@/components/ui/Loading';

export default function CreateEmojiLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="lg" 
        text="絵文字を作成中..." 
      />
    </div>
  );
}
```

## 実装手順

### 1. 絵文字作成ページローディングの実装
- `src/app/(main)/create-emoji/loading.tsx`の作成
- 絵文字作成フロー全体のローディング状態
- 適切なメッセージの設定

### 2. スタイリングの調整
- 絵文字作成ページに適したデザイン
- 背景色とテキスト色の調整
- レスポンシブ対応

### 3. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

### 4. NFT作成処理との連携
- IPFSアップロード時のローディング表示
- ブロックチェーン処理時のローディング表示
- エラーハンドリングとの連携

## 完了条件
- [ ] `src/app/(main)/create-emoji/loading.tsx`の実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] 絵文字作成特有のメッセージ設定
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応
- [ ] NFT作成フローでの動作確認
- [ ] IPFSアップロード時のローディング表示確認

## テスト項目
- 絵文字作成ページでのローディング表示
- ファイルアップロード時のローディング表示
- NFT作成処理時のローディング表示
- IPFSアップロード時のローディング表示
- 異なるデバイスでの表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- NFT作成処理の時間を考慮
- IPFSアップロードの時間を考慮
- ブロックチェーン処理の時間を考慮
- ユーザー体験の最適化
- 既存の絵文字作成コンポーネントとの整合性

## 参考実装例
```typescript
// 絵文字作成ページのローディングスタイル
const createEmojiLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-background",
  message: "絵文字を作成中...",
  size: "lg" as const
};

// 処理段階別のメッセージ
const processingMessages = {
  upload: "ファイルをアップロード中...",
  ipfs: "IPFSに保存中...",
  nft: "NFTを作成中...",
  complete: "作成完了！"
};
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- NFT作成システム（thirdweb）
- IPFSシステム
- Tailwind CSS 