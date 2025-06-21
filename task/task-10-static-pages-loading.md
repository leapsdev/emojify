# タスク10: 静的ページのローディング実装

## 目的
静的ページ（利用規約、プライバシーポリシー、リフレッシュページ）で統一ローディングコンポーネントを使用し、ページ読み込み状態を適切に表示する。

## 実装ファイル
- `src/app/(main)/(static)/loading.tsx`
- `src/app/(main)/(static)/terms/loading.tsx`
- `src/app/(main)/(static)/privacy-policy/loading.tsx`
- `src/app/refresh/loading.tsx`

## 対象ページ
- `/terms` (利用規約ページ)
- `/privacy-policy` (プライバシーポリシーページ)
- `/refresh` (リフレッシュページ)

## 要件
- 静的ページのローディング状態管理
- コンテンツ読み込み時のローディング表示
- 適切なサイズとスタイリング
- 軽量なローディング表示
- **コメント以外のテキストは英語で統一**

## 実装内容

### 1. 静的ページレイアウトのローディング
```typescript
// src/app/(main)/(static)/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * 静的ページレイアウトのローディングコンポーネント
 * 
 * 静的ページ全体のローディング状態を管理します。
 * ページ読み込み中に表示されます。
 */
export default function StaticPagesLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="md" 
        text="Loading page..." 
      />
    </div>
  );
}
```

### 2. 利用規約ページのローディング
```typescript
// src/app/(main)/(static)/terms/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * 利用規約ページのローディングコンポーネント
 * 
 * 利用規約コンテンツの読み込み状態を管理します。
 * 利用規約読み込み中に表示されます。
 */
export default function TermsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="md" 
        text="Loading terms of service..." 
      />
    </div>
  );
}
```

### 3. プライバシーポリシーページのローディング
```typescript
// src/app/(main)/(static)/privacy-policy/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * プライバシーポリシーページのローディングコンポーネント
 * 
 * プライバシーポリシーコンテンツの読み込み状態を管理します。
 * プライバシーポリシー読み込み中に表示されます。
 */
export default function PrivacyPolicyLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="md" 
        text="Loading privacy policy..." 
      />
    </div>
  );
}
```

### 4. リフレッシュページのローディング
```typescript
// src/app/refresh/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * リフレッシュページのローディングコンポーネント
 * 
 * ページ更新処理のローディング状態を管理します。
 * ページ更新中に表示されます。
 */
export default function RefreshLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="md" 
        text="Refreshing page..." 
      />
    </div>
  );
}
```

## 実装手順

### 1. 静的ページレイアウトローディングの実装
- `src/app/(main)/(static)/loading.tsx`の作成
- 静的ページ全体のローディング状態
- 適切なメッセージの設定

### 2. 利用規約ページローディングの実装
- `src/app/(main)/(static)/terms/loading.tsx`の作成
- 利用規約コンテンツ読み込み時のローディング状態
- 適切なメッセージの設定

### 3. プライバシーポリシーページローディングの実装
- `src/app/(main)/(static)/privacy-policy/loading.tsx`の作成
- プライバシーポリシーコンテンツ読み込み時のローディング状態
- 適切なメッセージの設定

### 4. リフレッシュページローディングの実装
- `src/app/refresh/loading.tsx`の作成
- ページ更新処理時のローディング状態
- 適切なメッセージの設定

### 5. スタイリングの調整
- 静的ページに適したデザイン
- 背景色とテキスト色の調整
- レスポンシブ対応

### 6. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

## 完了条件
- [ ] `src/app/(main)/(static)/loading.tsx`の実装
- [ ] `src/app/(main)/(static)/terms/loading.tsx`の実装
- [ ] `src/app/(main)/(static)/privacy-policy/loading.tsx`の実装
- [ ] `src/app/refresh/loading.tsx`の実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] 静的ページ特有のメッセージ設定
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応
- [ ] 静的ページでの動作確認

## テスト項目
- 利用規約ページでのローディング表示
- プライバシーポリシーページでのローディング表示
- リフレッシュページでのローディング表示
- コンテンツ読み込み時のローディング表示
- 異なるデバイスでの表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- 静的ページの読み込み時間を考慮
- 軽量なローディング表示の実装
- ユーザー体験の最適化
- 既存の静的ページコンポーネントとの整合性

## 参考実装例
```typescript
// 静的ページ共通のローディングスタイル
const staticPagesLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-background",
  size: "md" as const
};

// 利用規約専用のローディングスタイル
const termsLoadingStyle = {
  ...staticPagesLoadingStyle,
  message: "Loading terms of service..."
};

// プライバシーポリシー専用のローディングスタイル
const privacyPolicyLoadingStyle = {
  ...staticPagesLoadingStyle,
  message: "Loading privacy policy..."
};

// リフレッシュ専用のローディングスタイル
const refreshLoadingStyle = {
  ...staticPagesLoadingStyle,
  message: "Refreshing page..."
};
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- 静的ページシステム
- Tailwind CSS 