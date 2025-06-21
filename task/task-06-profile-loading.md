# タスク6: ページ固有ローディングの実装（プロフィール）

## 目的
プロフィールページ専用のローディングファイルを作成する。

## 実装ファイル
- `src/app/(main)/profile/loading.tsx`

## 要件
- プロフィールページ固有のローディングUI
- 既存の統一ローディングコンポーネントの使用
- プロフィールページのレイアウトに合わせたデザイン

## 実装内容

### コンポーネント構造
```typescript
export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading 
        size="lg" 
        variant="spinner" 
        text="プロフィールを読み込み中..." 
      />
    </div>
  );
}
```

### スタイリング要件
- プロフィールページのレイアウトに合わせたデザイン
- 適切な背景色とテキスト色
- レスポンシブデザイン対応

## 実装手順

### 1. 基本ファイル構造の作成
- profile/loading.tsxファイルの作成
- デフォルトエクスポートの実装

### 2. プロフィールページ固有のレイアウト実装
- プロフィールページのレイアウトに合わせた配置
- 適切な背景色の設定

### 3. 統一ローディングコンポーネントの使用
- Loading.tsxコンポーネントのインポート
- プロフィールページに適したサイズとバリアントの設定
- プロフィール固有のテキストの設定

### 4. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

## 完了条件
- [ ] profile/loading.tsxファイルの実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] プロフィールページ固有のレイアウト実装
- [ ] アクセシビリティ対応
- [ ] プロフィールページでの動作確認

## テスト項目
- プロフィールページ遷移時のローディング表示
- プロフィールデータ取得時のローディング表示
- 異なるデバイスでの表示確認

## 注意事項
- プロフィールページの既存レイアウトとの整合性
- パフォーマンスを考慮した実装
- 既存のプロフィール機能への影響がないことの確認

## 参考実装例
```typescript
import { Loading } from '@/components/ui/Loading';

export default function ProfileLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="text-center">
        <Loading 
          size="lg" 
          variant="spinner" 
          text="プロフィールを読み込み中..." 
          className="mb-4"
        />
        <p className="text-gray-600 text-sm">
          ユーザー情報を取得しています...
        </p>
      </div>
    </div>
  );
}
```

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- プロフィールページの既存レイアウト 