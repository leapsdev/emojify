# タスク7: フレンド選択ページのローディング実装

## 目的
フレンド選択関連ページで統一ローディングコンポーネントを使用し、ユーザーリストの読み込み状態を適切に表示する。

## 実装ファイル
- `src/app/(main)/choose-friends/loading.tsx`
- `src/app/(main)/choose-friends/(list)/loading.tsx`
- `src/app/(main)/choose-friends/(other-profile)/[id]/loading.tsx`

## 対象ページ
- `/choose-friends` (フレンド選択リスト)
- `/choose-friends/[id]` (他のユーザープロフィール)

## 要件
- フレンド選択フローのローディング状態管理
- ユーザーリスト取得時のローディング表示
- プロフィール詳細取得時のローディング表示
- 適切なサイズとスタイリング
- **コメント以外のテキストは英語で統一**

## 実装内容

### 1. フレンド選択レイアウトのローディング
```typescript
// src/app/(main)/choose-friends/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * フレンド選択レイアウトのローディングコンポーネント
 * 
 * フレンド選択フロー全体のローディング状態を管理します。
 * フレンド検索中に表示されます。
 */
export default function ChooseFriendsLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="lg" 
        text="Searching for friends..." 
      />
    </div>
  );
}
```

### 2. フレンドリストのローディング
```typescript
// src/app/(main)/choose-friends/(list)/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * フレンドリストのローディングコンポーネント
 * 
 * ユーザーリスト取得時のローディング状態を管理します。
 * リスト表示中に表示されます。
 */
export default function FriendsListLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="md" 
        text="Loading user list..." 
      />
    </div>
  );
}
```

### 3. 他のユーザープロフィールのローディング
```typescript
// src/app/(main)/choose-friends/(other-profile)/[id]/loading.tsx
import { Loading } from '@/components/ui/Loading';

/**
 * 他のユーザープロフィールのローディングコンポーネント
 * 
 * プロフィール詳細取得時のローディング状態を管理します。
 * プロフィール読み込み中に表示されます。
 */
export default function OtherProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Loading 
        size="lg" 
        text="Loading profile..." 
      />
    </div>
  );
}
```

## 実装手順

### 1. フレンド選択レイアウトローディングの実装
- `src/app/(main)/choose-friends/loading.tsx`の作成
- フレンド選択フロー全体のローディング状態
- 適切なメッセージの設定

### 2. フレンドリストローディングの実装
- `src/app/(main)/choose-friends/(list)/loading.tsx`の作成
- ユーザーリスト取得時のローディング状態
- リスト表示中のメッセージ

### 3. 他のユーザープロフィールローディングの実装
- `src/app/(main)/choose-friends/(other-profile)/[id]/loading.tsx`の作成
- プロフィール詳細取得時のローディング状態
- プロフィール読み込み中のメッセージ

### 4. スタイリングの調整
- フレンド選択ページに適したデザイン
- 背景色とテキスト色の調整
- レスポンシブ対応

### 5. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

## 完了条件
- [ ] `src/app/(main)/choose-friends/loading.tsx`の実装
- [ ] `src/app/(main)/choose-friends/(list)/loading.tsx`の実装
- [ ] `src/app/(main)/choose-friends/(other-profile)/[id]/loading.tsx`の実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] フレンド選択特有のメッセージ設定
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応
- [ ] フレンド選択フローでの動作確認

## テスト項目
- フレンド選択ページでのローディング表示
- ユーザーリスト取得時のローディング表示
- プロフィール詳細取得時のローディング表示
- 異なるデバイスでの表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- ユーザーリストの取得時間を考慮
- プロフィール詳細の取得時間を考慮
- ユーザー体験の最適化
- 既存のフレンド選択コンポーネントとの整合性

## 参考実装例
```typescript
// フレンド選択ページ共通のローディングスタイル
const chooseFriendsLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-background",
  message: "Searching for friends...",
  size: "lg" as const
};

// ユーザーリスト専用のローディングスタイル
const friendsListLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-background",
  message: "Loading user list...",
  size: "md" as const
};

// プロフィール詳細専用のローディングスタイル
const profileLoadingStyle = {
  container: "flex items-center justify-center min-h-screen bg-background",
  message: "Loading profile...",
  size: "lg" as const
};
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- フレンド選択システム
- Tailwind CSS 