# タスク3: 認証ページのローディング実装

## 目的
認証関連ページ（GetStartedPage、SignUpPage）で統一ローディングコンポーネントを使用し、ユーザーエクスペリエンスを向上させる。

## 実装ファイル
- `src/app/(auth)/loading.tsx`
- `src/app/(auth)/signup/loading.tsx`

## 対象ページ
- `/` (GetStartedPage)
- `/signup` (SignUpPage)

## 要件
- 認証フローのローディング状態管理
- 統一ローディングコンポーネントの使用
- 認証特有のローディングメッセージ（英語）
- 適切なサイズとスタイリング
- **コメント以外のテキストは英語で統一**

## 実装内容

### 1. 認証レイアウトのローディング
```typescript
// src/app/(auth)/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * 認証レイアウトのローディングコンポーネント
 * 
 * 認証関連ページ全体のローディング状態を管理します。
 * 認証情報の確認中やページ遷移時に表示されます。
 */
export default function AuthLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loading 
          size="lg" 
          text="Checking authentication..." 
          className="mb-4"
        />
        <p className="text-gray-600 text-sm">
          Please wait a moment...
        </p>
      </div>
    </div>
  );
}
```

### 2. サインアップページのローディング
```typescript
// src/app/(auth)/signup/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * サインアップページのローディングコンポーネント
 * 
 * サインアップ処理中のローディング状態を管理します。
 * アカウント作成処理中に表示されます。
 */
export default function SignUpLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loading 
          size="lg" 
          text="Creating your account..." 
          className="mb-4"
        />
        <p className="text-gray-600 text-sm">
          Please wait while we set up your account...
        </p>
      </div>
    </div>
  );
}
```

## 実装手順

### 1. 認証レイアウトローディングの実装
- `src/app/(auth)/loading.tsx`の作成
- 認証フロー全体のローディング状態
- 適切なメッセージの設定

### 2. サインアップページローディングの実装
- `src/app/(auth)/signup/loading.tsx`の作成
- サインアップ処理のローディング状態
- ユーザー登録中のメッセージ

### 3. スタイリングの調整
- 認証ページに適したデザイン
- 背景色とテキスト色の調整
- レスポンシブ対応

### 4. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

## 完了条件
- [ ] `src/app/(auth)/loading.tsx`の実装
- [ ] `src/app/(auth)/signup/loading.tsx`の実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] 認証特有のメッセージ設定
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応
- [ ] 認証フローでの動作確認

## テスト項目
- GetStartedPageでのローディング表示
- SignUpPageでのローディング表示
- 認証処理中のローディング表示
- 異なるデバイスでの表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- 認証フローの特殊性を考慮
- セキュリティ関連の処理時間を考慮
- ユーザー体験の最適化
- 既存の認証コンポーネントとの整合性

## 参考実装例
```typescript
// 認証ページ共通のローディングスタイル
const authLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-white",
  message: "Checking authentication...",
  size: "lg" as const
};

// サインアップ専用のローディングスタイル
const signUpLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-white",
  message: "Creating your account...",
  size: "lg" as const
};
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- 認証システム（Privy）
- Tailwind CSS 