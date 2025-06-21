# タスク9: プロフィール管理ページのローディング実装

## 目的
プロフィール管理関連ページ（作成・編集）で統一ローディングコンポーネントを使用し、プロフィール処理のローディング状態を適切に表示する。

## 実装ファイル
- `src/app/(main)/profile/create/loading.tsx`
- `src/app/(main)/profile/edit/loading.tsx`

## 対象ページ
- `/profile/create` (プロフィール作成ページ)
- `/profile/edit` (プロフィール編集ページ)

## 要件
- プロフィール作成・編集フローのローディング状態管理
- プロフィール保存処理時のローディング表示
- 画像アップロード時のローディング表示
- 適切なサイズとスタイリング
- **コメント以外のテキストは英語で統一**

## 実装内容

### 1. プロフィール作成ページのローディング
```typescript
// src/app/(main)/profile/create/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * プロフィール作成ページのローディングコンポーネント
 * 
 * プロフィール作成フロー全体のローディング状態を管理します。
 * プロフィール作成処理中に表示されます。
 */
export default function ProfileCreateLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="lg" 
        text="Creating profile..." 
      />
    </div>
  );
}
```

### 2. プロフィール編集ページのローディング
```typescript
// src/app/(main)/profile/edit/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * プロフィール編集ページのローディングコンポーネント
 * 
 * プロフィール編集フロー全体のローディング状態を管理します。
 * プロフィール更新処理中に表示されます。
 */
export default function ProfileEditLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="lg" 
        text="Updating profile..." 
      />
    </div>
  );
}
```

## 実装手順

### 1. プロフィール作成ページローディングの実装
- `src/app/(main)/profile/create/loading.tsx`の作成
- プロフィール作成フロー全体のローディング状態
- 適切なメッセージの設定

### 2. プロフィール編集ページローディングの実装
- `src/app/(main)/profile/edit/loading.tsx`の作成
- プロフィール編集フロー全体のローディング状態
- 適切なメッセージの設定

### 3. スタイリングの調整
- プロフィール管理ページに適したデザイン
- 背景色とテキスト色の調整
- レスポンシブ対応

### 4. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

### 5. 画像アップロード処理との連携
- プロフィール画像アップロード時のローディング表示
- データベース保存処理時のローディング表示
- エラーハンドリングとの連携

## 完了条件
- [ ] `src/app/(main)/profile/create/loading.tsx`の実装
- [ ] `src/app/(main)/profile/edit/loading.tsx`の実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] プロフィール管理特有のメッセージ設定
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応
- [ ] プロフィール作成・編集フローでの動作確認
- [ ] 画像アップロード時のローディング表示確認

## テスト項目
- プロフィール作成ページでのローディング表示
- プロフィール編集ページでのローディング表示
- 画像アップロード時のローディング表示
- プロフィール保存処理時のローディング表示
- 異なるデバイスでの表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- プロフィール保存処理の時間を考慮
- 画像アップロードの時間を考慮
- データベース処理の時間を考慮
- ユーザー体験の最適化
- 既存のプロフィール管理コンポーネントとの整合性

## 参考実装例
```typescript
// プロフィール管理ページ共通のローディングスタイル
const profileManagementLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-background",
  size: "lg" as const
};

// プロフィール作成専用のローディングスタイル
const profileCreateLoadingStyle = {
  ...profileManagementLoadingStyle,
  message: "Creating profile..."
};

// プロフィール編集専用のローディングスタイル
const profileEditLoadingStyle = {
  ...profileManagementLoadingStyle,
  message: "Updating profile..."
};

// 処理段階別のメッセージ
const processingMessages = {
  imageUpload: "Uploading image...",
  save: "Saving profile...",
  complete: "Save complete!"
};
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- プロフィール管理システム
- 画像アップロードシステム
- データベースシステム
- Tailwind CSS 