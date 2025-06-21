# タスク5: ページ固有ローディングの実装（エクスプローラー）

## 目的
エクスプローラーページ専用のローディングファイルを作成する。

## 実装ファイル
- `src/app/(main)/explore/loading.tsx`

## 要件
- エクスプローラーページ固有のローディングUI
- 既存の統一ローディングコンポーネントの使用
- エクスプローラーページのレイアウトに合わせたデザイン

## 実装内容

### コンポーネント構造
```typescript
export default function ExploreLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <Loading 
        size="lg" 
        variant="spinner" 
        text="絵文字を探索中..." 
      />
    </div>
  );
}
```

### スタイリング要件
- エクスプローラーページのレイアウトに合わせたデザイン
- 適切な背景色とテキスト色
- レスポンシブデザイン対応

## 実装手順

### 1. 基本ファイル構造の作成
- explore/loading.tsxファイルの作成
- デフォルトエクスポートの実装

### 2. エクスプローラーページ固有のレイアウト実装
- エクスプローラーページのレイアウトに合わせた配置
- 適切な背景色の設定

### 3. 統一ローディングコンポーネントの使用
- Loading.tsxコンポーネントのインポート
- エクスプローラーページに適したサイズとバリアントの設定
- エクスプローラー固有のテキストの設定

### 4. アクセシビリティ対応
- 適切なARIA属性の設定
- スクリーンリーダー対応

## 完了条件
- [ ] explore/loading.tsxファイルの実装
- [ ] 統一ローディングコンポーネントの使用
- [ ] エクスプローラーページ固有のレイアウト実装
- [ ] アクセシビリティ対応
- [ ] エクスプローラーページでの動作確認

## テスト項目
- エクスプローラーページ遷移時のローディング表示
- NFTデータ取得時のローディング表示
- 異なるデバイスでの表示確認

## 注意事項
- エクスプローラーページの既存レイアウトとの整合性
- パフォーマンスを考慮した実装
- 既存のエクスプローラー機能への影響がないことの確認

## 参考実装例
```typescript
import { Loading } from '@/components/ui/Loading';

export default function ExploreLoading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div className="text-center">
        <Loading 
          size="lg" 
          variant="spinner" 
          text="絵文字を探索中..." 
          className="mb-4"
        />
        <p className="text-gray-600 text-sm">
          新しい絵文字を検索しています...
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
- エクスプローラーページの既存レイアウト 