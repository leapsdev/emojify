# タスク2: アプリケーション全体のローディングファイル実装

## 目的
Next.js 15のloading.tsxファイルを使用して、アプリケーション全体のローディング状態を管理する。

## 実装ファイル
- `src/app/loading.tsx`

## 要件
- アプリケーション全体のローディング状態
- Suspense境界での使用
- 適切なフォールバックUI
- 統一ローディングコンポーネントの使用
- **コメント以外のテキストは英語で統一**

## 実装内容

### コンポーネント構造
```typescript
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading 
        size="lg" 
        variant="spinner" 
        text="Loading application..." 
      />
    </div>
  );
}
```

### スタイリング要件
- 画面全体をカバーするレイアウト
- 中央配置のローディング表示
- 適切な背景色とテキスト色
- レスポンシブデザイン対応

## 実装手順

### 1. 基本ファイル構造の作成
- loading.tsxファイルの作成
- デフォルトエクスポートの実装

### 2. レイアウトの実装
- フルスクリーンレイアウト
- 中央配置の実装
- 背景色の設定

### 3. 統一ローディングコンポーネントの使用
- Loading.tsxコンポーネントのインポート
- 適切なサイズとバリアントの設定
- テキストの設定

### 4. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

### 5. レスポンシブ対応
- モバイルデバイスでの表示確認
- タブレットデバイスでの表示確認
- デスクトップデバイスでの表示確認

## 完了条件
- [ ] loading.tsxファイルの実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] フルスクリーンレイアウトの実装
- [ ] アクセシビリティ対応
- [ ] レスポンシブ対応
- [ ] Suspense境界での動作確認
- [ ] フォールバックUIの表示確認
- [ ] 英語統一の実装

## テスト項目
- ページ遷移時のローディング表示
- データ取得時のローディング表示
- 異なるデバイスでの表示確認
- スクリーンリーダーでの読み上げ確認

## 注意事項
- Next.js 15のloading.tsx仕様に準拠
- Suspense境界での適切な動作
- パフォーマンスを考慮した実装
- 既存のレイアウトとの整合性

## 参考実装例
```typescript
import { Loading } from '@/components/ui/Loading';

/**
 * アプリケーション全体のローディングコンポーネント
 * 
 * アプリケーション全体のローディング状態を管理します。
 * ページ遷移時やデータ取得時に表示されます。
 */
export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loading 
          size="xl" 
          variant="spinner" 
          text="Loading application..." 
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

## 依存関係
- Next.js 15
- React Suspense
- 統一ローディングコンポーネント（タスク1で作成）
- Tailwind CSS 